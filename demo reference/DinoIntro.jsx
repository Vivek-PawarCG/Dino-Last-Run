import { useState, useEffect, useRef, useCallback } from "react";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const SLIDES = [
    { id: 0, label: "65,000,000 BC" },
    { id: 1, label: "The Sky Changed" },
    { id: 2, label: "They All Felt It" },
    { id: 3, label: "Run." },
];

const TOTAL_DURATION = 7200; // ms for full cinematic before auto-transition
const SLIDE_DURATION = 1800; // ms per slide

// ─── PIXEL ART CANVAS SCENES ─────────────────────────────────────────────────
function usePixelCanvas(canvasRef, scene, progress) {
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled = false;
        const W = canvas.width;
        const H = canvas.height;

        ctx.clearRect(0, 0, W, H);

        if (scene === 0) drawScene0(ctx, W, H, progress);
        else if (scene === 1) drawScene1(ctx, W, H, progress);
        else if (scene === 2) drawScene2(ctx, W, H, progress);
        else if (scene === 3) drawScene3(ctx, W, H, progress);
    }, [canvasRef, scene, progress]);
}

// Scene 0: Peaceful prehistoric world, meteor appears on horizon
function drawScene0(ctx, W, H, p) {
    // Sky gradient — peaceful dawn turning ominous
    const sky = ctx.createLinearGradient(0, 0, 0, H * 0.65);
    sky.addColorStop(0, interpolateColor("#1a0533", "#ff4400", p));
    sky.addColorStop(0.5, interpolateColor("#2d1b4e", "#cc2200", p));
    sky.addColorStop(1, interpolateColor("#4a2060", "#441100", p));
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H * 0.65);

    // Stars fading as meteor glow grows
    if (p < 0.6) {
        ctx.fillStyle = `rgba(255,255,255,${0.8 * (1 - p / 0.6)})`;
        const stars = [[40, 30], [120, 15], [200, 45], [350, 20], [500, 35], [620, 10], [700, 50], [760, 25]];
        stars.forEach(([x, y]) => {
            ctx.fillRect(x, y, 2, 2);
        });
    }

    // Meteor — starts small top-right, grows and glows
    const meteorX = W * 0.85 - p * W * 0.15;
    const meteorY = H * 0.08 + p * H * 0.15;
    const meteorSize = 4 + p * 20;
    const glowRadius = meteorSize * (3 + p * 4);

    // Glow
    const glow = ctx.createRadialGradient(meteorX, meteorY, 0, meteorX, meteorY, glowRadius);
    glow.addColorStop(0, `rgba(255,200,50,${0.9 * p})`);
    glow.addColorStop(0.3, `rgba(255,100,0,${0.6 * p})`);
    glow.addColorStop(1, "rgba(255,50,0,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(meteorX, meteorY, glowRadius, 0, Math.PI * 2);
    ctx.fill();

    // Meteor core (pixelated — draw as rect)
    ctx.fillStyle = "#fff5cc";
    ctx.fillRect(Math.round(meteorX - meteorSize / 2), Math.round(meteorY - meteorSize / 2), Math.round(meteorSize), Math.round(meteorSize));

    // Meteor trail
    ctx.fillStyle = `rgba(255,150,0,${0.7 * p})`;
    for (let i = 1; i <= 6; i++) {
        const tx = meteorX + i * 8;
        const ty = meteorY - i * 8;
        const ts = Math.max(1, meteorSize - i * 2);
        ctx.fillRect(Math.round(tx - ts / 2), Math.round(ty - ts / 2), Math.round(ts * 0.7), Math.round(ts * 0.7));
    }

    // Ground
    ctx.fillStyle = "#2d4a1e";
    ctx.fillRect(0, H * 0.65, W, H * 0.05);
    ctx.fillStyle = "#1a2e0f";
    ctx.fillRect(0, H * 0.70, W, H * 0.30);

    // Mountains (silhouette)
    ctx.fillStyle = "#1a2e0f";
    drawMountain(ctx, 0, H * 0.65, 180, 100);
    drawMountain(ctx, 150, H * 0.65, 220, 130);
    drawMountain(ctx, 500, H * 0.65, 160, 90);
    drawMountain(ctx, 620, H * 0.65, 200, 115);

    // Trees
    ctx.fillStyle = "#0d1f08";
    drawTree(ctx, 80, H * 0.65, 12, 35);
    drawTree(ctx, 110, H * 0.65, 10, 28);
    drawTree(ctx, 680, H * 0.65, 14, 40);
    drawTree(ctx, 720, H * 0.65, 11, 30);
}

