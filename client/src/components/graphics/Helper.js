/**
   Uses Three.js Vectors and Euler classes to calculate values.
*/

let TOLERENCE = 0.001

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
export function timeOfIntersectPlaneLine(lineVector, linePoint,
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
export function isInsideTriangle(point, a, b, c) {
   let v1 = b.clone().sub(a);
   let v2 = c.clone().sub(a);
   let v3 = point.clone().sub(a);

   let omega1 = v1.angleTo(v2);
   let omega2 = v2.angleTo(v3);
   let omega3 = v1.angleTo(v3);
   let tot = omega3 + omega2 - omega1;

   // check angle is between
   if(Math.abs(tot) < TOLERENCE) {
      v1 = a.sub(b);
      v2 = c.sub(b);
      v3 = point.clone().sub(b);

      omega1 = v1.angleTo(v2);
      omega2 = v2.angleTo(v3);
      omega3 = v1.angleTo(v3);
      tot = omega3 + omega2 - omega1;
      //debugger;

      if(Math.abs(tot) < TOLERENCE) {
         return true
      }
   }
   return false;
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
export function getCollisionBox(a, b, c, velocity) {
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
export function withinMinMax(point, min, max) {
   return (point.x > min.x && point.x < max.x) &&
         (point.y > min.y && point.y < max.y) &&
         (point.z > min.z && point.z < max.z);
}

export default null;
