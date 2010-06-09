<e4x>
	{extend("html/base.js")}
    <block id='title'>
        <title>Records of Existence Artists</title>
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
        <div id='artists'>
            <h3>artists</h3>
            {_.e4x([
                !admin ? '' :
                {div:{
                    $style:'clear:both;text-align:center;',
                    $:[{span:{ 
                        $class: "ss_sprite  ss_add",
                        $:[{a:{
                            $href:  $.env('root')+'admin/add/artists/',
                            $: 'Add artist'
                        }},{br:{}},
                        {a:{$id:'show_deleted',
                            $href:'#show/deleted',
                            $: 'show deleted artists'
                        }},{span:' | '},
                        {a:{$id:'hide_deleted',
                            $href:'#hide/deleted',
                            $: 'hide deleted artists'
                        }}]
                    }}
                ]}}
             ])} 
            <div class='first column span-11 colborder '>
                <ul>
                
                    {_('.*', artists).map(function(index){
                        return (index%2===0)?{li:{
                            $class: (this.deleted.length?'deleted':''),
                            $:[
                                ! admin ? '' : 
                                {span:{ 
                                    $class: "ss_sprite  ss_comment_edit",
                                    $:[{a:{
                                        $href:  $.env('root')+'artist/'+this.$id+"?admin",
                                        $: ' | edit artist '
                                    }},{br:{}}]
                                }},
                                !admin ? '' :
                                {span:{ 
                                    $class: "ss_sprite  ss_comment_delete",
                                    $:[{a:{
                                        $href:  $.env('root')+'admin/'+
                                                (this.deleted.length?'restore':'remove')+
                                                '/artists/'+this.$id,
                                        $:      ' | '+(this.deleted.length?'restore':'remove')+' artist '
                                    }},{br:{}}]
                                }},
                                !admin ? '' :
                                {span:{ 
                                    $class: "ss_sprite  ss_cd_add",
                                    $:[{a:{
                                        $href:  $.env('root')+'admin/add/releases/?artist='+this.$id,
                                        $:      ' | add release '
                                    }},{br:{}},
                                    {label:'RoE Artist #'+this.$id},{br:{}}]
                                }},
                                {a:{
                                    $href:$.env('root')+'artist/'+this.$id,
                                    $:[
                                        {strong:this.name},
                                        {img:{
                                            $src:$.env('data')+this.image,
                                            $alt:this.name,
                                            $height:'50px'
                                }}]
                            }}
                        ]}} : {};
                    }).e4x()}
                    
                </ul>
            </div>
            <div class=' last column  span-10'>
                <ul>
                    
                    {_('.*', artists).map(function(index){
                        return (index%2===1)?{li:{
                            $class: (this.deleted.length?'deleted':''),
                            $:[
                                !admin ? '' : 
                                {span:{ 
                                    $class: "ss_sprite  ss_comment_edit",
                                    $:[{a:{
                                        $href:  $.env('root')+'artist/'+this.$id+"?admin",
                                        $: ' | edit artist '
                                    }},{br:{}}]
                                }},
                                !admin ? '' :
                                {span:{ 
                                    $class: "ss_sprite  ss_comment_delete",
                                    $:[{a:{
                                        $href:  $.env('root')+'admin/'+
                                                (this.deleted.length?'restore':'remove')+
                                                '/artists/'+this.$id,
                                        $:      ' | '+(this.deleted.length?'restore':'remove')+' artist '
                                    }},{br:{}}]
                                }},
                                !admin ? '' :
                                {span:{ 
                                    $class: "ss_sprite  ss_cd_add",
                                    $:[{a:{
                                        $href:  $.env('root')+'admin/add/releases/?artist='+this.$id,
                                        $:      ' | add release '
                                    }},{br:{}},
                                    {label:'RoE Artist #'+this.$id},{br:{}}]
                                }},
                                {a:{
                                    $href:$.env('root')+'artist/'+this.$id,
                                    $:[
                                        {img:{
                                            $src:$.env('data')+this.image,
                                            $alt:this.name,
                                            $height:'50px'
                                        }},
                                        {strong:this.name}
                                ]}}
                        ]}} : {};
                    }).e4x()}
                    
                </ul>
            </div>
        </div>
    </block> 
</e4x> 
