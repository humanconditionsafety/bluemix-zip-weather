bluemix-zip-weather
================================================================================

Get the weather forecast for a zip code using twilio for Bluemix.



twilio pre-reqs
================================================================================

This application uses the Twilio service to handle SMS and phone calls.
You will need to have a [Twilio](https://twilio.com) account to use the
service. To be able to use more than just the single phone number you validate your
account with, you will need to add a credit card to the account and add some
money to it.

When creating the service in Bluemix, you should arrange to name it
`zip-weather-twilio`.

You will also need to configure your Twilio incoming number to direct
requests to the app running at Bluemix.  Go to the Twilio
[Manage Numbers](https://www.twilio.com/user/account/phone-numbers/incoming)
page, click on the number, and set the Voice and Messaging URLs to
the following:

    Voice:     http://<bluemix hostname>/message/voice
    Messaging: http://<bluemix hostname>/message/sms

Both messages should be configured to use `GET`, not `POST`.



google geocode pre-reqs
================================================================================

This application uses the Google Geocoding API to convert locations to latitude
and longitude coordinates.  You will need an API key to use the service. Refer to the
[documentation](https://developers.google.com/maps/documentation/geocoding/#BYB)
to get an API key.

Once you have an API key, create a new user-provided service with the following
command:

    cf cups zip-weather-geocode -p url

This will prompt you for the url property value.  Enter the following string
which ends with your newly acquired API key:

    https://maps.googleapis.com/maps/api/geocode/json?key=<API key>



forecast.io pre-reqs
================================================================================

This application uses the forecast.io weather service to get weather forecast
data.  You will need an API key to use the service.  Refer to the
[documentation](https://developer.forecast.io/) to get an API key.

Once you have an API key, create a new user-provided service with the following
command:

    cf cups zip-weather-forecast -p url

This will prompt you for the url property value.  Enter the following string
which ends with your newly acquired API key:

    https://api.forecast.io/forecast/<API key>



running locally
================================================================================

To run locally, in addition to having all the services above defined and set up,
you'll need a local copy of the service configuration, in the file
`local-vcap-services.json`.  A sample version is provided in
`local-vcap-services-sample.json`; just fill in the API keys as directed.
The file `local-vcap-services.json` will not be uploaded to Bluemix or stored
in your git repo (it is included in both `.cfignore` and `.gitignore`).

After setting all that up, run

    node server



running on Bluemix
================================================================================

To create and run the application on Bluemix, run

    cf push

You may need to change the `host` property in the `manifest.yml` file to use
a new host name, if someone has already used the host name in Bluemix.



hacking
================================================================================

If you want to modify the source to play with it, you'll want to have the
`bower` program installed.

    sudo npm -g install bower    # for mac and *nix
    npm -g install bower         # for windows

You'll also want to have the `jbuild` program installed.

To install `jbuild` on Windows, use the command

    npm -g install jbuild

To install `jbuild` on Mac or Linux, use the command

    sudo npm -g install jbuild

The `jbuild` command runs tasks defined in the `jbuild.coffee` file.  The
task you will most likely use is `watch`, which you can run with the
command:

    jbuild watch

When you run this command, the application will be built from source, the server
started, and tests run.  When you subsequently edit and then save one of the
source files, the application will be re-built, the server re-started, and the
tests re-run.  For ever.  Use Ctrl-C to exit the `jbuild watch` loop.

You can run those build, server, and test tasks separately.  Run `jbuild`
with no arguments to see what tasks are available, along with a short
description of them.



attributions
================================================================================

pig image adapted from:

* <http://pixabay.com/en/pig-pink-animal-mammal-farm-animal-295040/>
* license: <http://creativecommons.org/publicdomain/zero/1.0/deed.en>



license
================================================================================

Apache License, Version 2.0

<http://www.apache.org/licenses/LICENSE-2.0.html>
