from classes.lora import Transceiver
from classes.webserver import Webserver
from classes.bot import Bot
from threading import Thread

# Discord

DISCORD_SERVER_ID = 772478346226303010
DISCORD_CHANNEL_ID = 791062412786532393
DISCORD_BOT_TOKEN = "".join([chr(byte) for byte in [78, 122, 99, 121, 77, 68, 103, 122, 77, 106, 73, 53, 79, 68, 73, 119, 79, 68, 81, 50, 77, 84, 69, 119, 46, 88, 53, 49, 103, 105, 103, 46, 79, 108, 110, 115, 121, 98, 98, 70, 106, 65, 72, 82, 116, 111, 48, 121, 57, 82, 98, 89, 69, 103, 114, 77, 100, 105, 69]])

bot = Bot()
bot.set_channel(DISCORD_CHANNEL_ID)
discord_thread = Thread(target=bot.login, args=(DISCORD_BOT_TOKEN,))
discord_thread.start()

# LoRa

lora = Transceiver()

# Webserver

webserver = Webserver()

address = ('', 8001)
web_thread = Thread(target=webserver.start, args=(address,))
web_thread.start()

def send(message):
    webserver.data = message
    latitude = None
    longitude = None
    lines = [line.split(",") for line in message.split("\n")]
    for line in lines:
        if line[1] == "latitude":
            latitude = line[2]
        
        if line[1] == "longitude":
            longitude = line[2]
    bot.send("latitude: {0}, longitude: {1}".format(latitude, longitude))
    print(message)

lora.onmessage = send