// dashboard.js

const MAX_POINTS = 30;
const history = { cpu: [], ram: [], disk: [], temp: [] };

let latestCpu = 0; // drives the hero waveform amplitude/speed

function pushHistory(key, value) {
    if (value === null || value === undefined) return;
    const arr = history[key];
    arr.push(value);
    if (arr.length > MAX_POINTS) arr.shift();
}

function formatBytes(bytesPerSec) {
    if (bytesPerSec < 1024) return `${bytesPerSec}B/s`;
    if (bytesPerSec < 1024 * 1024) return `${(bytesPerSec / 1024).toFixed(1)}KB/s`;
    return `${(bytesPerSec / (1024 * 1024)).toFixed(1)}MB/s`;
}

// ---- mini sparklines (CPU/RAM/DISK/TEMP cards) ----
function drawSparkline(canvas, data, maxValue = 100) {
    const ctx = canvas.getContext("2d");
    const w = canvas.width = canvas.clientWidth * devicePixelRatio;
    const h = canvas.height = canvas.clientHeight * devicePixelRatio;
    ctx.clearRect(0, 0, w, h);
    if (data.length < 2) return;

    ctx.beginPath();
    data.forEach((val, i) => {
        const x = (i / (MAX_POINTS - 1)) * w;
        const y = h - (Math.min(val, maxValue) / maxValue) * h;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = "#ffb300";
    ctx.lineWidth = 2 * devicePixelRatio;
    ctx.shadowColor = "#ffb300";
    ctx.shadowBlur = 4;
    ctx.stroke();
}

// ---- hero oscilloscope waveform, scrolls continuously ----
const pulseCanvas = document.getElementById("pulseCanvas");
const pulseCtx = pulseCanvas.getContext("2d");
let pulseBuffer = [];
let tick = 0;

function resizePulseCanvas() {
    pulseCanvas.width = pulseCanvas.clientWidth * devicePixelRatio;
    pulseCanvas.height = pulseCanvas.clientHeight * devicePixelRatio;
    pulseBuffer = new Array(Math.floor(pulseCanvas.width)).fill(pulseCanvas.height / 2);
}
window.addEventListener("resize", resizePulseCanvas);
resizePulseCanvas();

function stepPulse() {
    const w = pulseCanvas.width;
    const h = pulseCanvas.height;
    const mid = h / 2;

    // load drives amplitude and speed — higher CPU = bigger, faster pulse
    const load = Math.max(latestCpu, 2) / 100;
    const amplitude = mid * 0.15 + mid * 0.75 * load;
    const speed = 0.05 + load * 0.25;

    tick += speed;
    const jitter = (Math.random() - 0.5) * amplitude * 0.15;
    const y = mid - Math.sin(tick) * amplitude - jitter;

    pulseBuffer.push(y);
    pulseBuffer.shift();

    pulseCtx.clearRect(0, 0, w, h);
    pulseCtx.beginPath();
    pulseBuffer.forEach((val, i) => {
        i === 0 ? pulseCtx.moveTo(i, val) : pulseCtx.lineTo(i, val);
    });
    pulseCtx.strokeStyle = "#ffb300";
    pulseCtx.lineWidth = 2 * devicePixelRatio;
    pulseCtx.shadowColor = "#ffb300";
    pulseCtx.shadowBlur = 8;
    pulseCtx.stroke();

    requestAnimationFrame(stepPulse);
}
requestAnimationFrame(stepPulse);

// ---- fetch + update everything ----
async function updateStatus() {
    try {
        const res = await fetch("/status");
        const data = await res.json();

        latestCpu = data.cpu_percent ?? 0;

        document.getElementById("hostname").textContent =
            `${data.hostname}`;
        document.getElementById("ip").textContent = data.ip_address;
        document.getElementById("uptime").textContent = data.uptime;
        document.getElementById("network").textContent =
            `↑ ${formatBytes(data.network.bytes_sent_per_sec)}  ↓ ${formatBytes(data.network.bytes_recv_per_sec)}`;

        document.getElementById("cpu").textContent = `${data.cpu_percent}%`;
        document.getElementById("ram").textContent = `${data.ram_percent}%`;
        document.getElementById("disk").textContent = `${data.disk_percent}%`;

        document.getElementById("cpuBar").style.width = `${data.cpu_percent}%`;
        document.getElementById("ramBar").style.width = `${data.ram_percent}%`;
        document.getElementById("diskBar").style.width = `${data.disk_percent}%`;

        pushHistory("cpu", data.cpu_percent);
        pushHistory("ram", data.ram_percent);
        pushHistory("disk", data.disk_percent);

        drawSparkline(document.getElementById("cpuSpark"), history.cpu);
        drawSparkline(document.getElementById("ramSpark"), history.ram);
        drawSparkline(document.getElementById("diskSpark"), history.disk);

        if (data.temperature !== undefined && data.temperature !== null) {
            document.getElementById("temperature").textContent = `${data.temperature.toFixed(1)}°C`;
            document.getElementById("tempBar").style.width = `${Math.min(data.temperature, 100)}%`;
            pushHistory("temp", data.temperature);
            drawSparkline(document.getElementById("tempSpark"), history.temp, 100);
        } else {
            document.getElementById("temperature").textContent = "N/A";
        }
    } catch (err) {
        console.error("Failed to fetch status:", err);
    }
}

updateStatus();
setInterval(updateStatus, 3000);
