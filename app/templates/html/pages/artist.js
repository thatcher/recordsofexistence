<e4x>
	{extend("html/base.js"+"?artist="+artist.$id)}
    <block id='title'>
        <title>Records of Existence Artist {artist.name}</title>
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
        <form id='editArtist' method='post' action={$.env('root')+'admin/save/artists/'+artist.$id}>
            <div id='artist'>
                <h3>
                    <a href={$.env('root')+'artists'}>
                        &lt; artists
                    </a>
                </h3>
                <div class='first column span-7 prepend-2 colborder'>
                    {_.e4x([ 
                        !admin ? '' :
                        {span:{ 
                            $class: "ss_sprite  ss_comment_add",
                            $:      '  edit artist name  '
                        }}
                    ])} 
                    <h4>
                    {_.e4x([
                        !admin ? artist.name : 
                        {input:{ 
                            $id:    'name', 
                            $type:  'text', 
                            $name:  'name', 
                            $value: artist.name
                        }}
                    ])}
                    </h4>
                    {_.e4x(
                        !admin ? [''] :
                        [{span:{ 
                            $class: "ss_sprite  ss_image_add",
                            $:      '  edit artist image '
                        }},
                        {br:{}},
                        {input:{
                            $id:    'image', 
                            $type:  'text',
                            $name:  'image', 
                            $value: artist.image
                        }}]
                    )} 
                    <img src=   {$.env('data')+artist.image} 
                         alt=   {artist.image}  
                         height='150px'/>
                    <strong>releases</strong>
                    <ul>
                        {_('.*', releases).map(function(){
                            return {li:{
                                $: !admin ? [{a:{
                                    $href:  $.env('root')+'release/'+this.$id,
                                    $:this.name
                                }}] : 
                                [{span:{ 
                                        $class: "ss_sprite  ss_delete",
                                        $:[{a:{
                                            $href:  $.env('root')+'admin/remove/releases/'+this.$id,
                                            $:      ' remove this release | '
                                        }}]
                                    }},
                                    {span:{ 
                                        $class: "ss_sprite  ss_comment_add",
                                        $:[{a:{
                                            $href:  $.env('root')+'release/'+artist.$id+'?admin',
                                            $:      ' edit this release | '
                                        }}]
                                    }},
                                    {br:{}},
                                    this.name
                                ]
                            }};
                        }).e4x()}
                        {_.e4x([ 
                            !admin ? '' :
                            {li:{$:[
                                 {a:{
                                     $href:$.env('root')+'admin/add/releases/?artist='+artist.$id,
                                     $:[
                                         {span:{ 
                                             $class: "ss_sprite  ss_add"
                                         }},
                                         'Add Release'
                                     ]
                                 }}
                             ]}}
                         ])} 
                    </ul>
                </div>
                <div class=' last column span-12'>
                    {_.e4x( 
                        !admin ? [{p:artist.description}] :
                        [{span:{ 
                            $class: "ss_sprite  ss_comment_add",
                            $:      '  edit artist description  '
                        }},
                        {textarea:{
                            $id:    'description',
                            $name:  'description',
                            $:      artist.description
                        }},
                        {input:{
                            $type:  'submit', 
                            $value: 'save', 
                            $class: 'submit'
                        }}]
                    )} 
                </div>
            </div>
        </form>
    </block> 
</e4x> 