// Scene 1: Closeup of sky — meteor dominates, red light everywhere
function drawScene1(ctx, W, H, p) {
    // Deep red sky
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, "#0a0005");
    sky.addColorStop(0.4, "#3d0a00");
    sky.addColorStop(1, "#660d00");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    // Massive meteor, center-ish
    const meteorX = W * 0.6;
    const meteorY = H * 0.25 + p * H * 0.05;
    const mSize = 28 + p * 10;

    // Outer glow rings
    for (let i = 5; i >= 0; i--) {
        const r = mSize * (2 + i * 1.2);
        const alpha = (0.12 - i * 0.015) * (0.6 + p * 0.4);
        const g = ctx.createRadialGradient(meteorX, meteorY, 0, meteorX, meteorY, r);
        g.addColorStop(0, `rgba(255,180,30,${alpha * 3})`);
        g.addColorStop(1, `rgba(255,50,0,0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(meteorX, meteorY, r, 0, Math.PI * 2);
        ctx.fill();
    }

    // Meteor core
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(Math.round(meteorX - mSize / 2), Math.round(meteorY - mSize / 2), mSize, mSize);
    ctx.fillStyle = "#ffeeaa";
    ctx.fillRect(Math.round(meteorX - mSize / 2 + 2), Math.round(meteorY - mSize / 2 + 2), mSize - 4, mSize - 4);

    // Debris trail
    const debrisColors = ["#ff8800", "#ff4400", "#ffaa00", "#ff6600"];
    for (let i = 0; i < 12; i++) {
        const dx = meteorX + (i + 1) * 10 + Math.sin(i * 2.3) * 5;
        const dy = meteorY - (i + 1) * 10 + Math.cos(i * 1.7) * 4;
        const ds = Math.max(2, mSize * 0.7 - i * 3);
        ctx.fillStyle = debrisColors[i % 4];
        ctx.fillRect(Math.round(dx - ds / 2), Math.round(dy - ds / 2), Math.round(ds), Math.round(ds));
    }

    // Ground silhouette
    ctx.fillStyle = "#0a0005";
    ctx.fillRect(0, H * 0.78, W, H * 0.22);
    drawMountain(ctx, -20, H * 0.78, 250, 150);
    drawMountain(ctx, 300, H * 0.78, 180, 110);
    drawMountain(ctx, 550, H * 0.78, 280, 170);

    // Red light reflection on ground
    const refGlow = ctx.createLinearGradient(0, H * 0.70, 0, H * 0.78);
    refGlow.addColorStop(0, `rgba(180,40,0,${0.4 * p})`);
    refGlow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = refGlow;
    ctx.fillRect(0, H * 0.70, W, H * 0.08);
}

// Scene 2: Panoramic shot — ALL dinos terrified, looking up
function drawScene2(ctx, W, H, p) {
    // Sky — deep red orange dusk of doom
    const sky = ctx.createLinearGradient(0, 0, 0, H * 0.7);
    sky.addColorStop(0, "#1a0000");
    sky.addColorStop(0.3, "#550800");
    sky.addColorStop(0.7, "#992200");
    sky.addColorStop(1, "#cc4400");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H * 0.7);

    // Meteor (small, high up, establishing)
    const mX = W * 0.75;
    const mY = H * 0.08;
    const glow = ctx.createRadialGradient(mX, mY, 0, mX, mY, 80);
    glow.addColorStop(0, "rgba(255,200,50,0.9)");
    glow.addColorStop(0.4, "rgba(255,80,0,0.5)");
    glow.addColorStop(1, "rgba(255,0,0,0)");
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(mX, mY, 80, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.fillRect(mX - 6, mY - 6, 12, 12);

    // Ground
    ctx.fillStyle = "#1a0a00";
    ctx.fillRect(0, H * 0.70, W, H * 0.30);
    ctx.fillStyle = "#2a1200";
    ctx.fillRect(0, H * 0.70, W, H * 0.04);

    // Ground detail
    ctx.fillStyle = "#3a1a00";
    for (let x = 0; x < W; x += 40) {
        ctx.fillRect(x, H * 0.71, 20, 2);
    }

    // DINO 1: Small raptor, left — crouching, trembling (bob animation)
    const bob = Math.sin(Date.now() * 0.008) * 2;
    drawRaptor(ctx, W * 0.12, H * 0.70 + bob, 0.6, p, "scared");

    // DINO 2: Triceratops, center-left — rearing back
    drawTriceratops(ctx, W * 0.32, H * 0.70, 0.9, p);

    // DINO 3: OUR T-REX, center — largest, most prominent, looking up, then starts turning
    const trexTurn = Math.min(1, p * 2); // starts turning right at p=0.5
    drawTRex(ctx, W * 0.52, H * 0.70, 1.1, p, trexTurn);

    // DINO 4: Stegosaurus, right
    drawStego(ctx, W * 0.72, H * 0.70, 0.8, p);

    // DINO 5: Small dino, far right — already running!
    const runOffset = p * 30;
    drawSmallDino(ctx, W * 0.88 + runOffset, H * 0.70, 0.5, p);

    // Dust particles from scared dinos
    ctx.fillStyle = `rgba(180,120,60,${0.4 * p})`;
    for (let i = 0; i < 8; i++) {
        const px = (W * 0.1 + i * 90 + Math.sin(i + p * 5) * 15) % W;
        const py = H * 0.68 + Math.cos(i * 2) * 8;
        ctx.beginPath();
        ctx.arc(px, py, 3 + i % 3, 0, Math.PI * 2);
        ctx.fill();
    }

    // Shockwave ripple effect across ground at high p
    if (p > 0.6) {
        const rippleAlpha = (p - 0.6) / 0.4;
        ctx.strokeStyle = `rgba(255,100,0,${rippleAlpha * 0.6})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(W * 0.75, H * 0.70, 60 * rippleAlpha * 3, 12 * rippleAlpha, 0, 0, Math.PI * 2);
        ctx.stroke();
    }
}

