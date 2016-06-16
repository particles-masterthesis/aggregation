function animateParticleToCentroid(currentViz, levelOfDetail){
    for(let particle of currentViz.particles){
        let coords  = currentViz.getCentroidOfParticle(
            particle,
            levelOfDetail
        );
        particle.transitionTo(
            coords[0],
            coords[1],
            currentViz.size,
            currentViz.size,
            'linear'
        );
    }
}

export default class TransitionManager {
    constructor(canvas) {
        this.canvas = canvas;
    }

    drawDot(){
        return {
            obj: this.canvas.drawDotMap(
                    dataStore.data,
                    this.currentViz.constructor.name === "DotMap",
                    () => {}
                ),
            type: 'dot'
        };
    }

    animate(current, upcoming){
        this.canvas.stop();
        this.currentViz = current.obj;
        this.upcomingVizType = upcoming;

        let upcomingViz = {};
        const transitionKey = `${current.type}_${upcoming}`;
        console.log(transitionKey);
        switch(transitionKey){

            case 'dot_psm':
                animateParticleToCentroid(this.currentViz, this.canvas.levelOfDetail);
                upcomingViz.obj = this.canvas.drawProportionalSymbolMap(
                    null,
                    this.currentViz.constructor.name === "ProportionalSymbolMap",
                    () => {
                        this.canvas.reset();
                        // for(let particle of this.currentViz.particles){
                        //     particle.fade('out');
                        // }
                    }
                );
                upcomingViz.type = 'psm';
                break;

            case 'dot_choropleth':

                for(let particle of this.currentViz.particles){
                    particle.fade('out');
                }

                upcomingViz.obj = this.canvas.drawChoroplethMap(
                    null,
                    this.currentViz.constructor.name === "ChoroplethMap",
                    () => {
                        this.canvas.reset();
                    }
                );
                upcomingViz.type = 'choropleth';
                break;

            case 'dot_cartogram':
                animateParticleToCentroid(this.currentViz, this.canvas.levelOfDetail);

                upcomingViz.obj = this.canvas.drawCartogram(
                    null,
                    this.currentViz.constructor.name === "Cartogram",
                    () => {
                        this.canvas.reset();
                        // for(let particle of this.currentViz.particles){
                        //     particle.fade('out');
                        // }
                        this.currentViz.hide(false, true);
                    }
                );
                upcomingViz.type = 'cartogram';

                break;

            case 'psm_dot':
            case 'choropleth_dot':
            case 'cartogram_dot':

                // current problem is async callback of upcomingViz and therefore it is an empty object in next transition
                // maybe draw dotmap with timeout and return afterwards?
                this.currentViz.removeAllDomNodes((cb) => {
                    // upcomingViz = this.drawDot();
                    if(this.currentViz.isFunction(cb)) cb();
                });
                upcomingViz = this.drawDot();
                break;

            case 'psm_choropleth':
            case 'psm_cartogram':
            case 'choropleth_psm':
            case 'choropleth_cartogram':
            case 'cartogram_psm':
            case 'cartogram_choropleth':
                this.currentViz.removeAllDomNodes((cb) => {
                    if(this.currentViz.isFunction(cb)) cb();
                });
                upcomingViz = this.drawDot();
                this.canvas.stop();
                this.canvas.render();
                return this.animate(upcomingViz, upcoming);

            default:
                throw new Error(`Visualization transition not working with ${upcoming}`);
        }

        this.canvas.render();
        return upcomingViz;
    }

}
