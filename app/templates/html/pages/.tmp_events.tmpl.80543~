<e4x>
	{extend("html/base.js")}
    <block id='title'>
        <title>Records of Existence Events</title>
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
        <div id='events' >
            <h3>events</h3>
            {_.e4x([
                !admin ? '' :
                {div:{
                    $style:'clear:both;text-align:center;',
                    $:[{span:{ 
                        $class: "ss_sprite  ss_add",
                        $:[{a:{
                            $href:  $.env('root')+'admin/add/events/',
                            $: 'Add event'
                        }},{br:{}},
                        {a:{$id:'show_deleted',
                            $href:'#show/deleted',
                            $: 'show deleted events'
                        }},{span:' | '},
                        {a:{$id:'hide_deleted',
                            $href:'#hide/deleted',
                            $: 'hide deleted events'
                        }}]
                    }}
                ]}}
             ])} 
            <div style='width:auto;overflow-x:auto;'>
                <hr/>
                {_('.*', events).map(function(index){
                    return {form:{
                        $action:$.env('root')+'admin/save/events/'+this.$id,
                        $method:'post',
                        $:[{div:{
                            $class:'event column span-6 colborder '+
                                (this.deleted.length?'deleted':''),
                            $:[
                                !admin ? {span:this.date} :
                                {span:{ 
                                    $class:  "date ss_sprite  ss_image_add",
                                    $:[      'edit event date | ',
                                    {br:{}},
                                    {input:{
                                        $class: 'date', 
                                        $type:  'text',
                                        $name:  'date', 
                                        $value: this.date
                                    }}]
                                }},
                                {br:{}}, 
                                !admin ? '' : {span:{ 
                                    $class: "ss_sprite  ss_delete",
                                    $:[{a:{
                                        $href:  $.env('root')+'admin/'+
                                                (this.deleted.length?'restore':'remove')+
                                                '/events/'+this.$id,
                                        $:      ' | '+(this.deleted.length?'restore':'remove')+' event '
                                    }}]
                                }},
                                {br:{}},
                                !admin ? {br:{}} :
                                {span:{ 
                                    $class: "ss_sprite  ss_image_add",
                                    $:[      '  edit artist image ',
                                    {br:{}},
                                    {input:{
                                        $id:    'image', 
                                        $type:  'text',
                                        $name:  'image', 
                                        $value: this.image
                                    }}]
                                }},
                                {a:{
                                    $href:'#',
                                    $:[{img:{
                                        $src:$.env('data')+this.image,
                                        $alt:this.title,
                                        $width:'60px'
                                    }}]
                                }},{br:{}},
                                !admin ? {strong:this.title} :
                                {span:{ 
                                    $class: "ss_sprite ss_comment_edit ",
                                    $:[      '  edit event title ',
                                    {br:{}},
                                    {input:{
                                        $class: 'title', 
                                        $type:  'text',
                                        $name:  'title', 
                                        $value: this.title
                                    }}]
                                }},
                                !admin ? {p:     this.location} : 
                                {span:{ 
                                    $class: "ss_sprite ss_comment_edit ",
                                    $:[      '  edit event location ',
                                    {br:{}},
                                    {input:{
                                        $class: 'location', 
                                        $type:  'text',
                                        $name:  'location', 
                                        $value: this.location
                                    }}]
                                }},
                                !admin ? {p:     this.description} : 
                                {span:{ 
                                    $class: "ss_sprite ss_comment_edit ",
                                    $:[      '  edit event description ',
                                    {br:{}},
                                    {textarea:{
                                        $class: 'description', 
                                        $name:  'description', 
                                        $ :     this.description
                                    }}]
                                }},
                                !admin ? '' :
                                {input:{
                                    $type:  'submit', 
                                    $value: 'save', 
                                    $class: 'submit'
                                }}
                            ]
                        }
                    },(index%6==5)?
                        {div:{
                            $style:'margin-top:8em;clear:both;',
                            $:[
                                {h6:'more...'},
                                {hr:{ }}
                             ]
                         }} : ''
                    ]}};
                }).e4x()}
            </div>      
            
        </div>
    </block> 
</e4x> 
