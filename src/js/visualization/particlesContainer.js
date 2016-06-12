export default class ParticlesContainer extends PIXI.Container {
    constructor() {
        super();

        this.hasPriorityChanged = false;
        this.isAnimating = false;
    }

    startAnimation(){
        this.isAnimating = true;
    }

    nextStep(){
        if(!this.isAnimating){
            return;
        }

        let particlesReachedDestinations = true;
        let particleReachedDestination;
        let particle;

        if(this.hasPriorityChanged){

            console.log("hPC true");

            for (let i = 0; i < this.children.length; i++) {
                particle = this.getChildAt(i);

                if (particle.priority === 1) {

                    particleReachedDestination = !this.getChildAt(i).animate();
                    console.log("reached destination ", particleReachedDestination);

                    if (particlesReachedDestinations === true && particleReachedDestination === false) {
                        particlesReachedDestinations = false;
                    }
                }
            }

            if(particlesReachedDestinations){
                this.hasPriorityChanged = false;
            }
        } else {

            console.log("hPC false");

            for (let i = 0; i < this.children.length; i++) {
                particleReachedDestination = !this.getChildAt(i).animate();

                if(particleReachedDestination === false && particlesReachedDestinations === true){
                    particlesReachedDestinations = false;
                }
            }

            if(particlesReachedDestinations){
                this.isAnimating = false;
            }
        }
    }

    resetHighPriorityParticles(){
        for(let i=0; i<this.children.length; i++){
            this.children[i].priority = 0; // priority = low
        }
    }

    setHighPriorityParticles(barWithHighPriority){
        for(let i=0; i<this.children.length; i++){
            if(this.children[i].bar == barWithHighPriority){
                this.children[i].priority = 1; // priority = high
            } else {
                this.children[i].priority = 0; // priority = low
            }
        }

        this.hasPriorityChanged = true;
    }
}
