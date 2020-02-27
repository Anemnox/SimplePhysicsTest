import * as THREE from "three";

let Vector3 = THREE.Vector3;
let Euler = THREE.Euler;

Euler.prototype.add = function(euler) {
   this.x += euler.x;
   this.y += euler.y;
   this.z += euler.z;
}

Euler.prototype.scale = function (scalar) {
   this.x *= scalar;
   this.y *= scalar;
   this.z *= scalar;
}

class GameScene {
   constructor() {
      this.scene = new THREE.Scene();
      this.cameras = [];
      this.renderer = new THREE.WebGLRenderer();
      this.staticObjects = [];
      this.dynamicObjects = [];
   }

   update(ms) {
      this.dynamicObjects.forEach((obj) => {
         obj.update(ms);
      });

   }

   // Add/Remove objects from the Game Scene
   // @param {GameObject} reference to the object you would like to remove.
   // @param {array} array to add/remove from.
   addStaticObject(object) {
      this.add(object, this.staticObjects);
   }
   addDynamicObject(object) {
      this.add(object, this.dynamicObjects);
   }
   removeStaticObject(object) {
      this.remove(object, this.staticObjects);
   }
   removeDynamicObject(object) {
      this.remove(object, this.dynamicObjects);
   }
   add(object, array) {
      array.push(object);
      this.scene.add(object.graphicsObject);
   }
   remove(object, array) {
      let index = array.indexOf(object);
      if(index !== -1) {
         array.splice(index, 1);
         this.scene.remove(object.graphicsObject);
      }
   }
}

class GameObject {

   constructor(object3D) {
      this.graphicsObject = object3D;
      this.boundingMesh = object3D.clone();
      this.velocity = new Vector3(0, 0, 0);
      this.rotationalVelocity = new Euler(0, 0, 0);
   }

   update(ms) {
      let o = this.graphicsObject;
      let v = this.velocity.clone()
      let drv = this.rotationalVelocity.clone();
      v.multiplyScalar(ms);
      drv.scale(ms);
      o.position.add(v);
      o.rotation.add(drv);
   }
}

class ForceVector {
   constructor(force, position) {
      this.force = force;
      this.position = position;
   }
}

export { GameScene, GameObject };
export default null;
