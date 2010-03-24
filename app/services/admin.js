/**
 * @author thatcher
 */
(function($,  $S){
    
    var log;
    
    $S.Admin = function(options){
        log = $.logger('RecordsOfExistence.Services.Admin');
        $.extend(true, this, options);
    };
    
    $.extend($S.Admin.prototype,{
        
        handle: function(event, response){
            var action  = event.params('action'),
                domain  = event.params('domain'),
                id      = event.params('id');
            
            log.debug('Action %s | Domain %s | Id %s', action, domain, id);
            
            //allows us to provide generic handlers and more specific handlers
            //based on how much information was passed.
            log.debug('%s/%s/ isFunction? %s', action, domain, $.isFunction(admin[action+'/'+domain+'/']));
            if($.isFunction(admin[action+'/'+domain+'/'+id+'/'])){
                admin[action+'/'+domain+'/'+id+'/'](event);
            }else if($.isFunction(admin[action+'/'+domain+'/'])){
                admin[action+'/'+domain+'/'](id, event);
            }else if($.isFunction(admin[action+'/'])){
                admin[action+'/'](domain, id, event);
            }
            
            log.debug(' %s / %s / %s : Completed.', action, domain, id);
        }
    });
    
    var admin = {
        'save/': function(domain, id, event){
            var Model = $.$('#'+domain+'Model'),
                instance = Model.serialize(event.params('parameters')), 
                prop, parts;
                
            log.debug('deserializing post body %s', event.request.body);
            //figure out if there are mutli valued arrays
            for(prop in event.params('parameters')){
                parts = prop.split('.');
                if(parts.length == 2){
                    log.debug('deserializing multi-valued form elements %s', prop);
                    if(!instance[parts[0]]){
                        instance[parts[0]] = [];
                    }
                    log.debug('%s[%s] = %s',parts[0], parts[1], event.params('parameters')[prop]);
                    instance[parts[0]][parts[1]] = event.params('parameters')[prop];
                }
            }
            //TODO:
            //instance = Model.serialize(instance); 
                
            instance.deleted = '';
            
            Model.save({
                async:  false,
                id:     id,
                data:   instance,
                success: function(result){
                    log.info('Saved %s/%s', domain, id);
                    
                    event.response.headers =  {
                        status:   302,
                        "Location": $.env('root')+domain+"?admin"
                    };
                    return;
                },
                error: function(xhr, status, e){
                    log.error('failed to save %s/%s', domain, id).
                        exception(e);
                    throw new Error(e);
                }
            });
        },
        'add/': function(domain, id, event){
            var Model = $.$('#'+domain+'Model');
            
            Model.get({
                async:false,
                success: function(results){
                    var count = results.data.length+1,
                        newId,
                        params = event.request.parameters;
                    if(count<10){
                        newId = 'roe00'+count;
                    }else if (count<100){
                        newId = 'roe0'+count;
                    }else{
                        newId = 'roe'+count;
                    }
                    $.$('#'+domain+'Model').save({
                        async:false,
                        id:newId,
                        data:$.$('#'+domain+'Model').template($.extend({$id:newId},params)),
                        success: function(){
                            log.info('Added %s/%s', domain, newId);
                            event.response.headers =  {
                                status:   302,
                                "Location": $.env('root')+domain+"?admin"
                            };
                            return;
                        },
                        error: function(xhr, status, e){
                            log.error('failed to add %s/%s', domain, id).
                                exception(e);
                            throw new Error(e);
                        }
                    });
                },
                error: function(xhr, status, e){
                    log.error('failed to add %s/%s', domain, id).
                        exception(e);
                    throw new Error(e);
                }
            });
        },
        
        'restore/': function(domain, id, event){
            var Model = $.$('#'+domain+'Model'),
                instance;
            
            Model.get({
                id: id,
                async:false,
                success: function(results){
                    instance = results.data[0];
                    instance.deleted = '';
                    log.info('Marking Undeleted %s/%s', domain, id);
                    Model.save({
                        id:id,
                        data:instance,
                        async:false,
                        success: function(){
                            log.info('successfully marked undeleted %s %s', domain, id);
                        },
                        error: function(){
                            log.warn('failed to mark undeleted %s %s', domain, id)
                        }
                    });
                    event.response.headers =  {
                        status:   302,
                        "Location": $.env('root')+domain+"?admin"
                    };
                    return;
                },
                error: function(xhr, status, e){
                    log.error('failed to restore %s/%s', domain, id).
                        exception(e);
                    throw new Error(e);
                }
            });
        },
        
        'remove/': function(domain, id, event){
            var Model = $.$('#'+domain+'Model'),
                instance;
            
            Model.get({
                id: id,
                async:false,
                success: function(results){
                    instance = results.data[0];
                    instance.deleted = new Date().getTime()+'';
                    log.info('Marking Deleted %s/%s', domain, id);
                    Model.save({
                        id:id,
                        data:instance,
                        async:false,
                        success: function(){
                            log.info('successfully marked deleted %s %s', domain, id);
                        },
                        error: function(){
                            log.warn('failed to mark deleted %s %s', domain, id)
                        }
                    });
                    event.response.headers =  {
                        status:   302,
                        "Location": $.env('root')+domain+"?admin"
                    };
                    return;
                },
                error: function(xhr, status, e){
                    log.error('failed to restore %s/%s', domain, id).
                        exception(e);
                    throw new Error(e);
                }
            });
        },
        'save/pressings/' : function(id, event){
            
            var Model = $.$('#pressingsModel'),
                instance = Model.serialize(event.params('parameters'));
            admin['save/']('pressings', id, event);
            event.response.headers =  {
                status:   302,
                "Location": $.env('root')+'release/'+instance.release+"?admin"
            };
            return;
        },
        'add/pressings/' : function(id, event){
            //check to see if this event defined an association
            //with a release
            var release = event.params('parameters').release,
                pressing;
            if(release){
                $.$('#pressingsModel').get({
                    async:false,
                    success: function(results){
                        var count = results.data.length+1,
                            newId;
                        if(count<10){
                            newId = 'roe00'+count;
                        }else if (count<100){
                            newId = 'roe0'+count;
                        }else{
                            newId = 'roe'+count;
                        }
                        pressing = $.$('#pressingsModel').template({
                            release:release,
                            $id: newId
                        });
                        $.$('#pressingsModel').save({
                            id:newId,
                            data:pressing,
                            async:false,
                            success: function(){
                                log.info('successfully added pressing for release %s', release);
                            },
                            error: function(){
                                log.warn('failed to save pressing for release %s', release);
                            }
                        });
                        event.response.headers =  {
                            status:   302,
                            "Location": $.env('root')+'release/'+release+"?admin"
                        };
                        return;
                    },
                    error: function(xhr, status, e){
                        log.error('failed to retreive pressings').
                            exception(e);
                        throw new Error(e);
                    }
                });
            }
        },
        'remove/pressings/' : function(id, event){
            //check to see if this event defined an association
            //with a release
            var release = event.params('parameters').release;
            if(release){

            }
        },
        'add/tracks/' : function(id, event){
            //check to see if this event defined an association
            //with a release
            var release = event.params('parameters').release;
            log.info('adding track to release %s', release);
            if(release){
                $.$('#releasesModel').get({
                    id: release,
                    async:false,
                    success: function(results){
                        instance = results.data[0];
                        instance.tracks.push('XX.'+jsPath.titled(3));
                        log.info('Added template track ');
                        $.$('#releasesModel').save({
                            id:release,
                            data:instance,
                            async:false,
                            success: function(){
                                log.info('successfully saved track %s', release);
                            },
                            error: function(){
                                log.warn('failed to save track %s', release);
                            }
                        });
                        event.response.headers =  {
                            status:   302,
                            "Location": $.env('root')+'release/'+release+"?admin"
                        };
                        return;
                    },
                    error: function(xhr, status, e){
                        log.error('failed to retreive release %s', release).
                            exception(e);
                        throw new Error(e);
                    }
                });
            }
        },
        'remove/tracks/' : function(id, event){
            //check to see if this event defined an association
            //with a release
            var release = event.params('parameters').release,
                index     = event.params('parameters').index;
            log.info('adding track to release %s', release);
            if(release){
                $.$('#releasesModel').get({
                    id: release,
                    async:false,
                    success: function(results){
                        instance = results.data[0];
                        instance.tracks.splice(Number(index), 1);
                        log.info('Added template track ');
                        $.$('#releasesModel').save({
                            id:release,
                            data:instance,
                            async:false,
                            success: function(){
                                log.info('successfully saved track %s', release);
                            },
                            error: function(){
                                log.warn('failed to save track %s', release);
                            }
                        });
                        event.response.headers =  {
                            status:   302,
                            "Location": $.env('root')+'release/'+release+"?admin"
                        };
                        return;
                    },
                    error: function(xhr, status, e){
                        log.error('failed to retreive release %s', release).
                            exception(e);
                        throw new Error(e);
                    }
                });
            }
        }
    };
    
})(jQuery, RecordsOfExistence.Services );
