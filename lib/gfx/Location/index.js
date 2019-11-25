
const fogFalse = require('../../util/fogFalse');

module.exports = function getLocations(locationsIn, callback, errorCallBack){
    var loader = new THREE.GLTFLoader();

    const locations = locationsIn.concat();
    const result = [];

    if(locations.length === 0){
      callback([]);
    }
  
    for(let location of locations){
  
      let earthDiv = document.createElement( 'div' );
      earthDiv.className = 'label';
      earthDiv.textContent = location.name;
      earthDiv.style.marginTop = '-1em';
      let earthLabel = new THREE.CSS2DObject( earthDiv );
      const labelLocation = new THREE.Vector3(...location.position).add(new THREE.Vector3(...location.namePosition));
      earthLabel.position.copy(labelLocation);
      earthLabel.onclick = location.onclick;
      earthLabel.category = location.category;
  
      loader.load( location.model, function ( gltf ) {

        gltf.scene.position.set(...location.position);
        gltf.scene.scale.set(...location.scale);
        gltf.scene.category = location.category;
        fogFalse(gltf.scene);
        result.push(gltf.scene);
        gltf.scene.onclick = location.onclick;
        result.push(earthLabel);
        if(result.length === locations.length * 2){
            callback(result);
        }
      }, function ( xhr ) {
    
        console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    
      }, function ( error ) {
      
        console.error( error );
        errorCallBack(error);
      
      } );
    }
}
  