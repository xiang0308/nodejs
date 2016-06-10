var Crawler = require('./crawler.js');
var async = require('async');
var spider = new Crawler();

async.forever(function(cb){
  spider.crawl(function(){
    process.nextTick(function(){
      cb(null);
    });
  });
});













