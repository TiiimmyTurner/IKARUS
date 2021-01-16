from classes.bot import Bot
from threading import Thread
import time

DATA_DELAY = 0.5
DISCORD_DELAY = 5
LORA_DELAY = 10

GYRO_SENSITIVITY = 1
ACCELEROMETER_SENSITIVITY = 1
GYRO_WEIGHTING = 0.92

DISCORD_SERVER_ID = 772478346226303010
DISCORD_CHANNEL_ID = 791062412786532393
DISCORD_BOT_TOKEN = "".join([chr(byte) for byte in [78, 122, 99, 121, 77, 68, 103, 122, 77, 106, 73, 53, 79, 68, 73, 119, 79, 68, 81, 50, 77, 84, 69, 119, 46, 88, 53, 49, 103, 105, 103, 46, 79, 108, 110, 115, 121, 98, 98, 70, 106, 65, 72, 82, 116, 111, 48, 121, 57, 82, 98, 89, 69, 103, 114, 77, 100, 105, 69]])


bot = Bot()
bot.set_channel(DISCORD_CHANNEL_ID)
discord_thread = Thread(target=bot.login, args=(DISCORD_BOT_TOKEN,))
discord_thread.start()

while True:
    if not bot.ready: continue
    bot.send(time.time())
    time.sleep(3)