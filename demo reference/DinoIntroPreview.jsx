import { useState, useEffect, useRef, useCallback } from "react";

// ─── PIXEL SPRITE HELPERS ─────────────────────────────────────────────────────
function interpolateColor(c1, c2, t) {
    const p = (c) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
    const [r1, g1, b1] = p(c1), [r2, g2, b2] = p(c2);
    return `rgb(${Math.round(r1 + (r2 - r1) * t)},${Math.round(g1 + (g2 - g1) * t)},${Math.round(b1 + (b2 - b1) * t)})`;
}
function drawMountain(ctx, x, bY, w, h) { ctx.beginPath(); ctx.moveTo(x, bY); ctx.lineTo(x + w / 2, bY - h); ctx.lineTo(x + w, bY); ctx.closePath(); ctx.fill(); }
function drawTree(ctx, x, bY, tw, h) { ctx.fillRect(x - tw / 2, bY - h * 0.4, tw, h * 0.4); ctx.beginPath(); ctx.moveTo(x, bY - h); ctx.lineTo(x - tw * 2.5, bY - h * 0.4); ctx.lineTo(x + tw * 2.5, bY - h * 0.4); ctx.closePath(); ctx.fill(); }
function drawCactus(ctx, x, y, scale) { const s = scale * 20; ctx.fillStyle = "#2d5a1b"; ctx.fillRect(x - s * .15, y - s * 2.2, s * .3, s * 2.2); ctx.fillRect(x - s * .5, y - s * 1.6, s * .35, s * .2); ctx.fillRect(x - s * .5, y - s * 2, s * .2, s * .4); ctx.fillRect(x + s * .15, y - s * 1.3, s * .35, s * .2); ctx.fillRect(x + s * .3, y - s * 1.6, s * .2, s * .3); }

function drawScene0(ctx, W, H, p) {
    const sky = ctx.createLinearGradient(0, 0, 0, H * 0.65);
    sky.addColorStop(0, interpolateColor("#1a0533", "#ff4400", p));
    sky.addColorStop(0.5, interpolateColor("#2d1b4e", "#cc2200", p));
    sky.addColorStop(1, interpolateColor("#4a2060", "#441100", p));
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H * 0.65);
    if (p < 0.6) {
        ctx.fillStyle = `rgba(255,255,255,${0.8 * (1 - p / 0.6)})`;
        [[40, 30], [120, 15], [200, 45], [350, 20], [500, 35], [620, 10], [700, 50], [760, 25]].forEach(([x, y]) => ctx.fillRect(x, y, 2, 2));
    }
    const mX = W * .85 - p * W * .15, mY = H * .08 + p * H * .15, mS = 4 + p * 20, gR = mS * (3 + p * 4);
    const glow = ctx.createRadialGradient(mX, mY, 0, mX, mY, gR);
    glow.addColorStop(0, `rgba(255,200,50,${0.9 * p})`); glow.addColorStop(0.3, `rgba(255,100,0,${0.6 * p})`); glow.addColorStop(1, "rgba(255,50,0,0)");
    ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(mX, mY, gR, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#fff5cc"; ctx.fillRect(Math.round(mX - mS / 2), Math.round(mY - mS / 2), Math.round(mS), Math.round(mS));
    ctx.fillStyle = `rgba(255,150,0,${0.7 * p})`;
    for (let i = 1; i <= 6; i++) { const tx = mX + i * 8, ty = mY - i * 8, ts = Math.max(1, mS - i * 2); ctx.fillRect(Math.round(tx - ts / 2), Math.round(ty - ts / 2), Math.round(ts * .7), Math.round(ts * .7)); }
    ctx.fillStyle = "#2d4a1e"; ctx.fillRect(0, H * .65, W, H * .05);
    ctx.fillStyle = "#1a2e0f"; ctx.fillRect(0, H * .70, W, H * .30);
    ctx.fillStyle = "#1a2e0f";
    drawMountain(ctx, 0, H * .65, 180, 100); drawMountain(ctx, 150, H * .65, 220, 130);
    drawMountain(ctx, 500, H * .65, 160, 90); drawMountain(ctx, 620, H * .65, 200, 115);
    ctx.fillStyle = "#0d1f08";
    drawTree(ctx, 80, H * .65, 12, 35); drawTree(ctx, 110, H * .65, 10, 28);
    drawTree(ctx, 680, H * .65, 14, 40); drawTree(ctx, 720, H * .65, 11, 30);
}

