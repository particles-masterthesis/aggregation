function sleep(ms) {
    return new Promise(function (resolve, reject) {
        setTimeout(resolve, ms);
    });
}

function animateParticleToCentroid(currentViz, levelOfDetail) {
    for (let particle of currentViz.particles) {
        let coords = currentViz.getCentroidOfParticle(
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
        this.reset = 0;
    }

    drawDot() {
        return {
            obj: this.canvas.drawDotMap(
                dataStore.data,
                () => {}
            ),
            type: 'dot'
        };
    }

    fadeOutParticles() {
        for (let particle of this.currentViz.particles) {
            particle.fade('out');
        }
        this.canvas.particlesContainer.startAnimation();
    }

    animate(current, upcoming) {
        return new Promise((resolve, reject) => {
            this.canvas.stop();
            this.currentViz = current.obj;
            this.upcomingVizType = upcoming;

            let upcomingViz = {};
            const transitionKey = `${current.type}_${upcoming}`;
            console.log(transitionKey);
            switch (transitionKey) {
                case 'dot_psm':
                    animateParticleToCentroid(this.currentViz, this.canvas.levelOfDetail);
                    this.canvas.render();
                    upcomingViz.obj = this.canvas.drawProportionalSymbolMap(
                        null,
                        this.currentViz.constructor.name === "ProportionalSymbolMap",
                        () => {
                            this.fadeOutParticles();
                        }
                    );
                    upcomingViz.type = 'psm';
                    resolve(upcomingViz);
                    break;

                case 'dot_choropleth':
                    this.fadeOutParticles();
                    this.canvas.render();
                    upcomingViz.obj = this.canvas.drawChoroplethMap(
                        null,
                        this.currentViz.constructor.name === "ChoroplethMap",
                        () => {
                        }
                    );
                    upcomingViz.type = 'choropleth';
                    resolve(upcomingViz);
                    break;

                case 'dot_cartogram':
                    animateParticleToCentroid(this.currentViz, this.canvas.levelOfDetail);
                    this.canvas.render();

                    upcomingViz.obj = this.canvas.drawCartogram(
                        null,
                        this.currentViz.constructor.name === "Cartogram",
                        () => {
                            this.currentViz.hide(false, true);
                            this.fadeOutParticles();
                        }
                    );
                    upcomingViz.type = 'cartogram';
                    resolve(upcomingViz);
                    break;

                case 'psm_dot':
                case 'choropleth_dot':
                case 'cartogram_dot':
                    this.currentViz.removeAllDomNodes((cb) => {
                        if (this.currentViz.isFunction(cb)) cb();
                        this.canvas.stop();
                        upcomingViz = this.drawDot();
                        this.canvas.render();
                        this.canvas.particlesContainer.startAnimation();
                        resolve(upcomingViz);
                    });
                    break;

                case 'psm_choropleth':
                case 'psm_cartogram':
                case 'choropleth_psm':
                case 'choropleth_cartogram':
                case 'cartogram_psm':
                case 'cartogram_choropleth':
                    let endResult = upcoming;
                    let dotMapPromise = this.animate(current, 'dot');
                    dotMapPromise.then((dotMap) => {
                        sleep(500).then(() => {
                            this.animate(dotMap, endResult)
                                .then((result) => {
                                    resolve(result);
                                });
                        });
                    });
                    break;


                default:
                    throw new Error(`Visualization transition not working with ${upcoming}`);
            }
        });
    }
}
