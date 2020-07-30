import * as THREE from "three";
import * as GilbertCore from "./GilbertCore";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import model from "./models/untitled.glb";
import map from "./models/testPlane.glb";

let gameScene = new GilbertCore.GameScene();
let player = null;


gameScene.cameras.push(
   new THREE.PerspectiveCamera(
      75, window.innerWidth/window.innerHeight, 0.1, 1000
   )
);

gameScene.cameras[0].position.set(0, 6, 10);
gameScene.cameras[0].rotation.set(-0.3, 0, 0);
//gameScene.renderer.antialias = true;
gameScene.scene.background = new THREE.Color( 0xDDDDDD );

//
//
//
var loader = new GLTFLoader();

loader.load( model, function ( gltf ) {
   let obj = gltf.scene;
   obj.position.y = 3;
   obj.rotation.y = Math.PI;
   //obj.rotation.x = Math.PI/2;
   obj.children.forEach((item) => {
      item.castShadow = true;
   });

   //obj.material = new THREE.MeshBasicMaterial( { color: 0x4477aa } );
   player = new GilbertCore.GameObject(obj);
   player.mass = 1;

   player.geoBound = new THREE.BoxGeometry(2, 2, 4);
   player.geoBound.computeBoundingSphere();
   console.log(obj);

   //gameScene.add(player);

}, undefined, function ( error ) {

	console.error( error );

} );

loader.load(map, function (gltf) {
   let obj = gltf.scene.children[2];

   obj.castShadow = true;
   obj.receiveShadow = true;

   //obj.material = new THREE.MeshBasicMaterial( { color: 0x4477aa } );
   plane = new GilbertCore.GameObject(obj);
   plane.mass = 1;
   plane.needsUpdate = false;

   //gameScene.add(plane);

}, undefined, function (error) {
   console.error(error);
});

var geometry = new THREE.BoxGeometry(1, 1, 1);
var geometry2 = new THREE.SphereGeometry(1, 10, 10);

var material = new THREE.MeshPhongMaterial( {
					color: 0x4499aa,
					shininess: 100,
					specular: 0x111111});
var material2 = new THREE.MeshPhongMaterial( {
					color: 0x999999,
					shininess: 10,
					specular: 0x111111});

var cube = new THREE.Mesh( geometry2, material );
var plane = new THREE.BoxGeometry(20, 0.1, 20);
var walls = new THREE.BoxGeometry(0.5, 5, 5);
var floor = new THREE.Mesh( plane, material2 );
//var floor2 = new THREE.Mesh( plane, material2 );

let walls1 = new THREE.Mesh( walls, material2);
walls.recieveShadow = true;
walls.castShadow = true;

floor.rotation.y = 0.1;
//floor2.rotation.z = -0.01;
floor.position.x = 0;
//floor2.position.y = 10;
walls1.position.x = -4;
//walls2.position.x = 3;
walls1.position.y = 3;
//walls2.position.y = 3;
cube.receiveShadow = true;
cube.castShadow = true;
floor.receiveShadow = true;
floor.castShadow = true;
//walls2.recieveShadow = true;
//walls2.castShadow = true;
console.log(floor);
cube.position.set(3, 5, 0.5);
//material.wireframe = true;
let cube2 = new THREE.Mesh( geometry, material );
cube2.position.set(0, 5, -20);
cube2.rotation.y = 0;
cube2.recieveShadow = true;
cube2.castShadow = true;

let object = new GilbertCore.GameObject(cube);
let object2 = new GilbertCore.GameObject(cube2);

let floors = new GilbertCore.GameObject(floor);
//let floors2 = new GilbertCore.GameObject(floor2);
let wall1 = new GilbertCore.GameObject(walls1);
//let wall2 = new GilbertCore.GameObject(walls2);
//let wall3 = new GilbertCore.GameObject(walls3);
//let wall4 = new GilbertCore.GameObject(walls4);

cube.rotation.z = -0.0;
floors.needsUpdate = false;
floors.mass = 1;
//floors2.mass = 100000000;

wall1.mass = 1;
//floors2.needsUpdate = false;
wall1.needsUpdate = false
//wall2.needsUpdate = false;
//wall3.needsUpdate = false;
//wall4.needsUpdate = false;
//wall2.mass = 10000000000000000;
object.velocity.x = 0.0;
object.mass = 1;
object.energyDiffusion = 0.99;
//object2.rotationalVelocity.z = 0.0;

//object.needsUpdate = false;
//console.log(cube.geometry);
gameScene.add(object);
//gameScene.add(object2);
gameScene.add(floors);
gameScene.add(wall1);

//gameScene.add(floors2);

function moveBlock() {
   object.forces.push(new GilbertCore.ForceVector(
      new GilbertCore.Vector3(-1, 0, 0),
      new GilbertCore.Vector3(0, 0, 0)
   ))
}

//**
gameScene.addVectorField((pos, mass) => {
   return new GilbertCore.ForceVector(
      new GilbertCore.Vector3(0, -2.8 * mass, 0),
      new GilbertCore.Vector3(0, 0, 0)
   )
});
//*/


setInterval(() => {
   gameScene.gameLoop();
}, 10);


export default function getGraphics() {
   gameScene.renderer.setSize( window.innerWidth, window.innerHeight );
   return {
      scene: gameScene.scene,
      camera: gameScene.cameras,
      renderer: gameScene.renderer,
   }
}

function getPlayer() {
   return object;
};

export { getPlayer }
