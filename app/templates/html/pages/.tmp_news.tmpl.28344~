<e4x>
	{extend("html/base.js")}
    <block id='title'>
        <title>Records of Existence News</title>
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
        <div id='news' >
            <h3>news archives</h3>
            {_.e4x([
                !admin ? '' :
                {div:{
                    $style:'clear:both;text-align:center;',
                    $:[{span:{ 
                        $class: "ss_sprite  ss_add",
                        $:[{a:{
                            $href:  $.env('root')+'admin/add/news/',
                            $: 'Add news'
                        }},{br:{}},
                        {a:{$id:'show_deleted',
                            $href:'#show/deleted',
                            $: 'show deleted news'
                        }},{span:' | '},
                        {a:{$id:'hide_deleted',
                            $href:'#hide/deleted',
                            $: 'hide deleted news'
                        }}]
                    }}
                ]}}
             ])} 
            {_('.*', news).map(function(index){
                return {form: { 
                    $action:'admin/save/news/'+this.$id,
                    $method:'post',
                    $:[{div:{
                        $class: (this.deleted.length?'deleted':''),
                        $:[ !admin ?  
                            {h4:this.title} : 
                            {span:{ 
                                $class:  "title ss_sprite  ss_image_add",
                                $:[      'edit news title | ',
                                {span:{ 
                                    $class: "ss_sprite  ss_delete",
                                    $:[{a:{
                                        $href:  $.env('root')+'admin/'+
                                                (this.deleted.length?'restore':'remove')+
                                                '/news/'+this.$id,
                                        $:      ' | '+(this.deleted.length?'restore':'remove')+' news '
                                    }}]
                                }},
                                {br:{}},
                                {input:{
                                    $class: 'title', 
                                    $type:  'text',
                                    $name:  'title', 
                                    $value: this.title
                                }}]
                            }},
                            {p:{
                             $:[!admin ? {strong:this.date} : 
                                {span:{ 
                                    $class: "date ss_sprite  ss_comment_add",
                                    $:[      'edit news date | ',
                                    {br:{}},
                                    {input:{
                                        $class: 'date', 
                                        $type:  'text',
                                        $name:  'date', 
                                        $value: this.date
                                    }}]
                                }},
                                {br:{}},
                                !admin ? {span:this.description} : 
                                {span:{ 
                                    $class: "ss_sprite  ss_comment_add",
                                    $:[      'edit news description | ',
                                    {br:{}},
                                    {textarea:{
                                        $class: 'description',
                                        $name:  'description',
                                        $style: 'border-bottom:1px dotted #567',
                                        $:      this.description
                                    }}]
                                }}]
                            }},
                            !admin ? '' :
                            {input:{
                                $id:    'submit/news/'+this.$id,
                                $type:  'submit', 
                                $value: 'save', 
                                $class: 'submit'
                            }},
                            !admin ? '' :{hr:{}}]
                    }}]
                }};
            }).e4x()}
            
        </div>
    </block> 
</e4x> 
