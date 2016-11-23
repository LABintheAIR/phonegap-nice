function onDeviceReady() {
  //initBackgroundMode();
};
/*
function initBackgroundMode(){
  cordova.plugins.backgroundMode.setDefaults({
    "title": "Bag background Job",
    "isPublic": true,
    "text": "Keep your bag alive !",
    "silent": true
  });
  cordova.plugins.backgroundMode.enable();
  cordova.plugins.backgroundMode.onfailure = (error) => { console.error("BACKGROUND TASK : " + error) };
  timeoutTask( 500 );
};

function timeoutTask( msec ){
  console.log("Background task");
  setTimeout( timeoutTask(msec), msec );
};*/

function scanDevice( cb_newdevice ) {
  ble.scan( [], 5, function(device) {
    console.log( "Device found" );
    cb_newdevice( device );
  }, function(){
    console.warning( "Failed to scan or device disconnected" );
  });
};

function listAvailableDevice( id ){
  document.getElementById( id ).text = "";
  scanDevice( function( d ){
    $('#' + id ).html( $('#' + id ).html() + "<br><a href=\"connectDevice('" + d.id + "')\">" + d.name + "</a>" );
  } );
};

function getBLEWriteCharac( peripheralData ) {
  var tab = peripheralData.characteristics;
  var patt = new RegExp(/^[a-z0-9]+0001-/i); //See https://learn.adafruit.com/adafruit-feather-32u4-bluefruit-le/uart-service

  for( i = 0; tab.length; ++i )
  {
    if( patt.test( tab[i].service ) && tab[i].properties.indexOf( "Write" ) > -1 ) {
      return tab[i];
    }
  }

  return false;
};

function getBLEReadCharac( peripheralData ) {
  var tab = peripheralData.characteristics;
  var patt = new RegExp(/^[a-z0-9]+0001-/i); //See https://learn.adafruit.com/adafruit-feather-32u4-bluefruit-le/uart-service

  for( i = 0; tab.length; ++i )
  {
    if( patt.test( tab[i].service ) && tab[i].properties.indexOf( "Read" ) > -1 ) {
      return tab[i];
    }
  }

  return false;
};
