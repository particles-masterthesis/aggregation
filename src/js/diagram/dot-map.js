import BaseMap from "./base-map";

export default class DotMap extends BaseMap {

    constructor(container, dataStore, title, levelOfDetail){
        super(container, levelOfDetail);
        this.data = dataStore.data;

        let shape = 'rectangle';
        this.addItems(shape);
    }

    addItems(shape){
        let items = new PIXI.Graphics();
        items.lineStyle(2, 0x5555AA);
        items.beginFill(0x5555AA);

        let point;
        for(let item of this.data){
            point = [item.Longitude, item.Latitude];
            point = this.baseMap.projection(point);

            let size = 1;
            items.drawRect(point[0]-(size/2), point[1]-(size/2), size, size);
        }
        this.stage.addChild(items);
    }
}
