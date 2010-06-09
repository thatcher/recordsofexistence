/**
 * @author thatcher
 */
(function($, $S){
    
    var log,
        models = [
            'artists',
            'releases',
            'pressings',
            'news',
            'events'
        ];
    
    $S.Manage = function(options){
        $.extend(true, this, options);
        log = $.logger('RecordsOfExistence.Services.Manage');
    };
    
    $.extend($S.Manage.prototype, {
        handle:function(event){
            var command = event.params('command'),
                target = event.params('target');
            Commands[command](target?[target]:models, event);
            if(!('dumpdata' == command)){
                event.response.body = command + ' executed successfully';
            }
        }
    });
    
    var Commands = {
        reset: function(targets){
            //drops domains (tables) for each model
            $(targets).each(function(index, value){
                $.$('#'+value+'Model').destroy({
                    async:false,
                    success:function(result){
                        log.info(value+' domain destroyed');
                    }
                });
            });
        },
        syncdb: function(targets){
            //creates domain (tables) for each model
            var data,
                data_url = $.env('initialdata')+'__initial__.json?'+$.uuid();
            log.info('loading initial data from %s', data_url);
            $.ajax({
                type:'GET',
                async:false,
                url:data_url,
                dataType:'json',
                success:function(_data){
                    data = _data;
                    log.info('loaded initial data');
                },
                error:function(xhr, status, e){
                    log.error('failed [%s] to load initial data %s', status, e);
                }
            });
                
            $(targets).each(function(index, value){
                var domain = $.$('#'+value+'Model');
                    
                log.info('creating domain %s', value);
                domain.create({
                    async:false,
                    success:function(result){
                        log.info(value+' domain available');
                    }
                });
                
                domain.save({
                    async:false,
                    batch:true,
                    data:data[value],
                    success: function(){
                        log.info('%s batch save successful', value);
                    },
                    error: function(){
                        log.error('%s batch save failed');
                    }
                });
            });
        },
        dumpdata: function(targets, event){
            var data = {};
            $(targets).each(function(index, value){
                var domain = $.$('#'+value+'Model');
                    
                domain.all(function(results){
                    log.info('%s domain dump successful', value);
                    data[value] = results;
                });
                
            });
            event.write(jsPath.js2json(data, null, '    '));
            event.response.headers =  {
                status:   200,
                'Content-Type':'application/json'
            };
        }
    }
})(jQuery, RecordsOfExistence.Services);


