/**
 * @author thatcher
 */
(function($, $M){ 
    
    var data,// the currently cached data
        log;
    
    $M.Events = function(options){
        $.extend(true, this, options, $.model('events', {
            $id:{
                pattern:/^[0-9]+$/,
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
            location:{
                pattern:/^.{1,256}$/,
                not:[null],
                msg:'a required human readable description the events location'
            },
            image:{
                pattern:/^.{1,256}$/,
                not:[null],
                msg:'a relative url for an event image'
            },
            description:{
                pattern:/.{1,1024}/,
                not:[null],
                msg:'description is not required but must be a valid string, upto\
                    1024 characters long'
            },
            deleted:{
                pattern:/^[0-9]{1,32}$/,
                msg:'timestamp when record was removed or null for an active record'
            }
        }));
        data = [];
        log = $.logger('RecordsOfExistence.Models.Events');
    };
    
    $.extend( $M.Events.prototype, {
        all:function(callback){
            var _this = this;
            this.find({
                async:false,
                //select:'select * from `events`',
                select:"new Query('events')",
                success:function(results){
                    log.debug('loaded all %s events', results.data.length );
                    callback(results.data.reverse());
                },
                error: function(xhr, status, e){
                    log.error('failed to load all events.', e);
                    callback([_this.template({$id:'roe500'})]);
                }
            });
        },
        current:function(callback){
            var _this = this;
            this.find({
                async:false,
                //select:'select * from `events`',
                select:"new Query('events').addFilter('deleted', $EQUAL, '')",
                success:function(results){
                    log.debug('loaded all %s events', results.data.length );
                    callback(results.data.reverse());
                },
                error: function(xhr, status, e){
                    log.error('failed to load all events.', e);
                    callback([_this.template({$id:'roe500'})]);
                }
            });
        },
        recent:function(count, callback){
            this.current(function(results){
                callback(results.slice(0,
                    results.length > (count-1) ? count : results.length));
            });
        },
        template: function(options){
            return $.extend(true, {
                $id:'roe404',
                title:jsPath.titled(3, false),
                date:new Date()+'',
                location:jsPath.words(5, false),
                description: jsPath.sentence(),
                image:'error/thumb.jpg',
                deleted:''
            }, options );
        }
    });
    
    
})(jQuery, RecordsOfExistence.Models);
 