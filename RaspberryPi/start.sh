cd ..
sudo rm -rf RaspberryPi
svn checkout --force  https://github.com/TiiimmyTurner/IKARUS/trunk/RaspberryPi
cd RaspberryPi
sudo chmod +x start.sh
python3 IKARUS.py