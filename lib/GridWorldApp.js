require('./util/performancePolyfill');
const RayEvents = require('./util/RayEvents');
const CameraManager = require('./gfx/CameraManager');
const isDesktop = require('./util/isDesktop');
const isIOS = require('./util/isIOS');
const settings = require('./gfx/settings');
var manageSceneOnEnterFrameObjects = require('./gfx/utils/manageSceneOnEnterFrameObjects');
var manageSceneRayCollisions = require('./gfx/utils/manageSceneRayCollisions');

function GridWorldApp (params = {},canvas) {
  // Scale for retina
  this.width = window.innerWidth;
  this.height = window.innerHeight;
  this.onResizeCallbacks = [];
  this.onEnterFrameCallbacks = [];

  // Show the <canvas> on screen
  // const canvas = document.querySelector('#canvas');

  // Our WebGL renderer with alpha and device-scaled
  const renderer = new THREE.WebGLRenderer({
    canvas,
    transparent: false,
    stencil: false,
    alpha: false,
    preserveDrawingBuffer: false,
    antialias: isDesktop()
  });
  renderer.setPixelRatio(settings.devicePixelRatio);
  renderer.setClearColor(0x000000, 1);
  renderer.sortObjects = true;

  const css2dRender = new THREE.CSS2DRenderer();
  css2dRender.domElement.style.position = 'absolute';
  css2dRender.domElement.style.pointerEvents = 'none';
  css2dRender.domElement.style.top = 0;
  canvas.parentElement.appendChild( css2dRender.domElement );

  const rayEvents = new RayEvents(canvas);
  this.registerOnResize(rayEvents.resize.bind(rayEvents));

  const vrEffect = new THREE.VREffect(renderer);
  // this._matchCursorToVRState = _matchCursorToVRState.bind(this);
  window.addEventListener( 'vrdisplaypresentchange', this._matchCursorToVRState, false );

  this.registerOnResize(renderer.setSize.bind(renderer));
  this.registerOnResize(vrEffect.setSize.bind(vrEffect));
  this.registerOnResize(css2dRender.setSize.bind(css2dRender));

  this.lastTime = performance.now();

  var scene = new THREE.Scene();
  
  manageSceneOnEnterFrameObjects(scene);
  this.registerOnEnterFrame(scene.onEnterFrame.bind(scene));
  manageSceneRayCollisions(scene, rayEvents);

  var cameraManager = new CameraManager({
    renderer: renderer,
    canvas: canvas,
    userFootHeight: settings.userFootHeight,
    onMove: params.onMove,
  });
  scene.add(cameraManager.cameraBody);
  scene.add( new THREE.AxesHelper( 200 ) );
  this.registerOnResize(cameraManager.resize.bind(cameraManager));
  this.registerOnEnterFrame(cameraManager.update.bind(cameraManager));

  this._onVRDisplayPresentChange = _onVRDisplayPresentChange.bind(this);
  window.addEventListener('vrdisplaypresentchange', this._onVRDisplayPresentChange, false);

  this._resize = _resize.bind(this);
  window.addEventListener('resize', this._resize);
  _resize.call(this);

  this.renderer = renderer;
  this.css2dRender = css2dRender;
  this.canvas = canvas;
  this.scene = scene;
  this.vrEffect = vrEffect;
  this.rayEvents = rayEvents;
  this.cameraManager = cameraManager;
  this.camera = cameraManager.camera;
  scene.camera = cameraManager.camera;
  this.cameraBody = cameraManager.cameraBody;
  this.cameraFootstool = cameraManager.cameraFootstool;
}


function _matchCursorToVRState(state) {
  if(!this.cursor) {
    console.warn('delaying cursor VR match until cursor exists');
    setTimeout(_matchCursorToVRState.bind(this, state), 1000);
    return;
  } 
  this.cursor.toggleDragPanning(!this.vrEffect.isPresenting);
}

function _onEnterFrame () {
  var now = performance.now();
  var dt = (now - this.lastTime) * 0.001;
  this.lastTime = now;
  for (var i = 0; i < this.onEnterFrameCallbacks.length; i++) {
    this.onEnterFrameCallbacks[i](dt, this.state);
  }
  this.vrEffect.render(this.scene, this.camera);
  this.css2dRender.render(this.scene, this.camera);
  
}



