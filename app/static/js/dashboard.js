// dashboard.js

async function updateStatus() {
    try {
        const res = await fetch("/status");
        const data = await res.json();

        document.getElementById("hostname").textContent =
            `${data.hostname} — ${data.ip_address}`;
        document.getElementById("cpu").textContent = `${data.cpu_percent}%`;
        document.getElementById("ram").textContent = `${data.ram_percent}%`;
        document.getElementById("disk").textContent = `${data.disk_percent}%`;
        document.getElementById("uptime").textContent = data.uptime;
        document.getElementById("network").textContent =
            `↑ ${data.network.bytes_sent_per_sec}B/s  ↓ ${data.network.bytes_recv_per_sec}B/s`;

        if (data.temperature !== undefined) {
            document.getElementById("temperature").textContent = `${data.temperature}°C`;
        }
    } catch (err) {
        console.error("Failed to fetch status:", err);
    }
}

updateStatus();
setInterval(updateStatus, 3000); // refresh every 3 seconds
