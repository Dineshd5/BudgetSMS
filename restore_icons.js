const fs = require('fs');
const path = require('path');

// A simple 72x72 yellow PNG icon (base64)
const iconBase64 = "iVBORw0KGgoAAAANSUhEUgAAAEgAAABIAgMAAABt0f03AAAACVBMVEX/AAD//wAA//+9+wYAAAAAAnRSTlMAgJsrThgAAAA2SURBVDjLY2AYBaNgFIyCUTAKRsEoGAWjYBSMglEwCkbBKBgFo2AUjIJRMApGwSgYBaNgFMhAAAAwAAHg1ZJpAAAAAElFTkSuQmCC";

const buffer = Buffer.from(iconBase64, 'base64');

const densities = [
    "mipmap-mdpi",
    "mipmap-hdpi",
    "mipmap-xhdpi",
    "mipmap-xxhdpi",
    "mipmap-xxxhdpi"
];

const baseDir = path.join(__dirname, 'android', 'app', 'src', 'main', 'res');

densities.forEach(density => {
    const dir = path.join(baseDir, density);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(path.join(dir, 'ic_launcher.png'), buffer);
    fs.writeFileSync(path.join(dir, 'ic_launcher_round.png'), buffer);
    console.log(`Restored icons in ${density}`);
});
console.log("All icons restored.");
