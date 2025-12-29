import { Variable } from "astal";

// Poller para RAM
export const ram = Variable({ text: "...", percent: 0, used: 0, total: 0 }).poll(5000, ["bash", "-c", "LC_ALL=C free -m"], (out) => {
    const lines = out.split("\n");
    const memLine = lines.find(l => l.includes("Mem:"));
    if (!memLine) return { text: "Err", percent: 0, used: 0, total: 0 };

    // Formato: Mem: total used free shared buff/cache available
    // awk style parsing
    const parts = memLine.split(/\s+/).filter(Boolean);
    const total = parseInt(parts[1]);
    const used = parseInt(parts[2]);
    const percent = Math.round((used / total) * 100);

    const usedGb = (used / 1024).toFixed(1) + "G";
    const totalGb = (total / 1024).toFixed(0) + "G";

    return {
        text: `${usedGb} / ${totalGb}`,
        percent,
        used,
        total
    };
});

// Poller para CPU
export const cpu = Variable(0).poll(3000, ["bash", "-c", "LC_ALL=C top -bn1"], (out) => {
    // top output parsing es complejo en una linea, usamos /proc/stat mejor si fuera directo,
    // pero grep al top es común: grep "Cpu(s)"
    // Hacemos el grep aqui en JS o command
    const lines = out.split("\n");
    const cpuLine = lines.find(l => l.includes("Cpu(s)"));
    if (!cpuLine) return 0;

    // %Cpu(s): 5.9 us, 1.2 sy ...
    const parts = cpuLine.split(/\s+/);
    // index 1 suele ser us user
    const user = parseFloat(parts[1]);
    const sys = parseFloat(parts[3]);
    return Math.round(user + sys);
});

// Poller para GPU (Nvidia simple fallback)
// Requiere nvidia-smi. Si no, devuelve N/A
export const gpu = Variable({ name: "GPU", util: 0 }).poll(5000, "bash -c 'if command -v nvidia-smi >/dev/null; then nvidia-smi --query-gpu=utilization.gpu --format=csv,noheader,nounits; else echo 0; fi'", (out) => {
    const usage = parseInt(out.trim());
    return { name: "Nvidia GPU", util: isNaN(usage) ? 0 : usage };
});
