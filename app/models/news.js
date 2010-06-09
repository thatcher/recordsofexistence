/**
 * @author thatcher
 */
(function($, $M){ 
    
    var log;
    
    $M.News = function(options){
        $.extend(true, this, options,$.model('news', {
            $id:{
                pattern:/^roe[0-9]+$/,
                not:[null],
                msg:'id must be defined'
            },
            title:{
                pattern:/^.{1,64}$/,
                not:[null],
                msg:'title must be defined, less than 64 characters.'
            },
            date:{
                pattern:/^.{1,64}$/,
                not:[null],
                msg:'a required human readable description of the date (eg May 5th, 2013)'
            },
            description:{
                pattern:/.{1,1024}/,
                not:[null],
                msg:'description is not required but must be a valid string, upto\
                    1024 characters long'
            },
            deleted:{
                pattern:/^[0-9]{0,32}$/,
                msg:'timestamp when record was removed or null for an active record'
            }
        }));
        log = $.logger('RecordsOfExistence.Models.News');
    };
    
    $.extend( $M.News.prototype, {
        all:function(callback){
            this.find({
                async:false,
                //select:'select * from `news`',
                select:"new Query('news')",
                success:function(results){
                    log.debug('loaded all %s news', results.data.length );
                    callback(results.data.reverse());
                },
                error: function(){
                    log.error('failed to load all news.');
                    callback([{
                        $id:'roe500',
                        title:'Internal Server Error',
                        date: new Date()+"",
                        calendar: new Date()+"",
                        description:'We are unable to display information right now,\
                            the server may be experiencing a lost database connection.\
                            Please check back again in a few moments.',
                    }]);
                }
            });
        },
        current:function(callback){
            this.find({
                async:false,
                //select:'select * from `news`',
                select:"new Query('news').addFilter('deleted', $EQUAL, '')",
                success:function(results){
                    log.debug('loaded all %s news', results.data.length );
                    callback(results.data.reverse());
                },
                error: function(){
                    log.error('failed to load all news.');
                    callback([{
                        $id:'roe500',
                        title:'Internal Server Error',
                        date: new Date()+"",
                        calendar: new Date()+"",
                        description:'We are unable to display information right now,\
                            the server may be experiencing a lost database connection.\
                            Please check back again in a few moments.',
                    }]);
                }
            });
        },
        recent:function(count, success){
            this.current(function(results){
                success(results.slice(0,
                    results.length > (count-1) ? count : results.length));
            });
        },
        template: function(options){
            return $.extend({
                $id: 'roe999',
                title:$.title(3),
                date:new Date()+'',
                calendar:new Date()+'',
                description:$.paragraphs(2, false),
                deleted:''
            }, options);
        }
    });
    
    
})(jQuery, RecordsOfExistence.Models);
 