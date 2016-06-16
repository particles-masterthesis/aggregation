import Visualization from "./../visualization";
import D3 from "./d3";

export default class BaseMap extends Visualization {

    constructor(width, height, particleContainer, levelOfDetail, drawMap) {
        super(width, height, particleContainer);
        this.baseMap = D3.instance;
        this.levelOfDetail = levelOfDetail;

        if(!this.baseMap.svg){
            this.baseMap.init(width, height, levelOfDetail, drawMap);
        }

        if(drawMap) this.updateBaseMap(levelOfDetail);
    }

    updateBaseMap(levelOfDetail){
        this.baseMap.update(levelOfDetail);
    }

    resetSvg(){
        this.baseMap.reset();
    }

    hide(hideSvg, hideMap){
        this.baseMap.hide(hideSvg, hideMap);
    }

    show(showSvg, showMap){
        this.baseMap.show(showSvg, showMap);
    }

    getCentroidOfParticle(particle, levelOfDetail){

        const map = this.baseMap;
        let identifierId;

        if(levelOfDetail === 'country' || levelOfDetail === 'state'){
            levelOfDetail = 'states';
            identifierId = particle.data.StateId;
        } else {
            levelOfDetail = 'counties';
            identifierId = `0500000US${particle.data.StateId}${particle.data.CountyId}`;
        }

        return map.centroids[levelOfDetail][identifierId];
    }

    isFunction(cb){
        return cb && ({}).toString.call(cb) === '[object Function]';
    }

}
