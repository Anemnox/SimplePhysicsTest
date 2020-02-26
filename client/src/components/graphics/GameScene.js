import * as THREE from "three";

class GameScene {
   constructor() {
      this.scene = new THREE.Scene();
      this.cameras = [];
      this.renderer = new THREE.WebGLRenderer();
      this.staticObjects = [];
      this.dynamicObjects = [];
      this.entities = [];
   }

   update(ms) {
      this.dynamicObjects.forEach((obj) => {
         obj.update(ms);
      });
      this.entities.forEach((entity) => {
         entity.update(ms);
      });


   }

   // Add/Remove objects from the Game Scene
   // @param {GameObject} reference to the object you would like to remove.
   // @param {array} array to add/remove from.
   addEntity(entity) {
      this.add(entity, this.entities);
   }
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
   removeEntity(object) {
      this.remove(object, this.entities);
   }
   add(object, array) {
      array.push(object);
      this.scene.add(object.graphicsObject);
   }
   remove(object, array) {
      let index = array.indexOf(object);
      if(index !== -1) {
         array.splice(index, 1);
         this.scene.remove(object);
      }
   }
}

export default GameScene;
