import sys, os

class Value:
    def __init__(self, read, sensor = None, type = "FLOAT"):
        self.type = type
        if sensor:
            self.sensor = sensor
            def error():
                print("{} is not working".format(self.sensor))
        
        def get():
            try:
                if sensor:
                    return read(sensor)
                else:
                    return read()
            except KeyboardInterrupt:
                os._exit(1)
            except:
                error() if sensor else ()
                return None
        
        self.get = get

        



class Dataset:

    def __init__(self, preset):
        self.dataset = {}
        self.keys = [x for x in preset]
        self.values = {}
        self.parameters = {}
        for name in preset:
            if type(preset[name]) == Value:
                self.values[name] = preset[name]
            else:
                self.parameters[name] = preset[name]

    def update(self):
        
        for name in self.values:
            self.dataset[name] = self.values[name].get()
        
        for name in self.parameters:
            self.dataset[name] = self.parameters[name]

        return self.dataset

    def getString(self):
        types = self.types()
        string = ""

        for key in self.dataset:
            string += "{0},{1},{2}\n".format(types[key], key, self.dataset[key])
        return string[:-1]
        

    def types(self):
        types = {}
        
        for name in self.values:
            types[name] = self.values[name].type
        
        for name in self.parameters:
            types[name] = "TEXT"
        
        return types