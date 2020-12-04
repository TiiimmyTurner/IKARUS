import sys, json, time
def send(message):
    print(message)
    sys.stdout.flush()

while True:
    temp = open("temporary/commands.txt", "r")
    cmd = temp.read()
    if cmd != "":
        send(cmd)
        temp.close()
        temp = open("temporary/commands.txt", "w")
    
    temp.close()
    time.sleep(.1)

