<e4x>
	{extend("html/base.js")}
    <block id='main'>
        <div class="span-17 column first">
            <div id='welcome'>
                <h3>welcome</h3>
                <div class='span-3 column first colborder'>
                    <img src={$.env('root')+'images/goldrecord.png'} 
                         alt='records of existence'
                         height='50px'
                         style='float:right;'/>
                </div>
                <div class='span-12 column last'>
                    <p>
                         Records of Existence is an artist run label of 
                         underground independent artists.  We specialize 
                         in doing limited edition Hand-Printed and 
                         Hand-Assembled releases to make the release 
                         as unique as the artists.  
                    </p>
                </div>
            </div>
            <div id='recentnews' >
                <h3>recent <a href={$.env('root')+'news'}>news</a></h3>
                <ul class='roe_recent_news'>
                    {_('.*', news).map(function(){
                        return {li:{$:[{
                                h4:{$:[
                                    this.title,
                                    {br:{}},
                                    {em:this.date}
                                ]},
                                p:this.description
                            }]
                        }};
                    }).e4x()} 
                </ul>
                <a href={$.env('root')+'news'}>news archives</a>
            </div>
        </div>
        <div class="span-6 column last">
            <div id='newreleases'>
                <h3>new <a href={$.env('root')+'releases'}>releases</a></h3>
                <ul>
                
                    {_('.*', recent).map(function(){
                        return {li:{ $:[
                            {a:{
                                $href:$.env('root')+'release/'+this.$id,
                                img:{ 
                                    $src:$.env('data')+this.image,
                                    $alt:this.name,
                                    $height:'70px'
                                }
                            }},
                            {p:this.description.substring(0,128)+'...'},
                            {br:{}}
                        ]}};
                    }).e4x()}

                 </ul>
            </div>
            <div id='upcomingevents'>
                <h3>upcoming events</h3>
                <p><em>click on an event for more information</em></p>
                <ul>
                    {_('.*', events).map(function(){
                        return {li:{ $:[
                            {h6:this.date},
                            {a:{
                                $href:$.env('root')+'events',
                                img:{ 
                                    $src:$.env('data')+this.image,
                                    $alt:this.title + '  '+this.location,
                                    $title:this.title+'  '+this.location,
                                    $height:'60px'
                                }
                            }}
                        ]}};
                    }).e4x()}
                 </ul>
            </div>
        </div>
    </block>
</e4x>
