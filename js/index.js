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
  getAirQuality();
  setInterval( intervalTask, 5000 );
}

function intervalTask(){
  getAirQuality();
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
  $('#' + id ).html("");
  scanDevice( function( d ){
    $('#' + id ).html( $('#' + id ).html() + "<br><a href='#' onclick=\"connectDevice('" + d.id + "'); return false;\">" + d.name + "</a>" );
  } );
}

function connectDevice( deviceID ){
  ble.connect( deviceID, function(data){
    BLE_data = data;
    var charac = getBLEReadCharac( BLE_data );
    ble.startNotification( BLE_data.id, charac.service, charac.characteristic, function(data) { sendActivite( data ); }, function() { console.error("RIEN"); } );
  },
  function(){ console.error("Fail to connect or disconect"); BLE_data = null; } );
}

function sendActivite( data ){

  var value = -1;

  console.log(data);
  data = bytesToString( data );
  console.log("Byte to String : " + data);

  if( data === "A0" ) { value = 1; }
  else if( data === "A1" ) { value = 2; }
  else if( data === "A2" ) { value = 0; }

  if( value == -1 ){
    console.error( "Bad activite : -1" );
    return;
  }

  $.ajax({ type: "POST",
    url: "http://api.labintheair.cc:12345/bag/sendActivite",
    data : JSON.stringify( { "activite":  value.toString() } ),
    dataType: "json",
    contentType: "application/json" } )
    .always( function( data ){
      sendAirQualityRequest();
    });
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

// ASCII only
function bytesToString(buffer) {
    return String.fromCharCode.apply(null, new Uint8Array(buffer));
}

function sendAirQualityRequest(){
  $.ajax( "http://api.labintheair.cc:12345/bag/getLastIndice" ).done( function(data){
    sendColorToDevice( 255 * 0.01 * data.value, 100 - 255 * 0.01 * data.value, 0 );
  })
  .fail( function(){
    console.error("Fail AJAX");
  });
}

function getAirQuality(){
  navigator.geolocation.getCurrentPosition( function( pos ){
    $.ajax({ type: "POST",
      url: "http://api.labintheair.cc:12345/bag/sendGPS",
      data : JSON.stringify( { "lat": pos.coords.latitude, "lon": pos.coords.longitude } ),
      dataType: "json",
      contentType: "application/json" } )
      .always( function( data ){
        sendAirQualityRequest();
      });
  },
  function(){ console.error("GPS ERROR"); } );
}

function sendActivity( str ){
  if( str.length < 2 ){
    return;
  }
  $.post( "http://api.labintheair.cc:12345/bag/sendGPS", { activite: str.substring(0, 2) }, function(){} );
}



function getAndSend(){
  sendColorToDevice( parseInt( $("#red").val(), 10 ), parseInt( $("#green").val(), 10 ), parseInt( $("#blue").val(), 10 ) );
}
