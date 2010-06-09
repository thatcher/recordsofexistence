<e4x>
	{extend("html/base.js")}
    <block id='title'>
        <title>Records of Existence Releases</title>
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
            <div id='releases'>
                <h3>releases</h3>
                
                {_.e4x([
                    !admin ? '' :
                    {div:{
                        $style:'clear:both;text-align:center;',
                        $:[{span:{ 
                            $class: "ss_sprite  ss_add",
                            $:[{a:{
                                $href:  $.env('root')+'artists?admin',
                                $: 'Add release (via artist)'
                            }},{br:{}},
                            {a:{$id:'show_deleted',
                                $href:'#show/deleted',
                                $: 'show deleted releases'
                            }},{span:' | '},
                            {a:{$id:'hide_deleted',
                                $href:'#hide/deleted',
                                $: 'hide deleted releases'
                            }}]
                        }}
                    ]}}
                 ])} 
                <div class='first column span-7 colborder'>
                    <ul>
                    
                        {_('.*', releases).map(function(index){
                            return (index%3===0)?{li:{
                                div:{
                                    $class:'span-7 ' + (this.deleted.length?'deleted':''),
                                    $:[
                                        !admin ? '' : 
                                        {span:{ 
                                            $class: "ss_sprite  ss_comment_edit",
                                            $:[{a:{
                                                $href:  $.env('root')+'release/'+this.$id+'?admin',
                                                $:      ' | edit release '
                                            }},{br:{}}]
                                        }},
                                        !admin ? '' : 
                                        {span:{ 
                                            $class: "ss_sprite  ss_delete",
                                            $:[{a:{
                                                $href:  $.env('root')+'admin/'+
                                                        (this.deleted.length?'restore':'remove')+
                                                        '/releases/'+this.$id,
                                                $:      ' | '+(this.deleted.length?'restore':'remove')+' release '
                                            }},{br:{}},
                                            {label:'RoE Release #'+this.$id},{br:{}}]
                                        }},
                                        {a:{
                                            $href:$.env('root')+'release/'+this.$id,
                                            $style:'float:left;',
                                            img:{
                                                $src:$.env('data')+this.image,
                                                $alt:this.name,
                                                $height:'100px'
                                            }
                                        }},
                                        {strong:this.name},{br:{}},
                                        {span:this.description.substring(0,128)+'...'}
                                    ]
                                }
                            }} : {};
                        }).e4x()}
                        
                    </ul>
                </div>
                <div class="column span-7 colborder">
                    <ul>
                    
                        {_('.*', releases).map(function(index){
                            return (index%3===1)?{li:{
                                div:{
                                    $class:'span-7 ' + (this.deleted.length?'deleted':''),
                                    $:[
                                        !admin ? '' : 
                                        {span:{ 
                                            $class: "ss_sprite  ss_comment_edit",
                                            $:[{a:{
                                                $href:  $.env('root')+'release/'+this.$id+'?admin',
                                                $:      ' | edit release '
                                            }},{br:{}}]
                                        }},
                                        !admin ? '' : 
                                        {span:{ 
                                            $class: "ss_sprite  ss_delete",
                                            $:[{a:{
                                                $href:  $.env('root')+'admin/'+
                                                        (this.deleted.length?'restore':'remove')+
                                                        '/releases/'+this.$id,
                                                $:      ' | '+(this.deleted.length?'restore':'remove')+' release '
                                            }},{br:{}},
                                            {label:'RoE Release #'+this.$id},{br:{}}]
                                        }},
                                        {a:{
                                            $href:$.env('root')+'release/'+this.$id,
                                            $style:'float:left;',
                                            img:{
                                                $src:$.env('data')+this.image,
                                                $alt:this.name,
                                                $height:'100px'
                                            }
                                        }},
                                        {strong:this.name},{br:{}},
                                        {span:this.description.substring(0,128)+'...'}
                                    ]
                                }
                            }} : {};
                        }).e4x()}

                    </ul>
                </div>
                <div class='last column span-7'>
                    <ul>
                    
                        {_('.*', releases).map(function(index){
                            return (index%3===2)?{li:{
                                div:{
                                    $class:'span-7 ' + (this.deleted.length?'deleted':''),
                                    $:[
                                        !admin ? '' : 
                                        {span:{ 
                                            $class: "ss_sprite  ss_comment_edit",
                                            $:[{a:{
                                                $href:  $.env('root')+'release/'+this.$id+'?admin',
                                                $:      ' | edit release '
                                            }},{br:{}}]
                                        }},
                                        !admin ? '' : 
                                        {span:{ 
                                            $class: "ss_sprite  ss_delete",
                                            $:[{a:{
                                                $href:  $.env('root')+'admin/'+
                                                        (this.deleted.length?'restore':'remove')+
                                                        '/releases/'+this.$id,
                                                $:      ' | '+(this.deleted.length?'restore':'remove')+' release '
                                            }},{br:{}},
                                            {label:'RoE Release #'+this.$id},{br:{}}]
                                        }},
                                        {a:{
                                            $href:$.env('root')+'release/'+this.$id,
                                            $style:'float:left;',
                                            img:{
                                                $src:$.env('data')+this.image,
                                                $alt:this.name,
                                                $height:'100px'
                                            }
                                        }},
                                        {strong:this.name},{br:{}},
                                        {span:this.description.substring(0,128)+'...'}
                                    ]
                                }
                            }} : {};
                        }).e4x()}

                    </ul>
                </div>
            </div>
    </block> 
</e4x> 
