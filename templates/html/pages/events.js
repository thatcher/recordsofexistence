<e4x>
	{extend("html/base.js")}
    <block id='main'>
            <div id='events' >
                <h3>events</h3>
                    <div style='width:auto;overflow-x:auto;'>
                    <hr/>
                    
                        {_('.*', _$.events).map(function(index){
                            return [{
                                div:{
                                    $class:'event column span-4 colborder',
                                    $:[
                                        {span:this.date},
                                        {br:{}},{br:{}},
                                        {a:{
                                            $href:'#',
                                            img:{
                                                $src:$.env('root')+this.image,
                                                $alt:this.title,
                                                $width:'60px'
                                            }
                                        }},
                                        {strong:this.title},
                                        {p: this.location},
                                        {p: { $:[
                                            _.e4x(this.description)
                                        ]}}
                                    ]
                                }
                            }, (index%6==5)?
                                {div:{
                                    $style:'margin-top:8em;clear:both;',
                                    $:[
                                        {h6:'more...'},
                                        {hr:{ }}
                                     ]
                                 }} : 
                                 { }];
                        }).e4x()}
                  </div>      
            </div>
    </block> 
</e4x> 
