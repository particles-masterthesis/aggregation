import BaseMap from "./base-map";

export default class ProportionalSymbolMap extends BaseMap {

    constructor(container, dataStore, title, levelOfDetail){
        super(container, levelOfDetail);
        this.dataStore = dataStore;

        this.drawSymbols();
    }

    drawSymbols(){

        let items = new PIXI.Graphics();
        items.lineStyle(2, 0x5555AA);
        items.beginFill(0x5555AA, 0.5);


        let dict = {};
        for(let item of this.dataStore.data){
            dict[item.State] = ++dict[item.State] || 1;
        }


        let point;
        for(let feature of this.baseMap.data.centroids.features){
            if(dict.hasOwnProperty(feature.properties.name)){
                point = [
                    feature.geometry.coordinates[0],
                    feature.geometry.coordinates[1]
                ];
                point = this.baseMap.projection(point);

                // let radius = this.baseMap.tmpScale(dict[feature.properties.name]);
                let radius = dict[feature.properties.name];
                items.drawCircle(point[0], point[1], radius);
            }
        }
        this.stage.addChild(items);
    }

}