// Scene 3: T-Rex turns, eyes wide, starts RUNNING — transitions into game
function drawScene3(ctx, W, H, p) {
    // Sky transitioning to game-sky (lighter)
    const skyColor = interpolateColor("#330800", "#87CEEB", p);
    const sky = ctx.createLinearGradient(0, 0, 0, H * 0.7);
    sky.addColorStop(0, interpolateColor("#1a0000", "#5ba3c9", p));
    sky.addColorStop(1, skyColor);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H * 0.7);

    // Ground transitioning from dark red to game-tan
    ctx.fillStyle = interpolateColor("#1a0a00", "#d4b896", p);
    ctx.fillRect(0, H * 0.70, W, H * 0.30);

    // Ground line
    ctx.fillStyle = interpolateColor("#3a1a00", "#8B7355", p);
    ctx.fillRect(0, H * 0.70, W, 3);

    // Scrolling ground texture appearing
    if (p > 0.4) {
        const groundP = (p - 0.4) / 0.6;
        ctx.fillStyle = `rgba(100,80,40,${0.3 * groundP})`;
        for (let x = 0; x < W; x += 120) {
            ctx.fillRect(x, H * 0.71, 60, 2);
        }
    }

    // Meteor receding / sky clearing
    if (p < 0.5) {
        const mX = W * 0.8;
        const mY = H * 0.1;
        const g = ctx.createRadialGradient(mX, mY, 0, mX, mY, 50 * (1 - p * 2));
        g.addColorStop(0, `rgba(255,150,0,${0.8 * (1 - p * 2)})`);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(mX, mY, 50 * (1 - p * 2), 0, Math.PI * 2); ctx.fill();
    }

    // T-Rex running — x position moves from center to left-game-position
    const trexX = W * 0.5 - p * W * 0.3;
    const trexY = H * 0.70;
    const trexScale = 1.1 + p * 0.1; // slight zoom

    // Running animation
    const runFrame = Math.floor(Date.now() / 100) % 4;
    drawRunningTRex(ctx, trexX, trexY, trexScale, runFrame, p);

    // Speed lines when running fast
    if (p > 0.5) {
        const lineAlpha = (p - 0.5) * 2;
        ctx.strokeStyle = `rgba(255,255,255,${lineAlpha * 0.5})`;
        ctx.lineWidth = 1;
        for (let i = 0; i < 6; i++) {
            const ly = trexY - 30 - i * 15;
            const lx = trexX + 30 + i * 5;
            ctx.beginPath();
            ctx.moveTo(lx, ly);
            ctx.lineTo(lx + 40 + i * 10, ly);
            ctx.stroke();
        }
    }

    // Cacti appearing from right (game world loading in)
    if (p > 0.7) {
        const cactusAlpha = (p - 0.7) / 0.3;
        ctx.globalAlpha = cactusAlpha;
        drawCactus(ctx, W * 0.85, H * 0.70, 1);
        drawCactus(ctx, W * 0.95, H * 0.70, 0.8);
        ctx.globalAlpha = 1;
    }

    // White flash at end for seamless transition
    if (p > 0.88) {
        const flashAlpha = (p - 0.88) / 0.12;
        ctx.fillStyle = `rgba(255,255,255,${flashAlpha})`;
        ctx.fillRect(0, 0, W, H);
    }
}

// ─── SPRITE DRAWING HELPERS ───────────────────────────────────────────────────

function drawMountain(ctx, x, baseY, width, height) {
    ctx.beginPath();
    ctx.moveTo(x, baseY);
    ctx.lineTo(x + width / 2, baseY - height);
    ctx.lineTo(x + width, baseY);
    ctx.closePath();
    ctx.fill();
}

