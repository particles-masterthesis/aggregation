import BaseMap from "./base-map";

export default class ChoroplethMap extends BaseMap {

    constructor(width, height, particles, levelOfDetail, colorScheme){
        super(width, height, levelOfDetail, true);
        this.particles = particles;
        this.levelOfDetail = levelOfDetail;
        this.colorScheme = colorScheme;

        super.show(true, true);

        this.drawChoropleth();
        this.drawLegend();
    }

    drawChoropleth(){
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

    drawLegend(){

        let map = this.baseMap;
        let values = [0, 2, 4, 8, 16, 32, 64, 128, 256];
        let width = 40, height = 20;

        if (typeof this.legend !== 'undefined') return;

        this.legend = map.svg.append("g")
        .attr("id", "choropleth-legend");

        let legend = this.legend.selectAll("g.legend")
        .data(values)
        .enter().append("g")
        .attr("class", "legend");

        legend.append("rect")
        .attr("x", 20)
        .attr("y", (d, i) => { return i * height; })
        .attr("width", width)
        .attr("height", height)
        .attr('class', (d, i) => { return `q${i}-9`; });

        legend.append("text")
        .attr("x", width * 2.5)
        .attr("y", (d, i) => { return (i * height) + height - 5; })
        .text((d, i) => { return `${values[i]} Bestellungen`; });

    }

    removeAllDomNodes(){
        if (typeof this.counties !== 'undefined') this.removeSvgElement('counties');
        if (typeof this.states !== 'undefined') this.removeSvgElement('states');
        if (typeof this.legend !== 'undefined') this.removeSvgElement('legend');
        this.baseMap.reset();
    }

    removeSvgElement(element){
        this.baseMap._d3.selectAll(`#choropleth-${element}`).remove();
        this[element] = undefined;
    }


    update(levelOfDetail, colorScheme){
        this.levelOfDetail = levelOfDetail;
        this.colorScheme = colorScheme;
        super.updateBaseMap(levelOfDetail);
        this.baseMap.svg.attr('class', this.colorScheme);
        this.drawChoropleth();
        this.drawLegend();
    }

    draw(id){
        let map = this.baseMap;

        this[id] = map.svg
        .attr('class', this.colorScheme)
        .append("g")
        .attr("id", `choropleth-${id}`);

        this[id].selectAll("path")
        .data(map._topojson.feature(map.data.us, map.data.us.objects[id]).features)
        .enter()
        .append("path")
        .attr("class", function(d) {
            return map.colorScale(map.symbolScale(d.properties.orders || 0) || 0);
        })
        .attr("d", map.path);
    }

}

// 0
// 2
// 4
// 8
// 16
// 32
// 64
// 128
// 256
