/**
 * @author zz85 / http://www.lab4games.net/zz85/blog
 *
 * Two pass Gaussian blur filter (horizontal and vertical blur shaders)
 * - described in http://www.gamerendering.com/2008/10/11/gaussian-blur-filter-shader/
 *   and used in http://www.cake23.de/traveling-wavefronts-lit-up.html
 *
 * - 9 samples per pass
 * - standard deviation 10.8
 * - "h" and "v" parameters should be set to "1 / (width / 4)" and "1 / (height / 4)"
 */

export default function loadBlurShader(threeInstance: Object): Promise {
  return new Promise((resolve, reject) => {
    threeInstance.HorizontalBlurShader = {

    	uniforms: {

    		"tDiffuse": { value: null },
    		"h":        { value: 1.0 / 512.0  },

    	},

    	vertexShader: [

    		"varying vec2 vUv;",

    		"void main() {",

    			"vUv = uv;",
    			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

    		"}"

    	].join( "\n" ),

    	fragmentShader: [

    		"uniform sampler2D tDiffuse;",
    		"uniform float h;",

    		"varying vec2 vUv;",

    		"void main() {",

    			"vec4 sum = vec4( 0.0 );",

    			"sum += texture2D( tDiffuse, vec2( vUv.x - 4.0 * h, vUv.y ) ) * 0.106723;",
    			"sum += texture2D( tDiffuse, vec2( vUv.x - 3.0 * h, vUv.y ) ) * 0.109972;",
    			"sum += texture2D( tDiffuse, vec2( vUv.x - 2.0 * h, vUv.y ) ) * 0.112352;",
    			"sum += texture2D( tDiffuse, vec2( vUv.x - 1.0 * h, vUv.y ) ) * 0.113806;",
    			"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y ) ) * 0.114294;",
    			"sum += texture2D( tDiffuse, vec2( vUv.x + 1.0 * h, vUv.y ) ) * 0.113806;",
    			"sum += texture2D( tDiffuse, vec2( vUv.x + 2.0 * h, vUv.y ) ) * 0.112352;",
    			"sum += texture2D( tDiffuse, vec2( vUv.x + 3.0 * h, vUv.y ) ) * 0.109972;",
    			"sum += texture2D( tDiffuse, vec2( vUv.x + 4.0 * h, vUv.y ) ) * 0.106723;",

    			"gl_FragColor = sum;",

    		"}"

    	].join( "\n" )

    };

    threeInstance.VerticalBlurShader = {

    	uniforms: {

    		"tDiffuse": { value: null },
    		"v":        { value: 1.0 / 512.0 },

    	},

    	vertexShader: [

    		"varying vec2 vUv;",

    		"void main() {",

    			"vUv = uv;",
    			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

    		"}"

    	].join( "\n" ),

    	fragmentShader: [

        "uniform sampler2D tDiffuse;",
		    "uniform float v;",

		    "varying vec2 vUv;",

		    "void main() {",

    			"vec4 sum = vec4( 0.0 );",

    			"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 4.0 * v ) ) * 0.106723;",
    			"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 3.0 * v ) ) * 0.109972;",
    			"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 2.0 * v ) ) * 0.112352;",
    			"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 1.0 * v ) ) * 0.113806;",
    			"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y ) ) * 0.114294;",
    			"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 1.0 * v ) ) * 0.113806;",
    			"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 2.0 * v ) ) * 0.112352;",
    			"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 3.0 * v ) ) * 0.109972;",
    			"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 4.0 * v ) ) * 0.106723;",

    			"gl_FragColor = sum;",


    		"}"

    	].join( "\n" )

    };

    resolve(threeInstance);
  });
}
