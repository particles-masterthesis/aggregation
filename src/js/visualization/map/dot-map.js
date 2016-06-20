import BaseMap from "./base-map";

function drawParticle(particle, size, animated){
    if(animated) particle.setAlpha(0);

    particle
    .setPosition(particle.coords[0]-(size/2), particle.coords[1]-(size/2))
    .setSize(size, size)
    .setDestination(particle.coords[0]-(size/2), particle.coords[1]-(size/2))
    .setAimedSize(size, size);

    if(animated) particle.setAimedSize(size, size).fade('in');
}

function drawFunc(particle, size){
    drawParticle(particle, size, true);
    this.particlesContainer.startAnimation();
}

export default class DotMap extends BaseMap {

    constructor(width, height, particleContainer, levelOfDetail, animationCb){
        super(width, height, particleContainer, levelOfDetail, true);
        this.size = 5;
        super.show(true, true);

        this.drawDots(this.particles, animationCb);
    }

    drawDots(particles, animationCb){
        let point, size = this.size;
        for(let particle of particles){
            point = [particle.data.Longitude, particle.data.Latitude];
            point = this.baseMap.projection(point);

            particle.coords = point;

            if(this.isFunction(animationCb)){
                setTimeout(drawFunc.bind(this), 250, particle, this.size);
            } else {
                drawParticle(particle, this.size, false);
            }
        }
    }

    removeAllDomNodes(){}
}
