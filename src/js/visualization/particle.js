import Visualization from "./visualization";
import "pixi.js";

export default class Particle extends PIXI.Sprite {

    // TODO: USE Particle-Container
    // Use sprites as parent class for particles
    // change function according to sprites
    // set sprite via texture - for example use a small picture or a cat first
    // don't remove anything while rendering, because we sprites gets updated in their position - thats enough
    // draw sprites and not rectangles

    constructor(texture, data, x, y, width, height) {
        // call constructor of parent class
        super(texture);

        // Attributes of the parent class
        this.position = new PIXI.Point(x, y);
        this.width = width;
        this.height = height;

        // Attributes
        // 2px every 1/60 second seem to be a good value
        this.speed = 2;
        this.destination = new PIXI.Point(x, y);
        this.aimedSize = {
            width,
            height
        };

        this.data = data;
        this.id = this.data["Row ID"];

        this.shouldAnimate = false;
    }

    transitionTo(x, y, width, height, type) {
        switch (type) {
            case "none":
                this.shouldAnimate = false;
                this.setPosition(x, y);
                this.setSize(width, height);
                break;

            case "direct":
                this.shouldAnimate = true;
                this.setDestination(x, y);
                this.setNewSize(width, height);
                break;

            default:
                throw new Error(`Transition type not handled: ${type}`);
        }
    }

    animate() {
        if (!this.shouldAnimate) {
            return;
        }

        //console.log("POSITION", this.position, "DESTINATION", this.destination);

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

            if (!this.size.equals(this.newSize.width, this.newSize.height)) {
                this.setSize(this.newSize.width, this.newSize.height);
            }

            if (this.position.equals(this.destination)) {
                this.shouldAnimate = false;
            }
        }
    }

    setPosition(x, y) {
        this.position.set(x, y);
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

    setNewSize(width, height) {
        this.aimedSize.width = width;
        this.aimedSize.height = height;
        return this;
    }

    addClickListener(stage) {
        var shape = new PIXI.Graphics();
        shape.interactive = true;
        shape.buttonMode = true;
        shape.hitArea = new PIXI.Rectangle(this.position.x, this.position.y+this.size.height, this.size.width, Math.abs(this.size.height));

        shape.mouseover = function (ev) {
            console.log("over", this.id);
            this.hover = true;
        }.bind(this);

        shape.mouseout = function (ev) {
            console.log("out", this.id);
            this.hover = false;
        }.bind(this);

        shape.click = function (ev) {
            console.log(this.id);
        }.bind(this);

        stage.addChild(shape);
    }

}
