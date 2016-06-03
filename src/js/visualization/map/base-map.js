import Visualization from "./../visualization";
import D3 from "./d3";

export default class BaseMap extends Visualization {

    constructor(width, height, levelOfDetail) {
        super(width, height);
        
        this.baseMap = D3.instance;
        if(!this.baseMap.svg){
            this.baseMap.init(this.width, this.height, levelOfDetail);
        } else {
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
