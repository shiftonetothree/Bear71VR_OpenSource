module.exports = function fogFalse(elem){
    const children = elem.children.concat();
    for(let children of children){
        fogFalse(children);
    }
    if(elem.material != null){
        elem.material.fog = false;
    }
}