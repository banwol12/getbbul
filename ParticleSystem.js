class ParticleSystem {
    constructor() {
        this.particles = [];
        this.particlePool = [];
        this.grid = [];
        this.cols = 0;
        this.rows = 0;
        this.cellSize = particleRadius * 2;
    }

    init() {
        this.cols = ceil(width / this.cellSize);
        this.rows = ceil(height / this.cellSize);
        this.grid = new Array(this.cols).fill(0).map(() => new Array(this.rows).fill(null));

        // Pre-fill pool
        for (let i = 0; i < maxParticles; i++) {
            this.particlePool.push(new Particle());
        }
    }

    update() {
        this.updateGridMap();
        this.handleSpawning();
        this.updateParticles();
    }

    display() {
        // Batch drawing settings
        if (isDay) fill(0, 150, 200, 180); // Teal water
        else fill(100, 150, 255, 180); // Night water

        for (let p of this.particles) {
            p.display();
        }
    }

    updateGridMap() {
        // Clear grid
        for (let i = 0; i < this.cols; i++) {
            for (let j = 0; j < this.rows; j++) {
                this.grid[i][j] = null;
            }
        }

        // Register particles
        for (let p of this.particles) {
            let col = floor(p.pos.x / this.cellSize);
            let row = floor(p.pos.y / this.cellSize);

            // Boundary checks for grid
            if (col >= 0 && col < this.cols && row >= 0 && row < this.rows) {
                this.grid[col][row] = p;
            }
        }
    }

    handleSpawning() {
        if (isDay) return; // No spawning during day

        // Calculate spawn rate based on Moon height (visual influence)
        // Higher moon = slightly more pressure/tide
        let tideIntensity = map(mouseY, 0, height, 5, 1);
        let spawnCount = spawnRateBase * tideIntensity;

        if (this.particles.length >= maxParticles) return;

        for (let i = 0; i < spawnCount; i++) {
            this.spawnParticle();
        }
    }

    spawnParticle() {
        if (this.particlePool.length === 0) return;

        // Find a valid spawn column (random)
        let attempts = 0;
        while (attempts < 10) {
            let c = floor(random(this.cols));

            // Find the lowest empty cell in this column
            // We scan from bottom up to find the "surface" or fill holes
            let r = this.rows - 1;

            // Simple logic: spawn at random empty spot near bottom or just above existing stack
            // To optimize: just spawn at bottom if empty, else look up a bit
            if (!this.grid[c][r]) {
                this.activateParticle(c, r);
                return;
            }

            // If bottom is full, try to find the surface
            while (r > 0 && this.grid[c][r]) {
                r--;
            }

            // Ensure we don't spawn too high instantly
            if (r > 0 && !this.grid[c][r]) {
                this.activateParticle(c, r);
                return;
            }

            attempts++;
        }
    }

    activateParticle(c, r) {
        if (this.particlePool.length > 0) {
            let p = this.particlePool.pop();
            // Position centered in cell
            p.spawn(c * this.cellSize + this.cellSize / 2, r * this.cellSize + this.cellSize / 2);
            this.particles.push(p);
        }
    }

    updateParticles() {
        // We iterate backwards so we can remove particles easily
        for (let i = this.particles.length - 1; i >= 0; i--) {
            let p = this.particles[i];
            p.update();

            if (p.isDead()) {
                this.particlePool.push(p);
                this.particles.splice(i, 1);
            }
        }
    }
}
