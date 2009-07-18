<e4x>
	{extend("html/base.js")}
    <block id='main'>
        <div id='release'>
            <h3><a href={$.env('root')+'releases'}>&lt; releases</a></h3>
            <div class='first column span-5 colborder'>
                <h4>{_$.release.name}</h4>
                <h5>
                    <a href={$.env('root')+'artist/'+_$.artist.artist}>
                        {_$.artist.name}
                    </a>
                </h5>
                <em>Release</em><br/>
                <span>roe.{_$.release.release}</span> 
            </div>
             
            <div id='cover' 
                 class='column span-6 colborder'>
                <img src={$.env('root')+'data/releases/'+_$.release.id+'/thumb.jpg'} 
                     alt=''  
                     height='150px'/>
            </div>
            <div id='media' 
                 class='column span-9'>
                <ol class='clear'>
                
                    {_('.*', _$.release.tracks).map(function(index, title){
                        return {li:{
                            a:{
                                $href:$.env('root')+'data/releases/'+_$.release.id+'/web/'+((index>10)?'':'0')+(index+1)+'.m4a',
                                $:[
                                    title,
                                    {img:{ $src:$.env('root')+'images/audio_bullet.gif' }}
                                ]
                            }
                        }};
                    }).e4x()}
                    
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
            <div id='description' class='column span-22'>
                <div class='column span-18 push-3'>
                    {_$.release.description}
                </div>
                {_('.*', _$.release.pressings).map(function(){
                    return {div:{
                        $class:'pressing span-22',
                        $:[{div:{
                            $class:'first column span-13 prepend-2 colborder',
                            $:[_.e4x(this.description)] 
                        }},{div:{
                            $class:'last column small box span-4',
                            $:[
                                {h6:'purchase this pressing'},
                                {p:{
                                    $align:'center',
                                    $:[
                                        {em:this.format},{br:{}},
                                        {span:{$class:'cost', $:'$'+this.price}},
                                        {a:{$href:this.url, $:'[Buy]'}}
                                    ]
                                }}
                            ]
                        }}]
                    }};
                }).e4x()}
                
            </div>
        </div>
    </block> 
</e4x> 