function drawTree(ctx, x, baseY, trunkW, height) {
    // Trunk
    ctx.fillRect(x - trunkW / 2, baseY - height * 0.4, trunkW, height * 0.4);
    // Canopy
    ctx.beginPath();
    ctx.moveTo(x, baseY - height);
    ctx.lineTo(x - trunkW * 2.5, baseY - height * 0.4);
    ctx.lineTo(x + trunkW * 2.5, baseY - height * 0.4);
    ctx.closePath();
    ctx.fill();
}

function drawRaptor(ctx, x, y, scale, p, mood) {
    const s = scale * 24;
    // Body
    ctx.fillStyle = "#4a7a3a";
    ctx.fillRect(x - s * 0.6, y - s * 1.2, s * 1.2, s * 0.8);
    // Head (tilted up — scared)
    ctx.fillStyle = "#5a8a4a";
    ctx.fillRect(x - s * 0.1, y - s * 2.0, s * 0.7, s * 0.6);
    // Eye (wide open)
    ctx.fillStyle = "#fff";
    ctx.fillRect(x + s * 0.3, y - s * 1.9, s * 0.2, s * 0.2);
    ctx.fillStyle = "#000";
    ctx.fillRect(x + s * 0.35, y - s * 1.88, s * 0.12, s * 0.12);
    // Legs
    ctx.fillStyle = "#3a6a2a";
    ctx.fillRect(x - s * 0.3, y - s * 0.4, s * 0.25, s * 0.4);
    ctx.fillRect(x + s * 0.1, y - s * 0.4, s * 0.25, s * 0.4);
    // Tail
    ctx.fillRect(x - s, y - s * 1.0, s * 0.5, s * 0.2);
    // Trembling sweat drop
    if (mood === "scared") {
        ctx.fillStyle = "#aaddff";
        ctx.fillRect(x + s * 0.6, y - s * 1.7, s * 0.1, s * 0.2);
    }
}

function drawTriceratops(ctx, x, y, scale, p) {
    const s = scale * 30;
    // Body (large)
    ctx.fillStyle = "#6b5a3a";
    ctx.fillRect(x - s * 0.9, y - s * 1.0, s * 1.8, s * 0.9);
    // Head with frill
    ctx.fillStyle = "#7a6a4a";
    ctx.fillRect(x + s * 0.5, y - s * 1.3, s * 0.9, s * 0.7);
    // Frill
    ctx.fillStyle = "#8a3a2a";
    ctx.fillRect(x + s * 0.6, y - s * 1.8, s * 0.8, s * 0.6);
    // Horns
    ctx.fillStyle = "#c8b878";
    ctx.fillRect(x + s * 1.1, y - s * 1.35, s * 0.1, s * 0.4);
    ctx.fillRect(x + s * 0.85, y - s * 1.35, s * 0.1, s * 0.35);
    // Eye
    ctx.fillStyle = "#fff";
    ctx.fillRect(x + s * 0.75, y - s * 1.15, s * 0.15, s * 0.15);
    ctx.fillStyle = "#000";
    ctx.fillRect(x + s * 0.78, y - s * 1.13, s * 0.08, s * 0.08);
    // Legs
    ctx.fillStyle = "#5a4a2a";
    for (let i = 0; i < 4; i++) {
        ctx.fillRect(x - s * 0.7 + i * s * 0.45, y - s * 0.1, s * 0.25, s * 0.3);
    }
    // Tail
    ctx.fillRect(x - s * 1.3, y - s * 0.8, s * 0.5, s * 0.2);
}

