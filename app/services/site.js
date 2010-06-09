/**
 * @author thatcher
 */
(function($,  $S){
    
    var log,
        Artists,
        Releases,
        Pressings,
        News,
        Events;
    
    $S.Site = function(options){
        log = $.logger('RecordsOfExistence.Services.Site');
        $.extend(true, this, options);
        Artists     = $.$('#artistsModel');
        Releases    = $.$('#releasesModel');
        Pressings   = $.$('#pressingsModel');
        News        = $.$('#newsModel');
        Events      = $.$('#eventsModel');
    };
    
    $.extend($S.Site.prototype,{
        
        artists: function(event){
            log.debug('Serving artists page.');
            var query = (event.m('admin'))?'all':'current';
            Artists[query](function(results){
                event.
                    m({
                        artists:   results,
                        template:  $.env('templates') +'html/pages/artists.tmpl'
                    }).
                    render();
            });
        },
        
        artist: function(event){
            var id = event.params('id');
            log.debug('Serving artist %s page.', id);
            
            var artist,
                releases;
            
            Artists.forId(id, function(result){
                artist = result;
                //find the releases for this artist
                Releases.forArtist(id, function(results){
                    releases = results;
                    event.
                        m({
                            id:         id,
                            artist:     artist,
                            releases:   releases,
                            template:   $.env('templates') +'html/pages/artist.tmpl'
                        }).
                        render();
                    
                });
            });
        },
        
        events: function(event){
            log.debug('Serving events page.');
            var query = (event.m('admin'))?'all':'current';
            Events[query](function(results){
                event.
                    m({
                        events:   results,
                        template:  $.env('templates') +'html/pages/events.tmpl'
                    }).
                    render();
            });
        },
        
        contact: function(event){
            event.
                m({template:  $.env('templates') +'html/pages/contact.tmpl'}).
                render();
        },
        
        home: function(event){
            log.debug('Serving home page.');
            
            // The name is a little distracting but events is not related to
            // the controller/service event.  Events is an application specific 
            // model that provides a calendar of 'whats going on when'
            // - Recent Events -
            // only provide the last three events to avoid clutter     
            var events,
                releases,
                news;
            Events.recent(3,function(results){
                events = results;
                
                // - Recent Releases -
                // provides the last two releases to promote interest
                Releases.recent(function(results){
                    recent = results;
                    
                    // - Recent Events -
                    // only provide the last 5 news entriew to avoid clutter 
                    News.recent(5, function(results){
                        news = results;
                        
                        event.
                            m({
                                recent:     recent,
                                news:       news,
                                events:     events,
                                template:   $.env('templates') +'html/pages/home.tmpl'
                            }).
                            render();
                    });
                });
            });
            
        },
        
        releases: function(event){
            log.debug('Serving releases page.');
            var query = (event.m('admin'))?'all':'current';
            Releases[query](function(results){
                event.
                    m({
                        releases:   results,
                        template:   $.env('templates') +'html/pages/releases.tmpl'
                    }).
                    render();
            });
        },
        
        release: function(event){
            var id = event.params('id');
            //find the releases based on the id passed
                
            Releases.forId(id, function(release){
                
                //find the artist for this release
                Artists.forId(release.artist,  function(artist){
                    
                    var query = (event.m('admin'))?'forRelease':'currentForRelease';
                    //finally find the pressings for this release
                    Pressings[query](id, function(pressings){
                        event.
                            m({
                                id:         id,
                                artist:     artist,
                                release:    release,
                                pressings:  pressings,
                                template:   $.env('templates') + 'html/pages/release.tmpl?id='+release.id
                            }).
                            render();
                    });
                    
                });
            });
        },
        
        news: function(event){
            log.debug('Serving news page.');
            var query = (event.m('admin'))?'all':'current';
            News[query](function(results){
                event.
                    m({
                        news:   results,
                        template:  $.env('templates') +'html/pages/news.tmpl'
                    }).
                    render();
            });
        }
        
    });
    
})(jQuery, RecordsOfExistence.Services );
