// Licensed under the Apache License. See footer for details.

var Q       = require("q")
var request = require("request")

var util = require("./util")

exports.get = get

//------------------------------------------------------------------------------
function get(appEnv) {
  var service = appEnv.getService(/.*zip-weather-forecast.*/)
  var creds   = getCreds(service,   "zip-weather-forecast")

  if (null == creds) return null

  return creds
}

//------------------------------------------------------------------------------
function getCreds(service, name) {
  if (!service) return logError(name, "not found")

  name = service.name
  util.log("for forecast, using service: `" + name + "`")

  var creds = service.credentials
  if (!creds)            return logError(name, "has no credentials")
  if (!creds.url)        return logError(name, "credentials have no url")

  return getService(creds)
}

//------------------------------------------------------------------------------
function getService(creds) {
  var service = {}

  service.getForecast = function(lat, lng) {
    var deferred = Q.defer()
    getForecast(creds, lat, lng, deferred)
    return deferred.promise
  }

  return service
}

//------------------------------------------------------------------------------
function getForecast(creds, lat, lng, deferred) {
  var url = creds.url + "/" + lat + "," + lng + "?exclude=minutely,alerts,flags"

  var msg = "error getting forecast"

  request(url, function(error, response, body) {
    if (error) return reject(deferred, msg, error)

    if (response.statusCode != 200) {
      return reject(deferred, msg, "status code: " + response.statusCode)
    }

    try {
      body = JSON.parse(body)
    }
    catch (e) {
      return reject(deferred, msg, "bad JSON")
    }

    var forecast = ""
    var conditions

    if (body.currently) {
      if (body.currently.summary) {
        conditions = normalize(body.currently.summary)
        forecast += "Conditions now: " + conditions
      }
    }

    if (body.hourly) {
      if (body.hourly.summary) {
        conditions = normalize(body.hourly.summary)
        forecast += "Conditions today: " + conditions
      }
    }

    if (body.daily) {
      if (body.daily.summary) {
        conditions = normalize(body.daily.summary)
        forecast += "Conditions this week: " + conditions
      }
    }

    if (forecast == "") {
      return reject(deferred, msg, "no forecast available")
    }

    deferred.resolve(forecast)
  })
}

//------------------------------------------------------------------------------
function normalize(string) {
  string = string.trim()
  if (string[string.length - 1] != ".") string += "."
  return string + " "
}

//------------------------------------------------------------------------------
function reject(deferred, message, extra) {
  deferred.reject(message)
  util.logError(message + ": " + extra)
}

//------------------------------------------------------------------------------
function logError(name, message) {
  util.logError("service `" + name + "`: " + message)
  util.logError("the server will not operate properly until this error is resolved")
  return null
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
