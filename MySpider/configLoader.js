var fs = require('fs');
var ConfigLoader = {
 _cache:null,
 load:function(file){
 var self = this;
 this._cache = JSON.parse(fs.readFileSync(file).toString());
 fs.watch(file,function(){
 self._cache = JSON.parse(fs.readFileSync(file).toString());
 });
 return this._cache;
 },
 get:function(key){
 return this._cache[key];
 }
};
module.exports = ConfigLoader;