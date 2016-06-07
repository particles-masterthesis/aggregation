import BaseMap from "./base-map";

export default class DotMap extends BaseMap {

    constructor(width, height, particles, levelOfDetail){
        super(width, height, levelOfDetail, true);
        this.particles = particles;

        super.show(true, true);
        this.drawDots(this.particles);
    }

    drawDots(particles){
        let point, size = 3;
        for(let particle of particles){
            point = [particle.data.Longitude, particle.data.Latitude];
            point = this.baseMap.projection(point);

            particle.setPosition(point[0]-(size/2), point[1]-(size/2)).setSize(size, size);
        }
    }

    removeAllDomNodes(){}
}
