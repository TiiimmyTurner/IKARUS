# -> https://pypi.org/project/pyLoRa/

import time, sys
from SX127x.LoRa import *
from SX127x.board_config import BOARD



# --- constants ---

MAX_BYTES = 15
SEPERATOR = 128

# callback request message key
REQ = "INF"

# callback message
CALLBACK = "REC"


def toBytes(n):
    bytes = []
    while True:
        remainder = n % 256
        bytes = [remainder] + bytes
        n -= remainder
        if n == 0:
            break
        else:
            n //= 256
    return bytes

        
def toInt(bytes):
    number = 0
    for pos in range(len(bytes)):
        number += bytes[pos] * 256 ** (len(bytes) - pos - 1)
    return number

class Transceiver(LoRa):

    def __init__(self, verbose=False):
        BOARD.setup()
        BOARD.reset()
        super(Transceiver, self).__init__(verbose)
        self.set_mode(MODE.SLEEP)
        self.config("long")

        self.setmode("RX")
        self.receiving = []
        self.transmitting = []
        self.txn = 0
        self.rxn = None
        assert(self.get_agc_auto_on() == 1)

    def config(self, range = "long"):
        self.set_max_payload_length(128)
        if range == "long":

            #       Slow+long range  Bw = 125 kHz, Cr = 4/8, Sf = 4096chips/symbol, CRC on. 13 dBm
            
            self.set_pa_config(pa_select=1, max_power=21, output_power=15)
            self.set_bw(BW.BW125)
            self.set_coding_rate(CODING_RATE.CR4_8)
            self.set_spreading_factor(12)
            self.set_rx_crc(True)
            # self.set_lna_gain(GAIN.G1)
            # self.set_implicit_header_mode(False)
            self.set_low_data_rate_optim(True)
        
        elif range == "medium":

            #       Medium Range  Defaults after init are 434.0MHz, Bw = 125 kHz, Cr = 4/5, Sf = 128chips/symbol, CRC on 13 dBm
            
            self.set_pa_config(pa_select=1)

        else: raise Exception("Argument range={} not implemented!".format(range))

        #       stuff
        #self.set_rx_crc(True)
        #self.set_agc_auto_on(True)
        #self.set_lna_gain(GAIN.NOT_USED)
        #self.set_coding_rate(CODING_RATE.CR4_6)
        #self.set_implicit_header_mode(False)
        #self.set_pa_config(max_power=0x04, output_power=0x0F)
        #self.set_pa_config(max_power=0x04, output_power=0b01000000)
        #self.set_low_data_rate_optim(True)
        #self.set_pa_ramp(PA_RAMP.RAMP_50_us)

    
    def on_rx_done(self):
        BOARD.led_on()

        payload = self.read_payload(nocheck=True)
        payload = payload[4:-1] # to discard [255, 255, 0, 0] at the start and [0] at the end

        def decode(payload):
            package = {}
            args = ["txn", "quantity", "number", "length", "message"]
            arg = 0
            for key in args:
                package[key] = []
            for byte in payload:
                if byte == SEPERATOR:
                    arg += 1
                    continue
                else:
                    package[args[arg]] += [byte]
            
            for name in package:
                if name == "message":
                    package[name] = bytes(package[name]).decode("utf-8",'ignore')
                else:
                    package[name] = toInt(package[name])
            return package

        package = decode(payload)
        print(package)

        def finish(transmission):
            if None in transmission:
                self.onlost(transmission)
            else:
                message = ""
                for p in transmission:
                    message += p["message"]
                self.onmessage(message)

        if not self.receiving:
            self.receiving = [None] * package["quantity"]
            self.rxn = package["txn"]
        
        if package["txn"] == self.rxn:
            self.receiving[package["number"]] = package
            if package["number"] == package["quantity"] - 1:
                finish(self.receiving)
                self.receiving = None
                self.rxn = None
        else:
            finish(self.receiving)
            self.receiving = [None] * package["quantity"]
            self.rxn = package["txn"]
            self.receiving[package["number"]] = package




        self.clear_irq_flags(RxDone=1)
        
        self.setmode("RX")
        
        BOARD.led_off()
        
        if package["message"]==REQ:

            self.send(CALLBACK)
    
    def onmessage(self, message):
        print("received:", message)

    def onlost(self, package):
        print("lost:", self.rxn)

    def on_tx_done(self):
        self.clear_irq_flags(TxDone=1) # clear txdone IRQ flag
        if len(self.transmitting) == 0:
            self.setmode("RX")
        else:
            self.transmit()


    
    def setmode(self, m):
        if m == "RX":
            self.state = "RX"
            self.set_dio_mapping([0] * 6)    
            self.reset_ptr_rx()
            self.set_mode(MODE.RXCONT)

        if m == "TX":
            self.state = "TX"
            self.set_dio_mapping([1] + [0] * 5)
            self.transmit()


    def send_payload(self, payload):
        print(payload)
        self.write_payload(payload)
        self.set_mode(MODE.TX)


    def transmit(self):
        package = self.transmitting.pop(0)
        self.send_payload([255, 255, 0, 0] + package + [0])



    def send(self, message, **options):
        
        class Header:
            def __init__(self, seperator = 128):
                self.seperator = seperator
                self.lengths = {}
                self.args = []

            def setArgs(self, *args):
                self.args = args

            def setLengths(self, **args):
                for arg in args:
                    self.lengths[arg] = args[arg]

            def length(self):
                seperators = len(self.lengths) - 1
                args = 0
                for arg in self.lengths:
                    args += self.lengths[arg]
                return seperators + args
            
            def getLength(self, arg):
                if self.lengths[arg]:
                    return self.lengths[arg]

            def getHeader(self, **values):
                header = []
                for arg in self.args:
                    try:
                        header += toBytes(values[arg]) + [self.seperator]
                    except:
                        pass
                return header[:-1]

        header = Header()
        quantity = 0
        header.setArgs("txn", "quantity", "number", "length")
        header.setLengths(txn=1, quantity=1, number=1, length=len(toBytes(MAX_BYTES)))

        while True:
            messagespace = MAX_BYTES - header.length() - 1
            if not messagespace > 0:
                return
            quantity = (len(message) + messagespace - 1) // messagespace
            if len(toBytes(quantity)) == header.getLength("quantity"):
                break
            else:
                header.lengths["quantitiy"] += 1
                header.lengths["number"] += 1
        
        
        packages = []
        number = 0
        while len(message) > 0:
            messagespace = MAX_BYTES - header.length() - 1
            content = [byte for byte in message[:messagespace].encode("utf-8")]
            message = message[len(content):]
            length = len(content) + 1 + header.length()
            part = header.getHeader(txn=self.txn, quantity=quantity, number=number, length=length) + [SEPERATOR] + content
            packages.append(part)
            number += 1
     
        for package in packages:
            self.transmitting.append(package)
        self.setmode("TX")

        self.txn += 1
        if self.txn == 256:
            self.txn = 0



        if "splitchr" in options.keys():
            pass
        if "wait" in options.keys():
            pass

    def shutdown(self):
        self.set_mode(MODE.SLEEP)
        BOARD.teardown()
    
    # def on_cad_done(self):
    #     print("\non_CadDone")
    #     print(self.get_irq_flags())

    # def on_rx_timeout(self):
    #     print("\non_RxTimeout")
    #     print(self.get_irq_flags())

    # def on_valid_header(self):
    #     print("\non_ValidHeader")
    #     print(self.get_irq_flags())

    # def on_payload_crc_error(self):
    #     print("\non_PayloadCrcError")
    #     print(self.get_irq_flags())

    # def on_fhss_change_channel(self):
    #     print("\non_FhssChangeChannel")
    #     print(self.get_irq_flags())

    # def start(self):
    #     pass
