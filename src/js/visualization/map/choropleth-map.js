import BaseMap from "./base-map";

export default class ChoroplethMap extends BaseMap {

    constructor(
        width,
        height,
        particlesContainer,
        levelOfDetail,
        colorScheme
    ){
        super(
            width,
            height,
            particlesContainer,
            levelOfDetail,
            true,
            colorScheme
        );

        super.show(true, true);
    }

    initNodes(nodes){
        this.nodes = nodes == null? this.nodes : nodes;
        if(typeof this.nodes !== 'undefined') return;

        let map = this.baseMap;
        this.nodes = map.nodes[this.id];
        this.nodes.sort( (a, b) => {
            return b.data.population - a.data.population;
        });
    }

    initUnits(nodes, insertObj){
        this.initNodes(nodes);

        let map = this.baseMap;
        this[`units-${this.id}`] = map.svg
        .append("g")
        .attr("id", `choropleth-units-${this.id}`)
        .selectAll("path")
        .data(this.nodes);

        if(insertObj){
            let node1 = insertObj.node1;
            let node2 = document.getElementById(
                `choropleth-units-${this.id}`
            );
            node2.parentNode.insertBefore(node2, node1);
        }
        this[`units-${this.id}`] = this[`units-${this.id}`]
        .enter()
        .append('path')
        .attr("fill", '#D3D3D3')
        .attr("class", 'show-boundaries')
        .attr("d", map.path);
    }

    initSymbols(){
        this.initNodes();

        let map = this.baseMap;
        this[`symbols-${this.id}`] = map.svg
        .append("g")
        .attr("id", `choropleth-symbols-${this.id}`)
        .attr("class", "bubble")
        .selectAll("circle")
        .data(this.nodes)
        .enter()
        .append('circle')
        .attr('cx', d => { return d.x0; })
        .attr('cy', d => { return d.y0; });
    }

    drawDefaultSymbols(){
        this[`symbols-${this.id}`]
        .attr("r", 20)
        .attr('fill', d => { return this.colorScale(1); })
        .attr('class', d => { return `${this.id}-${d.id}`; });
    }

    colorSymbol(id){
        this.baseMap.svg
        .select(`.${this.id}-${id}`)
        .attr('fill', d => {
            return this.colorScale(d.particles);
        });
    }

    colorSymbols(){
        this[`symbols-${this.id}`]
        .attr('fill', d => { return this.colorScale(d.particles); });
    }

    colorUnits(){
        let units = this[`units-${this.id}`];
        let colorScale = this.colorScale;
        this.transition = this.baseMap._d3
        .transition()
        .duration(1000)
        .each(function(){
            units
            .transition()
            .attr('fill', d => {
                return colorScale(d.particles);
            });
        });
    }

    scaleSymbols(animationCb){
        let that = this;
        let symbols = this[`symbols-${this.id}`];
        this.transition = this.transition || this.baseMap._d3.transition();

        this.transition.transition().each(function(){
            symbols
            .transition()
            .attr('r', 0)
            .call(window.endall, function(){
                animationCb();
            });
        });
    }

    update(levelOfDetail, colorScheme){
        if(levelOfDetail !== this.levelOfDetail){
            this.removeSvgElement(`units-${this.id}`);
            this.levelOfDetail = levelOfDetail;

            this.setId();
            this.initUnits(
                super.updateParticlesOnLevel(levelOfDetail)
            );
            this.colorUnits();

            super.updateBaseMap(levelOfDetail);
        }

        if(colorScheme !== this.colorScheme){
            this.colorScheme = colorScheme;

            this.colorScale = this.baseMap.colorScale
            .range(this.baseMap.colorbrewer[this.colorScheme][9]);
            this.colorUnits();
        }

        this.drawLegend(true);
    }

    removeAllDomNodes(animationCb){
        this.removeSvgElement('colorLegend');
        this.removeSvgElement(`units-${this.id}`);
        this.removeSvgElement(
            `symbols-${this.id}`,
            'symbol',
            () => {
            this.removeSvgElement(`symbols-${this.id}`);
            animationCb();
        });
    }

    removeSvgElement(element, type, animationCb){
        if(this.isFunction(animationCb)){
            console.log(type);
            if(type === 'symbol'){
                this[element]
                .transition()
                .attr('r', 0)
                .call(window.endall, function(){ animationCb(); });
            }

            if(type === 'unit'){
                this[element]
                .transition()
                .attr('fill', '#D3D3D3')
                .call(window.endall, function(){ animationCb(); });
            }
        } else {
            this[element].remove();
            this.baseMap._d3.selectAll(`#choropleth-${element}`)
            .remove();
            return delete this[element];
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
        .attr("id", "choropleth-colorLegend");

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

}
