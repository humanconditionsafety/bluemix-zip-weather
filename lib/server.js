// Licensed under the Apache License. See footer for details.

var path    = require("path")
var cfenv   = require("cfenv")
var express = require("express")

var util            = require("./util")
var forecaster      = require("./forecaster")
var serviceTwilio   = require("./serviceTwilio")
var serviceGeocode  = require("./serviceGeocode")
var serviceForecast = require("./serviceForecast")

var SvcTwilio
var SvcForecast
var SvcGeocode

var ServiceError

exports.main = main

//------------------------------------------------------------------------------
function main() {
  var appEnv = getAppEnv()

  SvcTwilio   = serviceTwilio.get(appEnv)
  SvcForecast = serviceForecast.get(appEnv)
  SvcGeocode  = serviceGeocode.get(appEnv)

  forecaster.init(SvcForecast, SvcGeocode)

  var app = express()

  var wwwPath = path.join(__dirname, "..", "www")

  var router = express.Router()

  app.get("/forecast",  checkServiceError, handleForecast)
  app.get("/locations", checkServiceError, handleLocations)

  app.use(express.static(wwwPath))

  app.listen(appEnv.port, appEnv.bind, function() {
      util.log("server starting on " + appEnv.url)
  })
}

//------------------------------------------------------------------------------
function handleForecast(request, response) {
  if (!request.query) {
    response.send(400, "expecting a query string in the URL")
    return
  }

  var query = request.query.q
  if (!query) {
    response.send(400, "expecting a q parameter in the query string in the URL")
    return
  }

  p = forecaster.getForecast(query)

  .then(function(result) {
    response.send(result.forecast)

    if (Locations.indexOf(result.location) == -1) {
      Locations.push(result.location)
    }
  })

  .fail(function(err) {
    response.send(500, "error getting forecast: " + err)
  })

  .done()
}

//------------------------------------------------------------------------------
function handleLocations(request, response) {
  response.send(JSON.stringify({locations: Locations}))
}

var Locations = []

//------------------------------------------------------------------------------
function checkServiceError(request, response, next) {
  if (ServiceError == null) {
    ServiceError = !SvcTwilio || !SvcForecast || !SvcGeocode
  }

  if (!ServiceError) return next()

  response.send(503, "Service Unavailable; check server console for error messages")
}

//------------------------------------------------------------------------------
function getAppEnv() {
  var options = {vcap: {}}

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
