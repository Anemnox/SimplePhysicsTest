import * as THREE from "three";
import GameScene from "./GameScene";
import GameObject from "./GameObject";

let gameScene = new GameScene();

gameScene.cameras.push(
   new THREE.PerspectiveCamera(
      75, window.innerWidth/window.innerHeight, 0.1, 1000
   )
);

gameScene.cameras[0].position.z = 5;




var geometry = new THREE.BoxGeometry(1, 1, 1);
var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
var cube = new THREE.Mesh( geometry, material );

let object = new GameObject(cube);

object.dRotX = 0.01;
object.dRotY = 0.01;

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
