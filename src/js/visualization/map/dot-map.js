import BaseMap from "./base-map";

export default class DotMap extends BaseMap {

    constructor(width, height, particleContainer, levelOfDetail, animationCb){
        super(width, height, particleContainer, levelOfDetail, true);
        this.size = 5;
        super.show(true, true);
        this.drawDots(this.particles, animationCb);
    }

    drawDots(particles, animationCb){
        let point, size = this.size;
        if(this.isFunction(animationCb)){
            for(let particle of particles){
                point = [particle.data.Longitude, particle.data.Latitude];
                point = this.baseMap.projection(point);

                particle
                .setAlpha(0)
                .setPosition(point[0]-(size/2), point[1]-(size/2))
                .setSize(size, size)
                .setDestination(point[0]-(size/2), point[1]-(size/2))
                .setAimedSize(size, size)
                .fade('in');
            }
        } else {
            for(let particle of particles){
                point = [particle.data.Longitude, particle.data.Latitude];
                point = this.baseMap.projection(point);

                particle
                .setPosition(point[0]-(size/2), point[1]-(size/2))
                .setSize(size, size)
                .setDestination(point[0]-(size/2), point[1]-(size/2))
                .setAimedSize(size, size);
            }
        }
    }

    removeAllDomNodes(){}
}
