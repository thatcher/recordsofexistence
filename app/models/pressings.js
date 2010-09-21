/**
 * @author thatcher
 */
(function($, $M){ 
    
    var log;
    
    $M.Pressings = function(options){
        $.extend(true, this, options,$.model('pressings', {
            $id:{
                pattern:/^[0-9]+$/,
                not:[null],
                msg:'id must be defined and should be a positive integer'
            },
            ska:{
                pattern:/^.{7}$/,
                msg:'ska is the paypal id generated for the pressing if it for sale.'
            },
            release:{
                pattern:/^[0-9]{3}$/,
                not:[null],
                msg:'should refer to the release id.'
            },
            price:{
                pattern:/^[0-9]+$/,
                not:[null],
                msg:'a non-negative integer specifying the cost of the pressing'
            },
            count:{
                pattern:/^[0-9]{1,5}$/,
                not:[null],
                msg:'a positive integer specifying the total number records for this pressing'
            },
            format:{
                pattern:/^(Compact Disc)$/,
                not:[null],
                msg:'The format of the pressing (currently only "Compact Disc" is supported).'
            },
            description:{
                pattern:/^.+$/,
                not:[null],
                msg:'any valid string, but cannot be empty or null'
            },
            deleted:{
                pattern:/^[0-9]{1,32}$/,
                msg:'timestamp when record was removed or null for an active record'
            }
        }));
        log = $.logger('RecordsOfExistence.Models.Pressings');
    };
    
    $.extend( $M.Pressings.prototype, {

        all:function(callback){
            var _this = this;
            this.find({
                async:false,
                select:"new Query('pressings').addFilter('deleted', $EQUAL, '')",
                success:function(results){
                    log.debug('loaded all %s releases', results.data.length );
                    callback(results.data);
                },
                error: function(){
                    log.error('failed to load all releases.');
                    var releases = [];
                    for(var i=0;i<6;i++){
                        releases[i] = _this.template();
                    }
                    callback(releases);
                }
            });
        },
        
        forRelease:function(id,callback){
            var _this = this;
            this.find({
                async:false,
                select:"new Query('pressings').addFilter('release', $EQUAL, '"+id+"')",
                success:function(results){
                    log.debug('loaded pressings for release %s', id );
                    callback(results.data);
                },
                error: function(e){
                    log.error('failed to load all pressings for release %s.').
                        exception(e);
                    callback([_this.template()]);
                }
            });
        },
        
        currentForRelease:function(id,callback){
            var _this = this;
            this.find({
                async:false,
                select:"new Query('pressings').addFilter('release', $EQUAL, '"+id+"').addFilter('deleted', $EQUAL, '')",
                success:function(results){
                    log.debug('loaded pressings for release %s', id );
                    callback(results.data);
                },
                error: function(e){
                    log.error('failed to load all pressings for release %s.').
                        exception(e);
                    callback([_this.template()]);
                }
            });
        },
        
        changeReleaseId: function(oldID, newID){
            var _this = this;
            this.forRelease(oldID, function(releases){
                if(releases)
                    log.debug('found %s pressing to change release id', releases.length);
                $(releases).each(function(){
                    var pressingId = this.$id;
                    this.release = newID;
                    _this.save({
                        id: this.$id,
                        async: false,
                        data: this,
                        success: function(){
                            log.info('successfully changed release id for pressing %s',pressingId);
                        },
                        error: function(xhr, status, e){
                            log.error('failed to changed release id for pressing %s',pressingId)
                               .exception(e);
                        }
                    })
                });
            });
        },
        
        template: function(options){
            return $.extend({
                $id:'404',
                release:'000',
                price:0,
				ska:'',
                count: 'format',
                format:'Audio CD',
                deleted: '',
                description:$.paragraph(false)
            }, options);
        }
    });
    
})(jQuery, RecordsOfExistence.Models);
 