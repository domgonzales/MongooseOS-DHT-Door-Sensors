load('api_config.js');
load('api_gpio.js');
load('api_mqtt.js');
load('api_net.js');
load('api_sys.js');
load('api_timer.js');

// I added this section
load('api_dht.js');

// GPIO pin which has a DHT sensor data wire connected
let pin = 5;

// Initialize DHT library
let dht = DHT.create(pin, DHT.DHT22);
// This function reads data from the DHT sensor every 2 second
Timer.set(20000 /* milliseconds */, true /* repeat */, function() {
  let t = dht.getTemp()* 9 / 5 + 32 , temptopic = 'shop/north/temp';
  let h = dht.getHumidity() , humtopic = 'shop/north/humidity';

  if (isNaN(h) || isNaN(t)) {
    print('Failed to read data from sensor');
    return;
  }

  print('Temperature:', t, '*F');
  //let res_t = MQTT.pub('mos/temp',JSON.stringify( t ), 1);
  //print('Published:', res_t ? 'yes' : 'no');
  
  print('Humidity:', h, '%');
  let res_h = MQTT.pub('shop/north/temphum',JSON.stringify({"temperature":t,"humidity":h} ), 1);
  //print('Published:', res_h ? 'yes' : 'no');
}, null);

////////////////////////////////////////////////////////////////////////////////////////
let SENSOR = 0; 

GPIO.set_mode(SENSOR, GPIO.MODE_INPUT); // GPIO0 has a fixed pullup resistor

// Store door state so we can detect change
let sensor_state = 0;

// Primary loop run every 1 second looking for a door state change
Timer.set(1000, 1, function() {
  let value = GPIO.read(SENSOR); 

  if (value) { 
    //print("Bay1 is OPEN");
    if ( sensor_state === 0 ) {
      MQTT.pub('shop/door/bay1', '{"message": "Bay 1 is open.", "state": "open"}');
      sensor_state = 1;
    }
  } else {
    //print("Bay1 is CLOSED");
    if ( sensor_state === 1 ) {
      MQTT.pub('shop/door/bay1', '{"message": "Bay 1 is closed.", "state": "closed"}');
      sensor_state = 0;
    }
  }
}, null);

////////////////////////////////////////////////////////////////////////////////////////

let SENSOR2 = 2; 

GPIO.set_mode(SENSOR2, GPIO.MODE_INPUT); // GPIO2 has a fixed pullup resistor

// Store door state so we can detect change
let sensor_state2 = 0;

// Primary loop run every 1 second looking for a door state change
Timer.set(1000, 1, function() {
  let value = GPIO.read(SENSOR2); 

  if (value) { 
    //print("Bay2 is OPEN");
    //MQTT.pub('mos/door/bay2', '{"message": "Bay 2 is open.", "state": "open"}');
    if ( sensor_state2 === 0 ) {
      MQTT.pub('shop/door/bay2', '{"message": "Bay 2 is open.", "state": "open"}', 1, 1);
      sensor_state2 = 1;
    }
  } else {
    //print("Bay2 is CLOSED");
    //MQTT.pub('mos/door/bay2', '{"message": "Bay 2 is closed.", "state": "closed"}');
    if ( sensor_state2 === 1 ) {
      MQTT.pub('shop/door/bay2', '{"message": "Bay 2 is closed.", "state": "closed"}', 1, 1);
      sensor_state2 = 0;
    }
  }
}, null);

////////////////////////////////////////////////////////////////////////////////////////

//This is logic to force an MQTT Message after the device has rebooted. 15 seconds seems to be long enough to
//get the message to send. The values were inverted and I am not sure why so I swapped the messages around to 
//match in this section only. This is for Shop Garage Door 1. 

Timer.set(10000 /* 1 sec */, true /* repeat */, function() {
  let uptime = Sys.uptime();
  let value1 = sensor_state;
  if (uptime < 15 && value1 === 0) {
  //print('uptime:', uptime , 'sensor state:',value2);
    if ( value1 === 0 ) {
      MQTT.pub('shop/door/bay1', '{"message": "Bay 1 is closed.", "state": "closed"}', 1, 1);
      value1 = 1;
    }
  } else {
    if ( uptime < 15 && value1 === 1 ) {
      MQTT.pub('shop/door/bay1', '{"message": "Bay 1 is open.", "state": "open"}', 1, 1);
      value1 = 0;
    }
  }
 // }
}, null);
////////////////////////////////////////////////////////////////////////////////////////

//This is logic to force an MQTT Message after the device has rebooted. 15 seconds seems to be long enough to
//get the message to send. The values were inverted and I am not sure why so I swapped the messages around to 
//match in this section only. This is for Shop Garage Door 2. 

Timer.set(10000 /* 1 sec */, true /* repeat */, function() {
  let uptime = Sys.uptime();
  let value2 = sensor_state2;
  if (uptime < 15 && value2 === 0) {
  //print('uptime:', uptime , 'sensor state:',value2);
    if ( value2 === 0 ) {
      MQTT.pub('shop/door/bay2', '{"message": "Bay 2 is closed.", "state": "closed"}', 1, 1);
      value2 = 1;
    }
  } else {
    if ( uptime < 15 && value2 === 1 ) {
      MQTT.pub('shop/door/bay2', '{"message": "Bay 2 is open.", "state": "open"}', 1, 1);
      value2 = 0;
    }
  }
 // }
}, null);
////////////////////////////////////////////////////////////////////////////////////////

// Monitor network connectivity.
Net.setStatusEventHandler(function(ev, arg) {
  let evs = '???';
  if (ev === Net.STATUS_DISCONNECTED) {
    evs = 'DISCONNECTED';
  } else if (ev === Net.STATUS_CONNECTING) {
    evs = 'CONNECTING';
  } else if (ev === Net.STATUS_CONNECTED) {
    evs = 'CONNECTED';
  } else if (ev === Net.STATUS_GOT_IP) {
    evs = 'GOT_IP';
  }
  print('== Net event:', ev, evs);
}, null);
