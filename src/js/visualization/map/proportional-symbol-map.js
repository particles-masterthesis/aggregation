import BaseMap from "./base-map";

export default class ProportionalSymbolMap extends BaseMap {

    constructor(container, dataStore, particles, title, levelOfDetail){
        super(container, levelOfDetail);
        this.particles = particles;
        this.levelOfDetail = levelOfDetail;
        this.data = dataStore.dataset;

        // this.drawSymbols();
    }

    drawSymbols(){
        let map = this.baseMap;
        let counter = 0;
        map.svg.append('g')
        .attr('class', 'bubble')
        .selectAll('circle')
        .data(topojson.feature(map.data.us, map.data.us.objects.counties).features)
        .enter()
        .append('circle')
        .attr('transform', function(d) {
            let x = map.path.centroid(d);
            counter++;
            console.log(counter, d);
            return "translate(" + x + ")";
            // return `translate('${x}')`;
        })
        .attr('r', 1.5);
        switch (this.levelOfDetail) {
            case "country":
                // d3.select("#states").remove();
                // d3.select("#counties").remove();
                break;
            case "state":
                // d3.select("#counties").remove();
                break;
            case "county":
                break;
            default:
                break;
        }
    }

}
