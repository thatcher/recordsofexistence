<e4x>
	{extend("html/base.js")}
    <block id='title'>
        <title>Records of Existence Release {release.name}</title>
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
        <div id='release'>
        
            <form id='editRelease' method='post' action={$.env('root')+'admin/save/releases/'+release.$id}>
                <h3><a href={$.env('root')+'releases'}>&lt; releases</a></h3>
                <div class='first column span-5 colborder'>
                    {_.e4x( 
                        !admin ? [{h4:release.name}] :
                        [{span:{ 
                            $class: "ss_sprite  ss_comment_add",
                            $:      'edit release name | '
                        }},
                        {input:{
                            $type:  'text', 
                            $name:  'name', 
                            $value: release.name
                        }}]
                    )} 
                    <h5>
                        <a href={$.env('root')+'artist/'+artist.$id}>
                            {artist.name}
                        </a>
                    </h5>
                    <em>Release</em><br/>
                    <span>{release.$id}</span> 
                    <br/><br/>
                    {_.e4x([ 
                        !admin ? '' :
                        {input:{
                            $id:    'submitRelease',
                            $type:  'submit', 
                            $value: 'save', 
                            $class: 'submit'
                        }}
                    ])} 
                </div>
                 
                <div id='cover' 
                     class='column span-6 colborder'>
                    {_.e4x(
                        !admin ? [''] :
                        [{span:{ 
                            $class: "ss_sprite  ss_image_add",
                            $:      'edit release image | '
                        }},
                        {input:{
                            $id:    'image', 
                            $type:  'text',
                            $name:  'image', 
                            $value: release.image
                        }}]
                    )} 
                    <img src={$.env('data')+release.image} 
                         alt='release image'  
                         height='150px'/>
                    
                </div>
                <div id='media' 
                     class='column span-9'>
                    <ol class='clear'>
                    
                        {_('.*', release.tracks).map(function(index, title){
                            return {li:{$:
                                !admin ? 
                                [{a:{
                                    $target:  '_blank',
                                    $href:    $.env('data')+'releases/'+
                                                release.name.toLowerCase().replace(' ','_')+
                                                '/web/mp3/'+((index>10)?'':'0')+(index+1)+'.mp3',
                                    $:[
                                        title,
                                        {img:{ $src:$.env('root')+'images/audio_bullet.gif' }}
                                    ]
                                }}] 
                                :
                                [{span:{ 
                                    $class: "ss_sprite  ss_delete",
                                    $: [{a:{ 
                                        $href: $.env('root')+'admin/remove/tracks/'+
                                            '?release='+release.$id+'&index='+index,
                                        $:'remove track | '
                                    }}] 
                                }},
                                {input:{
                                    $id:    'tracks.'+index, 
                                    $type:  'text',
                                    $name:  'tracks.'+index, 
                                    $value:  title
                                }}]
                            }};
                        }).e4x()}
                        {_.e4x([ 
                            !admin ? '' :
                            {li:{$:[
                                 {span:{ 
                                    $class: "ss_sprite  ss_add",
                                    $:[{a:{
                                        $id:    'track.'+release.tracks.length, 
                                        $href:  $.env('root')+'admin/add/tracks/?release='+release.$id,
                                        $name:  'track.'+release.tracks.length, 
                                        $: 'Add a new track'
                                    }}]
                                }}
                             ]}}
                         ])} 

                        
                    </ol>
                </div>
                
                <!--/**div  class='this last column small is a box that span-3'>
                    <h6>purchase this album</h6>
                    <p align='center'>
                        <em>Compact Disc</em><br/>
                        <span id='cost'>$9.00</span>
                        [<a href='cart/add/2'>Buy</a>]
                    </p>
                </div*/-->
                <div    class='column span-18 push-3' >
                    {_.e4x( 
                        !admin ? [{p:release.description}] :
                        [{span:{ 
                            $class: "ss_sprite  ss_comment_add",
                            $:      'edit release description |'
                        }},
                        {textarea:{
                            $id:    'description',
                            $name:  'description',
                            $style: 'border-bottom:1px dotted #567',
                            $:      release.description||_.paragraph(1,true)
                        }}]
                    )}
                </div>
            </form>
            
            <div  class='column span-22'>
                <h3> pressings </h3>
                {_('.*', pressings).map(function(){
                    return {form:{
                        $id:admin?('editPressings-'+this.$id):('paypal-'+this.ska),
                        $method:'post',
                        $action:admin?
                            'admin/save/pressings/'+this.$id :
                            'https://www.paypal.com/cgi-bin/webscr' ,
                        $target:admin?'':'paypal',
                        $:[{div:{
                            $class:'pressing span-16',
                            $:[{div:{
                                $class:'first column span-13 prepend-2 colborder',
                                $:!admin ? [{p:this.description}] :
                                    [{span:{ 
                                        $style: "float:left;",
                                        $class: "ss_sprite  ss_delete",
                                        $:[{a:{
                                            $id:    'pressings/'+this.$id, 
                                            $href:  $.env('root')+'admin/remove/pressings/'+this.$id,
                                            $:      ' Remove this pressing | '
                                        }}]
                                    }},
                                    {span:{ 
                                        $class: "ss_sprite  ss_comment_add",
                                        $:      '  edit pressing description | '
                                    }},
                                    {textarea:{
                                        $id:    'description',
                                        $name:  'description',
                                        $:      this.description
                                    }},
                                    {input:{
                                        $type:  'hidden', 
                                        $name:  'release',
                                        $value: this.release
                                    }},
                                    {input:{
                                        $type:  'submit', 
                                        $value: 'save', 
                                        $class: 'submit'
                                    }}]
                            }}]
                        }},{div:{
                        $class:'last column small box span-4',
                        $:[ {h6:'purchase this pressing'},
                            {p:{
                                $align:'center',
                                $: admin ? 
                                    [{span:{ 
                                        $class: "ss_sprite  ss_cd",
                                        $:      '  edit release format | '
                                    }},
                                    {input:{
                                        $id:    'format', 
                                        $type:  'text',
                                        $name:  'format', 
                                        $value: this.format
                                    }},
                                    {br:{}},
                                    {span:{ 
                                        $class: "ss_sprite  ss_money",
                                        $:      '  edit release price | '
                                    }},
                                    {input:{
                                        $id:    'price', 
                                        $type:  'text',
                                        $name:  'price', 
                                        $value: this.price
                                    }},
                                    {br:{}},
                                    {span:{ 
                                        $class: "ss_sprite  ss_creditcards ",
                                        $:      '  edit release ska | '
                                    }},
                                    {input:{
                                        $id:    'ska', 
                                        $type:  'text',
                                        $name:  'ska', 
                                        $value: this.ska
                                    }}] : 
                                    [{em:this.format},
                                    {br:{}},
                                    {span:{ $class:'cost', $:'$'+this.price }},
                                    {br:{}},
                                    {input:{
                                        $type:'hidden',
                                        $name:'cmd',
                                        $value:'_s-xclick'
                                    }},
                                    {input:{
                                        $type:'hidden',
                                        $name:'hosted_button_id',
                                        $value:this.ska
                                    }},
                                    {input:{
                                        $id:    this.ska,
                                        $class: 'addtocart',
                                        $type:  'image',
                                        $src:   'https://www.paypal.com/en_US/i/btn/btn_cart_LG.gif',
                                        $alt:   'PayPal - The safer, easier way to pay online!',
                                        $name:  'submit'
                                    }}]
                            }}]
                        }}]
                    }};
                }).e4x()}
            </div>
        </div>
        {_.e4x([
            !admin ? '' :
            {div:{
                $style:'clear:both;text-align:center;',
                $:[{span:{ 
                    $class: "ss_sprite  ss_add",
                    $:[{a:{
                        $href:  $.env('root')+'admin/add/pressings/?release='+release.$id,
                        $: 'Add a new pressing'
                    }}]
                }}
            ]}}
         ])} 
    </block>
    
</e4x> 
