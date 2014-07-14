// Licensed under the Apache License. See footer for details.

var Q       = require("q")
var request = require("request")

exports.init        = init
exports.getForecast = getForecast

var SvcForecast
var SvcGeocode

//------------------------------------------------------------------------------
function init(svcForecast, svcGeocode) {
  SvcForecast = svcForecast
  SvcGeocode  = svcGeocode
}

//------------------------------------------------------------------------------
function getForecast(location) {
  var result = {}
  var lat, lng

  p = SvcGeocode.geocode(location)

  .then(function(latLon) {
    lat = latLon.lat
    lng = latLon.lng
    // console.log(latLon)
    return SvcForecast.getForecast(lat, lng)
  })

  .then(function(forecast) {
    // console.log(forecast)
    result.forecast = forecast
  })

  .then(function() {
    return SvcGeocode.reverseGeocode(lat, lng)
  })

  .then(function(location) {
    // console.log(location)
    result.location = location
    return result
  })

  return p
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
