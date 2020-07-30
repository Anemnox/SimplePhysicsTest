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
      let date = new Date();
      this.prevTime = date.getTime();


      this.renderer.shadowMapEnabled = true;

      var spotLight = new THREE.SpotLight( 0xffffff );
      spotLight.position.set( 20, 30, 20 );

      spotLight.castShadow = true;
      spotLight.shadow.radius = 7;

      spotLight.shadow.mapSize.width = 2048;
      spotLight.shadow.mapSize.height = 2048;

      spotLight.shadow.camera.near = 10;
      spotLight.shadow.camera.far = 4000;
      spotLight.shadow.camera.fov = 70;
      this.scene.add(spotLight);
   }

   gameLoop() {
      let date = new Date();
      let currentTime = date.getTime();
      let dT = currentTime - this.prevTime;
      this.update(dT);
      this.prevTime = currentTime;
      //console.log(dT);
   }

   /**
   *  Updates the scene a single time based on the change in time.
   *  @param {double} ms delta time from last update
   */
   update(ms) {
      ms *= 0.0001
      for(let o1 = 0; o1 < this.objects.length; o1++) {
         let obj1 = this.objects[o1];
         if(obj1.needsUpdate) {
            this.forceVectorField.forEach((force, i) => {
               obj1.applyForce(force);
            });
            obj1.updateVelocity(ms);
            let velVector = obj1.velocity.clone();
            let rotVector = obj1.rotationalVelocity.clone();

            for(let o2 = 0; o2 < this.objects.length; o2++) {
               let obj2 = this.objects[o2];
               if(o1 !== o2) {
                  let sphere1 = new THREE.Sphere();
                  let sphere2 = new THREE.Sphere();
                  sphere1.copy(obj1.geoBound.boundingSphere);
                  sphere2.copy(obj2.geoBound.boundingSphere);
                  sphere1.center = obj1.position.clone().add(velVector);
                  sphere2.center = obj2.position;
                  if(sphere1.intersectsSphere(sphere2)) {
                     let temp = this.collisionCheck(velVector, rotVector, obj1, obj2);
                     try {
                        if(temp[0].lengthSq() < velVector.lengthSq()) {
                           velVector = temp[0];
                        }
                        if(temp[1].lengthSq() < rotVector.lengthSq()) {
                           rotVector = temp[1];
                        }
                     } catch (e) {

                     }
                  }
               }
            }
            //console.log(velVector.toString());
            obj1.rotate(rotVector);
            obj1.move(velVector);
         }
      }
   }

   // Check the movement constraints of a moving obj1 on a stationary obj2 and
   // returns a velocity
   //
   collisionCheck(vel, objRot, obj1, obj2) {
      let collisionTime = 2;
      let normalForce = new Vector3(0, 0, 0);
      let contactPoint = [];
      let constrainedVelocity = vel.clone();
      let constrainedRotation = objRot.clone();

      let geo1 = obj1.geoBound;
      let geo2 = obj2.geoBound;

      for(let f = 0; f < geo2.faces.length; f++) {
         if(constrainedVelocity.lengthSq() === 0) {
            break;
         }
         let velocity = constrainedVelocity.clone();
         let face = geo2.faces[f];
         let faceNormal = face.normal
                           .clone().applyEuler(obj2.rotation)
                           .multiplyScalar(velocity.lengthSq());
         let a = geo2.vertices[face.a].clone().applyEuler(obj2.rotation);
         let b = geo2.vertices[face.b].clone().applyEuler(obj2.rotation);
         let c = geo2.vertices[face.c].clone().applyEuler(obj2.rotation);

         let minMax = getCollisionBox(a, b, c, velocity.clone());

         for(let v = 0; v < geo1.vertices.length; v++) {
            let vertex = geo1.vertices[v];
            let point = vertex.clone().applyEuler(obj1.rotation);
            point.add(obj1.position);

            if(withinMinMax(point, minMax[0], minMax[1])) {
               if((faceNormal.dot(velocity) <= 0)) {
                  let facePoint = geo2.vertices[face.a].clone()
                                 .applyEuler(obj2.rotation).add(obj2.position);
                  let time =
                     timeOfIntersectPlaneLine(
                        velocity, point,
                        faceNormal, facePoint
                     );
                  //debugger;
                  if(time >= -0.01 && time < 1.001) {

                     let relPointVect = new Vector3(
                           velocity.x * time + point.x,
                           velocity.y * time + point.y,
                           velocity.z * time + point.z
                        );
                     let p = relPointVect.clone().sub(obj2.position);

                     if(isInsideTriangle(p, a, b, c)) {
                        //debugger;
                        if(Math.abs(time) < 0.0001) {
                           time = 1;
                           //debugger;
                           velocity = lineAlongPlane(faceNormal, velocity);
                        }
                        if(collisionTime > time) {
                           collisionTime = time;
                           normalForce = faceNormal.multiplyScalar(-1);
                           contactPoint[0] = relPointVect;
                           velocity.multiplyScalar(time);
                        }
                     }
                  }
               }
            }
            constrainedVelocity = velocity;
         }
      }

      ///**
      for(let f = 0; f < geo1.faces.length; f++) {
         if(constrainedVelocity.lengthSq() === 0) {
            break;
         }
         let face = geo1.faces[f];
         let faceNormal = face.normal
                           .clone().applyEuler(obj1.rotation);
         let a = geo1.vertices[face.a].clone().applyEuler(obj1.rotation);
         let b = geo1.vertices[face.b].clone().applyEuler(obj1.rotation);
         let c = geo1.vertices[face.c].clone().applyEuler(obj1.rotation);
         let velocity = constrainedVelocity.clone();

         let minMax = getCollisionBox(a, b, c, velocity);

         for(let v = 0; v < geo2.vertices.length; v++) {
            let vertex = geo2.vertices[v];
            let point = vertex.clone().applyEuler(obj2.rotation).add(obj2.position);

            if(withinMinMax(point, minMax[0], minMax[1])) {
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
                        //debugger;
                        if(Math.abs(time) < 0.0001) {
                           time = 1;
                           //debugger;
                           velocity = lineAlongPlane(faceNormal, velocity);
                        }
                        if(collisionTime > time) {
                           collisionTime = time
                           normalForce = faceNormal.multiplyScalar(-1);
                           contactPoint[0] = relPointVect;
                           constrainedVelocity = constrainedVelocity.multiplyScalar(-1 * time);;
                        }
                     }
                  }
               }
            }
         }
      }

      // */

      if(contactPoint.length !== 0) {

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
               nf.clone().multiplyScalar((vai - vaf) * obj1.mass *
                  obj1.energyDiffusion),
               contactPoint[0].clone().sub(obj1.position)
            )
         });
         obj2.applyForce(function () {
            return new ForceVector(
               nf.clone().multiplyScalar((vbi - vbf) * obj2.mass *
                  obj2.energyDiffusion),
               contactPoint[0].clone().sub(obj2.position)
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
      this.source = null;
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
   if(tot < 0.01 && tot > -0.01) {
      v1 = a.sub(b);
      v2 = c.sub(b);
      v3 = point.clone().sub(b);

      omega1 = v1.angleTo(v2);
      omega2 = v2.angleTo(v3);
      omega3 = v1.angleTo(v3);
      tot = omega3 + omega2 - omega1;
      //debugger;

      if(tot < 0.01 && tot > -0.01) {
         return true
      }
   }
   return false;
}

/**
*  Returns true or false based on if the point is on a plane with the given
*  normal vector and point on plane.
*
*  @param {Vector3} point point to Check
*  @param {Vector3} planeNormal the normal vector of the plane to check
*  @param {Vector3} planePoint any point that is on the plane.
*/
function pointIsOnPlane(point, planeNormal, planePoint) {
   return (planeNormal.x * (point.x - planePoint.x)) +
            (planeNormal.y * (point.y - planePoint.y)) +
            (planeNormal.z * (point.z - planePoint.z)) === 0;
}

/**
*  Returns a vector goes along the given plane and is a projection of the given
*  direction vector onto the plane.
*
*  @param {Vector3} planeNormal the normal vector of the plane to check
*  @param {Vector3} direction a direction vector to get the projection of
*/
function lineAlongPlane(planeNormal, direction) {
   let tempLine = planeNormal.clone().cross(direction);
   let d = planeNormal.clone().cross(tempLine);
   let scale = Math.cos(direction.angleTo(d)) *
               direction.length();
   d.normalize().multiplyScalar(scale);
   debugger;
   return d;
}

/**
*  Returns a 2 by 1 array of a minimum point and a maximum point of a bounding
*  box created by this face an velocity.
*
*  @param {Vector3} a first vertex of the triangle
*  @param {Vector3} b second vertex of the triangle
*  @param {Vector3} c third vertex of the triangle
*  @param {Vector3} velocity a vector that represents the outline of possible
*              hitbox.
*
*  @returns [min, max] the min and max bounds of the box created
*/
function getCollisionBox(a, b, c, velocity) {
   let min = new Vector3(0, 0, 0);
   let max = new Vector3(0, 0, 0);
   let arr = [a, b, c,
      a.clone().add(velocity),
      b.clone().add(velocity),
      c.clone().add(velocity),
      a.clone().sub(velocity),
      b.clone().sub(velocity),
      c.clone().sub(velocity)
   ];

   arr.forEach((vect, i) => {
      min.x = Math.min(min.x, vect.x);
      min.y = Math.min(min.y, vect.y);
      min.z = Math.min(min.z, vect.z);
   });

   arr.forEach((vect, i) => {
      max.x = Math.max(max.x, vect.x);
      max.y = Math.max(max.y, vect.y);
      max.z = Math.max(max.z, vect.z);
   });

   return [min, max];
}

/**
*  Checks if the given point is within the bounding box min coordinate and max
*  coordinate.
*
*  @param {Vector3} point point to check
*  @param {Vector3} min minimum point of box
*  @param {Vector3} max maximum point of box
*
*  @returns true or false based on if the point is within bounds
*/
function withinMinMax(point, min, max) {
   return (point.x > min.x && point.x < max.x) &&
         (point.y > min.y && point.y < max.y) &&
         (point.z > min.z && point.z < max.z);
}

export { GameScene, GameObject, ForceVector, Vector3 };
export default null;
