import BaseMap from "./base-map";


export default class ProportionalSymbolMap extends BaseMap {

    constructor(
        width,
        height,
        particleContainer,
        levelOfDetail,
        colorScheme
    ){
        super(
            width,
            height,
            particleContainer,
            levelOfDetail,
            true,
            colorScheme
        );

        super.show(true, true);

        // if(!keepInformation){
        //     this.drawSymbolLegend();
        //     this.drawColorLegend();
        //     this.drawSymbols(false, animationCb);
        // } else{
        //     this.nodes = keepInformation.data;
        //     this.symbols = keepInformation.symbols;

        //     let id;
        //     if(this.levelOfDetail === 'county'){
        //         id = 'counties';
        //     } else {
        //         id = 'states';
        //     }

        //     let container = document.getElementById(`cartogram-${id}`);
        //     if(container == null){
        //         container = document.getElementById(`psm-${id}`);
        //     }
        //     container.parentNode.appendChild(container);

        //     let map = this.baseMap;
        //     this[id] = map.svg
        //     .selectAll(`.${id}-bubbles`)
        //     .transition()
        //     .delay(200)
        //     .duration(1000)
        //     .attr('cx', d => { return d.x0; })
        //     .attr('cy', d => { return d.y0; })
        //     .each("end", animationCb);
        //     this.symbols = this[id];
        // }
    }

    initSymbols(nodes, symbols){
        let map = this.baseMap;

        this.nodes = nodes == null? map.nodes[this.id]: nodes;
        this.nodes.sort( (a, b) => {
            return b.data.population - a.data.population;
        });

        if(symbols){
            this[this.id] = symbols;
            map.svg
            .select(`#${this[this.id][0].parentNode.id}`)
            .attr("id", `psm-${this.id}`);
            return;
        }

        this[this.id] = map.svg.append("g")
        .attr("id", `psm-${this.id}`)
        .attr("class", "bubble")
        .selectAll("circle")
        .data(this.nodes)
        .enter()
        .append("circle")
        .attr('cx', d => { return d.x0; })
        .attr('cy', d => { return d.y0; });
    }

    drawDefaultSymbols(){
        this[this.id]
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
        this[this.id]
        .attr('fill', d => {
            return this.colorScale(d.particles);
        });
    }

    scaleSymbols(defaultValue, animationCb){
        this[this.id]
        .transition()
        .duration(1000)
        .attr("r", d => { return defaultValue || d.r; })
        .call(window.endall, animationCb);
    }

    update(levelOfDetail, colorScheme){
        if(levelOfDetail !== this.levelOfDetail){
            this.removeSvgElement(this.id);
            this.levelOfDetail = levelOfDetail;

            this.setId();

            this.initSymbols(
                super.updateParticlesOnLevel(levelOfDetail)
            );
            this.scaleSymbols(false, () => {
                this.colorSymbols();
            });

            super.updateBaseMap(levelOfDetail);
        }

        if(colorScheme !== this.colorScheme){
            this.colorScheme = colorScheme;

            this.colorScale = this.baseMap.colorScale
            .range(this.baseMap.colorbrewer[this.colorScheme][9]);
            this.colorSymbols();
            this.drawColorLegend(true);
        }
        this.drawSymbolLegend();
    }

    removeAllDomNodes(animationCb){
        this.removeSvgElement('colorLegend');
        this.removeSvgElement('symbolLegend');
        this.removeSvgElement(this.id, () => {
            this.removeSvgElement(this.id);
            animationCb();
        });
    }

    removeSvgElement(element, animationCb){
        if(this.isFunction(animationCb)){
            this[element]
            .transition()
            .attr("r", 0)
            .call(endall, function(){ animationCb(); });
        } else{
            this[element].remove();
            this.baseMap._d3.selectAll(`#psm-${element}`).remove();
            return delete this[element];
        }
    }

    drawSymbolLegend(){
        let map = this.baseMap;

        if (typeof this.symbolLegend !== 'undefined') return;

        let symbolLegendX = map.legendWidth - 180;
        let symbolLegendY = 200 + 280;

        this.symbolLegend = map.legendSvg.append("g")
        .attr("id", "psm-symbolLegend")
        .attr("class", "legend")
        .attr("transform", `translate(${symbolLegendX},${symbolLegendY})`);

        this.symbolLegend.append('text')
        .attr('class', 'info-text')
        .attr('x', 80)
        .attr('y', -44)
        .text('Population');

        let tmp = this.symbolLegend;

        this.symbolLegend = this.symbolLegend
        .selectAll("g")
        .data([3e6, 9e6, 18e6])
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

        this.colorLegend = map.legendSvg.append("g")
        .attr("id", "psm-colorLegend");

        let colorLegendX = map.legendWidth - 250;
        let colorLegendY = 200;

        let legend = this.colorLegend.selectAll("g.legend")
        .data(values)
        .enter()
        .append("g")
        .attr("transform", `translate(${colorLegendX},${colorLegendY})`)
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
