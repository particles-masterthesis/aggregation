import BaseMap from "./base-map";

export default class ProportionalSymbolMap extends BaseMap {

    constructor(container, particles, title, levelOfDetail){
        super(container, levelOfDetail);
        this.particles = particles;
    }

}
