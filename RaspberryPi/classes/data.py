import sys

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
                sys.exit(0)
            except:
                error() if sensor else ()
        
        self.get = get

        



class Dataset:

    def __init__(self, preset):
        self.keys = [x for x in preset]
        self.values = {}
        self.parameters = {}
        for name in preset:
            if type(preset[name]) == Value:
                self.values[name] = preset[name]
            else:
                self.parameters[name] = preset[name]

    def update(self):
        
        dataset = {}

        for name in self.values:
            dataset[name] = self.values[name].get()
        
        for name in self.parameters:
            dataset[name] = self.parameters[name]

        return dataset

    def types(self):
        types = {}
        
        for name in self.values:
            types[name] = self.values[name].type
        
        for name in self.parameters:
            types[name] = "TEXT"
        
        return types