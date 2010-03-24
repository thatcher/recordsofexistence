/**
 * @author thatcher
 */
(function($, $M){ 
    
    var log;
    
    $M.Releases = function(options){
        $.extend(true, this, options, $.model('releases', {
            $id:{
                pattern:/^[0-9]{3}$/,
                not:[null],
                msg:'id must be defined and should be a three numbers'
            },
            image:{
                pattern:/^[a-z0-9_]{1,32}$/,
                not:[null],
                msg:'url should be the data of the data folder, usually the \
                    in lowercase and underscores'
            },
            artist:{
                pattern:/^[0-9]{3}$/,
                not:[null],
                msg:'should refer to the artist id.'
            },
            name:{
                pattern:/^.{1,64}$/,
                not:[null],
                msg:'The human readable name of the release.'
            },
            description:{
                pattern:/^.{1,1024}$/,
                not:[null],
                msg:'describes the release. any valid string, but cannot be \
                    empty or null, upto 1024 characters'
            },
            tracks:{
                pattern:/^.{1,64}$/,
                msg:'a list of track names for this release. names can be upto \
                    64 characters long'
            },
            deleted:{
                pattern:/^[0-9]{1,32}$/,
                msg:'timestamp when record was removed or null for an active record'
            }
        }));
        log = $.logger('RecordsOfExistence.Models.Releases');
    };
    
    $.extend( $M.Releases.prototype, {
        all:function(callback){
            var _this = this;
            this.find({
                async:false,
                select:"new Query('releases')",
                success:function(results){
                    log.debug('loaded all %s releases', results.data.length );
                    callback(results.data.reverse());
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
        current:function(callback){
            var _this = this;
            this.find({
                async:false,
                select:"new Query('releases').addFilter('deleted', $EQUAL, '')",
                success:function(results){
                    log.debug('loaded all %s releases', results.data.length );
                    callback(results.data.reverse());
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
        recent: function(callback){
            this.current(function(results){
                var i, recent = [];
                // basically a stupid sort algorithm, results should be cache to 
                // avoid computation overhead of resorting per-request
                if(results.length > 2){
                    recent = [results[0], results[1]];
                    // find the recent releases based on roe release id
                    if(Number(recent[0].id) < Number(recent[1].id)){
                        //make sure we order largest to smallest numerically
                        recent = [results[1], results[0]];
                    } 
                    for(i=2;i<results.length;i++){
                        if(Number(results[i].id) > Number(recent[0].id)){
                            recent = [results[i], recent[0]];
                        }else if(Number(results[i].id) > Number(recent[1].id)){
                            recent = [recent[0], results[i]];
                        }
                    }
                }
                callback(recent);
            });
        },
        forArtist:function(id, callback){
            this.find({
                async:false,
                //select:"select * from `releases` where `artist` = '"+id+"'",
                select:"new Query('releases').addFilter('artist', $EQUAL, '"+id+"')"+
                    ".addFilter('deleted', $EQUAL, '')",
                success:function(results){
                    log.debug('Found %s releases for artist %s',results.data.length, id);
                    callback(results.data);
                },
                error: function(xhr, status, e){
                    log.error('failed to load all releases for artist %s.', e);
                    callback(_this.template(id));
                }
            });
        },
        forId: function(id, callback){
            var _this = this;
            this.get({
                async: false,
                id:id,
                success: function(results){
                    if(results.data.length){
                        callback(results.data[0]);
                    }else{
                        callback(_this.template(id));
                    }
                },
                error:function(xhr, status, e){
                    log.error('failed to find item for id %s', id);
                    callback(_this.template({
                        $id: id
                    }));
                }
            });
        },
        template: function(options){
            log.debug('generating template artist for %s', options.$id );
            var random_count = Math.floor(Math.random()*20),
                template_tracks = [];
            for (var i=0;i<random_count;i++){
                template_tracks[i] = (i<10?'0'+i:''+i)+'. '+jsPath.titled(3, false);
            }
            return $.extend({
                $id:            options.$id||'roe404',
                name:           jsPath.titled(2, false),
                description:    jsPath.paragraph(false),
                artist:         'roe000',
                image:          'error/thumb.jpg',
                tracks:         template_tracks,
                deleted:        ''
            }, options);
        }
    });
    
    
})(jQuery, RecordsOfExistence.Models);
 