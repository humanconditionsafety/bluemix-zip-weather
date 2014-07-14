// Licensed under the Apache License. See footer for details.

var cfenv  = require("cfenv")
var twilio = require("twilio")

var util = require("./util")

exports.get = get

var TwilioClient

//------------------------------------------------------------------------------
function get(appEnv) {
  if (TwilioClient) return TwilioClient

  var service = appEnv.getService(/.*zip-weather-twilio.*/)
  var creds   = getCreds(service,   "zip-weather-twilio")

  if (null == creds) return null

  TwilioClient = twilio(creds.accountSID, creds.authToken)
  return TwilioClient
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
