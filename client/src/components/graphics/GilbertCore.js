import * as THREE from "three";

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
   }

   /**
   *  Updates the scene a single time based on the change in time.
   *  @param {double} ms delta time from last update
   */
   update(ms) {
      ms *= 0.001
      this.objects.forEach((obj1, i1) => {
         if(obj1.needsUpdate) {
            this.forceVectorField.forEach((force, i) => {
               obj1.applyForce(force);
            });

            obj1.updateVelocity(ms);

            let velVector = obj1.velocity.clone();
            let rotVector = obj1.rotationalVelocity.clone();

            this.objects.forEach((obj2, i2) => {
               if(i1 !== i2) {
                  let sphere1 = new THREE.Sphere();
                  let sphere2 = new THREE.Sphere();
                  sphere1.copy(obj1.geoBound.boundingSphere);
                  sphere2.copy(obj2.geoBound.boundingSphere);
                  sphere1.center = obj1.position.clone().add(velVector);
                  sphere2.center = obj2.position;
                  if(sphere1.intersectsSphere(sphere2)) {
                     obj1.graphicsObject.material.color.setHex( 0xff0000 );

                     let temp = this.collisionCheck(velVector, rotVector, obj1, obj2);
                     if(temp[0].lengthSq() < velVector.lengthSq()) {
                        velVector = temp[0];
                     }
                     if(temp[1].lengthSq() < rotVector.lengthSq()) {
                        rotVector = temp[1];
                     }
                  } else {
                     obj1.graphicsObject.material.color.setHex( 0x333333 );
                  }
               }
            });

            obj1.rotate(rotVector);
            obj1.move(velVector);
         }
      });
   }

   // Check the movement constraints of a moving obj1 on a stationary obj2 and
   // returns a velocity
   //
   collisionCheck(vel, objRot, obj1, obj2) {
      let collisionTime = 2;
      let normalForce = new Vector3(0, 0, 0);
      let contactPoint = [];
      let geo1 = obj1.geoBound;
      let geo2 = obj2.geoBound;
      let constrainedVelocity = vel.clone();
      let constrainedRotation = objRot.clone();

      geo1.vertices.forEach((vertex, i) => {
         let velocity = vel.clone();
         let point = vertex.clone().applyEuler(obj1.rotation);

         let isRotating = obj1.rotationalVelocity.lengthSq() !== 0;

         if(isRotating) {
            velocity =
               point.clone().sub(vertex.clone().applyEuler(
                     obj1.rotation.clone().add(objRot))).add(vel);
         }

         point.add(obj1.position);

         geo2.faces.forEach((face, i) => {
            let faceNormal = face.normal.clone().applyEuler(obj2.rotation);
            if((faceNormal.dot(velocity) <= 0)) {
               let facePoint = geo2.vertices[face.a].clone()
                              .applyEuler(obj2.rotation).add(obj2.position);
               let time =
                  timeOfIntersectPlaneLine(
                     velocity, point,
                     faceNormal, facePoint
                  );
               //debugger;
               if(time >= -0.01 && time < 1.1) {
                  let a = geo2.vertices[face.a].clone().applyEuler(obj2.rotation);
                  let b = geo2.vertices[face.b].clone().applyEuler(obj2.rotation);
                  let c = geo2.vertices[face.c].clone().applyEuler(obj2.rotation);
                  let relPointVect = new Vector3(
                        velocity.x * time + point.x,
                        velocity.y * time + point.y,
                        velocity.z * time + point.z
                     );
                  let p = relPointVect.clone().sub(obj2.position);
                  if(isInsideTriangle(p, a, b, c)) {
                     if(time > 1)
                        time = 1;

                     if(time < collisionTime) {
                        //debugger;
                        normalForce = faceNormal.multiplyScalar(-1);
                        contactPoint = relPointVect;
                        constrainedVelocity =
                           velocity.clone().multiplyScalar(time);;
                     }
                  }
               }
            }
         });
      });

         ///**
      geo2.vertices.forEach((vertex, i) => {
         let velocity = vel.clone().multiplyScalar(-1);
         geo1.faces.forEach((face, i) => {
            let point = vertex.clone().applyEuler(obj2.rotation).add(obj2.position);
            let faceNormal = face.normal.clone().applyEuler(obj1.rotation);

            if((faceNormal.dot(velocity) <= 0)) {
               let facePoint = geo1.vertices[face.a].clone().applyEuler(obj1.rotation).add(obj1.position);
               let time =
                  timeOfIntersectPlaneLine(
                     velocity, point,
                     faceNormal, facePoint
                  );

               if(time >= 0 && time <= 1.01) {
                  let a = geo1.vertices[face.a].clone().applyEuler(obj1.rotation);
                  let b = geo1.vertices[face.b].clone().applyEuler(obj1.rotation);
                  let c = geo1.vertices[face.c].clone().applyEuler(obj1.rotation);
                  let relPointVect = new Vector3(
                     velocity.x * time + point.x,
                     velocity.y * time + point.y,
                     velocity.z * time + point.z
                  );
                  let p = relPointVect.clone().sub(obj1.position);

                  //debugger;
                  if(isInsideTriangle(p, a, b, c)) {
                     if(time > 1)
                        time = 1;
                     time = (1 - time);

                     if(time < collisionTime) {
                        //debugger;
                        normalForce = faceNormal.multiplyScalar(-1);
                        contactPoint = relPointVect;
                        constrainedVelocity =
                           velocity.clone().multiplyScalar(-1 * time);;
                     }
                  }
               }
            }
         });
      });

      // */

      if(contactPoint !== null) {
         let vai = Math.cos(Math.PI - vel.angleTo(normalForce)) *
                     vel.length() * 1000;
         let vbi = Math.cos(Math.PI - obj2.velocity.angleTo(normalForce)) *
                     obj2.velocity.length() * 1000;

         let vaf = (obj1.mass - obj2.mass) / (obj1.mass + obj2.mass) * vai +
                     (2 * obj2.mass) / (obj1.mass + obj2.mass) * vbi;
         let vbf = (2 * obj1.mass) / (obj1.mass + obj2.mass) * vai +
                     (obj2.mass - obj1.mass) / (obj1.mass + obj2.mass) * vbi;

         let nf = normalForce.normalize()
         obj1.applyForce(function () {
            return new ForceVector(
               nf.clone().multiplyScalar((vai - vaf) * obj1.mass),
               contactPoint.clone().sub(obj1.position)
            )
         });
         obj2.applyForce(function () {
            return new ForceVector(
               nf.clone().multiplyScalar((vbi - vbf) * obj2.mass),
               contactPoint.clone().sub(obj2.position)
            )
         });
      }

      return [ constrainedVelocity, constrainedRotation ];
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

   acceptFuture() {
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
      this.acceptFuture();
   }

   rotate(euler) {
      this.rotation.add(euler);
      this.acceptFuture();
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

/**
   Returns the time of intesection between a line and plane.
   One unit of time is represented by the given vector.

   @param {Vector3} lineVector a vector the represents the path of a point
   @param {Vector3} linePoint a vector that represents the point at t = 0
            for the path of the point
   @param {Vector3} planeNormal a vector that represents the normal vector
            of the plane
   @param {Vector3} planePoint a vector that represents a point on the plane.
*/
function timeOfIntersectPlaneLine(lineVector, linePoint,
                                 planeNormal, planePoint) {
   return ((-planeNormal.x * ( linePoint.x - planePoint.x ) -
               planeNormal.y * ( linePoint.y - planePoint.y ) -
               planeNormal.z * ( linePoint.z - planePoint.z )) /
               ((planeNormal.x * lineVector.x) +
               (planeNormal.y * lineVector.y) +
               (planeNormal.z * lineVector.z)));
}

/**
   Returns true or false based on if the given point is within the bounds
   of a triangle with the given coordinates. Assumes that the point is on
   the same plane as the triangle.

   @param {Vector3} point a point in 3d space
   @param {Vector3} a first vertex of the triangle
   @param {Vector3} b second vertex of the triangle
   @param {Vector3} c third vertex of the triangle
*/
function isInsideTriangle(point, a, b, c) {
   let v1 = b.clone().sub(a);
   let v2 = c.clone().sub(a);
   let v3 = point.clone().sub(a);

   let omega1 = v1.angleTo(v2);
   let omega2 = v2.angleTo(v3);
   let omega3 = v1.angleTo(v3);
   let tot = omega3 + omega2 - omega1;

   // check angle is between
   if(tot < 0.001 && tot > -0.001) {
      v1 = a.sub(b);
      v2 = c.sub(b);
      v3 = point.clone().sub(b);

      omega1 = v1.angleTo(v2);
      omega2 = v2.angleTo(v3);
      omega3 = v1.angleTo(v3);
      tot = omega3 + omega2 - omega1;
      //debugger;

      if(tot < 0.001 && tot > -0.001) {
         return true
      }
   }
   return false;
}

export { GameScene, GameObject, ForceVector, Vector3 };
export default null;
