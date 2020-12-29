# -> https://pypi.org/project/pyLoRa/

import time, sys
from SX127x.LoRa import *
from SX127x.board_config import BOARD



# --- constants ---

# callback request message key
REQ = "INF"

# callback message
CALLBACK = "REC"



class Transceiver(LoRa):

    def __init__(self, verbose=False):
        BOARD.setup()
        BOARD.reset()
        super(Transceiver, self).__init__(verbose)
        self.set_mode(MODE.SLEEP)
        self.config("long")

        self.set_dio_mapping([0] * 6)
        self.reset_ptr_rx()
        self.set_mode(MODE.RXCONT)

        self.state = "RX"

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

        payload = self.read_payload(nocheck=True )
        message = bytes(payload).decode("utf-8",'ignore')
        # message = message[2:-1] #to discard \x00\x00 and \x00 at the end
        print("received:", message)

        self.clear_irq_flags(RxDone=1)
        
        self.set_dio_mapping([0] * 6)
        self.reset_ptr_rx()
        self.set_mode(MODE.RXCONT)
        
        BOARD.led_off()
        
        if message==REQ:

            self.send(CALLBACK)

    def on_tx_done(self):
        print("TX done")
        self.clear_irq_flags(TxDone=1) # clear txdone IRQ flag
        
        self.set_dio_mapping([0] * 6)    
        self.reset_ptr_rx()
        self.set_mode(MODE.RXCONT)
        self.state = "RX"

    def on_cad_done(self):
        print("\non_CadDone")
        print(self.get_irq_flags())

    def on_rx_timeout(self):
        print("\non_RxTimeout")
        print(self.get_irq_flags())

    def on_valid_header(self):
        print("\non_ValidHeader")
        print(self.get_irq_flags())

    def on_payload_crc_error(self):
        print("\non_PayloadCrcError")
        print(self.get_irq_flags())

    def on_fhss_change_channel(self):
        print("\non_FhssChangeChannel")
        print(self.get_irq_flags())

    def start(self):
        pass
    
    def send(self, message, wait = False):
        print("sending:", message)
        self.state = "TX"
        payload = [255, 255, 0, 0] + [byte for byte in (message).encode("utf-8")] + [0]
        
        self.set_dio_mapping([1] + [0] * 5)
        self.write_payload(payload)
        self.set_mode(MODE.TX)

        if wait != False:
            pass

    def shutdown(self):
        self.set_mode(MODE.SLEEP)
        BOARD.teardown()
