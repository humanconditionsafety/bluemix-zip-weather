// Licensed under the Apache License. See footer for details.

var Q       = require("q")
var request = require("request")

var util = require("./util")

exports.get = get

//------------------------------------------------------------------------------
function get(appEnv) {
  var service = appEnv.getService(/.*zip-weather-geocode.*/)
  var creds   = getCreds(service,   "zip-weather-geocode")

  if (null == creds) return null

  return getService(creds)
}

//------------------------------------------------------------------------------
function getService(creds) {
  var service = {}

  service.geocode = function(address) {
    var deferred = Q.defer()
    geocode(creds, address, deferred)
    return deferred.promise
  }

  service.reverseGeocode = function(lat, lng) {
    var deferred = Q.defer()
    reverseGeocode(creds, lat, lng, deferred)
    return deferred.promise
  }

  return service
}

//------------------------------------------------------------------------------
function geocode(creds, address, deferred) {
  var url = creds.url + "&address=" + encodeURIComponent(address)
  var msg = "error geocoding"

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

    if (body.status != "OK") {
      return reject(deferred, msg, "bad status: " + body.status)
    }

    if (body.results.length == 0) {
      return reject(deferred, msg, "no results")
    }

    latLng = body.results[0].geometry.location

    deferred.resolve(latLng)
  })
}

//------------------------------------------------------------------------------
function reverseGeocode(creds, lat, lng, deferred) {
  var url = creds.url + "&latlng=" + lat + "," + lng
  var msg = "error reverse geocoding"

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

    if (body.status != "OK") {
      return reject(deferred, msg, "bad status: " + body.status)
    }

    if (body.results.length == 0) {
      return reject(deferred, msg, "no results")
    }

    // console.log(JSON.stringify(body.results, null, 4))

    var country = getCountry(body.results)
    var city    = getCity(body.results)

    if (country != "United States") {
      deferred.resolve(city + ", " + country)
      return
    }

    var state = getState(body.results)
    deferred.resolve(city + ", " + state)
  })
}

//------------------------------------------------------------------------------
function getCountry(results) {
  for (var i=0; i<results.length; i++) {
    var addressComponents = results[i].address_components
    if (!addressComponents) continue

    for (var j=0; j<addressComponents.length; j++) {
      var ac = addressComponents[j]
      if (!ac) continue

      if (ac.types.indexOf("country") != -1) {
        return ac.long_name
      }
    }
  }

  return "unknown country"
}

//------------------------------------------------------------------------------
function getState(results) {
  for (var i=0; i<results.length; i++) {
    var addressComponents = results[i].address_components
    if (!addressComponents) continue

    for (var j=0; j<addressComponents.length; j++) {
      var ac = addressComponents[j]
      if (!ac) continue

      if (ac.types.indexOf("political") != -1) {
        if (ac.types.indexOf("administrative_area_level_1") != -1) {
          return ac.long_name
        }
      }
    }
  }

  return "unknown state"
}

//------------------------------------------------------------------------------
function getCity(results) {
  var keys = ["locality", "administrative_area_level_2", "administrative_area_level_3"]

  for (var k=0; k<keys.length; k++) {
    var key = keys[k]

    for (var i=0; i<results.length; i++) {
      var addressComponents = results[i].address_components
      if (!addressComponents) continue

      for (var j=0; j<addressComponents.length; j++) {
        var ac = addressComponents[j]
        if (!ac) continue

        if (ac.types.indexOf(key) != -1) {
          return ac.long_name
        }
      }
    }
  }

  console.log("unknown city for: " + JSON.stringify(results, null, 4))
  return "unknown city"
}

//------------------------------------------------------------------------------
function reject(deferred, message, extra) {
  deferred.reject(message)
  util.logError(message + ": " + extra)
}

//------------------------------------------------------------------------------
function getCreds(service, name) {
  if (!service) return logError(name, "not found")

  name = service.name
  util.log("for geocode,  using service: `" + name + "`")

  var creds = service.credentials
  if (!creds)            return logError(name, "has no credentials")
  if (!creds.url)        return logError(name, "credentials have no url")

  return creds
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