function drawTRex(ctx, x, y, scale, p, turnProgress) {
    const s = scale * 36;
    // Main body
    ctx.fillStyle = "#5a6e3a";
    ctx.fillRect(x - s * 0.5, y - s * 1.4, s * 1.0, s * 1.0);
    // Head — facing mostly right, but tilted up (scared)
    ctx.fillStyle = "#6a7e4a";
    const headY = y - s * 2.0 - Math.sin(p * Math.PI) * s * 0.2; // looks up then forward
    ctx.fillRect(x - s * 0.1, headY, s * 0.9, s * 0.65);
    // Eye — WIDE open, scared
    ctx.fillStyle = "#fff";
    ctx.fillRect(x + s * 0.35, headY + s * 0.1, s * 0.25, s * 0.25);
    ctx.fillStyle = "#000";
    ctx.fillRect(x + s * 0.38, headY + s * 0.12, s * 0.15, s * 0.15);
    // Pupil dilated (scared)
    ctx.fillStyle = "#fff";
    ctx.fillRect(x + s * 0.44, headY + s * 0.15, s * 0.05, s * 0.05);
    // Teeth showing (scared grimace)
    ctx.fillStyle = "#fff";
    ctx.fillRect(x + s * 0.2, headY + s * 0.55, s * 0.6, s * 0.08);
    ctx.fillStyle = "#6a7e4a";
    for (let i = 0; i < 4; i++) {
        ctx.fillRect(x + s * 0.22 + i * s * 0.13, headY + s * 0.55, s * 0.06, s * 0.08);
    }
    // Small arms (iconic)
    ctx.fillStyle = "#4a5e2a";
    ctx.fillRect(x + s * 0.3, y - s * 1.1, s * 0.25, s * 0.15);
    ctx.fillRect(x + s * 0.5, y - s * 1.0, s * 0.15, s * 0.12);
    // Tail
    ctx.fillStyle = "#5a6e3a";
    ctx.fillRect(x - s, y - s * 1.1, s * 0.6, s * 0.25);
    ctx.fillRect(x - s * 1.3, y - s * 0.9, s * 0.4, s * 0.18);
    // Legs
    ctx.fillStyle = "#4a5e2a";
    ctx.fillRect(x - s * 0.25, y - s * 0.45, s * 0.35, s * 0.5);
    ctx.fillRect(x + s * 0.1, y - s * 0.45, s * 0.35, s * 0.5);
    // Sweat drops — very scared
    ctx.fillStyle = "#aaddff";
    ctx.fillRect(x + s * 0.7, headY + s * 0.05, s * 0.06, s * 0.18);
    ctx.fillRect(x + s * 0.75, headY - s * 0.05, s * 0.05, s * 0.14);
    // STAR highlight — this is OUR hero (subtle glow)
    const heroGlow = ctx.createRadialGradient(x + s * 0.3, headY + s * 0.3, 0, x + s * 0.3, headY + s * 0.3, s * 0.8);
    heroGlow.addColorStop(0, "rgba(255,255,200,0.15)");
    heroGlow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = heroGlow;
    ctx.beginPath();
    ctx.arc(x + s * 0.3, headY + s * 0.3, s * 0.8, 0, Math.PI * 2);
    ctx.fill();
}

function drawStego(ctx, x, y, scale, p) {
    const s = scale * 28;
    // Body
    ctx.fillStyle = "#4a6a5a";
    ctx.fillRect(x - s * 0.8, y - s * 0.9, s * 1.6, s * 0.8);
    // Plates on back
    ctx.fillStyle = "#ff6633";
    for (let i = 0; i < 5; i++) {
        const px = x - s * 0.5 + i * s * 0.28;
        const ph = s * (0.3 + (i % 2) * 0.2);
        ctx.fillRect(px, y - s * 0.9 - ph, s * 0.12, ph);
    }
    // Head
    ctx.fillStyle = "#5a7a6a";
    ctx.fillRect(x + s * 0.7, y - s * 1.0, s * 0.5, s * 0.4);
    // Eye
    ctx.fillStyle = "#fff";
    ctx.fillRect(x + s * 0.85, y - s * 0.95, s * 0.12, s * 0.12);
    ctx.fillStyle = "#000";
    ctx.fillRect(x + s * 0.87, y - s * 0.93, s * 0.07, s * 0.07);
    // Legs
    ctx.fillStyle = "#3a5a4a";
    for (let i = 0; i < 4; i++) {
        ctx.fillRect(x - s * 0.6 + i * s * 0.38, y - s * 0.1, s * 0.22, s * 0.28);
    }
    // Tail with spikes
    ctx.fillStyle = "#4a6a5a";
    ctx.fillRect(x - s * 1.3, y - s * 0.6, s * 0.6, s * 0.2);
    ctx.fillStyle = "#ff8844";
    ctx.fillRect(x - s * 1.35, y - s * 0.65, s * 0.1, s * 0.12);
    ctx.fillRect(x - s * 1.5, y - s * 0.62, s * 0.1, s * 0.12);
}

function drawSmallDino(ctx, x, y, scale, p) {
    const s = scale * 20;
    const runBob = Math.sin(Date.now() * 0.015) * 3;
    // Body
    ctx.fillStyle = "#7a4a3a";
    ctx.fillRect(x - s * 0.4, y - s * 1.0 + runBob, s * 0.8, s * 0.6);
    // Head
    ctx.fillStyle = "#8a5a4a";
    ctx.fillRect(x + s * 0.1, y - s * 1.5 + runBob, s * 0.5, s * 0.4);
    // Eye
    ctx.fillStyle = "#fff";
    ctx.fillRect(x + s * 0.35, y - s * 1.45 + runBob, s * 0.12, s * 0.12);
    ctx.fillStyle = "#000";
    ctx.fillRect(x + s * 0.37, y - s * 1.43 + runBob, s * 0.07, s * 0.07);
    // Legs running
    const legAngle = Math.sin(Date.now() * 0.02);
    ctx.fillStyle = "#6a3a2a";
    ctx.fillRect(x - s * 0.1 + legAngle * 4, y - s * 0.4 + runBob, s * 0.2, s * 0.4);
    ctx.fillRect(x + s * 0.1 - legAngle * 4, y - s * 0.4 + runBob, s * 0.2, s * 0.4);
    // Tail
    ctx.fillRect(x - s * 0.7, y - s * 0.8 + runBob, s * 0.4, s * 0.15);
}

