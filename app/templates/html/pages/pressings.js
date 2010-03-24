<e4x>
	{extend("html/base.js")}
    <block id='title'>
        <title>Records of Existence Pressings</title>
    </block>
    <block id='stylesheet_extra'>
    <!-- 
    /**
     *  extra stylesheet for admin mode 
     */
    -->
    {_.e4x((!admin ? '' :
        [{link:{
            $href:  $.env('root')+"css/site-admin.css", 
            $type:  "text/css" ,
            $rel:   "stylesheet"
        }}]
    ))}
    </block>
    <block id='main'>
        <div id='pressings'>
            <h3>pressings</h3>
            {_.e4x([
                !admin ? '' :
                {div:{
                    $style:'clear:both;text-align:center;',
                    $:[{span:{ 
                        $class: "ss_sprite  ss_cd_add",
                        $:[{a:{
                            $href:  $.env('root')+'admin/add/pressings/',
                            $: 'Add pressings'
                        }}]
                    }}
                ]}}
             ])} 
            <div class=''>
                <ul>
                
                   
                    
                </ul>
            </div>
        </div>
    </block> 
</e4x> 
