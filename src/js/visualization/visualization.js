import "pixi.js";

export default class Visualization extends PIXI.Container {

    constructor(width, height, particlesContainer) {
        super();
        this.particlesContainer = particlesContainer;
        this.particles = particlesContainer.children;
        this.padding = 120;
        this.width = width;
        this.height = height;
        this.heightVisualization = this._height - this.padding * 2;
        this.widthVisualization = this._width - this.padding * 2;

        this.speed = 3;
        this.isAnimating = false;
        this.destination = new PIXI.Point(0, 0);
        this.aimedScale = new PIXI.Point(1, 1);
    }

    transitionTo(x, y, scale, type) {
        switch (type) {
            case "none":
                this.isAnimating = false;

                this.position.set(x, y);
                this.scale.set(scale, scale);

                this.destination.set(x, y);
                this.aimedScale.set(scale, scale);
                break;

            case "linear":
                this.isAnimating = true;
                this.setDestination(x, y);
                this.setAimedScale(scale, scale);
                break;

            default:
                throw new Error(`Visualization transition type not handled: ${type}`);
        }
    }

    startAnimation() {
        this.isAnimating = true;
    }

    nextStep() {
        if (!this.isAnimating) {
            return false;
        }

        // POSITION
        let distanceRatio;
        if (!this.position.equals(this.destination)) {
            let deltaX = this.destination.x - this.position.x;
            let deltaY = this.destination.y - this.position.y;
            let distance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));

            if (distance <= this.speed) {
                this.position.set(this.destination.x, this.destination.y);
            } else {
                distanceRatio = this.speed / distance;
                this.position.set(this.position.x + deltaX * distanceRatio, this.position.y + deltaY * distanceRatio);
            }
        }

        // SCALE
        if (this.scale.x != this.aimedScale.x || this.scale.y != this.aimedScale.y) {
            let deltaX = this.aimedScale.x - this.scale.x;
            let deltaY = this.aimedScale.y - this.scale.y;

            if (Math.abs(this.scale.x - this.aimedScale.x) < this.speed/500) {
                this.scale.set(this.aimedScale.x, this.aimedScale.y);
            } else {
                this.scale.set(this.scale.x + deltaX * distanceRatio, this.scale.x + deltaY * distanceRatio);
            }
        }

        // CHECK FOR COMPLETENESS
        if (
            this.position.equals(this.destination) &&
            this.scale.x == this.aimedScale.x &&
            this.scale.y == this.aimedScale.y
        ) {
            this.isAnimating = false;
        }

        return this.isAnimating;

    }

    setSpeed(speed){
        this.speed = speed;
    }

    setAimedScale(x, y) {
        this.aimedScale.set(x, y);
        return this;
    }

    setDestination(x, y) {
        this.destination.set(x, y);
        return this;
    }
}
