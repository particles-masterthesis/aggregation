import BaseMap from "./base-map";


export default class ProportionalSymbolMap extends BaseMap {

    constructor(width, height, particleContainer, levelOfDetail, colorScheme, keepInformation, animationCb){
        super(width, height, particleContainer, levelOfDetail, true, colorScheme);

        this.levelOfDetail = levelOfDetail;
        this.colorScale2 = this.baseMap._d3.scale.quantize()
        .domain([0, 100])
        .range(this.baseMap.colorbrewer[this.colorScheme][9]);

        this.drawSymbolLegend();
        this.drawColorLegend();

        if(!keepInformation){
            this.drawSymbols(false, animationCb);
        } else{
            this.nodes = keepInformation.data;
            this.symbols = keepInformation.symbols;

            let id;
            if(this.levelOfDetail === 'county'){
                id = 'counties';
            } else {
                id = 'states';
            }

            let container = document.getElementById(`cartogram-${id}`);
            if(container == null){
                container = document.getElementById(`psm-${id}`);
            }
            container.parentNode.appendChild(container);

            let map = this.baseMap;
            this[id] = map.svg
            .selectAll(`.${id}-bubbles`)
            .transition()
            .delay(200)
            .duration(1000)
            .attr('cx', d => { return d.x0; })
            .attr('cy', d => { return d.y0; })
            .each("end", animationCb);
            this.symbols = this[id];
        }
        super.show(true, true);
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
                value: orders,
                data: d.properties
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
        .attr("class", `${id}-bubbles`)
        .attr('fill', d => {
            return this.colorScale2(d.data.avgQuantity);
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
        this.colorScale2 = this.baseMap._d3.scale.quantize()
        .domain([0, 100])
        .range(this.baseMap.colorbrewer[this.colorScheme][9]);
        super.updateBaseMap(levelOfDetail);
        this.drawSymbols(true);
        this.drawSymbolLegend();
        this.drawColorLegend(true);
    }

    removeAllDomNodes(animationCb){
        if (typeof this.counties !== 'undefined') this.removeSvgElement('counties', animationCb);
        if (typeof this.states !== 'undefined') this.removeSvgElement('states', animationCb);
        if (typeof this.symbolLegend !== 'undefined') this.removeSvgElement('symbolLegend');
        if (typeof this.colorLegend !== 'undefined') this.removeSvgElement('colorLegend');

        this.baseMap._d3.selectAll('#psm-symbol-legend').remove();
        this.baseMap._d3.selectAll('#psm-color-legend').remove();
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

    drawSymbolLegend(){
        let map = this.baseMap;
        console.log(typeof this.symbolLegend !== 'undefined');
        if (typeof this.symbolLegend !== 'undefined') return;

        this.symbolLegend = map.svg.append("g")
        .attr("id", "psm-symbol-legend")
        .attr("class", "legend")
        .attr("transform", "translate(50, 60)");

        this.symbolLegend.append('circle')
        .attr('class', 'info-bubble')
        .attr('r', 5)
        .attr('cx', 50)
        .attr('cy', -25);

        this.symbolLegend.append('text')
        .attr('class', 'info-text')
        .attr('x', 75)
        .attr('y', -21)
        .text('Orders');

        let tmp = this.symbolLegend;

        this.symbolLegend = this.symbolLegend
        .selectAll("g")
        .data([10, 100, 1000])
        .enter().append("g");

        this.symbolLegend.append("circle")
        .attr("cy", function(d) { return -map.symbolScale(d); })
        .attr("r", map.symbolScale);

        this.symbolLegend.append("text")
        .attr("y", function(d) { return -2 * map.symbolScale(d); })
        .attr("dy", "1.3em")
        .text(this.baseMap._d3.format(".1s"));

        this.symbolLegend = tmp;


    }

    drawColorLegend(forceRedraw){
        let map = this.baseMap;
        let values = [0, 12, 23, 34, 45, 56, 67, 78, 89];
        let labels = ["< 12", 12, 23, 34, 45, 56, 67, 78, "78 <"];
        let width = 40, height = 20;

        if (!forceRedraw && typeof this.colorLegend !== 'undefined') return;
        if (forceRedraw && typeof this.colorLegend !== 'undefined')
            this.removeSvgElement('colorLegend');


        this.colorLegend = map.svg.append("g")
        .attr("id", "psm-color-legend");

        let legend = this.colorLegend.selectAll("g.legend")
        .data(values)
        .enter()
        .append("g")
        .attr("transform", "translate(150,0)")
        .attr("class", "legend");

        legend.append("rect")
        .attr("x", height)
        .attr("y", (d, i) => { return i * height; })
        .attr("width", width)
        .attr("height", height)
        .attr("fill", d => {
            return this.colorScale2(d);
        });

        legend.append("text")
        .attr("x", width * 3.5)
        .attr("y", (d, i) => { return (i * height) + height - 5; })
        .text((d, i) => { return `${labels[i]} average order quantity`; });
    }

}
