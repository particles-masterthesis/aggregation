import Particle from "./particle";

export default class ParticlesContainer extends PIXI.Container {
    constructor() {
        super();

        this.hasPriorityChanged = false;
        this.isAnimating = false;
        this.speedPxPerFrame = 2;
        this.amountOfFrames = 0;
    }

    createParticles(dataset, options) {
        this.speedPxPerFrame = options.speedPxPerFrame;

        if (this.children.length === 0) {

            let texture, textureHover;

            if (options.shape === "rectangle") {
                texture = PIXI.Texture.fromImage("dist/img/particle.png");
                textureHover = PIXI.Texture.fromImage("dist/img/particle_hover.png");
            } else {
                texture = PIXI.Texture.fromImage("dist/img/particle_circle.png");
                textureHover = PIXI.Texture.fromImage("dist/img/particle_circle_hover.png");
            }

            // let callbackAdd = data => () => this.showParticleDetails(data);
            // let callbackRemove = () => () => {
            //     if (document.getElementById("dataRow")) {
            //         document.body.removeChild(document.getElementById("dataRow"));
            //     }
            // };

            for (let i = 0; i < dataset.length; i++) {
                let sprite = new Particle(texture, textureHover, dataset[i], 0, 0, options.sizeOfParticles, options.speedPxPerFrame);
                // sprite.on("mouseover", callbackAdd(sprite.data));
                // sprite.on("mouseout", callbackRemove());
                this.addChild(sprite);
            }

            return true;
        }
        else {
            return false;
        }
    }

    showParticleDetails(data) {
        var table = document.getElementById("dataRow");
        table = table ? document.body.removeChild(table) : document.createElement("table");

        var features = Object.keys(data);

        let tmp = features.splice(0, Math.round(features.length / 2));
        let tmp2 = features.splice(0, features.length);

        var text = "<tr>";
        tmp.forEach(function (key) {
            text += `<th>${key}</th>`;
        });
        text += "</tr><tr>";
        tmp.forEach(function (key) {
            text += `<td>${data[key]}</td>`;
        });
        text += "</tr><tr>";

        tmp2.forEach(function (key) {
            text += `<th>${key}</th>`;
        });
        text += "</tr><tr>";
        tmp2.forEach(function (key) {
            text += `<td>${data[key]}</td>`;
        });
        text += "</tr>";

        table.innerHTML = text;
        table.id = "dataRow";
        document.body.appendChild(table);
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

    setParticlesSpeed(speed) {
        this.speedPxPerFrame = speed;

        for (let i = 0; i < this.children.length; i++) {
            this.children[i].speed = speed;
        }
    }

    calculateSpeedArrivingSameTime() {
        let counter = 0;
        let sum = 0;
        for (let i = 0; i < this.children.length; i++) {
            let deltaX = this.children[i].destination.x - this.children[i].position.x;
            let deltaY = this.children[i].destination.y - this.children[i].position.y;
            let distance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
            sum += distance;
            this.children[i].distance = distance;

            if (distance > 0) {
                counter++;
            }
        }

        if(counter === 0){
            return 0;
        }

        let averageDistance = Math.floor(sum / counter);
        this.amountOfFrames = averageDistance / this.speedPxPerFrame;

        for (let i = 0; i < this.children.length; i++) {
            console.log(this.children[i].distance, this.amountOfFrames);

            this.children[i].speed = this.children[i].distance / this.amountOfFrames;
            delete this.children[i].distance;
        }

        return this.amountOfFrames;
    }

    getAmountOfFrames() {
        return this.amountOfFrames;
    }

    moveParticles(to, transition, origin, yTranslate, ratio) {
        let particle;

        if (to === "left") {
            for (let i = 0; i < this.children.length; i++) {
                particle = this.children[i];

                if (particle.alpha === 0) {
                    continue;
                }

                particle.transitionTo(
                    particle.position.x - particle.position.x / 2,
                    origin.y + particle.position.y / 2,
                    particle.width / 2,
                    particle.height / 2,
                    transition
                );
            }

            return this.calculateSpeedArrivingSameTime();

        } else if (to === "top") {
            for (let i = 0; i < this.children.length; i++) {
                particle = this.children[i];
                if (particle.alpha === 0) {
                    continue;
                }

                particle.transitionTo(
                    origin.x + particle.position.x * ratio,
                    particle.position.y * ratio - yTranslate * ratio,
                    particle.width * ratio,
                    particle.height * ratio,
                    transition
                );
            }

            return this.calculateSpeedArrivingSameTime();
        }
    }

    moveParticlesDestination(canvasWidth, canvasHeight, to, transition, width, yTranslate, ratio) {
        let particle;

        if (to === "right") {
            for (let i = 0; i < this.children.length; i++) {
                particle = this.children[i];
                if (particle.alpha === 0) {
                    continue;
                }

                particle.transitionTo(
                    particle.destination.x - particle.destination.x / 2 + canvasWidth / 2,
                    particle.destination.y - particle.destination.y / 2 + canvasHeight / 4,
                    particle.aimedSize.width / 2,
                    particle.aimedSize.height / 2,
                    transition
                );
            }
        } else if (to === "bottom") {
            for (let i = 0; i < this.children.length; i++) {
                particle = this.children[i];
                if (particle.alpha === 0) {
                    continue;
                }

                particle.transitionTo(
                    particle.destination.x = canvasWidth / 2 - width / 2 + particle.destination.x * ratio,
                    particle.destination.y = canvasHeight / 2 + particle.destination.y * ratio - yTranslate * ratio,
                    particle.aimedSize.width * ratio,
                    particle.aimedSize.height = particle.aimedSize.height * ratio,
                    transition
                );
            }
        }
    }

    moveParticlesBack(canvasWidth, canvasHeight, from, transition, width, yTranslate, ratio) {
        if (from === "right") {
            let particle;
            for (let i = 0; i < this.children.length; i++) {
                particle = this.children[i];
                if (particle.alpha === 0) {
                    continue;
                }
                particle.transitionTo(
                    particle.position.x * 2 - canvasWidth,
                    (particle.position.y - canvasHeight / 4) * 2,
                    particle.width * 2,
                    particle.height * 2,
                    transition
                );
            }

            return this.calculateSpeedArrivingSameTime();
        } else if (from === "bottom") {
            let particle;
            for (let i = 0; i < this.children.length; i++) {
                particle = this.children[i];
                if (particle.alpha === 0) {
                    continue;
                }
                particle.transitionTo(
                    (particle.position.x + width / 2 - canvasWidth / 2) / ratio,
                    (particle.position.y + yTranslate * ratio - canvasHeight / 2) / ratio,
                    particle.width / ratio,
                    particle.height / ratio,
                    transition
                );
            }

            return this.calculateSpeedArrivingSameTime();
        }
    }
}
