import { BufferGeometry, Float32BufferAttribute, TextureLoader,PointsMaterial, NormalBlending} from 'three';

import { Noise } from "noisejs";

export class Circle {
    constructor(innerSize){
        this.noise = new Noise(0.123);
        this.height = 0;

        this.initials = [];

        this.numCircles = 40; // Number of rings
        this.innerCirlceRadius = 2; // Radius of inside ring
        this.outerCircleRadius = 5; // Radius of outside ring
        this.innerCirclePoints = 100 // Points on the inside ring
        this.vertices = [];

        // How many more points each consecutive ring should have
        // This is useful to make sure the circles don't look sparse
        this.pointsProgression = 0.05

        this.animationTick = 0;
        
        this.geometry = new BufferGeometry();
        this.sprite = new TextureLoader().load( 'src/circle.png' );
        this.material = new PointsMaterial( {
            map: this.sprite,
            alphaMap: this.sprite,
            size: 6,
            sizeAttenuation: false,
            depthTest: false,
            alphaTest: 0.1,
            blending: NormalBlending,
            transparent: true} );
            this.material.color.setHex(0xffffff);
        
            this._calculateInitialPositions();
    }

    _calculateInitialPositions(){
      this.initials = [];
      for ( var i = 0; i < this.numCircles; i ++ ) {
        let ring = {"points":[]};

        var numParticlesPerCircle = (i * this.pointsProgression + 1) * this.innerCirclePoints;
        var circleRadiusStep = (this.outerCircleRadius - this.innerCirlceRadius)/this.numCircles

        for (var j = 0; j < numParticlesPerCircle; j++) {
          let angle = Math.PI * 2/numParticlesPerCircle * j
          let magnitude = (this.innerCirlceRadius +  i * circleRadiusStep);
          var x = Math.sin(angle)*(magnitude);
          var y = Math.cos(angle)*(magnitude);
          var z = 0;
          ring.points.push({x, y, angle, magnitude});
        }
        console.log(`Ring ${i} has ${ring.points.length} points.`)
        this.initials.push(ring);
      };
      
      console.log(`A total of ${0.5 * this.numCircles * (2 * this.innerCirclePoints + (this.numCircles-1) * this.pointsProgression * this.innerCirclePoints)}`)
    }

    _calculatePositions_Perlin(vertices, timeStamp){
      vertices = []
      for ( var i = 0; i < this.initials.length; i ++ ) {  
        for (var j = 0; j < this.initials[i].points.length; j++) {

          let x = this.initials[i].points[j].x;
          let y = this.initials[i].points[j].y;
          let magnitude = this.initials[i].points[j].magnitude;
          let noise = this.noise.perlin3(x, y, timeStamp);
          let angle = this.initials[i].points[j].angle;
          let noise_scale = (this.innerCirlceRadius - magnitude)/2;

          var x_out = Math.sin(angle)*(magnitude + noise * noise_scale);
          var y_out = Math.cos(angle)*(magnitude + noise * noise_scale);

          var z = 0;

          this.vertices.push( x_out, y_out, z );
        }
      };
    }

    updatePositions() {
        this.animationTick = this.animationTick + 1;
        this.vertices = []
        this._calculatePositions_Perlin(this.vertices, this.animationTick/100);
        this.geometry.setAttribute( 'position', new Float32BufferAttribute( this.vertices, 3 ) );
        this.geometry.getAttribute( 'position' ).needsUpdate = true;
    }
}