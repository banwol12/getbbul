class Particle {
    constructor() {
        this.pos = createVector(0, 0);
        this.vel = createVector(0, 0);
        this.acc = createVector(0, 0);
        this.active = false;
        this.isStatic = false; // Is it stacked?
        this.sleepCount = 0;
    }

    spawn(x, y) {
        this.pos.set(x, y);
        this.vel.set(random(-0.5, 0.5), 0); // Slight jitter
        this.acc.set(0, 0);
        this.active = true;
        this.isStatic = false;
        this.sleepCount = 0;
    }

    update() {
        if (!this.active) return;

        // 1. Forces
        this.applyForces();

        // 2. Physics Integration
        if (!this.isStatic) {
            this.vel.add(this.acc);
            this.vel.limit(terminalVelocity);
            this.pos.add(this.vel);
            this.acc.mult(0); // Reset acc
        }

        // 3. Grid/Stacking Logic
        this.handleCollisions();
    }

    applyForces() {
        // Gravity (Always applies unless static)
        if (!this.isStatic) {
            this.acc.add(0, gravity);
        }

        // Day Mode: Repeller (Sun)
        // The sun pushes particles horizontally away from itself
        if (isDay) {
            this.isStatic = false; // Wake up all particles

            let sunPos = createVector(mouseX, mouseY);
            let dir = p5.Vector.sub(this.pos, sunPos);
            let d = dir.mag();
            dir.normalize();

            // Calculate horizontal push strength
            // Stronger if closer, mainly horizontal component
            let strength = 200 / (d + 10);
            // Bias force to be mostly horizontal to sweep floor
            let horizontalForce = dir.x > 0 ? strength : -strength;

            // Add randomness for "foam" look
            horizontalForce += random(-0.2, 0.2);

            this.acc.add(horizontalForce, 0);

            // Slight vertical lift to help them unstack
            if (this.pos.y > height - 50) {
                this.acc.add(0, -0.5);
            }
        }
    }

    handleCollisions() {
        let col = floor(this.pos.x / particleSystem.cellSize);
        let row = floor(this.pos.y / particleSystem.cellSize);

        // Boundary: Floor
        if (this.pos.y + particleRadius >= height) {
            this.pos.y = height - particleRadius;
            this.vel.y = 0;
            this.isStatic = true;
        }

        // Boundary: Walls
        if (this.pos.x < 0 || this.pos.x > width) {
            // In Day mode, they die off screen
            if (isDay) {
                this.active = false;
            } else {
                // In Night mode, Bounce
                this.vel.x *= -0.5;
                this.pos.x = constrain(this.pos.x, 0, width);
            }
        }

        // Interaction with Grid (Stacking)
        if (!isDay && !this.isStatic) {
            // Check cell below
            let nextRow = row + 1;

            // If specific future position is occupied
            if (nextRow < particleSystem.rows && col >= 0 && col < particleSystem.cols) {
                let neighborBelow = particleSystem.grid[col][nextRow];

                // If there is a particle below us
                if (neighborBelow && neighborBelow !== this) {
                    // Snap to top of that cell
                    this.pos.y = (nextRow * particleSystem.cellSize) - particleSystem.cellSize;
                    this.vel.y = 0;
                    this.isStatic = true;

                    // FLUID MECHANIC: Slide off piles
                    // Check Diagonals (Left-Down and Right-Down)
                    let slideLeft = false;
                    let slideRight = false;

                    if (col > 0 && !particleSystem.grid[col - 1][nextRow] && !particleSystem.grid[col - 1][row]) slideLeft = true;
                    if (col < particleSystem.cols - 1 && !particleSystem.grid[col + 1][nextRow] && !particleSystem.grid[col + 1][row]) slideRight = true;

                    if (slideLeft && slideRight) {
                        // Random choice
                        this.isStatic = false;
                        this.vel.x = random() > 0.5 ? -2 : 2;
                    } else if (slideLeft) {
                        this.isStatic = false;
                        this.vel.x = -2;
                    } else if (slideRight) {
                        this.isStatic = false;
                        this.vel.x = 2;
                    }
                }
            }
        }
    }

    display() {
        if (!this.active) return;
        circle(this.pos.x, this.pos.y, particleRadius * 2);
    }

    isDead() {
        // Clean up if inactive or fallen way out of bounds (bug safety)
        return !this.active || this.pos.y > height + 50;
    }
}
