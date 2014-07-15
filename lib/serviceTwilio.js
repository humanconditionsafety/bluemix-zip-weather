// Licensed under the Apache License. See footer for details.

var Q       = require("q")
var cfenv   = require("cfenv")
var twilio  = require("twilio")
var request = require("request")

var util = require("./util")

exports.get     = get

//------------------------------------------------------------------------------
function get(appEnv) {
  var service = appEnv.getService(/.*zip-weather-twilio.*/)
  var creds   = getCreds(service,   "zip-weather-twilio")

  if (null == creds) return null

  return getService(creds)
}

//------------------------------------------------------------------------------
function getService(creds) {
  var twilioClient = twilio(creds.accountSID, creds.authToken)
  var service = {}

  service.getIncomingNumber = function() {
    var deferred = Q.defer()
    getIncomingNumber(twilioClient, deferred)
    return deferred.promise
  }

  service.getFrom = getFrom

  return service
}

//------------------------------------------------------------------------------
function getIncomingNumber(twilioClient, deferred) {
  twilioClient.incomingPhoneNumbers.get(function(err, data) {
    if (err) return deferred.reject(err)

    if (!data.incoming_phone_numbers) {
      return deferred.reject("no incoming_phone_numbers array")
    }

    if (!data.incoming_phone_numbers.length) {
      return deferred.reject("empty incoming_phone_numbers array")
    }

    if (!data.incoming_phone_numbers[0].friendly_name) {
      return deferred.reject("empty incoming_phone_number friendly_name")
    }

    deferred.resolve(data.incoming_phone_numbers[0].friendly_name)
  })
}

//------------------------------------------------------------------------------
function getFrom(request) {
  var query = request.query

  if (!query) return null

  var fromCity    = query.FromCity
  var fromState	  = query.FromState
  var fromZip	    = query.FromZip
  var fromCountry = query.FromCountry

  if (fromZip)                 return fromZip
  if (fromState && fromCity)   return fromCity + ", " + fromState
  if (fromCountry && fromCity) return fromCity + ", " + fromCountry
  if (fromCity)                return fromCity
  if (fromState)               return fromState
  if (fromCountry)             return fromCountry

  return null
}

//------------------------------------------------------------------------------
function getCreds(service, name) {
  if (!service) return logError(name, "not found")

  name = service.name
  util.log("for Twilio,   using service: `" + name + "`")

  var creds = service.credentials
  if (!creds)            return logError(name, "has no credentials")
  if (!creds.url)        return logError(name, "credentials have no url")
  if (!creds.accountSID) return logError(name, "credentials have no accountSID")
  if (!creds.authToken)  return logError(name, "credentials have no authToken")

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
