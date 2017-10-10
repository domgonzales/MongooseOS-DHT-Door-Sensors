# Based on A blank Mongoose OS app

 This is a Program for the ESP8266 that uses GPIO 5 (D1) for the DHT22 and GPIO0 (D3)/ GPIO2 (D4) for the Door sensors. 
 The door sensors are wired from GPIO0/2 directly to ground on a 1 second loop. The DHT22 sensor is on a 20 second loop

 I used MQTT on this to my Home-Assistant MQTT broker that is reading the states for these sensors. 

 For the Home-assistant configuration.yaml file this is how I am configured:

sensor 3:
    - platform: mqtt
      state_topic: 'shop/door/bay1'
      name: 'Bay 1 Door'
      value_template: '{{ value_json.state }}'

sensor 4:
    - platform: mqtt
      state_topic: 'shop/door/bay2'
      name: 'Bay 2 Door'
      value_template: '{{ value_json.state }}'

sensor 5:
    - platform: mqtt
      state_topic: 'shop/north/temphum'
      name: 'North Wall Temperature'
      unit_of_measurement: '°F'
      value_template: '{{ value_json.temperature }}'

sensor 6:
    - platform: mqtt
      state_topic: 'shop/north/temphum'
      name: 'North Wall Humidity'
      unit_of_measurement: '%'
      value_template: '{{ value_json.humidity }}'


Any Questions feel free to ask. I am not a programmer and melded two of the example projects from the Mongoose OS Apps Page:

https://github.com/mongoose-os-apps/example-dht-js
and
https://github.com/mongoose-os-apps/door-sensor



# Note for sending MQTT Messages After Reboot


The only thing that I had to come up with is the code to automatically resend the door sensor state after reboot. I accomplished this by using a system variable Sys.uptime() to fire the state through MQTT if the uptime was less than 15 seconds. Setting this to 10 seconds was a bit tight since most of the time it would print the uptime at around 10.xx seconds causing this portion of the code to never meet its condition. 

```javascript
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
```
## How to install this app

- Install and start [mos tool](https://mongoose-os.com/software.html)
- Switch to the Project page, find and import this app, build and flash it:

<p align="center">
  <img src="https://mongoose-os.com/images/app1.gif" width="75%">
</p>
