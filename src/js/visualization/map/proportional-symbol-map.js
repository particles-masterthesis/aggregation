import BaseMap from "./base-map";


export default class ProportionalSymbolMap extends BaseMap {

    constructor(width, height, particleContainer, levelOfDetail, animationCb){
        super(width, height, particleContainer, levelOfDetail, true);

        this.levelOfDetail = levelOfDetail;

        super.show(true, true);

        this.drawSymbols(animationCb);
        this.drawLegend();
    }

    drawSymbols(animationCb){
        switch (this.levelOfDetail) {
            case "country":
            case "state":
                if (typeof this.counties !== 'undefined') this.removeSvgElement('counties');
                if (typeof this.states === 'undefined') this.draw("states", animationCb);
                break;
            case "county":
                if (typeof this.states !== 'undefined') this.removeSvgElement('states');
                if (typeof this.counties === 'undefined') this.draw("counties", animationCb);
                break;
            default:
                break;
        }
    }

    draw(id, animationCb){
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
        .enter()
        .append("circle")
        .attr("transform", function(d) {
            let coords = map.path.centroid(d);
            if(isNaN(coords[0]) || isNaN(coords[1])) return;
            return "translate(" + coords + ")";
        });

        if(this.isFunction(animationCb)){
            this[id]
            .attr("r", 0)
            .transition()
            .delay(300)
            .attr("r", function(d) {
                return map.symbolScale(d.properties.orders) || 0;
            })
            .each("end", animationCb);
        } else {
            this[id]
            .attr("r", function(d) {
                return map.symbolScale(d.properties.orders) || 0;
            });
        }
    }


    update(levelOfDetail){
        this.levelOfDetail = levelOfDetail;
        super.updateBaseMap(levelOfDetail);
        this.drawSymbols();
        this.drawLegend();
    }

    removeAllDomNodes(animationCb){
        if (typeof this.counties !== 'undefined') this.removeSvgElement('counties', animationCb);
        if (typeof this.states !== 'undefined') this.removeSvgElement('states', animationCb);
        if (typeof this.legend !== 'undefined') this.removeSvgElement('legend');
    }

    removeSvgElement(element, animationCb){
        if(this.isFunction(animationCb)){
            this[element]
            .transition()
            .attr("r", 0)
            .call(endall, function(){ animationCb(); })
            .remove();

        } else {
            this[element].remove();
        }
        this[element] = undefined;
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

        let tmp = this.legend;

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

        this.legend = tmp;
    }

}
