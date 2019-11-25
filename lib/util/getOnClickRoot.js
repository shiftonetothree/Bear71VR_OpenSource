const THREE = require('three');

module.exports = function getOnClickRoot(objectIn){
    let object = objectIn;
    let count = 0;
    while(object.onclick == null){
      object = object.parent;
      count ++;
      if(count >100){
        break;
      }
    }
    return object;
}