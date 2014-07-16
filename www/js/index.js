// Licensed under the Apache License. See footer for details.

$(onLoad)

var $form
var $location
var $forecast
var $locations
var locationsInterval

//------------------------------------------------------------------------------
function onLoad() {

  // get jquery objects for known locations
  $form        = $("#get-forecast")
  $location    = $("#location")
  $forecast    = $("#forecast")
  $locations   = $("#locations")

  // when the form is submitted, get the forecast
  $form.submit(function(event){
    event.preventDefault()
    getForecast()
  })

  // if the locations list is clicked on, update it
  $locations.click(updateLocations)

  // get the initial list of locations
  updateLocations()
}

//------------------------------------------------------------------------------
function getForecast() {

  // get the entered location
  var location = $location.val()
  if (location == "") location = "New York"

  // update the forecast output
  setForecast("Getting forecast for " + location + " ...")

  // issue the REST call to get the forecast
  $.getJSON("/forecast?q=" + location)

  // on success, update the forecast output
  .done(function(data) {
    setForecast("Forecast for " + data.location + "; " + data.forecast)
    updateLocations()
  })

  // on failure, write the error message to the forecast output
  .fail(function(jqXhr) {
    setForecast("an error occurred: " + jqXhr.responseText)
  })
}

//------------------------------------------------------------------------------
function setForecast(value) {
  // update the forecast output field
  $forecast.text(value)
}

//------------------------------------------------------------------------------
function updateLocations() {

  // issue REST call to get locations
  $.getJSON("/locations")

  // on success ...
  .done(function(data) {
    if (data.locations.length == 0) return

    // update the locations output
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
