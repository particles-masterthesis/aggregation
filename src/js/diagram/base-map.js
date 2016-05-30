import Chart from "./chart";
import D3 from "./d3";

export default class BaseMap extends Chart {

    constructor(container, levelOfDetail) {
        super(container);
        this.baseMap = D3.instance;
        this.baseMap.init(this.width, this.height, levelOfDetail);
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

    addItems(shape = 'circle', size = 1, data = this.data){
        let items = new PIXI.Graphics();
        items.lineStyle(2, 0x5555AA);
        items.beginFill(0x5555AA);
console.log(data);
        let point;
        for(let item of data){
            point = [item.Longitude, item.Latitude];
            point = this.baseMap.projection(point);
            switch (shape) {
                case 'circle':
                    items.drawCircle(point[0], point[1], size);
                    break;
                case 'rectangle':
                    items.drawRect(point[0]-(size/2), point[1]-(size/2), size, size);
                    break;
                default:
                    items.drawCircle(point[0], point[1], size);
                    break;
            }
        }
        this.stage.addChild(items);
    }

}
