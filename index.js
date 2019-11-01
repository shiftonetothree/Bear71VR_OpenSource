window.THREE = require('three');
require('three/examples/js/loaders/GLTFLoader');
require('three/examples/js/renderers/CSS2DRenderer');
require('./lib/vendor/three.FlatShadedMaterial');
require('./lib/vendor/VRControls');
require('./lib/vendor/VREffect');
// inject polyfill
require('webvr-polyfill');
// require('webvr-boilerplate');

// fix rotation bug on iOS 8/9
require('./lib/util/fix-iOS-fullscreen');

// needed for Promise and some other features
require('babel-polyfill');

// improve click response
require('fastclick')(document.body);

const assets = require('./lib/assets');
const textureLoader = require('./lib/assets/loadTexture');

const GridWorldApp = require('./lib/GridWorldApp');
const setupContent = require('./lib/sections/vr-content');

const settings = require('./lib/gfx/settings');

module.exports = {
  init: (canvas, mapConfig, onLoaded) => {
    Object.assign(settings, mapConfig);
    let app = new GridWorldApp(undefined, canvas);
    
    // Set a renderer on our texture loader so that
    // we can upload textures immediately after preloading them
    textureLoader.setRenderer(app.renderer);
    
    const state = {
      time: 0.5,
      daytime: 1,
      dayNight: 1,
      interactive: true,
      gridInteractive: true
    };
    
    app.state = state;
    
    setupContent({ 
      app, 
      state, 
      mapConfig, 
      onLoaded: function(destroyContent){
        function destroy(){
          app.stop();
          app.destroy();
          destroyContent();
        }
        onLoaded(destroy);
      } 
    });
    
    app.startMagicWindow();
  },
  registerLocation(fn){

  },

}
