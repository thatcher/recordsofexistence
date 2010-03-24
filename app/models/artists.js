/**
 * @author thatcher
 */
(function($, $M){ 
    
    var log;
    
    $M.Artists = function(options){
        $.extend(true, this, options, $.model('artists', {
            $id:{
                pattern:/roe[0-9]{3}/,
                not:[null],
                msg:'$id must be defined and should be a three digits, eg 001'
            },
            image:{
                pattern:/^[.]{1,256}$/,
                not:[null],
                msg:'image is the url used to display as the artists thumbnail'
            },
            name:{
                pattern:/^.{1,64}$/,
                not:[null],
                msg:'name must be defined, less than 64 characters and \
                     can use any characters'
            },
            description:{
                pattern:/.{1,512}/,
                not:[null],
                msg:'description is not required but must be a valid string, upto\
                    512 characters long'
            },
            deleted:{
                pattern:/^[0-9]{1,32}$/,
                msg:'timestamp when record was removed or null for an active record'
            }
        }));
        log = $.logger('RecordsOfExistence.Models.Artists');
    };
    
    $.extend( $M.Artists.prototype, {
        all:function(callback){
            var _this = this;
            this.find({
                async:false,
                //select:'select * from `reo_artists` where `deleted` = "null"',
                select:"new Query('artists')",
                success:function(results){
                    log.debug('loaded all %s artists', results.data.length );
                    callback(results.data);
                },
                error: function(xhr, status, e){
                    log.error('failed to load all artists. (%s)', status).
                        exception(e);
                    callback([_this.template({
                        $id:'roe500',
                        description:'failed to load artists. ('+status+')'
                    })]);
                }
            });
        },
        current:function(callback){
            var _this = this;
            this.find({
                async:false,
                //select:'select * from `reo_artists` where `deleted` = "null"',
                select:"new Query('artists').addFilter('deleted', $EQUAL, '')",
                success:function(results){
                    log.debug('loaded all %s artists', results.data.length );
                    callback(results.data);
                },
                error: function(xhr, status, e){
                    log.error('failed to load all artists. (%s)', status).
                        exception(e);
                    callback([_this.template({
                        $id:'roe500',
                        description:'failed to load artists. ('+status+')'
                    })]);
                }
            });
        },
        forId: function(id, callback){
            var _this = this;
            log.debug('getting artist for id %s', id );
            this.get({
                async: false,
                id:id,
                success: function(results){
                    log.debug('found artist for %s', id );
                    if(results.data.length){
                        callback(results.data[0]);
                    }else{
                        callback(_this.template(id));
                    }
                },
                error:function(xhr, status, e){
                    log.error('failed to find item for id %s', id);
                    callback(_this.template(id));
                }
            });
        },
        template: function(options){
            log.debug('generating template artist');
            return $.extend({
                $id:            'roe404',
                name:           jsPath.titled(2, false),
                description:    jsPath.paragraphs(1, false),
                image:          'error/thumb.jpg',
                deleted:        ''
            }, options );
        }
    });
    
})(jQuery, RecordsOfExistence.Models);
 