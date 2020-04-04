import * as THREE from "three";
import * as GilbertCore from "./GilbertCore";

let gameScene = new GilbertCore.GameScene();

gameScene.cameras.push(
   new THREE.PerspectiveCamera(
      75, window.innerWidth/window.innerHeight, 0.1, 1000
   )
);

gameScene.cameras[0].position.set(0, 2, 7);
gameScene.cameras[0].rotation.set(-0, 0, 0);
//gameScene.renderer.antialias = true;
gameScene.scene.background = new THREE.Color( 0xDDDDDD );

var geometry = new THREE.BoxGeometry(1, 1, 1);
var geometry2 = new THREE.SphereGeometry(1, 20, 20);

var material = new THREE.MeshBasicMaterial( { color: 0x4477aa } );
material.wireframe = true;
var material2 = new THREE.MeshBasicMaterial( { color: 0x222222 } );

var cube = new THREE.Mesh( geometry2, material );
var plane = new THREE.BoxGeometry(30, 0.1, 5);
var walls = new THREE.BoxGeometry(0.5, 5, 5);
var floor = new THREE.Mesh( plane, material2 );
var floor2 = new THREE.Mesh( plane, material2 );
var walls1 = new THREE.Mesh( walls, material2 );
var walls2 = new THREE.Mesh( walls, material2 );
var walls3 = new THREE.Mesh( walls, material2 );
var walls4 = new THREE.Mesh( walls, material2 );

floor.rotation.z = -0;
floor2.rotation.z = -0.01;
floor.position.x = 0;
floor2.position.x = 0;
walls1.position.x = -3;
walls2.position.x = 3;
walls1.position.y = 3;
walls2.position.y = 3;


cube.position.set(-3, 5, 0);
let cube2 = new THREE.Mesh( geometry, material );
cube2.position.set(0, 5, 0);
let object = new GilbertCore.GameObject(cube);
let object2 = new GilbertCore.GameObject(cube2);

let floors = new GilbertCore.GameObject(floor);
let floors2 = new GilbertCore.GameObject(floor2);
let wall1 = new GilbertCore.GameObject(walls1);
let wall2 = new GilbertCore.GameObject(walls2);
let wall3 = new GilbertCore.GameObject(walls3);
let wall4 = new GilbertCore.GameObject(walls4);

cube.rotation.z = 0.1;
floors.needsUpdate = false;
floors.mass = 20;
floors2.needsUpdate = false;
wall1.needsUpdate = false;
wall2.needsUpdate = false;
wall3.needsUpdate = false;
wall4.needsUpdate = false;
wall2.mass = 10000000000000000;
object.velocity.x = 0.01;
object.mass = 2;
object2.rotationalVelocity.z = 0.0;
//object.needsUpdate = false;
//console.log(cube.geometry);
gameScene.add(object);
gameScene.add(object2);
gameScene.add(floors);
gameScene.add(wall2);

//gameScene.add(floors2);


//**
gameScene.addVectorField((pos, mass) => {
   return new GilbertCore.ForceVector(
      new GilbertCore.Vector3(0, -0.8 * mass, 0),
      new GilbertCore.Vector3(0, 0, 0)
   )
});
//*/

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
