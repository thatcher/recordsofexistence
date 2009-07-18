/**
 * @author thatcher
 */
(function($, $$, $S){
    
    var log,
        artists,
        releases;
    
    $S.Releases = function(options){
        $.extend(true, this, options);
        log = $.logger('RecordsOfExistence.Services.Releases');
        artists = $.$('#artistsModel').get();
        releases = $.$('#releasesModel').get(); 
    };
    
    $.extend($S.Releases.prototype, new $$.Servlet(), {
        handleGet: function(request, response){
            log.debug('Serving page.');
            var id = response.params('id'),
                artist, 
                release,
                i;
            if(id){
                //find the releases based on the id passed
                for(i=0;i<releases.length;i++){
                    if(releases[i].release == id){
                        release = releases[i]; 
                        break;
                    }
                }
                //find the artist for this release
                if(release){
                    for(i=0;i<artists.length;i++){
                        if(artists[i].id == release.artist){
                            artist = artists[i];
                            break;
                        }
                    }
                }
                response.
                    m({
                        id:id,
                        artist:artist,
                        release:release
                    }).
                    render();
            }else{
                //list all artists
                response.
                    m({releases:releases}).
                    render();
            }
        }
    });
    
})(jQuery, Claypool.Server, RecordsOfExistence.Services);
