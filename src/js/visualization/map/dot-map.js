import BaseMap from "./base-map";

export default class DotMap extends BaseMap {

    constructor(width, height, particles, title, levelOfDetail){
        super(width, height, levelOfDetail);
        this.particles = particles;

        this.drawDots();
    }

    drawDots(){
        let point, size = 3;
        for(let particle of this.particles){
            point = [particle.data.Longitude, particle.data.Latitude];
            point = this.baseMap.projection(point);

            particle.shape = "circle";
            particle.setPosition(point[0]-(size/2), point[1]-(size/2)).setSize(size, size);
        }
    }
}
