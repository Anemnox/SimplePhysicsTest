import React from "react";
import getGraphics from "./graphics/VisualCore";
import { getPlayer } from "./graphics/VisualCore";
import * as GilbertCore from "./graphics/GilbertCore";

class GraphicsCanvas extends React.Component {
   constructor(props) {
      super(props);

      this.canvas = null;

   }

   componentDidMount() {
      let object = getGraphics();
      this.canvas.appendChild(object.renderer.domElement);
		var animate = function () {
			requestAnimationFrame( animate );
			object.renderer.render( object.scene, object.camera[0] );
		};
		animate();
      window.addEventListener("keyDown", (key) => this.handleKey(key));
   }

   render() {
      return (
         <div ref={(ref) => this.canvas = ref} onKeyPress={this.handleKey} tabIndex="-1">
         </div>
      );
   }

   handleKey = (key) => {
      switch (key.key) {
         case "a":
            getPlayer().forces.push(new GilbertCore.ForceVector(
               new GilbertCore.Vector3(-5, 0, 0),
               new GilbertCore.Vector3(0, 0, 0)
            ));
            break;
         case "s":
            getPlayer().forces.push(new GilbertCore.ForceVector(
               new GilbertCore.Vector3(0, 0, 5),
               new GilbertCore.Vector3(0, 0, 0)
            ));
            break;
         case "d":
            getPlayer().forces.push(new GilbertCore.ForceVector(
               new GilbertCore.Vector3(5, 0, 0),
               new GilbertCore.Vector3(0, 0, 0)
            ));
            break;
         case "w":
            getPlayer().forces.push(new GilbertCore.ForceVector(
               new GilbertCore.Vector3(0, 0, -5),
               new GilbertCore.Vector3(0, 0, 0)
            ));
            break;
         case " ":
            getPlayer().forces.push(new GilbertCore.ForceVector(
               new GilbertCore.Vector3(0, 40, 0),
               new GilbertCore.Vector3(0, 0, 0)
            ));
            break;
         default:
            console.log(key.key);
      }
   }
}

export default GraphicsCanvas;
