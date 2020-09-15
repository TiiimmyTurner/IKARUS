import sys, board, busio, time, json
import paho.mqtt.client as mqtt
import RPi.GPIO as GPIO
import adafruit_mpu6050, adafruit_bme280
import Adafruit_BMP.BMP085 as BMP085
import paho.mqtt.publish as publish
import math

#Sensor setup
i2c = busio.I2C(board.SCL, board.SDA)

bmp180 = BMP085.BMP085() #hier read_temperature() und read_pressure(), bei allen anderen sensor.temperature, etc.
bmp280= adafruit_bme280.Adafruit_BME280_I2C(i2c, 0x76)
#bmp280_outside = adafruit_bme280.Adafruit_BME280_I2C(i2c, 0x75)
mpu6050 = adafruit_mpu6050.MPU6050(i2c)


#Mosquitto setup
MQTT_SERVER = "localhost"
MQTT_PATH = "data"

dataset = {

    "temperature_inside" : 0,
    "temperature_outside" : 0,
    "pressure_inside" : 0,
    "pressure_outside" : 0,
    "humidity_inside" : 0,
    "humidity_outside" : 0,
    "rotation_x" : 0,
    "rotation_y" : 0,
    "rotation_z" : 0,
    "gps_x": 0,
    "gps_y": 0,
    "time": 0
    
    }

#Gyrofilter

angle = [0, 0]
gyro_sensitivity = 1
accel_sensitivity = 1
inRange = True

def filter(gyr, acc, dt):
    global angle
    gyrData = [0, 0] #x, y
    accelData = [0, 0] #x, y
    

    #integrate
    for x in range(2):
        gyrData[x] = angle[x] + gyr[x] / 180 * 3.141 * dt / gyro_sensitivity

    #compensate drift if data =! bullshit
    if inRange:
        accelData[0] = math.atan2(acc[1], acc[2])
        accelData[1] = math.atan2(acc[0], math.sqrt(acc[2]**2 + acc[1]**2))
        for x in range(2):
            angle[x] = 0.95 * gyrData[x] + 0.05 * accelData[x]
    
    else:
        for x in range(2):
            angle[x] = gyrData[x]

i = 0
end = time.time()
while True:
    start = time.time()
    filter(mpu6050.gyro, mpu6050.acceleration, end - start)

    if i == 9:
        i = 0
        dataset["time"] = time.time()
        dataset["rotation_x"] = angle[0]
        dataset["rotation_y"] = angle[1]
        dataset["rotation_z"] = mpu6050.gyro[2]
        dataset["humidity_outside"] = bmp280.humidity
        dataset["temperature_outside"] = bmp280.temperature
        dataset["pressure_outside"] = bmp280.pressure
        dataset["pressure_inside"] = bmp180.read_pressure() / 100
        dataset["temperature_inside"] = bmp180.read_temperature()

        publish.single(MQTT_PATH, json.dumps(dataset), hostname=MQTT_SERVER)
    
    time.sleep(0.02)
    end = time.time()
    i += 1
