var path = require('path');

var Utils = {
  id:function(){
    var ret = '';
    for(var chars="0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_".split(''),i=0;i<75;i++){
      ret += chars[~~(Math.random() * chars.length)];
    }
    return ret;
  },
  resolveRelativeURL:function(p,url){
    var proto = url.match(/^https?/)[0];
    url = url.replace(/^https?:\/\//,'');
    return proto+'://'+path.normalize(url+'/'+p) 
        .replace(path.sep,'/')
        .replace(/#(\w)+/,'');
  },
  isExternal:function(url){
    return url.match(/^https?/) !== null;
  },
  imageRegexp: new RegExp("("+['\\.png','\\.jpg','\\.gif','\\.bmp','\\.psd'].join('|')+")$","i")
};

module.exports = Utils;