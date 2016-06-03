import BaseMap from "./base-map";

export default class ProportionalSymbolMap extends BaseMap {

    constructor(width, height, particles, title, levelOfDetail){
        super(width, height, levelOfDetail);
        this.particles = particles;
    }

}
