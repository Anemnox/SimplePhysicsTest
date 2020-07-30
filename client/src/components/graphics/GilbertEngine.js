import * as THREE from "three";
import * as Help from "./Helper.js"

let Vector3 = THREE.Vector3;
let Euler = THREE.Euler;


Euler.prototype.add = function (euler) {
   this.x += euler.x;
   this.y += euler.y;
   this.z += euler.z;
   return this;
}


Euler.prototype.scale = function (scalar) {
   this.x *= scalar;
   this.y *= scalar;
   this.z *= scalar;
   return this;
}


Euler.prototype.lengthSq = function () {
   return this.x * this.x +
         this.y * this.y +
         this.z * this.z;
}


Vector3.prototype.toString = function () {
   return "{" + this.x + ", " + this.y + ", " + this.z + "}";
}


class GameScene {
   constructor() {
      this.scene = new THREE.Scene();
      this.cameras = [];
      this.renderer = new THREE.WebGLRenderer();
      this.objects = [];
      this.forceVectorField = [];

      this.renderer.shadowMapEnabled = true;
   }


   /**
   *  Updates the scene a single time based on the change in time.
   *  @param {double} ms delta time from last update
   */
   update(ms) {

   }


   // Check the movement constraints of a object one and two and updates
   // the given data to its constraints
   //
   collisionCheck(data1, data2) {

   }


   /**
      Add objects from the Game Scene

      @param {GameObject} object reference to the object you would like to add.
   */
   add(object) {
      this.objects.push(object);
      this.scene.add(object.graphicsObject);
   }


   /**
      Remove objects from the Game Scene

      @param {GameObject} object reference to the object you would like to
               remove.
   */
   remove(object) {
      let index = this.objects.indexOf(object);
      if(index !== -1) {
         this.objects.splice(index, 1);
         this.scene.remove(object.graphicsObject);
      }
   }


   /**
      Adds a force vector field that acts on objects in the Game Scene

      @param {Function} func a function that should return a ForceVector object
               based on a given x, y, z coordinate.
   */
   addVectorField(func) {
      if(func instanceof Function)
         this.forceVectorField.push(func);
   }
}


class GameObject {
   constructor(object3D) {
      this.graphicsObject = object3D;
      try {
         this.geoBound = object3D.geometry.clone();
      } catch (e) {
         this.geoBound = new THREE.BoxGeometry(1, 1, 1);
      }
      this.position = object3D.position.clone();
      this.rotation = object3D.rotation.clone();
      if(!(this.geoBound instanceof THREE.Geometry)) {
         this.geoBound = new THREE.Geometry().fromBufferGeometry(this.geoBound);
         this.geoBound.mergeVertices();
      }

      this.mass = 1;
      this.needsUpdate = true;

      this.forces = [];

      this.energyDiffusion = 1;

      this.velocity = new Vector3(0, 0, 0);
      this.rotationalVelocity = new Euler(0, 0, 0);

      this.geoBound.computeBoundingSphere();
   }


   updateVelocity(ms) {
      this.forces.forEach((force) => {
         this.velocity.x += force.force.x / this.mass * ms;
         this.velocity.y += force.force.y / this.mass * ms;
         this.velocity.z += force.force.z / this.mass * ms;
      });
      this.forces = [];

      let v = this.velocity.clone()
      let drv = this.rotationalVelocity.clone();
      v.multiplyScalar(ms);
      drv.scale(ms);
   }


   updatePosition() {
      let pos = this.position;
      let rot = this.rotation;
      this.graphicsObject.position.set(pos.x, pos.y, pos.z);
      this.graphicsObject.rotation.set(rot.x, rot.y, rot.z);
   }


   applyForce(force) {
      try {
         let forceVector = force(this.position, this.mass);
         if(forceVector instanceof ForceVector)
            this.forces.push(forceVector);
      } catch (e) {
         console.error(e);
      }
   }


   move(vector) {
      this.position.add(vector);
      this.updatePosition();
   }


   rotate(euler) {
      this.rotation.add(euler);
      this.updatePosition();
   }


   setPosition(x, y, z) {
      this.position.set(x, y, z);
      this.updatePosition();
   }


   setRotation(x, y, z) {
      this.rotation.set(x, y, z);
      this.updatePosition();
   }
}


class ForceVector {
   constructor(force, position) {
      this.force = force;
      this.position = position;
      this.source = null;
   }
}


class CollisionData {
   constructor(object) {
      this.object = object;
      this.vel = object.velocity;
      this.rotVel = object.rotationalVelocity;
      this.collisionTime = null;
      this.reactionalForces = [];
      this.forwardForces = [];
   }
}
