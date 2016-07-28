import BaseMap from "./base-map";

export default class ChoroplethMap extends BaseMap {

    constructor(width, height, particlesContainer, levelOfDetail, colorScheme, animationCb){
        super(width, height, particlesContainer, levelOfDetail, true, colorScheme);

        this.levelOfDetail = levelOfDetail;
        this.colorScale = this.baseMap.colorScale
        .range(this.baseMap.colorbrewer[this.colorScheme][9]);

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
        .attr("id", "choropleth-color-legend");

        let legend = this.colorLegend.selectAll("g.legend")
        .data(values)
        .enter()
        .append("g")
        .attr("transform", "translate(0,0)")
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

    removeAllDomNodes(animationCb){
        if (typeof this.counties !== 'undefined') this.removeSvgElement('counties', animationCb);
        if (typeof this.states !== 'undefined') this.removeSvgElement('states', animationCb);
        if (typeof this.legend !== 'undefined') this.removeSvgElement('colorLegend');

        this.baseMap._d3.selectAll('#choropleth-symbol-legend').remove();
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

        this.colorScale = this.baseMap.colorScale
        .range(this.baseMap.colorbrewer[this.colorScheme][9]);

        super.updateBaseMap(levelOfDetail);
        this.drawChoropleth(true);
        this.drawLegend(true);
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
            return{
                type: d.type,
                id: d.id,
                geometry: d.geometry,
                x: centroid[0],
                y: centroid[1],
                value: d.properties.orders
            };
        });

        this[`${id}-units`] = map.svg
        .append("g")
        .attr("id", `choropleth-units-${id}`)
        .selectAll("path")
        .data(this.nodes)
        .enter()
        .append('path')
        .attr('class', 'show-boundaries');

        if(this.isFunction(animationCb)){

            this[`${id}-units`]
            .attr("fill", "#D3D3D3");

            this[`${id}-symbols`] = map.svg
            .append("g")
            .attr("id", `choropleth-symbols-${id}`)
            .selectAll("circle")
            .data(this.nodes)
            .enter()
            .append('circle')
            .attr('cx', d => { return d.x; })
            .attr('cy', d => { return d.y; })
            .attr('r', 20)
            .attr('fill', d => { return this.colorScale(1); });

            var symbols = this[`${id}-symbols`];
            var units = this[`${id}-units`];
            var colorScale = this.colorScale;

            let symbolTransition = map._d3
            .transition()
            .delay(500)
            .duration(1000)
            .each( function() {
                symbols
                .transition()
                .attr('fill', d => { return colorScale(d.value); });
            });

            let unitTransition = symbolTransition
            .transition()
            .duration(1000)
            .each( function() {
                units
                .transition()
                .attr('fill', d => { return colorScale(d.value); })
                .attr("d", map.path);
            });

            unitTransition
            .transition()
            .each( () => {
                symbols
                .transition()
                .attr('r', 0)
                .remove();

                animationCb();
            });

        } else {
            this[`${id}-units`]
            .attr("fill", d => {return this.colorScale(d.value);})
            .attr("d", map.path);
        }

    }

}
