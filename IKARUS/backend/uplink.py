import sys, json, time
def send(message):
    print(message)
    sys.stdout.flush()

while True:
    temp = open("temp/commands.txt", "r")
    cmd = temp.read()
    if cmd != "":
        send(cmd)
        temp.close()
        temp = open("temp/commands.txt", "w")
    
    temp.close()
    time.sleep(.1)

