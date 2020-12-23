import discord, asyncio
class Bot:
    def __init__(self):
        self.client = discord.Client()
        self.loop = asyncio.get_event_loop()
        self.sending = False
        self.pause = False

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

    def send(self, message):
        if self.channel and not self.pause:
            self.sending = True
            async def task():
                await self.channel.send(message)
                self.sending = False
            asyncio.run_coroutine_threadsafe(task(), self.loop)


    