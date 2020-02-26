import React from "react";
import getGraphics from "./graphics/VisualCore";


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
   }

   render() {
      return (
         <div ref={(ref) => this.canvas = ref}>
         </div>
      );
   }
}

export default GraphicsCanvas;
