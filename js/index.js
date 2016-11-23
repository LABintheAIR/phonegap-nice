/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
      app.initBackgroundMode();
    },

    initBackgroundMode : function(){
      cordova.plugins.backgroundMode.setDefaults({
        "title": "Bag background Job",
        "isPublic": true,
        "text": "Keep your bag alive !",
        "silent": false
      });
      cordova.plugins.backgroundMode.enable();
      cordova.plugins.backgroundMode.onfailure = (error) => { console.error("BACKGROUND TASK : " + error) };
      app.timeoutTask( 500 );
    },

    timeoutTask : function( msec ){
      console.log("Background task");
      setTimeout( app.timeoutTask(msec), msec );
    },

    scanDevice: function( cb_newdevice ) {
      ble.scan( [], 5, function(device) {
        console.log( "Device found" );
        cb_newdevice( device );
      }, function(){
        console.warning( "Failed to scan or device disconnected" );
      });
    },

    getBLEWriteCharac : function( peripheralData ) {
      var tab = peripheralData.characteristics;
      var patt = new RegExp(/^[a-z0-9]+0001-/i); //See https://learn.adafruit.com/adafruit-feather-32u4-bluefruit-le/uart-service

      for( i = 0; tab.length; ++i )
      {
        if( patt.test( tab[i].service ) && tab[i].properties.indexOf( "Write" ) > -1 ) {
          return tab[i];
        }
      }

      return false;
    },

    getBLEReadCharac : function( peripheralData ) {
      var tab = peripheralData.characteristics;
      var patt = new RegExp(/^[a-z0-9]+0001-/i); //See https://learn.adafruit.com/adafruit-feather-32u4-bluefruit-le/uart-service

      for( i = 0; tab.length; ++i )
      {
        if( patt.test( tab[i].service ) && tab[i].properties.indexOf( "Read" ) > -1 ) {
          return tab[i];
        }
      }

      return false;
    },
};
