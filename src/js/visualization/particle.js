/* jshint esversion: 6 */

import Visualization from "./visualization";

export default class Particle {

    constructor(data, x, y, width, height) {
        this.position = new PIXI.Point(x, y);
        this.destination = new PIXI.Point(x, y);

        // 2px every 1/60 second seem to be a good value
        this.speed = 2;

        this.size = {
            width,
            height,
            equals: function (width, height) {
                return this.width === width && this.height === height;
            }
        };
        this.newSize = {
            width,
            height
        };

        this.data = data;
        this.id = this.data["Row ID"];
        this.shouldAnimate = false;
        this.alpha = 1;

        this.shape = "rect";
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
        this.size.width = width;
        this.size.height = height;
        return this;
    }

    setNewSize(width, height) {
        this.newSize.width = width;
        this.newSize.height = height;
        return this;
    }

    draw(graphics) {
        graphics.beginFill(0x5555AA, this.alpha);

        if (this.shape === "rect") {
            graphics.drawRect(this.position.x, this.position.y, this.size.width, this.size.height);
        } else {
            graphics.drawCircle(this.position.x, this.position.y, this.size.width / 2);
        }
    }

}
