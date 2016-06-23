import Visualization from "./visualization";
import "pixi.js";

export default class Particle extends PIXI.Sprite {

    constructor(texture, textureHover, data, x, y, size, speed) {
        super(texture);

        this.textureDefault = texture;
        this.textureHover = textureHover;

        this.width = this.height = size;
        this.margin = 1;
        this.alpha = 1;

        this.destination = new PIXI.Point(x, y);
        this.isAnimating = false;
        this.distanceRatio = 0;
        this.speed = speed;
        this.aimedSize = {
            "width": size,
            "height": size
        };
        this.aimedAlpha = 1;

        this.data = data;
        this.id = this.data["Row ID"];

        this.addClickListener();
    }

    transitionTo(x, y, width, height, type) {
        switch (type) {
            case "none":
                this.isAnimating = false;

                this.setPosition(x, y);
                this.setDestination(x,y);

                this.setSize(width, height);
                this.setAimedSize(width, height);
                break;

            case "linear":
                this.isAnimating = true;
                this.setDestination(x, y);
                this.setAimedSize(width, height);
                break;

            default:
                throw new Error(`Particles transition type not handled: ${type}`);
        }
    }

    animate() {
        if (!this.isAnimating) {
            return false;
        }

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

        if (this.width != this.aimedSize.width || this.height != this.aimedSize.height) {
            let deltaX = this.aimedSize.width - this.width;
            let deltaY = this.aimedSize.height - this.height;

            if (Math.abs(this.width - this.aimedSize.width) < this.speed) {
                this.setSize(this.aimedSize.width, this.aimedSize.height);
            } else {
                this.setSize(this.width + deltaX * this.distanceRatio, this.height + deltaY * this.distanceRatio);
            }
        }
        // console.log("\n\n\nALPHA ANIMATION");
        // console.log(this.aimedAlpha);
        // console.log(this.alpha);
        if(
            (this.aimedAlpha !== null && this.aimedAlpha !== undefined) &&
            this.aimedAlpha !== this.alpha
        ){
            if(Math.abs(this.alpha - this.aimedAlpha) < this.speed * 2 / 100){
                this.alpha = this.aimedAlpha;
            }
            else if(this.aimedAlpha < this.alpha){
                this.alpha -= this.speed * 2 / 100;
            } else {
                this.alpha += this.speed * 2 / 100;
            }
        }

        if (
            this.position.equals(this.destination) &&
            this._width == this.aimedSize.width &&
            this._height == this.aimedSize.height &&
            this.alpha === this.aimedAlpha
        ) {
            this.isAnimating = false;
        }

        return this.isAnimating;
    }

    setPosition(x, y) {
        this.position.set(x, y);
        return this;
    }

    setAlpha(e) {
        this.alpha = e;
        return this;
    }

    setDestination(x, y) {
        this.destination.set(x, y);
        return this;
    }

    setSize(width, height) {
        this.width = width;
        this.height = height;
        return this;
    }

    setAimedSize(width, height) {
        this.aimedSize.width = width;
        this.aimedSize.height = height;
        return this;
    }

    addClickListener(stage) {
        this.interactive = true;
        this.buttonMode = true;

        this.on("mouseover", function (ev) {
            this.texture = this.textureHover;
        }.bind(this));

        this.on("mouseout", function (ev) {
            this.texture = this.textureDefault;
        }.bind(this));
    }

    fade(type) {
        this.isAnimating = true;
        if (type === 'in') this.aimedAlpha = 1;
        if (type === 'out') this.aimedAlpha = 0;
        return this;
    }

}
