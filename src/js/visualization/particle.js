import Visualization from "./visualization";
import "pixi.js";

export default class Particle extends PIXI.Sprite {

    constructor(texture, textureHover, data, x, y, width, height) {
        // call constructor of parent class
        super(texture);

        this.textureDefault = texture;
        this.textureHover = textureHover;

        // Attributes of the parent class
        this.position = new PIXI.Point(x, y);
        this.width = width;
        this.height = height;
        this.margin = 1;

        // Attributes
        // 2px every 1/60 second seem to be a good value
        this.speed = 2;
        this.destination = new PIXI.Point(x, y);
        this.alpha = 1;
        this.aimedSize = {
            width,
            height
        };

        this.data = data;
        this.id = this.data["Row ID"];

        this.shouldAnimate = false;

        this.addClickListener();
    }

    transitionTo(x, y, width, height, type) {

        // console.log(arguments);

        switch (type) {
            case "none":
                this.shouldAnimate = false;
                this.setPosition(x, y);
                this.setSize(width, height);
                break;

            case "linear":
                this.shouldAnimate = true;
                this.setDestination(x, y);
                this.setAimedSize(width, height);
                break;

            default:
                throw new Error(`Transition type not handled: ${type}`);
        }
    }

    animate() {
        if (!this.shouldAnimate) {
            return;
        }

        // console.log("POSITION", this.position, "DESTINATION", this.destination);

        if (!this.position.equals(this.destination)) {
            let deltaX = this.destination.x - this.position.x;
            let deltaY = this.destination.y - this.position.y;
            let distance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
            //console.log("DELTAX", deltaX, "DELTAY", deltaY, "DISTANCE", distance);

            if (distance <= this.speed) {
                this.position.set(this.destination.x, this.destination.y);
            } else {
                let ratio = this.speed / distance;
                //console.log("SPEED", this.speed, "DISTANCE", distance, "RATIO", ratio);

                this.position.set(this.position.x + deltaX * ratio, this.position.y + deltaY * ratio);
                //console.log("POSITION", this.position, "DESTINATION", this.destination);
            }
        }


        if (this._width != this.aimedSize.width || this._height != this.aimedSize.height) {
            if (Math.abs(this._width - this.aimedSize.width) < this.speed*3/4) {
                this.setSize(this.aimedSize.width, this.aimedSize.height);
            }
            else if (this.aimedSize.width > this._width) {
                this.setSize(this._width + this.speed*3/4, this._height + this.speed*3/4);
            }
            else {
                this.setSize(this._width - this.speed*3/4, this._height - this.speed*3/4);
            }
        }

        // this.speed * 2 / 100 = 0.04 alpha each animation call
        if(this.aimedAlpha !== this.alpha){
            if(Math.abs(this.alpha - this.aimedAlpha) < this.speed * 2 / 100){
                this.alpha = this.aimedAlpha;
            }
            else if(this.aimedAlpha < this.alpha){
                this.alpha -= this.speed * 2 / 100;
            } else {
                this.alpha += this.speed * 2 / 100;
            }
        }

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

        //because we want to have always a margin around the particle
        this.width = this._width - this.margin;
        this.height = this._height - this.margin;

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

    fade(type){
        this.shouldAnimate = true;
        if(type === 'in') this.aimedAlpha = 1;
        if(type === 'out') this.aimedAlpha = 0;
        return this;
    }

}
