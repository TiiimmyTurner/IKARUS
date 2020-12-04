cd ..
rmdir -r RaspberryPi
svn checkout --force  https://github.com/TiiimmyTurner/IKARUS/trunk/RaspberryPi
cd RaspberryPi
sudo chmod +x start.sh
sudo python3 IKARUS.py