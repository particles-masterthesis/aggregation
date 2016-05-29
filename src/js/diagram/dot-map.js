import Chart from "./chart";
import BaseMap from "./base-map";
export default class DotMap extends Chart {

    constructor(container, dataStore, title, levelOfDetail){

        super(container);
        this.baseMap = new BaseMap(this.width, this.height, levelOfDetail);

        this.data = dataStore.data.slice(0,3);
        this.addItems();

    }

    updateBaseMap(levelOfDetail){
        this.baseMap.update(levelOfDetail);
        this.addItems();
    }

    hide(levelOfDetail){
        this.baseMap.hide();
    }

    show(){
        this.baseMap.show();
    }

    addItems(){
        let items = new PIXI.Graphics();
        items.lineStyle(2, 0x5555AA);
        items.beginFill(0x5555AA);

        let point;
        for(let item of this.data){
            point = [item.Longitude, item.Latitude];
            point = this.baseMap.projection(point);
            console.log(item, point);
            items.drawCircle(point[0], point[1], 3);
        }
        this.stage.addChild(items);
    }
}
