import sys, json, time
from datetime import datetime
import paho.mqtt.client as mqtt

start = datetime.now()
start_s = start.strftime("%d-%m-%Y-%H-%M-%S")

#Mosquitto
MQTT_SERVER = "raspberrypi"
MQTT_PATH = "data"

def on_connect(_client, userdata, flags, rc):
    print("Connected with result code "+str(rc))
    _client.subscribe(MQTT_PATH)

def on_message(client, userdata, msg):

    #receive
    data = str(msg.payload)[2:(len(str(msg.payload))-1)]

    #log
    now = datetime.now()
    timestamp = now.strftime("[%d/%m/%Y %H:%M:%S]")
    txt = open("logs/" + start_s + ".txt", "a")
    txt.write(timestamp + data)
    txt.write("\n")
    txt.close()

    #send to main
    print(data)
    sys.stdout.flush()

client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message
 
client.connect(MQTT_SERVER, 1883, 60)

client.loop_forever()
