function initialize() {
    this.bindEvents();
}

function bindEvents() {
    document.addEventListener('deviceready', this.onDeviceReady, false);
}

function onDeviceReady() {
  initBackgroundMode();
}

function initBackgroundMode(){
  cordova.plugins.backgroundMode.setDefaults({
    "title": "Bag background Job",
    "isPublic": true,
    "text": "Keep your bag alive !",
    "silent": true
  });
  cordova.plugins.backgroundMode.enable();
  cordova.plugins.backgroundMode.onfailure = function( error ) { console.error("BACKGROUND TASK : " + error); };
  console.log("Background init !");
  setInterval( intervalTask, 1000 );
}

function intervalTask(){
  var charac = getBLEReadCharac( BLE_data );
  ble.read( BLE_data.id, charac.service, charac.characteristic, function(data) { console.log("Their is something"); console.log(data); }, function() { console.error("RIEN"); } );
}

var BLE_data = null;

function scanDevice( cb_newdevice ) {
  ble.scan( [], 5, function(device) {
    console.log( "Device found" );
    cb_newdevice( device );
  }, function(){
    console.warning( "Failed to scan or device disconnected" );
  });
}

function listAvailableDevice( id ){
  document.getElementById( id ).text = "";
  scanDevice( function( d ){
    $('#' + id ).html( $('#' + id ).html() + "<br><a href='#' onclick=\"connectDevice('" + d.id + "'); return false;\">" + d.name + "</a>" );
  } );
}

function connectDevice( deviceID ){
  ble.connect( deviceID, function(data){ BLE_data = data; }, function(){ console.error("Fail to connect"); BLE_data = null; } );
}

function sendColorToDevice( red, green, blue ){
  if( BLE_data === null ){
    return false;
  }

  var charac = getBLEWriteCharac( BLE_data );
  var data = new Uint8Array(6);
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
}

function getBLEReadCharac( peripheralData ) {
  var tab = peripheralData.characteristics;
  var patt = new RegExp(/^[a-z0-9]+0001-/i); //See https://learn.adafruit.com/adafruit-feather-32u4-bluefruit-le/uart-service

  for( i = 0; tab.length; ++i )
  {
    if( patt.test( tab[i].service ) && tab[i].properties.indexOf( "Notify" ) > -1 ) {
      return tab[i];
    }
  }

  return false;
}





function getAndSend(){
  sendColorToDevice( parseInt( $("#red").val(), 10 ), parseInt( $("#green").val(), 10 ), parseInt( $("#blue").val(), 10 ) );
}
