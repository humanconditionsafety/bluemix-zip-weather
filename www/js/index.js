// Licensed under the Apache License. See footer for details.

$(onLoad)

var $form
var $location
var $forecast
var $locations

//------------------------------------------------------------------------------
function onLoad() {
  $form      = $("#get-forecast")
  $location  = $("#location")
  $forecast  = $("#forecast")
  $locations = $("#locations")

  $form.submit(function(event){
    event.preventDefault()
    getForecast()
  })

  setInterval(updateLocations, 1000)
}

//------------------------------------------------------------------------------
function getForecast() {
  var location = $location.val()
  if (location == "") location = "New York"
    
  setForecast("Getting forecast for " + location + " ...")

  $.getJSON("/forecast?q=" + location)

  .done(function(data) {
    setForecast("Forecast for " + data.location + "; " + data.forecast)
  })

  .fail(function(jqXhr) {
    setForecast("an error occurred: " + jqXhr.responseText)
  })
}

//------------------------------------------------------------------------------
function setForecast(value) {
  $forecast.text(value)
}

//------------------------------------------------------------------------------
function updateLocations() {
  $.getJSON("/locations")

  .done(function(data) {
    if (data.locations.length == 0) return

    $locations.text("locations checked: " + data.locations.join("; "))
  })
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
