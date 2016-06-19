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

        this.speed = 1;
        this.isAnimating = false;
        this.destination = new PIXI.Point(0, 0);
        this.aimedScale = new PIXI.Point(1, 1);
    }

    transitionTo(x, y, scaleX, scaleY, type) {
        switch (type) {
            case "none":
                this.isAnimating = false;
                this.position.set(x, y);
                this.scale.set(scaleX, scaleY);
                break;

            case "linear":
                this.isAnimating = true;
                this.setDestination(x, y);
                this.setAimedScale(scaleX, scaleY);
                break;

            default:
                throw new Error(`Transition type not handled: ${type}`);
        }
    }

    nextStep() {
        if (!this.isAnimating) {
            return false;
        }

        // POSITION
        if (!this.position.equals(this.destination)) {
            let deltaX = this.destination.x - this.position.x;
            let deltaY = this.destination.y - this.position.y;
            let distance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));

            if (distance <= this.speed) {
                this.position.set(this.destination.x, this.destination.y);
            } else {
                let ratio = this.speed / distance;
                this.position.set(this.position.x + deltaX * ratio, this.position.y + deltaY * ratio);
            }
        }

        // SCALE
        if (this.scale.x != this.aimedScale.x || this.scale.y != this.aimedScale.y) {
            let scaleSpeed = this.speed / 500;

            if (Math.abs(this.scale.x - this.aimedScale.x) < scaleSpeed) {
                this.scale.set(this.aimedScale.x, this.aimedScale.y);
            }
            else if (this.aimedScale.x > this.scale.x) {
                this.scale.set(this.scale.x + scaleSpeed, this.scale.x + scaleSpeed);
            }
            else {
                this.scale.set(this.scale.x - scaleSpeed, this.scale.y - scaleSpeed);
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

    setAimedScale(x, y) {
        this.aimedScale.set(x, y);
        return this;
    }

    setDestination(x, y) {
        this.destination.set(x, y);
        return this;
    }
}
