import BaseMap from "./base-map";


export default class ProportionalSymbolMap extends BaseMap {

    constructor(width, height, particleContainer, levelOfDetail, colorScheme, keepInformation, animationCb){
        super(width, height, particleContainer, levelOfDetail, true, colorScheme);

        this.levelOfDetail = levelOfDetail;
        this.colorScale = this.baseMap.colorScale
        .range(this.baseMap.colorbrewer[this.colorScheme][9]);


        if(!keepInformation){
            this.drawSymbolLegend();
            this.drawColorLegend();
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
            let r = map.symbolScale(d.properties.population) || 0;
            return{
                x: centroid[0],
                x0: centroid[0],
                y: centroid[1],
                y0: centroid[1],
                r: r,
                data: d.properties
            };
        })
        .sort( (a, b) => {
            return b.data.population - a.data.population;
        });

        this[id] = map.svg.append("g")
        .attr("id", `psm-${id}`)
        .attr("class", "bubble")
        .selectAll("circle")
        .data(this.nodes)
        .enter()
        .append("circle")
        .attr("class", `${id}-bubbles`)
        .attr('cx', d => { return d.x; })
        .attr('cy', d => { return d.y; });

        if(this.isFunction(animationCb)){
            this[id]
            .attr("r", 20)
            .attr('fill', d => { return this.colorScale(1); })
            .transition()
            .delay(50)
            .duration(2000)
            .transition()
            .attr('fill', d => {
                return this.colorScale(d.data.orders);
            })
            .transition()
            .attr("r", d => { return d.r; })
            .each("end", animationCb);
        } else {
            this[id]
            .attr('fill', d => {
                return this.colorScale(d.data.orders);
            })
            .attr("r", d => { return d.r; });
        }
        this.symbols = this[id];
    }


    update(levelOfDetail, colorScheme){
        this.levelOfDetail = levelOfDetail;
        this.colorScheme = colorScheme;

        this.colorScale = this.baseMap.colorScale
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
            this.baseMap._d3.selectAll(`#psm-${element}`).remove();
        }
        this[element] = undefined;
    }

    drawSymbolLegend(){
        let map = this.baseMap;

        if (typeof this.symbolLegend !== 'undefined') return;

        this.symbolLegend = map.svg.append("g")
        .attr("id", "psm-symbol-legend")
        .attr("class", "legend")
        .attr("transform", "translate(50, 60)");

        this.symbolLegend.append('text')
        .attr('class', 'info-text')
        .attr('x', 50)
        .attr('y', -21)
        .text('Population');

        let tmp = this.symbolLegend;

        this.symbolLegend = this.symbolLegend
        .selectAll("g")
        .data([1e6, 3e6, 6e6])
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

        if (!forceRedraw && typeof this.colorLegend !== 'undefined') return;
        if (forceRedraw && typeof this.colorLegend !== 'undefined')
            this.removeSvgElement('colorLegend');

        // let values = [];
        // for(var i = 0; i<1000; i++){
        //     let color = this.colorScale(i);
        //     if(!(res.indexOf(color) > -1)){
        //         console.log(i);
        //         res.push(color);
        //     }
        // }

        let values =[1, 112, 223, 334, 445, 556, 667, 778, 889];
        let labels = ["1-112", "112-222", "223-333", "334-444","445-555", "556-666", "667-777", "778-888", "889 <"];
        let map = this.baseMap;
        let width = 40, height = 20;

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
            return this.colorScale(d);
        });

        legend.append("text")
        .attr("x", width * 3.5)
        .attr("y", (d, i) => { return (i * height) + height - 5; })
        .text((d, i) => { return `${labels[i]} ammount of orders`; });
    }

}
