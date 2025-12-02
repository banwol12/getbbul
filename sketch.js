// --- Configuration ---
const maxParticles = 2500; // Cap to maintain fps
const particleRadius = 6;

// Physics & Gameplay
const gravity = 0.4;
const terminalVelocity = 12;
const spawnRateBase = 2; // Particles per frame
let isDay = false;

let particleSystem;

function setup() {
  createCanvas(800, 600);
  noStroke();

  particleSystem = new ParticleSystem();
  particleSystem.init();
}

// --- Main Loop ---
function draw() {
  // State Management
  isDay = mouseIsPressed;

  // Visual Environment
  drawBackground();
  drawCelestialBody();

  // Simulation Steps
  particleSystem.update();

  // Render
  particleSystem.display();

  // UI / Info
  fill(255);
  textSize(12);
  textAlign(LEFT, TOP);
  text(`Particles: ${particleSystem.particles.length}`, 10, 10);
  text(isDay ? "State: DAY (Low Tide - Repel)" : "State: NIGHT (High Tide - Accumulate)", 10, 25);
}

// --- Systems ---

function drawBackground() {
  if (isDay) {
    background(135, 206, 235); // Sky Blue
    // Sun Glare gradient
    let c1 = color(255, 255, 200, 50);
    let c2 = color(135, 206, 235, 0);
    setGradient(0, 0, width, height, c1, c2);
  } else {
    background(20, 24, 82); // Deep Night Blue
    // Moon Glow gradient
    let c1 = color(20, 24, 120);
    let c2 = color(0, 0, 0);
    setGradient(0, 0, width, height, c1, c2);
  }
}

function setGradient(x, y, w, h, c1, c2) {
  noFill();
  for (let i = y; i <= y + h; i += 10) {
    let inter = map(i, y, y + h, 0, 1);
    let c = lerpColor(c1, c2, inter);
    stroke(c);
    strokeWeight(10);
    line(x, i, x + w, i);
  }
  noStroke();
}

function drawCelestialBody() {
  let cx = mouseX;
  let cy = mouseY;

  if (isDay) {
    // Sun (Repeller)
    fill(255, 200, 0);
    circle(cx, cy, 60);
    fill(255, 100, 0, 100);
    circle(cx, cy, 80);

    // Repulsion visual indicator
    noFill();
    stroke(255, 100, 0, 50);
    strokeWeight(2);
    let pulse = (frameCount % 40) * 3;
    circle(cx, cy, 60 + pulse);
    noStroke();

  } else {
    // Moon (Attractor - visual only for spawn rate)
    fill(240, 240, 255);
    circle(cx, cy, 50);
    fill(255, 255, 255, 50);
    circle(cx, cy, 70);

    // Moon craters
    fill(200, 200, 220);
    circle(cx - 10, cy - 5, 10);
    circle(cx + 8, cy + 10, 15);
  }
}