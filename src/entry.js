/**
 * entry.js
 * 
 * This is the first file loaded. It sets up the Renderer, 
 * Scene and Camera. It also starts the render loop and 
 * handles window resizes.
 * 
 */

import { WebGLRenderer, PerspectiveCamera, Scene, Vector3, Vector2, Points, PointLight, LinearToneMapping} from 'three';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';
import Stats from "stats.js";
import { Circle } from './Circle';

const scene = new Scene();
const camera = new PerspectiveCamera();
const renderer = new WebGLRenderer({antialias: true});

// set stats
var stats = new Stats();
stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild( stats.dom );

// camera
camera.position.set(0,0,-15);
camera.lookAt(new Vector3(0,0,0));

// Lights
let light1 = new PointLight(0xffffff,1);
light1.position.set(0,0,-20);
scene.add(light1);

// renderer
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0x00000, 1);
renderer.toneMapping = LinearToneMapping;
renderer.toneMappingExposure = Math.pow( 1, 4.0 );
renderer.autoClear = false;

// set up composer
const composer = new EffectComposer(renderer)
composer.addPass(new RenderPass(scene, camera));

// set up bloomEffect
const bloomPass = new UnrealBloomPass(new Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
bloomPass.enabled = true;
bloomPass.threshold = 0;
bloomPass.strength = 2;
bloomPass.radius =  1;
bloomPass.renderToScreen = true;
composer.addPass(bloomPass);

// render loop
const onAnimationFrameHandler = (timeStamp) => {
  stats.begin();
  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    composer.setSize(canvas.width, canvas.height);
  }

  // renderer.render(scene, camera);
  renderPoints(timeStamp);
  renderer.clear();
  composer.render(timeStamp);
  window.requestAnimationFrame(onAnimationFrameHandler);
  stats.end();
}
window.requestAnimationFrame(onAnimationFrameHandler);

// resize
const windowResizeHanlder = () => { 
  const { innerHeight, innerWidth } = window;
  renderer.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
};

const resizeRendererToDisplaySize = (renderer)=> {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
}

windowResizeHanlder();
window.addEventListener('resize', windowResizeHanlder);

// dom
document.body.style.margin = 0;
document.body.appendChild( renderer.domElement );

let circle = new Circle(2);

var particles = new Points( circle.geometry, circle.material );
scene.add( particles );

const renderPoints = (timeStamp) => {
  circle.updatePositions();
  circle.material.color.setHSL( timeStamp * 0.00001, 0.5, 0.5 );
}