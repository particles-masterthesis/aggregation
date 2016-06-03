import Visualization from "./../visualization";
import Particle from "../particle";

export default class Overview extends Visualization {

    /**
     * @param container
     */
    constructor(width, height, particles, newParticles) {
        super(width, height);
        this.draw(particles, newParticles);
    }

    draw(particles, newParticles) {
        // Calculate the size of a particle
        let availableAreaHighestBar = this.heightVisualization * this.widthVisualization;
        let areaEveryParticle = availableAreaHighestBar / particles.length;
        let sizeEveryParticle = Math.sqrt(areaEveryParticle);

        // Except for integers we want to make the particles smaller
        // Example particlesPerRow = 3.5, so we need to create at least 4 particles per row
        let particlesPerRow = Math.floor(this.widthVisualization / sizeEveryParticle);
        particlesPerRow = particles.length === 1 ? 1 : ++particlesPerRow;
        let size = this.widthVisualization / particlesPerRow;
        size = Math.min(this.heightVisualization, this.widthVisualization, size);

        let x, y = this.heightVisualization + this.padding, particlesRowCounter = 0, particleNumberInRow = 0;
        let transitionType = $("select.transition").val();

        for (let i = 0; i < particles.length; i++) {
            particleNumberInRow = particlesRowCounter++ % particlesPerRow;
            x = size * particleNumberInRow + this.padding;

            particles[i].alpha = 1;

            if (newParticles) {
                particles[i].setPosition(x, y).setSize(size-3, -size+3);
            } else {
                particles[i].transitionTo(x,y, size-3, -size+3, transitionType);
            }

            if (particleNumberInRow === particlesPerRow - 1) {
                y = y - size;
            }
        }
    }
}
