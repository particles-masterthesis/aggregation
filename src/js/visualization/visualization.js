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
        this.distanceRatio = 0;
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
        if (!this.position.equals(this.destination)) {
            let deltaX = this.destination.x - this.position.x;
            let deltaY = this.destination.y - this.position.y;
            let distance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));

            if (distance <= this.speed) {
                this.position.set(this.destination.x, this.destination.y);
            } else {
                this.distanceRatio = this.speed / distance;
                this.position.set(this.position.x + deltaX * this.distanceRatio, this.position.y + deltaY * this.distanceRatio);
            }
        }

        // SCALE
        if (this.scale.x != this.aimedScale.x || this.scale.y != this.aimedScale.y) {
            let deltaX = this.aimedScale.x - this.scale.x;
            let deltaY = this.aimedScale.y - this.scale.y;

            if (Math.abs(this.scale.x - this.aimedScale.x) < 0.001) {
                this.scale.set(this.aimedScale.x, this.aimedScale.y);
            } else {
                this.scale.set(this.scale.x + deltaX * this.distanceRatio, this.scale.x + deltaY * this.distanceRatio);
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
        else{
            let p = this.position.equals(this.destination);
            let x = this.scale.x == this.aimedScale.x;
            let y = this.scale.y == this.aimedScale.y;
            return this.isAnimating;
        }

        return this.isAnimating;
    }

    calculateSpeed(amountOfFrames){
        let deltaX = this.destination.x - this.position.x;
        let deltaY = this.destination.y - this.position.y;
        let distance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
        this.speed = distance/amountOfFrames;
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
