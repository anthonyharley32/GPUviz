const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Function to generate PCB normal map
function generatePCBNormalMap() {
    const width = 512;
    const height = 512;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Fill with base normal (128, 128, 255) - flat surface
    ctx.fillStyle = '#8080ff';
    ctx.fillRect(0, 0, width, height);

    // Create circuit-like patterns
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#c0c0ff'; // Slightly raised lines

    // Horizontal and vertical lines
    for (let i = 0; i < width; i += 32) {
        // Horizontal lines
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
        ctx.stroke();

        // Vertical lines
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
    }

    // Add some circuit components
    for (let i = 0; i < 20; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = 16 + Math.random() * 16;

        ctx.fillStyle = '#a0a0ff'; // Slightly more raised
        ctx.fillRect(x - size/2, y - size/2, size, size);
    }

    return canvas;
}

// Function to generate shroud normal map
function generateShroudNormalMap() {
    const width = 512;
    const height = 512;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Fill with base normal (128, 128, 255) - flat surface
    ctx.fillStyle = '#8080ff';
    ctx.fillRect(0, 0, width, height);

    // Create brushed metal effect
    ctx.strokeStyle = '#9090ff';
    ctx.lineWidth = 1;

    // Draw diagonal lines for brushed effect
    for (let i = -height; i < width + height; i += 4) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + height, height);
        ctx.stroke();
    }

    return canvas;
}

// Ensure the textures directory exists
const texturesDir = path.join(__dirname, '../public/textures');
if (!fs.existsSync(texturesDir)) {
    fs.mkdirSync(texturesDir, { recursive: true });
}

// Generate and save PCB normal map
const pcbCanvas = generatePCBNormalMap();
const pcbOut = fs.createWriteStream(path.join(texturesDir, 'pcb-normal.png'));
const pcbStream = pcbCanvas.createPNGStream();
pcbStream.pipe(pcbOut);

// Generate and save shroud normal map
const shroudCanvas = generateShroudNormalMap();
const shroudOut = fs.createWriteStream(path.join(texturesDir, 'shroud-normal.png'));
const shroudStream = shroudCanvas.createPNGStream();
shroudStream.pipe(shroudOut);

console.log('Textures generated successfully!'); 