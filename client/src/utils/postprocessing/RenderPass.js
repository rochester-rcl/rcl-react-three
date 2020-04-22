/**
 * @author alteredq / http://alteredqualia.com/
 */

export default function loadRenderPass(threeInstance: Object): typeof Promise {
	return new Promise((resolve, reject) => {
		threeInstance.RenderPass = function ( scene, camera, overrideMaterial, clearColor, clearAlpha ) {

			threeInstance.Pass.call( this );

			this.scene = scene;
			this.camera = camera;

			this.overrideMaterial = overrideMaterial;

			this.clearColor = clearColor;
			this.clearAlpha = ( clearAlpha !== undefined ) ? clearAlpha : 0;

			this.clear = true;
			this.clearDepth = false;
			this.needsSwap = false;

		};

		threeInstance.RenderPass.prototype = Object.assign( Object.create( threeInstance.Pass.prototype ), {

			constructor: threeInstance.RenderPass,

			render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

				var oldAutoClear = renderer.autoClear;
				renderer.autoClear = false;

				this.scene.overrideMaterial = this.overrideMaterial;

				var oldClearColor, oldClearAlpha;

				if ( this.clearColor ) {

					oldClearColor = renderer.getClearColor().getHex();
					oldClearAlpha = renderer.getClearAlpha();

					renderer.setClearColor( this.clearColor, this.clearAlpha );

				}

				if ( this.clearDepth ) {

					renderer.clearDepth();

				}
				renderer.setRenderTarget(this.renderToScreen ? null : readBuffer);
				if (this.clear) renderer.clear(renderer.autoClearColor, renderer.autoClearDepth, renderer.autoClearStenci);
				renderer.render( this.scene, this.camera);

				if ( this.clearColor ) {

					renderer.setClearColor( oldClearColor, oldClearAlpha );

				}

				this.scene.overrideMaterial = null;
				renderer.autoClear = oldAutoClear;
			}

		} );
		resolve(threeInstance);
	});
}
