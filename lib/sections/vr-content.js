const urlParam = require('urlparam');
const settings = require('../gfx/settings');
const onDayDream = require('../util/onDayDream');
const onVR = require('../util/onVR');
const Map = require('../gfx/Map');
const InteractiveDayDreamController = require('../gfx/InteractiveDayDreamController');
const Sky = require('../gfx/Sky');
const Cursor = require('../gfx/Cursor');
const MapCollider = require('../gfx/MapCollider');
const colors = require('../gfx/colors');
const getLocations = require('../gfx/Location');

const __tempVec3 = new THREE.Vector3();

function noop() {}

function setVrContent ({ app, state, mapConfig, onLoaded }) {
  let map, mapLoaded;

  let mapCollider, sky, cursor;

  var rayEvents = app.rayEvents;
  
  var scene = app.scene;
  var cameraManager = app.cameraManager;

  const groundColor = colors.moutainAtNight.clone();
  const fogColor = colors.fogAtNight.clone();
  const skyColor = colors.skyAtNight.clone();

  var fogAmt = 1 - settings.fogRatio;
  map = new Map(
    Object.assign({
    scene: app.scene,
    fogColor,
    fogAmt,
    groundColor,
    camera: app.camera,
    cameraPosition: app.cameraBody.position,
    renderer: app.renderer,
    state, 
  },mapConfig));

  app.registerOnResize(function(w, h) {
    map.screenPixelHeight = h * window.devicePixelRatio;
  });

  var fogFar = map.visibleDistance;
  var fogNear = fogFar * fogAmt;
  var fog = new THREE.Fog(fogColor, fogNear, fogFar);
  fog.color = fogColor; //important if we want the animated uniform colors to JUST WORK. otherwise it gets cloned and we lose that connection.
  app.scene.fog = fog;

  scene.add(map);
  if(urlParam('previewRippleMap', false)) {
    var rippleMapPreview = map.rippleMap.generatePreviewObject();
    rippleMapPreview.rotation.x = Math.PI * -0.5;
    rippleMapPreview.scale.set(0.2, 0.2, 0.2);
    rippleMapPreview.position.y = 1;
    app.cameraFootstool.add(rippleMapPreview);
  }
  sky = new Sky({
      color: skyColor,
      fogColor,
      camera: app.camera
    }
  );
  scene.add(sky);

  function destroy(){
    // 清除之前的监听
    onVR.clear();
    onDayDream.clear();
    map.emitter.removeListener(map.LOADED, mapLoaded);
    map = null;
    mapLoaded = null;
  }

  mapLoaded = function(){
    var camPos = app.cameraBody.position;
    camPos.y = map.getHeightAtLocation(camPos.x, camPos.z);
    cursor = new Cursor({
      map: map,
      state,
      camera: app.camera,
      rayEvents: rayEvents
    });

    
    onVR(cursor.onVR.bind(cursor));
    scene.add(cursor);

    map.rippleMap.registerRippler(cursor);
    app.cursor = cursor;
    map.cursor = cursor;

    mapCollider = new MapCollider({
      map,
      cameraPosition: app.cameraBody.position
    });
    scene.add(mapCollider);

    cursor.addColliders(mapCollider.getColliderPlanes());

    getLocations(mapConfig.locations,
      (locations)=>{
        for(let location of locations){
          location.onEnterFrame= function(dt){
            const target = app.cameraBody.position.clone();
            target.y = this.position.y;
            this.lookAt(target);
          };
          cursor.addCollider(location);
          scene.add(location);
          map.rippleMap.registerRippler(location);
          location.onclick = ()=>{
            console.log(location);
          }
        }
      }
    );

    var dayDreamController;
    onDayDream(function onDayDreamAdjustVisualController(isDayDream) {
      if(isDayDream) {
        dayDreamController = new InteractiveDayDreamController({
          camera: app.camera,
          rayEvents: rayEvents
        });
        app.cameraFootstool.add(dayDreamController);
        console.log('DAYDREAM CONTROLLER START');
        dayDreamController.position.set(0.25, 1.4, -0.5);
      } else {
        if(dayDreamController) {
          app.cameraFootstool.remove(dayDreamController);
          console.log('DAYDREAM CONTROLLER STOP');
          dayDreamController = null;
        }
      }
    });

    // not needed in daydream
    // findNorth();
    if(onLoaded){
      // see setTimeout in PlaneCollider
      window.setTimeout(()=>onLoaded(destroy),1500);
    }
  }
  map.emitter.on(map.LOADED, mapLoaded);
}

module.exports = setVrContent;