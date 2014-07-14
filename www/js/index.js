// Licensed under the Apache License. See footer for details.

$(onLoad)

//------------------------------------------------------------------------------
function onLoad() {
}


//------------------------------------------------------------------------------
function updateTable(data) {
  // get the table
  table$ = $("#instance-table")

  // delete the rows
  $(".instance-row").remove()

  // add the rows
  for (var i=0; i<data.length; i++) {
    addRow(table$, data[i], i)
  }
}

//------------------------------------------------------------------------------
function addRow(table$, row, instance) {
  var newRow = "<tr class='instance-row' id='instance-row-" + instance + "'>"
  newRow += "<td>" + instance + "</td>"
  newRow += "<td class='mem'></td>"
  newRow += "<td class='cpu'></td>"
  newRow += "<td>"
  newRow += "<button class='use-mem'>use mem</button>"
  newRow += " "
  newRow += "<button class='use-cpu'>use cpu</button>"
  newRow += "</td>"
  newRow += "</tr>"

  table$.append(newRow)

  var row$ = $("#instance-row-" + instance)

  // update the memory usage
  $(".mem", row$).text(row.mem + "MB")

  // update the cpu busy seconds left
  var cpuVal = "-"
  if (row.cpu != null) cpuVal = row.cpu + " seconds"

  $(".cpu", row$).text(cpuVal)

  // click handlers for buttons
  $(".use-mem", row$).click(instance, handleUseMem)
  $(".use-cpu", row$).click(instance, handleUseCpu)
}

//------------------------------------------------------------------------------
function handleUseMem(event) {
  var instance = event.data

  $.post("/" + instance + "/use-mem", function(data) {
  })
}

//------------------------------------------------------------------------------
function handleUseCpu(event) {
  var instance = event.data

  $.post("/" + instance + "/use-cpu", function(data) {
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
