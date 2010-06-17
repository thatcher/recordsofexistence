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
            label_id:{
                pattern:/^.{1,64}$/,
                not:[null],
                msg:'The release control number.'
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
            },
            featured:{
                msg:'display on front page?'
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
        featured: function(callback){
            var _this = this;
            this.find({
                async:false,
                select:"new Query('releases').addFilter('deleted', $EQUAL, '').addFilter('featured', $EQUAL, 'true')",
                success:function(results){
                    log.debug('loaded all %s releases', results.data.length );
                    callback(results.data);
                },
                error: function(){
                    log.error('failed to load all releases.');
                    var releases = [];
                    for(var i=0;i<2;i++){
                        releases[i] = _this.template();
                    }
                    callback(releases);
                }
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
        
        changeArtistId: function(oldID, newID){
            var _this = this;
            this.forArtist(oldID, function(artists){
                if(artists)
                    log.debug('found %s pressing to change release id', artists.length);
                $(artists).each(function(){
                    var releaseId = this.$id;
                    this.artist = newID;
                    _this.save({
                        id: this.$id,
                        async: false,
                        data: this,
                        success: function(){
                            log.info('successfully changed release id for pressing %s',releaseId);
                        },
                        error: function(xhr, status, e){
                            log.error('failed to changed release id for pressing %s',releaseId)
                               .exception(e);
                        }
                    })
                });
            });
        },
        
        template: function(options){
            log.debug('generating template artist for %s', options.$id );
            var count = 7,
                template_tracks = [];
            for (var i=0;i<count;i++){
                template_tracks[i] = (i<10?'0'+i:''+i)+'. '+$.title(3, false);
            }
            return $.extend({
                $id:            options.$id||'roe404',
                name:           $.title(2, false),
                description:    $.paragraph(false),
                artist:         'roe000',
                image:          'error/thumb.jpg',
                tracks:         template_tracks,
                deleted:        '',
                label_id:        ''
            }, options);
        }
    });
    
    
})(jQuery, RecordsOfExistence.Models);
 