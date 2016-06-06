import BaseMap from "./base-map";


export default class ProportionalSymbolMap extends BaseMap {

    constructor(container, dataStore, particles, levelOfDetail){
        super(container, levelOfDetail, true);
        this.particles = particles;
        this.levelOfDetail = levelOfDetail;
        this.data = dataStore.dataset;

        super.show(true, true);

        this.drawSymbols();
        this.drawLegend();
    }

    drawSymbols(){
        switch (this.levelOfDetail) {
            case "country":
            case "state":
                if (typeof this.counties !== 'undefined') this.removeSvgElement('counties');
                if (typeof this.states === 'undefined') this.draw("states");
                break;
            case "county":
                if (typeof this.states !== 'undefined') this.removeSvgElement('states');
                if (typeof this.counties === 'undefined') this.draw("counties");
                break;
            default:
                break;
        }
    }

    draw(id){
        let map = this.baseMap;

        this[id] = map.svg.append("g")
        .attr("id", `psm-${id}`)
        .attr("class", "bubble")
        .selectAll("circle")
        .data(
            map._topojson.feature(map.data.us, map.data.us.objects[id]).features
            .sort(function(a, b) {
                return (b.properties.orders || 0) - (a.properties.orders || 0);
            })
        )
        .enter().append("circle")
        .attr("transform", function(d) {
            let coords = map.path.centroid(d);
            if(isNaN(coords[0]) || isNaN(coords[1])) return;
            return "translate(" + coords + ")";
        })
        .attr("r", function(d) {
            return map.symbolScale(d.properties.orders) || 0;
        });
    }


    update(levelOfDetail){
        this.levelOfDetail = levelOfDetail;
        super.updateBaseMap(levelOfDetail);
        this.drawSymbols();
        this.drawLegend();
    }

    removeAllDomNodes(){
        if (typeof this.counties !== 'undefined') this.removeSvgElement('counties');
        if (typeof this.states !== 'undefined') this.removeSvgElement('states');
        if (typeof this.legend !== 'undefined') this.removeSvgElement('legend');
    }

    removeSvgElement(element){
        this[element].remove();
        this[element] = undefined;
        this.baseMap._d3.selectAll(`#psm-${element}`).remove();
    }

    drawLegend(){
        let map = this.baseMap;

        if (typeof this.legend !== 'undefined') return;

        this.legend = map.svg.append("g")
        .attr("id", "psm-legend")
        .attr("class", "legend")
        .attr("transform", "translate(50, 60)");

        this.legend.append('circle')
        .attr('class', 'info-bubble')
        .attr('r', 5)
        .attr('cx', 50)
        .attr('cy', -25);

        this.legend.append('text')
        .attr('class', 'info-text')
        .attr('x', 75)
        .attr('y', -21)
        .text('Orders');


        this.legend = this.legend
        .selectAll("g")
        .data([10, 100, 1000])
        .enter().append("g");

        this.legend.append("circle")
        .attr("cy", function(d) { return -map.symbolScale(d); })
        .attr("r", map.symbolScale);

        this.legend.append("text")
        .attr("y", function(d) { return -2 * map.symbolScale(d); })
        .attr("dy", "1.3em")
        .text(this.baseMap._d3.format(".1s"));
    }

}
