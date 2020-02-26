

class GameObject {

   constructor(object3D) {
      this.graphicsObject = object3D;
      this.dx = 0;
      this.dy = 0;
      this.dz = 0;
      this.dRotX = 0;
      this.dRotY = 0;
      this.dRotZ = 0;
   }

   update(ms) {
      let o = this.graphicsObject;
      o.position.x += this.dx * ms;
      o.position.y += this.dy * ms;
      o.position.z += this.dz * ms;
      o.rotation.x += this.dRotX * ms;
      o.rotation.y += this.dRotY * ms;
      o.rotation.z += this.dRotZ * ms;
   }
}

export default GameObject;
