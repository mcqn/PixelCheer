# PixelCheer

2014's Cheerlights project

## Installation

### Pi

1. Install [Ansible](https://www.ansible.com/get-started) on your computer
1. Install the latest [Raspbian lite image](https://www.raspberrypi.org/downloads/raspbian/) onto a micro-SD card
1. Boot the Raspberry Pi with the micro-SD card, while plugged into a network via Ethernet
1. Find out the IP address of the Raspberry Pi
1. Copy your SSH credentials onto the Pi
  ```ssh-copy-id pi@<ip-address-of-the-pi>```
1. Edit the ```hosts``` file so ansible knows which computer to configure.  Change the IP address in it to match the one you just found out.
1. Check you can run commands on the Pi using Ansible
   ```ansible pixelcheer -i hosts -a "hostname" -u pi```
1. Update the Pi
   ```ansible-playbook pixelcheer.yml -i hosts```

### Website

1. Install Docker
1. Install docker-compose
1. Clone repo
1. Change to the pixelcheer.mcqn.com directory
1. Build the docker images
    `docker-compose build`
1. Copy systemd script
    `sudo cp config_files/pixelcheer-mcqn-com.service /lib/systemd/system/`
    `sudo systemctl enable pixelcheer-mcqn-com.service`
    `sudo service pixelcheer-mcqn-com start`
1. Set up nginx 
    `sudo cp config_files/etc_nginx_sites-available_default /etc/nginx/sites-available/pixelcheer-mcqn-com`
    `sudo ln -s /etc/nginx/sites-available/pixelcheer-mcqn-com /etc/nginx/sites-enabled/`
    `sudo service nginx restart`
