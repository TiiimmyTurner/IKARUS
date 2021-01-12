from time import sleep
from .classes.lora import Transceiver

lora = Transceiver()

while True:
    if lora.state == "TX":
        continue
    lora.send("a" * 113)
    sleep(5)
