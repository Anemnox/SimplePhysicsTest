import * as THREE from "three";
import * as GilbertCore from "./GilbertCore";

let gameScene = new GilbertCore.GameScene();

gameScene.cameras.push(
   new THREE.PerspectiveCamera(
      75, window.innerWidth/window.innerHeight, 0.1, 1000
   )
);

gameScene.cameras[0].position.set(0, 0, 5);
gameScene.cameras[0].rotation.set(-0.0, 0, 0);
//gameScene.renderer.antialias = true;
gameScene.scene.background = new THREE.Color( 0xDDDDDD );

var geometry = new THREE.BoxGeometry(1, 1, 1);
var material = new THREE.MeshBasicMaterial( { color: 0x4477aa } );
material.wireframe = true;
var material2 = new THREE.MeshBasicMaterial( { color: 0x222222 } );

var cube = new THREE.Mesh( geometry, material );
var plane = new THREE.BoxGeometry(5, 0.1, 5);
var floor = new THREE.Mesh( plane, material2 );
cube.position.set(0, 2, 0);
let object = new GilbertCore.GameObject(cube);
let floors = new GilbertCore.GameObject(floor);

cube.rotation.z = 1;
object.velocity.y = -0.00;
object.rotationalVelocity.z = 0.01;
console.log(cube.geometry);
gameScene.add(object);
gameScene.add(floors);

setInterval(() => {
   gameScene.update(1);
}, 10);


export default function getGraphics() {
   gameScene.renderer.setSize( window.innerWidth, window.innerHeight );
   return {
      scene: gameScene.scene,
      camera: gameScene.cameras,
      renderer: gameScene.renderer,
   }
}
