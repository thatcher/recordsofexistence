<block id='global-header'>
	<!--
    /**
     * @author thatcher
     */
    -->
    
	<div class="column span-7 first">
        <a href={$.env('root')}>
		    <img 	src={$.env('root')+"images/logo.png"} 
				    alt="Records of Existence " 
                    height='80px'/>
        </a> 
	</div> 
	<div class="column span-15 prepend-top last" id='global-nav' >
		<ul >
            <li><a href={$.env('root')}>home</a></li> | 
            <li><a href={$.env('root')+'releases'}>releases</a></li> | 
            <li><a href={$.env('root')+'artists'}>artists</a></li> | 
            <li><a href={$.env('root')+'contact'}>contact</a></li> | 
            <li>
                <span id="sharethisbutton">
                    <script type="text/javascript" 
                            src="http://w.sharethis.com/widget/?tabs=web%2Cpost%2Cemail&amp;charset=utf-8&amp;style=default&amp;publisher=b0f530fc-b206-4fb8-b8a8-478191e675c2&amp;headerbg=%23c20000&amp;linkfg=%23c20000">
                            <!-- -->
                    </script>
                </span>
            </li>
        </ul>
	</div>
	
</block>