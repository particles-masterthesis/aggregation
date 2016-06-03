import Visualization from "./../visualization";
import D3 from "./d3";

export default class BaseMap extends Visualization {

    constructor(container, levelOfDetail, drawMap) {
        super(container);
        this.baseMap = D3.instance;
        if(!this.baseMap.svg){
            this.baseMap.init(this.width, this.height, levelOfDetail, drawMap);
        } else if(drawMap) {
            this.updateBaseMap(levelOfDetail);
        }
    }

    updateBaseMap(levelOfDetail){
        this.baseMap.update(levelOfDetail);
    }

    hide(){
        this.baseMap.hide();
    }

    show(){
        this.baseMap.show();
    }
}
