import sys, board, busio, time, json, math, copy, os
from typing import Dict
import paho.mqtt.client as mqtt
import RPi.GPIO as GPIO
import adafruit_mpu6050, adafruit_bme280, Adafruit_BMP.BMP085, adafruit_gps
import paho.mqtt.publish as publish
import serial
from picamera import PiCamera
from classes.lora import Transceiver
from classes.webserver import Webserver
import asyncio
from threading import Thread
from multiprocessing import Process
from classes.data import Dataset, Value
from classes.bot import Bot
import discord
import sqlite3



if len(sys.argv) > 2:
    sys.exit(0)

elif len(sys.argv) == 2 and sys.argv[1] != "":
    LAUNCH = sys.argv[1]

else:
    file = open(os.path.join(os.path.dirname(__file__), "launch.txt"))
    LAUNCH = file.read()
    file.close()
    if LAUNCH == "":
        sys.exit(0)




# ---------- Parameters ----------

DATA_DELAY = 0.5
DISCORD_DELAY = 5
LORA_DELAY = 60

GYRO_SENSITIVITY = 1
ACCELEROMETER_SENSITIVITY = 1
GYRO_WEIGHTING = 0.92

DISCORD_SERVER_ID = 772478346226303010
DISCORD_CHANNEL_ID = 791062412786532393
DISCORD_BOT_TOKEN = "".join([chr(byte) for byte in [78, 122, 99, 121, 77, 68, 103, 122, 77, 106, 73, 53, 79, 68, 73, 119, 79, 68, 81, 50, 77, 84, 69, 119, 46, 88, 53, 49, 103, 105, 103, 46, 79, 108, 110, 115, 121, 98, 98, 70, 106, 65, 72, 82, 116, 111, 48, 121, 57, 82, 98, 89, 69, 103, 114, 77, 100, 105, 69]])



# ---------- Setup ----------

print("launch: {}".format(LAUNCH))

# Peripherals

# LoRa

lora = Transceiver()

# Webserver

webserver = Webserver()

address = ('', 8000)
web_thread = Thread(target=webserver.start, args=(address,))
web_thread.start()

# Camera

camera = PiCamera()
camera.resolution = (620, 480)
camera.framerate = 24

camera.start_recording(webserver.stream, format='mjpeg', splitter_port=1)
camera.start_recording('video.h264', splitter_port=2, resize=(1280, 720))



# GPS
# -> https://learn.adafruit.com/adafruit-ultimate-gps/circuitpython-python-uart-usage

uart = serial.Serial("/dev/ttyACM0", baudrate=9600, timeout=3000)
gps = adafruit_gps.GPS(uart, debug=False)

gps.send_command(b'PMTK314,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0')
gps.send_command(b'PMTK220,1000')

# Sensors

i2c = busio.I2C(board.SCL, board.SDA)

bmp280 = adafruit_bme280.Adafruit_BME280_I2C(i2c, 0x76)
mpu6050 = adafruit_mpu6050.MPU6050(i2c)
bmp180 = Adafruit_BMP.BMP085.BMP085() 
# bmp180: read_temperature() and read_pressure(), rest: sensor.value



# Mosquitto

MQTT_SERVER = "localhost"
MQTT_PATH = "data"


# Discord

bot = Bot()
bot.set_channel(DISCORD_CHANNEL_ID)
discord_thread = Thread(target=bot.login, args=(DISCORD_BOT_TOKEN,))
discord_thread.start()



# global variables

orientation = [0, 0]
dataset = Dataset({
    "temperature_inside" : Value(lambda s : s.read_temperature(), bmp180),
    "temperature_outside" : Value(lambda s : s.temperature, bmp280),
    "pressure_inside" : Value(lambda s : s.read_pressure() / 100, bmp180),
    "pressure_outside" : Value(lambda s : s.pressure, bmp280),
    "humidity_outside" : Value(lambda s : s.humidity, bmp280),
    "rotation_x" : Value(lambda: -orientation[0]),
    "rotation_y" : Value(lambda: orientation[1]),
    "rotation_z" : Value(lambda: mpu6050.gyro[2]),
    "latitude": Value(lambda s : s.latitude if s.has_fix else None, gps),
    "longitude": Value(lambda s : s.longitude if s.has_fix else None, gps),
    "time": Value(time.time),
    "satellites": Value(lambda s : s.satellites, gps),
    "gps_fix": Value(lambda s : s.has_fix, gps, "BOOLEAN"),
    "launch": LAUNCH
})



# SQLite

db = sqlite3.connect("data.db")
c = db.cursor()

def commafy(iteratable):
    s = ""
    for x in iteratable:
        s += (str(x) + ", ")

    return s[:-2]


c.execute("""CREATE TABLE IF NOT EXISTS {0} ({1})""".format("'" + str(LAUNCH) + "'", commafy([x + " " + dataset.types()[x] for x in dataset.types()])))
db.commit()

def log(data):
    c.execute("""SELECT * FROM PRAGMA_TABLE_INFO('{}')""".format(LAUNCH))
    columns = [x[1] for x in c.fetchall()]
    union = [column for column in columns if data[column]]
    INTO = commafy(union)
    VALUES = commafy(["'" + data[key] + "'" if dataset.types()[key] == "TEXT" else data[key] for key in union])
    c.execute("""INSERT INTO {0} ({1}) VALUES ({2})""".format(LAUNCH, INTO, VALUES))
    db.commit()


# gyro calculations

def updateAngle(gyr, acc, dt):
    
    gyrData = [0, 0] #x, y
    accelData = [0, 0] #x, y
    
    #integrate
    for x in range(2):
        gyrData[x] = orientation[x] + gyr[x] / 180 * 3.141 * dt / GYRO_SENSITIVITY

    #compensate drift if data =! bullshit (condition is todo)
    accelInRange = True
    if accelInRange:
        accelData[0] = math.atan2(acc[1], acc[2])
        accelData[1] = -math.atan2(acc[0], math.sqrt(acc[2]**2 + acc[1]**2))
        for x in range(2):
            orientation[x] = GYRO_WEIGHTING * gyrData[x] + (1 - GYRO_WEIGHTING) * accelData[x]
    
    else:
        for x in range(2):
            orientation[x] = gyrData[x]



# main loop

begin = time.time()
last_data = time.time()
last_discord = time.time()
last_lora = time.time()

try:
    while True:

        now = time.time()
        dt = now - begin
        begin = now

        try:
            updateAngle(mpu6050.gyro, mpu6050.acceleration, dt)
        except KeyboardInterrupt:
            os._exit(1)
        except:
            pass

        if time.time() - last_data >= DATA_DELAY:
            gps.update()
            data = dataset.update()
            publish.single(MQTT_PATH, json.dumps(data), hostname=MQTT_SERVER)
            webserver.data = dataset.getString()
            last_data = time.time()
            log(data)
            
            if time.time() - last_discord >= DISCORD_DELAY and bot.ready:
                if not bot.sending:
                    try:
                        bot.send("{0} {1}".format(data["latitude"], data["longitude"]))
                        last_discord = time.time()
                    except:
                        print("Discord Bot error!")
            
            if time.time() - last_lora >= LORA_DELAY and lora.state == "RX":
                try:
                    lora.send("{0} {1}".format(data["latitude"], data["longitude"]))
                    last_lora = time.time()
                except:
                    print("LoRa error!")



except KeyboardInterrupt:
    pass

finally:
    print("end")
    lora.shutdown()
    camera.stop_recording(splitter_port=1)
    camera.stop_recording(splitter_port=2)
    os._exit(1)
