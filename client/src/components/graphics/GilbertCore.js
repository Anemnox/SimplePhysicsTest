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
      this.objects = [];
      this.forceVectorField = [];
   }

   /**
   *  Updates the scene a single time based on the change in time.
   *  @param {double} ms delta time from last update
   */
   update(ms) {
      this.objects.forEach((obj1, i1) => {
         if(obj1.needsUpdate) {
            this.forceVectorField.forEach((force) => {
               obj1.applyForce(force);
            });

            obj1.applyForce();
            obj1.updateFuture(ms);

            this.objects.forEach((obj2, i2) => {
               if(i1 !== i2) {
                  let sphere1 = new THREE.Sphere();
                  let sphere2 = new THREE.Sphere();
                  sphere1.copy(obj1.geoBound.boundingSphere);
                  sphere2.copy(obj2.geoBound.boundingSphere);
                  sphere1.center = obj1.position;
                  sphere2.center = obj2.position;
                  if(sphere1.intersectsSphere(sphere2)) {
                     obj1.graphicsObject.material.color.setHex( 0xff0000 );
                  } else {
                     obj1.graphicsObject.material.color.setHex( 0x333333 );
                  }
               }
            });
            obj1.acceptFuture();
         }
      });
   }

   // Add/Remove objects from the Game Scene
   // @param {GameObject} reference to the object you would like to remove.
   // @param {array} array to add/remove from.
   add(object) {
      this.objects.push(object);
      this.scene.add(object.graphicsObject);
   }
   remove(object) {
      let index = this.objects.indexOf(object);
      if(index !== -1) {
         this.objects.splice(index, 1);
         this.scene.remove(object.graphicsObject);
      }
   }
}

class GameObject {
   constructor(object3D) {
      this.graphicsObject = object3D;
      this.geoBound = object3D.geometry.clone();
      this.position = object3D.position.clone();
      this.rotation = object3D.rotation.clone();

      this.mass = 1;
      this.needsUpdate = true;

      this.forces = [];

      this.velocity = new Vector3(0, 0, 0);
      this.rotationalVelocity = new Euler(0, 0, 0);

      this.geoBound.computeBoundingSphere();
   }

   updateFuture(ms) {
      let v = this.velocity.clone()
      let drv = this.rotationalVelocity.clone();
      v.multiplyScalar(ms);
      drv.scale(ms);
      this.position.add(v);
      this.rotation.add(drv);
   }

   acceptFuture() {
      let pos = this.position;
      let rot = this.rotation;
      this.graphicsObject.position.set(pos.x, pos.y, pos.z);
      this.graphicsObject.rotation.set(rot.x, rot.y, rot.z);
   }

   applyForce(force) {
      
   }

   setPosition(x, y, z) {
      this.position.set(x, y, z);
      this.acceptFuture();
   }

   setRotation(x, y, z) {
      this.rotation.set(x, y, z);
      this.acceptFuture();
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
