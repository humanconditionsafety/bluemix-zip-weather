// Licensed under the Apache License. See footer for details.

var fs      = require("fs")
var path    = require("path")
var cfenv   = require("cfenv")
var express = require("express")

var util            = require("./util")
var forecaster      = require("./forecaster")
var serviceTwilio   = require("./serviceTwilio")
var serviceGeocode  = require("./serviceGeocode")
var serviceForecast = require("./serviceForecast")

exports.main = main

// static twiml xml files
var TwimlInitial = getTwiml("voice-initial.xml")
var TwimlNext    = getTwiml("voice-next.xml")

// services
var SvcTwilio
var SvcForecast
var SvcGeocode

// index.html that we'll modify
var IndexHtml   = ""

// global indicating if any problems with services
var ServiceError

//------------------------------------------------------------------------------
function main() {

  // read the index.html file
  var indexHTMLfile = path.join(process.cwd(), "www", "index.html")
  IndexHTML = fs.readFileSync(indexHTMLfile, "utf8")

  // get our cf app env, and it's services
  var appEnv = getAppEnv()

  SvcTwilio   = serviceTwilio.get(appEnv)
  SvcForecast = serviceForecast.get(appEnv)
  SvcGeocode  = serviceGeocode.get(appEnv)

  // initialize forecaster
  forecaster.init(SvcForecast, SvcGeocode)

  // get our incoming Twilio phone number
  SvcTwilio.getIncomingNumber()

  // on success, replace place-holder in index.html
  // and start server
  .then(function(number) {
    IndexHTML = IndexHTML.replace("???-???-????", number)
    startServer(appEnv)
  })

  // indicate we couldn't get the incoming phone number
  .fail(function(err) {
    util.logError("unable to get incoming Twilio phone number: " + err)
    util.logError("the server will not operate properly until this error is resolved")

    SvcTwilio = null
  })

  .done()
}

//------------------------------------------------------------------------------
function startServer(appEnv) {
  var app = express()

  var wwwPath = path.join(__dirname, "..", "www")

  // our APIs - check for service error first
  app.get("/forecast",       checkServiceError, handleForecast)
  app.get("/locations",      checkServiceError, handleLocations)
  app.get("/message/voice*", checkServiceError, handleMessageVoice)
  app.get("/message/sms*",   checkServiceError, handleMessageSms)

  // index.html with phone number handler
  app.get("/", function(request, response, next) {
    request.url = "/index.html"
    next()
  })

  app.get("/index.html", function(request, response) {
    noCache(response)
    response.send(IndexHTML)
  })

  // static files
  app.use(express.static(wwwPath))

  // start server
  app.listen(appEnv.port, appEnv.bind, function() {
      util.log("server starting on " + appEnv.url)
  })
}

//------------------------------------------------------------------------------
function handleMessageVoice(request, response) {

  // get default location from call, or NYC
  var from = SvcTwilio.getFrom(request)
  if (!from) from = "New York, NY"

  // no query string, perform initial flow
  if (!request.query) {
    return sendTwiml(response, TwimlInitial)
  }

  // get the digits pressed on the phone
  var digits = request.query.Digits

  // if no digits, then perform initial flow
  if (!digits) return sendTwiml(response, TwimlInitial)

  // if not enough digits, use default location
  digits = digits + ""
  // util.log("received digits from phone: `" + digits + "`")

  // just take the last input
  digits = digits.split(",").pop()
  digits = digits.trim()
  // util.log("parsed   digits from phone: `" + digits + "`")

  if (digits.length < 5) digits = from

  // if digits, get their forecast
  forecaster.getForecast(digits)

  // on success, display next flow, add location
  .then(function(result) {
    var message = "Forecast for " + result.location + "; " + result.forecast

    sendTwiml(response, TwimlNext.replace("%message%", message))
    addLocation(result.location)
  })

  // on failure, also display next flow
  .fail(function(err) {
    var message = "woops. an error occurred. " + err

    sendTwiml(response, TwimlNext.replace("%message%", message))
  })

  .done()
}

//------------------------------------------------------------------------------
function handleMessageSms(request, response) {

  // get default location from call, or NYC
  var from = SvcTwilio.getFrom(request)
  if (!from) from = "New York, NY"

  // sanity checks
  if (!request.query) {
    request.query = {Body: from}
  }

  var body = request.query.Body
  // util.log("received text from sms: `" + body + "`")

  if (!body) {
    body = from
  }

  // use the caller's location
  body = body.trim()
  if (body == "here") {
    body = from
  }

  // allow for someone to send us 'help'
  if (body == "help") {
    return sendPlain(response, "Text a location to this number to get the weather forecast.")
  }

  // get the forecast from the message
  forecaster.getForecast(body)

  // on success, send forecast, add location
  .then(function(result) {
    sendPlain(response, "Forecast for " + result.location + "; " + result.forecast)

    addLocation(result.location)
  })

  // on error, send error message
  .fail(function(err) {
    sendPlain(response, "woops, got an error: " + err)
  })

  .done()
}

//------------------------------------------------------------------------------
function handleForecast(request, response) {

  // sanity checks
  if (!request.query) {
    request.query = {q: "New York, NY"}
  }

  var query = request.query.q
  if (!query) {
    query = "New York, NY"
  }

  // get forecast for parameter q
  forecaster.getForecast(query)

  // on success, send result
  .then(function(result) {
    response.send(result)
    addLocation(result.location)
  })

  // on error, send 500
  .fail(function(err) {
    response.send(500, "error getting forecast: " + err)
  })

  .done()
}

//------------------------------------------------------------------------------
function addLocation(location) {
  if (Locations.indexOf(location) == -1) {
    Locations.push(location)
  }
}

//------------------------------------------------------------------------------
function handleLocations(request, response) {
  response.send(JSON.stringify({locations: Locations}))
}

var Locations = []

//------------------------------------------------------------------------------
function checkServiceError(request, response, next) {
  // lazy initialize ServiceError
  if (ServiceError == null) {
    ServiceError = !SvcTwilio || !SvcForecast || !SvcGeocode
  }

  // APIs will fail if there's a service error
  if (!ServiceError) return next()

  response.send(503, "Service Unavailable; check server console for error messages")
}

//------------------------------------------------------------------------------
function sendPlain(response, text) {
  noCache(response)
  response.set("Content-Type", "text/plain");
  response.send(text)
}

//------------------------------------------------------------------------------
function sendTwiml(response, twiml) {
  noCache(response)
  response.set("Content-Type", "text/xml");
  response.send(twiml)
}

//------------------------------------------------------------------------------
function getTwiml(name) {
  var fileName = path.join(__dirname, "twiml", name)
  return fs.readFileSync(fileName, "utf8")
}

//------------------------------------------------------------------------------
function noCache(response) {
  response.set("Cache-Control", "no-store")
  response.set("Cache-Control", "no-cache")
  response.set("Pragma",        "no-cache")
  response.set("Expires",       "0")
}

//------------------------------------------------------------------------------
function getAppEnv() {
  var options = {vcap: {}}

  // get VCAP_SERVICES from file, if running locally
  try {
    var localServices = path.join(process.cwd(), "local-vcap-services.json")
    options.vcap.services = require(localServices)
  }
  catch (e) {}

  return cfenv.getAppEnv(options)
}

/*
#-------------------------------------------------------------------------------
# Copyright IBM Corp. 2014
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#-------------------------------------------------------------------------------
*/
