const Spline = require('cubic-spline');

export class Perturbance {
    constructor(magnitude, count) {
        this.magnitude = magnitude;
        this.count = count;

        this.perturbances = []

        let generatedPerturbances = []
        
        do {
            let perturbance = {
                "magnitude": Math.random() * magnitude,
                "position": Math.random() * 1
            }
            generatedPerturbances.push(perturbance)
            generatedPerturbances.sort((a, b) => a.position - b.position);

            let ratesOfChange = [0]
            for (var i=1; i<generatedPerturbances.length; i++){
                ratesOfChange.push(Math.abs(generatedPerturbances[i].magnitude - generatedPerturbances[i-1].magnitude)/(generatedPerturbances[i].position - generatedPerturbances[i-1].position));
            }
            let maxChange = ratesOfChange.reduce(function (p, v) {
                return ( p > v ? p : v );
              })

            if (maxChange < 100) {
                let previousPeriod = JSON.parse(JSON.stringify(generatedPerturbances));
                previousPeriod = previousPeriod.map((item)=> {item.position -= 1; return item});
                
                let nextPeriod = JSON.parse(JSON.stringify(generatedPerturbances));
                nextPeriod = nextPeriod.map((item)=> {item.position += 1; return item});
                
                this.perturbances = [].concat(
                    previousPeriod,
                    generatedPerturbances,
                    nextPeriod
                    )
            } else {
                let index = generatedPerturbances.indexOf(perturbance)
                generatedPerturbances.splice(index, 1)
            }
                    
            
        } while (generatedPerturbances.length < count)

        

        this._spline = new Spline(this.perturbances.map((item)=> {return item.position}), this.perturbances.map((item)=> {return item.magnitude}))
    }

    interpolateMagnitudes(count) {
        // Shamelessly stolen! http://paulbourke.net/miscellaneous/interpolation/
        let magnitudes = [];
        let stepsize = 1 / count;

        var pi0 = this.count-2;
        var pi1 = this.count-1;
        var pi2 = this.count;
        var pi3 = pi2+1;

        for (var i = 0; i < count; i++) {
            let position = i * stepsize;
            // if (position > this.perturbances[pi2].position) {
            //     console.log(`Position is ${position}, larger than ${this.perturbances[pi2].position}. 
            //     Switching to next set of points ${pi0} ${pi1} ${pi2} ${pi3}`)   
            //     pi0+=1;
            //     pi1+=1;
            //     pi2+=1;
            //     pi3+=1;
            //     console.log(`Position is ${position}, larger than ${this.perturbances[pi1].position}, smaller than ${this.perturbances[pi2].position}`)
            // }

            // let mu = (position - this.perturbances[pi1].position)/(this.perturbances[pi2].position - this.perturbances[pi1].position)
            // let y0 = this.perturbances[pi0].magnitude;
            // let y1 = this.perturbances[pi1].magnitude;
            // let y2 = this.perturbances[pi2].magnitude;
            // let y3 = this.perturbances[pi3].magnitude;

            // magnitudes.push(this._cubic([y0,y1,y2,y3], mu))
            magnitudes.push(this._spline.at(position));
        }
        return magnitudes;
    }

    _bezier(t, p0, p1, p2, p3){
        var cX = 3 * (p1.x - p0.x),
            bX = 3 * (p2.x - p1.x) - cX,
            aX = p3.x - p0.x - cX - bX;
              
        var cY = 3 * (p1.y - p0.y),
            bY = 3 * (p2.y - p1.y) - cY,
            aY = p3.y - p0.y - cY - bY;
              
        var x = (aX * Math.pow(t, 3)) + (bX * Math.pow(t, 2)) + (cX * t) + p0.x;
        var y = (aY * Math.pow(t, 3)) + (bY * Math.pow(t, 2)) + (cY * t) + p0.y;
              
        return {x: x, y: y};
      }

      _cubic (p, x) {
		return p[1] + 0.5 * x*(p[2] - p[0] + x*(2.0*p[0] - 5.0*p[1] + 4.0*p[2] - p[3] + x*(3.0*(p[1] - p[2]) + p[3] - p[0])));
    }
}