/**
 * @author thatcher
 */
(function($, $$, $S){
    
    var log,
        releases,
        news,
        events;
    
    $S.Home = function(options){
        $.extend(true, this, options);
        log = $.logger('RecordsOfExistence.Services.Home');
        releases = $.$('#releasesModel').get();
        news = $.$('#newsModel').get();
        events = $.$('#eventsModel').get();
    };
    
    $.extend($S.Home.prototype, new $$.Servlet(), {
        handleGet: function(request, response){
            log.debug('Serving page.');
            
            var i, recent = [releases[0], releases[1]];
            
            //find the recent releases based on roe release id
            if(Number(recent[0].release)<Number(recent[1].release)){
                //make sure we order largest to smallest numerically
                recent = [releases[1], releases[0]];
            }
            if(releases.length > 2){
                for(i=2;i<releases.length;i++){
                    if(Number(releases[i].release) > Number(recent[0].release)){
                        recent = [releases[i], recent[0]];
                    }else if(Number(releases[i].release) > Number(recent[1].release)){
                        recent = [recent[0], releases[i]];
                    }
                }
            }
            response.
                m({
                    recent:releases.slice(releases.length-4,releases.length-1),
                    news: news.slice(0,news.length>4?5:news.length),
                    events: events.slice(0,events.length>2?3:events.length)
                }).
                render();
        }
    });
    
})(jQuery, Claypool.Server, RecordsOfExistence.Services);
