const THREE = require('three');

module.exports = function getGLTFRoot(objectIn){
    let object = objectIn;
    let count = 0;
    while(!(object instanceof THREE.Scene)){
      object = object.parent;
      count ++;
      if(count >100){
        break;
      }
    }
    return object;
}