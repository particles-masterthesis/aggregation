import BaseMap from "./base-map";

export default class Cartogram extends BaseMap {

    constructor(container, particles, levelOfDetail){
        super(container, levelOfDetail, false);
        this.particles = particles;
        this.levelOfDetail = levelOfDetail;

        super.show(true, false);

        this.symbolPadding = 5;
        this.drawSymbols();

    }

    drawSymbols(){
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

    draw(id){
        const map = this.baseMap;

        const wrapper = map.svg.append("g").attr("id", `cartogram-${id}`);
        const force = map._d3.layout.force()
        .charge(0)
        .gravity(0)
        .size([this.width - this.symbolPadding, this.height - this.symbolPadding]);

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
                y: centroid[1],
                x0: centroid[0],
                y0: centroid[1],
                r: r,
                value: orders
            };

        });

        this.node = wrapper.selectAll("rect")
        .data(this.nodes)
        .enter()
        .append("rect")
        .attr("class", "rect")
        .attr("width", d => { return d.r * 2; })
        .attr("height", d => { return d.r * 2; });
        this[id] = this.node;

        force
        .nodes(this.nodes)
        .on("tick", this.tick.bind(this))
        .start();
    }

    tick(e) {
        this.node
        .each(this.gravity(e.alpha * 0.1))
        .each(this.collide(0.3))
        .attr("x", d => { return d.x - d.r; })
        .attr("y", d => { return d.y - d.r; });
    }

    gravity(k) {
        return d => {
            d.x += (d.x0 - d.x) * k;
            d.y += (d.y0 - d.y) * k;
        };
    }

    collide(k) {
        let q = this.baseMap._d3.geom.quadtree(this.nodes);
        return node => {
            let nr = node.r + this.symbolPadding;
            let nx1 = node.x - nr;
            let nx2 = node.x + nr;
            let ny1 = node.y - nr;
            let ny2 = node.y + nr;
            q.visit( (quad, x1, y1, x2, y2) => {
                if (quad.point && (quad.point !== node)) {
                    let x = node.x - quad.point.x;
                    let y = node.y - quad.point.y;
                    let lx = Math.abs(x);
                    let ly = Math.abs(y);
                    let r = nr + quad.point.r;

                    if (lx < r && ly < r) {
                        if (lx > ly) {
                            lx = (lx - r) * (x < 0 ? -k : k);
                            node.x -= lx;
                            quad.point.x += lx;
                        } else {
                            ly = (ly - r) * (y < 0 ? -k : k);
                            node.y -= ly;
                            quad.point.y += ly;
                        }
                    }
                }

                return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
            });
        };
    }


    removeAllDomNodes(){
        if (typeof this.counties !== 'undefined') this.removeSvgElement('counties');
        if (typeof this.states !== 'undefined') this.removeSvgElement('states');
    }

    removeSvgElement(element){
        this.baseMap._d3.selectAll(`#cartogram-${element}`).remove();
        this[element] = undefined;
    }

    update(levelOfDetail){
        this.levelOfDetail = levelOfDetail;
        this.drawSymbols();
    }

}


