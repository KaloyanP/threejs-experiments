import {Perturbance} from './Perturbance';
import { BufferGeometry, Float32BufferAttribute, TextureLoader,PointsMaterial, AdditiveBlending, NormalBlending, SubtractiveBlending, Blending, MultiplyBlending } from 'three';
const Spline = require('cubic-spline');

export class Circle {
    constructor(innerSize){
        this.numCircles = 40;
        this.innerCirlceRadius = innerSize;
        this.outerCircleRadius = 4
        this.innerCirclePoints = 100
        this.circleRadiusStep = (this.outerCircleRadius - this.innerCirlceRadius)/this.numCircles;
        this.vertices = [];
        this.perturbanceVector = []

        this.animationTick = 0;
        this.perturbanceIndex = 1;
        
        for (var i = 0; i < 10; i++){
            // our code will cycle through these 4 perturbances
            this.perturbanceVector.push(new Perturbance(2, 20));
        }

        // we start at the *second* perturbance to allow for cubic interpolation
        this.perturbance = this.perturbanceVector[this.perturbanceIndex];

        
        this.geometry = new BufferGeometry();
        
        this.sprite = new TextureLoader().load( 'src/circle.png' );
        
        this.material = new PointsMaterial( {
            map: this.sprite,
            alphaMap: this.sprite,
            size: 5,
            sizeAttenuation: false,
            depthTest: false,
            alphaTest: 0.1,
            blending: NormalBlending,
            transparent: true} );
            this.material.color.setHSL( 1.0, 0.3, 0.7 );
        
            this.updatePositions(this.perturbance);
        }

    _calculatePositions(perturbance) {
        this.vertices = [];
        for ( var i = 0; i < this.numCircles; i ++ ) {
          var numParticlesPerCircle = (i * -0.5 + 1) * this.innerCirclePoints;
          let perturbanceVector = perturbance.interpolateMagnitudes(numParticlesPerCircle);
          for (var j = 0; j < numParticlesPerCircle; j++) {
            let angle = Math.PI * 2/ numParticlesPerCircle * j
            let magnitude = (this.innerCirlceRadius + perturbanceVector[j] * (i)/this.numCircles  +  i * this.circleRadiusStep);
            // let magnitude = (this.innerCirlceRadius + this.circleRadiusStep + i * this.circleRadiusStep);
            var x = Math.sin(angle)*(magnitude);
            var y = Math.cos(angle)*(magnitude);
            var z = 0;
            this.vertices.push( x, y, z );
          }
        };
    }

    _calculatePositions_Cubic(vertices, pert, position) {
        vertices = [];
        for ( var i = 0; i < this.numCircles; i ++ ) {
          var numParticlesPerCircle = (i*0.1 + 1) * this.innerCirclePoints;
          
          let perts = [];
          pert.forEach((p) => {
            perts.push(p.interpolateMagnitudes(numParticlesPerCircle));
          });

          let perturbanceVector2 = [];

          for (var k = 0; k<numParticlesPerCircle; k++){
              // for each point on the circle
              // use cubic interpolation
              // to interpolate between p0 and p1
              let estimate = new Spline([-1,0,1,2],perts.map((p) => {return p[k]})).at(position);
                perturbanceVector2.push(estimate);
            }

        //   let perturbanceVector = perturbance.interpolateMagnitudes(numParticlesPerCircle);
            let perturbanceVector = perturbanceVector2;


          for (var j = 0; j < numParticlesPerCircle; j++) {
            let angle = Math.PI * 2/ numParticlesPerCircle * j
            let magnitude = (this.innerCirlceRadius + perturbanceVector[j] * (i)/this.numCircles  +  i * this.circleRadiusStep);
            // let magnitude = (this.innerCirlceRadius + this.circleRadiusStep + i * this.circleRadiusStep);
            var x = Math.sin(angle)*(magnitude);
            var y = Math.cos(angle)*(magnitude);
            var z = 0;
            this.vertices.push( x, y, z );
          }
        };
    }

    updatePositions() {
        this.animationTick = this.animationTick + 1;
        this.perturbance = this.perturbanceVector[Math.round(this.animationTick / 60) % 10];

        if (this.animationTick % 100 === 0){
            this.perturbanceVector.push(this.perturbanceVector.shift())
            console.log(`Using perturbances `)
        }        

        this.vertices = []
        this._calculatePositions_Cubic(this.vertices, this.perturbanceVector.slice(0,4), (this.animationTick % 100)/100);
        this.geometry.setAttribute( 'position', new Float32BufferAttribute( this.vertices, 3 ) );
        this.geometry.getAttribute( 'position' ).needsUpdate = true;
    }
}