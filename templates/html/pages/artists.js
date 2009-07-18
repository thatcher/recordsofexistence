<e4x>
	{extend("html/base.js")}
    <block id='main'>
        <div id='artists'>
            <h3>artists</h3>
            <div class='first column span-11 colborder '>
                <ul>
                
                    {_('.*', _$.artists).map(function(index){
                        return (index%2===0)?{li:{
                            a:{
                                $href:$.env('root')+'artist/'+this.artist,
                                $:[
                                    {strong:this.name},
                                    {img:{
                                        $src:$.env('root')+'data/artists/'+this.id+'/thumb.jpg',
                                        $alt:this.name,
                                        $height:'50px'
                                    }}
                                ]
                            }
                        }} : {};
                    }).e4x()}
                    
                </ul>
            </div>
            <div class=' last column  span-10'>
                <ul>
                    
                    {_('.*', _$.artists).map(function(index){
                        return (index%2===1)?{li:{
                            a:{
                                $href:$.env('root')+'artist/'+this.artist,
                                $:[
                                    {img:{
                                        $src:$.env('root')+'data/artists/'+this.id+'/thumb.jpg',
                                        $alt:this.name,
                                        $height:'50px'
                                    }},
                                    {strong:this.name}
                                ]
                            }
                        }} : {};
                    }).e4x()}
                    
                </ul>
            </div>
        </div>
    </block> 
</e4x> 
