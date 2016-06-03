import BaseMap from "./base-map";

export default class ChoroplethMap extends BaseMap {

    constructor(container, particles, levelOfDetail, colorScheme){
        super(container, levelOfDetail, true);
        this.particles = particles;
        this.levelOfDetail = levelOfDetail;
        this.colorScheme = colorScheme;

        this.drawChoropleth();
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

    removeChoropleth(){
        if (typeof this.counties !== 'undefined') this.removeSvgElement('counties');
        if (typeof this.states !== 'undefined') this.removeSvgElement('states');
    }

    removeSvgElement(element){
        this.baseMap._d3.selectAll(`#choropleth-${element}`).remove();
        this.baseMap.svg.attr('class', 'Empty');
        this[element] = undefined;
    }


    update(levelOfDetail, colorScheme){
        this.levelOfDetail = levelOfDetail;
        this.colorScheme = colorScheme;
        super.updateBaseMap(levelOfDetail);
        this.drawChoropleth();
        this.baseMap.svg.attr('class', this.colorScheme);
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
