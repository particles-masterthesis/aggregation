import BaseMap from "./base-map";

export default class DotMap extends BaseMap {

    constructor(width, height, particles, levelOfDetail){
        super(width, height, levelOfDetail, true);
        this.particles = particles;
        this.size = 10;

        super.show(true, true);
        this.drawDots(this.particles);

    }

    drawDots(particles){
        let point, size = this.size;
        for(let particle of particles){
            point = [particle.data.Longitude, particle.data.Latitude];
            point = this.baseMap.projection(point);

            particle.setPosition(point[0]-(size/2), point[1]-(size/2)).setSize(size, size);
        }
    }

    removeAllDomNodes(){}

    transitionTo(type, canvas){
        let visualization;

        switch(type){
            case 'psm':

                for(let particle of this.particles){
                    let coords  = this.getCentroidOfParticle(particle, canvas.levelOfDetail);
                    particle.transitionTo(coords[0], coords[1], this.size, this.size, 'linear');
                }

                visualization = canvas.drawProportionalSymbolMap(
                    null,
                    false,
                    true,
                    () => {
                        canvas.reset();
                    }
                );

                break;

            case 'choropleth':
                break;

            case 'cartogram':

                for(let particle of this.particles){
                    let coords  = this.getCentroidOfParticle(particle, canvas.levelOfDetail);
                    particle.transitionTo(coords[0], coords[1], this.size, this.size, 'linear');
                }

                break;

            default:
                break;
        }
        // canvas.render();
        return visualization;
    }
}
