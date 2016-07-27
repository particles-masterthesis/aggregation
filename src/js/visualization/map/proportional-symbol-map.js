import BaseMap from "./base-map";


export default class ProportionalSymbolMap extends BaseMap {

    constructor(width, height, particleContainer, levelOfDetail, colorScheme, animationCb){
        super(width, height, particleContainer, levelOfDetail, true, colorScheme);

        this.levelOfDetail = levelOfDetail;

        super.show(true, true);

        this.drawSymbols(false, animationCb);
        this.drawLegend();
    }

    drawSymbols(forceRedraw, animationCb){
        if(forceRedraw){
            if (typeof this.counties !== 'undefined') this.removeSvgElement('counties');
            if (typeof this.states !== 'undefined') this.removeSvgElement('states');
        }

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

        const data = map._topojson.feature(map.data.us, map.data.us.objects[id]).features;

        this.nodes = data
        .filter( d => {
            let centroid = map.path.centroid(d);
            return !(isNaN(centroid[0]) || isNaN(centroid[1]));
        })
        .map( d => {
            let centroid = map.path.centroid(d);
            let orders = d.properties.orders || 0;
            let r = map.symbolScale(orders) || 0;
            return{
                x: centroid[0],
                x0: centroid[0],
                y: centroid[1],
                y0: centroid[1],
                r: r,
                value: orders
            };

        })
        .sort( (a, b) => {
            return b.value - a.value;
        });



        this[id] = map.svg.append("g")
        .attr("id", `psm-${id}`)
        .attr("class", "bubble")
        .selectAll("circle")
        .data(this.nodes)
        .enter()
        .append("circle")
        .attr('fill', d => {
            let scaled = map.colorScale(d.r);
            return this.getColor[scaled];
        })
        .attr('cx', d => { return d.x; })
        .attr('cy', d => { return d.y; });

        if(this.isFunction(animationCb)){
            this[id]
            .attr("r", 0)
            .transition()
            .delay(500)
            .duration(1000)
            .attr("r", d => { return d.r; })
            .each("end", animationCb);
        } else {
            this[id]
            .attr("r", d => { return d.r; });
        }
        this.symbols = this[id];
    }


    update(levelOfDetail, colorScheme){
        this.levelOfDetail = levelOfDetail;
        this.colorScheme = colorScheme;
        this.getColor = this.baseMap.colorbrewer[this.colorScheme][9];
        super.updateBaseMap(levelOfDetail);
        this.drawSymbols(true);
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
