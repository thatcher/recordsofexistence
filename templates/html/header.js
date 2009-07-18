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
        </ul>
	</div>
	
</block>