/**
 * @author thatcher
 */
(function($, $M, _){
    
    var data,
        log;
    
    $M.Releases = function(options){
        $.extend(true, this, options);
        log = $.logger('RecordsOfExistence.Models.Releases');
    };
    
    $.extend($M.Releases.prototype,{
        get: function(){
            var url = $.env('data')+'releases/metadata.json';
            if(!data){
                $.ajax({
                    type:'GET',
                    url:url,
                    datatype:'json',
                    async:false,
                    success: function(json){
                        log.debug('Loaded data %s',json); 
                        data = _.json2js(json)._;
                    },
                    error:function(xhr, status, e){
                        log.error('failed to load data %s',url).
                            exception(e);
                    }
                });
            }
            return data;
        }
    });
    
})(jQuery, RecordsOfExistence.Models, jsPath );