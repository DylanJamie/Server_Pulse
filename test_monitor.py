# test_monitor.py

# this file will just be a test to make sure montor works

# Imports
from app.services.monitor import *

# Print
print("Hostname:", get_hostname())
print("CPU:", get_cpu_usage())
print("RAM:", get_ram_usage())
print("Disk:", get_disk_usage())
#print("Temperature:", get_temperature())
print("Uptime:", get_uptime())
print("IP:", get_ip_address())
