<e4x>
	{extend("html/base.js")}
    <block id='main'>
            <div id='releases'>
                <h3>releases</h3>
                <div class='first column span-10 colborder'>
                    <ul>
                    
                        {_('.*', _$.releases).map(function(index){
                            return (index%2===0)?{li:{
                                div:{
                                    $class:'span-7',
                                    $:[
                                        {a:{
                                            $href:$.env('root')+'release/'+this.release,
                                            $style:'float:left;',
                                            img:{
                                                $src:$.env('root')+'data/releases/'+this.id+'/thumb.jpg',
                                                $alt:this.name,
                                                $height:'100px'
                                            }
                                        }},
                                        {strong:this.name},{br:{}},
                                        {span:_.e4x(this.description).
                                            text().toString().substring(0,128)+'...'}
                                    ]
                                }
                            }} : {};
                        }).e4x()}
                        
                    </ul>
                </div>
                <div class='last column span-10'>
                    <ul>
                    
                        {_('.*', _$.releases).map(function(index){
                            return (index%2===1)?{li:{
                                div:{
                                    $class:'span-7',
                                    $:[
                                        {a:{
                                            $href:$.env('root')+'release/'+this.release,
                                            $style:'float:left;',
                                            img:{
                                                $src:$.env('root')+'data/releases/'+this.id+'/thumb.jpg',
                                                $alt:this.name,
                                                $height:'100px'
                                            }
                                        }},
                                        {strong:this.name},{br:{}},
                                        {span:_.e4x(this.description).
                                            text().toString().substring(0,128)+'...'}
                                    ]
                                }
                            }} : {};
                        }).e4x()}

                    </ul>
                </div>
            </div>
    </block> 
</e4x> 
