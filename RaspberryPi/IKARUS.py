import sys, board, busio, time, json, math, copy
import paho.mqtt.client as mqtt
import RPi.GPIO as GPIO
import adafruit_mpu6050, adafruit_bme280
import Adafruit_BMP.BMP085 as BMP085
import paho.mqtt.publish as publish
import adafruit_gps
import serial

#setup

#GPS setup
# RX = board.RX
# TX = board.TX
# uart = busio.UART(TX, RX, baudrate=9600, timeout=30)
uart = serial.Serial("/dev/ttyACM0", baudrate=9600, timeout=3000)
gps = adafruit_gps.GPS(uart, debug=False)

gps.send_command(b'PMTK314,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0')
gps.send_command(b'PMTK220,1000')
last_print = time.monotonic()

#Sensor setup
i2c = busio.I2C(board.SCL, board.SDA)

bmp180 = BMP085.BMP085() #hier read_temperature() und read_pressure(), bei allen anderen sensor.temperature, etc.
bmp280 = adafruit_bme280.Adafruit_BME280_I2C(i2c, 0x76)
#bmp280_outside = adafruit_bme280.Adafruit_BME280_I2C(i2c, 0x75)
#mpu6050 = adafruit_mpu6050.MPU6050(i2c)


#Mosquitto setup
MQTT_SERVER = "localhost"
MQTT_PATH = "data"



#declarations, definitions and constants
package = []
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

angle = [0, 0]
gyro_sensitivity = 1
accel_sensitivity = 1

minPackageDelay = 0
minMeasureDelay = 0
minPackageSize = 0



#Gyrofilter

inRange = True

def filter(gyr, acc, dt):
    global angle
    gyrData = [0, 0] #x, y
    accelData = [0, 0] #x, y
    

    #integrate
    for x in range(2):
        gyrData[x] = angle[x] + gyr[x] / 180 * 3.141 * dt / gyro_sensitivity

    #compensate drift if data =! bullshit (ToDo)
    if inRange:
        accelData[0] = math.atan2(acc[1], acc[2])
        accelData[1] = -math.atan2(acc[0], math.sqrt(acc[2]**2 + acc[1]**2))
        for x in range(2):
            angle[x] = 0.92 * gyrData[x] + 0.08 * accelData[x]
    
    else:
        for x in range(2):
            angle[x] = gyrData[x]


# clock

start = 0
end = 0
measure = time.time()
sended = time.time()
while True:

    try:
        filter(mpu6050.gyro, mpu6050.acceleration, end - start)
    except:
        pass

    start = time.time()
    if time.time() - measure >= minMeasureDelay:
        measure = time.time()

        gps.update()
        if not gps.has_fix:
            print('Waiting for fix...')
        else:
            dataset["gps_x"] = gps.latitude
            dataset["gps_y"] = gps.longitude
        
        dataset["rotation_x"] = -angle[0]
        dataset["rotation_y"] = angle[1]
        try:
            dataset["rotation_z"] = mpu6050.gyro[2]
        except:
            pass
        try:
            dataset["humidity_outside"] = bmp280.humidity
            dataset["temperature_outside"] = bmp280.temperature
            dataset["pressure_outside"] = bmp280.pressure
        except:
            pass
        try:
            dataset["pressure_inside"] = bmp180.read_pressure() / 100
            dataset["temperature_inside"] = bmp180.read_temperature()
        except:
            pass
        
        dataset["time"] = time.time()
        package.append(copy.deepcopy(dataset))

        if time.time() - sended >= minPackageDelay and len(package) >= minPackageSize:
            sended = time.time()
            publish.single(MQTT_PATH, json.dumps(package), hostname=MQTT_SERVER)
            package = []


    end = time.time()
