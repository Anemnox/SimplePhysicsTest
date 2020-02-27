import * as THREE from "three";
import * as GilbertCore from "./GilbertCore";

let gameScene = new GilbertCore.GameScene();

gameScene.cameras.push(
   new THREE.PerspectiveCamera(
      75, window.innerWidth/window.innerHeight, 0.1, 1000
   )
);

gameScene.cameras[0].position.set(0, 0, 5);
//gameScene.renderer.antialias = true;


var geometry = new THREE.BoxGeometry(1, 1, 1);
var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
var cube = new THREE.Mesh( geometry, material );


let object = new GilbertCore.GameObject(cube);

//object.rotationalVelocity.x = 0.01;
object.rotationalVelocity.y = 0.01;
object.rotationalVelocity.z = 0.01;


gameScene.addDynamicObject(object);

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
