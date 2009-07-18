/**
 * @author thatcher
 */
(function($, $$, $S, $M){
    
    var log,
        artists,
        releases;
    
    $S.Artists = function(options){
        $.extend(true, this, options);
        log = $.logger('RecordsOfExistence.Services.Artists');
        artists = $.$('#artistsModel').get();
        releases = $.$('#releasesModel').get();
    };
    
    $.extend($S.Artists.prototype, new $$.Servlet(), {
        handleGet: function(request, response){
            log.debug('Serving page.');
            var id = response.params('id'),
                artist, 
                release = [],
                i;
            if(id){
                //find the artists based on the id passed
                for(i=0;i<artists.length;i++){
                    if(artists[i].artist == id){
                        artist = artists[i];
                        break;
                    }
                }
                //find the releases for this artist
                if(artist){
                    for(i=0;i<releases.length;i++){
                        if(releases[i].artist == artist.id){
                            release.push(releases[i]);
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
                    m({artists:artists}).
                    render();
            }
        }
    });
    
})(jQuery, Claypool.Server, RecordsOfExistence.Services, RecordsOfExistence.Models);
