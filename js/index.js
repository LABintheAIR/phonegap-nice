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

var BLE_data = null;

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

function connectDevice( deviceID ){
  ble.connect( deviceID, function(data){ BLE_data = data; }, function(){ console.error("Fail to connect"); BLE_data = null; } );
}

function sendColorToDevice( red, green, blue ){
  if( BLE_data == null ){
    return false;
  }

  var chara = getBLEWriteCharac( BLE_data );
  var data = new UInt8Array(6);
  data[0] = 0x21; // '!'
  data[1] = 0x43; // 'C'
  data[2] = red;
  data[3] = green;
  data[4] = blue;
  data[5] = 0x04;

  ble.write( BLE_data.id, charac.service, charac.characteristic, data.buffer, function() { console.log("Data sent"); }, function() { console.error("Fail send data !"); } );
}

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





function getAndSend(){
  sendColorToDevice( parseInt( $("#red").val(), 10 ), parseInt( $("#green").val(), 10 ), parseInt( $("#blue").val(), 10 ) );
}
