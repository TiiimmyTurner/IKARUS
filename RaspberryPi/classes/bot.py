import discord, asyncio, http.client, time
class Bot:
    def __init__(self):
        self.client = discord.Client()
        self.loop = asyncio.get_event_loop()
        self.sending = False
        self.pause = False
        self.ready = False
        self.last_internet_check = 0
        self.internet = False

        @self.client.event
        async def on_ready():
            self.ready = True
            self.channel = self.client.get_channel(self.channelID)
            print('Successfully logged in as {0.user}'.format(self.client))

        @self.client.event
        async def on_message(message):
            if message.author == self.client.user:
                return
            if message.content == "bro id":
                await message.channel.send("GuildID: {0}, ChannelID: {1}".format(message.channel.id, message.channel.guild.id))
            
            if message.content == "bro chill mal kurz":
                self.pause = True

            if message.content == "bro jetzt gehts weiter":
                self.pause = False


    def login(self, token):
        self.loop.create_task(self.client.start(token))
        self.loop.run_forever()

    def set_channel(self, id):
        self.channelID = id

    def checkInternet(self):
        if time.time() - self.last_internet_check > 0:
            self.last_internet_check = time.time()
            conn = http.client.HTTPConnection("www.google.com", timeout=5)
            try:
                conn.request("HEAD", "/")
                conn.close()
                return True
            except:
                conn.close()
                return False
        else: 
            return self.internet

    def send(self, message):
        if self.channel and not self.pause:
            self.sending = True
            async def task():
                self.internet = self.checkInternet()
                if not self.internet: return
                await self.channel.send(message)
                self.sending = False
            asyncio.run_coroutine_threadsafe(task(), self.loop)


    