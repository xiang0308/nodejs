var request = require('request');
var cheerio = require('cheerio');
var async = require('async');
var db = require('mysql');
var util = require('./utils.js');
var config = require('./configLoader.js');

config.load(__dirname+'/config.json');

// 主体程序
var Crawler = function(){
  var self = this;  
  this.conn = db.createConnection(config.get('db'));
  this.indexed = 0;
  this.baseSite = config.get('baseSite');
  this._url = this.baseSite;
  this.url = this.baseSite;

  this.crawl = function(cb){
    this.conn.query('SELECT * FROM `queue` LIMIT 0,1',function(e,result){
      self.url = result.length > 0 ? result[0].url : self.baseSite;
      request(self.url,function(e,res,body){
        if(result.length > 0){
          self.conn.query('DELETE FROM `queue` WHERE `id` = ?',[result[0].id],function(){
            cb();
          });
        }else {
          cb();
        }        
        if(!e && res.statusCode === 200){           
          self.getInfo(body,result.length > 0 ? result[0].from : '');
        }else {
          console.log('Error requesting page %s',self.url);
        }
        self._url = self.url;
      });
    });
  };
  
  this.getInfo = function(html,from){
    var $ = cheerio.load(html);
    var title = $('head title').text();    
    var keywords = $('head meta[name=keywords]').attr('content');    
    var desc = $('head meta[name=description]').attr('content');      
    var links = $('a');
    console.log('Crawling "%s" | %s',title,this.url);
    
    async.map(links.map(function(){
        var href = $(this).attr('href');
        if(href && href != self._url && !(/^#(\w)+/.test(href)) && !util.imageRegexp.test(href)){
          if(util.isExternal(href)){
            return 'INSERT INTO `queue` SET `id` = \''+util.id()+'\', `url` = '+self.conn.escape(href)+', `from` = '+self.conn.escape(from);
          }
          else {
            return 'INSERT INTO `queue` SET `id` = \''+util.id()+'\', `url` = '+self.conn.escape(util.resolveRelativeURL(href,self._url))+', `from` = '+self.conn.escape(from);
          }
        }
        return false;
      }).filter(function(el){
        return !!el;
      })
    ,this.conn.query.bind(this.conn),function(e,result){
      if(e){
        console.log('Error writing queue.');
        console.log(e);
      }
    });
    
    this.conn.query('INSERT INTO `websites` SET ?',{
      id:util.id(),
      url:this.url,
      from:from,
      title:title,
      keywords:keywords || '',
      desc:desc || ''
    },function(e){
      if(e){
        console.log('Error indexing page %s',self.url);
        console.log(e);
      }
      else {
        console.log('Successfully indexed page %s',self.url);
        self.indexed++;
      }
    });
  };
};

module.exports = Crawler;