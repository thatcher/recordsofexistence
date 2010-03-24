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
                        template:  'html/pages/artists.js'
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
                            template:   'html/pages/artist.js'
                        }).
                        render();
                    
                });
            });
        },
        
        events: function(event){
            log.debug('Serving events page.');
            var query = (event.m('admin'))?'all':'current';
            Events['all'](function(results){
                event.
                    m({
                        events:   results,
                        template:  'html/pages/events.js'
                    }).
                    render();
            });
        },
        
        contact: function(event){
            event.
                m({template:  'html/pages/contact.js'}).
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
                                template:   'html/pages/home.js'
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
                        template:   'html/pages/releases.js'
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
                    
                    //finally find the pressings for this release
                    Pressings.forRelease(id, function(pressings){
                        event.
                            m({
                                id:         id,
                                artist:     artist,
                                release:    release,
                                pressings:  pressings,
                                template:   'html/pages/release.js?id='+release.id
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
                        template:  'html/pages/news.js'
                    }).
                    render();
            });
        },
        
        pressings: function(event){
            log.debug('Serving pressings page.');
            Pressings.all(function(results){
                event.
                    m({
                        news:   results,
                        template:  'html/pages/pressings.js'
                    }).
                    render();
            });
        }
        
    });
    
})(jQuery, RecordsOfExistence.Services );
