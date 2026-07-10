# status.py

# End Points

# GET /status
# GET /cpu
# GET /ram
# GET /disk
# GET /temperature
# GET /uptime

# Imports
from fastapi import APIRouter
from app.services.monitor import (
    get_hostname,
    get_cpu_usage,
    get_ram_usage,
    get_disk_usage,
    get_network_usage,
    get_uptime,
    get_ip_address,
    # get_temperature,  # uncomment on the Pi
)

router = APIRouter()

@router.get("/status")
def status():
    sent, recv = get_network_usage()
    return {
        "hostname": get_hostname(),
        "ip_address": get_ip_address(),
        "cpu_percent": get_cpu_usage(),
        "ram_percent": get_ram_usage(),
        "disk_percent": get_disk_usage(),
        "network": {
            "bytes_sent_per_sec": sent,
            "bytes_recv_per_sec": recv
        },
        "uptime": get_uptime(),
        # "temperature": get_temperature(),  # uncomment on the Pi
    }

@router.get("/cpu")
def cpu():
    return {"cpu_percent": get_cpu_usage()}

@router.get("/ram")
def ram():
    return {"ram_percent": get_ram_usage()}

@router.get("/disk")
def disk():
    return {"disk_percent": get_disk_usage()}

@router.get("/temperature")
def temperature():
    # temp = get_temperature()
    # return {"temperature_celsius": temp}
    return {"error": "Temperature monitoring only available on Raspberry Pi"}

@router.get("/uptime")
def uptime():
    return {"uptime": get_uptime()}
