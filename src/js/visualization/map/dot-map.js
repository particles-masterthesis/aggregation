import BaseMap from "./base-map";

export default class DotMap extends BaseMap {

    constructor(
        width,
        height,
        particleContainer,
        levelOfDetail,
        colorScheme
    ){
        super(
            width,
            height,
            particleContainer,
            levelOfDetail,
            true,
            colorScheme
        );
        this.size = 5;
        super.show(true, true);
    }

    drawData(){
        let point;
        for(let particle of this.particles){
            point = [particle.data.Longitude, particle.data.Latitude];
            point = this.baseMap.projection(point);
            particle.coords = point;
            particle
            .setPosition(
                particle.coords[0]-(this.size/2),
                particle.coords[1]-(this.size/2)
            )
            .setSize(
                this.size,
                this.size
            );
        }
    }
}