function drawScene1(ctx, W, H, p) {
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, "#0a0005"); sky.addColorStop(0.4, "#3d0a00"); sky.addColorStop(1, "#660d00");
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
    const mX = W * .6, mY = H * .25 + p * H * .05, mS = 28 + p * 10;
    for (let i = 5; i >= 0; i--) { const r = mS * (2 + i * 1.2), a = (0.12 - i * .015) * (0.6 + p * .4); const g = ctx.createRadialGradient(mX, mY, 0, mX, mY, r); g.addColorStop(0, `rgba(255,180,30,${a * 3})`); g.addColorStop(1, "rgba(255,50,0,0)"); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(mX, mY, r, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = "#ffffff"; ctx.fillRect(Math.round(mX - mS / 2), Math.round(mY - mS / 2), mS, mS);
    ctx.fillStyle = "#ffeeaa"; ctx.fillRect(Math.round(mX - mS / 2 + 2), Math.round(mY - mS / 2 + 2), mS - 4, mS - 4);
    const dc = ["#ff8800", "#ff4400", "#ffaa00", "#ff6600"];
    for (let i = 0; i < 12; i++) { const dx = mX + (i + 1) * 10 + Math.sin(i * 2.3) * 5, dy = mY - (i + 1) * 10 + Math.cos(i * 1.7) * 4, ds = Math.max(2, mS * .7 - i * 3); ctx.fillStyle = dc[i % 4]; ctx.fillRect(Math.round(dx - ds / 2), Math.round(dy - ds / 2), Math.round(ds), Math.round(ds)); }
    ctx.fillStyle = "#0a0005"; ctx.fillRect(0, H * .78, W, H * .22);
    drawMountain(ctx, -20, H * .78, 250, 150); drawMountain(ctx, 300, H * .78, 180, 110); drawMountain(ctx, 550, H * .78, 280, 170);
    const ref = ctx.createLinearGradient(0, H * .70, 0, H * .78); ref.addColorStop(0, `rgba(180,40,0,${0.4 * p})`); ref.addColorStop(1, "rgba(0,0,0,0)"); ctx.fillStyle = ref; ctx.fillRect(0, H * .70, W, H * .08);
}

function drawScene2(ctx, W, H, p, ts) {
    const sky = ctx.createLinearGradient(0, 0, 0, H * .7);
    sky.addColorStop(0, "#1a0000"); sky.addColorStop(0.3, "#550800"); sky.addColorStop(0.7, "#992200"); sky.addColorStop(1, "#cc4400");
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H * .7);
    const mX = W * .75, mY = H * .08;
    const gw = ctx.createRadialGradient(mX, mY, 0, mX, mY, 80); gw.addColorStop(0, "rgba(255,200,50,0.9)"); gw.addColorStop(0.4, "rgba(255,80,0,0.5)"); gw.addColorStop(1, "rgba(255,0,0,0)");
    ctx.fillStyle = gw; ctx.beginPath(); ctx.arc(mX, mY, 80, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.fillRect(mX - 6, mY - 6, 12, 12);
    ctx.fillStyle = "#1a0a00"; ctx.fillRect(0, H * .70, W, H * .30);
    ctx.fillStyle = "#2a1200"; ctx.fillRect(0, H * .70, W, H * .04);
    ctx.fillStyle = "#3a1a00"; for (let x = 0; x < W; x += 40)ctx.fillRect(x, H * .71, 20, 2);

    // Raptor
    const s1 = 14, x1 = W * .12, y1 = H * .70 + Math.sin(ts * .008) * 2;
    ctx.fillStyle = "#4a7a3a"; ctx.fillRect(x1 - s1 * .6, y1 - s1 * 1.2, s1 * 1.2, s1 * .8);
    ctx.fillStyle = "#5a8a4a"; ctx.fillRect(x1 - s1 * .1, y1 - s1 * 2.0, s1 * .7, s1 * .6);
    ctx.fillStyle = "#fff"; ctx.fillRect(x1 + s1 * .3, y1 - s1 * 1.9, s1 * .2, s1 * .2);
    ctx.fillStyle = "#000"; ctx.fillRect(x1 + s1 * .35, y1 - s1 * 1.88, s1 * .12, s1 * .12);
    ctx.fillStyle = "#3a6a2a"; ctx.fillRect(x1 - s1 * .3, y1 - s1 * .4, s1 * .25, s1 * .4); ctx.fillRect(x1 + s1 * .1, y1 - s1 * .4, s1 * .25, s1 * .4);
    ctx.fillRect(x1 - s1, y1 - s1 * 1.0, s1 * .5, s1 * .2);
    ctx.fillStyle = "#aaddff"; ctx.fillRect(x1 + s1 * .6, y1 - s1 * 1.7, s1 * .1, s1 * .2);

    // Triceratops
    const s2 = 27, x2 = W * .33, y2 = H * .70;
    ctx.fillStyle = "#6b5a3a"; ctx.fillRect(x2 - s2 * .9, y2 - s2 * 1.0, s2 * 1.8, s2 * .9);
    ctx.fillStyle = "#7a6a4a"; ctx.fillRect(x2 + s2 * .5, y2 - s2 * 1.3, s2 * .9, s2 * .7);
    ctx.fillStyle = "#8a3a2a"; ctx.fillRect(x2 + s2 * .6, y2 - s2 * 1.8, s2 * .8, s2 * .6);
    ctx.fillStyle = "#c8b878"; ctx.fillRect(x2 + s2 * 1.1, y2 - s2 * 1.35, s2 * .1, s2 * .4); ctx.fillRect(x2 + s2 * .85, y2 - s2 * 1.35, s2 * .1, s2 * .35);
    ctx.fillStyle = "#fff"; ctx.fillRect(x2 + s2 * .75, y2 - s2 * 1.15, s2 * .15, s2 * .15); ctx.fillStyle = "#000"; ctx.fillRect(x2 + s2 * .78, y2 - s2 * 1.13, s2 * .08, s2 * .08);
    ctx.fillStyle = "#5a4a2a"; for (let i = 0; i < 4; i++)ctx.fillRect(x2 - s2 * .7 + i * s2 * .45, y2 - s2 * .1, s2 * .25, s2 * .3);
    ctx.fillRect(x2 - s2 * 1.3, y2 - s2 * .8, s2 * .5, s2 * .2);

    // T-Rex (hero) — center
    const s3 = 40, x3 = W * .54, y3 = H * .70;
    const headY = y3 - s3 * 2.0 - Math.sin(p * Math.PI) * s3 * .2;
    ctx.fillStyle = "#5a6e3a"; ctx.fillRect(x3 - s3 * .5, y3 - s3 * 1.4, s3 * 1.0, s3 * 1.0);
    ctx.fillStyle = "#6a7e4a"; ctx.fillRect(x3 - s3 * .1, headY, s3 * .9, s3 * .65);
    ctx.fillStyle = "#fff"; ctx.fillRect(x3 + s3 * .35, headY + s3 * .1, s3 * .25, s3 * .25);
    ctx.fillStyle = "#000"; ctx.fillRect(x3 + s3 * .38, headY + s3 * .12, s3 * .15, s3 * .15);
    ctx.fillStyle = "#fff"; ctx.fillRect(x3 + s3 * .44, headY + s3 * .15, s3 * .06, s3 * .06);
    ctx.fillStyle = "#fff"; ctx.fillRect(x3 + s3 * .2, headY + s3 * .55, s3 * .6, s3 * .08);
    ctx.fillStyle = "#6a7e4a"; for (let i = 0; i < 4; i++)ctx.fillRect(x3 + s3 * .22 + i * s3 * .13, headY + s3 * .55, s3 * .06, s3 * .08);
    ctx.fillStyle = "#4a5e2a"; ctx.fillRect(x3 + s3 * .3, y3 - s3 * 1.1, s3 * .25, s3 * .15); ctx.fillRect(x3 + s3 * .5, y3 - s3 * 1.0, s3 * .15, s3 * .12);
    ctx.fillStyle = "#5a6e3a"; ctx.fillRect(x3 - s3, y3 - s3 * 1.1, s3 * .6, s3 * .25); ctx.fillRect(x3 - s3 * 1.3, y3 - s3 * .9, s3 * .4, s3 * .18);
    ctx.fillStyle = "#4a5e2a"; ctx.fillRect(x3 - s3 * .25, y3 - s3 * .45, s3 * .35, s3 * .5); ctx.fillRect(x3 + s3 * .1, y3 - s3 * .45, s3 * .35, s3 * .5);
    ctx.fillStyle = "#aaddff"; ctx.fillRect(x3 + s3 * .7, headY + s3 * .05, s3 * .06, s3 * .18); ctx.fillRect(x3 + s3 * .75, headY - s3 * .05, s3 * .05, s3 * .14);
    // Hero glow
    const hg = ctx.createRadialGradient(x3, y3 - s3, 0, x3, y3 - s3, s3 * 1.2); hg.addColorStop(0, "rgba(255,255,200,0.12)"); hg.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(x3, y3 - s3, s3 * 1.2, 0, Math.PI * 2); ctx.fill();

    // Stegosaurus
    const s4 = 22, x4 = W * .73, y4 = H * .70;
    ctx.fillStyle = "#4a6a5a"; ctx.fillRect(x4 - s4 * .8, y4 - s4 * .9, s4 * 1.6, s4 * .8);
    ctx.fillStyle = "#ff6633"; for (let i = 0; i < 5; i++) { const ph = s4 * (0.3 + (i % 2) * .2); ctx.fillRect(x4 - s4 * .5 + i * s4 * .28, y4 - s4 * .9 - ph, s4 * .12, ph); }
    ctx.fillStyle = "#5a7a6a"; ctx.fillRect(x4 + s4 * .7, y4 - s4 * 1.0, s4 * .5, s4 * .4);
    ctx.fillStyle = "#fff"; ctx.fillRect(x4 + s4 * .85, y4 - s4 * .95, s4 * .12, s4 * .12); ctx.fillStyle = "#000"; ctx.fillRect(x4 + s4 * .87, y4 - s4 * .93, s4 * .07, s4 * .07);
    ctx.fillStyle = "#3a5a4a"; for (let i = 0; i < 4; i++)ctx.fillRect(x4 - s4 * .6 + i * s4 * .38, y4 - s4 * .1, s4 * .22, s4 * .28);
    ctx.fillStyle = "#4a6a5a"; ctx.fillRect(x4 - s4 * 1.3, y4 - s4 * .6, s4 * .6, s4 * .2);

    // Small dino already running
    const s5 = 10, x5 = W * .88 + p * 25, y5 = H * .70;
    const rb = Math.sin(ts * .015) * 3;
    ctx.fillStyle = "#7a4a3a"; ctx.fillRect(x5 - s5 * .4, y5 - s5 * 1.0 + rb, s5 * .8, s5 * .6);
    ctx.fillStyle = "#8a5a4a"; ctx.fillRect(x5 + s5 * .1, y5 - s5 * 1.5 + rb, s5 * .5, s5 * .4);
    ctx.fillStyle = "#fff"; ctx.fillRect(x5 + s5 * .35, y5 - s5 * 1.45 + rb, s5 * .12, s5 * .12); ctx.fillStyle = "#000"; ctx.fillRect(x5 + s5 * .37, y5 - s5 * 1.43 + rb, s5 * .07, s5 * .07);
    const la = Math.sin(ts * .02);
    ctx.fillStyle = "#6a3a2a"; ctx.fillRect(x5 - s5 * .1 + la * 4, y5 - s5 * .4 + rb, s5 * .2, s5 * .4); ctx.fillRect(x5 + s5 * .1 - la * 4, y5 - s5 * .4 + rb, s5 * .2, s5 * .4);
    ctx.fillRect(x5 - s5 * .7, y5 - s5 * .8 + rb, s5 * .4, s5 * .15);

    // Shockwave
    if (p > 0.6) { const ra = (p - 0.6) / 0.4; ctx.strokeStyle = `rgba(255,100,0,${ra * .6})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(W * .75, H * .70, 60 * ra * 3, 12 * ra, 0, 0, Math.PI * 2); ctx.stroke(); }

    // Dust
    ctx.fillStyle = `rgba(180,120,60,${0.4 * p})`;
    for (let i = 0; i < 8; i++) { const px = (W * .1 + i * 90 + Math.sin(i + p * 5) * 15) % W; const py = H * .68 + Math.cos(i * 2) * 8; ctx.beginPath(); ctx.arc(px, py, 3 + i % 3, 0, Math.PI * 2); ctx.fill(); }
}

function drawScene3(ctx, W, H, p, ts) {
    // Transitioning sky
    const sky = ctx.createLinearGradient(0, 0, 0, H * .7);
    sky.addColorStop(0, interpolateColor("#1a0000", "#87CEEB", p));
    sky.addColorStop(1, interpolateColor("#330800", "#c9e8f5", p));
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H * .7);
    ctx.fillStyle = interpolateColor("#1a0a00", "#c8aa84", p); ctx.fillRect(0, H * .70, W, H * .30);
    ctx.fillStyle = interpolateColor("#3a1a00", "#8B7355", p); ctx.fillRect(0, H * .70, W, 3);
    if (p > 0.4) { const gp = (p - 0.4) / 0.6; ctx.fillStyle = `rgba(100,80,40,${0.3 * gp})`; for (let x = 0; x < W; x += 120)ctx.fillRect(x, H * .71, 60, 2); }

    // Running T-Rex
    const trexX = W * .5 - p * W * .28;
    const trexY = H * .70;
    const s = 42;
    const frame = Math.floor(ts / 100) % 4;
    const rb = frame % 2 === 0 ? 0 : -4;
    const ls = frame < 2 ? 1 : -1;

    // Shadow
    ctx.fillStyle = `rgba(0,0,0,${0.25 * (1 - p * .5)})`;
    ctx.beginPath(); ctx.ellipse(trexX, trexY + 2, s * .6, 6, 0, 0, Math.PI * 2); ctx.fill();

    // Body
    ctx.fillStyle = "#5a6e3a"; ctx.fillRect(trexX - s * .5, trexY - s * 1.4 + rb, s, s);
    // Head
    ctx.fillStyle = "#6a7e4a"; ctx.fillRect(trexX + s * .2, trexY - s * 2.0 + rb, s * .85, s * .6);
    // Eye
    ctx.fillStyle = "#fff"; ctx.fillRect(trexX + s * .65, trexY - s * 1.95 + rb, s * .22, s * .22);
    ctx.fillStyle = "#000"; ctx.fillRect(trexX + s * .7, trexY - s * 1.93 + rb, s * .14, s * .14);
    ctx.fillStyle = "#fff"; ctx.fillRect(trexX + s * .75, trexY - s * 1.90 + rb, s * .06, s * .06);
    // Open jaw
    ctx.fillStyle = "#4a5e2a"; ctx.fillRect(trexX + s * .25, trexY - s * 1.48 + rb, s * .7, s * .12);
    ctx.fillStyle = "#fff"; for (let i = 0; i < 3; i++)ctx.fillRect(trexX + s * .3 + i * s * .15, trexY - s * 1.48 + rb, s * .08, s * .1);
    // Arms
    ctx.fillStyle = "#4a5e2a"; ctx.fillRect(trexX + s * .4, trexY - s * 1.05 + rb, s * .2, s * .12);
    // Tail
    ctx.fillStyle = "#5a6e3a"; ctx.fillRect(trexX - s * 1.0, trexY - s * 1.05 + rb, s * .6, s * .22); ctx.fillRect(trexX - s * 1.35, trexY - s * .88 + rb, s * .4, s * .16);
    // Legs
    ctx.fillStyle = "#4a5e2a";
    ctx.fillRect(trexX - s * .3, trexY - s * .45 + rb + ls * 7, s * .32, s * .5); ctx.fillRect(trexX + s * .05, trexY - s * .45 + rb - ls * 7, s * .32, s * .5);
    ctx.fillStyle = "#3a4e2a";
    ctx.fillRect(trexX - s * .35, trexY + rb + ls * 7, s * .4, s * .12); ctx.fillRect(trexX, trexY + rb - ls * 7, s * .4, s * .12);

    // Speed lines
    if (p > 0.4) { const la = (p - 0.4) * 1.67; ctx.strokeStyle = `rgba(255,255,255,${la * .4})`; ctx.lineWidth = 1.5; for (let i = 0; i < 5; i++) { const ly = trexY - 20 - i * 18; const lx = trexX + 45 + i * 4; ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx + 35 + i * 8, ly); ctx.stroke(); } }

    // Dust
    if (p > 0.15) { ctx.fillStyle = `rgba(200,180,140,${0.5 * p})`; for (let i = 0; i < 3; i++) { const dx = trexX - s * .5 - i * 10; const dy = trexY - 3 + Math.sin(ts * .01 + i) * 5; ctx.beginPath(); ctx.arc(dx, dy, 4 + i * 3, 0, Math.PI * 2); ctx.fill(); } }

    // Cacti appearing
    if (p > 0.65) { const ca = (p - 0.65) / 0.35; ctx.globalAlpha = ca; drawCactus(ctx, W * .82, H * .70, 1); drawCactus(ctx, W * .94, H * .70, .8); ctx.globalAlpha = 1; }

    // White flash at end
    if (p > 0.86) { const fa = (p - 0.86) / 0.14; ctx.fillStyle = `rgba(255,255,255,${fa})`; ctx.fillRect(0, 0, W, H); }
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────
const SLIDE_DURATION = 2000;
const TOTAL_SLIDES = 4;

const LABELS = ["65,000,000 BC", "The Sky Changed", "They All Felt It", "Run."];
const SUBTITLES = ["A normal day. Or so they thought.", "Something was wrong with the light.", "Every creature on Earth looked up.", "Rex didn't wait to find out why."];

export default function App() {
    const canvasRef = useRef(null);
    const rafRef = useRef(null);
    const startRef = useRef(null);
    const tsRef = useRef(0);

    const [phase, setPhase] = useState("menu"); // menu | cinematic | game
    const [slide, setSlide] = useState(0);
    const [sProgress, setSProgress] = useState(0);
    const [showTitle, setShowTitle] = useState(false);
    const [gameReady, setGameReady] = useState(false);

    // Game state
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [dinoY, setDinoY] = useState(0);
    const dinoVelRef = useRef(0);
    const isJumpingRef = useRef(false);
    const gameActiveRef = useRef(false);
    const scoreRef = useRef(0);
    const obstaclesRef = useRef([]);
    const gameCanvasRef = useRef(null);
    const gameRafRef = useRef(null);
    const speedRef = useRef(6);

    // ── Cinematic loop
    const runCinematic = useCallback((ts) => {
        if (!startRef.current) startRef.current = ts;
        const elapsed = ts - startRef.current;
        tsRef.current = ts;

        const total = SLIDE_DURATION * TOTAL_SLIDES;
        const rawSlide = Math.floor(elapsed / SLIDE_DURATION);
        const curSlide = Math.min(rawSlide, TOTAL_SLIDES - 1);
        const sp = Math.min((elapsed - curSlide * SLIDE_DURATION) / SLIDE_DURATION, 1);

        setSlide(curSlide);
        setSProgress(sp);
        if (curSlide === 3 && sp > 0.35) setShowTitle(true);

        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext("2d");
            ctx.imageSmoothingEnabled = false;
            const W = canvas.width, H = canvas.height;
            ctx.clearRect(0, 0, W, H);
            if (curSlide === 0) drawScene0(ctx, W, H, sp);
            else if (curSlide === 1) drawScene1(ctx, W, H, sp);
            else if (curSlide === 2) drawScene2(ctx, W, H, sp, ts);
            else drawScene3(ctx, W, H, sp, ts);

            // Inter-slide flash
            if (curSlide < 3) {
                const fz = 0.12;
                let fa = 0;
                if (sp > 1 - fz) fa = (sp - (1 - fz)) / fz;
                else if (sp < fz && curSlide > 0) fa = 1 - sp / fz;
                if (fa > 0) { ctx.fillStyle = `rgba(255,60,0,${fa * 0.65})`; ctx.fillRect(0, 0, W, H); }
            }
        }

        if (elapsed < total) {
            rafRef.current = requestAnimationFrame(runCinematic);
        } else {
            setGameReady(true);
            setTimeout(() => setPhase("game"), 350);
        }
    }, []);

    const startCinematic = () => {
        setPhase("cinematic");
        setShowTitle(false);
        startRef.current = null;
        rafRef.current = requestAnimationFrame(runCinematic);
    };

    const skipToGame = () => {
        cancelAnimationFrame(rafRef.current);
        setPhase("game");
        setGameReady(true);
    };

    // ── Game loop
    const GROUND = 200;
    const DINO_X = 80;
    const GRAVITY = 1.1;
    const JUMP_VEL = -16;

    const jump = useCallback(() => {
        if (!isJumpingRef.current && gameActiveRef.current) {
            dinoVelRef.current = JUMP_VEL;
            isJumpingRef.current = true;
        }
    }, []);

    useEffect(() => {
        if (phase !== "game") return;
        const handleKey = (e) => { if (e.code === "Space" || e.code === "ArrowUp") { e.preventDefault(); jump(); } };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [phase, jump]);

    const startGame = useCallback(() => {
        scoreRef.current = 0;
        speedRef.current = 6;
        obstaclesRef.current = [];
        dinoVelRef.current = 0;
        isJumpingRef.current = false;
        gameActiveRef.current = true;
        setScore(0);
        setGameOver(false);
        setDinoY(0);
        let frameCount = 0;

        const loop = (ts) => {
            if (!gameActiveRef.current) return;
            const canvas = gameCanvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext("2d");
            ctx.imageSmoothingEnabled = false;
            const W = canvas.width, H = canvas.height;

            // Physics
            dinoVelRef.current += GRAVITY;
            let newY = (gameCanvasRef.dinoY ?? 0) + dinoVelRef.current;
            if (newY >= 0) { newY = 0; dinoVelRef.current = 0; isJumpingRef.current = false; }
            gameCanvasRef.dinoY = newY;
            setDinoY(newY);

            // Speed ramp
            speedRef.current = Math.min(14, 6 + scoreRef.current * 0.003);

            // Obstacles
            frameCount++;
            const minGap = Math.max(55, 90 - scoreRef.current * 0.02);
            if (frameCount % Math.round(minGap) === 0) {
                obstaclesRef.current.push({ x: W, h: 30 + Math.floor(Math.random() * 3) * 14, w: 20 });
            }
            obstaclesRef.current = obstaclesRef.current.map(o => ({ ...o, x: o.x - speedRef.current })).filter(o => o.x > -40);

            // Collision
            const dinoTop = GROUND + newY - 54;
            const dinoBottom = GROUND + newY;
            const dinoL = DINO_X - 14, dinoR = DINO_X + 14;
            for (const obs of obstaclesRef.current) {
                const obsL = obs.x - obs.w / 2 + 4;
                const obsR = obs.x + obs.w / 2 - 4;
                const obsTop = GROUND - obs.h + 4;
                if (dinoR > obsL && dinoL < obsR && dinoBottom > obsTop) {
                    gameActiveRef.current = false;
                    setGameOver(true);
                    return;
                }
            }

            // Score
            scoreRef.current += 0.15;
            setScore(Math.floor(scoreRef.current));

            // Draw
            ctx.clearRect(0, 0, W, H);

            // Sky
            const biome = scoreRef.current < 500 ? 0 : scoreRef.current < 1500 ? 1 : scoreRef.current < 3000 ? 2 : 3;
            const skyColors = [["#87CEEB", "#c9e8f5"], ["#FF6B35", "#FFD700"], ["#1a3a0a", "#2d6b1e"], ["#001533", "#003366"]];
            const sg = ctx.createLinearGradient(0, 0, 0, H * .65);
            sg.addColorStop(0, skyColors[biome][0]); sg.addColorStop(1, skyColors[biome][1]);
            ctx.fillStyle = sg; ctx.fillRect(0, 0, W, H * .65);

            // Ground
            const groundColors = ["#c8aa84", "#8B4513", "#2d5a1b", "#708090"];
            ctx.fillStyle = groundColors[biome]; ctx.fillRect(0, GROUND, W, H - GROUND);
            ctx.fillStyle = "rgba(0,0,0,0.15)"; ctx.fillRect(0, GROUND, W, 3);
            ctx.fillStyle = "rgba(255,255,255,0.08)"; for (let x = 0; x < W; x += 80)ctx.fillRect(x + ((frameCount * speedRef.current) % 80), GROUND + 6, 40, 2);

            // Clouds / ambient
            if (biome === 0) {
                ctx.fillStyle = "rgba(255,255,255,0.7)";
                [[120, 40, 50, 18], [320, 60, 70, 22], [580, 35, 55, 16]].forEach(([cx, cy, cw, ch]) => {
                    const ox = ((cx - frameCount * .3) % W + W) % W;
                    ctx.beginPath(); ctx.ellipse(ox, cy, cw, ch, 0, 0, Math.PI * 2); ctx.fill();
                    ctx.beginPath(); ctx.ellipse(ox + 20, cy - 8, cw * .7, ch * .7, 0, 0, Math.PI * 2); ctx.fill();
                });
            }

            // T-Rex
            const dy = gameCanvasRef.dinoY ?? 0;
            const rf = Math.floor(ts / 120) % 4;
            const rb2 = rf % 2 === 0 ? 0 : -3;
            const ls2 = rf < 2 ? 1 : -1;
            const s = 32;
            const rx = DINO_X, ry = GROUND + dy;

            ctx.fillStyle = "#5a6e3a"; ctx.fillRect(rx - s * .45, ry - s * 1.35 + rb2, s * .9, s * .9);
            ctx.fillStyle = "#6a7e4a"; ctx.fillRect(rx + s * .18, ry - s * 1.9 + rb2, s * .78, s * .55);
            ctx.fillStyle = "#fff"; ctx.fillRect(rx + s * .58, ry - s * 1.85 + rb2, s * .2, s * .2);
            ctx.fillStyle = "#000"; ctx.fillRect(rx + s * .62, ry - s * 1.83 + rb2, s * .12, s * .12);
            ctx.fillStyle = "#fff"; ctx.fillRect(rx + s * .67, ry - s * 1.80 + rb2, s * .05, s * .05);
            if (isJumpingRef.current) {
                ctx.fillStyle = "#4a5e2a"; ctx.fillRect(rx + s * .36, ry - s * .98 + rb2, s * .18, s * .1);
            }
            ctx.fillStyle = "#5a6e3a"; ctx.fillRect(rx - s * .9, ry - s + rb2, s * .55, s * .2); ctx.fillRect(rx - s * 1.2, ry - s * .82 + rb2, s * .35, s * .15);
            ctx.fillStyle = "#4a5e2a";
            if (!isJumpingRef.current) {
                ctx.fillRect(rx - s * .28, ry - s * .42 + rb2 + ls2 * 6, s * .3, s * .46); ctx.fillRect(rx + s * .08, ry - s * .42 + rb2 - ls2 * 6, s * .3, s * .46);
                ctx.fillRect(rx - s * .33, ry + rb2 + ls2 * 6, s * .38, s * .11); ctx.fillRect(rx + s * .03, ry + rb2 - ls2 * 6, s * .38, s * .11);
            } else {
                ctx.fillRect(rx - s * .22, ry - s * .5, s * .28, s * .5); ctx.fillRect(rx + s * .1, ry - s * .55, s * .28, s * .5);
            }

            // Obstacles
            ctx.fillStyle = biome === 0 ? "#2d5a1b" : biome === 1 ? "#8B4513" : biome === 2 ? "#1a3d00" : "#4a6080";
            obstaclesRef.current.forEach(obs => {
                ctx.fillRect(obs.x - obs.w / 2, GROUND - obs.h, obs.w, obs.h);
                if (biome === 0) { // cactus arms
                    ctx.fillRect(obs.x - obs.w / 2 - 6, GROUND - obs.h * .65, 6, 3);
                    ctx.fillRect(obs.x - obs.w / 2 - 6, GROUND - obs.h * .75, 3, obs.h * .15);
                    ctx.fillRect(obs.x + obs.w / 2, GROUND - obs.h * .5, 6, 3);
                    ctx.fillRect(obs.x + obs.w / 2 + 3, GROUND - obs.h * .62, 3, obs.h * .15);
                }
            });

            // HUD
            ctx.fillStyle = "rgba(0,0,0,0.4)"; ctx.fillRect(0, 0, W, 32);
            ctx.fillStyle = "#fff"; ctx.font = "bold 14px 'Courier New'";
            ctx.fillText(`SCORE: ${Math.floor(scoreRef.current).toString().padStart(5, '0')}`, 12, 22);
            const biomeNames = ["🌵 BADLANDS", "🌋 VOLCANIC", "🌿 JUNGLE", "❄️ TUNDRA"];
            ctx.textAlign = "center"; ctx.fillText(biomeNames[biome], W / 2, 22); ctx.textAlign = "left";
            ctx.fillStyle = "#aaa"; ctx.font = "11px 'Courier New'"; ctx.fillText("SPACE / TAP = JUMP", W - 165, 22);

            gameRafRef.current = requestAnimationFrame(loop);
        };

        gameRafRef.current = requestAnimationFrame(loop);
        return () => { gameActiveRef.current = false; cancelAnimationFrame(gameRafRef.current); };
    }, [gameOver]);

    useEffect(() => { if (phase === "game" && !gameOver) { const cleanup = startGame(); return cleanup; } }, [phase, gameOver]);

    // ─── RENDER ────────────────────────────────────────────────────────────────
    const totalProg = (slide / TOTAL_SLIDES + sProgress / TOTAL_SLIDES);

    if (phase === "menu") return (
        <div style={{
            minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            background: "radial-gradient(ellipse at 60% 30%, #1a0a2e 0%, #000 70%)",
            fontFamily: "'Courier New',monospace", color: "#fff", overflow: "hidden", position: "relative"
        }}>
            {/* Stars */}
            {[...Array(40)].map((_, i) => (
                <div key={i} style={{
                    position: "absolute", width: i % 5 === 0 ? 3 : 2, height: i % 5 === 0 ? 3 : 2, background: "#fff", borderRadius: "50%",
                    left: `${(i * 37 + 13) % 100}%`, top: `${(i * 23 + 7) % 70}%`, opacity: 0.4 + Math.random() * .6,
                    animation: `twinkle ${1.5 + Math.random() * 2}s ease-in-out infinite`, animationDelay: `${Math.random() * 3}s`
                }} />
            ))}
            {/* Meteor hint top right */}
            <div style={{
                position: "absolute", top: 40, right: 80, width: 8, height: 8, background: "#ffaa00", borderRadius: 1,
                boxShadow: "0 0 20px 8px rgba(255,150,0,0.4), 12px -12px 0 4px rgba(255,100,0,0.3), 24px -24px 0 2px rgba(255,80,0,0.15)"
            }} />

            <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
                <div style={{ fontSize: "clamp(8px,1.5vw,11px)", letterSpacing: "0.5em", color: "rgba(255,150,80,0.7)", marginBottom: 16, textTransform: "uppercase" }}>
                    65,000,000 BC
                </div>
                <h1 style={{
                    fontSize: "clamp(32px,7vw,72px)", fontWeight: 900, letterSpacing: "0.08em", margin: "0 0 8px",
                    textShadow: "0 0 40px rgba(255,100,50,0.6)", color: "#ff7744", lineHeight: 1,
                    animation: "pulse 3s ease-in-out infinite"
                }}>
                    DINO
                </h1>
                <h2 style={{
                    fontSize: "clamp(16px,3vw,28px)", fontWeight: 300, letterSpacing: "0.6em", margin: "0 0 4px",
                    color: "rgba(255,220,180,0.8)", textTransform: "uppercase"
                }}>
                    LAST RUN
                </h2>
                <div style={{
                    fontSize: "clamp(8px,1.2vw,10px)", letterSpacing: "0.4em", color: "rgba(255,255,255,0.3)",
                    marginBottom: 56, textTransform: "uppercase"
                }}>
                    No dinosaur was ready
                </div>

                {/* Tiny dino silhouette */}
                <div style={{ marginBottom: 40, display: "flex", justifyContent: "center", opacity: 0.7 }}>
                    <canvas width={60} height={50} ref={el => {
                        if (!el) return; const ctx = el.getContext("2d"); ctx.imageSmoothingEnabled = false;
                        const s = 14; const rx = 25, ry = 45;
                        ctx.fillStyle = "#5a6e3a"; ctx.fillRect(rx - s * .45, ry - s * 1.35, s * .9, s * .9);
                        ctx.fillStyle = "#6a7e4a"; ctx.fillRect(rx + s * .18, ry - s * 1.9, s * .78, s * .55);
                        ctx.fillStyle = "#fff"; ctx.fillRect(rx + s * .58, ry - s * 1.85, s * .2, s * .2);
                        ctx.fillStyle = "#000"; ctx.fillRect(rx + s * .62, ry - s * 1.83, s * .12, s * .12);
                        ctx.fillStyle = "#5a6e3a"; ctx.fillRect(rx - s * .9, ry - s, s * .55, s * .2);
                        ctx.fillStyle = "#4a5e2a"; ctx.fillRect(rx - s * .28, ry - s * .42, s * .3, s * .46); ctx.fillRect(rx + s * .08, ry - s * .42, s * .3, s * .46);
                    }} />
                </div>

                <button onClick={startCinematic} style={{
                    display: "block", margin: "0 auto 16px", padding: "16px 52px",
                    background: "transparent", border: "2px solid #ff6633", color: "#ff6633",
                    fontSize: "clamp(13px,2vw,16px)", letterSpacing: "0.3em", textTransform: "uppercase",
                    cursor: "pointer", fontFamily: "inherit", fontWeight: 700,
                    transition: "all 0.2s", borderRadius: 2,
                    boxShadow: "0 0 20px rgba(255,102,51,0.2)"
                }} onMouseEnter={e => { e.target.style.background = "rgba(255,102,51,0.15)"; e.target.style.boxShadow = "0 0 30px rgba(255,102,51,0.5)" }}
                    onMouseLeave={e => { e.target.style.background = "transparent"; e.target.style.boxShadow = "0 0 20px rgba(255,102,51,0.2)" }}>
                    ▶ Start Run
                </button>
                <button onClick={() => { setPhase("game"); setGameReady(true); }} style={{
                    display: "block", margin: "0 auto", padding: "10px 36px",
                    background: "transparent", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.35)",
                    fontSize: "clamp(10px,1.4vw,12px)", letterSpacing: "0.3em", textTransform: "uppercase",
                    cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s", borderRadius: 2
                }} onMouseEnter={e => { e.target.style.color = "rgba(255,255,255,0.7)" }}
                    onMouseLeave={e => { e.target.style.color = "rgba(255,255,255,0.35)" }}>
                    Skip Intro
                </button>
                <div style={{ marginTop: 40, fontSize: 10, color: "rgba(255,255,255,0.2)", letterSpacing: "0.2em" }}>
                    SPACE / CLICK / TAP TO JUMP
                </div>
            </div>
            <style>{`@keyframes pulse{0%,100%{text-shadow:0 0 40px rgba(255,100,50,.6)}50%{text-shadow:0 0 70px rgba(255,100,50,1)}}@keyframes twinkle{0%,100%{opacity:.3}50%{opacity:1}}`}</style>
        </div>
    );

    if (phase === "cinematic") return (
        <div style={{
            position: "fixed", inset: 0, background: "#000", display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", fontFamily: "'Courier New',monospace"
        }}>
            <div style={{
                position: "relative", width: "100%", maxWidth: 800, aspectRatio: "800/360",
                border: "2px solid rgba(255,80,0,0.4)", boxShadow: "0 0 60px rgba(255,80,0,0.25)"
            }}>
                <canvas ref={canvasRef} width={800} height={360} style={{ width: "100%", height: "100%", imageRendering: "pixelated", display: "block" }} />
                <div key={slide} style={{
                    position: "absolute", top: 14, left: 18, color: "rgba(255,210,130,0.9)", fontSize: "clamp(8px,1.4vw,12px)",
                    letterSpacing: "0.25em", textTransform: "uppercase", animation: "fsi .5s ease forwards"
                }}>
                    {LABELS[slide]}
                </div>
                <div key={`s${slide}`} style={{
                    position: "absolute", bottom: 0, left: 0, right: 0, padding: "12px 20px",
                    background: "linear-gradient(transparent,rgba(0,0,0,0.85))", color: slide === 3 ? "#ff6633" : "rgba(255,255,255,0.82)",
                    fontSize: "clamp(10px,1.6vw,14px)", fontStyle: slide === 3 ? "normal" : "italic", fontWeight: slide === 3 ? 700 : 400,
                    letterSpacing: slide === 3 ? "0.12em" : "0.04em", animation: "fsi .6s ease forwards"
                }}>
                    {SUBTITLES[slide]}
                </div>
                <div style={{ position: "absolute", top: 14, right: 16, display: "flex", gap: 5, alignItems: "center" }}>
                    {LABELS.map((_, i) => (
                        <div key={i} style={{
                            width: i === slide ? 16 : 5, height: 5, borderRadius: 3, transition: "all .4s",
                            background: i === slide ? "#ff6633" : i < slide ? "rgba(255,102,51,.4)" : "rgba(255,255,255,.15)"
                        }} />
                    ))}
                </div>
                <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.07) 2px,rgba(0,0,0,.07) 4px)", pointerEvents: "none" }} />
                <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center,transparent 55%,rgba(0,0,0,.65) 100%)", pointerEvents: "none" }} />
            </div>
            <div style={{ height: 52, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 18 }}>
                {showTitle && (
                    <div style={{ textAlign: "center", animation: "tr .8s cubic-bezier(.16,1,.3,1) forwards" }}>
                        <div style={{
                            color: "#ff6633", fontSize: "clamp(16px,3vw,26px)", fontWeight: 900, letterSpacing: "0.28em",
                            textTransform: "uppercase", textShadow: "0 0 20px rgba(255,100,50,.6)"
                        }}>DINO: LAST RUN</div>
                        <div style={{ color: "rgba(255,200,150,.55)", fontSize: "clamp(7px,1vw,10px)", letterSpacing: "0.5em", marginTop: 3 }}>NO DINOSAUR WAS READY</div>
                    </div>
                )}
            </div>
            <div style={{ width: "100%", maxWidth: 800, height: 2, background: "rgba(255,255,255,.07)", marginTop: 10, borderRadius: 1, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${totalProg * 100}%`, background: "linear-gradient(90deg,#ff4400,#ff9900)", transition: "width .1s linear" }} />
            </div>
            <button onClick={skipToGame} style={{
                position: "fixed", bottom: 24, right: 24, background: "rgba(255,255,255,.05)",
                border: "1px solid rgba(255,255,255,.15)", color: "rgba(255,255,255,.45)", padding: "7px 16px", fontSize: 10,
                letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer", borderRadius: 2, fontFamily: "inherit"
            }}
                onMouseEnter={e => { e.target.style.color = "#ff6633"; e.target.style.borderColor = "#ff6633" }}
                onMouseLeave={e => { e.target.style.color = "rgba(255,255,255,.45)"; e.target.style.borderColor = "rgba(255,255,255,.15)" }}>
                Skip ▶
            </button>
            <style>{`@keyframes fsi{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}@keyframes tr{from{opacity:0;transform:scale(.93) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}`}</style>
        </div>
    );

    // GAME SCREEN
    return (
        <div style={{
            minHeight: "100vh", background: "#111", display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", fontFamily: "'Courier New',monospace"
        }}
            onClick={jump}>
            <div style={{ position: "relative", width: "100%", maxWidth: 800 }}>
                <canvas ref={gameCanvasRef} width={800} height={300}
                    style={{ width: "100%", display: "block", imageRendering: "pixelated", border: "2px solid #333", cursor: "pointer" }} />
                {gameOver && (
                    <div style={{
                        position: "absolute", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex",
                        flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16
                    }}>
                        <div style={{ color: "#ff6633", fontSize: "clamp(20px,4vw,32px)", fontWeight: 900, letterSpacing: "0.2em" }}>GAME OVER</div>
                        <div style={{ color: "rgba(255,220,180,.8)", fontSize: "clamp(12px,2vw,16px)", letterSpacing: "0.15em" }}>
                            SCORE: {score.toString().padStart(5, "0")}
                        </div>
                        <div style={{ color: "rgba(255,200,150,.5)", fontSize: 11, fontStyle: "italic", maxWidth: 320, textAlign: "center", lineHeight: 1.6 }}>
                            Rex ran {score} steps before the world caught up.
                        </div>
                        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                            <button onClick={(e) => { e.stopPropagation(); setGameOver(false); }} style={{
                                padding: "10px 28px", background: "transparent", border: "2px solid #ff6633", color: "#ff6633",
                                fontSize: 12, letterSpacing: "0.25em", textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit", borderRadius: 2
                            }}
                                onMouseEnter={e => e.target.style.background = "rgba(255,102,51,0.15)"}
                                onMouseLeave={e => e.target.style.background = "transparent"}>
                                ↻ Run Again
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); setPhase("menu"); setGameOver(false); }} style={{
                                padding: "10px 28px", background: "transparent", border: "1px solid rgba(255,255,255,0.2)",
                                color: "rgba(255,255,255,0.4)", fontSize: 12, letterSpacing: "0.25em", textTransform: "uppercase",
                                cursor: "pointer", fontFamily: "inherit", borderRadius: 2
                            }}
                                onMouseEnter={e => e.target.style.color = "rgba(255,255,255,.7)"}
                                onMouseLeave={e => e.target.style.color = "rgba(255,255,255,.4)"}>
                                ← Menu
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <div style={{ marginTop: 10, color: "rgba(255,255,255,0.2)", fontSize: 10, letterSpacing: "0.3em" }}>
                SPACE / CLICK / TAP = JUMP
            </div>
        </div>
    );
}
