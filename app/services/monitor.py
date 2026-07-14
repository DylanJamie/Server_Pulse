# monitor.py

# Imports
# psutil == Process and Systems Utility
import psutil
import socket
import time
import os
from datetime import datetime

# When running inside Docker, point psutil at the host's mounted /proc
# so it reads real system stats instead of the container's own
if os.path.exists("/host/proc"):
    psutil.PROCFS_PATH = "/host/proc"

# Get the host name of the server
def get_hostname():
    hostname = socket.gethostname()
    return hostname
    
# Pull the cpu usage
def get_cpu_usage():
    cpu_usage = psutil.cpu_percent(interval=1.0)
    return cpu_usage

# Pull the ram usage
def get_ram_usage():
    memory = psutil.virtual_memory()
    ram_usage = memory.percent
    return ram_usage

# Pull the disk usage
def get_disk_usage():
    disk = psutil.disk_usage("/")
    disk_usage = disk.percent
    return disk_usage
    
# Pull the Temperature
def get_temperature():
    temps = psutil.sensors_temperatures()

    if not temps:
        return None  # no sensors available (common on Raspberry Pi via psutil, macOS, some VMs)
    
    # Grab the first available sensor reading
    for hardware_name, entries in temps.items():
        if entries:
            return entries[0].current  # returns a float, e.g. 45.0
    return None

# Pull the Network Usage
def get_network_usage():
    net_before = psutil.net_io_counters()

    # wait a second
    time.sleep(1.0)

    # Get update network bite counts
    net_after = psutil.net_io_counters()

    # Calculate the bites per sec
    bytes_sent_per_sec = net_after.bytes_sent - net_before.bytes_sent
    bytes_recv_per_sec = net_after.bytes_recv - net_before.bytes_recv

    # Return the result
    return bytes_sent_per_sec, bytes_recv_per_sec

# Pull the amount of time the device been up
def get_uptime():
    # Get system boot timestamp
    boot_timestamp = psutil.boot_time()
    boot_time = datetime.fromtimestamp(boot_timestamp)
    
    # Calculate duration since boot
    current_time = datetime.now()
    uptime_duration = current_time - boot_time
    
    # Format the output into days, hours, and minutes
    days = uptime_duration.days
    hours, remainder = divmod(uptime_duration.seconds, 3600)
    minutes, _ = divmod(remainder, 60)

    # return Uptime
    return f"{days}d {hours}h {minutes}m"

# Return the IP address
def get_ip_address():
    hostname = socket.gethostname()
    ip_address = socket.gethostbyname(hostname)
    return ip_address
