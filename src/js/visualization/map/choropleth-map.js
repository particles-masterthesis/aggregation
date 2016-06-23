import BaseMap from "./base-map";

export default class ChoroplethMap extends BaseMap {

    constructor(width, height, particlesContainer, levelOfDetail, colorScheme, animationCb){
        super(width, height, particlesContainer, levelOfDetail, true);
        this.levelOfDetail = levelOfDetail;
        this.colorScheme = colorScheme;

        super.show(true, true);

        this.drawChoropleth(false, animationCb);
        this.drawLegend(false);
    }

    drawChoropleth(forceRedraw, animationCb){
        if(forceRedraw){
            if (typeof this.counties !== 'undefined') this.removeSvgElement('counties');
            if (typeof this.states !== 'undefined') this.removeSvgElement('states');
        }

        switch (this.levelOfDetail) {
            case "country":
            case "state":
                // this.baseMap.colorScale.domain([0, 2100]);
                if (typeof this.counties !== 'undefined') this.removeSvgElement('counties');
                if (typeof this.states === 'undefined') this.draw("states", animationCb);
                break;
            case "county":
                // this.baseMap.colorScale.domain([0, 1000]);
                if (typeof this.states !== 'undefined') this.removeSvgElement('states');
                if (typeof this.counties === 'undefined') this.draw("counties", animationCb);
                break;
            default:
                break;
        }
    }

    drawLegend(forceRedraw){

        let map = this.baseMap;
        let values = [1, 3, 7, 16, 40, 100, 252, 631, 1585];
        let width = 40, height = 20;
        window.map = map;
        if (!forceRedraw && typeof this.legend !== 'undefined') return;
        if (forceRedraw && typeof this.legend !== 'undefined') this.removeSvgElement('legend');

        this.legend = map.svg.append("g")
        .attr("id", "choropleth-legend");

        let legend = this.legend.selectAll("g.legend")
        .data(values)
        .enter()
        .append("g")
        .attr("class", "legend");

        legend.append("rect")
        .attr("x", height)
        .attr("y", (d, i) => { return i * height; })
        .attr("width", width)
        .attr("height", height)
        .attr("fill", d => {
            let scaled = map.colorScale(map.symbolScale(d));
            return this.getColor[scaled];
        });

        legend.append("text")
        .attr("x", width * 2.5)
        .attr("y", (d, i) => { return (i * height) + height - 5; })
        .text((d, i) => { return `${values[i]} Orders`; });

    }

    removeAllDomNodes(animationCb){
        if (typeof this.counties !== 'undefined') this.removeSvgElement('counties', animationCb);
        if (typeof this.states !== 'undefined') this.removeSvgElement('states', animationCb);
        if (typeof this.legend !== 'undefined') this.removeSvgElement('legend');
        this.baseMap.reset();
    }

    removeSvgElement(element, animationCb){
        if(this.isFunction(animationCb)){
            this[element]
            .transition()
            .attr("fill", "#D3D3D3")
            .call(endall, function(){ animationCb(); })
            .remove();
        } else {
            this.baseMap._d3.selectAll(`#choropleth-${element}`).remove();

        }
        this[element] = undefined;
    }

    update(levelOfDetail, colorScheme){
        this.levelOfDetail = levelOfDetail;
        this.colorScheme = colorScheme;
        super.updateBaseMap(levelOfDetail);
        this.baseMap.svg.attr('class', this.colorScheme);
        this.drawChoropleth(true);
        this.drawLegend(true);
    }

    draw(id, animationCb){
        let map = this.baseMap;

        this.getColor = map.colorbrewer[this.colorScheme][9];

        this[id] = map.svg
        .attr('class', this.colorScheme)
        .append("g")
        .attr("id", `choropleth-${id}`);

        this[id] = this[id].selectAll("path")
        .data(map._topojson.feature(map.data.us, map.data.us.objects[id]).features)
        .enter()
        .append("path");

        if(this.isFunction(animationCb)){
            this[id]
            .attr("fill", "#D3D3D3")
            .transition()
            .delay(300)
            .duration(1000)
            .attr("fill", d => {
                let scaled = map.colorScale(
                    map.symbolScale(Number(d.properties.orders) || 0) || 0
                );
                return this.getColor[scaled];
            })
            .each("end", animationCb);
        } else {
            this[id]
            .attr("fill", d => {
                let scaled = map.colorScale(
                    map.symbolScale(Number(d.properties.orders) || 0) || 0
                );
                return this.getColor[scaled];
            });
        }
        this[id].attr("d", map.path);
    }

}
