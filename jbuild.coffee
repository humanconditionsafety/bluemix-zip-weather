# Licensed under the Apache License. See footer for details.

#-------------------------------------------------------------------------------
# use this file with jbuild: https://www.npmjs.org/package/jbuild
# install jbuild with:
#    linux/mac: sudo npm -g install jbuild
#    windows:        npm -g install jbuild
#-------------------------------------------------------------------------------

#-------------------------------------------------------------------------------
tasks = defineTasks exports,
  watch: "start server, watch for source file changes, restart server"
  serve: "run the server"

WatchSpec = "lib/**/* www/**/*"

PidFile = "tmp/server.pid"

#-------------------------------------------------------------------------------
mkdir "-p", "tmp"

#-------------------------------------------------------------------------------
tasks.serve = ->
  unless test "-d", "node_modules"
    exec "npm install"

  unless test "-d", "bower_components"
    exec "bower install jquery"
    exec "bower install bootstrap"

  cp "-f", "bower_components/jquery/dist/jquery.js",                  "www/js"

  cp "-f", "bower_components/bootstrap/dist/css/bootstrap.css",       "www/css"
  cp "-f", "bower_components/bootstrap/dist/css/bootstrap-theme.css", "www/css"
  cp "-f", "bower_components/bootstrap/dist/fonts/*",                 "www/fonts"
  cp "-f", "bower_components/bootstrap/dist/js/bootstrap.js",         "www/js"

  log "running server"

  args = "server --verbose"
  args = args.split(/\s+/)

  server.start PidFile, "node", args

#-------------------------------------------------------------------------------
tasks.watch = ->
  watchIter()

  watch
    files: WatchSpec.split " "
    run:   watchIter

  watchFiles "jbuild.coffee" :->
    log "jbuild file changed; exiting"
    process.exit 0

#-------------------------------------------------------------------------------
watchIter = ->
  tasks.serve()

#-------------------------------------------------------------------------------
cleanDir = (dir) ->
  mkdir "-p", dir
  rm "-rf", "#{dir}/*"

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
