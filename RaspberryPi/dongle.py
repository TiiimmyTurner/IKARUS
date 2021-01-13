from classes.lora import Transceiver, Webserver
from threading import Thread

# LoRa

lora = Transceiver()

# Webserver

webserver = Webserver()

address = ('', 8001)
web_thread = Thread(target=webserver.start, args=(address,))
web_thread.start()

def send(message):
    webserver.data = message

lora.onmessage = send