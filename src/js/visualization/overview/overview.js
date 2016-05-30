/* jshint esversion: 6 */

import Visualization from "./../visualization";
import Particle from "../particle";

export default class ParticlesContainer extends Visualization {

    /**
     * @param container
     */
    constructor(stage) {
        super(stage);
        this.particles = [];
    }

    createParticles(dataset){
        this.particles = [];
        for (let i = 0; i < dataset.length; i++) {
            this.particles.push(new Particle(dataset[i], 0, 0, 0, 0));
        }
    }

    reset(){
        this.particles = [];
    }

    draw(newParticles) {
        // Calculate the size of a particle
        let availableAreaHighestBar = this.heightVisualization * this.widthVisualization;
        let areaEveryParticle = availableAreaHighestBar / this.particles.length;
        let sizeEveryParticle = Math.sqrt(areaEveryParticle);

        // Except for integers we want to make the particles smaller
        // Example particlesPerRow = 3.5, so we need to create at least 4 particles per row
        let particlesPerRow = Math.floor(this.widthVisualization / sizeEveryParticle);
        particlesPerRow = this.particles.length === 1 ? 1 : ++particlesPerRow;
        let size = this.widthVisualization / particlesPerRow;
        size = Math.min(this.heightVisualization, this.widthVisualization, size);

        let x, y = this.heightVisualization + this.padding, particlesRowCounter = 0, particleNumberInRow = 0;
        let transitionType = $("select.transition").val();

        for (let i = 0; i < this.particles.length; i++) {
            particleNumberInRow = particlesRowCounter++ % particlesPerRow;
            x = size * particleNumberInRow + this.padding;

            this.particles[i].alpha = 1;

            if (newParticles) {
                this.particles[i].setPosition(x, y).setSize(size-3, -size+3);
            } else {
                this.particles[i].transitionTo(x,y, size-3, -size+3, transitionType);
            }

            if (particleNumberInRow === particlesPerRow - 1) {
                y = y - size;
            }
        }
    }
}