function registerOnResize(callback) {
  this.onResizeCallbacks.push(callback);
  callback(this.width, this.height);
}

function unregisterOnResize(callback) {
  var index = this.onResizeCallbacks.indexOf(callback);
  if(index !== -1) {
    this.onResizeCallbacks.splice(index, 1);
  }
}

function registerOnEnterFrame(callback) {
  if(this.onEnterFrameCallbacks.indexOf(callback) !== -1) return;
  this.onEnterFrameCallbacks.push(callback);
}

function unregisterOnEnterFrame(callback) {
  var index = this.onEnterFrameCallbacks.indexOf(callback);
  if(index !== -1) {
    this.onEnterFrameCallbacks.splice(index, 1);
  }
}

function _onVRDisplayPresentChange (ev) {
  _resize.call(this);
}

function _resize () {
  let width = window.innerWidth;
  let height = window.innerHeight;
  // the +1 is for iPhone landscape on 9.2 safari,
  // otherwise the address bar does not disappear
  if (isIOS()) {
    width = width + 1;
    height = height + 1;
  }

  this.width = width;
  this.height = height;
  for (var i = 0; i < this.onResizeCallbacks.length; i++) {
    this.onResizeCallbacks[i](width, height);
  }

  if (isIOS()) {
    const fixScroll = () => {
      setTimeout(() => {
        window.scrollTo(0, 1);
      }, 500);
    };

    fixScroll();
  }

}

let count = 0;
function empty(elem,layer) {
  if(layer === undefined){layer = ""}
  // console.log(layer,elem);
  const children = elem.children.concat();
  for(let children of children){
    empty(children, layer + "-----");
    elem.remove(children);
  }
  if(elem.dispose){
    elem.dispose();
  }
}


function rafLoop() {
  _onEnterFrame.call(this);
  this.timeout = this.vrEffect.requestAnimationFrame(this.rafLoop);
}

function _start() {
  // this.rafLoop = this.rafLoop.bind(this)导致了循环引用
  this.rafLoop = rafLoop.bind(this);
  this.vrEffect.requestAnimationFrame(this.rafLoop);
  _resize.call(this);
}

function _stop(){
  this.vrEffect.cancelAnimationFrame(this.timeout);
  // this.rafLoop = this.rafLoop.bind(this)导致了循环引用
  this.rafLoop = null;
}

function startDesktop() {
  _start.call(this);
}

function startVR() {
  this.vrEffect.requestPresent();
  _start.call(this);
}

function startMagicWindow() {
  _start.call(this);
}

function stop(){
  _stop.call(this);
}

function destroy(){
  empty(this.scene);
  this.css2dRender.domElement.remove();
  this.renderer.dispose();
  this.rayEvents.destroy();
  const onResizeCallbacks = this.onResizeCallbacks.concat();
  for(let i=0;i<onResizeCallbacks.length;i++){
    this.unregisterOnResize(onResizeCallbacks[i]);
  }
  const onEnterFrameCallbacks = this.onEnterFrameCallbacks.concat();
  for(let i=0;i<onEnterFrameCallbacks.length;i++){
    this.unregisterOnEnterFrame(onEnterFrameCallbacks[i]);
  }

  window.removeEventListener( 'vrdisplaypresentchange', this._matchCursorToVRState );
  this._matchCursorToVRState = null;
  
  window.removeEventListener('vrdisplaypresentchange', this._onVRDisplayPresentChange);
  this._onVRDisplayPresentChange = null;

  
  window.removeEventListener('resize', this._resize);
  this._resize = null;
}

GridWorldApp.prototype = {
  rafLoop: rafLoop,
  startVR: startVR,
  startDesktop: startDesktop,
  startMagicWindow: startMagicWindow,
  stop: stop,
  destroy: destroy,
  registerOnResize: registerOnResize,
  unregisterOnResize: unregisterOnResize,
  registerOnEnterFrame: registerOnEnterFrame,
  unregisterOnEnterFrame: unregisterOnEnterFrame
};

module.exports = GridWorldApp;
