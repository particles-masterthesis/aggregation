export default class ParticlesContainer extends PIXI.Container {
    constructor() {
        super();

        this.hasPriorityChanged = false;
        this.isAnimating = false;
    }

    startAnimation() {
        this.isAnimating = true;
    }

    nextStep() {
        if (!this.isAnimating) {
            return false;
        }

        let particlesReachedDestinations = true;
        let particleReachedDestination;
        let particle;

        if (this.hasPriorityChanged) {
            for (let i = 0; i < this.children.length; i++) {
                particle = this.getChildAt(i);

                if (particle.priority === 1) {
                    particleReachedDestination = !particle.animate();

                    if (particlesReachedDestinations === true && particleReachedDestination === false) {
                        particlesReachedDestinations = false;
                    }
                }
            }

            if (particlesReachedDestinations) {
                this.hasPriorityChanged = false;
            }
        } else {
            for (let i = 0; i < this.children.length; i++) {
                particleReachedDestination = !this.getChildAt(i).animate();

                if (particleReachedDestination === false && particlesReachedDestinations === true) {
                    particlesReachedDestinations = false;
                }
            }

            if (particlesReachedDestinations) {
                this.isAnimating = false;
            }
        }

        return this.isAnimating;
    }

    resetHighPriorityParticles() {
        for (let i = 0; i < this.children.length; i++) {
            this.children[i].priority = 0; // priority = low
        }
    }

    setHighPriorityParticles(barWithHighPriority) {
        for (let i = 0; i < this.children.length; i++) {
            if (this.children[i].bar === barWithHighPriority) {
                this.children[i].priority = 1; // priority = high
            } else {
                this.children[i].priority = 0; // priority = low
            }
        }

        this.hasPriorityChanged = true;
    }

    moveParticlesOnBasisOfLayout(place, transition, origin, yTranslate, ratio) {
        let particle;

        if (place === "left") {
            for (let i = 0; i < this.children.length; i++) {
                particle = this.children[i];

                if (particle.alpha === 0) {
                    continue;
                }

                particle.transitionTo(
                    particle.position.x - particle.position.x / 2,
                    origin.y + particle.position.y / 2,
                    particle._width / 2,
                    particle._height / 2,
                    transition
                );
            }
        } else if (place === "top") {
            for (let i = 0; i < this.children.length; i++) {
                particle = this.children[i];
                if (particle.alpha === 0) {
                    continue;
                }

                particle.transitionTo(
                    origin.x + particle.position.x * ratio,
                    particle.position.y * ratio - yTranslate * ratio,
                    particle._width * ratio,
                    particle._height * ratio,
                    transition
                );
            }
        }
    }

    moveParticlesDestinationOnBasisOfLayout(canvasWidth, canvasHeight, from, width, yTranslate, ratio){
        let particle;

        if (from === "right") {
            for (let i = 0; i < this.children.length; i++) {
                particle = this.children[i];
                if (particle.alpha === 0) {
                    continue;
                }
                particle.aimedSize.width = particle.aimedSize.width / 2;
                particle.aimedSize.height = particle.aimedSize.height / 2;
                particle.destination.x = particle.destination.x - particle.destination.x / 2 + canvasWidth / 2;
                particle.destination.y = particle.destination.y - particle.destination.y / 2 + canvasHeight / 4;
            }
        } else if (from === "bottom") {
            for (let i = 0; i < this.children.length; i++) {
                particle = this.children[i];
                if (particle.alpha === 0) {
                    continue;
                }
                particle.aimedSize.width = particle.aimedSize.width * ratio;
                particle.aimedSize.height = particle.aimedSize.height * ratio;
                particle.destination.x = canvasWidth / 2 - width / 2 + particle.destination.x * ratio;
                particle.destination.y = canvasHeight / 2 + particle.destination.y * ratio - yTranslate * ratio;
            }
        }
    }

    moveBackParticlesOnBasisOfLayout(canvasWidth, canvasHeight, from, width, yTranslate, ratio){
        if (from === "right") {
            let particle;
            for (let i = 0; i < this.children.length; i++) {
                particle = this.children[i];
                if (particle.alpha === 0) {
                    continue;
                }
                particle.width = particle._width * 2;
                particle.height = particle._height * 2;
                particle.position.x = particle.position.x * 2 - canvasWidth;
                particle.position.y = (particle.position.y - canvasHeight / 4) * 2;
            }
        } else if (from === "bottom") {
            let particle;
            for (let i = 0; i < this.children.length; i++) {
                particle = this.children[i];
                if (particle.alpha === 0) {
                    continue;
                }
                particle.width = particle._width / ratio;
                particle.height = particle._height / ratio;
                particle.position.x = (particle.position.x + width / 2 - canvasWidth / 2) / ratio;
                particle.position.y = (particle.position.y + yTranslate * ratio - canvasHeight / 2) / ratio;
            }
        }
    }
}
