
const fogFalse = require('../../util/fogFalse');

module.exports = function getTracks(locationsIn, tracks, callback, errorCallBack){
    var loader = new THREE.GLTFLoader();
    

    const locations = locationsIn.concat();
    const result = [];

    if(locations.length === 0){
      callback([]);
    }
  
    for(let location of locations){
      let earthDiv = document.createElement( 'div' );
      earthDiv.className = 'carLike-label';
      earthDiv.textContent = location.name;
      earthDiv.style.marginTop = '-1em';
      let earthLabel = new THREE.CSS2DObject( earthDiv );
      earthLabel.position.set(...location.namePosition);
      loader.load( location.model, function ( gltf ) {
    
        gltf.scene.scale.set(...location.scale);
        gltf.scene.category = location.category;
        fogFalse(gltf.scene);
        
        
        const carLike = new THREE.Object3D();
        carLike.add(gltf.scene);
        carLike.add(earthLabel);
        carLike.onclick = location.onclick;

        const track = tracks[location.g];
        let cameFromIndex = null;
        let index = Math.floor(Math.random() * 0.99999 * track.positionIndices.length);

        carLike.onEnterFrame = function(dt){
          // console.log(dt);
          // 从当前节点的关联节点中随机选出一个节点，但不能选择走过的上一个节点
          let connectionsWithoutVisited;
          if(cameFromIndex){
            const connectionIndex = track.connections[index].indexOf(cameFromIndex);
            connectionsWithoutVisited = track.connections[index].concat();
            if(connectionIndex !== -1){
              connectionsWithoutVisited.splice(connectionIndex,1);
            }
          }else{
            connectionsWithoutVisited = track.connections[index];
          }
          
          
          const nextMapIndex = connectionsWithoutVisited[Math.floor(Math.random() * 0.99999 * connectionsWithoutVisited.length)];
          if(nextMapIndex){
            const nextIndex = track.positionIndices.indexOf(nextMapIndex);
            const nextPosition = track.vertices[nextIndex];
            this.position.copy(nextPosition);
            cameFromIndex = track.positionIndices[index];
            index = nextIndex;
          }else{
            cameFromIndex = null;
            index = Math.floor(Math.random() * 0.99999 * track.positionIndices.length);
          }
          
        }
        result.push(carLike);
        if(result.length === locations.length){
            callback(result);
        }
      }, function ( xhr ) {
    
        console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    
      }, function ( error ) {
      
        console.error( error );
        if(errorCallBack){
          errorCallBack(error);
        }
      
      } );
      
    }
}
  