function drawRunningTRex(ctx, x, y, scale, frame, p) {
    const s = scale * 36;
    const runBob = frame % 2 === 0 ? 0 : -3;
    const legSwing = frame < 2 ? 1 : -1;

    // Shadow
    ctx.fillStyle = `rgba(0,0,0,${0.3 * (1 - p * 0.5)})`;
    ctx.beginPath();
    ctx.ellipse(x, y + 2, s * 0.6, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = "#5a6e3a";
    ctx.fillRect(x - s * 0.5, y - s * 1.4 + runBob, s * 1.0, s * 1.0);
    // Head — facing RIGHT (running)
    ctx.fillStyle = "#6a7e4a";
    ctx.fillRect(x + s * 0.2, y - s * 2.0 + runBob, s * 0.85, s * 0.6);
    // Eye determined / panicked
    ctx.fillStyle = "#fff";
    ctx.fillRect(x + s * 0.65, y - s * 1.95 + runBob, s * 0.22, s * 0.22);
    ctx.fillStyle = "#000";
    ctx.fillRect(x + s * 0.7, y - s * 1.93 + runBob, s * 0.14, s * 0.14);
    // White highlight
    ctx.fillStyle = "#fff";
    ctx.fillRect(x + s * 0.75, y - s * 1.90 + runBob, s * 0.05, s * 0.05);
    // Jaw open (panting while running)
    ctx.fillStyle = "#4a5e2a";
    ctx.fillRect(x + s * 0.25, y - s * 1.48 + runBob, s * 0.7, s * 0.12);
    // Teeth
    ctx.fillStyle = "#fff";
    for (let i = 0; i < 3; i++) {
        ctx.fillRect(x + s * 0.3 + i * s * 0.15, y - s * 1.48 + runBob, s * 0.08, s * 0.1);
    }
    // Arms (small, tucked running)
    ctx.fillStyle = "#4a5e2a";
    ctx.fillRect(x + s * 0.4, y - s * 1.05 + runBob, s * 0.2, s * 0.12);
    // Tail (counterbalance)
    ctx.fillStyle = "#5a6e3a";
    ctx.fillRect(x - s * 1.0, y - s * 1.05 + runBob, s * 0.6, s * 0.22);
    ctx.fillRect(x - s * 1.35, y - s * 0.88 + runBob, s * 0.4, s * 0.16);
    // Legs — animated running
    ctx.fillStyle = "#4a5e2a";
    ctx.fillRect(x - s * 0.3, y - s * 0.45 + runBob + legSwing * 6, s * 0.32, s * 0.5);
    ctx.fillRect(x + s * 0.05, y - s * 0.45 + runBob - legSwing * 6, s * 0.32, s * 0.5);
    // Feet
    ctx.fillStyle = "#3a4e2a";
    ctx.fillRect(x - s * 0.35, y - s * 0.0 + runBob + legSwing * 6, s * 0.4, s * 0.12);
    ctx.fillRect(x + s * 0.0, y - s * 0.0 + runBob - legSwing * 6, s * 0.4, s * 0.12);

    // Motion dust
    if (p > 0.2) {
        ctx.fillStyle = `rgba(200,180,140,${0.6 * p})`;
        for (let i = 0; i < 3; i++) {
            const dx = x - s * 0.5 - i * 12 - Math.random() * 5;
            const dy = y - 4 + Math.random() * 8;
            const ds = 4 + i * 3;
            ctx.beginPath();
            ctx.arc(dx, dy, ds, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

function drawCactus(ctx, x, y, scale) {
    const s = scale * 20;
    ctx.fillStyle = "#2d5a1b";
    // Main trunk
    ctx.fillRect(x - s * 0.15, y - s * 2.2, s * 0.3, s * 2.2);
    // Left arm
    ctx.fillRect(x - s * 0.5, y - s * 1.6, s * 0.35, s * 0.2);
    ctx.fillRect(x - s * 0.5, y - s * 2.0, s * 0.2, s * 0.4);
    // Right arm
    ctx.fillRect(x + s * 0.15, y - s * 1.3, s * 0.35, s * 0.2);
    ctx.fillRect(x + s * 0.3, y - s * 1.6, s * 0.2, s * 0.3);
}

// ─── COLOR INTERPOLATION ─────────────────────────────────────────────────────
function interpolateColor(color1, color2, t) {
    const parse = (c) => {
        const r = parseInt(c.slice(1, 3), 16);
        const g = parseInt(c.slice(3, 5), 16);
        const b = parseInt(c.slice(5, 7), 16);
        return [r, g, b];
    };
    const [r1, g1, b1] = parse(color1);
    const [r2, g2, b2] = parse(color2);
    const r = Math.round(r1 + (r2 - r1) * t);
    const g = Math.round(g1 + (g2 - g1) * t);
    const b = Math.round(b1 + (b2 - b1) * t);
    return `rgb(${r},${g},${b})`;
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function DinoIntro({ onComplete }) {
    const canvasRef = useRef(null);
    const animFrameRef = useRef(null);
    const startTimeRef = useRef(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [slideProgress, setSlideProgress] = useState(0);
    const [phase, setPhase] = useState("intro"); // intro | transitioning | done
    const [skipVisible, setSkipVisible] = useState(true);
    const [titleVisible, setTitleVisible] = useState(false);

    // Animate canvas
    const animate = useCallback((timestamp) => {
        if (!startTimeRef.current) startTimeRef.current = timestamp;
        const elapsed = timestamp - startTimeRef.current;
        const totalProgress = Math.min(elapsed / TOTAL_DURATION, 1);
        const slideIndex = Math.min(Math.floor(elapsed / SLIDE_DURATION), 3);
        const slideElapsed = elapsed - slideIndex * SLIDE_DURATION;
        const sProgress = Math.min(slideElapsed / SLIDE_DURATION, 1);

        setCurrentSlide(slideIndex);
        setSlideProgress(sProgress);

        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext("2d");
            ctx.imageSmoothingEnabled = false;
            const W = canvas.width;
            const H = canvas.height;
            ctx.clearRect(0, 0, W, H);

            if (slideIndex === 0) drawScene0(ctx, W, H, sProgress);
            else if (slideIndex === 1) drawScene1(ctx, W, H, sProgress);
            else if (slideIndex === 2) drawScene2(ctx, W, H, sProgress);
            else if (slideIndex === 3) drawScene3(ctx, W, H, sProgress);

            // Slide transition flash
            if (slideIndex < 3) {
                const flashZone = 0.15;
                let flashAlpha = 0;
                if (sProgress > 1 - flashZone) {
                    flashAlpha = (sProgress - (1 - flashZone)) / flashZone;
                } else if (sProgress < flashZone && slideIndex > 0) {
                    flashAlpha = 1 - sProgress / flashZone;
                }
                if (flashAlpha > 0) {
                    ctx.fillStyle = `rgba(255,60,0,${flashAlpha * 0.7})`;
                    ctx.fillRect(0, 0, W, H);
                }
            }
        }

        if (slideIndex === 3 && sProgress > 0.4) setTitleVisible(true);

        if (totalProgress >= 1) {
            setPhase("done");
            setTimeout(() => onComplete?.(), 300);
            return;
        }

        animFrameRef.current = requestAnimationFrame(animate);
    }, [onComplete]);

    useEffect(() => {
        animFrameRef.current = requestAnimationFrame(animate);
        const skipTimer = setTimeout(() => setSkipVisible(true), 800);
        return () => {
            cancelAnimationFrame(animFrameRef.current);
            clearTimeout(skipTimer);
        };
    }, [animate]);

    const handleSkip = () => {
        cancelAnimationFrame(animFrameRef.current);
        setPhase("done");
        onComplete?.();
    };

    const slideLabels = [
        "65,000,000 BC",
        "The Sky Changed",
        "They All Felt It",
        "Run.",
    ];

    const slideSubtitles = [
        "A normal day. Or so they thought.",
        "Something was wrong with the light.",
        "Every creature on Earth looked up.",
        "Rex didn't wait to find out why.",
    ];

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                background: "#000",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'Courier New', monospace",
                overflow: "hidden",
                userSelect: "none",
            }}
        >
            {/* Canvas */}
            <div
                style={{
                    position: "relative",
                    width: "100%",
                    maxWidth: 800,
                    aspectRatio: "800 / 360",
                    border: "3px solid #333",
                    boxShadow: "0 0 60px rgba(255,80,0,0.3)",
                }}
            >
                <canvas
                    ref={canvasRef}
                    width={800}
                    height={360}
                    style={{
                        width: "100%",
                        height: "100%",
                        imageRendering: "pixelated",
                        display: "block",
                    }}
                />

                {/* Slide label — top left */}
                <div
                    key={currentSlide}
                    style={{
                        position: "absolute",
                        top: 16,
                        left: 20,
                        color: "rgba(255,220,150,0.9)",
                        fontSize: "clamp(9px, 1.5vw, 13px)",
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        animation: "fadeSlideIn 0.5s ease forwards",
                    }}
                >
                    {slideLabels[currentSlide]}
                </div>

                {/* Subtitle — bottom */}
                <div
                    key={`sub-${currentSlide}`}
                    style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: "14px 24px",
                        background: "linear-gradient(transparent, rgba(0,0,0,0.85))",
                        color: currentSlide === 3 ? "#ff6633" : "rgba(255,255,255,0.85)",
                        fontSize: "clamp(11px, 1.8vw, 15px)",
                        fontStyle: currentSlide === 3 ? "normal" : "italic",
                        fontWeight: currentSlide === 3 ? "700" : "400",
                        letterSpacing: currentSlide === 3 ? "0.15em" : "0.05em",
                        animation: "fadeSlideIn 0.6s ease forwards",
                    }}
                >
                    {slideSubtitles[currentSlide]}
                </div>

                {/* Slide dots */}
                <div
                    style={{
                        position: "absolute",
                        top: 16,
                        right: 20,
                        display: "flex",
                        gap: 6,
                        alignItems: "center",
                    }}
                >
                    {slideLabels.map((_, i) => (
                        <div
                            key={i}
                            style={{
                                width: i === currentSlide ? 18 : 6,
                                height: 6,
                                borderRadius: 3,
                                background: i === currentSlide
                                    ? "#ff6633"
                                    : i < currentSlide
                                        ? "rgba(255,102,51,0.4)"
                                        : "rgba(255,255,255,0.2)",
                                transition: "all 0.4s ease",
                            }}
                        />
                    ))}
                </div>

                {/* Scanline overlay for cinematic feel */}
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)",
                        pointerEvents: "none",
                    }}
                />

                {/* Vignette */}
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.7) 100%)",
                        pointerEvents: "none",
                    }}
                />
            </div>

            {/* Game title — appears in last slide */}
            <div
                style={{
                    marginTop: 24,
                    height: 50,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                {titleVisible && (
                    <div
                        style={{
                            textAlign: "center",
                            animation: "titleReveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
                        }}
                    >
                        <div
                            style={{
                                color: "#ff6633",
                                fontSize: "clamp(18px, 3.5vw, 28px)",
                                fontWeight: "900",
                                letterSpacing: "0.3em",
                                textTransform: "uppercase",
                                textShadow: "0 0 20px rgba(255,100,50,0.6)",
                            }}
                        >
                            DINO: LAST RUN
                        </div>
                        <div
                            style={{
                                color: "rgba(255,200,150,0.6)",
                                fontSize: "clamp(8px, 1.2vw, 11px)",
                                letterSpacing: "0.5em",
                                marginTop: 4,
                            }}
                        >
                            NO DINOSAUR WAS READY
                        </div>
                    </div>
                )}
            </div>

            {/* Progress bar */}
            <div
                style={{
                    width: "100%",
                    maxWidth: 800,
                    height: 2,
                    background: "rgba(255,255,255,0.08)",
                    marginTop: 12,
                    borderRadius: 1,
                    overflow: "hidden",
                }}
            >
                <div
                    style={{
                        height: "100%",
                        width: `${(currentSlide / 3 + slideProgress / 3) * 100}%`,
                        background: "linear-gradient(90deg, #ff4400, #ff9900)",
                        transition: "width 0.1s linear",
                        borderRadius: 1,
                    }}
                />
            </div>

            {/* Skip button */}
            {skipVisible && phase !== "done" && (
                <button
                    onClick={handleSkip}
                    style={{
                        position: "fixed",
                        bottom: 28,
                        right: 28,
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.18)",
                        color: "rgba(255,255,255,0.55)",
                        padding: "8px 18px",
                        fontSize: 11,
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        cursor: "pointer",
                        borderRadius: 3,
                        transition: "all 0.2s",
                        fontFamily: "inherit",
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.background = "rgba(255,102,51,0.2)";
                        e.target.style.color = "#ff6633";
                        e.target.style.borderColor = "#ff6633";
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = "rgba(255,255,255,0.06)";
                        e.target.style.color = "rgba(255,255,255,0.55)";
                        e.target.style.borderColor = "rgba(255,255,255,0.18)";
                    }}
                    aria-label="Skip intro cinematic"
                >
                    Skip ▶
                </button>
            )}

            {/* CSS animations */}
            <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes titleReveal {
          from { opacity: 0; transform: scale(0.92) translateY(10px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
        </div>
    );
}
