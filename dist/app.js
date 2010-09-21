

if (!("console" in window) || !("firebug" in console)) {
(function()
{
    window.console = 
    {
        log: function()
        {
            logFormatted(arguments, "");
        },
        
        debug: function()
        {
            logFormatted(arguments, "debug");
        },
        
        info: function()
        {
            logFormatted(arguments, "info");
        },
        
        warn: function()
        {
            logFormatted(arguments, "warning");
        },
        
        error: function()
        {
            logFormatted(arguments, "error");
        },
        
        assert: function(truth, message)
        {
            if (!truth)
            {
                var args = [];
                for (var i = 1; i < arguments.length; ++i)
                    args.push(arguments[i]);
                
                logFormatted(args.length ? args : ["Assertion Failure"], "error");
                throw message ? message : "Assertion Failure";
            }
        },
        
        dir: function(object)
        {
            var html = [];
                        
            var pairs = [];
            for (var name in object)
            {
                try
                {
                    pairs.push([name, object[name]]);
                }
                catch (exc)
                {
                }
            }
            
            pairs.sort(function(a, b) { return a[0] < b[0] ? -1 : 1; });
            
            html.push('<table>');
            for (var i = 0; i < pairs.length; ++i)
            {
                var name = pairs[i][0], value = pairs[i][1];
                
                html.push('<tr>', 
                '<td class="propertyNameCell"><span class="propertyName">',
                    escapeHTML(name), '</span></td>', '<td><span class="propertyValue">');
                appendObject(value, html);
                html.push('</span></td></tr>');
            }
            html.push('</table>');
            
            logRow(html, "dir");
        },
        
        dirxml: function(node)
        {
            var html = [];
            
            appendNode(node, html);
            logRow(html, "dirxml");
        },
        
        group: function()
        {
            logRow(arguments, "group", pushGroup);
        },
        
        groupEnd: function()
        {
            logRow(arguments, "", popGroup);
        },
        
        time: function(name)
        {
            timeMap[name] = (new Date()).getTime();
        },
        
        timeEnd: function(name)
        {
            if (name in timeMap)
            {
                var delta = (new Date()).getTime() - timeMap[name];
                logFormatted([name+ ":", delta+"ms"]);
                delete timeMap[name];
            }
        },
        
        count: function()
        {
            this.warn(["count() not supported."]);
        },
        
        trace: function()
        {
            this.warn(["trace() not supported."]);
        },
        
        profile: function()
        {
            this.warn(["profile() not supported."]);
        },
        
        profileEnd: function()
        {
        },
        
        clear: function()
        {
            consoleBody.innerHTML = "";
        },

        open: function()
        {
            toggleConsole(true);
        },
        
        close: function()
        {
            if (frameVisible)
                toggleConsole();
        }
    };
 
    // ********************************************************************************************
       
    var consoleFrame = null;
    var consoleBody = null;
    var commandLine = null;
    
    var frameVisible = false;
    var messageQueue = [];
    var groupStack = [];
    var timeMap = {};
    
    var clPrefix = ">>> ";
    
    var isFirefox = navigator.userAgent.indexOf("Firefox") != -1;
    var isIE = navigator.userAgent.indexOf("MSIE") != -1;
    var isOpera = navigator.userAgent.indexOf("Opera") != -1;
    var isSafari = navigator.userAgent.indexOf("AppleWebKit") != -1;

    // ********************************************************************************************

    function toggleConsole(forceOpen)
    {
        frameVisible = forceOpen || !frameVisible;
        if (consoleFrame)
            consoleFrame.style.visibility = frameVisible ? "visible" : "hidden";
        else
            waitForBody();
    }

    function focusCommandLine()
    {
        toggleConsole(true);
        if (commandLine)
            commandLine.focus();
    }

    function waitForBody()
    {
        if (document.body)
            createFrame();
        else
            setTimeout(waitForBody, 200);
    }    

    function createFrame()
    {
        if (consoleFrame)
            return;
        
        window.onFirebugReady = function(doc)
        {
            window.onFirebugReady = null;

            var toolbar = doc.getElementById("toolbar");
            toolbar.onmousedown = onSplitterMouseDown;

            commandLine = doc.getElementById("commandLine");
            addEvent(commandLine, "keydown", onCommandLineKeyDown);

            addEvent(doc, isIE || isSafari ? "keydown" : "keypress", onKeyDown);
            
            consoleBody = doc.getElementById("log");
            layout();
            flush();
        }

        var baseURL = getFirebugURL();

        consoleFrame = document.createElement("iframe");
        consoleFrame.setAttribute("src", baseURL+"/firebug.html");
        consoleFrame.setAttribute("frameBorder", "0");
        consoleFrame.style.visibility = (frameVisible ? "visible" : "hidden");    
        consoleFrame.style.zIndex = "2147483647";
        consoleFrame.style.position = "fixed";
        consoleFrame.style.width = "100%";
        consoleFrame.style.left = "0";
        consoleFrame.style.bottom = "0";
        consoleFrame.style.height = "200px";
        document.body.appendChild(consoleFrame);
    }
    
    function getFirebugURL()
    {
        var scripts = document.getElementsByTagName("script");
        for (var i = 0; i < scripts.length; ++i)
        {
            if (scripts[i].src.indexOf("firebug.js") != -1)
            {
                var lastSlash = scripts[i].src.lastIndexOf("/");
                return scripts[i].src.substr(0, lastSlash);
            }
        }
    }
    
    function evalCommandLine()
    {
        var text = commandLine.value;
        commandLine.value = "";

        logRow([clPrefix, text], "command");
        
        var value;
        try
        {
            value = eval(text);
        }
        catch (exc)
        {
        }

        console.log(value);
    }
    
    function layout()
    {
        var toolbar = consoleBody.ownerDocument.getElementById("toolbar");
        var height = consoleFrame.offsetHeight - (toolbar.offsetHeight + commandLine.offsetHeight);
        consoleBody.style.top = toolbar.offsetHeight + "px";
        consoleBody.style.height = height + "px";
        
        commandLine.style.top = (consoleFrame.offsetHeight - commandLine.offsetHeight) + "px";
    }
    
    function logRow(message, className, handler)
    {
        if (consoleBody)
            writeMessage(message, className, handler);
        else
        {
            messageQueue.push([message, className, handler]);
            waitForBody();
        }
    }
    
    function flush()
    {
        var queue = messageQueue;
        messageQueue = [];
        
        for (var i = 0; i < queue.length; ++i)
            writeMessage(queue[i][0], queue[i][1], queue[i][2]);
    }

    function writeMessage(message, className, handler)
    {
        var isScrolledToBottom =
            consoleBody.scrollTop + consoleBody.offsetHeight >= consoleBody.scrollHeight;

        if (!handler)
            handler = writeRow;
        
        handler(message, className);
        
        if (isScrolledToBottom)
            consoleBody.scrollTop = consoleBody.scrollHeight - consoleBody.offsetHeight;
    }
    
    function appendRow(row)
    {
        var container = groupStack.length ? groupStack[groupStack.length-1] : consoleBody;
        container.appendChild(row);
    }

    function writeRow(message, className)
    {
        var row = consoleBody.ownerDocument.createElement("div");
        row.className = "logRow" + (className ? " logRow-"+className : "");
        row.innerHTML = message.join("");
        appendRow(row);
    }

    function pushGroup(message, className)
    {
        logFormatted(message, className);

        var groupRow = consoleBody.ownerDocument.createElement("div");
        groupRow.className = "logGroup";
        var groupRowBox = consoleBody.ownerDocument.createElement("div");
        groupRowBox.className = "logGroupBox";
        groupRow.appendChild(groupRowBox);
        appendRow(groupRowBox);
        groupStack.push(groupRowBox);
    }

    function popGroup()
    {
        groupStack.pop();
    }
    
    // ********************************************************************************************

    function logFormatted(objects, className)
    {
        var html = [];

        var format = objects[0];
        var objIndex = 0;

        if (typeof(format) != "string")
        {
            format = "";
            objIndex = -1;
        }

        var parts = parseFormat(format);
        for (var i = 0; i < parts.length; ++i)
        {
            var part = parts[i];
            if (part && typeof(part) == "object")
            {
                var object = objects[++objIndex];
                part.appender(object, html);
            }
            else
                appendText(part, html);
        }

        for (var i = objIndex+1; i < objects.length; ++i)
        {
            appendText(" ", html);
            
            var object = objects[i];
            if (typeof(object) == "string")
                appendText(object, html);
            else
                appendObject(object, html);
        }
        
        logRow(html, className);
    }

    function parseFormat(format)
    {
        var parts = [];

        var reg = /((^%|[^\\]%)(\d+)?(\.)([a-zA-Z]))|((^%|[^\\]%)([a-zA-Z]))/;    
        var appenderMap = {s: appendText, d: appendInteger, i: appendInteger, f: appendFloat};

        for (var m = reg.exec(format); m; m = reg.exec(format))
        {
            var type = m[8] ? m[8] : m[5];
            var appender = type in appenderMap ? appenderMap[type] : appendObject;
            var precision = m[3] ? parseInt(m[3]) : (m[4] == "." ? -1 : 0);

            parts.push(format.substr(0, m[0][0] == "%" ? m.index : m.index+1));
            parts.push({appender: appender, precision: precision});

            format = format.substr(m.index+m[0].length);
        }

        parts.push(format);

        return parts;
    }

    function escapeHTML(value)
    {
        function replaceChars(ch)
        {
            switch (ch)
            {
                case "<":
                    return "&lt;";
                case ">":
                    return "&gt;";
                case "&":
                    return "&amp;";
                case "'":
                    return "&#39;";
                case '"':
                    return "&quot;";
            }
            return "?";
        };
        return String(value).replace(/[<>&"']/g, replaceChars);
    }

    function objectToString(object)
    {
        try
        {
            return object+"";
        }
        catch (exc)
        {
            return null;
        }
    }

    // ********************************************************************************************

    function appendText(object, html)
    {
        html.push(escapeHTML(objectToString(object)));
    }

    function appendNull(object, html)
    {
        html.push('<span class="objectBox-null">', escapeHTML(objectToString(object)), '</span>');
    }

    function appendString(object, html)
    {
        html.push('<span class="objectBox-string">&quot;', escapeHTML(objectToString(object)),
            '&quot;</span>');
    }

    function appendInteger(object, html)
    {
        html.push('<span class="objectBox-number">', escapeHTML(objectToString(object)), '</span>');
    }

    function appendFloat(object, html)
    {
        html.push('<span class="objectBox-number">', escapeHTML(objectToString(object)), '</span>');
    }

    function appendFunction(object, html)
    {
        var reName = /function ?(.*?)\(/;
        var m = reName.exec(objectToString(object));
        var name = m ? m[1] : "function";
        html.push('<span class="objectBox-function">', escapeHTML(name), '()</span>');
    }
    
    function appendObject(object, html)
    {
        try
        {
            if (object == undefined)
                appendNull("undefined", html);
            else if (object == null)
                appendNull("null", html);
            else if (typeof object == "string")
                appendString(object, html);
            else if (typeof object == "number")
                appendInteger(object, html);
            else if (typeof object == "function")
                appendFunction(object, html);
            else if (object.nodeType == 1)
                appendSelector(object, html);
            else if (typeof object == "object")
                appendObjectFormatted(object, html);
            else
                appendText(object, html);
        }
        catch (exc)
        {
        }
    }
        
    function appendObjectFormatted(object, html)
    {
        var text = objectToString(object);
        var reObject = /\[object (.*?)\]/;

        var m = reObject.exec(text);
        html.push('<span class="objectBox-object">', m ? m[1] : text, '</span>')
    }
    
    function appendSelector(object, html)
    {
        html.push('<span class="objectBox-selector">');

        html.push('<span class="selectorTag">', escapeHTML(object.nodeName.toLowerCase()), '</span>');
        if (object.id)
            html.push('<span class="selectorId">#', escapeHTML(object.id), '</span>');
        if (object.className)
            html.push('<span class="selectorClass">.', escapeHTML(object.className), '</span>');

        html.push('</span>');
    }

    function appendNode(node, html)
    {
        if (node.nodeType == 1)
        {
            html.push(
                '<div class="objectBox-element">',
                    '&lt;<span class="nodeTag">', node.nodeName.toLowerCase(), '</span>');

            for (var i = 0; i < node.attributes.length; ++i)
            {
                var attr = node.attributes[i];
                if (!attr.specified)
                    continue;
                
                html.push('&nbsp;<span class="nodeName">', attr.nodeName.toLowerCase(),
                    '</span>=&quot;<span class="nodeValue">', escapeHTML(attr.nodeValue),
                    '</span>&quot;')
            }

            if (node.firstChild)
            {
                html.push('&gt;</div><div class="nodeChildren">');

                for (var child = node.firstChild; child; child = child.nextSibling)
                    appendNode(child, html);
                    
                html.push('</div><div class="objectBox-element">&lt;/<span class="nodeTag">', 
                    node.nodeName.toLowerCase(), '&gt;</span></div>');
            }
            else
                html.push('/&gt;</div>');
        }
        else if (node.nodeType == 3)
        {
            html.push('<div class="nodeText">', escapeHTML(node.nodeValue),
                '</div>');
        }
    }

    // ********************************************************************************************
    
    function addEvent(object, name, handler)
    {
        if (document.all)
            object.attachEvent("on"+name, handler);
        else
            object.addEventListener(name, handler, false);
    }
    
    function removeEvent(object, name, handler)
    {
        if (document.all)
            object.detachEvent("on"+name, handler);
        else
            object.removeEventListener(name, handler, false);
    }
    
    function cancelEvent(event)
    {
        if (document.all)
            event.cancelBubble = true;
        else
            event.stopPropagation();        
    }

    function onError(msg, href, lineNo)
    {
        var html = [];
        
        var lastSlash = href.lastIndexOf("/");
        var fileName = lastSlash == -1 ? href : href.substr(lastSlash+1);
        
        html.push(
            '<span class="errorMessage">', msg, '</span>', 
            '<div class="objectBox-sourceLink">', fileName, ' (line ', lineNo, ')</div>'
        );
        
        logRow(html, "error");
    };

    function onKeyDown(event)
    {
        if (event.keyCode == 123)
            toggleConsole();
        else if ((event.keyCode == 108 || event.keyCode == 76) && event.shiftKey
                 && (event.metaKey || event.ctrlKey))
            focusCommandLine();
        else
            return;
        
        cancelEvent(event);
    }

    function onSplitterMouseDown(event)
    {
        if (isSafari || isOpera)
            return;
        
        addEvent(document, "mousemove", onSplitterMouseMove);
        addEvent(document, "mouseup", onSplitterMouseUp);

        for (var i = 0; i < frames.length; ++i)
        {
            addEvent(frames[i].document, "mousemove", onSplitterMouseMove);
            addEvent(frames[i].document, "mouseup", onSplitterMouseUp);
        }
    }
    
    function onSplitterMouseMove(event)
    {
        var win = document.all
            ? event.srcElement.ownerDocument.parentWindow
            : event.target.ownerDocument.defaultView;

        var clientY = event.clientY;
        if (win != win.parent)
            clientY += win.frameElement ? win.frameElement.offsetTop : 0;
        
        var height = consoleFrame.offsetTop + consoleFrame.clientHeight;
        var y = height - clientY;
        
        consoleFrame.style.height = y + "px";
        layout();
    }
    
    function onSplitterMouseUp(event)
    {
        removeEvent(document, "mousemove", onSplitterMouseMove);
        removeEvent(document, "mouseup", onSplitterMouseUp);

        for (var i = 0; i < frames.length; ++i)
        {
            removeEvent(frames[i].document, "mousemove", onSplitterMouseMove);
            removeEvent(frames[i].document, "mouseup", onSplitterMouseUp);
        }
    }
    
    function onCommandLineKeyDown(event)
    {
        if (event.keyCode == 13)
            evalCommandLine();
        else if (event.keyCode == 27)
            commandLine.value = "";
    }
    
    window.onerror = onError;
    addEvent(document, isIE || isSafari ? "keydown" : "keypress", onKeyDown);
    
    if (document.documentElement.getAttribute("debug") == "true")
        toggleConsole(true);
})();
}

/*!
 * jQuery JavaScript Library v1.4.2
 * http://jquery.com/
 *
 * Copyright 2010, John Resig
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 * Copyright 2010, The Dojo Foundation
 * Released under the MIT, BSD, and GPL Licenses.
 *
 * Date: Sat Feb 13 22:33:48 2010 -0500
 */
(function( window, undefined ) {

// Define a local copy of jQuery
var jQuery = function( selector, context ) {
		// The jQuery object is actually just the init constructor 'enhanced'
		return new jQuery.fn.init( selector, context );
	},

	// Map over jQuery in case of overwrite
	_jQuery = window.jQuery,

	// Map over the $ in case of overwrite
	_$ = window.$,

	// Use the correct document accordingly with window argument (sandbox)
	document = window.document,

	// A central reference to the root jQuery(document)
	rootjQuery,

	// A simple way to check for HTML strings or ID strings
	// (both of which we optimize for)
	quickExpr = /^[^<]*(<[\w\W]+>)[^>]*$|^#([\w-]+)$/,

	// Is it a simple selector
	isSimple = /^.[^:#\[\.,]*$/,

	// Check if a string has a non-whitespace character in it
	rnotwhite = /\S/,

	// Used for trimming whitespace
	rtrim = /^(\s|\u00A0)+|(\s|\u00A0)+$/g,

	// Match a standalone tag
	rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>)?$/,

	// Keep a UserAgent string for use with jQuery.browser
	userAgent = navigator.userAgent,

	// For matching the engine and version of the browser
	browserMatch,
	
	// Has the ready events already been bound?
	readyBound = false,
	
	// The functions to execute on DOM ready
	readyList = [],

	// The ready event handler
	DOMContentLoaded,

	// Save a reference to some core methods
	toString = Object.prototype.toString,
	hasOwnProperty = Object.prototype.hasOwnProperty,
	push = Array.prototype.push,
	slice = Array.prototype.slice,
	indexOf = Array.prototype.indexOf;

jQuery.fn = jQuery.prototype = {
	init: function( selector, context ) {
		var match, elem, ret, doc;

		// Handle $(""), $(null), or $(undefined)
		if ( !selector ) {
			return this;
		}

		// Handle $(DOMElement)
		if ( selector.nodeType ) {
			this.context = this[0] = selector;
			this.length = 1;
			return this;
		}
		
		// The body element only exists once, optimize finding it
		if ( selector === "body" && !context ) {
			this.context = document;
			this[0] = document.body;
			this.selector = "body";
			this.length = 1;
			return this;
		}

		// Handle HTML strings
		if ( typeof selector === "string" ) {
			// Are we dealing with HTML string or an ID?
			match = quickExpr.exec( selector );

			// Verify a match, and that no context was specified for #id
			if ( match && (match[1] || !context) ) {

				// HANDLE: $(html) -> $(array)
				if ( match[1] ) {
					doc = (context ? context.ownerDocument || context : document);

					// If a single string is passed in and it's a single tag
					// just do a createElement and skip the rest
					ret = rsingleTag.exec( selector );

					if ( ret ) {
						if ( jQuery.isPlainObject( context ) ) {
							selector = [ document.createElement( ret[1] ) ];
							jQuery.fn.attr.call( selector, context, true );

						} else {
							selector = [ doc.createElement( ret[1] ) ];
						}

					} else {
						ret = buildFragment( [ match[1] ], [ doc ] );
						selector = (ret.cacheable ? ret.fragment.cloneNode(true) : ret.fragment).childNodes;
					}
					
					return jQuery.merge( this, selector );
					
				// HANDLE: $("#id")
				} else {
					elem = document.getElementById( match[2] );

					if ( elem ) {
						// Handle the case where IE and Opera return items
						// by name instead of ID
						if ( elem.id !== match[2] ) {
							return rootjQuery.find( selector );
						}

						// Otherwise, we inject the element directly into the jQuery object
						this.length = 1;
						this[0] = elem;
					}

					this.context = document;
					this.selector = selector;
					return this;
				}

			// HANDLE: $("TAG")
			} else if ( !context && /^\w+$/.test( selector ) ) {
				this.selector = selector;
				this.context = document;
				selector = document.getElementsByTagName( selector );
				return jQuery.merge( this, selector );

			// HANDLE: $(expr, $(...))
			} else if ( !context || context.jquery ) {
				return (context || rootjQuery).find( selector );

			// HANDLE: $(expr, context)
			// (which is just equivalent to: $(context).find(expr)
			} else {
				return jQuery( context ).find( selector );
			}

		// HANDLE: $(function)
		// Shortcut for document ready
		} else if ( jQuery.isFunction( selector ) ) {
			return rootjQuery.ready( selector );
		}

		if (selector.selector !== undefined) {
			this.selector = selector.selector;
			this.context = selector.context;
		}

		return jQuery.makeArray( selector, this );
	},

	// Start with an empty selector
	selector: "",

	// The current version of jQuery being used
	jquery: "1.4.2",

	// The default length of a jQuery object is 0
	length: 0,

	// The number of elements contained in the matched element set
	size: function() {
		return this.length;
	},

	toArray: function() {
		return slice.call( this, 0 );
	},

	// Get the Nth element in the matched element set OR
	// Get the whole matched element set as a clean array
	get: function( num ) {
		return num == null ?

			// Return a 'clean' array
			this.toArray() :

			// Return just the object
			( num < 0 ? this.slice(num)[ 0 ] : this[ num ] );
	},

	// Take an array of elements and push it onto the stack
	// (returning the new matched element set)
	pushStack: function( elems, name, selector ) {
		// Build a new jQuery matched element set
		var ret = jQuery();

		if ( jQuery.isArray( elems ) ) {
			push.apply( ret, elems );
		
		} else {
			jQuery.merge( ret, elems );
		}

		// Add the old object onto the stack (as a reference)
		ret.prevObject = this;

		ret.context = this.context;

		if ( name === "find" ) {
			ret.selector = this.selector + (this.selector ? " " : "") + selector;
		} else if ( name ) {
			ret.selector = this.selector + "." + name + "(" + selector + ")";
		}

		// Return the newly-formed element set
		return ret;
	},

	// Execute a callback for every element in the matched set.
	// (You can seed the arguments with an array of args, but this is
	// only used internally.)
	each: function( callback, args ) {
		return jQuery.each( this, callback, args );
	},
	
	ready: function( fn ) {
		// Attach the listeners
		jQuery.bindReady();

		// If the DOM is already ready
		if ( jQuery.isReady ) {
			// Execute the function immediately
			fn.call( document, jQuery );

		// Otherwise, remember the function for later
		} else if ( readyList ) {
			// Add the function to the wait list
			readyList.push( fn );
		}

		return this;
	},
	
	eq: function( i ) {
		return i === -1 ?
			this.slice( i ) :
			this.slice( i, +i + 1 );
	},

	first: function() {
		return this.eq( 0 );
	},

	last: function() {
		return this.eq( -1 );
	},

	slice: function() {
		return this.pushStack( slice.apply( this, arguments ),
			"slice", slice.call(arguments).join(",") );
	},

	map: function( callback ) {
		return this.pushStack( jQuery.map(this, function( elem, i ) {
			return callback.call( elem, i, elem );
		}));
	},
	
	end: function() {
		return this.prevObject || jQuery(null);
	},

	// For internal use only.
	// Behaves like an Array's method, not like a jQuery method.
	push: push,
	sort: [].sort,
	splice: [].splice
};

// Give the init function the jQuery prototype for later instantiation
jQuery.fn.init.prototype = jQuery.fn;

jQuery.extend = jQuery.fn.extend = function() {
	// copy reference to target object
	var target = arguments[0] || {}, i = 1, length = arguments.length, deep = false, options, name, src, copy;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
		target = {};
	}

	// extend jQuery itself if only one argument is passed
	if ( length === i ) {
		target = this;
		--i;
	}

	for ( ; i < length; i++ ) {
		// Only deal with non-null/undefined values
		if ( (options = arguments[ i ]) != null ) {
			// Extend the base object
			for ( name in options ) {
				src = target[ name ];
				copy = options[ name ];

				// Prevent never-ending loop
				if ( target === copy ) {
					continue;
				}

				// Recurse if we're merging object literal values or arrays
				if ( deep && copy && ( jQuery.isPlainObject(copy) || jQuery.isArray(copy) ) ) {
					var clone = src && ( jQuery.isPlainObject(src) || jQuery.isArray(src) ) ? src
						: jQuery.isArray(copy) ? [] : {};

					// Never move original objects, clone them
					target[ name ] = jQuery.extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};

jQuery.extend({
	noConflict: function( deep ) {
		window.$ = _$;

		if ( deep ) {
			window.jQuery = _jQuery;
		}

		return jQuery;
	},
	
	// Is the DOM ready to be used? Set to true once it occurs.
	isReady: false,
	
	// Handle when the DOM is ready
	ready: function() {
		// Make sure that the DOM is not already loaded
		if ( !jQuery.isReady ) {
			// Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
			if ( !document.body ) {
				return setTimeout( jQuery.ready, 13 );
			}

			// Remember that the DOM is ready
			jQuery.isReady = true;

			// If there are functions bound, to execute
			if ( readyList ) {
				// Execute all of them
				var fn, i = 0;
				while ( (fn = readyList[ i++ ]) ) {
					fn.call( document, jQuery );
				}

				// Reset the list of functions
				readyList = null;
			}

			// Trigger any bound ready events
			if ( jQuery.fn.triggerHandler ) {
				jQuery( document ).triggerHandler( "ready" );
			}
		}
	},
	
	bindReady: function() {
		if ( readyBound ) {
			return;
		}

		readyBound = true;

		// Catch cases where $(document).ready() is called after the
		// browser event has already occurred.
		if ( document.readyState === "complete" ) {
			return jQuery.ready();
		}

		// Mozilla, Opera and webkit nightlies currently support this event
		if ( document.addEventListener ) {
			// Use the handy event callback
			document.addEventListener( "DOMContentLoaded", DOMContentLoaded, false );
			
			// A fallback to window.onload, that will always work
			window.addEventListener( "load", jQuery.ready, false );

		// If IE event model is used
		} else if ( document.attachEvent ) {
			// ensure firing before onload,
			// maybe late but safe also for iframes
			document.attachEvent("onreadystatechange", DOMContentLoaded);
			
			// A fallback to window.onload, that will always work
			window.attachEvent( "onload", jQuery.ready );

			// If IE and not a frame
			// continually check to see if the document is ready
			var toplevel = false;

			try {
				toplevel = window.frameElement == null;
			} catch(e) {}

			if ( document.documentElement.doScroll && toplevel ) {
				doScrollCheck();
			}
		}
	},

	// See test/unit/core.js for details concerning isFunction.
	// Since version 1.3, DOM methods and functions like alert
	// aren't supported. They return false on IE (#2968).
	isFunction: function( obj ) {
		return toString.call(obj) === "[object Function]";
	},

	isArray: function( obj ) {
		return toString.call(obj) === "[object Array]";
	},

	isPlainObject: function( obj ) {
		// Must be an Object.
		// Because of IE, we also have to check the presence of the constructor property.
		// Make sure that DOM nodes and window objects don't pass through, as well
		if ( !obj || toString.call(obj) !== "[object Object]" || obj.nodeType || obj.setInterval ) {
			return false;
		}
		
		// Not own constructor property must be Object
		if ( obj.constructor
			&& !hasOwnProperty.call(obj, "constructor")
			&& !hasOwnProperty.call(obj.constructor.prototype, "isPrototypeOf") ) {
			return false;
		}
		
		// Own properties are enumerated firstly, so to speed up,
		// if last one is own, then all properties are own.
	
		var key;
		for ( key in obj ) {}
		
		return key === undefined || hasOwnProperty.call( obj, key );
	},

	isEmptyObject: function( obj ) {
		for ( var name in obj ) {
			return false;
		}
		return true;
	},
	
	error: function( msg ) {
		throw msg;
	},
	
	parseJSON: function( data ) {
		if ( typeof data !== "string" || !data ) {
			return null;
		}

		// Make sure leading/trailing whitespace is removed (IE can't handle it)
		data = jQuery.trim( data );
		
		// Make sure the incoming data is actual JSON
		// Logic borrowed from http://json.org/json2.js
		if ( /^[\],:{}\s]*$/.test(data.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@")
			.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]")
			.replace(/(?:^|:|,)(?:\s*\[)+/g, "")) ) {

			// Try to use the native JSON parser first
			return window.JSON && window.JSON.parse ?
				window.JSON.parse( data ) :
				(new Function("return " + data))();

		} else {
			jQuery.error( "Invalid JSON: " + data );
		}
	},

	noop: function() {},

	// Evalulates a script in a global context
	globalEval: function( data ) {
		if ( data && rnotwhite.test(data) ) {
			// Inspired by code by Andrea Giammarchi
			// http://webreflection.blogspot.com/2007/08/global-scope-evaluation-and-dom.html
			var head = document.getElementsByTagName("head")[0] || document.documentElement,
				script = document.createElement("script");

			script.type = "text/javascript";

			if ( jQuery.support.scriptEval ) {
				script.appendChild( document.createTextNode( data ) );
			} else {
				script.text = data;
			}

			// Use insertBefore instead of appendChild to circumvent an IE6 bug.
			// This arises when a base node is used (#2709).
			head.insertBefore( script, head.firstChild );
			head.removeChild( script );
		}
	},

	nodeName: function( elem, name ) {
		return elem.nodeName && elem.nodeName.toUpperCase() === name.toUpperCase();
	},

	// args is for internal usage only
	each: function( object, callback, args ) {
		var name, i = 0,
			length = object.length,
			isObj = length === undefined || jQuery.isFunction(object);

		if ( args ) {
			if ( isObj ) {
				for ( name in object ) {
					if ( callback.apply( object[ name ], args ) === false ) {
						break;
					}
				}
			} else {
				for ( ; i < length; ) {
					if ( callback.apply( object[ i++ ], args ) === false ) {
						break;
					}
				}
			}

		// A special, fast, case for the most common use of each
		} else {
			if ( isObj ) {
				for ( name in object ) {
					if ( callback.call( object[ name ], name, object[ name ] ) === false ) {
						break;
					}
				}
			} else {
				for ( var value = object[0];
					i < length && callback.call( value, i, value ) !== false; value = object[++i] ) {}
			}
		}

		return object;
	},

	trim: function( text ) {
		return (text || "").replace( rtrim, "" );
	},

	// results is for internal usage only
	makeArray: function( array, results ) {
		var ret = results || [];

		if ( array != null ) {
			// The window, strings (and functions) also have 'length'
			// The extra typeof function check is to prevent crashes
			// in Safari 2 (See: #3039)
			if ( array.length == null || typeof array === "string" || jQuery.isFunction(array) || (typeof array !== "function" && array.setInterval) ) {
				push.call( ret, array );
			} else {
				jQuery.merge( ret, array );
			}
		}

		return ret;
	},

	inArray: function( elem, array ) {
		if ( array.indexOf ) {
			return array.indexOf( elem );
		}

		for ( var i = 0, length = array.length; i < length; i++ ) {
			if ( array[ i ] === elem ) {
				return i;
			}
		}

		return -1;
	},

	merge: function( first, second ) {
		var i = first.length, j = 0;

		if ( typeof second.length === "number" ) {
			for ( var l = second.length; j < l; j++ ) {
				first[ i++ ] = second[ j ];
			}
		
		} else {
			while ( second[j] !== undefined ) {
				first[ i++ ] = second[ j++ ];
			}
		}

		first.length = i;

		return first;
	},

	grep: function( elems, callback, inv ) {
		var ret = [];

		// Go through the array, only saving the items
		// that pass the validator function
		for ( var i = 0, length = elems.length; i < length; i++ ) {
			if ( !inv !== !callback( elems[ i ], i ) ) {
				ret.push( elems[ i ] );
			}
		}

		return ret;
	},

	// arg is for internal usage only
	map: function( elems, callback, arg ) {
		var ret = [], value;

		// Go through the array, translating each of the items to their
		// new value (or values).
		for ( var i = 0, length = elems.length; i < length; i++ ) {
			value = callback( elems[ i ], i, arg );

			if ( value != null ) {
				ret[ ret.length ] = value;
			}
		}

		return ret.concat.apply( [], ret );
	},

	// A global GUID counter for objects
	guid: 1,

	proxy: function( fn, proxy, thisObject ) {
		if ( arguments.length === 2 ) {
			if ( typeof proxy === "string" ) {
				thisObject = fn;
				fn = thisObject[ proxy ];
				proxy = undefined;

			} else if ( proxy && !jQuery.isFunction( proxy ) ) {
				thisObject = proxy;
				proxy = undefined;
			}
		}

		if ( !proxy && fn ) {
			proxy = function() {
				return fn.apply( thisObject || this, arguments );
			};
		}

		// Set the guid of unique handler to the same of original handler, so it can be removed
		if ( fn ) {
			proxy.guid = fn.guid = fn.guid || proxy.guid || jQuery.guid++;
		}

		// So proxy can be declared as an argument
		return proxy;
	},

	// Use of jQuery.browser is frowned upon.
	// More details: http://docs.jquery.com/Utilities/jQuery.browser
	uaMatch: function( ua ) {
		ua = ua.toLowerCase();

		var match = /(webkit)[ \/]([\w.]+)/.exec( ua ) ||
			/(opera)(?:.*version)?[ \/]([\w.]+)/.exec( ua ) ||
			/(msie) ([\w.]+)/.exec( ua ) ||
			!/compatible/.test( ua ) && /(mozilla)(?:.*? rv:([\w.]+))?/.exec( ua ) ||
		  	[];

		return { browser: match[1] || "", version: match[2] || "0" };
	},

	browser: {}
});

browserMatch = jQuery.uaMatch( userAgent );
if ( browserMatch.browser ) {
	jQuery.browser[ browserMatch.browser ] = true;
	jQuery.browser.version = browserMatch.version;
}

// Deprecated, use jQuery.browser.webkit instead
if ( jQuery.browser.webkit ) {
	jQuery.browser.safari = true;
}

if ( indexOf ) {
	jQuery.inArray = function( elem, array ) {
		return indexOf.call( array, elem );
	};
}

// All jQuery objects should point back to these
rootjQuery = jQuery(document);

// Cleanup functions for the document ready method
if ( document.addEventListener ) {
	DOMContentLoaded = function() {
		document.removeEventListener( "DOMContentLoaded", DOMContentLoaded, false );
		jQuery.ready();
	};

} else if ( document.attachEvent ) {
	DOMContentLoaded = function() {
		// Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
		if ( document.readyState === "complete" ) {
			document.detachEvent( "onreadystatechange", DOMContentLoaded );
			jQuery.ready();
		}
	};
}

// The DOM ready check for Internet Explorer
function doScrollCheck() {
	if ( jQuery.isReady ) {
		return;
	}

	try {
		// If IE is used, use the trick by Diego Perini
		// http://javascript.nwbox.com/IEContentLoaded/
		document.documentElement.doScroll("left");
	} catch( error ) {
		setTimeout( doScrollCheck, 1 );
		return;
	}

	// and execute any waiting functions
	jQuery.ready();
}

function evalScript( i, elem ) {
	if ( elem.src ) {
		jQuery.ajax({
			url: elem.src,
			async: false,
			dataType: "script"
		});
	} else {
		jQuery.globalEval( elem.text || elem.textContent || elem.innerHTML || "" );
	}

	if ( elem.parentNode ) {
		elem.parentNode.removeChild( elem );
	}
}

// Mutifunctional method to get and set values to a collection
// The value/s can be optionally by executed if its a function
function access( elems, key, value, exec, fn, pass ) {
	var length = elems.length;
	
	// Setting many attributes
	if ( typeof key === "object" ) {
		for ( var k in key ) {
			access( elems, k, key[k], exec, fn, value );
		}
		return elems;
	}
	
	// Setting one attribute
	if ( value !== undefined ) {
		// Optionally, function values get executed if exec is true
		exec = !pass && exec && jQuery.isFunction(value);
		
		for ( var i = 0; i < length; i++ ) {
			fn( elems[i], key, exec ? value.call( elems[i], i, fn( elems[i], key ) ) : value, pass );
		}
		
		return elems;
	}
	
	// Getting an attribute
	return length ? fn( elems[0], key ) : undefined;
}

function now() {
	return (new Date).getTime();
}
(function() {

	jQuery.support = {};

	var root = document.documentElement,
		script = document.createElement("script"),
		div = document.createElement("div"),
		id = "script" + now();

	div.style.display = "none";
	div.innerHTML = "   <link/><table></table><a href='/a' style='color:red;float:left;opacity:.55;'>a</a><input type='checkbox'/>";

	var all = div.getElementsByTagName("*"),
		a = div.getElementsByTagName("a")[0];

	// Can't get basic test support
	if ( !all || !all.length || !a ) {
		return;
	}

	jQuery.support = {
		// IE strips leading whitespace when .innerHTML is used
		leadingWhitespace: div.firstChild.nodeType === 3,

		// Make sure that tbody elements aren't automatically inserted
		// IE will insert them into empty tables
		tbody: !div.getElementsByTagName("tbody").length,

		// Make sure that link elements get serialized correctly by innerHTML
		// This requires a wrapper element in IE
		htmlSerialize: !!div.getElementsByTagName("link").length,

		// Get the style information from getAttribute
		// (IE uses .cssText insted)
		style: /red/.test( a.getAttribute("style") ),

		// Make sure that URLs aren't manipulated
		// (IE normalizes it by default)
		hrefNormalized: a.getAttribute("href") === "/a",

		// Make sure that element opacity exists
		// (IE uses filter instead)
		// Use a regex to work around a WebKit issue. See #5145
		opacity: /^0.55$/.test( a.style.opacity ),

		// Verify style float existence
		// (IE uses styleFloat instead of cssFloat)
		cssFloat: !!a.style.cssFloat,

		// Make sure that if no value is specified for a checkbox
		// that it defaults to "on".
		// (WebKit defaults to "" instead)
		checkOn: div.getElementsByTagName("input")[0].value === "on",

		// Make sure that a selected-by-default option has a working selected property.
		// (WebKit defaults to false instead of true, IE too, if it's in an optgroup)
		optSelected: document.createElement("select").appendChild( document.createElement("option") ).selected,

		parentNode: div.removeChild( div.appendChild( document.createElement("div") ) ).parentNode === null,

		// Will be defined later
		deleteExpando: true,
		checkClone: false,
		scriptEval: false,
		noCloneEvent: true,
		boxModel: null
	};

	script.type = "text/javascript";
	try {
		script.appendChild( document.createTextNode( "window." + id + "=1;" ) );
	} catch(e) {}

	root.insertBefore( script, root.firstChild );

	// Make sure that the execution of code works by injecting a script
	// tag with appendChild/createTextNode
	// (IE doesn't support this, fails, and uses .text instead)
	if ( window[ id ] ) {
		jQuery.support.scriptEval = true;
		delete window[ id ];
	}

	// Test to see if it's possible to delete an expando from an element
	// Fails in Internet Explorer
	try {
		delete script.test;
	
	} catch(e) {
		jQuery.support.deleteExpando = false;
	}

	root.removeChild( script );

	if ( div.attachEvent && div.fireEvent ) {
		div.attachEvent("onclick", function click() {
			// Cloning a node shouldn't copy over any
			// bound event handlers (IE does this)
			jQuery.support.noCloneEvent = false;
			div.detachEvent("onclick", click);
		});
		div.cloneNode(true).fireEvent("onclick");
	}

	div = document.createElement("div");
	div.innerHTML = "<input type='radio' name='radiotest' checked='checked'/>";

	var fragment = document.createDocumentFragment();
	fragment.appendChild( div.firstChild );

	// WebKit doesn't clone checked state correctly in fragments
	jQuery.support.checkClone = fragment.cloneNode(true).cloneNode(true).lastChild.checked;

	// Figure out if the W3C box model works as expected
	// document.body must exist before we can do this
	jQuery(function() {
		var div = document.createElement("div");
		div.style.width = div.style.paddingLeft = "1px";

		document.body.appendChild( div );
		jQuery.boxModel = jQuery.support.boxModel = div.offsetWidth === 2;
		document.body.removeChild( div ).style.display = 'none';

		div = null;
	});

	// Technique from Juriy Zaytsev
	// http://thinkweb2.com/projects/prototype/detecting-event-support-without-browser-sniffing/
	var eventSupported = function( eventName ) { 
		var el = document.createElement("div"); 
		eventName = "on" + eventName; 

		var isSupported = (eventName in el); 
		if ( !isSupported ) { 
			el.setAttribute(eventName, "return;"); 
			isSupported = typeof el[eventName] === "function"; 
		} 
		el = null; 

		return isSupported; 
	};
	
	jQuery.support.submitBubbles = eventSupported("submit");
	jQuery.support.changeBubbles = eventSupported("change");

	// release memory in IE
	root = script = div = all = a = null;
})();

jQuery.props = {
	"for": "htmlFor",
	"class": "className",
	readonly: "readOnly",
	maxlength: "maxLength",
	cellspacing: "cellSpacing",
	rowspan: "rowSpan",
	colspan: "colSpan",
	tabindex: "tabIndex",
	usemap: "useMap",
	frameborder: "frameBorder"
};
var expando = "jQuery" + now(), uuid = 0, windowData = {};

jQuery.extend({
	cache: {},
	
	expando:expando,

	// The following elements throw uncatchable exceptions if you
	// attempt to add expando properties to them.
	noData: {
		"embed": true,
		"object": true,
		"applet": true
	},

	data: function( elem, name, data ) {
		if ( elem.nodeName && jQuery.noData[elem.nodeName.toLowerCase()] ) {
			return;
		}

		elem = elem == window ?
			windowData :
			elem;

		var id = elem[ expando ], cache = jQuery.cache, thisCache;

		if ( !id && typeof name === "string" && data === undefined ) {
			return null;
		}

		// Compute a unique ID for the element
		if ( !id ) { 
			id = ++uuid;
		}

		// Avoid generating a new cache unless none exists and we
		// want to manipulate it.
		if ( typeof name === "object" ) {
			elem[ expando ] = id;
			thisCache = cache[ id ] = jQuery.extend(true, {}, name);

		} else if ( !cache[ id ] ) {
			elem[ expando ] = id;
			cache[ id ] = {};
		}

		thisCache = cache[ id ];

		// Prevent overriding the named cache with undefined values
		if ( data !== undefined ) {
			thisCache[ name ] = data;
		}

		return typeof name === "string" ? thisCache[ name ] : thisCache;
	},

	removeData: function( elem, name ) {
		if ( elem.nodeName && jQuery.noData[elem.nodeName.toLowerCase()] ) {
			return;
		}

		elem = elem == window ?
			windowData :
			elem;

		var id = elem[ expando ], cache = jQuery.cache, thisCache = cache[ id ];

		// If we want to remove a specific section of the element's data
		if ( name ) {
			if ( thisCache ) {
				// Remove the section of cache data
				delete thisCache[ name ];

				// If we've removed all the data, remove the element's cache
				if ( jQuery.isEmptyObject(thisCache) ) {
					jQuery.removeData( elem );
				}
			}

		// Otherwise, we want to remove all of the element's data
		} else {
			if ( jQuery.support.deleteExpando ) {
				delete elem[ jQuery.expando ];

			} else if ( elem.removeAttribute ) {
				elem.removeAttribute( jQuery.expando );
			}

			// Completely remove the data cache
			delete cache[ id ];
		}
	}
});

jQuery.fn.extend({
	data: function( key, value ) {
		if ( typeof key === "undefined" && this.length ) {
			return jQuery.data( this[0] );

		} else if ( typeof key === "object" ) {
			return this.each(function() {
				jQuery.data( this, key );
			});
		}

		var parts = key.split(".");
		parts[1] = parts[1] ? "." + parts[1] : "";

		if ( value === undefined ) {
			var data = this.triggerHandler("getData" + parts[1] + "!", [parts[0]]);

			if ( data === undefined && this.length ) {
				data = jQuery.data( this[0], key );
			}
			return data === undefined && parts[1] ?
				this.data( parts[0] ) :
				data;
		} else {
			return this.trigger("setData" + parts[1] + "!", [parts[0], value]).each(function() {
				jQuery.data( this, key, value );
			});
		}
	},

	removeData: function( key ) {
		return this.each(function() {
			jQuery.removeData( this, key );
		});
	}
});
jQuery.extend({
	queue: function( elem, type, data ) {
		if ( !elem ) {
			return;
		}

		type = (type || "fx") + "queue";
		var q = jQuery.data( elem, type );

		// Speed up dequeue by getting out quickly if this is just a lookup
		if ( !data ) {
			return q || [];
		}

		if ( !q || jQuery.isArray(data) ) {
			q = jQuery.data( elem, type, jQuery.makeArray(data) );

		} else {
			q.push( data );
		}

		return q;
	},

	dequeue: function( elem, type ) {
		type = type || "fx";

		var queue = jQuery.queue( elem, type ), fn = queue.shift();

		// If the fx queue is dequeued, always remove the progress sentinel
		if ( fn === "inprogress" ) {
			fn = queue.shift();
		}

		if ( fn ) {
			// Add a progress sentinel to prevent the fx queue from being
			// automatically dequeued
			if ( type === "fx" ) {
				queue.unshift("inprogress");
			}

			fn.call(elem, function() {
				jQuery.dequeue(elem, type);
			});
		}
	}
});

jQuery.fn.extend({
	queue: function( type, data ) {
		if ( typeof type !== "string" ) {
			data = type;
			type = "fx";
		}

		if ( data === undefined ) {
			return jQuery.queue( this[0], type );
		}
		return this.each(function( i, elem ) {
			var queue = jQuery.queue( this, type, data );

			if ( type === "fx" && queue[0] !== "inprogress" ) {
				jQuery.dequeue( this, type );
			}
		});
	},
	dequeue: function( type ) {
		return this.each(function() {
			jQuery.dequeue( this, type );
		});
	},

	// Based off of the plugin by Clint Helfers, with permission.
	// http://blindsignals.com/index.php/2009/07/jquery-delay/
	delay: function( time, type ) {
		time = jQuery.fx ? jQuery.fx.speeds[time] || time : time;
		type = type || "fx";

		return this.queue( type, function() {
			var elem = this;
			setTimeout(function() {
				jQuery.dequeue( elem, type );
			}, time );
		});
	},

	clearQueue: function( type ) {
		return this.queue( type || "fx", [] );
	}
});
var rclass = /[\n\t]/g,
	rspace = /\s+/,
	rreturn = /\r/g,
	rspecialurl = /href|src|style/,
	rtype = /(button|input)/i,
	rfocusable = /(button|input|object|select|textarea)/i,
	rclickable = /^(a|area)$/i,
	rradiocheck = /radio|checkbox/;

jQuery.fn.extend({
	attr: function( name, value ) {
		return access( this, name, value, true, jQuery.attr );
	},

	removeAttr: function( name, fn ) {
		return this.each(function(){
			jQuery.attr( this, name, "" );
			if ( this.nodeType === 1 ) {
				this.removeAttribute( name );
			}
		});
	},

	addClass: function( value ) {
		if ( jQuery.isFunction(value) ) {
			return this.each(function(i) {
				var self = jQuery(this);
				self.addClass( value.call(this, i, self.attr("class")) );
			});
		}

		if ( value && typeof value === "string" ) {
			var classNames = (value || "").split( rspace );

			for ( var i = 0, l = this.length; i < l; i++ ) {
				var elem = this[i];

				if ( elem.nodeType === 1 ) {
					if ( !elem.className ) {
						elem.className = value;

					} else {
						var className = " " + elem.className + " ", setClass = elem.className;
						for ( var c = 0, cl = classNames.length; c < cl; c++ ) {
							if ( className.indexOf( " " + classNames[c] + " " ) < 0 ) {
								setClass += " " + classNames[c];
							}
						}
						elem.className = jQuery.trim( setClass );
					}
				}
			}
		}

		return this;
	},

	removeClass: function( value ) {
		if ( jQuery.isFunction(value) ) {
			return this.each(function(i) {
				var self = jQuery(this);
				self.removeClass( value.call(this, i, self.attr("class")) );
			});
		}

		if ( (value && typeof value === "string") || value === undefined ) {
			var classNames = (value || "").split(rspace);

			for ( var i = 0, l = this.length; i < l; i++ ) {
				var elem = this[i];

				if ( elem.nodeType === 1 && elem.className ) {
					if ( value ) {
						var className = (" " + elem.className + " ").replace(rclass, " ");
						for ( var c = 0, cl = classNames.length; c < cl; c++ ) {
							className = className.replace(" " + classNames[c] + " ", " ");
						}
						elem.className = jQuery.trim( className );

					} else {
						elem.className = "";
					}
				}
			}
		}

		return this;
	},

	toggleClass: function( value, stateVal ) {
		var type = typeof value, isBool = typeof stateVal === "boolean";

		if ( jQuery.isFunction( value ) ) {
			return this.each(function(i) {
				var self = jQuery(this);
				self.toggleClass( value.call(this, i, self.attr("class"), stateVal), stateVal );
			});
		}

		return this.each(function() {
			if ( type === "string" ) {
				// toggle individual class names
				var className, i = 0, self = jQuery(this),
					state = stateVal,
					classNames = value.split( rspace );

				while ( (className = classNames[ i++ ]) ) {
					// check each className given, space seperated list
					state = isBool ? state : !self.hasClass( className );
					self[ state ? "addClass" : "removeClass" ]( className );
				}

			} else if ( type === "undefined" || type === "boolean" ) {
				if ( this.className ) {
					// store className if set
					jQuery.data( this, "__className__", this.className );
				}

				// toggle whole className
				this.className = this.className || value === false ? "" : jQuery.data( this, "__className__" ) || "";
			}
		});
	},

	hasClass: function( selector ) {
		var className = " " + selector + " ";
		for ( var i = 0, l = this.length; i < l; i++ ) {
			if ( (" " + this[i].className + " ").replace(rclass, " ").indexOf( className ) > -1 ) {
				return true;
			}
		}

		return false;
	},

	val: function( value ) {
		if ( value === undefined ) {
			var elem = this[0];

			if ( elem ) {
				if ( jQuery.nodeName( elem, "option" ) ) {
					return (elem.attributes.value || {}).specified ? elem.value : elem.text;
				}

				// We need to handle select boxes special
				if ( jQuery.nodeName( elem, "select" ) ) {
					var index = elem.selectedIndex,
						values = [],
						options = elem.options,
						one = elem.type === "select-one";

					// Nothing was selected
					if ( index < 0 ) {
						return null;
					}

					// Loop through all the selected options
					for ( var i = one ? index : 0, max = one ? index + 1 : options.length; i < max; i++ ) {
						var option = options[ i ];

						if ( option.selected ) {
							// Get the specifc value for the option
							value = jQuery(option).val();

							// We don't need an array for one selects
							if ( one ) {
								return value;
							}

							// Multi-Selects return an array
							values.push( value );
						}
					}

					return values;
				}

				// Handle the case where in Webkit "" is returned instead of "on" if a value isn't specified
				if ( rradiocheck.test( elem.type ) && !jQuery.support.checkOn ) {
					return elem.getAttribute("value") === null ? "on" : elem.value;
				}
				

				// Everything else, we just grab the value
				return (elem.value || "").replace(rreturn, "");

			}

			return undefined;
		}

		var isFunction = jQuery.isFunction(value);

		return this.each(function(i) {
			var self = jQuery(this), val = value;

			if ( this.nodeType !== 1 ) {
				return;
			}

			if ( isFunction ) {
				val = value.call(this, i, self.val());
			}

			// Typecast each time if the value is a Function and the appended
			// value is therefore different each time.
			if ( typeof val === "number" ) {
				val += "";
			}

			if ( jQuery.isArray(val) && rradiocheck.test( this.type ) ) {
				this.checked = jQuery.inArray( self.val(), val ) >= 0;

			} else if ( jQuery.nodeName( this, "select" ) ) {
				var values = jQuery.makeArray(val);

				jQuery( "option", this ).each(function() {
					this.selected = jQuery.inArray( jQuery(this).val(), values ) >= 0;
				});

				if ( !values.length ) {
					this.selectedIndex = -1;
				}

			} else {
				this.value = val;
			}
		});
	}
});

jQuery.extend({
	attrFn: {
		val: true,
		css: true,
		html: true,
		text: true,
		data: true,
		width: true,
		height: true,
		offset: true
	},
		
	attr: function( elem, name, value, pass ) {
		// don't set attributes on text and comment nodes
		if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 ) {
			return undefined;
		}

		if ( pass && name in jQuery.attrFn ) {
			return jQuery(elem)[name](value);
		}

		var notxml = elem.nodeType !== 1 || !jQuery.isXMLDoc( elem ),
			// Whether we are setting (or getting)
			set = value !== undefined;

		// Try to normalize/fix the name
		name = notxml && jQuery.props[ name ] || name;

		// Only do all the following if this is a node (faster for style)
		if ( elem.nodeType === 1 ) {
			// These attributes require special treatment
			var special = rspecialurl.test( name );

			// Safari mis-reports the default selected property of an option
			// Accessing the parent's selectedIndex property fixes it
			if ( name === "selected" && !jQuery.support.optSelected ) {
				var parent = elem.parentNode;
				if ( parent ) {
					parent.selectedIndex;
	
					// Make sure that it also works with optgroups, see #5701
					if ( parent.parentNode ) {
						parent.parentNode.selectedIndex;
					}
				}
			}

			// If applicable, access the attribute via the DOM 0 way
			if ( name in elem && notxml && !special ) {
				if ( set ) {
					// We can't allow the type property to be changed (since it causes problems in IE)
					if ( name === "type" && rtype.test( elem.nodeName ) && elem.parentNode ) {
						jQuery.error( "type property can't be changed" );
					}

					elem[ name ] = value;
				}

				// browsers index elements by id/name on forms, give priority to attributes.
				if ( jQuery.nodeName( elem, "form" ) && elem.getAttributeNode(name) ) {
					return elem.getAttributeNode( name ).nodeValue;
				}

				// elem.tabIndex doesn't always return the correct value when it hasn't been explicitly set
				// http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
				if ( name === "tabIndex" ) {
					var attributeNode = elem.getAttributeNode( "tabIndex" );

					return attributeNode && attributeNode.specified ?
						attributeNode.value :
						rfocusable.test( elem.nodeName ) || rclickable.test( elem.nodeName ) && elem.href ?
							0 :
							undefined;
				}

				return elem[ name ];
			}

			if ( !jQuery.support.style && notxml && name === "style" ) {
				if ( set ) {
					elem.style.cssText = "" + value;
				}

				return elem.style.cssText;
			}

			if ( set ) {
				// convert the value to a string (all browsers do this but IE) see #1070
				elem.setAttribute( name, "" + value );
			}

			var attr = !jQuery.support.hrefNormalized && notxml && special ?
					// Some attributes require a special call on IE
					elem.getAttribute( name, 2 ) :
					elem.getAttribute( name );

			// Non-existent attributes return null, we normalize to undefined
			return attr === null ? undefined : attr;
		}

		// elem is actually elem.style ... set the style
		// Using attr for specific style information is now deprecated. Use style instead.
		return jQuery.style( elem, name, value );
	}
});
var rnamespaces = /\.(.*)$/,
	fcleanup = function( nm ) {
		return nm.replace(/[^\w\s\.\|`]/g, function( ch ) {
			return "\\" + ch;
		});
	};

/*
 * A number of helper functions used for managing events.
 * Many of the ideas behind this code originated from
 * Dean Edwards' addEvent library.
 */
jQuery.event = {

	// Bind an event to an element
	// Original by Dean Edwards
	add: function( elem, types, handler, data ) {
		if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
			return;
		}

		// For whatever reason, IE has trouble passing the window object
		// around, causing it to be cloned in the process
		if ( elem.setInterval && ( elem !== window && !elem.frameElement ) ) {
			elem = window;
		}

		var handleObjIn, handleObj;

		if ( handler.handler ) {
			handleObjIn = handler;
			handler = handleObjIn.handler;
		}

		// Make sure that the function being executed has a unique ID
		if ( !handler.guid ) {
			handler.guid = jQuery.guid++;
		}

		// Init the element's event structure
		var elemData = jQuery.data( elem );

		// If no elemData is found then we must be trying to bind to one of the
		// banned noData elements
		if ( !elemData ) {
			return;
		}

		var events = elemData.events = elemData.events || {},
			eventHandle = elemData.handle, eventHandle;

		if ( !eventHandle ) {
			elemData.handle = eventHandle = function() {
				// Handle the second event of a trigger and when
				// an event is called after a page has unloaded
				return typeof jQuery !== "undefined" && !jQuery.event.triggered ?
					jQuery.event.handle.apply( eventHandle.elem, arguments ) :
					undefined;
			};
		}

		// Add elem as a property of the handle function
		// This is to prevent a memory leak with non-native events in IE.
		eventHandle.elem = elem;

		// Handle multiple events separated by a space
		// jQuery(...).bind("mouseover mouseout", fn);
		types = types.split(" ");

		var type, i = 0, namespaces;

		while ( (type = types[ i++ ]) ) {
			handleObj = handleObjIn ?
				jQuery.extend({}, handleObjIn) :
				{ handler: handler, data: data };

			// Namespaced event handlers
			if ( type.indexOf(".") > -1 ) {
				namespaces = type.split(".");
				type = namespaces.shift();
				handleObj.namespace = namespaces.slice(0).sort().join(".");

			} else {
				namespaces = [];
				handleObj.namespace = "";
			}

			handleObj.type = type;
			handleObj.guid = handler.guid;

			// Get the current list of functions bound to this event
			var handlers = events[ type ],
				special = jQuery.event.special[ type ] || {};

			// Init the event handler queue
			if ( !handlers ) {
				handlers = events[ type ] = [];

				// Check for a special event handler
				// Only use addEventListener/attachEvent if the special
				// events handler returns false
				if ( !special.setup || special.setup.call( elem, data, namespaces, eventHandle ) === false ) {
					// Bind the global event handler to the element
					if ( elem.addEventListener ) {
						elem.addEventListener( type, eventHandle, false );

					} else if ( elem.attachEvent ) {
						elem.attachEvent( "on" + type, eventHandle );
					}
				}
			}
			
			if ( special.add ) { 
				special.add.call( elem, handleObj ); 

				if ( !handleObj.handler.guid ) {
					handleObj.handler.guid = handler.guid;
				}
			}

			// Add the function to the element's handler list
			handlers.push( handleObj );

			// Keep track of which events have been used, for global triggering
			jQuery.event.global[ type ] = true;
		}

		// Nullify elem to prevent memory leaks in IE
		elem = null;
	},

	global: {},

	// Detach an event or set of events from an element
	remove: function( elem, types, handler, pos ) {
		// don't do events on text and comment nodes
		if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
			return;
		}

		var ret, type, fn, i = 0, all, namespaces, namespace, special, eventType, handleObj, origType,
			elemData = jQuery.data( elem ),
			events = elemData && elemData.events;

		if ( !elemData || !events ) {
			return;
		}

		// types is actually an event object here
		if ( types && types.type ) {
			handler = types.handler;
			types = types.type;
		}

		// Unbind all events for the element
		if ( !types || typeof types === "string" && types.charAt(0) === "." ) {
			types = types || "";

			for ( type in events ) {
				jQuery.event.remove( elem, type + types );
			}

			return;
		}

		// Handle multiple events separated by a space
		// jQuery(...).unbind("mouseover mouseout", fn);
		types = types.split(" ");

		while ( (type = types[ i++ ]) ) {
			origType = type;
			handleObj = null;
			all = type.indexOf(".") < 0;
			namespaces = [];

			if ( !all ) {
				// Namespaced event handlers
				namespaces = type.split(".");
				type = namespaces.shift();

				namespace = new RegExp("(^|\\.)" + 
					jQuery.map( namespaces.slice(0).sort(), fcleanup ).join("\\.(?:.*\\.)?") + "(\\.|$)")
			}

			eventType = events[ type ];

			if ( !eventType ) {
				continue;
			}

			if ( !handler ) {
				for ( var j = 0; j < eventType.length; j++ ) {
					handleObj = eventType[ j ];

					if ( all || namespace.test( handleObj.namespace ) ) {
						jQuery.event.remove( elem, origType, handleObj.handler, j );
						eventType.splice( j--, 1 );
					}
				}

				continue;
			}

			special = jQuery.event.special[ type ] || {};

			for ( var j = pos || 0; j < eventType.length; j++ ) {
				handleObj = eventType[ j ];

				if ( handler.guid === handleObj.guid ) {
					// remove the given handler for the given type
					if ( all || namespace.test( handleObj.namespace ) ) {
						if ( pos == null ) {
							eventType.splice( j--, 1 );
						}

						if ( special.remove ) {
							special.remove.call( elem, handleObj );
						}
					}

					if ( pos != null ) {
						break;
					}
				}
			}

			// remove generic event handler if no more handlers exist
			if ( eventType.length === 0 || pos != null && eventType.length === 1 ) {
				if ( !special.teardown || special.teardown.call( elem, namespaces ) === false ) {
					removeEvent( elem, type, elemData.handle );
				}

				ret = null;
				delete events[ type ];
			}
		}

		// Remove the expando if it's no longer used
		if ( jQuery.isEmptyObject( events ) ) {
			var handle = elemData.handle;
			if ( handle ) {
				handle.elem = null;
			}

			delete elemData.events;
			delete elemData.handle;

			if ( jQuery.isEmptyObject( elemData ) ) {
				jQuery.removeData( elem );
			}
		}
	},

	// bubbling is internal
	trigger: function( event, data, elem /*, bubbling */ ) {
		// Event object or event type
		var type = event.type || event,
			bubbling = arguments[3];

		if ( !bubbling ) {
			event = typeof event === "object" ?
				// jQuery.Event object
				event[expando] ? event :
				// Object literal
				jQuery.extend( jQuery.Event(type), event ) :
				// Just the event type (string)
				jQuery.Event(type);

			if ( type.indexOf("!") >= 0 ) {
				event.type = type = type.slice(0, -1);
				event.exclusive = true;
			}

			// Handle a global trigger
			if ( !elem ) {
				// Don't bubble custom events when global (to avoid too much overhead)
				event.stopPropagation();

				// Only trigger if we've ever bound an event for it
				if ( jQuery.event.global[ type ] ) {
					jQuery.each( jQuery.cache, function() {
						if ( this.events && this.events[type] ) {
							jQuery.event.trigger( event, data, this.handle.elem );
						}
					});
				}
			}

			// Handle triggering a single element

			// don't do events on text and comment nodes
			if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 ) {
				return undefined;
			}

			// Clean up in case it is reused
			event.result = undefined;
			event.target = elem;

			// Clone the incoming data, if any
			data = jQuery.makeArray( data );
			data.unshift( event );
		}

		event.currentTarget = elem;

		// Trigger the event, it is assumed that "handle" is a function
		var handle = jQuery.data( elem, "handle" );
		if ( handle ) {
			handle.apply( elem, data );
		}

		var parent = elem.parentNode || elem.ownerDocument;

		// Trigger an inline bound script
		try {
			if ( !(elem && elem.nodeName && jQuery.noData[elem.nodeName.toLowerCase()]) ) {
				if ( elem[ "on" + type ] && elem[ "on" + type ].apply( elem, data ) === false ) {
					event.result = false;
				}
			}

		// prevent IE from throwing an error for some elements with some event types, see #3533
		} catch (e) {}

		if ( !event.isPropagationStopped() && parent ) {
			jQuery.event.trigger( event, data, parent, true );

		} else if ( !event.isDefaultPrevented() ) {
			var target = event.target, old,
				isClick = jQuery.nodeName(target, "a") && type === "click",
				special = jQuery.event.special[ type ] || {};

			if ( (!special._default || special._default.call( elem, event ) === false) && 
				!isClick && !(target && target.nodeName && jQuery.noData[target.nodeName.toLowerCase()]) ) {

				try {
					if ( target[ type ] ) {
						// Make sure that we don't accidentally re-trigger the onFOO events
						old = target[ "on" + type ];

						if ( old ) {
							target[ "on" + type ] = null;
						}

						jQuery.event.triggered = true;
						target[ type ]();
					}

				// prevent IE from throwing an error for some elements with some event types, see #3533
				} catch (e) {}

				if ( old ) {
					target[ "on" + type ] = old;
				}

				jQuery.event.triggered = false;
			}
		}
	},

	handle: function( event ) {
		var all, handlers, namespaces, namespace, events;

		event = arguments[0] = jQuery.event.fix( event || window.event );
		event.currentTarget = this;

		// Namespaced event handlers
		all = event.type.indexOf(".") < 0 && !event.exclusive;

		if ( !all ) {
			namespaces = event.type.split(".");
			event.type = namespaces.shift();
			namespace = new RegExp("(^|\\.)" + namespaces.slice(0).sort().join("\\.(?:.*\\.)?") + "(\\.|$)");
		}

		var events = jQuery.data(this, "events"), handlers = events[ event.type ];

		if ( events && handlers ) {
			// Clone the handlers to prevent manipulation
			handlers = handlers.slice(0);

			for ( var j = 0, l = handlers.length; j < l; j++ ) {
				var handleObj = handlers[ j ];

				// Filter the functions by class
				if ( all || namespace.test( handleObj.namespace ) ) {
					// Pass in a reference to the handler function itself
					// So that we can later remove it
					event.handler = handleObj.handler;
					event.data = handleObj.data;
					event.handleObj = handleObj;
	
					var ret = handleObj.handler.apply( this, arguments );

					if ( ret !== undefined ) {
						event.result = ret;
						if ( ret === false ) {
							event.preventDefault();
							event.stopPropagation();
						}
					}

					if ( event.isImmediatePropagationStopped() ) {
						break;
					}
				}
			}
		}

		return event.result;
	},

	props: "altKey attrChange attrName bubbles button cancelable charCode clientX clientY ctrlKey currentTarget data detail eventPhase fromElement handler keyCode layerX layerY metaKey newValue offsetX offsetY originalTarget pageX pageY prevValue relatedNode relatedTarget screenX screenY shiftKey srcElement target toElement view wheelDelta which".split(" "),

	fix: function( event ) {
		if ( event[ expando ] ) {
			return event;
		}

		// store a copy of the original event object
		// and "clone" to set read-only properties
		var originalEvent = event;
		event = jQuery.Event( originalEvent );

		for ( var i = this.props.length, prop; i; ) {
			prop = this.props[ --i ];
			event[ prop ] = originalEvent[ prop ];
		}

		// Fix target property, if necessary
		if ( !event.target ) {
			event.target = event.srcElement || document; // Fixes #1925 where srcElement might not be defined either
		}

		// check if target is a textnode (safari)
		if ( event.target.nodeType === 3 ) {
			event.target = event.target.parentNode;
		}

		// Add relatedTarget, if necessary
		if ( !event.relatedTarget && event.fromElement ) {
			event.relatedTarget = event.fromElement === event.target ? event.toElement : event.fromElement;
		}

		// Calculate pageX/Y if missing and clientX/Y available
		if ( event.pageX == null && event.clientX != null ) {
			var doc = document.documentElement, body = document.body;
			event.pageX = event.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0);
			event.pageY = event.clientY + (doc && doc.scrollTop  || body && body.scrollTop  || 0) - (doc && doc.clientTop  || body && body.clientTop  || 0);
		}

		// Add which for key events
		if ( !event.which && ((event.charCode || event.charCode === 0) ? event.charCode : event.keyCode) ) {
			event.which = event.charCode || event.keyCode;
		}

		// Add metaKey to non-Mac browsers (use ctrl for PC's and Meta for Macs)
		if ( !event.metaKey && event.ctrlKey ) {
			event.metaKey = event.ctrlKey;
		}

		// Add which for click: 1 === left; 2 === middle; 3 === right
		// Note: button is not normalized, so don't use it
		if ( !event.which && event.button !== undefined ) {
			event.which = (event.button & 1 ? 1 : ( event.button & 2 ? 3 : ( event.button & 4 ? 2 : 0 ) ));
		}

		return event;
	},

	// Deprecated, use jQuery.guid instead
	guid: 1E8,

	// Deprecated, use jQuery.proxy instead
	proxy: jQuery.proxy,

	special: {
		ready: {
			// Make sure the ready event is setup
			setup: jQuery.bindReady,
			teardown: jQuery.noop
		},

		live: {
			add: function( handleObj ) {
				jQuery.event.add( this, handleObj.origType, jQuery.extend({}, handleObj, {handler: liveHandler}) ); 
			},

			remove: function( handleObj ) {
				var remove = true,
					type = handleObj.origType.replace(rnamespaces, "");
				
				jQuery.each( jQuery.data(this, "events").live || [], function() {
					if ( type === this.origType.replace(rnamespaces, "") ) {
						remove = false;
						return false;
					}
				});

				if ( remove ) {
					jQuery.event.remove( this, handleObj.origType, liveHandler );
				}
			}

		},

		beforeunload: {
			setup: function( data, namespaces, eventHandle ) {
				// We only want to do this special case on windows
				if ( this.setInterval ) {
					this.onbeforeunload = eventHandle;
				}

				return false;
			},
			teardown: function( namespaces, eventHandle ) {
				if ( this.onbeforeunload === eventHandle ) {
					this.onbeforeunload = null;
				}
			}
		}
	}
};

var removeEvent = document.removeEventListener ?
	function( elem, type, handle ) {
		elem.removeEventListener( type, handle, false );
	} : 
	function( elem, type, handle ) {
		elem.detachEvent( "on" + type, handle );
	};

jQuery.Event = function( src ) {
	// Allow instantiation without the 'new' keyword
	if ( !this.preventDefault ) {
		return new jQuery.Event( src );
	}

	// Event object
	if ( src && src.type ) {
		this.originalEvent = src;
		this.type = src.type;
	// Event type
	} else {
		this.type = src;
	}

	// timeStamp is buggy for some events on Firefox(#3843)
	// So we won't rely on the native value
	this.timeStamp = now();

	// Mark it as fixed
	this[ expando ] = true;
};

function returnFalse() {
	return false;
}
function returnTrue() {
	return true;
}

// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
jQuery.Event.prototype = {
	preventDefault: function() {
		this.isDefaultPrevented = returnTrue;

		var e = this.originalEvent;
		if ( !e ) {
			return;
		}
		
		// if preventDefault exists run it on the original event
		if ( e.preventDefault ) {
			e.preventDefault();
		}
		// otherwise set the returnValue property of the original event to false (IE)
		e.returnValue = false;
	},
	stopPropagation: function() {
		this.isPropagationStopped = returnTrue;

		var e = this.originalEvent;
		if ( !e ) {
			return;
		}
		// if stopPropagation exists run it on the original event
		if ( e.stopPropagation ) {
			e.stopPropagation();
		}
		// otherwise set the cancelBubble property of the original event to true (IE)
		e.cancelBubble = true;
	},
	stopImmediatePropagation: function() {
		this.isImmediatePropagationStopped = returnTrue;
		this.stopPropagation();
	},
	isDefaultPrevented: returnFalse,
	isPropagationStopped: returnFalse,
	isImmediatePropagationStopped: returnFalse
};

// Checks if an event happened on an element within another element
// Used in jQuery.event.special.mouseenter and mouseleave handlers
var withinElement = function( event ) {
	// Check if mouse(over|out) are still within the same parent element
	var parent = event.relatedTarget;

	// Firefox sometimes assigns relatedTarget a XUL element
	// which we cannot access the parentNode property of
	try {
		// Traverse up the tree
		while ( parent && parent !== this ) {
			parent = parent.parentNode;
		}

		if ( parent !== this ) {
			// set the correct event type
			event.type = event.data;

			// handle event if we actually just moused on to a non sub-element
			jQuery.event.handle.apply( this, arguments );
		}

	// assuming we've left the element since we most likely mousedover a xul element
	} catch(e) { }
},

// In case of event delegation, we only need to rename the event.type,
// liveHandler will take care of the rest.
delegate = function( event ) {
	event.type = event.data;
	jQuery.event.handle.apply( this, arguments );
};

// Create mouseenter and mouseleave events
jQuery.each({
	mouseenter: "mouseover",
	mouseleave: "mouseout"
}, function( orig, fix ) {
	jQuery.event.special[ orig ] = {
		setup: function( data ) {
			jQuery.event.add( this, fix, data && data.selector ? delegate : withinElement, orig );
		},
		teardown: function( data ) {
			jQuery.event.remove( this, fix, data && data.selector ? delegate : withinElement );
		}
	};
});

// submit delegation
if ( !jQuery.support.submitBubbles ) {

	jQuery.event.special.submit = {
		setup: function( data, namespaces ) {
			if ( this.nodeName.toLowerCase() !== "form" ) {
				jQuery.event.add(this, "click.specialSubmit", function( e ) {
					var elem = e.target, type = elem.type;

					if ( (type === "submit" || type === "image") && jQuery( elem ).closest("form").length ) {
						return trigger( "submit", this, arguments );
					}
				});
	 
				jQuery.event.add(this, "keypress.specialSubmit", function( e ) {
					var elem = e.target, type = elem.type;

					if ( (type === "text" || type === "password") && jQuery( elem ).closest("form").length && e.keyCode === 13 ) {
						return trigger( "submit", this, arguments );
					}
				});

			} else {
				return false;
			}
		},

		teardown: function( namespaces ) {
			jQuery.event.remove( this, ".specialSubmit" );
		}
	};

}

// change delegation, happens here so we have bind.
if ( !jQuery.support.changeBubbles ) {

	var formElems = /textarea|input|select/i,

	changeFilters,

	getVal = function( elem ) {
		var type = elem.type, val = elem.value;

		if ( type === "radio" || type === "checkbox" ) {
			val = elem.checked;

		} else if ( type === "select-multiple" ) {
			val = elem.selectedIndex > -1 ?
				jQuery.map( elem.options, function( elem ) {
					return elem.selected;
				}).join("-") :
				"";

		} else if ( elem.nodeName.toLowerCase() === "select" ) {
			val = elem.selectedIndex;
		}

		return val;
	},

	testChange = function testChange( e ) {
		var elem = e.target, data, val;

		if ( !formElems.test( elem.nodeName ) || elem.readOnly ) {
			return;
		}

		data = jQuery.data( elem, "_change_data" );
		val = getVal(elem);

		// the current data will be also retrieved by beforeactivate
		if ( e.type !== "focusout" || elem.type !== "radio" ) {
			jQuery.data( elem, "_change_data", val );
		}
		
		if ( data === undefined || val === data ) {
			return;
		}

		if ( data != null || val ) {
			e.type = "change";
			return jQuery.event.trigger( e, arguments[1], elem );
		}
	};

	jQuery.event.special.change = {
		filters: {
			focusout: testChange, 

			click: function( e ) {
				var elem = e.target, type = elem.type;

				if ( type === "radio" || type === "checkbox" || elem.nodeName.toLowerCase() === "select" ) {
					return testChange.call( this, e );
				}
			},

			// Change has to be called before submit
			// Keydown will be called before keypress, which is used in submit-event delegation
			keydown: function( e ) {
				var elem = e.target, type = elem.type;

				if ( (e.keyCode === 13 && elem.nodeName.toLowerCase() !== "textarea") ||
					(e.keyCode === 32 && (type === "checkbox" || type === "radio")) ||
					type === "select-multiple" ) {
					return testChange.call( this, e );
				}
			},

			// Beforeactivate happens also before the previous element is blurred
			// with this event you can't trigger a change event, but you can store
			// information/focus[in] is not needed anymore
			beforeactivate: function( e ) {
				var elem = e.target;
				jQuery.data( elem, "_change_data", getVal(elem) );
			}
		},

		setup: function( data, namespaces ) {
			if ( this.type === "file" ) {
				return false;
			}

			for ( var type in changeFilters ) {
				jQuery.event.add( this, type + ".specialChange", changeFilters[type] );
			}

			return formElems.test( this.nodeName );
		},

		teardown: function( namespaces ) {
			jQuery.event.remove( this, ".specialChange" );

			return formElems.test( this.nodeName );
		}
	};

	changeFilters = jQuery.event.special.change.filters;
}

function trigger( type, elem, args ) {
	args[0].type = type;
	return jQuery.event.handle.apply( elem, args );
}

// Create "bubbling" focus and blur events
if ( document.addEventListener ) {
	jQuery.each({ focus: "focusin", blur: "focusout" }, function( orig, fix ) {
		jQuery.event.special[ fix ] = {
			setup: function() {
				this.addEventListener( orig, handler, true );
			}, 
			teardown: function() { 
				this.removeEventListener( orig, handler, true );
			}
		};

		function handler( e ) { 
			e = jQuery.event.fix( e );
			e.type = fix;
			return jQuery.event.handle.call( this, e );
		}
	});
}

jQuery.each(["bind", "one"], function( i, name ) {
	jQuery.fn[ name ] = function( type, data, fn ) {
		// Handle object literals
		if ( typeof type === "object" ) {
			for ( var key in type ) {
				this[ name ](key, data, type[key], fn);
			}
			return this;
		}
		
		if ( jQuery.isFunction( data ) ) {
			fn = data;
			data = undefined;
		}

		var handler = name === "one" ? jQuery.proxy( fn, function( event ) {
			jQuery( this ).unbind( event, handler );
			return fn.apply( this, arguments );
		}) : fn;

		if ( type === "unload" && name !== "one" ) {
			this.one( type, data, fn );

		} else {
			for ( var i = 0, l = this.length; i < l; i++ ) {
				jQuery.event.add( this[i], type, handler, data );
			}
		}

		return this;
	};
});

jQuery.fn.extend({
	unbind: function( type, fn ) {
		// Handle object literals
		if ( typeof type === "object" && !type.preventDefault ) {
			for ( var key in type ) {
				this.unbind(key, type[key]);
			}

		} else {
			for ( var i = 0, l = this.length; i < l; i++ ) {
				jQuery.event.remove( this[i], type, fn );
			}
		}

		return this;
	},
	
	delegate: function( selector, types, data, fn ) {
		return this.live( types, data, fn, selector );
	},
	
	undelegate: function( selector, types, fn ) {
		if ( arguments.length === 0 ) {
				return this.unbind( "live" );
		
		} else {
			return this.die( types, null, fn, selector );
		}
	},
	
	trigger: function( type, data ) {
		return this.each(function() {
			jQuery.event.trigger( type, data, this );
		});
	},

	triggerHandler: function( type, data ) {
		if ( this[0] ) {
			var event = jQuery.Event( type );
			event.preventDefault();
			event.stopPropagation();
			jQuery.event.trigger( event, data, this[0] );
			return event.result;
		}
	},

	toggle: function( fn ) {
		// Save reference to arguments for access in closure
		var args = arguments, i = 1;

		// link all the functions, so any of them can unbind this click handler
		while ( i < args.length ) {
			jQuery.proxy( fn, args[ i++ ] );
		}

		return this.click( jQuery.proxy( fn, function( event ) {
			// Figure out which function to execute
			var lastToggle = ( jQuery.data( this, "lastToggle" + fn.guid ) || 0 ) % i;
			jQuery.data( this, "lastToggle" + fn.guid, lastToggle + 1 );

			// Make sure that clicks stop
			event.preventDefault();

			// and execute the function
			return args[ lastToggle ].apply( this, arguments ) || false;
		}));
	},

	hover: function( fnOver, fnOut ) {
		return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
	}
});

var liveMap = {
	focus: "focusin",
	blur: "focusout",
	mouseenter: "mouseover",
	mouseleave: "mouseout"
};

jQuery.each(["live", "die"], function( i, name ) {
	jQuery.fn[ name ] = function( types, data, fn, origSelector /* Internal Use Only */ ) {
		var type, i = 0, match, namespaces, preType,
			selector = origSelector || this.selector,
			context = origSelector ? this : jQuery( this.context );

		if ( jQuery.isFunction( data ) ) {
			fn = data;
			data = undefined;
		}

		types = (types || "").split(" ");

		while ( (type = types[ i++ ]) != null ) {
			match = rnamespaces.exec( type );
			namespaces = "";

			if ( match )  {
				namespaces = match[0];
				type = type.replace( rnamespaces, "" );
			}

			if ( type === "hover" ) {
				types.push( "mouseenter" + namespaces, "mouseleave" + namespaces );
				continue;
			}

			preType = type;

			if ( type === "focus" || type === "blur" ) {
				types.push( liveMap[ type ] + namespaces );
				type = type + namespaces;

			} else {
				type = (liveMap[ type ] || type) + namespaces;
			}

			if ( name === "live" ) {
				// bind live handler
				context.each(function(){
					jQuery.event.add( this, liveConvert( type, selector ),
						{ data: data, selector: selector, handler: fn, origType: type, origHandler: fn, preType: preType } );
				});

			} else {
				// unbind live handler
				context.unbind( liveConvert( type, selector ), fn );
			}
		}
		
		return this;
	}
});

function liveHandler( event ) {
	var stop, elems = [], selectors = [], args = arguments,
		related, match, handleObj, elem, j, i, l, data,
		events = jQuery.data( this, "events" );

	// Make sure we avoid non-left-click bubbling in Firefox (#3861)
	if ( event.liveFired === this || !events || !events.live || event.button && event.type === "click" ) {
		return;
	}

	event.liveFired = this;

	var live = events.live.slice(0);

	for ( j = 0; j < live.length; j++ ) {
		handleObj = live[j];

		if ( handleObj.origType.replace( rnamespaces, "" ) === event.type ) {
			selectors.push( handleObj.selector );

		} else {
			live.splice( j--, 1 );
		}
	}

	match = jQuery( event.target ).closest( selectors, event.currentTarget );

	for ( i = 0, l = match.length; i < l; i++ ) {
		for ( j = 0; j < live.length; j++ ) {
			handleObj = live[j];

			if ( match[i].selector === handleObj.selector ) {
				elem = match[i].elem;
				related = null;

				// Those two events require additional checking
				if ( handleObj.preType === "mouseenter" || handleObj.preType === "mouseleave" ) {
					related = jQuery( event.relatedTarget ).closest( handleObj.selector )[0];
				}

				if ( !related || related !== elem ) {
					elems.push({ elem: elem, handleObj: handleObj });
				}
			}
		}
	}

	for ( i = 0, l = elems.length; i < l; i++ ) {
		match = elems[i];
		event.currentTarget = match.elem;
		event.data = match.handleObj.data;
		event.handleObj = match.handleObj;

		if ( match.handleObj.origHandler.apply( match.elem, args ) === false ) {
			stop = false;
			break;
		}
	}

	return stop;
}

function liveConvert( type, selector ) {
	return "live." + (type && type !== "*" ? type + "." : "") + selector.replace(/\./g, "`").replace(/ /g, "&");
}

jQuery.each( ("blur focus focusin focusout load resize scroll unload click dblclick " +
	"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
	"change select submit keydown keypress keyup error").split(" "), function( i, name ) {

	// Handle event binding
	jQuery.fn[ name ] = function( fn ) {
		return fn ? this.bind( name, fn ) : this.trigger( name );
	};

	if ( jQuery.attrFn ) {
		jQuery.attrFn[ name ] = true;
	}
});

// Prevent memory leaks in IE
// Window isn't included so as not to unbind existing unload events
// More info:
//  - http://isaacschlueter.com/2006/10/msie-memory-leaks/
if ( window.attachEvent && !window.addEventListener ) {
	window.attachEvent("onunload", function() {
		for ( var id in jQuery.cache ) {
			if ( jQuery.cache[ id ].handle ) {
				// Try/Catch is to handle iframes being unloaded, see #4280
				try {
					jQuery.event.remove( jQuery.cache[ id ].handle.elem );
				} catch(e) {}
			}
		}
	});
}
/*!
 * Sizzle CSS Selector Engine - v1.0
 *  Copyright 2009, The Dojo Foundation
 *  Released under the MIT, BSD, and GPL Licenses.
 *  More information: http://sizzlejs.com/
 */
(function(){

var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^[\]]*\]|['"][^'"]*['"]|[^[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,
	done = 0,
	toString = Object.prototype.toString,
	hasDuplicate = false,
	baseHasDuplicate = true;

// Here we check if the JavaScript engine is using some sort of
// optimization where it does not always call our comparision
// function. If that is the case, discard the hasDuplicate value.
//   Thus far that includes Google Chrome.
[0, 0].sort(function(){
	baseHasDuplicate = false;
	return 0;
});

var Sizzle = function(selector, context, results, seed) {
	results = results || [];
	var origContext = context = context || document;

	if ( context.nodeType !== 1 && context.nodeType !== 9 ) {
		return [];
	}
	
	if ( !selector || typeof selector !== "string" ) {
		return results;
	}

	var parts = [], m, set, checkSet, extra, prune = true, contextXML = isXML(context),
		soFar = selector;
	
	// Reset the position of the chunker regexp (start from head)
	while ( (chunker.exec(""), m = chunker.exec(soFar)) !== null ) {
		soFar = m[3];
		
		parts.push( m[1] );
		
		if ( m[2] ) {
			extra = m[3];
			break;
		}
	}

	if ( parts.length > 1 && origPOS.exec( selector ) ) {
		if ( parts.length === 2 && Expr.relative[ parts[0] ] ) {
			set = posProcess( parts[0] + parts[1], context );
		} else {
			set = Expr.relative[ parts[0] ] ?
				[ context ] :
				Sizzle( parts.shift(), context );

			while ( parts.length ) {
				selector = parts.shift();

				if ( Expr.relative[ selector ] ) {
					selector += parts.shift();
				}
				
				set = posProcess( selector, set );
			}
		}
	} else {
		// Take a shortcut and set the context if the root selector is an ID
		// (but not if it'll be faster if the inner selector is an ID)
		if ( !seed && parts.length > 1 && context.nodeType === 9 && !contextXML &&
				Expr.match.ID.test(parts[0]) && !Expr.match.ID.test(parts[parts.length - 1]) ) {
			var ret = Sizzle.find( parts.shift(), context, contextXML );
			context = ret.expr ? Sizzle.filter( ret.expr, ret.set )[0] : ret.set[0];
		}

		if ( context ) {
			var ret = seed ?
				{ expr: parts.pop(), set: makeArray(seed) } :
				Sizzle.find( parts.pop(), parts.length === 1 && (parts[0] === "~" || parts[0] === "+") && context.parentNode ? context.parentNode : context, contextXML );
			set = ret.expr ? Sizzle.filter( ret.expr, ret.set ) : ret.set;

			if ( parts.length > 0 ) {
				checkSet = makeArray(set);
			} else {
				prune = false;
			}

			while ( parts.length ) {
				var cur = parts.pop(), pop = cur;

				if ( !Expr.relative[ cur ] ) {
					cur = "";
				} else {
					pop = parts.pop();
				}

				if ( pop == null ) {
					pop = context;
				}

				Expr.relative[ cur ]( checkSet, pop, contextXML );
			}
		} else {
			checkSet = parts = [];
		}
	}

	if ( !checkSet ) {
		checkSet = set;
	}

	if ( !checkSet ) {
		Sizzle.error( cur || selector );
	}

	if ( toString.call(checkSet) === "[object Array]" ) {
		if ( !prune ) {
			results.push.apply( results, checkSet );
		} else if ( context && context.nodeType === 1 ) {
			for ( var i = 0; checkSet[i] != null; i++ ) {
				if ( checkSet[i] && (checkSet[i] === true || checkSet[i].nodeType === 1 && contains(context, checkSet[i])) ) {
					results.push( set[i] );
				}
			}
		} else {
			for ( var i = 0; checkSet[i] != null; i++ ) {
				if ( checkSet[i] && checkSet[i].nodeType === 1 ) {
					results.push( set[i] );
				}
			}
		}
	} else {
		makeArray( checkSet, results );
	}

	if ( extra ) {
		Sizzle( extra, origContext, results, seed );
		Sizzle.uniqueSort( results );
	}

	return results;
};

Sizzle.uniqueSort = function(results){
	if ( sortOrder ) {
		hasDuplicate = baseHasDuplicate;
		results.sort(sortOrder);

		if ( hasDuplicate ) {
			for ( var i = 1; i < results.length; i++ ) {
				if ( results[i] === results[i-1] ) {
					results.splice(i--, 1);
				}
			}
		}
	}

	return results;
};

Sizzle.matches = function(expr, set){
	return Sizzle(expr, null, null, set);
};

Sizzle.find = function(expr, context, isXML){
	var set, match;

	if ( !expr ) {
		return [];
	}

	for ( var i = 0, l = Expr.order.length; i < l; i++ ) {
		var type = Expr.order[i], match;
		
		if ( (match = Expr.leftMatch[ type ].exec( expr )) ) {
			var left = match[1];
			match.splice(1,1);

			if ( left.substr( left.length - 1 ) !== "\\" ) {
				match[1] = (match[1] || "").replace(/\\/g, "");
				set = Expr.find[ type ]( match, context, isXML );
				if ( set != null ) {
					expr = expr.replace( Expr.match[ type ], "" );
					break;
				}
			}
		}
	}

	if ( !set ) {
		set = context.getElementsByTagName("*");
	}

	return {set: set, expr: expr};
};

Sizzle.filter = function(expr, set, inplace, not){
	var old = expr, result = [], curLoop = set, match, anyFound,
		isXMLFilter = set && set[0] && isXML(set[0]);

	while ( expr && set.length ) {
		for ( var type in Expr.filter ) {
			if ( (match = Expr.leftMatch[ type ].exec( expr )) != null && match[2] ) {
				var filter = Expr.filter[ type ], found, item, left = match[1];
				anyFound = false;

				match.splice(1,1);

				if ( left.substr( left.length - 1 ) === "\\" ) {
					continue;
				}

				if ( curLoop === result ) {
					result = [];
				}

				if ( Expr.preFilter[ type ] ) {
					match = Expr.preFilter[ type ]( match, curLoop, inplace, result, not, isXMLFilter );

					if ( !match ) {
						anyFound = found = true;
					} else if ( match === true ) {
						continue;
					}
				}

				if ( match ) {
					for ( var i = 0; (item = curLoop[i]) != null; i++ ) {
						if ( item ) {
							found = filter( item, match, i, curLoop );
							var pass = not ^ !!found;

							if ( inplace && found != null ) {
								if ( pass ) {
									anyFound = true;
								} else {
									curLoop[i] = false;
								}
							} else if ( pass ) {
								result.push( item );
								anyFound = true;
							}
						}
					}
				}

				if ( found !== undefined ) {
					if ( !inplace ) {
						curLoop = result;
					}

					expr = expr.replace( Expr.match[ type ], "" );

					if ( !anyFound ) {
						return [];
					}

					break;
				}
			}
		}

		// Improper expression
		if ( expr === old ) {
			if ( anyFound == null ) {
				Sizzle.error( expr );
			} else {
				break;
			}
		}

		old = expr;
	}

	return curLoop;
};

Sizzle.error = function( msg ) {
	throw "Syntax error, unrecognized expression: " + msg;
};

var Expr = Sizzle.selectors = {
	order: [ "ID", "NAME", "TAG" ],
	match: {
		ID: /#((?:[\w\u00c0-\uFFFF-]|\\.)+)/,
		CLASS: /\.((?:[\w\u00c0-\uFFFF-]|\\.)+)/,
		NAME: /\[name=['"]*((?:[\w\u00c0-\uFFFF-]|\\.)+)['"]*\]/,
		ATTR: /\[\s*((?:[\w\u00c0-\uFFFF-]|\\.)+)\s*(?:(\S?=)\s*(['"]*)(.*?)\3|)\s*\]/,
		TAG: /^((?:[\w\u00c0-\uFFFF\*-]|\\.)+)/,
		CHILD: /:(only|nth|last|first)-child(?:\((even|odd|[\dn+-]*)\))?/,
		POS: /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^-]|$)/,
		PSEUDO: /:((?:[\w\u00c0-\uFFFF-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/
	},
	leftMatch: {},
	attrMap: {
		"class": "className",
		"for": "htmlFor"
	},
	attrHandle: {
		href: function(elem){
			return elem.getAttribute("href");
		}
	},
	relative: {
		"+": function(checkSet, part){
			var isPartStr = typeof part === "string",
				isTag = isPartStr && !/\W/.test(part),
				isPartStrNotTag = isPartStr && !isTag;

			if ( isTag ) {
				part = part.toLowerCase();
			}

			for ( var i = 0, l = checkSet.length, elem; i < l; i++ ) {
				if ( (elem = checkSet[i]) ) {
					while ( (elem = elem.previousSibling) && elem.nodeType !== 1 ) {}

					checkSet[i] = isPartStrNotTag || elem && elem.nodeName.toLowerCase() === part ?
						elem || false :
						elem === part;
				}
			}

			if ( isPartStrNotTag ) {
				Sizzle.filter( part, checkSet, true );
			}
		},
		">": function(checkSet, part){
			var isPartStr = typeof part === "string";

			if ( isPartStr && !/\W/.test(part) ) {
				part = part.toLowerCase();

				for ( var i = 0, l = checkSet.length; i < l; i++ ) {
					var elem = checkSet[i];
					if ( elem ) {
						var parent = elem.parentNode;
						checkSet[i] = parent.nodeName.toLowerCase() === part ? parent : false;
					}
				}
			} else {
				for ( var i = 0, l = checkSet.length; i < l; i++ ) {
					var elem = checkSet[i];
					if ( elem ) {
						checkSet[i] = isPartStr ?
							elem.parentNode :
							elem.parentNode === part;
					}
				}

				if ( isPartStr ) {
					Sizzle.filter( part, checkSet, true );
				}
			}
		},
		"": function(checkSet, part, isXML){
			var doneName = done++, checkFn = dirCheck;

			if ( typeof part === "string" && !/\W/.test(part) ) {
				var nodeCheck = part = part.toLowerCase();
				checkFn = dirNodeCheck;
			}

			checkFn("parentNode", part, doneName, checkSet, nodeCheck, isXML);
		},
		"~": function(checkSet, part, isXML){
			var doneName = done++, checkFn = dirCheck;

			if ( typeof part === "string" && !/\W/.test(part) ) {
				var nodeCheck = part = part.toLowerCase();
				checkFn = dirNodeCheck;
			}

			checkFn("previousSibling", part, doneName, checkSet, nodeCheck, isXML);
		}
	},
	find: {
		ID: function(match, context, isXML){
			if ( typeof context.getElementById !== "undefined" && !isXML ) {
				var m = context.getElementById(match[1]);
				return m ? [m] : [];
			}
		},
		NAME: function(match, context){
			if ( typeof context.getElementsByName !== "undefined" ) {
				var ret = [], results = context.getElementsByName(match[1]);

				for ( var i = 0, l = results.length; i < l; i++ ) {
					if ( results[i].getAttribute("name") === match[1] ) {
						ret.push( results[i] );
					}
				}

				return ret.length === 0 ? null : ret;
			}
		},
		TAG: function(match, context){
			return context.getElementsByTagName(match[1]);
		}
	},
	preFilter: {
		CLASS: function(match, curLoop, inplace, result, not, isXML){
			match = " " + match[1].replace(/\\/g, "") + " ";

			if ( isXML ) {
				return match;
			}

			for ( var i = 0, elem; (elem = curLoop[i]) != null; i++ ) {
				if ( elem ) {
					if ( not ^ (elem.className && (" " + elem.className + " ").replace(/[\t\n]/g, " ").indexOf(match) >= 0) ) {
						if ( !inplace ) {
							result.push( elem );
						}
					} else if ( inplace ) {
						curLoop[i] = false;
					}
				}
			}

			return false;
		},
		ID: function(match){
			return match[1].replace(/\\/g, "");
		},
		TAG: function(match, curLoop){
			return match[1].toLowerCase();
		},
		CHILD: function(match){
			if ( match[1] === "nth" ) {
				// parse equations like 'even', 'odd', '5', '2n', '3n+2', '4n-1', '-n+6'
				var test = /(-?)(\d*)n((?:\+|-)?\d*)/.exec(
					match[2] === "even" && "2n" || match[2] === "odd" && "2n+1" ||
					!/\D/.test( match[2] ) && "0n+" + match[2] || match[2]);

				// calculate the numbers (first)n+(last) including if they are negative
				match[2] = (test[1] + (test[2] || 1)) - 0;
				match[3] = test[3] - 0;
			}

			// TODO: Move to normal caching system
			match[0] = done++;

			return match;
		},
		ATTR: function(match, curLoop, inplace, result, not, isXML){
			var name = match[1].replace(/\\/g, "");
			
			if ( !isXML && Expr.attrMap[name] ) {
				match[1] = Expr.attrMap[name];
			}

			if ( match[2] === "~=" ) {
				match[4] = " " + match[4] + " ";
			}

			return match;
		},
		PSEUDO: function(match, curLoop, inplace, result, not){
			if ( match[1] === "not" ) {
				// If we're dealing with a complex expression, or a simple one
				if ( ( chunker.exec(match[3]) || "" ).length > 1 || /^\w/.test(match[3]) ) {
					match[3] = Sizzle(match[3], null, null, curLoop);
				} else {
					var ret = Sizzle.filter(match[3], curLoop, inplace, true ^ not);
					if ( !inplace ) {
						result.push.apply( result, ret );
					}
					return false;
				}
			} else if ( Expr.match.POS.test( match[0] ) || Expr.match.CHILD.test( match[0] ) ) {
				return true;
			}
			
			return match;
		},
		POS: function(match){
			match.unshift( true );
			return match;
		}
	},
	filters: {
		enabled: function(elem){
			return elem.disabled === false && elem.type !== "hidden";
		},
		disabled: function(elem){
			return elem.disabled === true;
		},
		checked: function(elem){
			return elem.checked === true;
		},
		selected: function(elem){
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			elem.parentNode.selectedIndex;
			return elem.selected === true;
		},
		parent: function(elem){
			return !!elem.firstChild;
		},
		empty: function(elem){
			return !elem.firstChild;
		},
		has: function(elem, i, match){
			return !!Sizzle( match[3], elem ).length;
		},
		header: function(elem){
			return /h\d/i.test( elem.nodeName );
		},
		text: function(elem){
			return "text" === elem.type;
		},
		radio: function(elem){
			return "radio" === elem.type;
		},
		checkbox: function(elem){
			return "checkbox" === elem.type;
		},
		file: function(elem){
			return "file" === elem.type;
		},
		password: function(elem){
			return "password" === elem.type;
		},
		submit: function(elem){
			return "submit" === elem.type;
		},
		image: function(elem){
			return "image" === elem.type;
		},
		reset: function(elem){
			return "reset" === elem.type;
		},
		button: function(elem){
			return "button" === elem.type || elem.nodeName.toLowerCase() === "button";
		},
		input: function(elem){
			return /input|select|textarea|button/i.test(elem.nodeName);
		}
	},
	setFilters: {
		first: function(elem, i){
			return i === 0;
		},
		last: function(elem, i, match, array){
			return i === array.length - 1;
		},
		even: function(elem, i){
			return i % 2 === 0;
		},
		odd: function(elem, i){
			return i % 2 === 1;
		},
		lt: function(elem, i, match){
			return i < match[3] - 0;
		},
		gt: function(elem, i, match){
			return i > match[3] - 0;
		},
		nth: function(elem, i, match){
			return match[3] - 0 === i;
		},
		eq: function(elem, i, match){
			return match[3] - 0 === i;
		}
	},
	filter: {
		PSEUDO: function(elem, match, i, array){
			var name = match[1], filter = Expr.filters[ name ];

			if ( filter ) {
				return filter( elem, i, match, array );
			} else if ( name === "contains" ) {
				return (elem.textContent || elem.innerText || getText([ elem ]) || "").indexOf(match[3]) >= 0;
			} else if ( name === "not" ) {
				var not = match[3];

				for ( var i = 0, l = not.length; i < l; i++ ) {
					if ( not[i] === elem ) {
						return false;
					}
				}

				return true;
			} else {
				Sizzle.error( "Syntax error, unrecognized expression: " + name );
			}
		},
		CHILD: function(elem, match){
			var type = match[1], node = elem;
			switch (type) {
				case 'only':
				case 'first':
					while ( (node = node.previousSibling) )	 {
						if ( node.nodeType === 1 ) { 
							return false; 
						}
					}
					if ( type === "first" ) { 
						return true; 
					}
					node = elem;
				case 'last':
					while ( (node = node.nextSibling) )	 {
						if ( node.nodeType === 1 ) { 
							return false; 
						}
					}
					return true;
				case 'nth':
					var first = match[2], last = match[3];

					if ( first === 1 && last === 0 ) {
						return true;
					}
					
					var doneName = match[0],
						parent = elem.parentNode;
	
					if ( parent && (parent.sizcache !== doneName || !elem.nodeIndex) ) {
						var count = 0;
						for ( node = parent.firstChild; node; node = node.nextSibling ) {
							if ( node.nodeType === 1 ) {
								node.nodeIndex = ++count;
							}
						} 
						parent.sizcache = doneName;
					}
					
					var diff = elem.nodeIndex - last;
					if ( first === 0 ) {
						return diff === 0;
					} else {
						return ( diff % first === 0 && diff / first >= 0 );
					}
			}
		},
		ID: function(elem, match){
			return elem.nodeType === 1 && elem.getAttribute("id") === match;
		},
		TAG: function(elem, match){
			return (match === "*" && elem.nodeType === 1) || elem.nodeName.toLowerCase() === match;
		},
		CLASS: function(elem, match){
			return (" " + (elem.className || elem.getAttribute("class")) + " ")
				.indexOf( match ) > -1;
		},
		ATTR: function(elem, match){
			var name = match[1],
				result = Expr.attrHandle[ name ] ?
					Expr.attrHandle[ name ]( elem ) :
					elem[ name ] != null ?
						elem[ name ] :
						elem.getAttribute( name ),
				value = result + "",
				type = match[2],
				check = match[4];

			return result == null ?
				type === "!=" :
				type === "=" ?
				value === check :
				type === "*=" ?
				value.indexOf(check) >= 0 :
				type === "~=" ?
				(" " + value + " ").indexOf(check) >= 0 :
				!check ?
				value && result !== false :
				type === "!=" ?
				value !== check :
				type === "^=" ?
				value.indexOf(check) === 0 :
				type === "$=" ?
				value.substr(value.length - check.length) === check :
				type === "|=" ?
				value === check || value.substr(0, check.length + 1) === check + "-" :
				false;
		},
		POS: function(elem, match, i, array){
			var name = match[2], filter = Expr.setFilters[ name ];

			if ( filter ) {
				return filter( elem, i, match, array );
			}
		}
	}
};

var origPOS = Expr.match.POS;

for ( var type in Expr.match ) {
	Expr.match[ type ] = new RegExp( Expr.match[ type ].source + /(?![^\[]*\])(?![^\(]*\))/.source );
	Expr.leftMatch[ type ] = new RegExp( /(^(?:.|\r|\n)*?)/.source + Expr.match[ type ].source.replace(/\\(\d+)/g, function(all, num){
		return "\\" + (num - 0 + 1);
	}));
}

var makeArray = function(array, results) {
	array = Array.prototype.slice.call( array, 0 );

	if ( results ) {
		results.push.apply( results, array );
		return results;
	}
	
	return array;
};

// Perform a simple check to determine if the browser is capable of
// converting a NodeList to an array using builtin methods.
// Also verifies that the returned array holds DOM nodes
// (which is not the case in the Blackberry browser)
try {
	Array.prototype.slice.call( document.documentElement.childNodes, 0 )[0].nodeType;

// Provide a fallback method if it does not work
} catch(e){
	makeArray = function(array, results) {
		var ret = results || [];

		if ( toString.call(array) === "[object Array]" ) {
			Array.prototype.push.apply( ret, array );
		} else {
			if ( typeof array.length === "number" ) {
				for ( var i = 0, l = array.length; i < l; i++ ) {
					ret.push( array[i] );
				}
			} else {
				for ( var i = 0; array[i]; i++ ) {
					ret.push( array[i] );
				}
			}
		}

		return ret;
	};
}

var sortOrder;

if ( document.documentElement.compareDocumentPosition ) {
	sortOrder = function( a, b ) {
		if ( !a.compareDocumentPosition || !b.compareDocumentPosition ) {
			if ( a == b ) {
				hasDuplicate = true;
			}
			return a.compareDocumentPosition ? -1 : 1;
		}

		var ret = a.compareDocumentPosition(b) & 4 ? -1 : a === b ? 0 : 1;
		if ( ret === 0 ) {
			hasDuplicate = true;
		}
		return ret;
	};
} else if ( "sourceIndex" in document.documentElement ) {
	sortOrder = function( a, b ) {
		if ( !a.sourceIndex || !b.sourceIndex ) {
			if ( a == b ) {
				hasDuplicate = true;
			}
			return a.sourceIndex ? -1 : 1;
		}

		var ret = a.sourceIndex - b.sourceIndex;
		if ( ret === 0 ) {
			hasDuplicate = true;
		}
		return ret;
	};
} else if ( document.createRange ) {
	sortOrder = function( a, b ) {
		if ( !a.ownerDocument || !b.ownerDocument ) {
			if ( a == b ) {
				hasDuplicate = true;
			}
			return a.ownerDocument ? -1 : 1;
		}

		var aRange = a.ownerDocument.createRange(), bRange = b.ownerDocument.createRange();
		aRange.setStart(a, 0);
		aRange.setEnd(a, 0);
		bRange.setStart(b, 0);
		bRange.setEnd(b, 0);
		var ret = aRange.compareBoundaryPoints(Range.START_TO_END, bRange);
		if ( ret === 0 ) {
			hasDuplicate = true;
		}
		return ret;
	};
}

// Utility function for retreiving the text value of an array of DOM nodes
function getText( elems ) {
	var ret = "", elem;

	for ( var i = 0; elems[i]; i++ ) {
		elem = elems[i];

		// Get the text from text nodes and CDATA nodes
		if ( elem.nodeType === 3 || elem.nodeType === 4 ) {
			ret += elem.nodeValue;

		// Traverse everything else, except comment nodes
		} else if ( elem.nodeType !== 8 ) {
			ret += getText( elem.childNodes );
		}
	}

	return ret;
}

// Check to see if the browser returns elements by name when
// querying by getElementById (and provide a workaround)
(function(){
	// We're going to inject a fake input element with a specified name
	var form = document.createElement("div"),
		id = "script" + (new Date).getTime();
	form.innerHTML = "<a name='" + id + "'/>";

	// Inject it into the root element, check its status, and remove it quickly
	var root = document.documentElement;
	root.insertBefore( form, root.firstChild );

	// The workaround has to do additional checks after a getElementById
	// Which slows things down for other browsers (hence the branching)
	if ( document.getElementById( id ) ) {
		Expr.find.ID = function(match, context, isXML){
			if ( typeof context.getElementById !== "undefined" && !isXML ) {
				var m = context.getElementById(match[1]);
				return m ? m.id === match[1] || typeof m.getAttributeNode !== "undefined" && m.getAttributeNode("id").nodeValue === match[1] ? [m] : undefined : [];
			}
		};

		Expr.filter.ID = function(elem, match){
			var node = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");
			return elem.nodeType === 1 && node && node.nodeValue === match;
		};
	}

	root.removeChild( form );
	root = form = null; // release memory in IE
})();

(function(){
	// Check to see if the browser returns only elements
	// when doing getElementsByTagName("*")

	// Create a fake element
	var div = document.createElement("div");
	div.appendChild( document.createComment("") );

	// Make sure no comments are found
	if ( div.getElementsByTagName("*").length > 0 ) {
		Expr.find.TAG = function(match, context){
			var results = context.getElementsByTagName(match[1]);

			// Filter out possible comments
			if ( match[1] === "*" ) {
				var tmp = [];

				for ( var i = 0; results[i]; i++ ) {
					if ( results[i].nodeType === 1 ) {
						tmp.push( results[i] );
					}
				}

				results = tmp;
			}

			return results;
		};
	}

	// Check to see if an attribute returns normalized href attributes
	div.innerHTML = "<a href='#'></a>";
	if ( div.firstChild && typeof div.firstChild.getAttribute !== "undefined" &&
			div.firstChild.getAttribute("href") !== "#" ) {
		Expr.attrHandle.href = function(elem){
			return elem.getAttribute("href", 2);
		};
	}

	div = null; // release memory in IE
})();

if ( document.querySelectorAll ) {
	(function(){
		var oldSizzle = Sizzle, div = document.createElement("div");
		div.innerHTML = "<p class='TEST'></p>";

		// Safari can't handle uppercase or unicode characters when
		// in quirks mode.
		if ( div.querySelectorAll && div.querySelectorAll(".TEST").length === 0 ) {
			return;
		}
	
		Sizzle = function(query, context, extra, seed){
			context = context || document;

			// Only use querySelectorAll on non-XML documents
			// (ID selectors don't work in non-HTML documents)
			if ( !seed && context.nodeType === 9 && !isXML(context) ) {
				try {
					return makeArray( context.querySelectorAll(query), extra );
				} catch(e){}
			}
		
			return oldSizzle(query, context, extra, seed);
		};

		for ( var prop in oldSizzle ) {
			Sizzle[ prop ] = oldSizzle[ prop ];
		}

		div = null; // release memory in IE
	})();
}

(function(){
	var div = document.createElement("div");

	div.innerHTML = "<div class='test e'></div><div class='test'></div>";

	// Opera can't find a second classname (in 9.6)
	// Also, make sure that getElementsByClassName actually exists
	if ( !div.getElementsByClassName || div.getElementsByClassName("e").length === 0 ) {
		return;
	}

	// Safari caches class attributes, doesn't catch changes (in 3.2)
	div.lastChild.className = "e";

	if ( div.getElementsByClassName("e").length === 1 ) {
		return;
	}
	
	Expr.order.splice(1, 0, "CLASS");
	Expr.find.CLASS = function(match, context, isXML) {
		if ( typeof context.getElementsByClassName !== "undefined" && !isXML ) {
			return context.getElementsByClassName(match[1]);
		}
	};

	div = null; // release memory in IE
})();

function dirNodeCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
	for ( var i = 0, l = checkSet.length; i < l; i++ ) {
		var elem = checkSet[i];
		if ( elem ) {
			elem = elem[dir];
			var match = false;

			while ( elem ) {
				if ( elem.sizcache === doneName ) {
					match = checkSet[elem.sizset];
					break;
				}

				if ( elem.nodeType === 1 && !isXML ){
					elem.sizcache = doneName;
					elem.sizset = i;
				}

				if ( elem.nodeName.toLowerCase() === cur ) {
					match = elem;
					break;
				}

				elem = elem[dir];
			}

			checkSet[i] = match;
		}
	}
}

function dirCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
	for ( var i = 0, l = checkSet.length; i < l; i++ ) {
		var elem = checkSet[i];
		if ( elem ) {
			elem = elem[dir];
			var match = false;

			while ( elem ) {
				if ( elem.sizcache === doneName ) {
					match = checkSet[elem.sizset];
					break;
				}

				if ( elem.nodeType === 1 ) {
					if ( !isXML ) {
						elem.sizcache = doneName;
						elem.sizset = i;
					}
					if ( typeof cur !== "string" ) {
						if ( elem === cur ) {
							match = true;
							break;
						}

					} else if ( Sizzle.filter( cur, [elem] ).length > 0 ) {
						match = elem;
						break;
					}
				}

				elem = elem[dir];
			}

			checkSet[i] = match;
		}
	}
}

var contains = document.compareDocumentPosition ? function(a, b){
	return !!(a.compareDocumentPosition(b) & 16);
} : function(a, b){
	return a !== b && (a.contains ? a.contains(b) : true);
};

var isXML = function(elem){
	// documentElement is verified for cases where it doesn't yet exist
	// (such as loading iframes in IE - #4833) 
	var documentElement = (elem ? elem.ownerDocument || elem : 0).documentElement;
	return documentElement ? documentElement.nodeName !== "HTML" : false;
};

var posProcess = function(selector, context){
	var tmpSet = [], later = "", match,
		root = context.nodeType ? [context] : context;

	// Position selectors must be done after the filter
	// And so must :not(positional) so we move all PSEUDOs to the end
	while ( (match = Expr.match.PSEUDO.exec( selector )) ) {
		later += match[0];
		selector = selector.replace( Expr.match.PSEUDO, "" );
	}

	selector = Expr.relative[selector] ? selector + "*" : selector;

	for ( var i = 0, l = root.length; i < l; i++ ) {
		Sizzle( selector, root[i], tmpSet );
	}

	return Sizzle.filter( later, tmpSet );
};

// EXPOSE
jQuery.find = Sizzle;
jQuery.expr = Sizzle.selectors;
jQuery.expr[":"] = jQuery.expr.filters;
jQuery.unique = Sizzle.uniqueSort;
jQuery.text = getText;
jQuery.isXMLDoc = isXML;
jQuery.contains = contains;

return;

window.Sizzle = Sizzle;

})();
var runtil = /Until$/,
	rparentsprev = /^(?:parents|prevUntil|prevAll)/,
	// Note: This RegExp should be improved, or likely pulled from Sizzle
	rmultiselector = /,/,
	slice = Array.prototype.slice;

// Implement the identical functionality for filter and not
var winnow = function( elements, qualifier, keep ) {
	if ( jQuery.isFunction( qualifier ) ) {
		return jQuery.grep(elements, function( elem, i ) {
			return !!qualifier.call( elem, i, elem ) === keep;
		});

	} else if ( qualifier.nodeType ) {
		return jQuery.grep(elements, function( elem, i ) {
			return (elem === qualifier) === keep;
		});

	} else if ( typeof qualifier === "string" ) {
		var filtered = jQuery.grep(elements, function( elem ) {
			return elem.nodeType === 1;
		});

		if ( isSimple.test( qualifier ) ) {
			return jQuery.filter(qualifier, filtered, !keep);
		} else {
			qualifier = jQuery.filter( qualifier, filtered );
		}
	}

	return jQuery.grep(elements, function( elem, i ) {
		return (jQuery.inArray( elem, qualifier ) >= 0) === keep;
	});
};

jQuery.fn.extend({
	find: function( selector ) {
		var ret = this.pushStack( "", "find", selector ), length = 0;

		for ( var i = 0, l = this.length; i < l; i++ ) {
			length = ret.length;
			jQuery.find( selector, this[i], ret );

			if ( i > 0 ) {
				// Make sure that the results are unique
				for ( var n = length; n < ret.length; n++ ) {
					for ( var r = 0; r < length; r++ ) {
						if ( ret[r] === ret[n] ) {
							ret.splice(n--, 1);
							break;
						}
					}
				}
			}
		}

		return ret;
	},

	has: function( target ) {
		var targets = jQuery( target );
		return this.filter(function() {
			for ( var i = 0, l = targets.length; i < l; i++ ) {
				if ( jQuery.contains( this, targets[i] ) ) {
					return true;
				}
			}
		});
	},

	not: function( selector ) {
		return this.pushStack( winnow(this, selector, false), "not", selector);
	},

	filter: function( selector ) {
		return this.pushStack( winnow(this, selector, true), "filter", selector );
	},
	
	is: function( selector ) {
		return !!selector && jQuery.filter( selector, this ).length > 0;
	},

	closest: function( selectors, context ) {
		if ( jQuery.isArray( selectors ) ) {
			var ret = [], cur = this[0], match, matches = {}, selector;

			if ( cur && selectors.length ) {
				for ( var i = 0, l = selectors.length; i < l; i++ ) {
					selector = selectors[i];

					if ( !matches[selector] ) {
						matches[selector] = jQuery.expr.match.POS.test( selector ) ? 
							jQuery( selector, context || this.context ) :
							selector;
					}
				}

				while ( cur && cur.ownerDocument && cur !== context ) {
					for ( selector in matches ) {
						match = matches[selector];

						if ( match.jquery ? match.index(cur) > -1 : jQuery(cur).is(match) ) {
							ret.push({ selector: selector, elem: cur });
							delete matches[selector];
						}
					}
					cur = cur.parentNode;
				}
			}

			return ret;
		}

		var pos = jQuery.expr.match.POS.test( selectors ) ? 
			jQuery( selectors, context || this.context ) : null;

		return this.map(function( i, cur ) {
			while ( cur && cur.ownerDocument && cur !== context ) {
				if ( pos ? pos.index(cur) > -1 : jQuery(cur).is(selectors) ) {
					return cur;
				}
				cur = cur.parentNode;
			}
			return null;
		});
	},
	
	// Determine the position of an element within
	// the matched set of elements
	index: function( elem ) {
		if ( !elem || typeof elem === "string" ) {
			return jQuery.inArray( this[0],
				// If it receives a string, the selector is used
				// If it receives nothing, the siblings are used
				elem ? jQuery( elem ) : this.parent().children() );
		}
		// Locate the position of the desired element
		return jQuery.inArray(
			// If it receives a jQuery object, the first element is used
			elem.jquery ? elem[0] : elem, this );
	},

	add: function( selector, context ) {
		var set = typeof selector === "string" ?
				jQuery( selector, context || this.context ) :
				jQuery.makeArray( selector ),
			all = jQuery.merge( this.get(), set );

		return this.pushStack( isDisconnected( set[0] ) || isDisconnected( all[0] ) ?
			all :
			jQuery.unique( all ) );
	},

	andSelf: function() {
		return this.add( this.prevObject );
	}
});

// A painfully simple check to see if an element is disconnected
// from a document (should be improved, where feasible).
function isDisconnected( node ) {
	return !node || !node.parentNode || node.parentNode.nodeType === 11;
}

jQuery.each({
	parent: function( elem ) {
		var parent = elem.parentNode;
		return parent && parent.nodeType !== 11 ? parent : null;
	},
	parents: function( elem ) {
		return jQuery.dir( elem, "parentNode" );
	},
	parentsUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "parentNode", until );
	},
	next: function( elem ) {
		return jQuery.nth( elem, 2, "nextSibling" );
	},
	prev: function( elem ) {
		return jQuery.nth( elem, 2, "previousSibling" );
	},
	nextAll: function( elem ) {
		return jQuery.dir( elem, "nextSibling" );
	},
	prevAll: function( elem ) {
		return jQuery.dir( elem, "previousSibling" );
	},
	nextUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "nextSibling", until );
	},
	prevUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "previousSibling", until );
	},
	siblings: function( elem ) {
		return jQuery.sibling( elem.parentNode.firstChild, elem );
	},
	children: function( elem ) {
		return jQuery.sibling( elem.firstChild );
	},
	contents: function( elem ) {
		return jQuery.nodeName( elem, "iframe" ) ?
			elem.contentDocument || elem.contentWindow.document :
			jQuery.makeArray( elem.childNodes );
	}
}, function( name, fn ) {
	jQuery.fn[ name ] = function( until, selector ) {
		var ret = jQuery.map( this, fn, until );
		
		if ( !runtil.test( name ) ) {
			selector = until;
		}

		if ( selector && typeof selector === "string" ) {
			ret = jQuery.filter( selector, ret );
		}

		ret = this.length > 1 ? jQuery.unique( ret ) : ret;

		if ( (this.length > 1 || rmultiselector.test( selector )) && rparentsprev.test( name ) ) {
			ret = ret.reverse();
		}

		return this.pushStack( ret, name, slice.call(arguments).join(",") );
	};
});

jQuery.extend({
	filter: function( expr, elems, not ) {
		if ( not ) {
			expr = ":not(" + expr + ")";
		}

		return jQuery.find.matches(expr, elems);
	},
	
	dir: function( elem, dir, until ) {
		var matched = [], cur = elem[dir];
		while ( cur && cur.nodeType !== 9 && (until === undefined || cur.nodeType !== 1 || !jQuery( cur ).is( until )) ) {
			if ( cur.nodeType === 1 ) {
				matched.push( cur );
			}
			cur = cur[dir];
		}
		return matched;
	},

	nth: function( cur, result, dir, elem ) {
		result = result || 1;
		var num = 0;

		for ( ; cur; cur = cur[dir] ) {
			if ( cur.nodeType === 1 && ++num === result ) {
				break;
			}
		}

		return cur;
	},

	sibling: function( n, elem ) {
		var r = [];

		for ( ; n; n = n.nextSibling ) {
			if ( n.nodeType === 1 && n !== elem ) {
				r.push( n );
			}
		}

		return r;
	}
});
var rinlinejQuery = / jQuery\d+="(?:\d+|null)"/g,
	rleadingWhitespace = /^\s+/,
	rxhtmlTag = /(<([\w:]+)[^>]*?)\/>/g,
	rselfClosing = /^(?:area|br|col|embed|hr|img|input|link|meta|param)$/i,
	rtagName = /<([\w:]+)/,
	rtbody = /<tbody/i,
	rhtml = /<|&#?\w+;/,
	rnocache = /<script|<object|<embed|<option|<style/i,
	rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,  // checked="checked" or checked (html5)
	fcloseTag = function( all, front, tag ) {
		return rselfClosing.test( tag ) ?
			all :
			front + "></" + tag + ">";
	},
	wrapMap = {
		option: [ 1, "<select multiple='multiple'>", "</select>" ],
		legend: [ 1, "<fieldset>", "</fieldset>" ],
		thead: [ 1, "<table>", "</table>" ],
		tr: [ 2, "<table><tbody>", "</tbody></table>" ],
		td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],
		col: [ 2, "<table><tbody></tbody><colgroup>", "</colgroup></table>" ],
		area: [ 1, "<map>", "</map>" ],
		_default: [ 0, "", "" ]
	};

wrapMap.optgroup = wrapMap.option;
wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
wrapMap.th = wrapMap.td;

// IE can't serialize <link> and <script> tags normally
if ( !jQuery.support.htmlSerialize ) {
	wrapMap._default = [ 1, "div<div>", "</div>" ];
}

jQuery.fn.extend({
	text: function( text ) {
		if ( jQuery.isFunction(text) ) {
			return this.each(function(i) {
				var self = jQuery(this);
				self.text( text.call(this, i, self.text()) );
			});
		}

		if ( typeof text !== "object" && text !== undefined ) {
			return this.empty().append( (this[0] && this[0].ownerDocument || document).createTextNode( text ) );
		}

		return jQuery.text( this );
	},

	wrapAll: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each(function(i) {
				jQuery(this).wrapAll( html.call(this, i) );
			});
		}

		if ( this[0] ) {
			// The elements to wrap the target around
			var wrap = jQuery( html, this[0].ownerDocument ).eq(0).clone(true);

			if ( this[0].parentNode ) {
				wrap.insertBefore( this[0] );
			}

			wrap.map(function() {
				var elem = this;

				while ( elem.firstChild && elem.firstChild.nodeType === 1 ) {
					elem = elem.firstChild;
				}

				return elem;
			}).append(this);
		}

		return this;
	},

	wrapInner: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each(function(i) {
				jQuery(this).wrapInner( html.call(this, i) );
			});
		}

		return this.each(function() {
			var self = jQuery( this ), contents = self.contents();

			if ( contents.length ) {
				contents.wrapAll( html );

			} else {
				self.append( html );
			}
		});
	},

	wrap: function( html ) {
		return this.each(function() {
			jQuery( this ).wrapAll( html );
		});
	},

	unwrap: function() {
		return this.parent().each(function() {
			if ( !jQuery.nodeName( this, "body" ) ) {
				jQuery( this ).replaceWith( this.childNodes );
			}
		}).end();
	},

	append: function() {
		return this.domManip(arguments, true, function( elem ) {
			if ( this.nodeType === 1 ) {
				this.appendChild( elem );
			}
		});
	},

	prepend: function() {
		return this.domManip(arguments, true, function( elem ) {
			if ( this.nodeType === 1 ) {
				this.insertBefore( elem, this.firstChild );
			}
		});
	},

	before: function() {
		if ( this[0] && this[0].parentNode ) {
			return this.domManip(arguments, false, function( elem ) {
				this.parentNode.insertBefore( elem, this );
			});
		} else if ( arguments.length ) {
			var set = jQuery(arguments[0]);
			set.push.apply( set, this.toArray() );
			return this.pushStack( set, "before", arguments );
		}
	},

	after: function() {
		if ( this[0] && this[0].parentNode ) {
			return this.domManip(arguments, false, function( elem ) {
				this.parentNode.insertBefore( elem, this.nextSibling );
			});
		} else if ( arguments.length ) {
			var set = this.pushStack( this, "after", arguments );
			set.push.apply( set, jQuery(arguments[0]).toArray() );
			return set;
		}
	},
	
	// keepData is for internal use only--do not document
	remove: function( selector, keepData ) {
		for ( var i = 0, elem; (elem = this[i]) != null; i++ ) {
			if ( !selector || jQuery.filter( selector, [ elem ] ).length ) {
				if ( !keepData && elem.nodeType === 1 ) {
					jQuery.cleanData( elem.getElementsByTagName("*") );
					jQuery.cleanData( [ elem ] );
				}

				if ( elem.parentNode ) {
					 elem.parentNode.removeChild( elem );
				}
			}
		}
		
		return this;
	},

	empty: function() {
		for ( var i = 0, elem; (elem = this[i]) != null; i++ ) {
			// Remove element nodes and prevent memory leaks
			if ( elem.nodeType === 1 ) {
				jQuery.cleanData( elem.getElementsByTagName("*") );
			}

			// Remove any remaining nodes
			while ( elem.firstChild ) {
				elem.removeChild( elem.firstChild );
			}
		}
		
		return this;
	},

	clone: function( events ) {
		// Do the clone
		var ret = this.map(function() {
			if ( !jQuery.support.noCloneEvent && !jQuery.isXMLDoc(this) ) {
				// IE copies events bound via attachEvent when
				// using cloneNode. Calling detachEvent on the
				// clone will also remove the events from the orignal
				// In order to get around this, we use innerHTML.
				// Unfortunately, this means some modifications to
				// attributes in IE that are actually only stored
				// as properties will not be copied (such as the
				// the name attribute on an input).
				var html = this.outerHTML, ownerDocument = this.ownerDocument;
				if ( !html ) {
					var div = ownerDocument.createElement("div");
					div.appendChild( this.cloneNode(true) );
					html = div.innerHTML;
				}

				return jQuery.clean([html.replace(rinlinejQuery, "")
					// Handle the case in IE 8 where action=/test/> self-closes a tag
					.replace(/=([^="'>\s]+\/)>/g, '="$1">')
					.replace(rleadingWhitespace, "")], ownerDocument)[0];
			} else {
				return this.cloneNode(true);
			}
		});

		// Copy the events from the original to the clone
		if ( events === true ) {
			cloneCopyEvent( this, ret );
			cloneCopyEvent( this.find("*"), ret.find("*") );
		}

		// Return the cloned set
		return ret;
	},

	html: function( value ) {
		if ( value === undefined ) {
			return this[0] && this[0].nodeType === 1 ?
				this[0].innerHTML.replace(rinlinejQuery, "") :
				null;

		// See if we can take a shortcut and just use innerHTML
		} else if ( typeof value === "string" && !rnocache.test( value ) &&
			(jQuery.support.leadingWhitespace || !rleadingWhitespace.test( value )) &&
			!wrapMap[ (rtagName.exec( value ) || ["", ""])[1].toLowerCase() ] ) {

			value = value.replace(rxhtmlTag, fcloseTag);

			try {
				for ( var i = 0, l = this.length; i < l; i++ ) {
					// Remove element nodes and prevent memory leaks
					if ( this[i].nodeType === 1 ) {
						jQuery.cleanData( this[i].getElementsByTagName("*") );
						this[i].innerHTML = value;
					}
				}

			// If using innerHTML throws an exception, use the fallback method
			} catch(e) {
				this.empty().append( value );
			}

		} else if ( jQuery.isFunction( value ) ) {
			this.each(function(i){
				var self = jQuery(this), old = self.html();
				self.empty().append(function(){
					return value.call( this, i, old );
				});
			});

		} else {
			this.empty().append( value );
		}

		return this;
	},

	replaceWith: function( value ) {
		if ( this[0] && this[0].parentNode ) {
			// Make sure that the elements are removed from the DOM before they are inserted
			// this can help fix replacing a parent with child elements
			if ( jQuery.isFunction( value ) ) {
				return this.each(function(i) {
					var self = jQuery(this), old = self.html();
					self.replaceWith( value.call( this, i, old ) );
				});
			}

			if ( typeof value !== "string" ) {
				value = jQuery(value).detach();
			}

			return this.each(function() {
				var next = this.nextSibling, parent = this.parentNode;

				jQuery(this).remove();

				if ( next ) {
					jQuery(next).before( value );
				} else {
					jQuery(parent).append( value );
				}
			});
		} else {
			return this.pushStack( jQuery(jQuery.isFunction(value) ? value() : value), "replaceWith", value );
		}
	},

	detach: function( selector ) {
		return this.remove( selector, true );
	},

	domManip: function( args, table, callback ) {
		var results, first, value = args[0], scripts = [], fragment, parent;

		// We can't cloneNode fragments that contain checked, in WebKit
		if ( !jQuery.support.checkClone && arguments.length === 3 && typeof value === "string" && rchecked.test( value ) ) {
			return this.each(function() {
				jQuery(this).domManip( args, table, callback, true );
			});
		}

		if ( jQuery.isFunction(value) ) {
			return this.each(function(i) {
				var self = jQuery(this);
				args[0] = value.call(this, i, table ? self.html() : undefined);
				self.domManip( args, table, callback );
			});
		}

		if ( this[0] ) {
			parent = value && value.parentNode;

			// If we're in a fragment, just use that instead of building a new one
			if ( jQuery.support.parentNode && parent && parent.nodeType === 11 && parent.childNodes.length === this.length ) {
				results = { fragment: parent };

			} else {
				results = buildFragment( args, this, scripts );
			}
			
			fragment = results.fragment;
			
			if ( fragment.childNodes.length === 1 ) {
				first = fragment = fragment.firstChild;
			} else {
				first = fragment.firstChild;
			}

			if ( first ) {
				table = table && jQuery.nodeName( first, "tr" );

				for ( var i = 0, l = this.length; i < l; i++ ) {
					callback.call(
						table ?
							root(this[i], first) :
							this[i],
						i > 0 || results.cacheable || this.length > 1  ?
							fragment.cloneNode(true) :
							fragment
					);
				}
			}

			if ( scripts.length ) {
				jQuery.each( scripts, evalScript );
			}
		}

		return this;

		function root( elem, cur ) {
			return jQuery.nodeName(elem, "table") ?
				(elem.getElementsByTagName("tbody")[0] ||
				elem.appendChild(elem.ownerDocument.createElement("tbody"))) :
				elem;
		}
	}
});

function cloneCopyEvent(orig, ret) {
	var i = 0;

	ret.each(function() {
		if ( this.nodeName !== (orig[i] && orig[i].nodeName) ) {
			return;
		}

		var oldData = jQuery.data( orig[i++] ), curData = jQuery.data( this, oldData ), events = oldData && oldData.events;

		if ( events ) {
			delete curData.handle;
			curData.events = {};

			for ( var type in events ) {
				for ( var handler in events[ type ] ) {
					jQuery.event.add( this, type, events[ type ][ handler ], events[ type ][ handler ].data );
				}
			}
		}
	});
}

TIME_IN_BUILDFRAGMENT = 0;
function buildFragment( args, nodes, scripts ) {
    var START = new Date().getTime();
	var fragment, cacheable, cacheresults,
		doc = (nodes && nodes[0] ? nodes[0].ownerDocument || nodes[0] : document);

	// Only cache "small" (1/2 KB) strings that are associated with the main document
	// Cloning options loses the selected state, so don't cache them
	// IE 6 doesn't like it when you put <object> or <embed> elements in a fragment
	// Also, WebKit does not clone 'checked' attributes on cloneNode, so don't cache
	if ( args.length === 1 && typeof args[0] === "string" && args[0].length < 512 && doc === document &&
		!rnocache.test( args[0] ) && (jQuery.support.checkClone || !rchecked.test( args[0] )) ) {

		cacheable = true;
		cacheresults = jQuery.fragments[ args[0] ];
		if ( cacheresults ) {
			if ( cacheresults !== 1 ) {
				fragment = cacheresults;
			}
		}
	}

	if ( !fragment ) {
		fragment = doc.createDocumentFragment();
		jQuery.clean( args, doc, fragment, scripts );
	}

	if ( cacheable ) {
		jQuery.fragments[ args[0] ] = cacheresults ? fragment : 1;
	}
    TIME_IN_BUILDFRAGMENT += (new Date().getTime()-START);
	return { fragment: fragment, cacheable: cacheable };
}

jQuery.fragments = {};

jQuery.each({
	appendTo: "append",
	prependTo: "prepend",
	insertBefore: "before",
	insertAfter: "after",
	replaceAll: "replaceWith"
}, function( name, original ) {
	jQuery.fn[ name ] = function( selector ) {
		var ret = [], insert = jQuery( selector ),
			parent = this.length === 1 && this[0].parentNode;
		
		if ( parent && parent.nodeType === 11 && parent.childNodes.length === 1 && insert.length === 1 ) {
			insert[ original ]( this[0] );
			return this;
			
		} else {
			for ( var i = 0, l = insert.length; i < l; i++ ) {
				var elems = (i > 0 ? this.clone(true) : this).get();
				jQuery.fn[ original ].apply( jQuery(insert[i]), elems );
				ret = ret.concat( elems );
			}
		
			return this.pushStack( ret, name, insert.selector );
		}
	};
});

jQuery.extend({
	clean: function( elems, context, fragment, scripts ) {
		context = context || document;

		// !context.createElement fails in IE with an error but returns typeof 'object'
		if ( typeof context.createElement === "undefined" ) {
			context = context.ownerDocument || context[0] && context[0].ownerDocument || document;
		}

		var ret = [];

		for ( var i = 0, elem; (elem = elems[i]) != null; i++ ) {
			if ( typeof elem === "number" ) {
				elem += "";
			}

			if ( !elem ) {
				continue;
			}

			// Convert html string into DOM nodes
			if ( typeof elem === "string" && !rhtml.test( elem ) ) {
				elem = context.createTextNode( elem );

			} else if ( typeof elem === "string" ) {
				// Fix "XHTML"-style tags in all browsers
				elem = elem.replace(rxhtmlTag, fcloseTag);

				// Trim whitespace, otherwise indexOf won't work as expected
				var tag = (rtagName.exec( elem ) || ["", ""])[1].toLowerCase(),
					wrap = wrapMap[ tag ] || wrapMap._default,
					depth = wrap[0],
					div = context.createElement("div");

				// Go to html and back, then peel off extra wrappers
				div.innerHTML = wrap[1] + elem + wrap[2];

				// Move to the right depth
				while ( depth-- ) {
					div = div.lastChild;
				}

				// Remove IE's autoinserted <tbody> from table fragments
				if ( !jQuery.support.tbody ) {

					// String was a <table>, *may* have spurious <tbody>
					var hasBody = rtbody.test(elem),
						tbody = tag === "table" && !hasBody ?
							div.firstChild && div.firstChild.childNodes :

							// String was a bare <thead> or <tfoot>
							wrap[1] === "<table>" && !hasBody ?
								div.childNodes :
								[];

					for ( var j = tbody.length - 1; j >= 0 ; --j ) {
						if ( jQuery.nodeName( tbody[ j ], "tbody" ) && !tbody[ j ].childNodes.length ) {
							tbody[ j ].parentNode.removeChild( tbody[ j ] );
						}
					}

				}

				// IE completely kills leading whitespace when innerHTML is used
				if ( !jQuery.support.leadingWhitespace && rleadingWhitespace.test( elem ) ) {
					div.insertBefore( context.createTextNode( rleadingWhitespace.exec(elem)[0] ), div.firstChild );
				}

				elem = div.childNodes;
			}

			if ( elem.nodeType ) {
				ret.push( elem );
			} else {
				ret = jQuery.merge( ret, elem );
			}
		}

		if ( fragment ) {
			for ( var i = 0; ret[i]; i++ ) {
				if ( scripts && jQuery.nodeName( ret[i], "script" ) && (!ret[i].type || ret[i].type.toLowerCase() === "text/javascript") ) {
					scripts.push( ret[i].parentNode ? ret[i].parentNode.removeChild( ret[i] ) : ret[i] );
				
				} else {
					if ( ret[i].nodeType === 1 ) {
						ret.splice.apply( ret, [i + 1, 0].concat(jQuery.makeArray(ret[i].getElementsByTagName("script"))) );
					}
					fragment.appendChild( ret[i] );
				}
			}
		}

		return ret;
	},
	
	cleanData: function( elems ) {
		var data, id, cache = jQuery.cache,
			special = jQuery.event.special,
			deleteExpando = jQuery.support.deleteExpando;
		
		for ( var i = 0, elem; (elem = elems[i]) != null; i++ ) {
			id = elem[ jQuery.expando ];
			
			if ( id ) {
				data = cache[ id ];
				
				if ( data.events ) {
					for ( var type in data.events ) {
						if ( special[ type ] ) {
							jQuery.event.remove( elem, type );

						} else {
							removeEvent( elem, type, data.handle );
						}
					}
				}
				
				if ( deleteExpando ) {
					delete elem[ jQuery.expando ];

				} else if ( elem.removeAttribute ) {
					elem.removeAttribute( jQuery.expando );
				}
				
				delete cache[ id ];
			}
		}
	}
});
// exclude the following css properties to add px
var rexclude = /z-?index|font-?weight|opacity|zoom|line-?height/i,
	ralpha = /alpha\([^)]*\)/,
	ropacity = /opacity=([^)]*)/,
	rfloat = /float/i,
	rdashAlpha = /-([a-z])/ig,
	rupper = /([A-Z])/g,
	rnumpx = /^-?\d+(?:px)?$/i,
	rnum = /^-?\d/,

	cssShow = { position: "absolute", visibility: "hidden", display:"block" },
	cssWidth = [ "Left", "Right" ],
	cssHeight = [ "Top", "Bottom" ],

	// cache check for defaultView.getComputedStyle
	getComputedStyle = document.defaultView && document.defaultView.getComputedStyle,
	// normalize float css property
	styleFloat = jQuery.support.cssFloat ? "cssFloat" : "styleFloat",
	fcamelCase = function( all, letter ) {
		return letter.toUpperCase();
	};

jQuery.fn.css = function( name, value ) {
	return access( this, name, value, true, function( elem, name, value ) {
		if ( value === undefined ) {
			return jQuery.curCSS( elem, name );
		}
		
		if ( typeof value === "number" && !rexclude.test(name) ) {
			value += "px";
		}

		jQuery.style( elem, name, value );
	});
};

jQuery.extend({
	style: function( elem, name, value ) {
		// don't set styles on text and comment nodes
		if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 ) {
			return undefined;
		}

		// ignore negative width and height values #1599
		if ( (name === "width" || name === "height") && parseFloat(value) < 0 ) {
			value = undefined;
		}

		var style = elem.style || elem, set = value !== undefined;

		// IE uses filters for opacity
		if ( !jQuery.support.opacity && name === "opacity" ) {
			if ( set ) {
				// IE has trouble with opacity if it does not have layout
				// Force it by setting the zoom level
				style.zoom = 1;

				// Set the alpha filter to set the opacity
				var opacity = parseInt( value, 10 ) + "" === "NaN" ? "" : "alpha(opacity=" + value * 100 + ")";
				var filter = style.filter || jQuery.curCSS( elem, "filter" ) || "";
				style.filter = ralpha.test(filter) ? filter.replace(ralpha, opacity) : opacity;
			}

			return style.filter && style.filter.indexOf("opacity=") >= 0 ?
				(parseFloat( ropacity.exec(style.filter)[1] ) / 100) + "":
				"";
		}

		// Make sure we're using the right name for getting the float value
		if ( rfloat.test( name ) ) {
			name = styleFloat;
		}

		name = name.replace(rdashAlpha, fcamelCase);

		if ( set ) {
			style[ name ] = value;
		}

		return style[ name ];
	},

	css: function( elem, name, force, extra ) {
		if ( name === "width" || name === "height" ) {
			var val, props = cssShow, which = name === "width" ? cssWidth : cssHeight;

			function getWH() {
				val = name === "width" ? elem.offsetWidth : elem.offsetHeight;

				if ( extra === "border" ) {
					return;
				}

				jQuery.each( which, function() {
					if ( !extra ) {
						val -= parseFloat(jQuery.curCSS( elem, "padding" + this, true)) || 0;
					}

					if ( extra === "margin" ) {
						val += parseFloat(jQuery.curCSS( elem, "margin" + this, true)) || 0;
					} else {
						val -= parseFloat(jQuery.curCSS( elem, "border" + this + "Width", true)) || 0;
					}
				});
			}

			if ( elem.offsetWidth !== 0 ) {
				getWH();
			} else {
				jQuery.swap( elem, props, getWH );
			}

			return Math.max(0, Math.round(val));
		}

		return jQuery.curCSS( elem, name, force );
	},

	curCSS: function( elem, name, force ) {
		var ret, style = elem.style, filter;

		// IE uses filters for opacity
		if ( !jQuery.support.opacity && name === "opacity" && elem.currentStyle ) {
			ret = ropacity.test(elem.currentStyle.filter || "") ?
				(parseFloat(RegExp.$1) / 100) + "" :
				"";

			return ret === "" ?
				"1" :
				ret;
		}

		// Make sure we're using the right name for getting the float value
		if ( rfloat.test( name ) ) {
			name = styleFloat;
		}

		if ( !force && style && style[ name ] ) {
			ret = style[ name ];

		} else if ( getComputedStyle ) {

			// Only "float" is needed here
			if ( rfloat.test( name ) ) {
				name = "float";
			}

			name = name.replace( rupper, "-$1" ).toLowerCase();

			var defaultView = elem.ownerDocument.defaultView;

			if ( !defaultView ) {
				return null;
			}

			var computedStyle = defaultView.getComputedStyle( elem, null );

			if ( computedStyle ) {
				ret = computedStyle.getPropertyValue( name );
			}

			// We should always get a number back from opacity
			if ( name === "opacity" && ret === "" ) {
				ret = "1";
			}

		} else if ( elem.currentStyle ) {
			var camelCase = name.replace(rdashAlpha, fcamelCase);

			ret = elem.currentStyle[ name ] || elem.currentStyle[ camelCase ];

			// From the awesome hack by Dean Edwards
			// http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291

			// If we're not dealing with a regular pixel number
			// but a number that has a weird ending, we need to convert it to pixels
			if ( !rnumpx.test( ret ) && rnum.test( ret ) ) {
				// Remember the original values
				var left = style.left, rsLeft = elem.runtimeStyle.left;

				// Put in the new values to get a computed value out
				elem.runtimeStyle.left = elem.currentStyle.left;
				style.left = camelCase === "fontSize" ? "1em" : (ret || 0);
				ret = style.pixelLeft + "px";

				// Revert the changed values
				style.left = left;
				elem.runtimeStyle.left = rsLeft;
			}
		}

		return ret;
	},

	// A method for quickly swapping in/out CSS properties to get correct calculations
	swap: function( elem, options, callback ) {
		var old = {};

		// Remember the old values, and insert the new ones
		for ( var name in options ) {
			old[ name ] = elem.style[ name ];
			elem.style[ name ] = options[ name ];
		}

		callback.call( elem );

		// Revert the old values
		for ( var name in options ) {
			elem.style[ name ] = old[ name ];
		}
	}
});

if ( jQuery.expr && jQuery.expr.filters ) {
	jQuery.expr.filters.hidden = function( elem ) {
		var width = elem.offsetWidth, height = elem.offsetHeight,
			skip = elem.nodeName.toLowerCase() === "tr";

		return width === 0 && height === 0 && !skip ?
			true :
			width > 0 && height > 0 && !skip ?
				false :
				jQuery.curCSS(elem, "display") === "none";
	};

	jQuery.expr.filters.visible = function( elem ) {
		return !jQuery.expr.filters.hidden( elem );
	};
}
var jsc = now(),
	rscript = /<script(.|\s)*?\/script>/gi,
	rselectTextarea = /select|textarea/i,
	rinput = /color|date|datetime|email|hidden|month|number|password|range|search|tel|text|time|url|week/i,
	jsre = /=\?(&|$)/,
	rquery = /\?/,
	rts = /(\?|&)_=.*?(&|$)/,
	rurl = /^(\w+:)?\/\/([^\/?#]+)/,
	r20 = /%20/g,

	// Keep a copy of the old load method
	_load = jQuery.fn.load;

jQuery.fn.extend({
	load: function( url, params, callback ) {
		if ( typeof url !== "string" ) {
			return _load.call( this, url );

		// Don't do a request if no elements are being requested
		} else if ( !this.length ) {
			return this;
		}

		var off = url.indexOf(" ");
		if ( off >= 0 ) {
			var selector = url.slice(off, url.length);
			url = url.slice(0, off);
		}

		// Default to a GET request
		var type = "GET";

		// If the second parameter was provided
		if ( params ) {
			// If it's a function
			if ( jQuery.isFunction( params ) ) {
				// We assume that it's the callback
				callback = params;
				params = null;

			// Otherwise, build a param string
			} else if ( typeof params === "object" ) {
				params = jQuery.param( params, jQuery.ajaxSettings.traditional );
				type = "POST";
			}
		}

		var self = this;

		// Request the remote document
		jQuery.ajax({
			url: url,
			type: type,
			dataType: "html",
			data: params,
			complete: function( res, status ) {
				// If successful, inject the HTML into all the matched elements
				if ( status === "success" || status === "notmodified" ) {
					// See if a selector was specified
					self.html( selector ?
						// Create a dummy div to hold the results
						jQuery("<div />")
							// inject the contents of the document in, removing the scripts
							// to avoid any 'Permission Denied' errors in IE
							.append(res.responseText.replace(rscript, ""))

							// Locate the specified elements
							.find(selector) :

						// If not, just inject the full result
						res.responseText );
				}

				if ( callback ) {
					self.each( callback, [res.responseText, status, res] );
				}
			}
		});

		return this;
	},

	serialize: function() {
		return jQuery.param(this.serializeArray());
	},
	serializeArray: function() {
		return this.map(function() {
			return this.elements ? jQuery.makeArray(this.elements) : this;
		})
		.filter(function() {
			return this.name && !this.disabled &&
				(this.checked || rselectTextarea.test(this.nodeName) ||
					rinput.test(this.type));
		})
		.map(function( i, elem ) {
			var val = jQuery(this).val();

			return val == null ?
				null :
				jQuery.isArray(val) ?
					jQuery.map( val, function( val, i ) {
						return { name: elem.name, value: val };
					}) :
					{ name: elem.name, value: val };
		}).get();
	}
});

// Attach a bunch of functions for handling common AJAX events
jQuery.each( "ajaxStart ajaxStop ajaxComplete ajaxError ajaxSuccess ajaxSend".split(" "), function( i, o ) {
	jQuery.fn[o] = function( f ) {
		return this.bind(o, f);
	};
});

jQuery.extend({

	get: function( url, data, callback, type ) {
		// shift arguments if data argument was omited
		if ( jQuery.isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = null;
		}

		return jQuery.ajax({
			type: "GET",
			url: url,
			data: data,
			success: callback,
			dataType: type
		});
	},

	getScript: function( url, callback ) {
		return jQuery.get(url, null, callback, "script");
	},

	getJSON: function( url, data, callback ) {
		return jQuery.get(url, data, callback, "json");
	},

	post: function( url, data, callback, type ) {
		// shift arguments if data argument was omited
		if ( jQuery.isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = {};
		}

		return jQuery.ajax({
			type: "POST",
			url: url,
			data: data,
			success: callback,
			dataType: type
		});
	},

	ajaxSetup: function( settings ) {
		jQuery.extend( jQuery.ajaxSettings, settings );
	},

	ajaxSettings: {
		url: location.href,
		global: true,
		type: "GET",
		contentType: "application/x-www-form-urlencoded",
		processData: true,
		async: true,
		/*
		timeout: 0,
		data: null,
		username: null,
		password: null,
		traditional: false,
		*/
		// Create the request object; Microsoft failed to properly
		// implement the XMLHttpRequest in IE7 (can't request local files),
		// so we use the ActiveXObject when it is available
		// This function can be overriden by calling jQuery.ajaxSetup
		xhr: window.XMLHttpRequest && (window.location.protocol !== "file:" || !window.ActiveXObject) ?
			function() {
				return new window.XMLHttpRequest();
			} :
			function() {
				try {
					return new window.ActiveXObject("Microsoft.XMLHTTP");
				} catch(e) {}
			},
		accepts: {
			xml: "application/xml, text/xml",
			html: "text/html",
			script: "text/javascript, application/javascript",
			json: "application/json, text/javascript",
			text: "text/plain",
			_default: "*/*"
		}
	},

	// Last-Modified header cache for next request
	lastModified: {},
	etag: {},

	ajax: function( origSettings ) {
		var s = jQuery.extend(true, {}, jQuery.ajaxSettings, origSettings);
		
		var jsonp, status, data,
			callbackContext = origSettings && origSettings.context || s,
			type = s.type.toUpperCase();

		// convert data if not already a string
		if ( s.data && s.processData && typeof s.data !== "string" ) {
			s.data = jQuery.param( s.data, s.traditional );
		}

		// Handle JSONP Parameter Callbacks
		if ( s.dataType === "jsonp" ) {
			if ( type === "GET" ) {
				if ( !jsre.test( s.url ) ) {
					s.url += (rquery.test( s.url ) ? "&" : "?") + (s.jsonp || "callback") + "=?";
				}
			} else if ( !s.data || !jsre.test(s.data) ) {
				s.data = (s.data ? s.data + "&" : "") + (s.jsonp || "callback") + "=?";
			}
			s.dataType = "json";
		}

		// Build temporary JSONP function
		if ( s.dataType === "json" && (s.data && jsre.test(s.data) || jsre.test(s.url)) ) {
			jsonp = s.jsonpCallback || ("jsonp" + jsc++);

			// Replace the =? sequence both in the query string and the data
			if ( s.data ) {
				s.data = (s.data + "").replace(jsre, "=" + jsonp + "$1");
			}

			s.url = s.url.replace(jsre, "=" + jsonp + "$1");

			// We need to make sure
			// that a JSONP style response is executed properly
			s.dataType = "script";

			// Handle JSONP-style loading
			window[ jsonp ] = window[ jsonp ] || function( tmp ) {
				data = tmp;
				success();
				complete();
				// Garbage collect
				window[ jsonp ] = undefined;

				try {
					delete window[ jsonp ];
				} catch(e) {}

				if ( head ) {
					head.removeChild( script );
				}
			};
		}

		if ( s.dataType === "script" && s.cache === null ) {
			s.cache = false;
		}

		if ( s.cache === false && type === "GET" ) {
			var ts = now();

			// try replacing _= if it is there
			var ret = s.url.replace(rts, "$1_=" + ts + "$2");

			// if nothing was replaced, add timestamp to the end
			s.url = ret + ((ret === s.url) ? (rquery.test(s.url) ? "&" : "?") + "_=" + ts : "");
		}

		// If data is available, append data to url for get requests
		if ( s.data && type === "GET" ) {
			s.url += (rquery.test(s.url) ? "&" : "?") + s.data;
		}

		// Watch for a new set of requests
		if ( s.global && ! jQuery.active++ ) {
			jQuery.event.trigger( "ajaxStart" );
		}

		// Matches an absolute URL, and saves the domain
		var parts = rurl.exec( s.url ),
			remote = parts && (parts[1] && parts[1] !== location.protocol || parts[2] !== location.host);

		// If we're requesting a remote document
		// and trying to load JSON or Script with a GET
		if ( s.dataType === "script" && type === "GET" && remote ) {
			var head = document.getElementsByTagName("head")[0] || document.documentElement;
			var script = document.createElement("script");
			script.src = s.url;
			if ( s.scriptCharset ) {
				script.charset = s.scriptCharset;
			}

			// Handle Script loading
			if ( !jsonp ) {
				var done = false;

				// Attach handlers for all browsers
				script.onload = script.onreadystatechange = function() {
					if ( !done && (!this.readyState ||
							this.readyState === "loaded" || this.readyState === "complete") ) {
						done = true;
						success();
						complete();

						// Handle memory leak in IE
						script.onload = script.onreadystatechange = null;
						if ( head && script.parentNode ) {
							head.removeChild( script );
						}
					}
				};
			}

			// Use insertBefore instead of appendChild  to circumvent an IE6 bug.
			// This arises when a base node is used (#2709 and #4378).
			head.insertBefore( script, head.firstChild );

			// We handle everything using the script element injection
			return undefined;
		}

		var requestDone = false;

		// Create the request object
		var xhr = s.xhr();

		if ( !xhr ) {
			return;
		}

		// Open the socket
		// Passing null username, generates a login popup on Opera (#2865)
		if ( s.username ) {
			xhr.open(type, s.url, s.async, s.username, s.password);
		} else {
			xhr.open(type, s.url, s.async);
		}

		// Need an extra try/catch for cross domain requests in Firefox 3
		try {
			// Set the correct header, if data is being sent
			if ( s.data || origSettings && origSettings.contentType ) {
				xhr.setRequestHeader("Content-Type", s.contentType);
			}

			// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
			if ( s.ifModified ) {
				if ( jQuery.lastModified[s.url] ) {
					xhr.setRequestHeader("If-Modified-Since", jQuery.lastModified[s.url]);
				}

				if ( jQuery.etag[s.url] ) {
					xhr.setRequestHeader("If-None-Match", jQuery.etag[s.url]);
				}
			}

			// Set header so the called script knows that it's an XMLHttpRequest
			// Only send the header if it's not a remote XHR
			if ( !remote ) {
				xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
			}

			// Set the Accepts header for the server, depending on the dataType
			xhr.setRequestHeader("Accept", s.dataType && s.accepts[ s.dataType ] ?
				s.accepts[ s.dataType ] + ", */*" :
				s.accepts._default );
		} catch(e) {}

		// Allow custom headers/mimetypes and early abort
		if ( s.beforeSend && s.beforeSend.call(callbackContext, xhr, s) === false ) {
			// Handle the global AJAX counter
			if ( s.global && ! --jQuery.active ) {
				jQuery.event.trigger( "ajaxStop" );
			}

			// close opended socket
			xhr.abort();
			return false;
		}

		if ( s.global ) {
			trigger("ajaxSend", [xhr, s]);
		}

		// Wait for a response to come back
		var onreadystatechange = xhr.onreadystatechange = function( isTimeout ) {
			// The request was aborted
			if ( !xhr || xhr.readyState === 0 || isTimeout === "abort" ) {
				// Opera doesn't call onreadystatechange before this point
				// so we simulate the call
				if ( !requestDone ) {
					complete();
				}

				requestDone = true;
				if ( xhr ) {
					xhr.onreadystatechange = jQuery.noop;
				}

			// The transfer is complete and the data is available, or the request timed out
			} else if ( !requestDone && xhr && (xhr.readyState === 4 || isTimeout === "timeout") ) {
				requestDone = true;
				xhr.onreadystatechange = jQuery.noop;

				status = isTimeout === "timeout" ?
					"timeout" :
					!jQuery.httpSuccess( xhr ) ?
						"error" :
						s.ifModified && jQuery.httpNotModified( xhr, s.url ) ?
							"notmodified" :
							"success";

				var errMsg;

				if ( status === "success" ) {
					// Watch for, and catch, XML document parse errors
					try {
						// process the data (runs the xml through httpData regardless of callback)
						data = jQuery.httpData( xhr, s.dataType, s );
					} catch(err) {
						status = "parsererror";
						errMsg = err;
					}
				}

				// Make sure that the request was successful or notmodified
				if ( status === "success" || status === "notmodified" ) {
					// JSONP handles its own success callback
					if ( !jsonp ) {
						success();
					}
				} else {
					jQuery.handleError(s, xhr, status, errMsg);
				}

				// Fire the complete handlers
				complete();

				if ( isTimeout === "timeout" ) {
					xhr.abort();
				}

				// Stop memory leaks
				if ( s.async ) {
					xhr = null;
				}
			}
		};

		// Override the abort handler, if we can (IE doesn't allow it, but that's OK)
		// Opera doesn't fire onreadystatechange at all on abort
		try {
			var oldAbort = xhr.abort;
			xhr.abort = function() {
				if ( xhr ) {
					oldAbort.call( xhr );
				}

				onreadystatechange( "abort" );
			};
		} catch(e) { }

		// Timeout checker
		if ( s.async && s.timeout > 0 ) {
			setTimeout(function() {
				// Check to see if the request is still happening
				if ( xhr && !requestDone ) {
					onreadystatechange( "timeout" );
				}
			}, s.timeout);
		}

		// Send the data
		try {
			xhr.send( type === "POST" || type === "PUT" || type === "DELETE" ? s.data : null );
		} catch(e) {
			jQuery.handleError(s, xhr, null, e);
			// Fire the complete handlers
			complete();
		}

		// firefox 1.5 doesn't fire statechange for sync requests
		if ( !s.async ) {
			onreadystatechange();
		}

		function success() {
			// If a local callback was specified, fire it and pass it the data
			if ( s.success ) {
				s.success.call( callbackContext, data, status, xhr );
			}

			// Fire the global callback
			if ( s.global ) {
				trigger( "ajaxSuccess", [xhr, s] );
			}
		}

		function complete() {
			// Process result
			if ( s.complete ) {
				s.complete.call( callbackContext, xhr, status);
			}

			// The request was completed
			if ( s.global ) {
				trigger( "ajaxComplete", [xhr, s] );
			}

			// Handle the global AJAX counter
			if ( s.global && ! --jQuery.active ) {
				jQuery.event.trigger( "ajaxStop" );
			}
		}
		
		function trigger(type, args) {
			(s.context ? jQuery(s.context) : jQuery.event).trigger(type, args);
		}

		// return XMLHttpRequest to allow aborting the request etc.
		return xhr;
	},

	handleError: function( s, xhr, status, e ) {
		// If a local callback was specified, fire it
		if ( s.error ) {
			s.error.call( s.context || s, xhr, status, e );
		}

		// Fire the global callback
		if ( s.global ) {
			(s.context ? jQuery(s.context) : jQuery.event).trigger( "ajaxError", [xhr, s, e] );
		}
	},

	// Counter for holding the number of active queries
	active: 0,

	// Determines if an XMLHttpRequest was successful or not
	httpSuccess: function( xhr ) {
		try {
			// IE error sometimes returns 1223 when it should be 204 so treat it as success, see #1450
			return !xhr.status && location.protocol === "file:" ||
				// Opera returns 0 when status is 304
				( xhr.status >= 200 && xhr.status < 300 ) ||
				xhr.status === 304 || xhr.status === 1223 || xhr.status === 0;
		} catch(e) {}

		return false;
	},

	// Determines if an XMLHttpRequest returns NotModified
	httpNotModified: function( xhr, url ) {
		var lastModified = xhr.getResponseHeader("Last-Modified"),
			etag = xhr.getResponseHeader("Etag");

		if ( lastModified ) {
			jQuery.lastModified[url] = lastModified;
		}

		if ( etag ) {
			jQuery.etag[url] = etag;
		}

		// Opera returns 0 when status is 304
		return xhr.status === 304 || xhr.status === 0;
	},

	httpData: function( xhr, type, s ) {
		var ct = xhr.getResponseHeader("content-type") || "",
			xml = type === "xml" || !type && ct.indexOf("xml") >= 0,
			data = xml ? xhr.responseXML : xhr.responseText;

		if ( xml && data.documentElement.nodeName === "parsererror" ) {
			jQuery.error( "parsererror" );
		}

		// Allow a pre-filtering function to sanitize the response
		// s is checked to keep backwards compatibility
		if ( s && s.dataFilter ) {
			data = s.dataFilter( data, type );
		}

		// The filter can actually parse the response
		if ( typeof data === "string" ) {
			// Get the JavaScript object, if JSON is used.
			if ( type === "json" || !type && ct.indexOf("json") >= 0 ) {
				data = jQuery.parseJSON( data );

			// If the type is "script", eval it in global context
			} else if ( type === "script" || !type && ct.indexOf("javascript") >= 0 ) {
				jQuery.globalEval( data );
			}
		}

		return data;
	},

	// Serialize an array of form elements or a set of
	// key/values into a query string
	param: function( a, traditional ) {
		var s = [];
		
		// Set traditional to true for jQuery <= 1.3.2 behavior.
		if ( traditional === undefined ) {
			traditional = jQuery.ajaxSettings.traditional;
		}
		
		// If an array was passed in, assume that it is an array of form elements.
		if ( jQuery.isArray(a) || a.jquery ) {
			// Serialize the form elements
			jQuery.each( a, function() {
				add( this.name, this.value );
			});
			
		} else {
			// If traditional, encode the "old" way (the way 1.3.2 or older
			// did it), otherwise encode params recursively.
			for ( var prefix in a ) {
				buildParams( prefix, a[prefix] );
			}
		}

		// Return the resulting serialization
		return s.join("&").replace(r20, "+");

		function buildParams( prefix, obj ) {
			if ( jQuery.isArray(obj) ) {
				// Serialize array item.
				jQuery.each( obj, function( i, v ) {
					if ( traditional || /\[\]$/.test( prefix ) ) {
						// Treat each array item as a scalar.
						add( prefix, v );
					} else {
						// If array item is non-scalar (array or object), encode its
						// numeric index to resolve deserialization ambiguity issues.
						// Note that rack (as of 1.0.0) can't currently deserialize
						// nested arrays properly, and attempting to do so may cause
						// a server error. Possible fixes are to modify rack's
						// deserialization algorithm or to provide an option or flag
						// to force array serialization to be shallow.
						buildParams( prefix + "[" + ( typeof v === "object" || jQuery.isArray(v) ? i : "" ) + "]", v );
					}
				});
					
			} else if ( !traditional && obj != null && typeof obj === "object" ) {
				// Serialize object item.
				jQuery.each( obj, function( k, v ) {
					buildParams( prefix + "[" + k + "]", v );
				});
					
			} else {
				// Serialize scalar item.
				add( prefix, obj );
			}
		}

		function add( key, value ) {
			// If value is a function, invoke it and return its value
			value = jQuery.isFunction(value) ? value() : value;
			s[ s.length ] = encodeURIComponent(key) + "=" + encodeURIComponent(value);
		}
	}
});
var elemdisplay = {},
	rfxtypes = /toggle|show|hide/,
	rfxnum = /^([+-]=)?([\d+-.]+)(.*)$/,
	timerId,
	fxAttrs = [
		// height animations
		[ "height", "marginTop", "marginBottom", "paddingTop", "paddingBottom" ],
		// width animations
		[ "width", "marginLeft", "marginRight", "paddingLeft", "paddingRight" ],
		// opacity animations
		[ "opacity" ]
	];

jQuery.fn.extend({
	show: function( speed, callback ) {
		if ( speed || speed === 0) {
			return this.animate( genFx("show", 3), speed, callback);

		} else {
			for ( var i = 0, l = this.length; i < l; i++ ) {
				var old = jQuery.data(this[i], "olddisplay");

				this[i].style.display = old || "";

				if ( jQuery.css(this[i], "display") === "none" ) {
					var nodeName = this[i].nodeName, display;

					if ( elemdisplay[ nodeName ] ) {
						display = elemdisplay[ nodeName ];

					} else {
						var elem = jQuery("<" + nodeName + " />").appendTo("body");

						display = elem.css("display");

						if ( display === "none" ) {
							display = "block";
						}

						elem.remove();

						elemdisplay[ nodeName ] = display;
					}

					jQuery.data(this[i], "olddisplay", display);
				}
			}

			// Set the display of the elements in a second loop
			// to avoid the constant reflow
			for ( var j = 0, k = this.length; j < k; j++ ) {
				this[j].style.display = jQuery.data(this[j], "olddisplay") || "";
			}

			return this;
		}
	},

	hide: function( speed, callback ) {
		if ( speed || speed === 0 ) {
			return this.animate( genFx("hide", 3), speed, callback);

		} else {
			for ( var i = 0, l = this.length; i < l; i++ ) {
				var old = jQuery.data(this[i], "olddisplay");
				if ( !old && old !== "none" ) {
					jQuery.data(this[i], "olddisplay", jQuery.css(this[i], "display"));
				}
			}

			// Set the display of the elements in a second loop
			// to avoid the constant reflow
			for ( var j = 0, k = this.length; j < k; j++ ) {
				this[j].style.display = "none";
			}

			return this;
		}
	},

	// Save the old toggle function
	_toggle: jQuery.fn.toggle,

	toggle: function( fn, fn2 ) {
		var bool = typeof fn === "boolean";

		if ( jQuery.isFunction(fn) && jQuery.isFunction(fn2) ) {
			this._toggle.apply( this, arguments );

		} else if ( fn == null || bool ) {
			this.each(function() {
				var state = bool ? fn : jQuery(this).is(":hidden");
				jQuery(this)[ state ? "show" : "hide" ]();
			});

		} else {
			this.animate(genFx("toggle", 3), fn, fn2);
		}

		return this;
	},

	fadeTo: function( speed, to, callback ) {
		return this.filter(":hidden").css("opacity", 0).show().end()
					.animate({opacity: to}, speed, callback);
	},

	animate: function( prop, speed, easing, callback ) {
		var optall = jQuery.speed(speed, easing, callback);

		if ( jQuery.isEmptyObject( prop ) ) {
			return this.each( optall.complete );
		}

		return this[ optall.queue === false ? "each" : "queue" ](function() {
			var opt = jQuery.extend({}, optall), p,
				hidden = this.nodeType === 1 && jQuery(this).is(":hidden"),
				self = this;

			for ( p in prop ) {
				var name = p.replace(rdashAlpha, fcamelCase);

				if ( p !== name ) {
					prop[ name ] = prop[ p ];
					delete prop[ p ];
					p = name;
				}

				if ( prop[p] === "hide" && hidden || prop[p] === "show" && !hidden ) {
					return opt.complete.call(this);
				}

				if ( ( p === "height" || p === "width" ) && this.style ) {
					// Store display property
					opt.display = jQuery.css(this, "display");

					// Make sure that nothing sneaks out
					opt.overflow = this.style.overflow;
				}

				if ( jQuery.isArray( prop[p] ) ) {
					// Create (if needed) and add to specialEasing
					(opt.specialEasing = opt.specialEasing || {})[p] = prop[p][1];
					prop[p] = prop[p][0];
				}
			}

			if ( opt.overflow != null ) {
				this.style.overflow = "hidden";
			}

			opt.curAnim = jQuery.extend({}, prop);

			jQuery.each( prop, function( name, val ) {
				var e = new jQuery.fx( self, opt, name );

				if ( rfxtypes.test(val) ) {
					e[ val === "toggle" ? hidden ? "show" : "hide" : val ]( prop );

				} else {
					var parts = rfxnum.exec(val),
						start = e.cur(true) || 0;

					if ( parts ) {
						var end = parseFloat( parts[2] ),
							unit = parts[3] || "px";

						// We need to compute starting value
						if ( unit !== "px" ) {
							self.style[ name ] = (end || 1) + unit;
							start = ((end || 1) / e.cur(true)) * start;
							self.style[ name ] = start + unit;
						}

						// If a +=/-= token was provided, we're doing a relative animation
						if ( parts[1] ) {
							end = ((parts[1] === "-=" ? -1 : 1) * end) + start;
						}

						e.custom( start, end, unit );

					} else {
						e.custom( start, val, "" );
					}
				}
			});

			// For JS strict compliance
			return true;
		});
	},

	stop: function( clearQueue, gotoEnd ) {
		var timers = jQuery.timers;

		if ( clearQueue ) {
			this.queue([]);
		}

		this.each(function() {
			// go in reverse order so anything added to the queue during the loop is ignored
			for ( var i = timers.length - 1; i >= 0; i-- ) {
				if ( timers[i].elem === this ) {
					if (gotoEnd) {
						// force the next step to be the last
						timers[i](true);
					}

					timers.splice(i, 1);
				}
			}
		});

		// start the next in the queue if the last step wasn't forced
		if ( !gotoEnd ) {
			this.dequeue();
		}

		return this;
	}

});

// Generate shortcuts for custom animations
jQuery.each({
	slideDown: genFx("show", 1),
	slideUp: genFx("hide", 1),
	slideToggle: genFx("toggle", 1),
	fadeIn: { opacity: "show" },
	fadeOut: { opacity: "hide" }
}, function( name, props ) {
	jQuery.fn[ name ] = function( speed, callback ) {
		return this.animate( props, speed, callback );
	};
});

jQuery.extend({
	speed: function( speed, easing, fn ) {
		var opt = speed && typeof speed === "object" ? speed : {
			complete: fn || !fn && easing ||
				jQuery.isFunction( speed ) && speed,
			duration: speed,
			easing: fn && easing || easing && !jQuery.isFunction(easing) && easing
		};

		opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration :
			jQuery.fx.speeds[opt.duration] || jQuery.fx.speeds._default;

		// Queueing
		opt.old = opt.complete;
		opt.complete = function() {
			if ( opt.queue !== false ) {
				jQuery(this).dequeue();
			}
			if ( jQuery.isFunction( opt.old ) ) {
				opt.old.call( this );
			}
		};

		return opt;
	},

	easing: {
		linear: function( p, n, firstNum, diff ) {
			return firstNum + diff * p;
		},
		swing: function( p, n, firstNum, diff ) {
			return ((-Math.cos(p*Math.PI)/2) + 0.5) * diff + firstNum;
		}
	},

	timers: [],

	fx: function( elem, options, prop ) {
		this.options = options;
		this.elem = elem;
		this.prop = prop;

		if ( !options.orig ) {
			options.orig = {};
		}
	}

});

jQuery.fx.prototype = {
	// Simple function for setting a style value
	update: function() {
		if ( this.options.step ) {
			this.options.step.call( this.elem, this.now, this );
		}

		(jQuery.fx.step[this.prop] || jQuery.fx.step._default)( this );

		// Set display property to block for height/width animations
		if ( ( this.prop === "height" || this.prop === "width" ) && this.elem.style ) {
			this.elem.style.display = "block";
		}
	},

	// Get the current size
	cur: function( force ) {
		if ( this.elem[this.prop] != null && (!this.elem.style || this.elem.style[this.prop] == null) ) {
			return this.elem[ this.prop ];
		}

		var r = parseFloat(jQuery.css(this.elem, this.prop, force));
		return r && r > -10000 ? r : parseFloat(jQuery.curCSS(this.elem, this.prop)) || 0;
	},

	// Start an animation from one number to another
	custom: function( from, to, unit ) {
		this.startTime = now();
		this.start = from;
		this.end = to;
		this.unit = unit || this.unit || "px";
		this.now = this.start;
		this.pos = this.state = 0;

		var self = this;
		function t( gotoEnd ) {
			return self.step(gotoEnd);
		}

		t.elem = this.elem;

		if ( t() && jQuery.timers.push(t) && !timerId ) {
			timerId = setInterval(jQuery.fx.tick, 13);
		}
	},

	// Simple 'show' function
	show: function() {
		// Remember where we started, so that we can go back to it later
		this.options.orig[this.prop] = jQuery.style( this.elem, this.prop );
		this.options.show = true;

		// Begin the animation
		// Make sure that we start at a small width/height to avoid any
		// flash of content
		this.custom(this.prop === "width" || this.prop === "height" ? 1 : 0, this.cur());

		// Start by showing the element
		jQuery( this.elem ).show();
	},

	// Simple 'hide' function
	hide: function() {
		// Remember where we started, so that we can go back to it later
		this.options.orig[this.prop] = jQuery.style( this.elem, this.prop );
		this.options.hide = true;

		// Begin the animation
		this.custom(this.cur(), 0);
	},

	// Each step of an animation
	step: function( gotoEnd ) {
		var t = now(), done = true;

		if ( gotoEnd || t >= this.options.duration + this.startTime ) {
			this.now = this.end;
			this.pos = this.state = 1;
			this.update();

			this.options.curAnim[ this.prop ] = true;

			for ( var i in this.options.curAnim ) {
				if ( this.options.curAnim[i] !== true ) {
					done = false;
				}
			}

			if ( done ) {
				if ( this.options.display != null ) {
					// Reset the overflow
					this.elem.style.overflow = this.options.overflow;

					// Reset the display
					var old = jQuery.data(this.elem, "olddisplay");
					this.elem.style.display = old ? old : this.options.display;

					if ( jQuery.css(this.elem, "display") === "none" ) {
						this.elem.style.display = "block";
					}
				}

				// Hide the element if the "hide" operation was done
				if ( this.options.hide ) {
					jQuery(this.elem).hide();
				}

				// Reset the properties, if the item has been hidden or shown
				if ( this.options.hide || this.options.show ) {
					for ( var p in this.options.curAnim ) {
						jQuery.style(this.elem, p, this.options.orig[p]);
					}
				}

				// Execute the complete function
				this.options.complete.call( this.elem );
			}

			return false;

		} else {
			var n = t - this.startTime;
			this.state = n / this.options.duration;

			// Perform the easing function, defaults to swing
			var specialEasing = this.options.specialEasing && this.options.specialEasing[this.prop];
			var defaultEasing = this.options.easing || (jQuery.easing.swing ? "swing" : "linear");
			this.pos = jQuery.easing[specialEasing || defaultEasing](this.state, n, 0, 1, this.options.duration);
			this.now = this.start + ((this.end - this.start) * this.pos);

			// Perform the next step of the animation
			this.update();
		}

		return true;
	}
};

jQuery.extend( jQuery.fx, {
	tick: function() {
		var timers = jQuery.timers;

		for ( var i = 0; i < timers.length; i++ ) {
			if ( !timers[i]() ) {
				timers.splice(i--, 1);
			}
		}

		if ( !timers.length ) {
			jQuery.fx.stop();
		}
	},
		
	stop: function() {
		clearInterval( timerId );
		timerId = null;
	},
	
	speeds: {
		slow: 600,
 		fast: 200,
 		// Default speed
 		_default: 400
	},

	step: {
		opacity: function( fx ) {
			jQuery.style(fx.elem, "opacity", fx.now);
		},

		_default: function( fx ) {
			if ( fx.elem.style && fx.elem.style[ fx.prop ] != null ) {
				fx.elem.style[ fx.prop ] = (fx.prop === "width" || fx.prop === "height" ? Math.max(0, fx.now) : fx.now) + fx.unit;
			} else {
				fx.elem[ fx.prop ] = fx.now;
			}
		}
	}
});

if ( jQuery.expr && jQuery.expr.filters ) {
	jQuery.expr.filters.animated = function( elem ) {
		return jQuery.grep(jQuery.timers, function( fn ) {
			return elem === fn.elem;
		}).length;
	};
}

function genFx( type, num ) {
	var obj = {};

	jQuery.each( fxAttrs.concat.apply([], fxAttrs.slice(0,num)), function() {
		obj[ this ] = type;
	});

	return obj;
}
if ( "getBoundingClientRect" in document.documentElement ) {
	jQuery.fn.offset = function( options ) {
		var elem = this[0];

		if ( options ) { 
			return this.each(function( i ) {
				jQuery.offset.setOffset( this, options, i );
			});
		}

		if ( !elem || !elem.ownerDocument ) {
			return null;
		}

		if ( elem === elem.ownerDocument.body ) {
			return jQuery.offset.bodyOffset( elem );
		}

		var box = elem.getBoundingClientRect(), doc = elem.ownerDocument, body = doc.body, docElem = doc.documentElement,
			clientTop = docElem.clientTop || body.clientTop || 0, clientLeft = docElem.clientLeft || body.clientLeft || 0,
			top  = box.top  + (self.pageYOffset || jQuery.support.boxModel && docElem.scrollTop  || body.scrollTop ) - clientTop,
			left = box.left + (self.pageXOffset || jQuery.support.boxModel && docElem.scrollLeft || body.scrollLeft) - clientLeft;

		return { top: top, left: left };
	};

} else {
	jQuery.fn.offset = function( options ) {
		var elem = this[0];

		if ( options ) { 
			return this.each(function( i ) {
				jQuery.offset.setOffset( this, options, i );
			});
		}

		if ( !elem || !elem.ownerDocument ) {
			return null;
		}

		if ( elem === elem.ownerDocument.body ) {
			return jQuery.offset.bodyOffset( elem );
		}

		jQuery.offset.initialize();

		var offsetParent = elem.offsetParent, prevOffsetParent = elem,
			doc = elem.ownerDocument, computedStyle, docElem = doc.documentElement,
			body = doc.body, defaultView = doc.defaultView,
			prevComputedStyle = defaultView ? defaultView.getComputedStyle( elem, null ) : elem.currentStyle,
			top = elem.offsetTop, left = elem.offsetLeft;

		while ( (elem = elem.parentNode) && elem !== body && elem !== docElem ) {
			if ( jQuery.offset.supportsFixedPosition && prevComputedStyle.position === "fixed" ) {
				break;
			}

			computedStyle = defaultView ? defaultView.getComputedStyle(elem, null) : elem.currentStyle;
			top  -= elem.scrollTop;
			left -= elem.scrollLeft;

			if ( elem === offsetParent ) {
				top  += elem.offsetTop;
				left += elem.offsetLeft;

				if ( jQuery.offset.doesNotAddBorder && !(jQuery.offset.doesAddBorderForTableAndCells && /^t(able|d|h)$/i.test(elem.nodeName)) ) {
					top  += parseFloat( computedStyle.borderTopWidth  ) || 0;
					left += parseFloat( computedStyle.borderLeftWidth ) || 0;
				}

				prevOffsetParent = offsetParent, offsetParent = elem.offsetParent;
			}

			if ( jQuery.offset.subtractsBorderForOverflowNotVisible && computedStyle.overflow !== "visible" ) {
				top  += parseFloat( computedStyle.borderTopWidth  ) || 0;
				left += parseFloat( computedStyle.borderLeftWidth ) || 0;
			}

			prevComputedStyle = computedStyle;
		}

		if ( prevComputedStyle.position === "relative" || prevComputedStyle.position === "static" ) {
			top  += body.offsetTop;
			left += body.offsetLeft;
		}

		if ( jQuery.offset.supportsFixedPosition && prevComputedStyle.position === "fixed" ) {
			top  += Math.max( docElem.scrollTop, body.scrollTop );
			left += Math.max( docElem.scrollLeft, body.scrollLeft );
		}

		return { top: top, left: left };
	};
}

jQuery.offset = {
	initialize: function() {
		var body = document.body, container = document.createElement("div"), innerDiv, checkDiv, table, td, bodyMarginTop = parseFloat( jQuery.curCSS(body, "marginTop", true) ) || 0,
			html = "<div style='position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;'><div></div></div><table style='position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;' cellpadding='0' cellspacing='0'><tr><td></td></tr></table>";

		jQuery.extend( container.style, { position: "absolute", top: 0, left: 0, margin: 0, border: 0, width: "1px", height: "1px", visibility: "hidden" } );

		container.innerHTML = html;
		body.insertBefore( container, body.firstChild );
		innerDiv = container.firstChild;
		checkDiv = innerDiv.firstChild;
		td = innerDiv.nextSibling.firstChild.firstChild;

		this.doesNotAddBorder = (checkDiv.offsetTop !== 5);
		this.doesAddBorderForTableAndCells = (td.offsetTop === 5);

		checkDiv.style.position = "fixed", checkDiv.style.top = "20px";
		// safari subtracts parent border width here which is 5px
		this.supportsFixedPosition = (checkDiv.offsetTop === 20 || checkDiv.offsetTop === 15);
		checkDiv.style.position = checkDiv.style.top = "";

		innerDiv.style.overflow = "hidden", innerDiv.style.position = "relative";
		this.subtractsBorderForOverflowNotVisible = (checkDiv.offsetTop === -5);

		this.doesNotIncludeMarginInBodyOffset = (body.offsetTop !== bodyMarginTop);

		body.removeChild( container );
		body = container = innerDiv = checkDiv = table = td = null;
		jQuery.offset.initialize = jQuery.noop;
	},

	bodyOffset: function( body ) {
		var top = body.offsetTop, left = body.offsetLeft;

		jQuery.offset.initialize();

		if ( jQuery.offset.doesNotIncludeMarginInBodyOffset ) {
			top  += parseFloat( jQuery.curCSS(body, "marginTop",  true) ) || 0;
			left += parseFloat( jQuery.curCSS(body, "marginLeft", true) ) || 0;
		}

		return { top: top, left: left };
	},
	
	setOffset: function( elem, options, i ) {
		// set position first, in-case top/left are set even on static elem
		if ( /static/.test( jQuery.curCSS( elem, "position" ) ) ) {
			elem.style.position = "relative";
		}
		var curElem   = jQuery( elem ),
			curOffset = curElem.offset(),
			curTop    = parseInt( jQuery.curCSS( elem, "top",  true ), 10 ) || 0,
			curLeft   = parseInt( jQuery.curCSS( elem, "left", true ), 10 ) || 0;

		if ( jQuery.isFunction( options ) ) {
			options = options.call( elem, i, curOffset );
		}

		var props = {
			top:  (options.top  - curOffset.top)  + curTop,
			left: (options.left - curOffset.left) + curLeft
		};
		
		if ( "using" in options ) {
			options.using.call( elem, props );
		} else {
			curElem.css( props );
		}
	}
};


jQuery.fn.extend({
	position: function() {
		if ( !this[0] ) {
			return null;
		}

		var elem = this[0],

		// Get *real* offsetParent
		offsetParent = this.offsetParent(),

		// Get correct offsets
		offset       = this.offset(),
		parentOffset = /^body|html$/i.test(offsetParent[0].nodeName) ? { top: 0, left: 0 } : offsetParent.offset();

		// Subtract element margins
		// note: when an element has margin: auto the offsetLeft and marginLeft
		// are the same in Safari causing offset.left to incorrectly be 0
		offset.top  -= parseFloat( jQuery.curCSS(elem, "marginTop",  true) ) || 0;
		offset.left -= parseFloat( jQuery.curCSS(elem, "marginLeft", true) ) || 0;

		// Add offsetParent borders
		parentOffset.top  += parseFloat( jQuery.curCSS(offsetParent[0], "borderTopWidth",  true) ) || 0;
		parentOffset.left += parseFloat( jQuery.curCSS(offsetParent[0], "borderLeftWidth", true) ) || 0;

		// Subtract the two offsets
		return {
			top:  offset.top  - parentOffset.top,
			left: offset.left - parentOffset.left
		};
	},

	offsetParent: function() {
		return this.map(function() {
			var offsetParent = this.offsetParent || document.body;
			while ( offsetParent && (!/^body|html$/i.test(offsetParent.nodeName) && jQuery.css(offsetParent, "position") === "static") ) {
				offsetParent = offsetParent.offsetParent;
			}
			return offsetParent;
		});
	}
});


// Create scrollLeft and scrollTop methods
jQuery.each( ["Left", "Top"], function( i, name ) {
	var method = "scroll" + name;

	jQuery.fn[ method ] = function(val) {
		var elem = this[0], win;
		
		if ( !elem ) {
			return null;
		}

		if ( val !== undefined ) {
			// Set the scroll offset
			return this.each(function() {
				win = getWindow( this );

				if ( win ) {
					win.scrollTo(
						!i ? val : jQuery(win).scrollLeft(),
						 i ? val : jQuery(win).scrollTop()
					);

				} else {
					this[ method ] = val;
				}
			});
		} else {
			win = getWindow( elem );

			// Return the scroll offset
			return win ? ("pageXOffset" in win) ? win[ i ? "pageYOffset" : "pageXOffset" ] :
				jQuery.support.boxModel && win.document.documentElement[ method ] ||
					win.document.body[ method ] :
				elem[ method ];
		}
	};
});

function getWindow( elem ) {
	return ("scrollTo" in elem && elem.document) ?
		elem :
		elem.nodeType === 9 ?
			elem.defaultView || elem.parentWindow :
			false;
}
// Create innerHeight, innerWidth, outerHeight and outerWidth methods
jQuery.each([ "Height", "Width" ], function( i, name ) {

	var type = name.toLowerCase();

	// innerHeight and innerWidth
	jQuery.fn["inner" + name] = function() {
		return this[0] ?
			jQuery.css( this[0], type, false, "padding" ) :
			null;
	};

	// outerHeight and outerWidth
	jQuery.fn["outer" + name] = function( margin ) {
		return this[0] ?
			jQuery.css( this[0], type, false, margin ? "margin" : "border" ) :
			null;
	};

	jQuery.fn[ type ] = function( size ) {
		// Get window width or height
		var elem = this[0];
		if ( !elem ) {
			return size == null ? null : this;
		}
		
		if ( jQuery.isFunction( size ) ) {
			return this.each(function( i ) {
				var self = jQuery( this );
				self[ type ]( size.call( this, i, self[ type ]() ) );
			});
		}

		return ("scrollTo" in elem && elem.document) ? // does it walk and quack like a window?
			// Everyone else use document.documentElement or document.body depending on Quirks vs Standards mode
			elem.document.compatMode === "CSS1Compat" && elem.document.documentElement[ "client" + name ] ||
			elem.document.body[ "client" + name ] :

			// Get document width or height
			(elem.nodeType === 9) ? // is it a document
				// Either scroll[Width/Height] or offset[Width/Height], whichever is greater
				Math.max(
					elem.documentElement["client" + name],
					elem.body["scroll" + name], elem.documentElement["scroll" + name],
					elem.body["offset" + name], elem.documentElement["offset" + name]
				) :

				// Get or set width or height on the element
				size === undefined ?
					// Get width or height on the element
					jQuery.css( elem, type ) :

					// Set the width or height on the element (default to pixels if value is unitless)
					this.css( type, typeof size === "string" ? size : size + "px" );
	};

});
// Expose jQuery to the global object
window.jQuery = window.$ = jQuery;

})(window);

var Claypool={
/**
 * Claypool jquery.claypool.1.2.rc3 - A Web 1.6180339... Javascript Application Framework
 *
 * Copyright (c) 2008 Chris Thatcher (claypooljs.com)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 */
	Logging:{
	    //because we log in core we need a safe way to null logging
	    //if the real Claypool.Logging isnt present.  This is the safety.
	},
	extend : function(t, $class, args){
	    $class.apply(t,args||[]);
    }
};

/**
 * Descibe this class
 * @author 
 * @version $Rev$
 * @requires OtherClassName
 */

(function($, $$){
    /**
     * @constructor
     */
    
    $$.Logging.NullLogger = function(){
        //for speed why bother implement the interface, just null the functions
        var nullFunction=function(){
            return this;
        };
        $.extend(this,  {
            debug:nullFunction,
            info:nullFunction,
            warn:nullFunction,
            error:nullFunction,
            exception:nullFunction
        });
        return this;
    };
    
    $.extend($$.Logging.NullLogger.prototype, {
        /**
         * Describe what this method does
         * @private
         * @param {String} paramName Describe this parameter
         * @returns Describe what it returns
         * @type String
         */
	    getLogger	: function(){
	    	return new $$.Logging.NullLogger();
	    }
	});
	
	
})(jQuery, Claypool);


/**
 * Descibe this class
 * @author 
 * @version $Rev$
 * @requires OtherClassName
 */
(function($, $$){
    
    $$.Configuration = {
        /** Please see each module for specific configuration options */
        //this is a short list of well knowns, but can always be '$.extend'ed
        ioc:[], 
        aop:[], 
        logging:[], 
        mvc:{ 
        	"hijax:a":[],
        	"hijax:form":[],
        	"hijax:button":[],
        	"hijax:event":[]
	    },
    	env : {
    	  dev:{},
    	  prod:{},
    	  test:{}
    	}
    };

})(  jQuery, Claypool );


/**
 * Descibe this class
 * @author 
 * @version $Rev$
 * @requires OtherClassName
 */
(function($, $$){
    
    $$.CachingStrategy$Interface = {
        cache:  null,
        size:   null,
        clear:  function(){ throw new $$.MethodNotImplementedError(); },
        add:    function(id, object){ throw new $$.MethodNotImplementedError(); },
        remove: function(id){ throw new $$.MethodNotImplementedError(); },
        find:   function(id){ throw new $$.MethodNotImplementedError(); }
    };

})(  jQuery, Claypool );
  

/**
 * Descibe this class
 * @author 
 * @version $Rev$
 * @requires OtherClassName
 */
(function($, $$){
	/**
	 * @constructor
	 */
    $$.SimpleCachingStrategy = function(options){
        $.extend(true, this, options);
        this.logger = new $$.Logging.NullLogger();
        this.clear();
        return this;
    };
    
    $.extend($$.SimpleCachingStrategy.prototype, 
        $$.CachingStrategy$Interface,{
        /**
         * Describe what this method does
         * @private
         * @param {String} paramName Describe this parameter
         * @returns Describe what it returns
         * @type String
         */
        clear: function(){
            this.logger.debug("Clearing Cache.");
    		this.cache = null;
    		this.cache = {};
    		this.size = 0;
    	},
    	/**
         * Describe what this method does
         * @private
         * @param {String} paramName Describe this parameter
         * @returns Describe what it returns
         * @type String
         */
    	add: function(id, object){
	        this.logger.debug("Adding To Cache: %s", id);
		    if ( !this.cache[id] ){
    			this.cache[id] = object;
    			this.size++;
    			return id;
    		}
    		return null;
    	},
    	/**
         * Describe what this method does
         * @private
         * @param {String} paramName Describe this parameter
         * @returns Describe what it returns
         * @type String
         */
    	remove: function(id){
    	    this.logger.debug("Removing From Cache id: %s", id);
    	    if(this.find(id)){
    	        return (delete this.cache[id])?--this.size:-1; 
    	    }return null;
    	},
    	/**
         * Describe what this method does
         * @private
         * @param {String} paramName Describe this parameter
         * @returns Describe what it returns
         * @type String
         */
    	find: function(id){
    	    this.logger.debug("Searching Cache for id: %s", id);
    		return this.cache[id] || null;
    	}
    	
    });
	
})(  jQuery, Claypool );


/**
 * Descibe this class
 * @author 
 * @version $Rev$
 * @requires Claypool.SimpleCachingStrategy
 */
(function($, $$){
    
    $$.Context = function(options){
        $$.extend( this, $$.SimpleCachingStrategy);
        $.extend(true, this, options);
        this.logger = new $$.Logging.NullLogger();
    };
        
    $.extend($$.Context.prototype,
        $$.SimpleCachingStrategy.prototype,{
        get: function(id){ throw new $$.MethodNotImplementedError();  },
        put: function(id, object){ throw new $$.MethodNotImplementedError(); }
    });

})(jQuery, Claypool);

/**
 * Descibe this class
 * @Chris Thatcher 
 * @version $Rev$
 * @requires Claypool.Context
 */
(function($, $$){	    
	$$.ContextContributor = function(options){
        $$.extend( this, $$.Context);
        $.extend(true, this, options);
        this.logger = $.logger("Claypool.ContextContributor");
    };
    
    $.extend($$.ContextContributor.prototype, 
        $$.Context.prototype, {
        registerContext: function(id){
            throw new $$.MethodNotImplementedError();
        }
    });
	
})(jQuery, Claypool);

/**
 * Descibe this class
 * @author 
 * @version $Rev$
 * @requires OtherClassName
 */
(function($, $$){
    /**
     * @constructor
     */
    $$.Router = function(options){
        $$.extend(this, $$.SimpleCachingStrategy);
        $.extend(true, this, options);
        this.logger = $$.Logging.getLogger("Claypool.Router");
    };
    
    $.extend($$.Router.prototype, 
        $$.SimpleCachingStrategy.prototype, {
        /**the pattern map is any object, the pattern key is the name of 
        the objects property which is treated as a string to be compiled to
        a regular expression, The pattern key can actually be a '|' seperated
        set of strings.  the first one that is a property of the map will be used*/
        
        /**
         * Describe what this method does
         * @private
         * @param {String} paramName Describe this parameter
         * @returns Describe what it returns
         * @type String
         */
        compile: function(patternMap, patternKey){
            this.logger.debug("compiling patterns for match strategies");
            var pattern, routable, params;
            var i, j; 
            patternKey = patternKey.split('|');//supports flexible pattern keys
            for(i=0;i<patternMap.length;i++){
                for( j = 0; j<patternKey.length;j++){
                    pattern = patternMap[i][patternKey[j]];
					params = [];
                    if(pattern){
                        this.logger.debug("Compiling \n\tpattern: %s for \n\ttarget.", pattern);
						/**
						 * Suggestion from Martin Hrabovčin
						 * allow capturing via |:param|
						 * also added '<:foo(regexp):>/<:bar(regexp):>'
						 */
                        pattern = pattern.replace(/\<\:(.+?)\:\>/g, function(){
							var name, i = arguments[0].indexOf('(');
							name = arguments[0].substring(2,i);
							params.push(name);
							return arguments[0].substring(i,arguments[0].length-2);
						});
						pattern = pattern.replace(/\|\:\w+\|/g, function(){
							var name;
							name = arguments[0].substring(2,arguments[0].length-1);
							params.push(name);
                            //the claypool 'word' class is an extension of the standard word which
                            //includes - and .
							return '([\\w\\-\\.]+)';
						});
                        /**pattern might be used more than once so we need a unique key to store the route*/
                        this.add(String($.uuid()) , {
                            pattern:new RegExp(pattern), 
                            payload:patternMap[i],
							params : params
                        });
                    }
                }
            }
            return this;
        },

        /**
         * Describe what this method does
         * @private
         * @param {String} paramName Describe this parameter
         * @returns Describe what it returns
         * @type String
         */
        
        first: function(string){
            this.logger.debug("Using strategy 'first'");
            var route, id, map = {};
            for(id in this.cache){
                route = this.find(id);
                this.logger.debug("checking pattern %s for string %s", route.pattern, string);
                if(route&&route.pattern&&route.pattern.test&&route.pattern.test(string)){
                    this.logger.debug("found match for \n\tpattern: %s \n\ttarget : %s ", 
                        route.pattern, route.payload.controller||route.payload.rewrite );
					if (route.params && route.params.length > 0) {
						//make a parameter map
						string.replace(route.pattern, function(){
							var i;
							for (i = 1; i < arguments.length - 2; i++) {
								map[route.params[i-1]] = arguments[i];
							}
						});
					}
                    return [$.extend({map: map}, route)];
                }
            }
            this.logger.debug("found no match for \n\tpattern: %s", string);
            return [];
        },
        /**
         * Describe what this method does
         * @private
         * @param {String} paramName Describe this parameter
         * @returns Describe what it returns
         * @type String
         */
        all: function(string){
            this.logger.debug("Using strategy 'all'");
            var routeList = [];
            var route, id, map = {};
            for(id in this.cache){
                route = this.find(id);
                this.logger.debug("checking pattern: %s for string %s", route.pattern, string);
                if(route&&route.pattern&&route.pattern.test&&route.pattern.test(string)){
                    this.logger.debug("found match for \n\tpattern: %s \n\ttarget : %s ", 
                        route.pattern, route.payload.controller);
					if (route.params && route.params.length > 0) {
						//make a parameter map
						string.replace(route.pattern, function(){
							var i;
							for (i = 1; i < arguments.length - 2; i++) {
								map[route.params[i-1]] = arguments[i];
							}
						});
					}
                    routeList.push($.extend({map: map}, route));
                }
            }
            if(routeList.length===0){this.logger.debug("found no match for \n\tpattern: %s", string);}
            return routeList;
        }
        
    });
    
})( jQuery, Claypool);


/**
 * Descibe this class
 * @author 
 * @version $Rev$
 * @requires OtherClassName
 */
(function($, $$){
    
    $$.Factory$Interface = {
        create: function(){ throw new $$.MethodNotImplementedError(); }
    };

})(jQuery, Claypool);

/**
 * Descibe this class
 * @author 
 * @version $Rev$
 * @requires OtherClassName
 */ 
(function($, $$){   
    /**
     *
     */
    $$.Configurable$Interface = {
    	//This is the old school app framework configuration model.  It
    	//gives you the greatest flexibility and power to work with
    	//even legacy code, and allows you to consolidate configuration
    	//to a small number, or just a single, file.  It requires an investment
    	//to get it wired.
        configurationId:null,//an array of two unique string identifing the property 
        configuration:null,//
        configurationUrl:null,//
        configurationType:null,//"json" or "xml"
        getConfig: function(){ throw new $$.MethodNotImplementedError();},
        loadConfig: function(){ throw new $$.MethodNotImplementedError();},
        setConfig: function(){ throw new $$.MethodNotImplementedError();},
        updateConfig: function(){ throw new $$.MethodNotImplementedError();}
    };
})(jQuery, Claypool);

/**
 * Descibe this class
 * @author 
 * @version $Rev$
 * @requires OtherClassName
 */
(function($, $$){    
    /**
    
    */
    $$.Scanner$Interface = {
    	//The scanner is the new school app framework configuration model.  It
    	// relies heavily on convention to reduce the development overhead.  In
    	// the end, it's job is to simply walk a namespace and build the internal
    	// representation of the equivalent hand-wire configuration
        scan:function(){ throw new $$.MethodNotImplementedError();}
    };
})(jQuery, Claypool);

/**
 * Descibe this class
 * @author 
 * @version $Rev$
 * @requires OtherClassName
 */
(function($, $$){    
    /**
     * @constructor
     * By default the factories are configured programatically, using setConfiguration,
     * however all the wiring is available for separating it into a data format like
     * json or xml and retreiving via ajax (though not asynchronously)
     * Factories also manage the cache of objects they create for fast retreival
     * by id, thus the cache is a simple map implementation.
     */
    $$.BaseFactory = function(options){
        $$.extend(this, $$.SimpleCachingStrategy);
        $.extend(true, this, {
            configurationUrl:"./app/configs/config.js",
            configurationType:"json"//or xml
        }, options /* overrides */ );
        this.logger = new $$.Logging.NullLogger();
        return this;
    };
    
    $.extend($$.BaseFactory.prototype,
        $$.SimpleCachingStrategy.prototype, 
        $$.Factory$Interface,
        $$.Configurable$Interface,
        $$.Scanner$Interface,{
        /**
         * returns the portion configuration specified by 'configurationId'
         * @private
         * @param {String} paramName Describe this parameter
         * @returns Describe what it returns
         * @type String
         */
        getConfig: function(){
            if( !this.configuration ){
                //First look for an object name Claypool.Configuration
                this.logger.debug( "Configuration for <%s> has not been set explicitly or has been updated implicitly.",  this.configurationId );
                try{
                	this.logger.debug("$$.Configuration: \n %o", $$.Configuration);
                    if($$.Configuration[this.configurationId]){
                        this.logger.debug("Found Claypool.Configuration");
                        this.configuration = $$.Configuration[this.configurationId];
                    }else if(!$$.Configuration){
                        //it's not specified in js code so look for it remotely
                        this.loadConfig();
                    }
                }catch(e){
                    this.logger.exception(e);
                    throw new $$.ConfigurationError(e);
                }
            }
            return this.configuration;
        },
        /**
         * Describe what this method does
         * @private
         * @param {String} paramName Describe this parameter
         * @returns Describe what it returns
         * @type String
         */
        loadConfig: function(options){
        	options = options||{};
            this.configurationUrl = options.url||this.configurationUrl;
            this.logger.debug("Attempting to load configuration from: %s", this.configurationUrl);
            //a non async call because we need to configure the loggers
            //with this info before they are called!
            var _this = this;
            try{
                jQuery.ajax({
                    type: "Get",
                  url: this.configurationUrl,
                  async: false,
                  data:{},
                  dataType: "json",
        	        success: function(json){
        	            if(_this.configurationUrl == './app/configs/config.js'){
        	                $$.Configuration = $$.Configuration||{};
        	                $.extend(true, $$.Configuration, json);
        	            }else{
        	                _this.setConfig(_this.configurationId,
        	                    json?json:null
    	                    );
	                    }
	                    if(options.callback){
	                    	options.callback($$.Configuration);
	                    }
        	        }
        	    });
    	    }catch(e){
    	        this.logger.exception(e);
                throw new $$.ConfigurationError(e);
    	    }
        },
        /**
         * Describe what this method does
         * @private
         * @param {String} paramName Describe this parameter
         * @returns Describe what it returns
         * @type String
         */
    	setConfig: function(id, configuration){
    	    this.logger.debug("Setting configuration");
            this.configuration = configuration;
            $$.Configuration[id] = configuration;
        },
        /**
         * Describe what this method does
         * @private
         * @param {String} paramName Describe this parameter
         * @returns Describe what it returns
         * @type String
         */
        updateConfig: function(id){
            throw new $$.MethodNotImplementedError();
        }
    });

})(jQuery, Claypool);


/**
 * Descibe this class
 * @author 
 * @version $Rev$
 * @requires OtherClassName
 */
(function($, $$){
    /**
     * @constructor
     */
    $$.Error = function(e, options){
        $.extend(true, this, e||new Error());
        this.name = (options&&options.name?options.name:"Claypool.UnknownError") +
            " > Claypool.Error" + (this.name?(" > "+this.name):"") ;
        this.message = (options&&options.name?options.name:"No Message Provided \n Nested exception is:\n\t") +
            (this.message||"UnknownError");
    };
    
})(jQuery, Claypool);

/**
 * Descibe this class
 * @author 
 * @version $Rev$
 * @requires OtherClassName
 */
(function($, $$){
    /**
     * @constructor
     */
    $$.ConfigurationError = function(e, options){
        var details = {
            name:"Claypool.ConfigurationError",
            message:"An error occured trying to locate or load the system configuration."
        };
        $.extend( this, new $$.Error(e, options?{
            name:(options.name?(options.name+" > "):"")+details.name,
            message:(options.message?(options.message+" \n "):"")+details.message
        }:details));
    };
    
})(jQuery, Claypool);
        

/**
 * Descibe this class
 * @author 
 * @version $Rev$
 * @requires OtherClassName
 */
(function($, $$){
    /**
     * @constructor
     */
    $$.MethodNotImplementedError = function(e, options){
        var details = {
            name:"Claypool.MethodNotImplementedError",
            message:"Method not implemented."
        };
        $.extend( this, new $$.Error(e, options?{
            name:(options.name?(options.name+" > "):"")+details.name,
            message:(options.message?(options.message+" \n "):"")+details.message
        }:details));
    };
    
})(jQuery, Claypool);
        

/**
 * Descibe this class
 * @author 
 * @version $Rev$
 * @requires OtherClassName
 */
(function($, $$){
    /**
     * @constructor
     */
    $$.NameResolutionError = function(e, options){
        var details = {
            name:"Claypool.NameResolutionError",
            message:"Unexpected error resolving name."
        };
        $.extend( this, new $$.Error(e, options?{
            name:(options.name?(options.name+" > "):"")+details.name,
            message:(options.message?(options.message+" \n "):"")+details.message
        }:details));
    };
    
})(jQuery, Claypool);

/**
 * Descibe this class
 * @author 
 * @version $Rev$
 * @requires OtherClassName
 */
(function($, $$){
    var globalContext = [],
        guid = 0,
        plugins = {},
        env;
        
    $.extend(plugins, {
	    /**
	     * Describe what this method does
	     * @private
	     * @param {String} paramName Describe this parameter
	     * @returns Describe what it returns
	     * @type String
	     */
        $:function(id, value){
            var a,i; 
			//support for namespaces
            if(value === undefined){
                //search the contexts in priority order
                a = null;
                for(i=0;i<globalContext.length;i++){
                    a = globalContext[i]().get(id);
                    if(a){return a;}
                } return null;
            }else{
                globalContext[0]().put(id, value);
            }
        },
	    /**
	     * Describe what this method does
	     * @private
	     * @param {String} paramName Describe this parameter
	     * @returns Describe what it returns
	     * @type String
	     */
        register: function(context, priority){
            if( Math.abs(priority) > (globalContext.length-1)/2 ){
                //should be claypool.application but possible to modify
                if(priority === 0 && $.isFunction(context.getContext)){
                    globalContext[0]=context.getContext;
                    
                }else if(priority !== 0 ){
                    //wrap the global context
                    if($.isFunction(context.getContext)){
                        globalContext.push(context.getContext);
                    }
                    if($.isFunction(context.getCachedContext)){
                        globalContext.unshift(context.getCachedContext);
                    }
                }
            }
        },
        /**
         * Describe what this method does
         * @private
         * @param {String} paramName Describe this parameter
         * @returns Describe what it returns
         * @type String
         */
        uuid: function(){
            return new Date().getTime()+"_"+(++guid)+"_"+Math.round(Math.random()*100000000);
        },
        /**
         * Describe what this method does
         * @private
         * @param {String} paramName Describe this parameter
         * @returns Describe what it returns
         * @type String
         */
        resolve: function(namespacedName){
            var _resolver;
            var namespaces;
            var target; //the resolved object/function/array/thing or null
            var i;
            try{
                _resolver = function(name){
                    return this[name];
                };
                namespaces = namespacedName.split('.');
                target = null;
                for( i = 0; i < namespaces.length; i++){
                    target = _resolver.call(target,namespaces[i]);
                    if(target === undefined){
                        return target;
                    }
                }
                return target;
            }catch(e){
                throw new $$.NameResolutionError(e);
            }
        },
	    /**
	     * Describe what this method does
	     * @private
	     * @param {String} paramName Describe this parameter
	     * @returns If no arguments are given this function returns the entire configuration object.
	     *          If a single arg is present it return the resolved portion of the subconfiguration.
	     *          Otherwise it treats the first arg as the name of the subconfiguration and the
	     *          second arg as an object or array to extend or merge respectively into the subconfiguration.
	     * @type String
	     */
        config: function(){
            var config, subconfig;
            if(arguments.length === 0){
                return $$.Configuration;
            }else if(arguments.length === 1 && typeof(arguments[0]) == "string"){
                return $.resolve("Claypool.Configuration."+arguments[0]);
            }else{
                config = $.resolve("Claypool.Configuration."+arguments[0]);
                if(config){
                    subconfig = arguments[1];
                    if(subconfig instanceof Array){
                        config = $.merge(config, subconfig);
                    }else if(subconfig instanceof  Object){
                        config = $.extend(true, config, subconfig);
                    }
                }
            }
            return this;//chain
        },
        /**
         * Describe what this method does
         * @private
         * @param {String} paramName Describe this parameter
         * @returns Describe what it returns
         * @type String
         */
         env: function(){
             var applocation,
                 automap;
             //an environment is set or defined by calling
             //$.env('defaults', 'client.dev')
             if(arguments.length == 2 ){
                 //env is not necessarily flat so deep extension may be necessary
                 env = $.extend( true, env||{}, 
                     $.config('env.'+arguments[0]),
                     $.config('env.'+arguments[1]));
                 return env;
             }else if (arguments.length === 0){
                //automatic environment detection via location introspection
                //is based on an excellent contribution from
                //Gabriel Birke
                automap = $.config('env.automap');
                //attempt to auto-configure environment based on window location
                for(applocation in automap){
                    if(new RegExp(applocation).exec(window.location)){
                        return $.env('defaults', automap[applocation]);
                    }
                }
             }else{
                 if(arguments.length === 1 && !(typeof(arguments[0])=='string')){
                    //a convenience method for defining environments
					//like $.config('env',{});
					return $.config('env', arguments[0]);
                 }
                 return env[arguments[0]]||null;
             }
             return null;
         }
        //TODO add plugin convenience methods for creating factory;
        //factory : function(){}
        //TODO add plugin convenience methods for creating context;
        //context : function(){}
        /* Deprecated: clashes with jQuery.cache and never used internally
         * Not even a good plugin in jquery spirit, so not trying to provide
         * equivalent with different name unless someone notices.
         * Thanks to Olly Wenn for noting this conflict 
        cache: function(options){
            return new $$.SimpleCachingStrategy(options);
        } 
        */
        
    });
    $.extend($$, plugins);
    $.extend($, plugins);
    
    //Add an event listener for claypool loaded so we can initialize loggers
})(jQuery, Claypool);
Claypool.Logging={
/*
 * Claypool @VERSION@ - A Web 1.6180339... Javascript Application Framework
 *
 * Copyright (c) 2008 Chris Thatcher (claypooljs.com)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * $Date: 2008-08-06 14:34:08 -0400 (Wed, 06 Aug 2008) $
 * $Rev: 265 $
 */
 
    //erase safety provided by core
    NullLogger  : null,
    getLogger   : null
};

/**
 * Descibe this class
 * @author 
 * @version $Rev$
 * @requires OtherClassName
 */
(function($, $$, $$Log){
    
    $.extend($$Log, {
        //Static Closure Method (uses a singleton pattern)
        loggerFactory:null,
        getLogger: function(category){
            if(!$$Log.loggerFactory){
                $$Log.loggerFactory = new $$Log.Factory();
            }
            if($$Log.updated){
                $$Log.loggerFactory.updateConfig();
                $$Log.updated = false;
            }
            return $$Log.loggerFactory.create(category);
        }
    });
    
})(  jQuery, Claypool, Claypool.Logging );


/**
 * Descibe this class
 * @author 
 * @version $Rev$
 * @requires OtherClassName
 */
(function($, $$, $$Log){
	/**
	 * @constructor
	 */
	$$Log.Level = {
        DEBUG:0,
        INFO:1,
        WARN:2,
        ERROR:3,
        NONE:4
    };
	
})(  jQuery, Claypool, Claypool.Logging );


/**
 * Descibe this class
 * @author 
 * @version $Rev$
 * @requires OtherClassName
 */
(function($, $$, $$Log){
	/**
	 * @constructor
	 */
    $$Log.Logger$Interface = {
        debug:      function(){
            throw new $$.MethodNotImplementedError();
        },
        info:       function(){
            throw new $$.MethodNotImplementedError();
        },
        warn:       function(){
            throw new $$.MethodNotImplementedError();
        },
        error:      function(){
            throw new $$.MethodNotImplementedError();
        },
        exception:  function(){
            throw new $$.MethodNotImplementedError();
        }
    };
	
})(  jQuery, Claypool, Claypool.Logging );


/**
 * Descibe this class
 * @author 
 * @version $Rev$
 * @requires OtherClassName
 */
(function($, $$, $$Log){
	/**
	 * @constructor
	 */
    $$Log.NullLogger = function(){
        //for speed why bother implement the interface, just null the functions
        var nullFunction = function(){
            return this;
        };
        $.extend(this,  {
            debug:nullFunction,
            info:nullFunction,
            warn:nullFunction,
            error:nullFunction,
            exception:nullFunction
        });
    };
	
})(  jQuery, Claypool, Claypool.Logging );


/**
 * Descibe this class
 * @author 
 * @version $Rev$
 * @requires OtherClassName
 */
(function($, $$, $$Log){
    /**
     * @constructor
     */
    $$Log.Logger = function(options){
        this.category   = "root";
        this.level      = null;
        try{
            $.extend(true, this, options);
            this.level = $$Log.Level[
                this.level?this.level:"NONE"
            ];
            //allow for appender extension, eg multiple appenders and custom appenders
            //appenders are expected to be specified as string representations of the
            //function name, eg 'Claypool.Logging.ConsoleAppender'
            try{
                this.appender = new ($.resolve(this.appender||"Claypool.Logging.ConsoleAppender"))(options);
            }catch(e){
                try{ 
                    this.appender = new $$Log.ConsoleAppender(options);
                }catch(e){ 
                    this.appender = new $$Log.SysOutAppender(options); 
                }
            }
            return this;
        }catch(e){
            return new $$Log.NullLogger();
        }
    };
    
    //All logging calls are chainable
    $.extend($$Log.Logger.prototype, 
        $$Log.Logger$Interface,{
        /**
         * Describe what this method does
         * @private
         * @param {String} paramName Describe this parameter
         * @returns Describe what it returns
         * @type String
         */
        debug: function(){
            if(this.level<=$$Log.Level.DEBUG){
              this.appender.append("DEBUG",this.category,arguments);  
              return this;
            }else{ 
                this.debug = function(){
                    return this;
                }; 
            }
            return this;
        },
        /**
         * Describe what this method does
         * @private
         * @param {String} paramName Describe this parameter
         * @returns Describe what it returns
         * @type String
         */
        info: function(){
            if(this.level<=$$Log.Level.INFO){
              this.appender.append("INFO",this.category,arguments);  
              return this;
            }else{ 
                this.debug = function(){
                    return this;
                }; 
            }
            return this;
        },
        /**
         * Describe what this method does
         * @private
         * @param {String} paramName Describe this parameter
         * @returns Describe what it returns
         * @type String
         */
        warn: function(){
            if(this.level<=$$Log.Level.WARN){
              this.appender.append("WARN",this.category,arguments);  
              return this;
            }else{ this.debug = function(){return this;}; }
            return this;
        },
        /**
         * Describe what this method does
         * @private
         * @param {String} paramName Describe this parameter
         * @returns Describe what it returns
         * @type String
         */
        error: function(){
            if(this.level<=$$Log.Level.ERROR){
              this.appender.append("ERROR",this.category,arguments);  
              return this;
            }else{ this.debug = function(){return this;}; }
            return this;
        },
        /**
         * Describe what this method does
         * @private
         * @param {String} paramName Describe this parameter
         * @returns Describe what it returns
         * @type String
         */
        exception: function(e){
            if(this.level < $$Log.Level.NONE){
                if(e){
                    this.appender.append("EXCEPTION", this.category,e); 
              		return this;
          		}
            }else{ 
                this.debug = function(){
                    return this;
                }; 
            }
            return this;
        }
    });

})(  jQuery, Claypool, Claypool.Logging );



/**
 * Descibe this class
 * @author 
 * @version $Rev$
 * @requires OtherClassName
 */
(function($, $$, $$Log){
    /**
     * @constructor
     */
    $$Log.Appender$Interface = {
        formatter:null,
        append: function(level,category,message){
            throw new $$.MethodNotImplementedError();
        }
    };
})(  jQuery, Claypool, Claypool.Logging );
        
        
        
/**
 * Descibe this class
 * @author 
 * @version $Rev$
 * @requires OtherClassName
 */
(function($, $$, $$Log){
    /**
     * @constructor
     */
    $$Log.SysOutAppender = function(options){
        /**This function is intentionally written to throw an error when called*/
        var rhinoCheck = function(){ var isRhino = null;isRhino.toString();};
        /**This is probably rhino if these are defined*/
        if($.isFunction(print) && (window.load !== undefined) && $.isFunction(window.load) ){
            try{
                rhinoCheck();
            }catch(caught){/**definitely rhino if this is true*/
                if(caught.rhinoException){
                    $.extend(true, this, options);
                    this.formatter = new $$Log.DefaultFormatter(options);
                    return this;
                }
            }
        }
        throw new $$Log.NoAppendersAvailableError();
    };
        
    $.extend($$Log.SysOutAppender.prototype, 
        $$Log.Appender$Interface, {
        /**
         * Describe what this method does
         * @private
         * @param {String} paramName Describe this parameter
         * @returns Describe what it returns
         * @type String
         */
        append: function(level,category,message){
            //print(level +"\n"+ category +"\n"+ message[0]);
            switch(level){
                case "DEBUG":
                    print(this.formatter.format(level, category, message));break;
                case "INFO":
                    print(this.formatter.format(level, category, message));break;
                case "WARN":
                    print(this.formatter.format(level, category, message));break;
                case "ERROR":
                    print(this.formatter.format(level, category, message));break;
                case ("EXCEPTION"):
                    //message is e
                    var msg = message&&message.rhinoException?"\n\t"      + message.rhinoException.message +
                        "\tcolumn: "  + message.rhinoException.columnNumber() + 
                        "\tline: "  + message.rhinoException.lineNumber()  : "UNKNOWN RUNTIME ERROR";
                    print(this.formatter.format(level, category,  msg ));
                    break;
            }
        }
    });
    
})(  jQuery, Claypool, Claypool.Logging );

        
/**
 * Descibe this class
 * @author 
 * @version $Rev$
 * @requires OtherClassName
 */
(function($, $$, $$Log){
    /**
     * @constructor
     */
    $$Log.ConsoleAppender = function(options){
        var test;
        try{
            if(window&&window.console&&window.console.log){
                try{
                    if( 'Envjs' in window ){
                    	return new $$Log.SysOutAppender(options);
					}
                }catch(e){
                    //swallow
                }
                $.extend(true, this, options);
                this.formatter = new $$Log.FireBugFormatter(options);
                return this;
            }else{
                return new $$Log.SysOutAppender(options);
            }
        }catch(e){
            //Since the console and print arent available use a null implementation.
            //Thanks to Brandon Smith for finding this bug!
            throw e;
        }
        return this;
    };
    
    $.extend( $$Log.ConsoleAppender.prototype, 
        $$Log.Appender$Interface, {
        /**
         * Describe what this method does
         * @private
         * @param {String} paramName Describe this parameter
         * @returns Describe what it returns
         * @type String
         */
        append: function(level, category, message){
            switch(level){
                case ("DEBUG"):
                    console.log.apply(console, this.formatter.format(level, category, message));
                    break;
                case ("INFO"):
                    console.info.apply(console, this.formatter.format(level, category, message));
                    break;
                case ("WARN"):
                    console.warn.apply(console, this.formatter.format(level, category, message));
                    break;
                case ("ERROR"):
                    console.error.apply(console,this.formatter.format(level, category, message));
                    break;
                case ("EXCEPTION"):
                    //message is e
                    console.error.apply(console, this.formatter.format(level, category, 
                        message.message?[message.message]:[])); 
                    console.trace();
                    break;
            }
        }
    });
})(  jQuery, Claypool, Claypool.Logging );



/**
 * Descibe this class
 * @author 
 * @version $Rev$
 * @requires OtherClassName
 */
(function($, $$, $$Log){
	/**
	 * @constructor
	 */
    $$Log.Formatter$Interface = {
        format: function(level, category, objects){
            throw new $.MethodNotImplementedError();
        }
    };
})(  jQuery, Claypool, Claypool.Logging );
	    

/**
 * Descibe this class
 * @author 
 * @version $Rev$
 * @requires OtherClassName
 */
(function($, $$, $$Log){
    /**
     * @constructor
     */
    $$Log.FireBugFormatter = function(options){
        $.extend(true, this, options);
    };
    
    $.extend($$Log.FireBugFormatter.prototype, 
        $$Log.Formatter$Interface, {
        /**
         * Describe what this method does
         * @private
         * @param {String} paramName Describe this parameter
         * @returns Describe what it returns
         * @type String
         */
        getDateString: function(){
            return " ["+ new Date().toUTCString() +"] ";
        },
        /**
         * Describe what this method does
         * @private
         * @param {String} paramName Describe this parameter
         * @returns Describe what it returns
         * @type String
         */
        format: function(level, category, objects){
            var msgPrefix = category + " "+level+": "+ this.getDateString();
            objects = (objects&&objects.length&&(objects.length>0))?objects:[];
            var msgFormat = (objects.length > 0)?objects[0]:null;
            if (typeof(msgFormat) != "string"){
                objects.unshift(msgPrefix);
            }else{
                objects[0] = msgPrefix + msgFormat;
            }
            return objects;
        }
    });
    
})(  jQuery, Claypool, Claypool.Logging );

/**
 * Descibe this class
 * @author 
 * @version $Rev$
 * @requires OtherClassName
 */
(function($, $$, $$Log){
    
    var parseFormatRegExp       = /((^%|[^\\]%)(\d+)?(\.)([a-zA-Z]))|((^%|[^\\]%)([a-zA-Z]))/,
        functionRenameRegExp    = /function ?(.*?)\(/,
        objectRenameRegExp      = /\[object (.*?)\]/;
    
    /**
     * @constructor
     */
    $$Log.DefaultFormatter = function(options){
        $.extend(true, this, options);
    };
    
    $.extend($$Log.DefaultFormatter.prototype,
        $$Log.Formatter$Interface,{
        /**
         * Describe what this method does
         * @private
         * @param {String} paramName Describe this parameter
         * @returns Describe what it returns
         * @type String
         */
        getDateString: function(){
            return " ["+ new Date().toUTCString() +"] ";
        },
        /**
         * Describe what this method does
         * @private
         * @param {String} paramName Describe this parameter
         * @returns Describe what it returns
         * @type String
         */
        format: function (level, category, objects){
            var msgPrefix = " "+level+":  " +this.getDateString() + "{"+category+"} ";
            var msg = [msgPrefix?msgPrefix:""];
            var format = objects[0];
            var objIndex = 0;
            if (typeof(format) != "string"){
                format = "";
                objIndex = -1;
            }
            var parts = this.parseFormat(format);
            var i;
            for (i = 0; i < parts.length; ++i){
                if (parts[i] && typeof(parts[i]) == "object"){
                    parts[i].appender.call(this,objects[++objIndex], msg);
                }else{
                    this.appendText(parts[i], msg);
                }
            }
            for (i = objIndex+1; i < objects.length; ++i){
                this.appendText(" ", msg);
                if (typeof(objects[i]) == "string"){
                    this.appendText(objects[i], msg);
                }else{
                    this.appendObject(objects[i], msg);
                }
            }
            return msg.join("");
        },
        /**
         * Describe what this method does
         * @private
         * @param {String} paramName Describe this parameter
         * @returns Describe what it returns
         * @type String
         */
        parseFormat: function(format){
            var parts = [];
            var appenderMap = {s: this.appendText, d: this.appendInteger, i: this.appendInteger, f: this.appendFloat};
            var type;
            var appender;
            var precision;
            var m;
            for (m = parseFormatRegExp.exec(format); m; m = parseFormatRegExp.exec(format)) {
                type = m[8] ? m[8] : m[5];
                appender = type in appenderMap ? appenderMap[type] : this.appendObject;
                precision = m[3] ? parseInt(m[3], 10) : (m[4] == "." ? -1 : 0);
                parts.push(format.substr(0, m[0][0] == "%" ? m.index : m.index+1));
                parts.push({appender: appender, precision: precision});
                format = format.substr(m.index+m[0].length);
            }
            parts.push(format);
            return parts;
        },
        /**
         * Describe what this method does
         * @private
         * @param {String} paramName Describe this parameter
         * @returns Describe what it returns
         * @type String
         */
        objectToString: function (object){
            try{ return object+"";}
            catch (e){ return null; }
        },
        /**
         * Describe what this method does
         * @private
         * @param {String} paramName Describe this parameter
         * @returns Describe what it returns
         * @type String
         */
        appendText: function (object, msg){
            msg.push(this.objectToString(object));
        },
        /**
         * Describe what this method does
         * @private
         * @param {String} paramName Describe this parameter
         * @returns Describe what it returns
         * @type String
         */
        appendNull: function (object, msg){
            msg.push(this.objectToString(object));
        },
        /**
         * Describe what this method does
         * @private
         * @param {String} paramName Describe this parameter
         * @returns Describe what it returns
         * @type String
         */
        appendString: function (object, msg){
            msg.push(this.objectToString(object));
        },
        /**
         * Describe what this method does
         * @private
         * @param {String} paramName Describe this parameter
         * @returns Describe what it returns
         * @type String
         */
        appendInteger: function (object, msg){
            msg.push(this.objectToString(object));
        },
        /**
         * Describe what this method does
         * @private
         * @param {String} paramName Describe this parameter
         * @returns Describe what it returns
         * @type String
         */
        appendFloat: function (object, msg){
            msg.push(this.objectToString(object));
        },
        /**
         * Describe what this method does
         * @private
         * @param {String} paramName Describe this parameter
         * @returns Describe what it returns
         * @type String
         */
        appendFunction: function (object, msg){
            var m = functionRenameRegExp.exec(this.objectToString(object));
            var name = m ? m[1] : "function";
            msg.push(this.objectToString(name));
        },
        /**
         * Describe what this method does
         * @private
         * @param {String} paramName Describe this parameter
         * @returns Describe what it returns
         * @type String
         */
        appendObject: function (object, msg){
            try{
                if (object === undefined){
                    this.appendNull("undefined", msg);
                }else if (object === null){
                    this.appendNull("null", msg);
                }else if (typeof object == "string"){
                    this.appendString(object, msg);
                }else if (typeof object == "number"){
                    this.appendInteger(object, msg);
                }else if (typeof object == "function"){
                    this.appendFunction(object, msg);
                }else if (object.nodeType == 1){
                    this.appendSelector(object, msg);
                }else if (typeof object == "object"){
                    this.appendObjectFormatted(object, msg);
                }else{ this.appendText(object, msg); }
            }catch (e){/*Do Nothing*/}
        },
        /**
         * Describe what this method does
         * @private
         * @param {String} paramName Describe this parameter
         * @returns Describe what it returns
         * @type String
         */
        appendObjectFormatted: function (object, msg){
            var text = this.objectToString(object);
            var m = objectRenameRegExp.exec(text);
            msg.push( m ? m[1] : text);
        },
        /**
         * Describe what this method does
         * @private
         * @param {String} paramName Describe this parameter
         * @returns Describe what it returns
         * @type String
         */
        appendSelector: function (object, msg){
            msg.push(object.nodeName.toLowerCase());
            if (object.id){ msg.push(object.id);}
            if (object.className){ msg.push(object.className);}
            msg.push('</span>');
        },
        /**
         * Describe what this method does
         * @private
         * @param {String} paramName Describe this parameter
         * @returns Describe what it returns
         * @type String
         */
        appendNode: function (node, msg){
            var attr;
            var i;
            var child;
            if (node.nodeType == 1){
                msg.push('<', node.nodeName.toLowerCase(), '>');
                for (i = 0; i < node.attributes.length; ++i){
                    attr = node.attributes[i];
                    if (!attr.specified){ continue; }
                    msg.push(attr.nodeName.toLowerCase(),'="',attr.nodeValue,'"');
                }
                if (node.firstChild){
                    for (child = node.firstChild; child; child = child.nextSibling){
                        this.appendNode(child, html);
                    }
                    msg.push('</',  node.nodeName.toLowerCase(), '>');
                } else {
                    msg.push('/>');
                }
            }else if (node.nodeType == 3) {
                msg.push( node.nodeValue );
            }
        }
    });
})(  jQuery, Claypool, Claypool.Logging );


/**
 * Descibe this class
 * @author 
 * @version $Rev$
 * @requires OtherClassName
 */
(function($, $$, $$Log){
	/**
	 * @constructor
	 */
	$$Log.Factory = function(options){
        $$.extend(this, $$.BaseFactory);
        this.configurationId = 'logging';
        $.extend(true, this, options);
        //The LogFactory is unique in that it will create its own logger
        //so that it's events can be logged to console or screen in a
        //standard way.
        this.logger = new $$Log.Logger({
            category:"Claypool.Logging.Factory",
            level:"INFO",
            appender:"Claypool.Logging.ConsoleAppender"
        });
        this.attemptedConfigure = false;
    };
    
    $.extend($$Log.Factory.prototype,  
        $$.BaseFactory.prototype, {
        /**
         * Describe what this method does
         * @private
         * @param {String} paramName Describe this parameter
         * @returns Describe what it returns
         * @type String
         */
        create: function(category){
            var categoryParts,
                subcategory,
                loggerConf,
                rootLoggerConf;
            if(!this.configuration){
                //Only warn about lack of configuration once
                if(!this.attemptedConfigure){
                    this.logger.warn("Claypool Logging was not initalized correctly. Logging will not occur unless initialized.");
                }
                this.attemptedConfigure = true;
                return new $$Log.NullLogger();
            }else{
                //Find the closest configured category
                categoryParts = category.split(".");
                for(i=0;i<categoryParts.length;i++){
                    subcategory = categoryParts.slice(0,categoryParts.length-i).join(".");
                    loggerConf = this.find(subcategory);
                    if(loggerConf !== null){
                        //The level is set by the closest subcategory, but we still want the 
                        //full category to display when we log the messages
                        loggerConf.category = category;
                        //TODO: we need to use the formatter/appender specified in the config
                        return new $$Log.Logger( loggerConf );
                    }
                }
                //try the special 'root' category
                rootLoggerConf = this.find('root');
                this.logger.debug('root logging category is set to %s', rootLoggerConf);
                if(rootLoggerConf !== null){
                    //The level is set by the closest subcategory, but we still want the 
                    //full category to display when we log the messages
                    rootLoggerConf.category = category;
                    return new $$Log.Logger(rootLoggerConf);
                }
            }
            //No matching category found
            this.logger.warn("No Matching category: %s Please configure a root logger.", category);
            return new $$Log.NullLogger();
        },
        /**
         * Describe what this method does
         * @private
         * @param {String} paramName Describe this parameter
         * @returns Describe what it returns
         * @type String
         */
        updateConfig: function(){
            var loggingConfiguration;
            var logconf;
            var i;
            try{
                this.logger.debug("Configuring Claypool Logging");
                this.clear();
                loggingConfiguration = this.getConfig()||[];
                for(i=0;i<loggingConfiguration.length;i++){
                    try{
                        logconf = loggingConfiguration[i];
                        this.add( logconf.category, logconf );
                    }catch(ee){
                        this.logger.exception(ee);
                        return false;
                    }
                }
            }catch(e){
                this.logger.exception(e);
                throw new $$Log.ConfigurationError(e);
            }
            return true;
        }
    });
	    
})(  jQuery, Claypool, Claypool.Logging );


/**
 * Descibe this class
 * @author 
 * @version $Rev$
 * @requires OtherClassName
 */
(function($, $$, $$Log){
	/**
	 * @constructor
	 */
    $$Log.ConfigurationError = function(e, options){
        $.extend( this, new $$.ConfigurationError(e, options||{
            name:"Claypool.Logging.ConfigurationError",
            message: "An error occured trying to configure the logging system."
        }));
    };
})(  jQuery, Claypool, Claypool.Logging );

/**
 * Descibe this class
 * @author 
 * @version $Rev$
 * @requires OtherClassName
 */
(function($, $$, $$Log){
	/**
	 * @constructor
	 */
    $$Log.NoAppendersAvailableError = function(e, options){
        $.extend( this, new $$.Error(e, options||{
            name:"Claypool.Logging.NoAppendersAvailableError",
            message: "An error occured trying to configure the logging system."
        }));
    };
})(  jQuery, Claypool, Claypool.Logging );
	

/**
 * Descibe this class
 * @author 
 * @version $Rev$
 * @requires OtherClassName
 */
(function($, $$, $$Log){
	/**
	 * @constructor
	 */
	$.extend($, {
	    logger  : function(name){
	        return $$Log.getLogger(name);
	    },
		//careful, names are very similiar!
        logging  : function(){
            if(arguments.length === 0){
                return $.config('logging');
            }else{
                $$Log.updated = true;
                return $.config('logging', arguments[0]);
            }
        }
	});
	
	var $log;
	
	$.extend($, {
	    debug  : function(){
	        $log = $log||$.logger("jQuery");
	        $log.debug.apply($log,arguments);
	        return this;
	    },
	    info  : function(){
	        $log = $log||$.logger("jQuery");
	        $log.info.apply($log,arguments);
	        return this;
	    },
	    warn  : function(){
	        $log = $log||$.logger("jQuery");
	        $log.warn.apply($log,arguments);
	        return this;
	    },
	    error  : function(){
	        $log = $log||$.logger("jQuery");
	        $log.error.apply($log,arguments);
	        return this;
	    },
	    exception  : function(){
	        $log = $log||$.logger("jQuery");
	        $log.exception.apply($log,arguments);
	        return this;
	    }
	});
	
	
})(  jQuery, Claypool, Claypool.Logging );
Claypool.Application={
/*
 * Claypool.Application @VERSION@ - A Web 1.6180339... Javascript Application Framework
 *
 * Copyright (c) 2008 Chris Thatcher (claypooljs.com)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * $Date: 2008-08-06 14:34:08 -0400 (Wed, 06 Aug 2008) $
 * $Rev: 265 $
 */
};

/**
 * Descibe this class
 * @author 
 * @version $Rev$
 * @requires OtherClassName
 */
(function($, $$, $$App){
    
    var CONTEXT_PRIORITY = 0;
    $$App.context = null;
	
	
	$.extend( $$App, {
	    /**
	     * Describe what this method does
	     * @private
	     * @param {String} paramName Describe this parameter
	     * @returns Describe what it returns
	     * @type String
	     */
	    getContext: function(){
	        if(!$$App.context){
	            $$App.context = new $$App.Context();
	        }
	        return $$App.context;
	    },
	    /**
	     * Describe what this method does
	     * @private
	     * @param {String} paramName Describe this parameter
	     * @returns Describe what it returns
	     * @type String
	     */
	    Initialize: function(callback){
	        /**
	         * we intentionally do not attempt to try or catch anything here
	         * If loading the current application.context fails, the app needs to fail
	         */
	        $(document).trigger("claypool:initialize", [$$App]);
	        //Allow extension of Initialize via callback
	        if(callback){callback();}
	        //Provide standard event hook
	        $(document).trigger("ApplicationLoaded");
	        /**now return the applicationContext ready to use*/
	        return $$App.getContext();
	    },
	    /**
	     * Describe what this method does
	     * @private
	     * @param {String} paramName Describe this parameter
	     * @returns Describe what it returns
	     * @type String
	     */
	    Reinitialize: function(callback){
	        /**we probably should try/catch here*/
	        $(document).trigger("claypool:reinitialize", [$$App]);
	        //Allow extension of Initialize via callback
	        if(callback){callback();}
	        //Provide standard event hook
	        $(document).trigger("ApplicationReloaded");
	        /**now return the applicationContext ready to use*/
	        return $$App.getContext();
	    }
    });
    
	//Register the Application Context
	$.register($$App, CONTEXT_PRIORITY);
    
    
    $$.Commands = {
    // An object literal plugin point for providing plugins on
    // the Claypool namespace.  This object literal is reserved for
    // commands which have been integrated as well established
    // and have been included in the jQuery-Clayool repository
    // as official
    };
	
})(  jQuery, Claypool, Claypool.Application );


/**
 * Descibe this class
 * @author 
 * @version $Rev$
 * @requires OtherClassName
 */
(function($, $$, $$App){
    /**
     * @constructor
     */
    $$App.Context = function(options){
        $$.extend(this, $$.Context);
        this.contextContributors = {};
        $.extend(true, this, options);
        this.logger = $.logger("Claypool.Application.Context");
    };
    
    $.extend($$App.Context.prototype,
        $$.Context.prototype,{
        get: function(id){
            /**we always look in the global first and then through contributors in order*/
            var contextObject,
            	contributor,
				ns;
            try{
				//support for namespaces
				ns = typeof(id)=='string'&&id.indexOf('#')>-1?
					[id.split('#')[0],'#'+id.split('#')[1]]:['', id];
				//namespaced app cache
				if(!this.find(ns[0])){
					this.add(ns[0], new $$.SimpleCachingStrategy());
				}
                this.logger.debug("Searching application context for object: %s" ,id);
                contextObject = null;
                contextObject = this.find(ns[0]).find(ns[1]);
                if(contextObject !== null){
                    this.logger.debug("Found object in global application context. Object id: %s", id);
                    return contextObject;
                }else{
                    this.logger.debug("Searching for object in contributed application context. Object id: %s", id);
                    for(contributor in this.contextContributors){
                        this.logger.debug("Checking Application Context Contributor %s." , contributor);
                        contextObject = this.contextContributors[contributor].get(id);
                        if(contextObject !== null){
                            this.logger.debug("Found object in contributed application context. Object id: %s", id);
                            return contextObject;
                        }
                    }
                }
                this.logger.debug("Cannot find object in any application context. Object id: %s", id);
                return null;
            }catch(e){
                throw new $$App.ContextError(e);
            }
        },
        put: function(id, object){
			//support for namespaces
			var ns, nscache;
			ns = typeof(id)=='string'&&id.indexOf('#')>-1?
				[id.split('#')[0],'#'+id.split('#')[1]]:['', id];
			//namespaced app cache
			nscache = this.find(ns[0]);
			if(!nscache){
				nscache = new $$.SimpleCachingStrategy();
				this.add(ns[0], nscache);
			}
			if(nscache.find(ns[0])){
				nscache.remove(ns[1]);
			}
            this.logger.debug("Adding object to global application context %s", id);
            nscache.add(ns[1], object);
        }
    });

})(  jQuery, Claypool, Claypool.Application );

/**
 * Extending this class, a container is searched using its 'get' method when
 * anyone looks for something in the applicationContext
 * @author 
 * @version $Rev$
 * @requires OtherClassName
 */
(function($, $$, $$App){
        /**
         * @constructor
         */
        $$App.ContextContributor = function(options){
            //??TODO: this works but, uh... why? $.extend( this, new $.ContextContributor(options));
            $$.extend(this, $$.ContextContributor);
            $.extend(true, this, options);
            this.logger = $.logger("Claypool.Application.ContextContributor");
            return this;
        };
        
        $.extend($$App.ContextContributor.prototype, 
            $$.ContextContributor.prototype,{
            registerContext: function(id){
                this.logger.info("Registering Context id: %s", id);
                $$App.getContext().contextContributors[id] = this;
            }
        });
        
})(  jQuery, Claypool, Claypool.Application );

/**
 * The application context is generally provided by the ioc container
 * but other modules can add to it as well.
 * @author 
 * @version $Rev$
 * @requires OtherClassName
 */
(function($, $$, $$App){
        /**@class*/
        $$App.Aware = function(options){
            $.extend( this, options);
            this.logger = $.logger("Claypool.Application.Aware");
        };
        $.extend($$App.Aware.prototype, {
            /**
             * Describe what this method does
             * @private
             * @param {String} paramName Describe this parameter
             * @returns Describe what it returns
             * @type String
             */
            //TODO: change method name to $ (DONE: was getApplicationContext)
            $: function(){
                return $$App.getContext();
            }
        });
    
})(  jQuery, Claypool, Claypool.Application );


/**
 * Descibe this class
 * @author 
 * @version $Rev$
 * @requires OtherClassName
 */
(function($, $$, $$App){
    /**
     * @constructor
     */
    $$App.ContextError = function(e, options){
        var details = {
            name:"Claypool.Application.ContextError",
            message:"An unexpected error occured while searching the application context."
        };
        $.extend( this, new $$.Error(e, options?{
            name:(options.name?(options.name+" > "):"")+details.name,
            message:(options.message?(options.message+" \n "):"")+details.message
        }:details));
    };
    
})(  jQuery, Claypool, Claypool.Application );

/**
 * Descibe this class
 * @author 
 * @version $Rev$
 * @requires OtherClassName
 */
(function($, $$, $$App){
    
    $.extend($,{
        /**
         * Describe what this method does
         * @private
         * @param {String} paramName Describe this parameter
         * @returns Describe what it returns
         * @type String
         */
        app : function(){
            return $$App.getContext();
        },
        /**
         * Describe what this method does
         * @private
         * @param {String} paramName Describe this parameter
         * @returns Describe what it returns
         * @type String
         */
        boot : function(cb){
            $$App.Initialize(cb);
            return this;
        },
        /**
         * Describe what this method does
         * @private
         * @param {String} paramName Describe this parameter
         * @returns Describe what it returns
         * @type String
         */
        reboot : function(cb){
            $$App.Reinitialize(cb);
            return this;
        },
        /**
         * Describe what this method does
         * @private
         * @param {String} paramName Describe this parameter
         * @returns Describe what it returns
         * @type String
         */
        manage : function(containerName, managedId, callback){
            $(document).bind("claypool:initialize", function(event, context){
                if(!context[managedId]){
                    context[managedId] = new ($.resolve( containerName ))();
                    if(context.ContextContributor && $.isFunction(context.ContextContributor)){
                        context[managedId].registerContext(containerName);
                    }
                }else{
                    context[managedId].factory.updateConfig();
                }
                //allow managed containers to register callbacks post creation
                if(callback && $.isFunction(callback)){
                    callback(context[managedId]);
                }
            }).bind("claypool:reinitialize", function(event, context){
                //TODO: need to do a better job cleaning slate here.
                context[managedId] = new ($.resolve( containerName ))();
                if(context.ContextContributor && $.isFunction(context.ContextContributor)){
                    context[managedId].registerContext(containerName);
                }
                //allow managed containers to register callbacks post creation
                if(callback && $.isFunction(callback)){
                    callback(context[managedId]);
                }
            });
            return this;
        }
    });
	
})(  jQuery, Claypool, Claypool.Application );

Claypool.AOP={
/*
 * Claypool.AOP @VERSION@ - A Web 1.6180339... Javascript Application Framework
 *
 * Copyright (c) 2008 Chris Thatcher (claypooljs.com)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * $Date: 2008-08-06 14:34:08 -0400 (Wed, 06 Aug 2008) $
 * $Rev: 265 $
 * 
 * @projectDescription 	This code is adopted from the jQuery AOP plugin project.  It was incorporated so it
 * 						could be extended and modified to match the overall javascript style of the rest of
 * 						Claypool. Many thanks to it's author(s), as we rely heavily on the code and learned
 * 						a lot from it's integration into Claypool.
 *
 * @author	Christopher Thatcher thatcher.christopher@gmail.com
 * @version	0.1 
 * 
 * The original header is retained below:
 * 
 * 		jQuery AOP - jQuery plugin to add features of aspect-oriented programming (AOP) to jQuery.
 * 		http://jquery-aop.googlecode.com/
 *
 * 		Licensed under the MIT license:
 * 		http://www.opensource.org/licenses/mit-license.php
 *
 * 		Version: 1.0
 */
};
(function($, $$, $$AOP){
    
    $.manage("Claypool.AOP.Container", "claypool:AOP");
    
})(  jQuery, Claypool, Claypool.AOP );

/**
 * Descibe this class
 * @author 
 * @version $Rev$
 * @requires OtherClassName
 */
(function($, $$, $$AOP){
    /**
     * @constructor 
     * @param {Object} options
     *      - options should include pointcut:{target:'Class or instance', method:'methodName or pattern', advice:function }
     */
    $$AOP.Aspect = function(options){
        this.id   = null;
        this.type = null;
        $$.extend(this, $$.SimpleCachingStrategy);
        $.extend(true, this, options);
        this.logger = $.logger("Claypool.AOP.Aspect");
        //only 'first' and 'all' are honored at this point
        //and if it's not 'first' it's 'all'
        this.strategy = this.strategy||"all";
    };
    
    $.extend($$AOP.Aspect.prototype, 
        $$.SimpleCachingStrategy.prototype ,{
        /**
         * Describe what this method does
         * @private
         * @param {String} paramName Describe this parameter
         * @returns Describe what it returns
         * @type String
         */
        weave: function(){
            var _this = this;
            var pattern;
            var targetObject;
            if(!this.target){
                _this.logger.warn( "No pointcut was specified.  Cant weave aspect." );
                return;
            }
            var _weave = function(methodName){
                var pointcut, cutline, details;//new method , old method
                try{
                    _this.logger.debug( "Weaving Advice %s for Aspect %s", methodName, _this.id );
                    
                    _this.hasPrototype = typeof(_this.target.prototype) != 'undefined';
                    cutline = _this.hasPrototype ? 
                        _this.target.prototype[methodName] : 
                        _this.target[methodName];
                    pointcut = _this.advise(cutline, _this._target, methodName);
                    if(!_this.hasPrototype){
                        _this.target[methodName] = pointcut;
                    }else{ 
                        _this.target.prototype[methodName] = pointcut;
                    }
                    details = { 
                        pointcut:pointcut,
                        cutline:cutline,
						method: methodName,
						target: _this._target
                    };
					return details;
                }catch(e){
                    throw new $$AOP.WeaveError(e, "Weave");
                }
            };
            //we dont want an aspect to be woven multiple times accidently so 
            //its worth a quick check to make sure the internal cache is empty.
            if(this.size===0){//size is empty
                pattern = new RegExp(this[this.type?this.type:"method"]);
                targetObject = this.target.prototype?this.target.prototype: this.target;
                for(var f in targetObject){
                    if($.isFunction(targetObject[f])&&pattern.test(f)){
                        this.logger.debug( "Adding aspect to method %s", f );
                        this.add($.uuid(), _weave(f));
                        if(this.strategy==="first"){break;}
                    }
                }
            } return this;
        },
        /**
         * Describe what this method does
         * @private
         * @param {String} paramName Describe this parameter
         * @returns Describe what it returns
         * @type String
         */
        unweave: function(){
            var aspect;
            try{
                for(var id in this.cache){
                    aspect = this.find(id);
                   if(!this.hasPrototype){
                        this.target[this.method] = aspect.cutline;
                    } else {
                        this.target.prototype[this.method] = aspect.cutline;
                    } this.hasPrototype = null;
                } this.clear();
            }catch(e){
                throw new $$AOP.WeaveError(e, 'Unweave');
            }
            return true;
        },
        /**
         * Describe what this method does
         * @private
         * @param {String} paramName Describe this parameter
         * @returns Describe what it returns
         * @type String
         */
        advise: function(cutline){
            throw new $$.MethodNotImplementedError();
        }
        
    });
     
    
})(  jQuery, Claypool, Claypool.AOP );

/**
 * Descibe this class
 * @author 
 * @version $Rev$
 * @requires OtherClassName
 */
(function($, $$, $$AOP){   
        /**
         * @constructor
         */
        $$AOP.After = function(options){
            $$.extend(this, $$AOP.Aspect);
            $.extend(true, this, options);
            this.logger = $.logger("Claypool.AOP.After");
            this.type = "after";
        };
        
        $.extend($$AOP.After.prototype,
            $$AOP.Aspect.prototype,{
            advise: function(cutline, target, method){
                var _this = this;
                try{
                    return function() {
                        //call the original function and then call the advice 
                        //   aspect with the return value and return the aspects return value
                        var returnValue = cutline.apply(this, arguments);//?should be this?
                        return _this.advice.apply(_this, [returnValue, target, method]);
                    };
                }catch(e){
                    throw new $$AOP.AspectError(e, "After");
                }
            }
        });

    
})(  jQuery, Claypool, Claypool.AOP );


/**
 * Descibe this class
 * @author 
 * @version $Rev$
 * @requires OtherClassName
 */
(function($, $$, $$AOP){   
        /**
         * @constructor
         */
        $$AOP.Before = function(options){
            $$.extend( this, $$AOP.Aspect);
            $.extend(true, this, options);
            this.logger = $.logger("Claypool.AOP.Before");
            this.type = "before";
        };
        $.extend($$AOP.Before.prototype,
            $$AOP.Aspect.prototype,{
            /**
             * Describe what this method does
             * @private
             * @param {String} paramName Describe this parameter
             * @returns Describe what it returns
             * @type String
             */
            advise: function(cutline, target, method){
                var _this = this;
                try{
                    return function() {
						var args = [];
						_this.logger.debug('cutline arguments length %s', arguments.length);
						for(var i=0;i<arguments.length;i++){
							args.push(arguments[i]);
						}
						args.push({
							target: target,
							method: method
						});
						_this.logger.debug('applying advice to %s.%s', target, method);
                        _this.advice.apply(_this, args);
                        return cutline.apply(this, arguments);//?should be this?
                    };
                }catch(e){
                    throw new $$AOP.AspectError(e, "Before");
                }
            }
        });
        
})(  jQuery, Claypool, Claypool.AOP );


/**
 * Descibe this class
 * @author 
 * @version $Rev$
 * @requires OtherClassName
 */
(function($, $$, $$AOP){   
        /**
         * @constructor
         */
        $$AOP.Around = function(options){
            $$.extend( this,  $$AOP.Aspect);
            $.extend(true, this, options);
            this.logger = $.logger("Claypool.AOP.Around");
            this.type = "around";
        };
        $.extend($$AOP.Around.prototype, 
            $$AOP.Aspect.prototype,{
            /**
             * Describe what this method does
             * @private
             * @param {String} paramName Describe this parameter
             * @returns Describe what it returns
             * @type String
             */
            advise: function(cutline, target, method){
                var _this = this;
                try{
                    return function() {
                        var invocation = { object: this, args: arguments};
                        return _this.advice.apply(_this, [{ 
                            object: invocation.object,
                            arguments:  invocation.args, 
							target: target, 
							method: method,
                            proceed :   function() {
                                var returnValue = cutline.apply(invocation.object, invocation.args);
                                return returnValue;
                            }
                        }] );
                    };
                }catch(e){
                    throw new $$AOP.AspectError(e, "Around");
                }
            }
        });
    
})(  jQuery, Claypool, Claypool.AOP );


/**
 * Stores instance configurations and manages instance lifecycles
 * @author 
 * @version $Rev$
 * @requires OtherClassName
 */
(function($, $$, $$AOP){
    /**
     * @constructor
     */
    $$AOP.Factory = function(options){
        $$.extend(this, $$.BaseFactory);
        $.extend(true, this, options);
        this.configurationId = 'aop';
        this.aspectCache = null;
        this.logger = $.logger("Claypool.AOP.Factory");
        this.aspectCache = new $$.SimpleCachingStrategy();
    };
    
    $.extend($$AOP.Factory.prototype,
        $$.BaseFactory.prototype, {
        /**
         * Describe what this method does
         * @private
         * @param {String} paramName Describe this parameter
         * @returns Describe what it returns
         * @type String
         */
        updateConfig: function(){
            var _this = this;
            var aopConfiguration;//entire config
            var aopconf;//unit of config
            var i;
            var targetRef, namespace, prop, genconf;
            try{
                this.logger.debug("Configuring Claypool AOP AspectFactory");
                aopConfiguration = this.getConfig()||[];
                this.logger.debug("AOP Configurations: %d", aopConfiguration.length);
                for(i=0;i<aopConfiguration.length;i++){
                    try{
                        aopconf = aopConfiguration[i];
                        //  resolve the advice which must be specified as an optionally
                        //  namespaced string eg 'Foo.Bar.goop' 
                        if(!$.isFunction(aopconf.advice)){
                            aopconf.advice = $.resolve(aopconf.advice);
                        }
                        //If the adive is to be applied to an application managed instance
                        //then bind to its lifecycle events to weave and unweave the
                        //aspect 
                        if(aopconf.target.match("^ref://")){
                            targetRef = aopconf.target.substr(6,aopconf.target.length);
                            $(document).bind("claypool:ioc:"+targetRef, function(event, id, iocContainer){
                                _this.logger.debug("Creating aspect id %s for instance %s", aopconf.id);
                                var instance = iocContainer.find(id);
								aopconf.literal = {
									scope: 'global',
									object: '#'+targetRef
								};
                                aopconf.target = instance._this;
                                _this.add(aopconf.id, aopconf);
                                //replace the ioc object with the aspect attached
                                var aspect = _this.create(aopconf.id);
                                instance._this = aspect.target;
                                iocContainer.remove(id);
                                iocContainer.add(id, instance);
                                _this.logger.debug("Created aspect \n%s, \n%s");
                                
                            }).bind("claypool:predestroy:"+targetRef, function(event, instance){
                                _this.logger.debug("Destroying aspect id %s for instance %s", aopconf.id);
                                var aspect = _this.aspectCache.find(aopconf.id);
                                if(aspect&&aspect.unweave){
                                    aspect.unweave();
                                }
                            });
                        }else{
                            /**
                            *   This is an aspect for an entire class of objects or a generic
                            *   instance.  We can apply it now so do it. We do like to be
                            *   flexible enough to allowa namespaced class, and in either case,
                            *   it's specified as a string so we have to resolve it
                            */
                            if(aopconf.target.match(/\.\*$/)){
                                //The string ends with '.*' which implies the target is every function
                                //in the namespace.  hence we resolve the namespace, look for every
                                //function and create a new filter for each function.
                                this.logger.debug("Broad aspect target %s", aopconf.target);
                                namespace = $.resolve(aopconf.target.substring(0, aopconf.target.length - 2));
                                for(prop in namespace){
                                    if($.isFunction(namespace[prop])){
                                        //extend the original aopconf replacing the id and target
                                        genconf = $.extend({}, aopconf, {
                                            id : aopconf.id+$.uuid(),
                                            target : namespace[prop],
                                            _target: aopconf.target.substring(0, aopconf.target.length - 1)+prop
                                        });
                                        this.logger.debug("Creating aspect id %s [%s] (%s)", 
                                            aopconf.target, prop, genconf.id);
                                        this.add(genconf.id, genconf);
                                        this.create(genconf.id);//this creates the aspect
                                    }
                                }
                            }else{
                                this.logger.debug("Creating aspect id %s", aopconf.id);
								aopconf._target = aopconf.target;
                                aopconf.target =  $.resolve(aopconf.target);
								
                                this.add(aopconf.id, aopconf);
                                this.create(aopconf.id);//this creates the aspect
                            }
                        }
                    }catch(e){
                        //Log the expection but allow other Aspects to be configured.
                        this.logger.exception(e);
                    }
                }
            }catch(e){
                this.logger.exception(e);
                throw new $$AOP.ConfigurationError(e);
            }
            return true;
        },
        /**
         * Describe what this method does
         * @private
         * @param {String} paramName Describe this parameter
         * @returns Describe what it returns
         * @type String
         */
        create: function(id, namespace){//id is #instance or $Class
            var configuration;
            var _continuation;
            var aspect = this.aspectCache.find(id);
            var _this = this;
            /** * main factory function. */
            var createWeave = function(options) {
                var aspect = null;
                if (options.after){
                    aspect = new $$AOP.After(options);
                }else if (options.before){
                    aspect = new $$AOP.Before(options);
                }else if (options.around) {
                    aspect = new $$AOP.Around(options);
                }
                return aspect.weave();
            };
            if(aspect){
                //The aspect already exists so give them whaty they're
                //looking for
                return aspect;
            }else{
                //The aspect hasnt been created yet so look for the appropriate 
                //configuration and create the aspect.
                try{
                    this.logger.debug("Looking for configuration for aspect %s", id);
                    configuration = this.find(id);
                    if(configuration === undefined || configuration === null){
                        this.logger.debug("%s is not an Aspect.", id);
                        return null;
                    }else{
                        this.logger.debug("Found configuration for instance %s", id);
                        if(configuration.selector){
                            this.logger.debug("Attaching contructor to an active selector");
                            _this = this;
                            _continuation = function(){
                                aspect  = createWeave(configuration);
                                _this.aspectCache.add(configuration.id+"#"+this.toString(), aspect);
                                return aspect;
                            };
                            if(configuration.active){
                                //Apply the weave to future dom objects matching the specific
                                //selector.
                                $(configuration.selector).livequery(_continuation);
                            }else{
                                //attach the aspect only to the current dom snapshot
                                $(configuration.selector).each(_continuation);
                            }
                        }else{
                            //This is either a simple object or class
                            aspect = createWeave(configuration);
                            this.aspectCache.add(id, aspect);
                        }
                        /**remember this might not be fully initialized yet!*/
                        return aspect;
                    }
                }catch(e){
                    this.logger.exception(e);
                    throw new $$AOP.FactoryError(e);
                }
            }
        }
    });
    
})(  jQuery, Claypool, Claypool.AOP );


/**
 * Descibe this class
 * @author 
 * @version $Rev$
 * @requires OtherClassName
 *
 *      The AOP Container manages the storage and retrieval
 *      of aspect configuration and instances respectively.
 *      The AOP Container also shares its context with the
 *      global application context, so Aspect ID's (like any
 *      other configuration ID) must be unique.
 *
 *      The aspectFactory is an instance of Claypool.AOP.Factory.
 *      When the Container is created, it caches each Aspects
 *      configuration.  Unlike the IoC Container, which lazily creates
 *      Objects, the AOP Container applies Class Aspects immediatly,
 *      creates a Proxy Aspect for container managed instances (linked
 *      to the postCreate lifecycle event). 
 *
 *      Thus, what the AOP Container actaully contibutes to the Application
 *      Context is the Aspect (used primarily to remove/reattach the Aspect),
 *      or a Continuation representing a function that will return
 *      the Aspect once the target has been created by the IoC Container.
 */
(function($, $$, $$AOP){
    /**
     * @constructor
     */
    $$AOP.Container = function(options){
        $$.extend(this, $$.Application.ContextContributor);
        $.extend( true, this, options);
        this.factory = null;
        this.logger = $.logger("Claypool.AOP.Container");
        this.logger.debug("Configuring Claypool AOP Container");
        /**Register first so any changes to the container managed objects 
        are immediately accessible to the rest of the application aware
        components*/
        this.factory = new $$AOP.Factory(options); //$AOP.getAspectFactory();
        this.factory.updateConfig();
    };
    
    $.extend($$AOP.Container.prototype,
        $$.Application.ContextContributor.prototype, {
            /**
             * Returns all aspects attached to the Class or instance.  If the instance is still 
             * sleeping, the proxy aspect is returned.
             * @private
             * @param {String} paramName Describe this parameter
             * @returns Describe what it returns
             * @type String
             */
            get: function(id){//id is #instance or $Class (ie Function)
                var aspect, ns;
                try{
					//support for namespaces
					ns = typeof(id)=='string'&&id.indexOf('#')>-1?
						[id.split('#')[0],'#'+id.split('#')[1]]:['', id];
					//namespaced app cache
					if(!this.find(ns[0])){
						this.add(ns[0], new $$.SimpleCachingStrategy());
					}
                    this.logger.debug("Search for a container managed aspect :%s", id);
                    aspect = this.find(ns[0]).find(ns[1]);
                    if(aspect===undefined||aspect===null){
                        this.logger.debug("Can't find a container managed aspect :%s", id);
                        aspect = this.factory.create(ns[1], ns[0]);
                        if(aspect !== null){
                            this.find(ns[0]).add(ns[1], aspect);
                            return aspect;
                        }
                    }else{
                        this.logger.debug("Found container managed instance :%s", id);
                        return aspect;
                    }
                }catch(e){
                    this.logger.exception(e);
                    throw new $$AOP.ContainerError(e);
                }
                return null;
            }
        });
    
})(  jQuery, Claypool, Claypool.AOP );


/**
 * Descibe this class
 * @author 
 * @version $Rev$
 * @requires OtherClassName
 */
(function($, $$, $$AOP){
    /**
     * @constructor
     */
    $$AOP.ContainerError = function(e, options){ 
        var details = {
            name:"Claypool.AOP.ContainerError",
            message:"An error occured inside the aop container."
        };
        $.extend( this, new $$.Error(e, options?{
            name:(options.name?(options.name+" > "):"")+details.name,
            message:(options.message?(options.message+" \n "):"")+details.message
        }:details));
    };
})(  jQuery, Claypool, Claypool.AOP );

/**
 * Descibe this class
 * @author 
 * @version $Rev$
 * @requires OtherClassName
 */
(function($, $$, $$AOP){
    /**
     * @constructor
     */
    $$AOP.ConfigurationError =  function(e, options){ 
        var details = {
            name:"Claypool.AOP.ConfigurationError",
            message:"An error occured updating the aop container configuration."
        };
        $.extend( this, new $$.ConfigurationError(e, options?{
            name:(options.name?(options.name+" > "):"")+details.name,
            message:(options.message?(options.message+" \n "):"")+details.message
        }:details));
    };
})(  jQuery, Claypool, Claypool.AOP );

/**
 * Descibe this class
 * @author 
 * @version $Rev$
 * @requires OtherClassName
 */
(function($, $$, $$AOP){
    /**
     * @constructor
     */
    $$AOP.FactoryError = function(e, options){ 
        var details = {
            name:"Claypool.AOP.FactoryError",
            message:"An error occured creating the aspect from the configuration."
        };
        $.extend( this, new $$.Error(e, options?{
            name:(options.name?(options.name+" > "):"")+details.name,
            message:(options.message?(options.message+" \n "):"")+details.message
        }:details));
    };
})(  jQuery, Claypool, Claypool.AOP );

/**
 * Descibe this class
 * @author 
 * @version $Rev$
 * @requires OtherClassName
 */
(function($, $$, $$AOP){
    /**
     * @constructor
     */
    $$AOP.WeaveError = function(e, options){ 
        var details = {
            name:"Claypool.AOP.WeaveError",
            message:"An error occured weaving or unweaving the aspect."
        };
        $.extend( this, new $$.Error(e, options?{
            name:(options.name?(options.name+" > "):"")+details.name,
            message:(options.message?(options.message+" \n "):"")+details.message
        }:details));
    };
})(  jQuery, Claypool, Claypool.AOP );

/**
 * Descibe this class
 * @author 
 * @version $Rev$
 * @requires OtherClassName
 */
(function($, $$, $$AOP){
    /**
     * @constructor
     */
    $$AOP.AspectError =  function(e, options){ 
        var details = {
            name:"Claypool.AOP.AspectError",
            message:"An error occured while applying an aspect."
        };
        $.extend( this, new $$.Error(e, options?{
            name:(options.name?(options.name+" > "):"")+details.name,
            message:(options.message?(options.message+" \n "):"")+details.message
        }:details));
    };
    
})(  jQuery, Claypool, Claypool.AOP );


/**
 * Descibe this class
 * @author 
 * @version $Rev$
 * @requires OtherClassName
 */
(function($, $$, $AOP){
	/**
	 * @constructor
	 */
	$.extend($, {
	    filters  : function(){
            if(arguments.length === 0){
                return $.config('aop');
            }else{
                return $.config('aop', arguments[0]);
            }
	    }
	});
	
	
})(  jQuery, Claypool, Claypool.AOP );

Claypool.IoC={
/*
 * Claypool.IOC @VERSION@ - A Web 1.6180339... Javascript Application Framework
 *
 * Copyright (c) 2008 Chris Thatcher (claypooljs.com)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * $Date: 2008-08-06 14:34:08 -0400 (Wed, 06 Aug 2008) $
 * $Rev: 265 $
 * 
 *
 *   -   Inversion of Control (Dependency Injection) Patterns  -
 */
};

/**
 * Descibe this class
 * @author 
 * @version $Rev$
 * @requires OtherClassName
 */
(function($, $$, $$IoC){
    
    $.manage("Claypool.IoC.Container", "claypool:IoC");

})(  jQuery, Claypool, Claypool.IoC );


/**
 * Descibe this class
 * @author 
 * @version $Rev$
 * @requires OtherClassName
 */
(function($, $$, $$IoC){
    /**
     * @constructor
     */
    $$IoC.Instance = function(id, configuration){
        $.extend(this,{
            _this           : null,     //A reference to the managed object
            id              : null,     //published to the application context
            configuration   : null,     //the instance configuration
            guid            : $.uuid(), //globally (naively) unique id for the instance created internally
            type            : null,     //a reference to the clazz
            id              : id,
            configuration   : configuration||{},
            logger          : $.logger("Claypool.IoC.Instance")
        });
        /**
         * Override the category name so we can identify some extra info about the object
         * in it's logging statements
         */
        this.logger.category = this.logger.category+"."+this.id;
    };
    
    $.extend($$IoC.Instance.prototype, {
        /**
         * Describe what this method does
         * @private
         * @param {String} paramName Describe this parameter
         * @returns Describe what it returns
         * @type String
         */
        precreate: function(){
            try{
                this._this = {claypoolId:this.id};//a temporary stand-in for the object we are creating
                this.logger.debug("Precreating Instance");
                $(document).trigger("claypool:precreate", [this._this, this.id]);
                //second event allow listening to the specific object lifecycle if you know it's id
                $(document).trigger("claypool:precreate:"+this.id, [this._this]);
                //TODO:  Apply function specified in ioc hook
                return this;
            }catch(e){
                this.logger.error("An Error occured in the Pre-Create LifeCycle Phase");
                this.logger.exception(e);
                throw new $$IoC.LifeCycleError(e);
            }
        },
        /**
         * Describe what this method does
         * @private
         * @param {String} paramName Describe this parameter
         * @returns Describe what it returns
         * @type String
         */
        create: function(){
            var factory,factoryClass,factoryMethod,retVal;
            var _this,_thisOrUndefined,C_onstructor,args;
            var injections, injectionValue;
            try{
            /**
            *   The selector, if it isnt null, is used to create the default value
            *   of '_this' using $.  
            */
                this.logger.debug("Applying Selector to Instance");
                if(this.configuration.selector){
                    // binds usto the elements via selector,
                    //and/or sets defaults on the object we are managing (this._this)
                    this._this  = $(this.configuration.selector);
                    this.logger.debug("Result for selector : ", this._this);
                }else{
                    this.logger.debug("Using default empty object");
                    this._this = {};
                }
            /**  
            *   This is where we will create the actual instance from a constructor.
            *   Please use precreate and postcreate to hook you're needs into the
            *   lifecycle process via ioc/aop.
            *   It follows this order:
            *       1. find the appropriate constructor
            *       2. make sure all references in the options are resolved
            *       3. apply the constructor
            */
                if(this.configuration.factory){
                    //The factory is either a managed instance (already constructed)
                    //or it is the name of a factory class to temporarily instantiate
                    factory = {};
                    if(this.configuration.factory.substring(6,0)=="ref://"){
                        //its a reference to a managed object
                        this.logger.debug("Retreiving Factory from Application Context");
                        factory = $.$(this.configuration.factory);
                    }else{
                        //Its a class, so instantiate it
                        this.logger.info("Creating Instance from Factory");
                        factoryClass = this.resolveConstructor(this.configuration.factory);
                        retval = factoryClass.apply(factory, this.configuration.options);
                        factory = retval||factory;
                    }
                    this.logger.debug("Applying factory creation method");
                    factoryMethod = this.configuration.factoryMethod||"create";
                    _this = factory[factoryMethod].apply(factory, this.configuration.options);
                    this._this = $.extend(true,  _this, this._this);
                }else{
                    //constructorName is just a simple class constructor
                    /**
                    *   This is here for complex reasons.  There are a plethora ways to instantiate a new object
                    *   with javascript, and to be consistent, regardless of the particular approach, modifying the 
                    *   prototype must do what it supposed to do.. This is the only way I've found to do that.
                    *   PS If your constructor has more than 10 parameters, this wont work.  Why does your constructor
                    *   have more than 10 parameters?
                    */
                    this.logger.info("Creating Instance simulating constructor: %s", this.configuration.clazz);
                    C_onstructor = this.resolveConstructor(this.configuration.clazz);
                    args = this.configuration.options||[];
                    _this = {};
                    switch(args.length){
                        case 0: _this = new C_onstructor();break;
                        case 1: _this = new C_onstructor(args[0]);break;
                        case 2: _this = new C_onstructor(args[0],args[1]);break;
                        case 3: _this = new C_onstructor(args[0],args[1],args[2]);break;
                        case 4: _this = new C_onstructor(args[0],args[1],args[2],args[3]);break;
                        case 5: _this = new C_onstructor(args[0],args[1],args[2],args[3],args[4]);break;
                        case 6: _this = new C_onstructor(args[0],args[1],args[2],args[3],args[4],args[5]);break;
                        case 7: _this = new C_onstructor(args[0],args[1],args[2],args[3],args[4],args[5],args[6]);break;
                        case 8: _this = new C_onstructor(args[0],args[1],args[2],args[3],args[4],args[5],args[6],args[7]);break;
                        case 9: _this = new C_onstructor(args[0],args[1],args[2],args[3],args[4],args[5],args[6],args[7],args[8]);break;
                        default:
                            //this affect the prototype nature so modifying th proto has no affect on the instance
                            _thisOrUndefined = C_onstructor.apply(_this, args);
                            _this = _thisOrUndefined||_this;
                    }
                    //Every Instance gets a logger!
                    _this.$ns = this.configuration.clazz;
                    _this.$log = $.logger(_this.$ns);
                    _this.$log.debug("Created new instance of %s", _this.$ns);
                    
                    this._this = $.extend(true, _this, this._this);
                }
            /**
            *   Now that the object has been successfully created we 'inject' these items
            *   More importantly we scan the top level of the injections for values (not names)
            *   that start tieh 'ref://' which is stripped and the remaining string is used
            *   to search the application scope for a managed object with that specific id.
            *
            *   This does imply that the construction of applications managed objects
            *   cascades until all injected dependencies have resolved.  I wish all
            *   browsers supported the js 'get/set' because we could use a lazy pattern 
            *   here instead.
            */
                injections = this.configuration.inject||{};
                for(var dependency in injections){
                    injectionValue = injections[dependency];
                    if($.isFunction(injectionValue.substring) &&
                       (injectionValue.substring(0,6) == 'ref://')){
                        injections[dependency] = $.$(
                            injectionValue.substring(6, injectionValue.length)
                        );
                    }
                }
                $.extend(this._this, injections);
                $(document).trigger("claypool:create", [this._this, this.id]);
                //second event allow listening to the specific object lifecycle if you know it's id
                $(document).trigger("claypool:create:"+this.id, [this._this]);
                return this._this;
            }catch(e){
                this.logger.error("An Error occured in the Create LifeCycle Phase");
                this.logger.exception(e);
                throw new $$IoC.LifeCycleError(e);
            }
        },
        /**
         * Describe what this method does
         * @private
         * @param {String} paramName Describe this parameter
         * @returns Describe what it returns
         * @type String
         */
        postcreate:function(){
            try{
                //TODO:  Apply function specified in ioc hook
                this.logger.debug("PostCreate invoked");
                $(document).trigger("claypool:postcreate", [this._this, this.id]);
                //second event allow listening to the specific object lifecycle if you know it's id
                $(document).trigger("claypool:postcreate:"+this.id, [this._this]);
                return this._this;
            }catch(e){
                this.logger.error("An Error occured in the Post-Create LifeCycle Phase");
                this.logger.exception(e);
                throw new $$IoC.LifeCycleError(e);
            }
        },
        /**
         * Describe what this method does
         * @private
         * @param {String} paramName Describe this parameter
         * @returns Describe what it returns
         * @type String
         */
        predestroy:function(){
            //If you need to do something to save state, eg make an ajax call to post
            //state to a server or local db (gears), do it here 
            try{
                //TODO:  Apply function specified in ioc hook
                this.logger.debug("Predestory invoked");
                $(document).trigger("claypool:predestroy", [this._this, this.id]);
                //second event allow listening to the specific object lifecycle if you know it's id
                $(document).trigger("claypool:predestroy:"+this.id, [this._this]);
                return this._this;
            }catch(e){
                this.logger.exception(e);
                throw new $$IoC.LifeCycleError(e);
            }
        },
        /**
         * Describe what this method does
         * @private
         * @param {String} paramName Describe this parameter
         * @returns Describe what it returns
         * @type String
         */
        destroy:function(){
            try{
                //TODO:  
                //we dont actually do anyting here, yet... it might be
                //a good place to 'delete' or null things
                this.logger.info("Destroy invoked");
                $(document).trigger("claypool:destroy", [this._this, this.id]);
                //second event allow listening to the specific object lifecycle if you know it's id
                $(document).trigger("claypool:destroy:"+this.id, [this._this]);
                return delete this._this;
            }catch(e){
                this.logger.exception(e);
                throw new $$IoC.LifeCycleError(e);
            }
        },
        /**
         * Describe what this method does
         * @private
         * @param {String} paramName Describe this parameter
         * @returns Describe what it returns
         * @type String
         */
        postdestroy:function(){
            //If you need to do something now that the instance was successfully destroyed
            //here is your lifecycle hook.  
            try{
                //TODO:  Apply functions specified in ioc hook
                this.logger.debug("Postdestory invoked");
                $(document).trigger("claypool:postdestroy", [this.id]);
                //second event allow listening to the specific object lifecycle if you know it's id
                $(document).trigger("claypool:postdestroy:"+this.id);
                return this;
            }catch(e){
                this.logger.exception(e);
                throw new $$IoC.LifeCycleError(e);
            }
        },
        /**
         * Describe what this method does
         * @private
         * @param {String} paramName Describe this parameter
         * @returns Describe what it returns
         * @type String
         */
        resolveConstructor:function(constructorName){
            var constructor;
            try{
                constructor = $.resolve(constructorName); 
                if( $.isFunction(constructor) ){
                    this.logger.debug(" Resolved " +constructorName+ " to a function");
                    return constructor;
                }else{ 
                    throw new Error("Constructor is not a function: " + constructorName);
                }
            }catch(e){
                this.logger.exception(e);
                throw new $$IoC.ConstructorResolutionError(e);
            }
        }
    });
    
})(  jQuery, Claypool, Claypool.IoC );


/**
 * Stores instance configurations and manages instance lifecycles
 * @author 
 * @version $Rev$
 * @requires OtherClassName
 */
(function($, $$, $$IoC){
    /**
     * @constructor
     */
    $$IoC.Factory = function(options){
        $$.extend(this, $$.BaseFactory);
        $.extend(true, this, options);
        this.configurationId = 'ioc';
		this.lazyLoadAttempts = {};
        this.logger = $.logger("Claypool.IoC.Factory");
    };
    
    $.extend($$IoC.Factory.prototype,
        $$.BaseFactory.prototype,{
        /**
         * Describe what this method does
         * @private
         * @param {String} paramName Describe this parameter
         * @returns Describe what it returns
         * @type String
         */
        createLifeCycle: function(instance){
            try{
                //Walk the creation lifecycle
                instance.precreate();
                instance.create();
                instance.postcreate();
            }catch(e){
                this.logger.error("An Error occured in the Creation Lifecycle.");
                this.logger.exception(e);
                throw new $$IoC.LifeCycleError(e);
            }
        },
        /**
         * Describe what this method does
         * @private
         * @param {String} paramName Describe this parameter
         * @returns Describe what it returns
         * @type String
         */
        destroyLifeCycle: function(instance){
            try{
                //Walk the creation lifecycle
                instance.predestroy();
                instance.destroy();
                instance.postdestroy();
            }catch(e){
                this.logger.error("An Error occured in the Destory Lifecycle.");
                this.logger.exception(e);
                throw new $$IoC.LifeCycleError(e);
            }
        },
        /**
         * Describe what this method does
         * @private
         * @param {String} paramName Describe this parameter
         * @returns Describe what it returns
         * @type String
         */
        create: function(id, namespace){
	        var configuration,
            	instance,
            	_this = this,
				remote, folder, file,
				literal;
            try{	
				namespace = namespace||'';
				if(!this.find(namespace)){
					this.logger.debug("Adding cache for namespace %s", namespace);
					this.add(namespace, new $$.SimpleCachingStrategy());
				}
                this.logger.debug("Looking for configuration for instance %s%s", namespace, id);
                configuration = this.find(namespace).find(id);
                if(configuration === null){
                    this.logger.warn("No known configuration for instance %s%s", namespace, id);
					remote = id.match(/#([a-z]+([A-Z]?[a-z]+)+)([A-Z][a-z]+)+/);
					if(remote){
						_this.logger.debug('resolving lazyload %s', id);
						//holds reference to names eg ['MyApp','Model','FooBar']
						literal = [  $$.Namespaces[namespace] ];
						folder = namespace||'';
						//now prepend appbase if specified otherwise use the root /
						//and finally determine the intermediate package as 'models'
						//'views', etc
						literal[1] = remote.pop();
						literal[1] = literal[1]+'s';
						folder = ($.env('appbase')||'/')+folder+literal[1].toLowerCase()+'/';
						//finally determine the script itself which should be the lowercase
						//foobar from an id like abc#fooBarModel or #fooBarModel or #foobarModel etc
						literal[2] = remote[1].substring(0,1).toUpperCase()+remote[1].substring(1);
						file = remote[1].toLowerCase()+'.js';
						_this.logger.debug('attempting to lazyload %s from %s%s', id, folder, file);
						if(_this.lazyLoadAttempts[folder+file]){
							//avoid danger of infinite recursion here
							_this.logger.debug('already attempted to load %s%s', folder, file);
							return null;
						}else{
							_this.lazyLoadAttempts[folder+file] = 1;
							$.ajax({
								async:false,
								url:folder+file,
								dataType:'text',
								timeout:3000,
								success: function(text){
									_this.logger.info('lazyloaded %s ', literal.join('.'));
									if(!$.env('debug')){
										jQuery.globalEval(text);
									}else{
										eval(text);
									}
									var config = {
										id: id,
										namespace: namespace,
										clazz: literal.join('.')
									};
									if(literal[1] == 'Views'){
										config.selector = '#'+literal[2].substring(0,1).toLowerCase()+literal[2].substring(1);
									}
									_this.find(namespace).add(id, config);
								},
								error: function(xhr, status, e){
									_this.logger.error('failed (%s) to load %s%s', xhr.status, folder, file).
										exception(e);
								}
							});		
							_this.logger.info('completed lazyloaded for %s%s ', id, namespace);
							return _this.create(id, namespace);
						}
						//Work In Progress
					}else{
						logger.warn('id requested did not match those applicable for late loading %s', id);
					}
                    return null;
                }else{
                    this.logger.debug("Found configuration for instance %s%s", namespace, id);
                    instance = new $$IoC.Instance(configuration.id, configuration);
                    if(configuration.active&&configuration.selector){
                        this.logger.debug("Attaching contructor to an active selector");
                        // precreate so there is something to return from the container
                        // even if the livequery hasnt triggered
                        instance.precreate();
                        //pass a flag so others know it's an active object
                        instance._this["@claypool:activeobject"] = configuration.selector;
                        instance._this["@claypool:id"] = instance.id;
                        jQuery(configuration.selector).livequery(function(){
                            _this.logger.debug("Processing Creation Lifecycle.");
                            _this.createLifeCycle(instance);
                        },function(){
                            _this.logger.debug("Processing Destruction Lifecycle.");
                            _this.destroyLifeCycle(instance);
                        });
                    }else{
                        this.logger.debug("Processing Creation Lifecycle.");
                        this.createLifeCycle(instance);
                    }
                    /**remember this might not be fully initialized yet!*/
                    return instance;
                }
            }catch(e){
                this.logger.exception(e);
                throw new $$IoC.FactoryError(e);
            }
        },
        /**
         * Describe what this method does
         * @private
         * @param {String} paramName Describe this parameter
         * @returns Describe what it returns
         * @type String
         */
        updateConfig: function(){
            var iocConfiguration;
            var iocconf;
            var i;
            try{
                this.logger.debug("Configuring Claypool IoC Factory");
                iocConfiguration = this.getConfig()||[];
                this.logger.debug("IoC Configurations: %d", iocConfiguration.length);
                for(i=0;i<iocConfiguration.length;i++){
                    try{
                        iocconf = iocConfiguration[i];
                        if(iocconf.scan && iocconf.factory){
                            this.logger.debug("Scanning %s with %s", iocconf.scan, iocconf.factory);
                            iocConfiguration = iocConfiguration.concat(
                                iocconf.factory.scan(iocconf.scan, iocconf.namespace)
                            );
                        }else{
                            this.logger.debug("IoC Configuration for Id: %s%s", 
								iocconf.namespace||'', iocconf.id );
							if(iocconf.namespace){
								//namespaced app configs
								if(!this.find(iocconf.namespace)){
									this.add(iocconf.namespace, new $$.SimpleCachingStrategy());
								}
								this.find(iocconf.namespace).add(iocconf.id, iocconf);
							}else{
								//non-namespaced app configs
								if(!this.find('')){
									this.add('', new $$.SimpleCachingStrategy());
								}
								this.find('').add(iocconf.id, iocconf);
							}
                        }
                    }catch(e){
                        this.logger.exception(e);
                        return false;
                    }
                }
            }catch(e){
                this.logger.exception(e);
                throw new $$IoC.ConfigurationError(e);
            }
            return true;
        }
    });
    
})(  jQuery, Claypool, Claypool.IoC );


/**
 * Holds references to application managed objects or 
 * uses the factory to create them the first time.
 * @thatcher 
 * @requires core, logging
 */
(function($, $$, $$IoC){
    /**
     * @constructor
     * stores instances and uses an instance factory to
     * create new instances if one can't be found 
	 * (for lazy instantiation patterns)
     */
    $$IoC.Container = function(options){
        $$.extend(this, $$.Application.ContextContributor);
        $.extend(true, this, options);
        this.factory = null;
        this.logger = $.logger("Claypool.IoC.Container");
        this.logger.debug("Configuring Claypool IoC Container");
        /**
		Register first so any changes to the container managed objects 
        are immediately accessible to the rest of the application aware
        components
		*/
        this.factory = new $$IoC.Factory();
        this.factory.updateConfig();
    };
    
    $.extend( $$IoC.Container.prototype,
        $$.Application.ContextContributor.prototype,{
        /**
         * Checks cache for existing instance and delegates to factory
		 * factory if none currently exists
         * @private
         * @param {String} id Application ID
         * @returns Application managed instance
         * @type Object
         */
        get: function(id){
            var instance,
				ns,
				_this=this;
            try{	
				//support for namespaces
				ns = typeof(id)=='string'&&id.indexOf('#')>-1?
					[id.split('#')[0],'#'+id.split('#')[1]]:['', id];
				//namespaced app cache
				if(!this.find(ns[0])){
					this.add(ns[0], new $$.SimpleCachingStrategy());
				}
                this.logger.debug("Searching for a container managed instance :%s", id);
                instance = this.find(ns[0]).find(ns[1]);
                if(!instance){
                    this.logger.debug("Can't find a container managed instance :%s", id);
					//note order of args is id, namespace to ensure backward compat
					//with claypool 1.x apps
                    instance = this.factory.create(ns[1], ns[0]);
                    if(instance){
                        this.logger.debug("Storing managed instance %s in container", id);
                        this.find(ns[0]).add(ns[1], instance);
                        //The container must be smart enough to replace active objects bound to dom 
                        if(instance._this["@claypool:activeobject"]){
                            $(document).bind('claypool:postcreate:'+instance.id,  function(event, reattachedObject, id){
                                _this.logger.info("Reattached Active Object Inside IoC Container");
                                instance._this = reattachedObject;
                            });
                            $(document).bind('claypool:postdestroy:'+instance.id,  function(){
                                _this.logger.info("Removed Active Object Inside IoC Container");
                                _this.find(ns[0]).remove(ns[1]);
                            });
                        }else{
                            //trigger notification of new id in ioc container
                            $(document).trigger("claypool:ioc",[id, this]);
                            //trigger specific notification for the new object
                            $(document).trigger("claypool:ioc:"+id,[id, this]);
                        }
                        //is safer than returning instance._this becuase the the object may be modified
                        //during the event hooks above
                        return this.find(ns[0]).find(ns[1])._this;
                    }
                }else{
                    this.logger.debug("Found container managed instance :%s", id);
                    return instance._this;
                }
            }catch(e){
                this.logger.exception(e);
                throw new $$IoC.ContainerError(e);
            }
            return null;
        }
    });
    
})(  jQuery, Claypool, Claypool.IoC );



/**
 * Descibe this class
 * @author 
 * @version $Rev$
 * @requires OtherClassName
 */
(function($, $$, $$IoC){
    /**
     * @constructor
     */
    $$IoC.ContainerError = function(e){
        $.extend( this, new $$.Error(e, {
            name:"Claypool.IoC.ContainerError",
            message: "An error occured in the ioc instance factory."
        }));
    };
})(  jQuery, Claypool, Claypool.IoC );
        
        


/**
 * Descibe this class
 * @author 
 * @version $Rev$
 * @requires OtherClassName
 */
(function($, $$, $$IoC){
    /**
     * @constructor
     */
    $$IoC.FactoryError = function(e){
        $.extend( this, new $$.Error(e, {
            name:"Claypool.IoC.FactoryError",
            message: "An error occured in the ioc factory."
        }));
    };
})(  jQuery, Claypool, Claypool.IoC );
        
        


/**
 * Descibe this class
 * @author 
 * @version $Rev$
 * @requires OtherClassName
 */
(function($, $$, $$IoC){
    /**
     * @constructor
     */
    $$IoC.ConfigurationError = function(e){
        $.extend( this, new $$.ConfigurationError(e, {
            name:"Claypool.IoC.ConfigurationError",
            message: "An error occured updating the ioc container configuration."
        }));
    };
})(  jQuery, Claypool, Claypool.IoC );
        
        


/**
 * Descibe this class
 * @author 
 * @version $Rev$
 * @requires OtherClassName
 */
(function($, $$, $$IoC){
    /**
     * @constructor
     */
    $$IoC.LifeCycleError = function(e){
        $.extend( this, new $$.Error(e, {
            name:"Claypool.IoC.LifeCycleError",
            message: "An error occured during the lifecycle process."
        }));
    };
})(  jQuery, Claypool, Claypool.IoC );
        
        


/**
 * Descibe this class
 * @author 
 * @version $Rev$
 * @requires OtherClassName
 */
(function($, $$, $$IoC){
    /**
     * @constructor
     */
    $$IoC.ConstructorResolutionError = function(e){
        $.extend( this, new $$.NameResolutionError(e, {
            name:"Claypool.IoC.ConstructorResolutionError",
            message: "An error occured trying to resolve the constructor."
        }));
    };
    
})(  jQuery, Claypool, Claypool.IoC );



/**
 * Descibe this class
 * @author 
 * @version $Rev$
 * @requires OtherClassName
 */
(function($, $$, $$IoC){
	$$.Namespaces = {};
	/**
	 * @constructor
	 */
    $.extend($, {
        scan  : function(){
            var scanPaths, ns;
            if(arguments.length === 0){
                return $.config('ioc');
            }else{
                scanPaths = [];
				if($.isPlainObject(arguments[0])){
					//namespaced application paths
					//eg $.scan({ my: 'MyApp', abc: "OtherApp"})
					//or $.scan({ my: 'MyApp', abc: ["OtherApp.Services", "OtherApp.Models"]})
					for(ns in arguments[0]){
						_scan(arguments[0][ns], ns);
					}
				}else if($.isArray(arguments[0])){
					//no namespace array of paths to scan
					// eg $.scan(['MyApp.Models, MyApp.Views']);
					_scan(arguments[0]);
				}else if(typeof arguments[0] == 'string'){
					//no namespace single path
					// eg $.scan('MyApp')
					_scan(arguments[0]);
				}
				return $.config('ioc', scanPaths);
            }
			function _scan(path, namespace){
				var i;
				namespace = namespace||'';
				if($.isArray(path)){
					if(! (namespace in $$.Namespaces)){
						$$.Namespaces[namespace] = path[0].split('.')[0];
					}
					for(i = 0;i < path.length; i++){
	                    scanPaths.push({
	                        scan:path[i], 
							factory:$$.MVC.Factory.prototype,
							namespace: namespace?namespace:null
						}); 
				    }
				}else{
					if(! (namespace in $$.Namespaces)){
						$$.Namespaces[namespace] = path;
					}
					scanPaths.push({
                        scan:path, 
						factory:$$.MVC.Factory.prototype,
						namespace: namespace?namespace:null
					});
				}
			}
        },
		invert: function(){
            if(arguments.length === 0){
                return $.config('ioc');
            }else{
                return $.config('ioc', arguments[0]);
            }
        }
    });
	
})(  jQuery, Claypool, Claypool.IoC );
Claypool.MVC = {
/*
 * Claypool.MVC @VERSION@ - A Web 1.6180339... Javascript Application Framework
 *
 * Copyright (c) 2008 Chris Thatcher (claypooljs.com)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * $Date: 2008-08-06 14:34:08 -0400 (Wed, 06 Aug 2008) $
 * $Rev: 265 $
 * 
 *
 */
};

(function($){
    
    $.manage("Claypool.MVC.Container", "claypool:MVC", function(container){
        var i,
            id,
            router,
            config = container.factory.getConfig(),
            type;
        for(type in config){
            container.logger.debug("eagerly loading mvc routers: %s", type);
            for(i=0;i<config[type].length;i++){
                //eagerly load the controller
                id = config[type][i].id;
                controller = container.get(id);
                //activates the controller
                container.logger.debug("attaching mvc core controller: %s", id);
                if(controller && !controller.attached){
                    controller.attach();
                    controller.attached = true;
                }
            }
        }
    });
    
})(  jQuery);


/**
 * Descibe this class
 * @author 
 * @version $Rev$
 * @requires OtherClassName
 */
(function($, $$, $$MVC){
	/**
	 * @constructor
	 */
    $$MVC.View$Interface = {
        /**
         * Describe what this method does
         * @private
         * @param {String} paramName Describe this parameter
         * @returns Describe what it returns
         * @type String
         */
        update: function(model){//refresh screen display logic
            throw new $$.MethodNotImplementedError();
        },
        /**
         * Describe what this method does
         * @private
         * @param {String} paramName Describe this parameter
         * @returns Describe what it returns
         * @type String
         */
        think: function(){//display activity occuring, maybe block
            throw new $$.MethodNotImplementedError();
        }
    };
	
})(  jQuery, Claypool, Claypool.MVC );

/**
 * In Claypool a controller is meant to be expose various 
 * aggregations of event-scope state.
 * 
 * @author 
 * @version $Rev$
 * @requires OtherClassName
 */
(function($, $$, $$MVC){
	/**
	 * @constructor
	 */
	$$MVC.Controller = function(options){
        $$.extend(this, $$.SimpleCachingStrategy);
        $.extend(true, this, options);
        this.logger = $.logger("Claypool.MVC.Controller");
    };
    $.extend($$MVC.Controller.prototype,
        $$.SimpleCachingStrategy.prototype,{
        handle: function(event){
            throw new $$.MethodNotImplementedError();
        }
    });
	
})(  jQuery, Claypool, Claypool.MVC );

/**
 *  The hijax 'or' routing controller implements the handle and resolve methods and provides
 *   a new abstract method 'strategy' which should be a function that return 
 *   a list, possibly empty of controller names to forward the data to.  In general
 *   the strategy can be used to create low level filtering controllers, broadcasting controllers
 *   pattern matching controllers (which may be first match or all matches), etc
 * @author 
 * @version $Rev$
 * @requires OtherClassName
 */
(function($, $$, $$MVC){
    /**
     * @constructor
     */
    $$MVC.HijaxController = function(options){
		$$.extend(this, $$MVC.Controller);
        /*defaults*/
        $.extend(true, this, {
            forwardingList:[],
            selector:"",
            filter:"",
            active:true,
            preventDefault:true,
            stopPropagation:true,
            hijaxMap:[],
            resolveQueue:[],//TODO
            strategy:null//must be provided by implementing class
        },  options );
        this.router = new $$.Router();
        this.bindCache = new $$.SimpleCachingStrategy();
        this.logger = $.logger("Claypool.MVC.HijaxController");
    };
    
    $.extend($$MVC.HijaxController.prototype, 
            $$MVC.Controller.prototype,{
        /**
         * Describe what this method does
         * @private
         * @param {String} paramName Describe this parameter
         * @returns Describe what it returns
         * @type String
         */
        handle: function(data){
            //Apply the strategy
            this.logger.debug("Handling pattern: %s", data.pattern);
            this.forwardingList = this.router[this.strategy||"all"]( data.pattern );
            this.logger.debug("Resolving matched paterns");
            var _this = this,
                state = {};
            if(this.forwardingList.length > 0){
                this.logger.debug('normalizing event state params');
                if($.isFunction(this.normalize)){
                    state = this.normalize(data.args[0]/*the event*/);
                }
            }
            return jQuery(this.forwardingList).each(function(){
                var target, 
                    action, 
                    defaultView,
					targetId;
                try{
                    _this.logger.info("Forwaring to registered controller %s", this.payload.controller);
                    target = $.$(this.payload.controller);
					targetId = this.payload.controller;
                    //the default view for 'fooController' or 'fooService' is 'fooView' otherwise the writer
                    //is required to provide it before a mvc flow can be resolved.
                    defaultView = this.payload.controller.match('Controller') ?
                        this.payload.controller.replace('Controller', 'View') : null;
                    defaultView = this.payload.controller.match('Service') ?
                        this.payload.controller.replace('Service', 'View') : defaultView;
                    //make params object represent the normalized state accentuated by route param map
                    this.map = $.extend(state, this.map);
                    (function(t){
                        var  _event = data.args[0],//the event is the first arg, 
                            extra = [];//and then tack back on the original extra args.
                        for(var i = 1; i < data.args.length; i++){extra[i-1]=data.args[i];}
                        var eventflow = $.extend( {}, _event, {
                           m: function(){
                               if(arguments.length === 0){
                                   return m;
                               }else if(arguments.length === 1){
                                   if(typeof(arguments[0]) == 'string'){
                                       return m[arguments[0]];
                                   }else if(arguments[0] instanceof Array){
                                       m.length += arguments[0].length;
                                       Array.prototype.push.apply(m,arguments[0]);
                                   }else if(arguments[0] instanceof Object){
                                       $.extend(true, m, arguments[0]);
                                   }
                               }else if(arguments.length === 2){
                                   if(arguments[1] instanceof Array){
                                       if(typeof(arguments[0]) == 'string' && !(arguments[0] in  m)){
                                           m[arguments[0]] = [];
                                       }
                                       $.merge(m[arguments[0]], arguments[1]);
                                   }else if(arguments[1] instanceof XML || arguments[1] instanceof XMLList){
                                       m[arguments[0]] = arguments[1];
                                   }else if(arguments[1] instanceof Object){
                                       if(typeof(arguments[0]) == 'string' && !(arguments[0] in  m)){
                                           m[arguments[0]] = {};
                                       }
                                       $.extend(true, m[arguments[0]], arguments[1]);
                                   }
                               }
                               return this;//chain
                           },
                           v: function(view){
                               if(!view){
                                   return v;
                               }
                               if(view && typeof(view)=='string'){
                                   view = view.split('.');
                                   if(view.length === 1){
                                       v = view;
                                   }else if(view.length === 2){
                                       if(view[0] !== ""){
                                           v = view.join('.');
                                       }else{
                                           v = v.split('.')[0]+"."+view[1];
                                       }
                                   }
                               }
                               return this;//chain
                           },
                           c : function(){
                               var target, action, controller;
                               if(arguments.length === 0){
                                   return c;
                               }else if(arguments.length > 0 && typeof(arguments[0]) == "string"){
                                   //allow forwarded controller to have extra params info passed
                                   //along with it.  .c('#fooController', { extra: 'info' });
                                   if(arguments.length > 1 && $.isPlainObject(arguments[1])){
                                       t.map = $.extend(true, t.map||{}, arguments[1]);
                                   }
                                   //expects "target{.action}"
                                   target = arguments[0].split(".");
								   //TODO: verify this was unintended and is bug. before this function
								   //	   is called, internal 'c' is an object, after this function it 
								   //      is a string (if next line was reincluded)
                                   //c = target[0]; 
                                   v  = target[0].match('Controller') ? target[0].replace('Controller', 'View') : null;
                                   v  = target[0].match('Service') ? target[0].replace('Service', 'View') : v;
                                   action = (target.length>1&&target[1].length>0)?target[1]:"handle";
                                   controller = _this.find(target[0]);
                                   if(controller === null){
                                       controller = $.$(target[0]);
                                       //cache it for speed on later use
                                       _this.add(target[0], controller);
                                   }
                                   controller[action||"handle"].apply(controller,  [this].concat(extra) );
                               }
                               return this;//chain
                           },
                           render:_this.renderer(),
                           reset:function(){
                               m = {flash:[], length:0};//each in flash should be {id:"", msg:""}
                               v = defaultView;
                               c = targetId;
							   m.reset = function resetm(){ m = {flash:[], length:0}; m.reset = resetm; return eventflow; };
							   v.reset = function resetv(){ v = defaultView; v.reset = resetv; return eventflow; };
							   c.reset = function resetc(){ c = targetId; c.reset = resetc; return eventflow; };
                               return this;//chain
                           },
						   params: function(param){
						   	   if (arguments.length === 0) {
							   	   return t.map ? t.map : {};
							   } else {
							   	   return (t.map && (param in t.map)) ? t.map[param] : null;
							   }
						   }
                        });
						eventflow.reset();
                        //tack back on the extra event arguments
                        target[t.payload.action||"handle"].apply(target, [eventflow].concat(extra) );
                    })(this);
                }catch(e){
                    e = e?e:new Error();
                    if(e.name&&e.name.indexOf("Claypool.Application.ContextError")>-1){
                        _this.logger.warn("No controller with id: %s", this.payload.controller);
                    }else{  /**propogate unknown errors*/
                        _this.logger.exception(e); throw e;
                    }
                }
            });
        },
        /**
         * Describe what this method does
         * @private
         * @param {String} paramName Describe this parameter
         * @returns Describe what it returns
         * @type String
         */
        attach: function(){
            this.router.compile(this.hijaxMap, this.routerKeys);//, "controller", "action");
            var _this = this;
            if(this.active&&(this.selector!==""||this.filter!=="")){
                this.logger.debug("Actively Hijaxing %s's %s%s", this.hijaxKey, this.selector, this.filter);
                $(this.selector+this.filter).livequery(function(){
                    _this.hijax(this);
                });
            }else if (this.selector!==""||this.filter!==""){
                this.logger.debug("Hijaxing Current %s's.", this.hijaxKey);
                $(this.selector+this.filter).each(function(){
                    _this.hijax(this);
                });
            }else if(document!==undefined){
                this.logger.debug("Hijaxing Document For %s's.", this.hijaxKey);
                _this.hijax(document);
            }else{this.logger.warn("Unable to attach controller: %s", options.id);}
        },
        hijax: function(target){
            this.logger.debug("Hijaxing %s: %s", this.hijaxKey, target);
            var _this = this;
            var _hijax = function(event){
                var retVal = true;
                _this.logger.info("Hijaxing %s: ", _this.hijaxKey);
                if(_this.stopPropagation){
                    _this.logger.debug("Stopping propogation of event");
                    event.stopPropagation();
                }
                if(_this.preventDefault){
                    _this.logger.debug("Preventing default event behaviour");
                    event.preventDefault();
                    retVal = false;
                }
                _this.handle({
                    pattern: _this.target.apply(_this, arguments), 
                    args:arguments,
                    normalize: _this.normalize?_this.normalize:function(){
                        return {};
                    }
                });
                return retVal;
            };
            if(this.event){
                $(this.event.split('|')).each(function(){
                    /**This is a specific event hijax so we bind once and dont think twice  */
                    $(target).bind(this+"."+_this.eventNamespace, _hijax);
                    _this.logger.debug("Binding event %s to hijax controller on target", this, target);
                    
                });
            }else{     
                /**
                *   This is a '(m)any' event hijax so we need to bind based on each routed endpoints event.
                *   Only bind to the event once (if its a custom event) as we will progagate the event
                *   to each matching registration, but dont want this low level handler invoked more than once.
                */
                $(this.hijaxMap).each(function(){
                    if(this.event&&!_this.bindCache.find(this.event)){
                        _this.bindCache.add(this.event, _this);
                        _this.logger.debug("Binding event %s to controller %s on target %s",
                            this.event, this.controller ,target);
                        $(target).bind(this.event+"."+_this.eventNamespace,_hijax);
                    }
                });
            }   
            return true;
        },
        /**
         * Describe what this method does
         * @private
         * @param {String} paramName Describe this parameter
         * @returns Describe what it returns
         * @type String
         */
        //provides a continuation for the mvc flow to allow room for asynch dao's and the like
        renderer: function(){
            var _this = this;
            var callbackStack = [];
            return function(callback){
                var target,
                    controller,
                    action,
                    view, 
                    viewMethod,
                    guidedEventRegistration;
                /**
                *   callbacks are saved until any forwarding is completed and then executed sequentially 
                *   by popping off the top (so in reverse of the order they where added)
                */
                if(callback&&$.isFunction(callback)){
                    callbackStack.push(callback);
                }
                _this.logger.debug(" - Resolving Control - %s)", this.c());
                try{
                    //a view can specifiy a method other than the default 'update'
                    //by providing a '.name' on the view
                    view = this.v();
                    //If a writer is provided, the default view method is 'render'
                    viewMethod = $.isFunction(this.write)?
                        //since claypool 1.1.4 we prefer 'write' as the default 
                        //server-side view action since jquery.tmpl is being
                        //introduced an adds $.fn.render
                        ($.isFunction($.render)?"write":"render"):
                        //live dom modification should prefer the method 'update'
                        "update";
                    if(view.indexOf(".") > -1){
                        viewMethod = view.split('.');
                        view = viewMethod[0];
                        //always use the last so we can additively use the mvc v value in closures
                        viewMethod = viewMethod[viewMethod.length-1];
                    }
                    _this.logger.debug("Calling View %s.%s", view, viewMethod);
                    view = $.$(view);
                    if(view){
                        if($.isFunction(view[viewMethod])){
                            switch(viewMethod){
                                case "write":
                                case "writeln":
                                    //calls event.write/event.writeln on the return
                                    //value from view.write/view.writeln
                                    this[viewMethod](view[viewMethod](this.m(), this));
                                    break;
                                case "render":
                                    //pre 1.1.4 the api called render and the
                                    //view invoked 'write' but jquery.fn.tmpl
                                    //uses render
                                    view.write = this.write;
                                    view.writeln = this.writeln;
                                    view[viewMethod](this.m(), this);
                                    break;
                                default:
                                    //of course allow the users preference for view method
                                    view[viewMethod](this.m(), this);
                            }
                            _this.logger.debug("Cascading callbacks");
                            while(callbackStack.length > 0){ (callbackStack.pop())(); }
                        }else if (view["@claypool:activeobject"]){
                            //some times a view is removed and reattached.  such 'active' views
                            //are bound to the post create lifecycle event so they can resolve 
                            //as soon as possible
                            guidedEventRegistration = "claypool:postcreate:"+view["@claypool:id"]+"."+$.uuid();
                            $(document).bind(guidedEventRegistration,function(event, newView){
                                _this.logger.warn("The view is reattached to the dom.");
                                //unbind handler
                                $(document).unbind(guidedEventRegistration);
                                newView.update(this.m());
                                _this.logger.debug("Cascading callbacks");
                                while(callbackStack.length > 0){ (callbackStack.pop())(); }
                            });
                        }else{
                            _this.logger.debug("View method cannot be resolve", viewMethod);
                        }
                    }else{
                        _this.logger.warn("Cant resolve view %s. ", this.v());
                    }
                }catch(e){
                    _this.logger.error("Error resolving flow %s => %s", this.c(), this.v()).
                        exception(e);
                    throw e;
                }
                return this;//chain
            };
        },
        /**returns some part of the event to use in router, eg event.type*/
        target: function(event){
            throw new $$.MethodNotImplementedError();
        }
    });
    
})(jQuery, Claypool, Claypool.MVC );


/**
 * Descibe this class
 * @author 
 * @version $Rev$
 * @requires OtherClassName
 */
(function($, $$, $$MVC){
    /**
     * @constructor
     */
    $$MVC.Factory = function(options){
        $$.extend(this, $$.IoC.Factory);
        $.extend(true, this, options);
        this.configurationId = 'mvc';
        this.logger = $.logger("Claypool.MVC.Factory");
		//support for namespaces - routers are always in default
		//empty namespace
		this.add('', new $$.SimpleCachingStrategy());
    };
    
    $.extend($$MVC.Factory.prototype,
        $$.IoC.Factory.prototype,{
        /**
         * Describe what this method does
         * @private
         * @param {String} paramName Describe this parameter
         * @returns Describe what it returns
         * @type String
         */
        updateConfig: function(){
            var mvcConfig,
                controller,
                type,
                id,
                i;
            try{
                this.logger.debug("Configuring Claypool MVC Controller Factory");
                mvcConfig = this.getConfig()||{};//returns mvc specific configs
                //Extension point for custom low-level hijax controllers
                $(document).trigger("claypool:hijax", [this, this.initializeHijaxController, mvcConfig]);
                
            }catch(e){
                this.logger.exception(e);
                throw new $$MVC.ConfigurationError(e);
            }
        },
        /**
         * Describe what this method does
         * @private
         * @param {String} paramName Describe this parameter
         * @returns Describe what it returns
         * @type String
         */
        scan: function(name, namespace){
            var log = this.logger||$.logger("Claypool.MVC.Factory");
            var prop, 
                scanBase, 
                configsByConvention = [],
				conf,
                idNamingConvention = function(localName, type){
					//type : eg Views will be shortened to => View
                    return ("#"+localName.substring(0,1).toLowerCase()+localName.substring(1)+type.substring(0, type.length-1));
                },
                domNamingConvention = function(localName){
                    return ("#"+localName.substring(0,1).toLowerCase()+localName.substring(1));
                };

			namespace = namespace||'';
            log.debug("Scanning %s%s", namespace, name);
            try{
				if(name.split('.').length == 1){
					//MyApp
					scanBase = $.resolve(name);
					for(prop in scanBase){
						log.debug("Scan Checking %s.%s" , name, prop);
						if($.isPlainObject(scanBase[prop])){
							log.debug("Scan Following %s.%s" , name, prop);
							//we now get $.scan(['MyApp.Models', 'MyApp.Configs', etc])
							configsByConvention.push(this.scan(name+'.'+prop, namespace));
						}
					}
					
				}else if(name.split('.').length == 2){
					//MyApp.Controllers
					scanBase = $.resolve(name);
					for(prop in scanBase){
						log.debug("Scan Checking %s.%s" , name, prop);
						if($.isFunction(scanBase[prop])){
							log.debug("Configuring by Convention %s.%s" , name, prop);
							config = {
								id: idNamingConvention(prop, name.split('.')[1]),
								clazz: name+"."+prop,
								namespace: namespace
							};
							if(name.match(".Views")){
								//by convention views bind to element with id
								config.selector = domNamingConvention(prop);
							}
							configsByConvention.push(config);
						} 
					}
				}else if(name.split('.').length == 3){
					//MyApp.Controllers.Admin
					scanBase = $.resolve(name);
					if($.isFunction(scanBase)){
						log.debug('Appending to Configuration by Convention %s', name);
						config = {
							id: idNamingConvention(prop, name.split('.')[2]),
							clazz: name,
							namespace: namespace
						};
						if(name.match(".Views")){
							//by convention views bind to element with id
							config.selector = domNamingConvention(prop);
						}
						configsByConvention.push(config);
					}
				}
            }catch(e){
                log.error("Error Scanning %s!!", name).exception(e);   
            }
            return configsByConvention;
        },
        /**
         * Describe what this method does
         * @private
         * @param {String} paramName Describe this parameter
         * @returns Describe what it returns
         * @type String
         */
        initializeHijaxController: function(mvcConfig, key, clazz, options){
            var configuration,
                i;
            if(mvcConfig[key]){
                for(i=0;i<mvcConfig[key].length;i++){
                    configuration = {};
                    configuration.id = mvcConfig[key][i].id;
                    configuration.clazz = clazz;
                    configuration.options = [ $.extend(true, {}, options, mvcConfig[key][i]) ];
                    this.logger.debug("Adding MVC Configuration for Controller Id: %s", configuration.id);
                    this.find('').add( configuration.id, configuration );
                }
            }
        }
    });
    
})(  jQuery, Claypool, Claypool.MVC );


/**
 * Descibe this class
 * @author 
 * @version $Rev$
 * @requires OtherClassName
 */
(function($, $$, $$MVC){
    /**
     * @constructor
     */
    $$MVC.Container = function(options){
        $$.extend(this, $$.Application.ContextContributor);
        $.extend(true, this, options);
        this.factory = null;
        this.logger = $.logger("Claypool.MVC.Container").
             debug("Configuring Claypool MVC Container");
        //Register first so any changes to the container managed objects 
        //are immediately accessible to the rest of the application aware
        //components
        this.factory = new $$MVC.Factory();
        this.factory.updateConfig();
    };
    
    $.extend($$MVC.Container.prototype, 
        $$.Application.ContextContributor.prototype,{
        /**
         * Describe what this method does
         * @private
         * @param {String} paramName Describe this parameter
         * @returns Describe what it returns
         * @type String
         */
        get: function(id){
            var controller,
				ns;
            try{	
                this.logger.debug("Search for a container managed controller : %s", id);
				//support for namespaces
				ns = typeof(id)=='string'&&id.indexOf('#')>-1?
					[id.split('#')[0],'#'+id.split('#')[1]]:['', id];
				//namespaced app cache
				if(!this.find(ns[0])){
					this.add(ns[0], new $$.SimpleCachingStrategy());
				}
                controller = this.find(ns[0]).find(ns[1]);
                if(controller===undefined||controller===null){
                    this.logger.debug("Can't find a container managed controller : %s", id);
					//recall order of args for create is id, namespace so we maintain
					//backward compatability
                    controller = this.factory.create( ns[1], ns[0]);
                    if(controller !== null){
                        this.find(ns[0]).add(ns[1], controller);
                        return controller._this;
                    }else{
                        return null;
                    }
                }else{ 
                    this.logger.debug("Found container managed controller : %s", id);
                    return controller._this;
                }
            }catch(e){
                this.logger.exception(e);
                throw new $$MVC.ContainerError();
            }
            throw new $$MVC.FactoryError(id);
        }
    });
    
})(  jQuery, Claypool, Claypool.MVC );

/**
 * Descibe this class
 * @author 
 * @version $Rev$
 * @requires OtherClassName
 */
(function($, $$, $$MVC){
    /**
     * @constructor
     */
    $$MVC.ContainerError = function(e){
        $.extend( this, new $$.Error(e, {
            name:"Claypool.MVC.ContainerError",
            message: "An error occurred trying to retreive a container managed object."
        }));
    };
})(  jQuery, Claypool, Claypool.MVC );


/**
 * Descibe this class
 * @author 
 * @version $Rev$
 * @requires OtherClassName
 */
(function($, $$, $$MVC){
    /**
     * @constructor
     */
    $$MVC.FactoryError = function(e){
        $.extend( this, new $$.Error(e, {
            name:"Claypool.MVC.FactoryError",
            message: "An error occured trying to create the factory object."
        }));
    };
})(  jQuery, Claypool, Claypool.MVC );


/**
 * Descibe this class
 * @author 
 * @version $Rev$
 * @requires OtherClassName
 */
(function($, $$, $$MVC){
    /**
     * @constructor
     */
    $$MVC.ConfigurationError = function(e){
        $.extend( this, new $$.ConfigurationError(e, {
            name:"Claypool.MVC.ConfigurationError",
            message: "An error occured during the configuration."
        }));
    };
    
})(  jQuery, Claypool, Claypool.MVC );


/**
 * Descibe this class
 * @author 
 * @version $Rev$
 * @requires OtherClassName
 */
(function($, $$, $$MVC){
	/**
	 * @constructor
	 */
    var log;
    //TODO : what is the useful static plugin that could be derived from Claypool.MVC?
    //      router ?
	$.extend($, {
        //this defines the built-in low-level controllers. adding more is easy! 
        //For another example see claypool server
	    router : function(confId, options){
            $(document).bind("claypool:hijax", function(event, _this, registrationFunction, configuration){
                log = log||$.logger('Claypool.MVC.Plugins');
                log.debug('registering router plugin: %s', confId);
                registrationFunction.apply(_this, [
                    configuration, confId, "Claypool.MVC.HijaxController", options
                ]);
            });
            return this;
	    },
        mvc  : function(){
            var prop, config;
            if(arguments.length === 0){
                return $.config('mvc');
            }else{
                config = $.config('mvc');
                //because mvc routes are named arrays, the relavant
                //array is not merged.  we force the arrays to be merged
                //if the property already exists
                for(prop in arguments[0]){
                    if(prop in config){
                        $.merge(config[prop], arguments[0][prop]);
                    }else{
                        config[prop] = arguments[0][prop];
                    }
                }
                return this;//chain
            }
        }
	});
    
    $.routes = $.mvc;
	/*
     *   -   Model-View-Controller Patterns  -
     *
     *   Claypool MVC provides some low level built in controllers which a used to 
     *   route control to your controllers.  These Claypool provided controllers have a convenient
     *   configuration, though in general most controllers, views, and models should be
     *   configured using the general ioc configuration patterns and are simply referenced as targets.
     *
     *   The Claypool built-in controllers are:
     *       hijax:a - maps url patterns in hrefs to controllers.
     *           The href resource is resolved via ajax and the result is delivered to the specified
     *           controllers 'handle' method
     * 
     *       hijax:form - maps form submissions to controllers.
     *           The submittion is handled via ajax and the postback is delivered to the specified
     *           controllers 'handle' method
     *
     *       hijax:button - maps button (not submit buttons) to controllers.
     *           This is really useful for dialogs etc when 'cancel' is just a button but 'ok' is a submit.
     *
     *       hijax:event - maps custom or dom events to controllers.  
     */
	$.router( "hijax:a", {
        selector        : 'a',
        event           : 'click',
        strategy        : 'first',
        routerKeys      : 'urls',
        hijaxKey        : 'link',
        eventNamespace  : "Claypool:MVC:HijaxLinkController",
        target       : function(event){ 
            var link = event.target||event.currentTarget;
            while(link.tagName.toUpperCase()!='A'){
                link = $(link).parent()[0];
            }
            return $(link).attr("href");
        },
        normalize:  function(event){
            var link = event.target||event.currentTarget,
                data = {};
            while(link.tagName.toUpperCase()!='A'){
                link = $(link).parent()[0];
            }
            var href = $(link).attr("href");
            var params = href.split('?');
            
            params = params && params.length > 1 ? params[1] : '';
            //now walk the params and split on &, then on =
            $(params.split('&')).each(function(i, param){
                var name_value = param.split('='),
                    name = name_value[0],
                    value = name_value[1],
                    tmp;
                if(name in data){
                    if(!$.isArray(data[name])){
                        tmp = data[name];
                        data[name] = [tmp];
                    }
                    data[name].push(value);
                }else{
                    data[name] = value;
                }
            });
            return data;
        }
    }).router( "hijax:button",{
        selector        : ':button',
        event           : 'click',
        strategy        : 'all',
        routerKeys      : 'ids',
        hijaxKey        : 'button',
        eventNamespace  : "Claypool:MVC:HijaxButtonController",
        target       : function(event){ 
            return event.target.id;
        },
        normalize:  function(event){
            return {};
        }
    }).router( "hijax:input",{
        selector        : 'input',
        event           : 'blur|focus',
        strategy        : 'all',
        routerKeys      : 'ids',
        hijaxKey        : 'input',
        eventNamespace  : "Claypool:MVC:HijaxInputController",
        target       : function(event){ 
            return event.target.id;
        },
        normalize:  function(event){
            var params = {};
            params[event.target.name] = event.target.value;
            return params;
        }
    }).router( "hijax:form",{
        selector        : 'form',
        event           : 'submit',
        strategy        : 'first',
        routerKeys      : 'urls',
        hijaxKey        : 'form',
        eventNamespace  : "Claypool:MVC:HijaxFormController",
        target       : function(event){ 
            return event.target.action;
        },
        normalize:  function(event){
            var params = {},
                serialized = $(event.target).serializeArray();
            $(serialized).each(function(i,object){
                var tmp;
                if(object.name in params){
                    if(!$.isArray(params[object.name])){
                        tmp = params[object.name];
                        params[object.name] = [];
                    }
                    params[object.name].push(object.value);
                } else {
                    params[object.name] = object.value;
                }
            });
            return params;
        }
    }).router( "hijax:event",{
        strategy        : 'all',
        routerKeys      : 'event',
        hijaxKey        : 'event',
        eventNamespace  : "Claypool:MVC:HijaxEventController",
        target       : function(event){ 
            return event.type;
        },
        normalize:  function(event){
            return {};
        }
    });
    
    $.mvc_scanner = $$MVC.Factory.prototype;
	
})(  jQuery, Claypool, Claypool.MVC );
Claypool.Models = {
/*
 * Claypool.Models @VERSION@ - A Web 1.6180339... Javascript Application Framework
 *
 * Copyright (c) 2008 Chris Thatcher (claypooljs.com)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * $Date: 2008-08-06 14:34:08 -0400 (Wed, 06 Aug 2008) $
 * $Rev: 265 $
 * 
 *
 */
};


/**
 * store configuration for building indexes
 **/
Claypool.Configuration.index = [];
/**
 * @author thatcher
 */


(function($, $$, $M){
    
    /**
     * @constructor
     * @classDescription - Provides a common validation and serialization
     *     deserialization routines
     * @param {Object} name
     * @param {Object} fields
     * @param {Object} options
     */
    $M.Model = function(name, fields, options){
        $.extend(true, this, $M.Factory(options));
        $.extend(this, {
            name: name,
            fields: fields
        });
    };
   
    $.extend($M.Model.prototype, {
        /**
         * 
         * @param {Object} options
         */
        validate:function(options){
            var flash = [],
                model = options.data,
                i, j, 
                batch,
                id;
            if( options.batch ){
                batch = [];
                for(i=0;i<model.length;i++){
                    id = model[i].$id;
                    this.validate($.extend({},options,{
                        data: model[i],
                        batch:false,
                        success:function(data){
                            data.$id = id;
                            batch.push(data);
                        },
                        error:function(data, _flash){
                            flash.push(_flash);
                        }
                    }));
                }
                if( flash.length === 0 ){
                    model = batch;
                }
            } else {
                for(var field in this.fields){
                    if(model[field] === undefined
                    && this.fields[field].generate){
                        //generate the field for them
                        model[field]=this.fields[field].generate();
                    }
                    if(this.fields[field].not){
                       //make sure no item in the list is equivalent
                        for(i=0;i<this.fields[field].not.length;i++){
                            if(model[field] instanceof Array){
                                //handle an array of simple values
                                for(j=0;j<model[field].length;j++){
                                    if(model[field][j]===this.fields[field].not[i]){
                                        //store the value and msg in flash
                                        //to pass to the callback
                                        flash[flash.length]={
                                            index:j,
                                            field: field,
                                            value:model[field][j],
                                            msg:this.fields[field].msg
                                        };          
                                    }
                                }
                            }else{
                                //handle simple values
                                if(model[field]===this.fields[field].not[i]){
                                    //store the value and msg in flash
                                    //to pass to the callback
                                    flash[flash.length]={
                                        value:model[field],
                                        field: field,
                                        msg:this.fields[field].msg
                                    };          
                                }
                            }
                        }       
                    }
                    //only validate patterns if defined
                    if(this.fields[field].pattern && (model[field]!==undefined)){
                        if(model[field] instanceof Array){
                            //handle array of simple values
                            for(j=0;j<model[field].length;j++){
                                if(!this.fields[field].pattern.test(model[field][j])){
                                    //store the value and msg in flash
                                    //to pass to the callback
                                    flash[flash.length]={
                                        index:j,
                                        field: field,
                                        value:model[field][j],
                                        msg:this.fields[field].msg
                                    };        
                                }
                            }
                        }else{
                            //handle a simple type
                            if(!this.fields[field].pattern.test(model[field])){
                                //store the value and msg in flash
                                //to pass to the callback
                                flash[flash.length]={
                                    value:model[field],
                                    field: field,
                                    msg:this.fields[field].msg
                                };        
                            }
                        }
                    }
                }  
            }
          
            if(flash.length>0 &&
                options.error && $.isFunction(options.error)){
                options.error(model, flash);
            }else{
                if(options.success&&$.isFunction(options.success)){
                    if(options.serialize){
                        model = this.serialize(model);
                    }
                    options.success(model);
                }
            }
            return this;
        },
    	serialize : function(model){
            var serialized = {},
                multi, 
                i;
            for(var field in model){
                if((this.fields[field]!==undefined ||
                   '__anything__' in this.fields || field == '$id') && !$.isFunction(model[field])){
                    if(this.fields[field] && 
                       this.fields[field].type){
                        if(this.fields[field].type == 'json'){
                            //serializes a json blob
                            serialized[field] = jsPath.js2json(model[field]);
                        }else if (this.fields[field].type == 'html'){
                            //serializes a dom html blob
                            serialized[field] = $('<div/>').append( $(model[field]).clone() ).html();
                        }else if (this.fields[field].type == 'xmllist'){
                            //serializes a e4x xml blob
                            serialized[field] = model[field].toString();
                        }
                    }else{
                        serialized[field] = model[field];
                    }
                }
            }
            return serialized;
        },
        deserialize: function(model){
            var deserialized = {};
            for(var field in this.fields){
                if((model[field]!==undefined ||
                   '__anything__' in this.fields) && !$.isFunction(model[field])){
                    if(this.fields[field].type){
                        if(this.fields[field].type == 'json'){
                            //deserializes a json blob
                            deserialized[field] = $.json2js(model[field]);
                        }else if (this.fields[field].type == 'html'){
                            //deserializes a dom html blob
                            deserialized[field] = $(model[field]);
                        }else if (this.fields[field].type == 'xmllist'){
                            //deserializes a e4x xml blob
                            deserialized[field] = new XMLList(model[field]);
                        }
                    }else{
                        serialized[field] = model[field];
                    }
                }
            }
            return deserialized;
        }
        
    });
    
    $.each([
        /**create the domain (or table space)*/
        'create',
        /**deletes the domain (or table space)*/
        'destroy',
        /**retreives available metadata from the domain*/
        'metadata',
        /**overwrites specified fields (does not remove unspecied fields)*/
        'save',
        /**adds values to specified fields does not overwrite them*/
        'add',
        /**removes specified fields or the entire item if no fields are specified*/
        'remove',
        /** gets a list of domains if no domain is specified
        gets a list of items in a domain if no item is specified
        gets a specific list of items is an array of string if no fields are specified
        gets a specific item if item is a string if no fields are specified
        gets a specific set of fields if fields are specified
        gets a specific set of items and set of fields if fields are specified*/
        'get',
        /**executes a query on the domain returning a list of items and/or the requested fields*/
        'find',
        /**returns a valid language specific query representing the query object*/
        'js2query',
        /**used to page through the results sets from find or large gets*/
        'next',
        'previous'
    ], function(index, value){
        $M.Model.prototype[value] = function(options){
           throw new $$.MethodNotImplementedError();
        };
    });
    
})(  jQuery, Claypool, Claypool.Models);
/**
 * @author thatcher
 */
(function($,$$,$M){
    
	var log;
	
    $M.Query = function(options){
        if(typeof(options) == 'string'){
            options = {context: options};
        }
        $.extend(true, this, {
            context: '',
            selectors:[],
            expressions:[],
            orderby:{ direction:'forward' },
            limit:0,
            startPage:0,
            resultsPerPage: 20
        }, options);
		log = $.logger('Claypool.Models.Query');
    };
    var $Q = $M.Query;
   
    $.extend($Q.prototype, {
       /**
        * Target Functions
        * @param {Object} name
        */
       items: function(selector){
           if(selector && (typeof selector == 'string')){
               // if arg is string
               // a select `selector` 
               this.selectors.push(selector);
           }else if(selector && selector.length && 
                   (selector instanceof Array)){
               // if selector is array
               // a select (`selector[0]`, `selector[1]`, etc) 
               $.merge(this.selectors, selector);
           }else{
               // if arg is not any of the above it is '*'
               // a select `selector` 
               this.selectors.push('*');
           }
           //chain all methods
           return this;
       },
       names: function(){
           //chain all methods
           return this.items('itemName()');
       },
       count: function(){
           //chain all methods
           return this.items('count()');
       },
       /**
        * Operator Functions
        * @param {Object} name
        */
       is: function(value){
           _compare(this,'=');
           _value(this,value);
           //chain all methods
           return this;
       },
       isnot: function(value){
           _compare(this,'!=');
           _value(this,value);
           //chain all methods
           return this;
       },
       islike: function(value){
           _compare(this,'~');
           _value(this,value);
           //chain all methods
           return this;
       },
       isnotlike: function(value){
           _compare(this,'!~');
           _value(this,value);
           //chain all methods
           return this;
       },
       isgt:function(value){
           _compare(this,'>');
           _value(this,value);
           //chain all methods
           return this;
       },
       isgte:function(value){
           _compare(this,'>=');
           _value(this,value);
           //chain all methods
           return this;
       },
       isbetween:function(values){
           _compare(this,'><');
           _value(this,values);
           //chain all methods
           return this;
       },
       islte: function(value){
           _compare(this,'<=');
           _value(this,value);
           //chain all methods
           return this;
       },
       islt:function(value){
           _compare(this,'<');
           _value(this,value);
           //chain all methods
           return this;
       },
       isin: function(values){
           _compare(this,'@');
           _value(this,values);
           //chain all methods
           return this;
       },
       isnotin: function(values){
           _compare(this,'!@');
           _value(this,values);
           //chain all methods
           return this;
       },
       /**
        * ResultSet Preparation Functions
        * @param {Object} name
        */
       orderby: function(name){
           _order(this,name);
           //chain all methods
           return this;
       },
       reverseorderby: function(name){
           _order(this, name, 'reverse');
           //chain all methods
           return this;
       },
       limit: function(count){
           this.limit = count;
       },
       //Pagination functions
       page: function(i, resultsPerPage){
           if(resultsPerPage){
               this.count = resultsPerPage;
           }
           this.startPage = i;
           //chain all methods
           return this;
       },
       next: function(callback){
           this.startPage++;
           //chain all methods
           return this;
       },
       previous:function(callback){
           this.startPage--;
           //chain all methods
           return this;
       }
    });
    
   /**
    * Expression Functions
    * @param {Object} name
    */
    var sugar = ['','like','gt','gte','between','lte','lt'];
    for(var i=0;i<sugar.length;i++){
        $Q.prototype['where'+sugar[i]]=function(name){
            _express(this, name, 'where', '');
            return this;
        };
        $Q.prototype['wherenot'+sugar[i]]=function(name){
            _express(this, name, 'where', 'not');
            return this;
        };
        $Q.prototype['whereeither'+sugar[i]]=function(name){
            _express(this, name, 'either', '');
            return this;
        };
        $Q.prototype['whereneither'+sugar[i]]=function(name){
            _express(this, name, 'either', 'not');
            return this;
        };
        $Q.prototype['and'+sugar[i]]=function(name){
            _express(this, name, 'and', '');
            return this;
        };
        $Q.prototype['andnot'+sugar[i]]=function(name){
            _express(this, name, 'and', 'not');
            return this;
        };
        $Q.prototype['or'+sugar[i]]=function(name){
            _express(this, name, 'or', '');
            return this;
        };
        $Q.prototype['ornot'+sugar[i]]=function(name){
            _express(this, name, 'or', 'not');
            return this;
        };
    }
    
                           //this,string|object,and|or,like|gte|lte,not 
    var _express = function(query, condition, logical, operator, negate){
       var prop = null;
       operator = operator?operator:'is';
       
       if(query && condition && logical &&
                $.isFunction(query[logical])){
           
           if(logical == 'where'){
               query.expressions = [];
               logical = 'and';
           }else if(logical == 'whereeither' || logical == 'whereneither'){
               query.expressions = [];
               logical = 'or';
           }
           if(typeof condition == 'string'){
               //or `name` = ""
               query.expressions.push({
                   name:condition,
                   type:logical
               });
           }else if(condition &&
                 	typeof(condition) == 'object' && 
                 	!(condition instanceof Array)){
               // if condition is object
               // where `a` = '1' or `b` = '2'  or `c` = '3'
               for(prop in condition){
                   if(typeof(condition[prop])=='string'){
                       if(negate){
                           query[logical](prop)['isnot'+operator](condition[prop]);
                       }else{
                           query[logical](prop)['isnot'+operator](condition[prop]);
                       }
                   }else if(operator===''&&//arrays only apply to equal/not equal operator
                               condition[prop]&&
                               condition[prop].length&&
                               condition[prop] instanceof Array){
                       if(negate){
                           query[logical](prop).isnotin(condition[prop]);
                       }else{
                           query[logical](prop).isin(condition[prop]);
                       }
                   }
               }
           }
       }
   };
   var _compare = function(query, symbol){
       query.expressions[
           query.expressions.length-1
       ].operator=symbol;
   };
   var _value = function(query, value){
       query.expressions[
           query.expressions.length-1
       ].value=value;
   };
   var _name = function(query, name){
       query.expressions[
           query.expressions.length-1
       ].name=name;
   };
   var _order = function(query, name, direction){
       query.orderby = {
           name:name,
           direction:(direction||'forward')
       };
   };
   
   /**
    * scratch pad 
    * 
        var _;
      
        //select * from `artists` where `$name` = 'Vox Populi' 
        //or $tags in ('alternative', 'rock') 
        _ = $.query();
      
        $('#artistsModel').find({
            query: _.items('*').
                    where('name').
                    is('Vox Populi').
                    or('tags').
                    isin(['alternative', 'rock']),
            success: function ( results ) {
                //do something with results
            },
            error: function( code, exception ){
                //do something with error conditions
            }
        });
        //is equivalent to
        _ = new $Q();
        
        $('#artistsModel').find(
           _.items('*').
             where({$name:'Vox Poluli'}).
             or({'$tags':['alternative', 'rock']}),
           function(results, pages){
               //do something with results
           }
        );
        
        //select (`$name`, `$artistid`) from `artists` where `$tags` in ('alternative', 'rock')
        _ = new $Q();
        
        $('#artistsModel').find(
           _.items(['$name','$artistid']).
             where({'$tags':['alternative', 'rock']}),
           function(results, pages){
               //do something with results
           }
        );
       
        //select (`$name`) from `artists` where `$tags` in ('alternative', 'rock')
        _ = new $Q();
        
        $('#artistsModel').find(
           _.items('$name').
             where({'$tags':['alternative', 'rock']}),
           function(results, pages){
               //do something with results
           }
        );
       
       
       //select (itemName()) from `artists` where `$name`="Vox Populi" 
       // or `$label`="Nonrational"
        _ = new $Q();
        
        $('#artistsModel').find(
           _.names().
             either({
                 '$name':'Vox Populi',
                 '$label':'Nonrational'
             }),
           function(results, pages){
               //do something with results
           }
        );
        
       //select (itemName()) from `releases` where `$date` not null  
       // orderby `$date`
        _ = new $Q();
        
        $('#releasesModel').find(
           _.names().
             orderby('$date'),
           function(results, pages){
               //do something with results
           }
        );
        
       //select (count()) from `releases` where `$artist` = "Vox Populi"
        _ = new $Q();
        
        $('#releasesModel').find(
           _.count().
             where('$artist').
             is("Vox Populi"),
           function(results, pages){
               //do something with results
           }
        );
   */
   })(jQuery, Claypool, Claypool.Models);
/**
 * @author thatcher
 */
(function($,$$,$M){
    
    $M.Client = function(options){
        $.extend(true, this, options);
    };
   
    $.each(['create','destroy','metadata','save','update','remove','get','find','js2query','next','previous'], 
        function(index, value){
            $M.Client.prototype[value] = function(options){
               this.db[value]($.extend(options,{
                   domain:this.name
               }));
               return this;
            };
        }
    );
    
})(jQuery, Claypool, Claypool.Models);
/**
 * @author thatcher
 */
(function($,$$,$M){
    
    var log;
    
    $M.RestClient = function(options){
        //they must provide a object which implements
        //the methods js2json and json2js
        //we include $'s json plugin as a default implementation
        //when present
        this.js2json = $&&$.js2json&&$.isFunction($.js2json)?
            $.js2json:options.js2json;
        this.json2js = $&&$.json2js&&$.isFunction($.json2js)?
            $.json2js:options.json2js;
        $.extend(true, this, options);
        this.resturl = $.env('resturl')?$.env('resturl'):'/rest/';
		log = $.logger('Claypool.Models.RestClient');
    };
   
   $.extend($M.RestClient.prototype, {
       /**
        *     create,
        *         creates the domain for storage of items
        *     destroy,
        *         deletes the domain and all items in it
        *     save,
        *         save a single item or many items
        *     remove, 
        *     load 
        *         - operates on id an optional object (id, object) 
        */
       create: function(options){
           $.ajax($.extend({},options,{
                type: 'PUT',
                url: this.resturl+this.name+'/',
                dataType:'json',
                success: function(result){
                    _success('created data domain (%s)', options.success, result);
                },
                error: function(xhr, status, e){
                    _error('failed to create data domain', options.error, xhr, status, e);
                }
            }));
            return this;
       },
       destroy: function(options){
           $.ajax($.extend({},options,{
                type: 'DELETE',
                url: this.resturl+this.name+'/',
                dataType:'json',
                success: function(result){
                    _success('destroyed data domain', options.success, result);
                },
                error: function(xhr, status, e){
                    _error('failed to destroy data domain', options.error, xhr, status, e);
                }
            }));
            return this;
        },
        save: function(options){
            var id,
                i;
            if(!options.batch&&options.id){

                if(options.serialize){
                   options.data = this.serialize(options.data);
                }
                $.ajax($.extend({},options,{
                    type: options.update?'POST':'PUT',
                    url: (this.resturl+this.name+'/'+options.id),
                    data: this.js2json(options.data),
                    contentType:'application/json',
                    dataType:'json',
                    processData:false,
                    success: function(result){
                        _success('saved data to domain', options.success, result);
                    },
                    error: function(xhr, status, e){
                        _error('failed to save data to domain', options.error, xhr, status, e);
                    }
               }));
            }else if(options.batch){
                //process as a batch save
                //batch is an object of objects, each
                //property name corresponding to the id
                //and each property value corresponding
                //to the item to be saved
				if(options.serialize){
	                for(i=0;i<options.data.length;i++){
	                    options.data[i] = this.serialize(options.data[i]);
	                }
				}
                
                $.ajax($.extend({},options,{
                    type: options.update?'POST':'PUT',
                    url: (this.resturl+this.name +'/'),
                    data: this.js2json(options.data),
                    contentType:'application/json',
                    processData:false,
                    dataType:'json',
                    success: function(result){
                        _success('saved batch data to domain', options.success, result);
                    },
                    error: function(xhr, status, e){
                        _error('failed to save batch data to domain', options.error, xhr, status, e);
                    }
               }));
           }
            return this;
       },
       update:function(options){
           //saves additional fields to the object.
           this.save($.extend({},options,{update: true}));
           return this;
       },
       remove: function(options){
           
           if(options.id){
               $.ajax($.extend({},options,{
                   type: 'DELETE',
                   url: this.resturl+this.name+'/'+options.id,
                   data:(options.data instanceof Array)?
                           {data:options.data.join(',')}:
                           (options.data instanceof Object)?
                           options.data:
                           null,
                   dataType:'json',
                   success: function(result){
                       _success('removed item or item data from domain', options.success, result);
                   },
                   error: function(xhr, status, e){
                       _error('failed to delete item or item data from domain', options.error, xhr, status, e);
                   }
               }));
           }
            return this;
       },
       get: function(options){
           var ids,
               params = {
                   limit:options.limit ? Number(options.limit) : 1000,
                   start:options.start ? Number(options.start) : 1,
                   offset: options.offset ? Number(options.offset) : 0,
                   from: options.from ? options.from : ''
               };
           if(options.id && typeof options.id == 'string'){
               $.ajax($.extend({},options,{
                   type: 'GET',
                   url: this.resturl+this.name+'/'+options.id,
                   dataType:'json',
                   data: params,
                   success: function(result){
                       _success('retrieved data by id from domain', options.success, result);
                   },
                   error: function(xhr, status, e){
                       _error('failed to retrieved data by id from domain', options.error, xhr, status, e);
                   }
               }));
           }else if(options.id&&options.id.length){
               //batch get of items specified by array of id
               ids = options.id.join(',');
               $.ajax($.extend({},options,{
                   type: ids.length>1024?'POST':'GET',
                   url: this.resturl+this.name+'/',
                   data: $.extend(params, {id:ids}),
                   dataType:'json',
                   success: function(result){
                       _success('successfully for data by ids from domain', options.success, result);
                   },
                   error: function(xhr, status, e){
                       _error('failed to get data by ids from domain', options.error, xhr, status, e);
                   }
               }));
           }else{
                //get an array of items in the models domain
                $.ajax($.extend({},options,{
                    type: 'GET',
                    url: this.resturl+this.name+'/',
                    dataType:'json',
                    data: params,
                    success: function(result){
                        _success('loaded list of ids from domain', options.success, result);
                    },
                    error: function(xhr, status, e){
                        _error('failed to list ids from domain ', options.error, xhr, status, e);
                    }
                }));
            }
            return this;
        },
        find: function(options){
            //allow language specific queries to be hand
            //constructed and used here by simply passing 
            //the query as a string.  the server will
            //use content negotiation to determine whether
            //to treat it as json serialized or a native query
            if(options.select){
                if(typeof options.select == 'object'){
                    if(!(options.select instanceof $M.Query)){
                        //using shorthand object notation to define the query
                        //so go ahead and create an internal Query object from
                        //it.
                        options.select = new $M.Query(options.select);
                    }
                    //set the context for the query if its not a native
                    //query string
                    options.select.context = this.name;
                }
                $.ajax($.extend({},options,{
                    type: 'POST',
                    url: this.resturl,
                    data: (typeof options.select == 'string') ?
                        options.select : 
                        this.js2json( $.extend(options.data||{}, options.select)),
                    contentType:(typeof options.select == 'string')?
                        'text/plain' :
                        'application/json',
                    processData:false,
                    dataType:'json',
                    success: function(result){
                        _success('saved item to domain', options.success, result);
                    },
                    error: function(xhr, status, e){
                        _error('failed to save item to domain', options.error, xhr, status, e);
                    }
                }));
            }else{
                //rely on passed options to be sufficient
                //get an array of items in the models domain
                log.debug('performing simple parameter search');
                $.ajax($.extend({},options,{
                    type: 'GET',
                    url: this.resturl,
                    dataType:'json',
                    success: function(result){
                        _success('performed search', options.success, result);
                    },
                    error: function(xhr, status, e){
                        _error('error performing search', options.error, xhr, status, e);
                    }
                }));
            }
            return this;
        },
        next: function(options){
            this.find(query.next(), callback);
            return this;
        },
        previous: function(options){
            this.find(query.previous(), callback);
            return this;
        }
    });
    
    
    var _success = function(msg, callback, result, pager){
        log.debug('loaded list of items from domain: %s', result);
        if(callback&&$.isFunction(callback)){
            callback(result, pager);
        }
    };
    
    var _error = function(msg, callback, xhr, status, e){
        log.error( msg+' %s-%s', xhr.status, status).
            exception(e);
        if(callback&&$.isFunction(callback)){
            //second arg implies error condition occured
            callback([{msg:msg}], true);
        }
    };
    
})(jQuery, Claypool, Claypool.Models);
/**
 * @author thatcher
 */
(function($,$$,$M){
    var log;
    //Factory is really just a static function
    $M.Factory = function(options){
        options = options||{};
        log = log||$.logger('Claypool.Models.Factory');
        
        var DB,
            dbconnection;
        
        //select the db client implementation
        //
        // - 'rest' is entirely abstract and is the most reusable accross databases
        //   since it requires no database specific implementations by the client.
        //   the rest server-side services would generally use the 'direct' db client then
        //   to service the rest clients requests
        //
        // - 'direct' requires a reference to the database plugin but is otherwise
        //   generic as well. the db implementation shares a set of
        //   dbconnection parameters which are used to initialize the local
        //   clients connection
        var dbclient = options&&options.dbclient?
            options.dbclient:$.env('dbclient');
        if(!dbclient){
            dbclient = 'rest';
        }
        log.debug("loading database client connection %s", dbclient);
        if(dbclient=='rest'){
            dbclient = new $M.RestClient(options);
        }else{// if(dbclient == 'direct'){
            try{
                //get the database implementation and connection information
                DB = options&&options.db?
                        options.db:$.env('db');
                dbconnection = options&&options.dbconnection?
                        options.dbconnection:$.env('dbconnection');
                log.debug("loading database implementation %s", DB);
                if(typeof(DB)=='string'){
                    log.debug("resolving database implementation %s", DB);
                    DB = $.resolve(DB);
                }
                dbclient = new $M.Client($.extend({
                    //initialize the database connection
                    db: new DB(dbconnection)
    			},options));
            }catch(e){
                log.error('direct connection not available', e).
                    exception(e);
                //try the rest client
                dbclient = new $M.RestClient(options);
            }
        }
        return dbclient;
    };
    
})(jQuery, Claypool, Claypool.Models);
/**
 * @author thatcher
 */
(function($,$$,$M){
    
    $.extend($, {
        db: function(options){
            return new $M.Factory(options);
        },
        model: function(name, fields, options){
            return new $M.Model(name, fields, options);
        },
        query: function(options){
            return new $M.Query(options);
        },
        index: function(){
            if(arguments.length === 0){
                return $.config('index');
            }else{
                return $.config('index', arguments[0]);
            }
        }
    });
    
})(jQuery, Claypool, Claypool.Models);

Claypool.Server={
/*
 * Claypool.Server @VERSION@ - A Web 1.6180339... Javascript Application Framework
 *
 * Copyright (c) 2008-2010 Chris Thatcher (claypooljs.com)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * $Date: 2008-08-06 14:34:08 -0400 (Wed, 06 Aug 2008) $
 * $Rev: 265 $
 * 
 *
 *   -   Server (Servlet-ish) Patterns  -
 */
};


(function($, $$, $$Web){
    
    var log;
    
    $.router( "hijax:server", {
        event:          'claypool:serve',
        strategy:       'first',
        routerKeys:     'urls',
        hijaxKey:       'request',
        eventNamespace: "Claypool:Server:HijaxServerController",
        target:     function(event, request, response){ 
            log = log||$.logger('Claypool.Server');
            log.debug('targeting request event');
            event.request = request;
            event.response = response;
            event.write = function(str){
                log.debug('writing response.body : %s', str);
                response.body = str+''; 
                return this;
            };
            event.writeln = function(str){
                log.debug('writing line to response.body : %s', str);
                response.body += str+'';
                return this;
            };
            return request.requestURL+'';
        },
        normalize:  function(event){
            //adds request parameters to event.params()
            //normalized state map
            return $.extend({},event.request.parameters, {
                parameters:event.request.parameters,
                method: event.request.method,
                body: event.request.body,
                headers: $.extend(event.response.headers, event.request.headers)
            });
        }
    });
    
    
    $$.Services = {
        // An object literal plugin point for providing plugins on
        // the Claypool namespace.  This object literal is reserved for
        // services which have been integrated as well established
        // and have been included in the jQuery-Clayool repository
        // as official
    };
    
})(  jQuery, Claypool, Claypool.Server );


/**
 * Descibe this class
 * @author 
 * @version $Rev$
 * @requires OtherClassName
 */
(function($, $$, $$Web){
    /**
     * @constructor
     */
    
    $$Web.Servlet = function(options){
        $$.extend(this, $$.MVC.Controller);
        $.extend(true, this, options);
        this.logger = $.logger("Claypool.Server.Servlet");
    };
    
    $.extend( $$Web.Servlet.prototype, 
              $$.MVC.Controller.prototype, {
        /**
         * Describe what this method does
         * @private
         * @param {String} paramName Describe this parameter
         * @returns Describe what it returns
         * @type String
         */
        //We reduce to a single response handler function because it's not easy to
        //support the asynch stuff on the server side
        
        handle: function(event){
            //data is just the routing info that got us here
            //the request and response is really all we care about
            var method = event.params('method').toUpperCase(); 
            event.params('headers').status = 200;
             
            this.logger.debug("Handling %s request", method);
            switch(method){
                case 'GET':
                    this.handleGet(event, event.response);break;
                case 'POST':
                    this.handlePost(event, event.response);break;
                case 'PUT':
                    this.handlePut(event, event.response);break;
                case 'DELETE':
                    this.handleDelete(event, event.response);break;
                case 'HEAD':
                    this.handleHead(event, event.response);break;
                case 'OPTIONS':
                    this.handleOptions(event, event.response); break;
                default:
                    this.logger.debug("Unknown Method: %s, rendering error response.",  method );
                    this.handleError(event, "Unknown Method: " + method, new Error() );
            }
        },
        /**
         * Describe what this method does
         * @private
         * @param {String} paramName Describe this parameter
         * @returns Describe what it returns
         * @type String
         */
        handleGet: function(event){
            throw new $$.MethodNotImplementedError();
        },
        /**
         * Describe what this method does
         * @private
         * @param {String} paramName Describe this parameter
         * @returns Describe what it returns
         * @type String
         */
        handlePost: function(event){
            throw new $$.MethodNotImplementedError();
        },
        /**
         * Describe what this method does
         * @private
         * @param {String} paramName Describe this parameter
         * @returns Describe what it returns
         * @type String
         */
        handlePut: function(event){
            throw new $$.MethodNotImplementedError();
        },
        /**
         * Describe what this method does
         * @private
         * @param {String} paramName Describe this parameter
         * @returns Describe what it returns
         * @type String
         */
        handleDelete: function(event){
            throw new $$.MethodNotImplementedError();
        },
        /**
         * Describe what this method does
         * @private
         * @param {String} paramName Describe this parameter
         * @returns Describe what it returns
         * @type String
         */
        handleHead: function(event){
            throw new $$.MethodNotImplementedError();
        },
        /**
         * Describe what this method does
         * @private
         * @param {String} paramName Describe this parameter
         * @returns Describe what it returns
         * @type String
         */
        handleOptions: function(event){
            throw new $$.MethodNotImplementedError();
        },
        /**
         * Describe what this method does
         * @private
         * @param {String} paramName Describe this parameter
         * @returns Describe what it returns
         * @type String
         */
        handleError: function(event, msg, e){
            this.logger.warn("The default error response should be overriden");
            event.headers.status = 300;
            event.response.body = msg?msg:"Unknown internal error\n";
            event.response.body += e&&e.msg?e.msg+'':(e?e+'':"\nUnpsecified Error.");
        }
    });
    
    
    
})(  jQuery, Claypool, Claypool.Server );

/**
 * @author thatcher
 */
(function($, $$, $M, $Web){
    
    var log;
	
	//TODO: event.response.* must be replaced with event.write, event.writeln,
	//		and event.headers (headers are echoed based on request and new headers 
	//		add onto, or overwrite, request headers with additional response headers)
    
    $Web.RestServlet = function(options){
        $$.extend(this, $Web.Servlet);
        $.extend(true, this, $M.Factory(options));
        log = $.logger('Claypool.Server.RestServlet');
        //they must provide a object which implements
        //the methods js2json and json2js
        //we include $'s json plugin as a default implementation
        //when present
        this.js2json = $.js2json && $.isFunction($.js2json)?
            $.js2json:options.js2json;
        this.json2js = $.json2js && $.isFunction($.json2js)?
            $.json2js:options.json2js;
    };
    
    $.extend( $Web.RestServlet.prototype, 
              $Web.Servlet.prototype, {
        handleGet: function( event ){
            var _this=  this,
			    domain= event.params( 'domain' ),
                id=     event.params( 'id' ),
                query=  event.params( 'q' ),
                ids=    id ? id.split( ',' ) : [],
                select;
                
            log.debug("Handling GET for %s %s", domain, id);
            if( query ){
                //treat as a 'find' operation
                log.debug('finding results with url constructed query %o', 
                    event.params());
                this.db.find($.extend({
                    data:event.params('values'),
                    async: false,
                    success: function(result){
                        handleSuccess(event, result, _this);
                    },
                    error: function(xhr, status, e){
                        handleError(event, result, _this);
                    }
                }, event.params()));
            }else if(!domain && !id){
                //response is an array of all domain names
                this.db.get($.extend({
                    async: false,
                    success: function(result){
                        handleSuccess(event, result, _this);
                    },
                    error: function(result){
                        handleError(event, result, _this);
                    }
                }, event.params()));
            }else if(domain && (ids.length > 1 || !id)){
                log.debug("Handling GET for %s %s", domain, ids);
                if(ids.length > 1){
                    //response is batch get of items by id
                    this.db.get($.extend(event.params(),{
                        id: ids,
                        domain:domain,
                        async: false,
                        success: function(result){
                            handleSuccess(event, result, _this);
                        },
                        error: function(result){
                            handleError(event, result, _this);
                        }
                    }));
                }else{
                    log.debug("getting list of item ids for domain %s", domain, id);
                    //response is list of item names for the domain
                    this.db.get($.extend({
                        domain:domain,
                        async: false,
                        success: function(result){
                            handleSuccess(event, result, _this);
                        },
	                    error: function(result){
	                        handleError(event, result, _this);
	                    }
                    }, event.params()));
                }
            }else if(domain && id && id!='metadata'){
                //response is the record
                this.db.get({
                    domain: domain,
                    id: id,
                    async: false,
                    dataType:'text',
                    success: function(result){
                        handleSuccess(event, result, _this);
                    },
                    error: function(result){
                        handleError(event, result, _this);
                    }
                });
            }else if(domain && id && id == 'metadata'){
                this.db.metadata({
                    domain: domain,
                    id: id,
                    async: false,
                    dataType:'text',
                    success:function(result){
                        handleSuccess(event, result, _this);
                    },
                    error: function(result){
                        handleError(event, result, _this);
                    }
                });
            }
        },
        handlePost: function(event){
            var _this = this,
			    domain = event.params('domain'),
                id = event.params('id'),
                ids,
                item,
                items,
                query;
            log.debug("Handling POST for %s %s", domain, id).
                debug("Reading POST body %s", event.body);
            
            if(domain && id){
                if(!event.params('body')){
                    //just a 'get' on an array of ids (where array is very large)
                    ids = id.split(',');
                    
                    //response is batch get of items by id
                    this.db.get($.extend(event.params(),{
                        id: ids,
                        domain:domain,
                        async: false,
                        success: function(result){
                            handleSuccess(event, result, _this);
                        },
                        error: function(result){
                            handleError(event, result, _this);
                        }
                    }));
                }else{
                    //create a new record(s)
                    log.debug('updating single object', event.request.body);
                    item = this.json2js(event.request.body);
                    this.db.update({
                        domain: domain,
                        id:id,
                        data:item,
                        async: false,
                        success: function(result){
                            handleSuccess(event, result, _this);
                        },
                        error: function(result){
                            handleError(event, result, _this);
                        }
                    });
                }
            }else if(domain && !id){
                log.debug('updating array of objects (bulk save)');
                items = this.json2js(event.request.body);
    			this.db.update({
                    domain: domain,
                    data: items,
                    async: false,
					batch: true,
                    success: function(result){
                        handleSuccess(event, result, _this);
                    },
                    error: function(result){
                        handleError(event, result, _this);
                    }
                });
            }else if(!domain && !id){
                //is is a general query string or a json
                //serialization used to build a query
                //dynamically - use the content-type
                //header
                query = event.request.body;
                if(event.request.contentType.match('application/json')){
                    query = this.json2js(query);
                }
                log.debug('executing query \n%s', query);
                this.db.find($.extend({
                    select:query,
                    async: false,
                    success: function(result){
                        handleSuccess(event, result, _this);
                    },
                    error: function(result){
                        handleError(event, result, _this);
                    }
                }, event.params()));
            }
            
        },
        handlePut: function(event){
            var _this = this,
			    id = event.params('id');
                domain = event.params('domain');
            log.debug("Handling PUT for %s %s", domain);
            if(domain && id){
                //create a new record(s)
                log.debug('saving single object', event.request.body);
                item = this.json2js(event.request.body);
                this.db.save({
                    domain: domain,
                    id:id,
                    data:item,
                    async: false,
                    success: function(result){
                        handleSuccess(event, result, _this);
                    },
                    error: function(result){
                        handleError(event, result, _this);
                    }
                });
            }else if(domain && event.request.body){
                log.debug('saving array of objects (bulk save)');
                items = this.json2js(event.request.body);
                this.db.save({
                    domain: domain,
                    data: items,
                    async: false,
                    batch: true,
                    success: function(result){
                        handleSuccess(event, result, _this);
                    },
                    error: function(result){
                        handleError(event, result, _this);
                    }
                });
            }else if(domain){
                //create a new domain
                this.db.create({
                    domain: domain,
                    async: false,
                    success: function(result){
                        handleSuccess(event, result, _this);
                    },
                    error: function(result){
                        handleError(event, result, _this);
                    }
                });
            }
        },
        handleDelete: function(event){
            var _this = this,
			    domain = event.params('domain'),
                id = event.params('id');
            log.debug("Handling DELETE for %s %s", domain, id);

            if(domain && id){
                //delete an item
                this.db.remove({
                    domain: domain,
                    id:id,
                    async: false,
                    success: function(result){
                        handleSuccess(event, result, _this);
                    },
                    error: function(result){
                        handleError(event, result, _this);
                    }
                });
            }else if(domain && !id){
                //delete a domain
    			this.db.destroy({
                    domain: domain,
                    async: false,
                    success: function(result){
                        handleSuccess(event, result, _this);
                    },
                    error: function(result){
                        handleError(event, result, _this);
                    }
                });
            }
        }
    });
    
    var handleSuccess = function(event, result, servlet){
        var body =  servlet.js2json(result, null, '   ');
        log.debug('succeeded. %s', body);
        event.response.headers = {
            status:         200,
            'Content-Type': 'text/javascript; charset=utf-8'
        };
        event.response.body = body;
    };
    
    
    var handleError = function(event, result, servlet){
        var body =  servlet.js2json(result, null, '    ');
        log.error('failed. %s', body);
        event.response.headers ={
            status : result.code?result.code:500,
            'Content-Type': 'text/javascript; charset=utf-8'
        };
        event.response.body = body?body:"{'error':{"+
            "'code'  : 500,"+
            "'type'  : 'UnknownClaypoolRestError',"+
            "'msg'   : 'unknown error, check network'"+
        "}}";
    };
    
    
})(jQuery, Claypool, Claypool.Models, Claypool.Server);

/**
 * Descibe this class
 * @author 
 * @version $Rev$
 * @requires OtherClassName
 */
(function($, $$, $$Web){
    var log;
    /**
     * @constructor
     */
    $$Web.WebProxyServlet = function(options){
        $$.extend(this, $$Web.Servlet);
        this.rewriteMap = null;//Array of Objects providing url rewrites
        $.extend(true, this, options);
        log = $.logger("Claypool.Server.WebProxyServlet");
        this.router = new $$.Router();
        this.strategy = this.strategy||"first";
        log.debug("Compiling url rewrites %s.", this.rewriteMap);
        this.router.compile(this.rewriteMap, "urls");//, "rewrite");
    };
    $.extend($$Web.WebProxyServlet.prototype, 
        $$Web.Servlet.prototype,{
        handleGet: function(event, response){
            var options = _proxy.route(request, this);
            var proxyURL = options.proxyURL,
                params   = options.params;
            if(proxyURL && proxyURL.length && proxyURL.length > 0){
                log.debug("Proxying get request to: %s", proxyURL[0].payload.rewrite);
                $.ajax({
                    type:"GET",
                    dataType:"text",
                    async:false,
                    data:params,
                    url:proxyURL[0].payload.rewrite+'',
                    beforeSend:function(xhr){_proxy.beforeSend(event.request, response, xhr);},
                    success:function(text){_proxy.success(response, text);},
                    error: function(xhr, status, e){_proxy.error(response, xhr, status, e);},
                    complete: function(xhr, status){_proxy.complete(response, proxyURL, xhr, status);}
                });
            }
            return response;
        },
        handlePost:function(event, response){
            var options = _proxy.route(event.request, this);
            var proxyURL = options.proxyURL,
                params   = options.params;
            if(proxyURL && proxyURL.length && proxyURL.length > 0){
                log.debug("Proxying post request to: %s", proxyURL[0].payload.rewrite);
                $.ajax({
                    type:"POST",
                    dataType:"text",
                    async:false,
                    data:params,
                    url:proxyURL[0].payload.rewrite+'',
                    beforeSend:function(xhr){_proxy.beforeSend(event.request, response, xhr);},
                    success:function(text){_proxy.success(response, text);},
                    error: function(xhr, status, e){_proxy.error(response, xhr, status, e);},
                    complete: function(xhr, status){_proxy.complete(response, proxyURL, xhr, status);}
                });
            }
            return response;
        }
    });
    
    
    var _proxy = {
        route:function(request, options){
            log.debug("Handling proxy: %s", request.requestURI);
            var proxyURL = options.router[options.strategy||"all"]( request.requestURI );
            request.headers["Claypool-Proxy"] = options.proxyHost||"127.0.0.1";
			var params = {};
			for (var prop in request.parameters){
				log.debug("request.parameters[%s]=%s", prop, request.parameters[prop]);
				params[prop+'']=request.parameters[prop]+'';
			}
            var body = (request.body&&request.body.length)?request.body:'';
            return {
                proxyURL:proxyURL,
                params:params,
                body:body
            };
        },
        beforeSend: function(request, response, xhr){
            log.debug("Copying Request headers for Proxied Request");
            for(var header in request.headers){
                log.debug("Setting proxied request header %s: %s",header, request.headers[header] );
                xhr.setRequestHeader(header, request.headers[header]);
            }
            response.headers = {};
        },
        success: function(response, text){
            log.debug("Got response for proxy \n %s.", text);
            response.body = text+'';
        },
        error: function(response, xhr, status, e){
            log.error("Error proxying request. STATUS: %s", status?status:"UNKNOWN");
            if(e){log.exception(e);}
            response.body = xhr.responseText+'';
        },
        complete: function(response, proxyURL, xhr, status){
            log.debug("Proxy Request Complete, Copying response headers");
            var proxyResponseHeaders = xhr.getAllResponseHeaders();
            var responseHeader;
            var responseHeaderMap;
            log.debug("Complete Proxy response header: \n %s" ,proxyResponseHeaders);
            proxyResponseHeaders = proxyResponseHeaders.split("\r\n");
            for(var i = 0; i < proxyResponseHeaders.length; i++){
                responseHeaderMap = proxyResponseHeaders[i].split(":");
                try{
                    log.debug("setting response header %s %s", responseHeaderMap[0], responseHeaderMap.join(":"));
                    response.headers[responseHeaderMap.shift()] = responseHeaderMap.join(":");
                }catch(e){
                    log.warn("Unable to set a proxied response header");
                    log.exception(e);
                }
            }
            log.debug('response status (%s)', xhr.status);
            response.headers.status = Number(xhr.status);
            response.headers["Claypool-Proxy"] = proxyURL[0].payload.rewrite+'';
            response.headers["Content-Encoding"] = proxyURL[0].payload.contentEncoding||"";
            response.headers["Transfer-Encoding"] = proxyURL[0].payload.transferEncoding||"";
            if(proxyURL[0].payload.contentType){
                //override the content type
                response.headers["Content-Type"] = proxyURL[0].payload.contentType+'';
            }
        }
    };
    
})(  jQuery, Claypool, Claypool.Server );
/**
 * @author thatcher
 */
(function($, $$, $S){

    var log,
        db;
    
    $S.Manage = function(options){
        $.extend(true, this, options);
        log = $.logger('Claypool.Services.Manage');
        db = $$.Models.Factory();
    };
    
    $.extend($S.Manage.prototype, {
        handle:function(event){
            var command = event.params('command'),
                target = event.params('target');
            log.debug("handling command %s %s", command, target);
            $$.Commands[command](target, event);
            if(('reset' == command)||('syncdb' == command)){
                log.debug('forwarding to rest service');
                event.response.headers =  {
                    status:   302,
                    "Location": '/rest/'
                };
            }
        }
    });
    
    $.extend( true, $$.Commands, {
        reset: function(targets){
            var domains;
            db.get({
                async: false,
                success: function(result){
                    domains = result.domains;
                    log.debug('loaded domains');
                },
                error: function(xhr, status, e){
                    log.error('failed to get db domains');
                }
            });
            //drops domains (tables) for each model
            $(domains).each(function(index, domain){
                db.destroy({
                    domain: domain,
                    async: false,
                    success: function(result){
                        log.info('destroyed domain %s', domain);
                    },
                    error: function(xhr, status, e){
                        log.error('failed to delete domain %s', domain);
                    }
                });
            });
        },
        syncdb: function(targets){
            //creates domain (tables) for each model
            var data,
                data_url = $.env('initialdata')+'dump.json?'+$.uuid(),
                domain;
                
            log.info('loading initial data from %s', data_url);
            $.ajax({
                type:'get',
                async:false,
                url:data_url,
                dataType:'text',
                success:function(_data){
                    data = $.json2js(_data);
                    log.info('loaded initial data');
                },
                error:function(xhr, status, e){
                    log.error('failed [%s] to load initial data %s', status, e);
                }
            });
            
            for(domain in data){
                db.create({
                    domain: domain,
                    async:false,
                    success:function(result){
                        log.info('created domain %s', domain);
                    }
                });
                db.save({
                    async:false,
                    batch:true,
                    domain: domain,
                    data:data[domain],
                    success: function(){
                        log.info('batch save successful %s ', domain);
                    },
                    error: function(){
                        log.error('batch save failed %s', domain);
                    }
                });
            }
        },
        dumpdata: function(targets, event){
            var data = {};
            var domains;
                
            db.get({
                async: false,
                success: function(result){
                    domains = result.domains;
                    log.debug('loaded domains');
                },
                error: function(xhr, status, e){
                    log.error('failed to get db domains');
                }
            });
            
            $(domains).each(function(i, domain){
                db.find({
                    select:"new Query('"+domain+"')",
                    async: false,
                    success: function(result){
                        log.info('found %s entries in %s', result.data.length, domain);
                        data[domain] = result.data;
                    },
                    error: function(xhr, status, e){
                        ok(false, 'failed load entries from %s', domain);
                    }
                });
            });
            
            event.write($.js2json(data, null, '    '));
            event.response.headers =  {
                status:   200,
                'Content-Type':'application/json'
            };
        }
    });

})(jQuery, Claypool, Claypool.Services);

/**
 * Descibe this class
 * @author 
 * @version $Rev$
 * @requires OtherClassName
 */
(function($, $$, $$Web){
	/**
	 * @constructor
	 */
    //TODO There should be some useful errors so we can handle common issues
    //like error pages for 500's, 404's etc
	
})(  jQuery, Claypool, Claypool.Server );

(function($, $$, $$Web){

    var log,
        console;
    
    $.extend($, {
        /**
         * 
         * @param {Object} request
         * @param {Object} response
         */
        serve: function(request, response){ 
            var prop;
            log = log||$.logger("Claypool.Server");
            log.info("Handling global request routing for request: %s ", request.requestURL).
                 debug("Dispatching request to Server Sevlet Container");
            response.headers = {};
            $.extend( response.headers, { 'Content-Type':'text/html; charset=utf-8', status: -1 });
            response.body = "";
            try{
                log.debug('serving request event');
                $(document).trigger("claypool:serve",[ request, response ]);
                
                log.debug('finished serving request event');
                //Hope for the best
                if(response.headers.status === -1){
                    response.headers.status = 200;
                    if(!response.body){
                        response.headers.status = 404;
                        response.body = "<html><head></head><body><h1>jQuery-Claypool Server Error</h1>";
                        response.body += "<p>"+
                            "Not Found :\n\t"+request.requestURL+
                        "</p></body></html>";
                        
                    }
                }
            }catch(e){
                log.error("Error Handling Request.").exception(e);
                response.headers["Content-Type"] = "text/html; charset=utf-8";
                response.headers.status = 500;
                response.body = "<html><head></head><body><h1>jQuery-Claypool Server Error</h1>";
                
                response.body += "<h2>Error Details</h2>";
                for(prop in e){
                    response.body += 
                        '<strong>'+prop+'</strong><br/>'+
                        '<span>'+e[prop]+'</span><br/>';
                }
                response.body += "<h2>General Request Details</h2>";
                for(prop in request){
                    response.body += 
                        '<strong>'+prop+'</strong><br/>'+
                        '<span>'+request[prop]+'</span><br/>';
                } 
                response.body += "<h2>Request Header Details</h2>";
                for(prop in request.headers){
                    response.body += 
                        '<strong>'+prop+'</strong><br/>'+
                        '<span>'+request.headers[prop]+'</span><br/>';
                }
                response.body += "</body></html>";
            }
        },
        /**
         * 
         * @param {Object} target
         */
		servlet: function(target){
            log = log||$.logger("Claypool.Server");
            log.debug('Applying servlet pattern to %s', target);
            $$.extend(target, $$Web.Servlet);
        },
        /**
         * 
         * @param {Object} options
         */
        proxy: function(options){
            return $.invert([{ 
                id:options.id||'proxy_'+$.uuid(),    
                clazz:"Claypool.Server.WebProxyServlet", 
                options:[{
                    rewriteMap:options.rewrites
                }]
            }]);
        }
    });
    
    /**@global*/
    ClaypoolServerHandler = $.serve;
    
    
})(  jQuery, Claypool, Claypool.Server );

/* Copyright (c) 2007 Brandon Aaron (brandon.aaron@gmail.com || http://brandonaaron.net)
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) 
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 *
 * Version: @VERSION
 * Requires jQuery 1.1.3+
 * Docs: http://docs.jquery.com/Plugins/livequery
 */

(function($) {
	
$.extend($.fn, {
	livequery: function(type, fn, fn2) {
		var self = this, q;
		
		// Handle different call patterns
		if ($.isFunction(type))
			fn2 = fn, fn = type, type = undefined;
			
		// See if Live Query already exists
		$.each( $.livequery.queries, function(i, query) {
			if ( self.selector == query.selector && self.context == query.context &&
				type == query.type && (!fn || fn.$lqguid == query.fn.$lqguid) && (!fn2 || fn2.$lqguid == query.fn2.$lqguid) )
					// Found the query, exit the each loop
					return (q = query) && false;
		});
		
		// Create new Live Query if it wasn't found
		q = q || new $.livequery(this.selector, this.context, type, fn, fn2);
		
		// Make sure it is running
		q.stopped = false;
		
		// Run it
		$.livequery.run( q.id );
		
		// Contnue the chain
		return this;
	},
	
	expire: function(type, fn, fn2) {
		var self = this;
		
		// Handle different call patterns
		if ($.isFunction(type))
			fn2 = fn, fn = type, type = undefined;
			
		// Find the Live Query based on arguments and stop it
		$.each( $.livequery.queries, function(i, query) {
			if ( self.selector == query.selector && self.context == query.context && 
				(!type || type == query.type) && (!fn || fn.$lqguid == query.fn.$lqguid) && (!fn2 || fn2.$lqguid == query.fn2.$lqguid) && !this.stopped )
					$.livequery.stop(query.id);
		});
		
		// Continue the chain
		return this;
	}
});

$.livequery = function(selector, context, type, fn, fn2) {
	this.selector = selector;
	this.context  = context || document;
	this.type     = type;
	this.fn       = fn;
	this.fn2      = fn2;
	this.elements = [];
	this.stopped  = false;
	
	// The id is the index of the Live Query in $.livequery.queries
	this.id = $.livequery.queries.push(this)-1;
	
	// Mark the functions for matching later on
	fn.$lqguid = fn.$lqguid || $.livequery.guid++;
	if (fn2) fn2.$lqguid = fn2.$lqguid || $.livequery.guid++;
	
	// Return the Live Query
	return this;
};

$.livequery.prototype = {
	stop: function() {
		var query = this;
		
		if ( this.type )
			// Unbind all bound events
			this.elements.unbind(this.type, this.fn);
		else if (this.fn2)
			// Call the second function for all matched elements
			this.elements.each(function(i, el) {
				query.fn2.apply(el);
			});
			
		// Clear out matched elements
		this.elements = [];
		
		// Stop the Live Query from running until restarted
		this.stopped = true;
	},
	
	run: function() {
		// Short-circuit if stopped
		if ( this.stopped ) return;
		var query = this;
		
		var oEls = this.elements,
			els  = $(this.selector, this.context),
			nEls = els.not(oEls);
		
		// Set elements to the latest set of matched elements
		this.elements = els;
		
		if (this.type) {
			// Bind events to newly matched elements
			nEls.bind(this.type, this.fn);
			
			// Unbind events to elements no longer matched
			if (oEls.length > 0)
				$.each(oEls, function(i, el) {
					if ( $.inArray(el, els) < 0 )
						$.event.remove(el, query.type, query.fn);
				});
		}
		else {
			// Call the first function for newly matched elements
			nEls.each(function() {
				query.fn.apply(this);
			});
			
			// Call the second function for elements no longer matched
			if ( this.fn2 && oEls.length > 0 )
				$.each(oEls, function(i, el) {
					if ( $.inArray(el, els) < 0 )
						query.fn2.apply(el);
				});
		}
	}
};

$.extend($.livequery, {
	guid: 0,
	queries: [],
	queue: [],
	running: false,
	timeout: null,
	
	checkQueue: function() {
		if ( $.livequery.running && $.livequery.queue.length ) {
			var length = $.livequery.queue.length;
			// Run each Live Query currently in the queue
			while ( length-- )
				$.livequery.queries[ $.livequery.queue.shift() ].run();
		}
	},
	
	pause: function() {
		// Don't run anymore Live Queries until restarted
		$.livequery.running = false;
	},
	
	play: function() {
		// Restart Live Queries
		$.livequery.running = true;
		// Request a run of the Live Queries
		$.livequery.run();
	},
	
	registerPlugin: function() {
		$.each( arguments, function(i,n) {
			// Short-circuit if the method doesn't exist
			if (!$.fn[n]) return;
			
			// Save a reference to the original method
			var old = $.fn[n];
			
			// Create a new method
			$.fn[n] = function() {
				// Call the original method
				var r = old.apply(this, arguments);
				
				// Request a run of the Live Queries
				$.livequery.run();
				
				// Return the original methods result
				return r;
			}
		});
	},
	
	run: function(id) {
		if (id != undefined) {
			// Put the particular Live Query in the queue if it doesn't already exist
			if ( $.inArray(id, $.livequery.queue) < 0 )
				$.livequery.queue.push( id );
		}
		else
			// Put each Live Query in the queue if it doesn't already exist
			$.each( $.livequery.queries, function(id) {
				if ( $.inArray(id, $.livequery.queue) < 0 )
					$.livequery.queue.push( id );
			});
		
		// Clear timeout if it already exists
		if ($.livequery.timeout) clearTimeout($.livequery.timeout);
		// Create a timeout to check the queue and actually run the Live Queries
		$.livequery.timeout = setTimeout($.livequery.checkQueue, 20);
	},
	
	stop: function(id) {
		if (id != undefined)
			// Stop are particular Live Query
			$.livequery.queries[ id ].stop();
		else
			// Stop all Live Queries
			$.each( $.livequery.queries, function(id) {
				$.livequery.queries[ id ].stop();
			});
	}
});

// Register core DOM manipulation methods
$.livequery.registerPlugin('append', 'prepend', 'after', 'before', 'wrap', 'attr', 'removeAttr', 'addClass', 'removeClass', 'toggleClass', 'empty', 'remove');

// Run Live Queries when the Document is ready
$(function() { $.livequery.play(); });


// Save a reference to the original init method
var init = $.prototype.init;

// Create a new init method that exposes two new properties: selector and context
$.prototype.init = function(a,c) {
	// Call the original init and save the result
	var r = init.apply(this, arguments);
	
	// Copy over properties if they exist already
	if (a && a.selector)
		r.context = a.context, r.selector = a.selector;
		
	// Set properties
	if ( typeof a == 'string' )
		r.context = c || document, r.selector = a;
	
	// Return the result
	return r;
};

// Give the init function the jQuery prototype for later instantiation (needed after Rev 4091)
$.prototype.init.prototype = $.prototype;
	
})(jQuery);

/**
 * <: @VERSION@ :>
 * 
 * Copyright (c) 2008-2009 Chris Thatcher (claypooljs.com)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 * 
 * jQuery.json  
 *
 */
(function($){

    
	/**
	 * @param {Object} js 
	 * @param {Object} filter
	 * @param {Object} indentValue
	 */ 
	$.json = $.js2json = function(js, filter, indentValue){
	    return __JSON__.stringify(js, filter, indentValue||'');
	};
    
    /**
     * @param {Object} filter
     * @param {Object} indentValue
     */
    $.fn.json = $.fn.js2json = function( filter, indentValue){
        var i, str='[';
        for(i=0;i<this.length;i++){
            str += __JSON__.stringify(this[i], filter, indentValue||'');
            if(!(i+1 == this.length)){
                str+=',\n';
            }
        }
	    return str + ']';
	};
    
	/**
	 * @param {Object} json
	 * @param {Object} filter
	 */
	$.eval = $.json2js = function(json, filter){
	    return JSON.parse(json, filter);
	};
    
    /** 
     * @param {Object} filter
     */
    $.fn.eval = $.fn.json2js = function(filter){
        var i,js = [];
	    for(i=0;i<this.length;i++){
            js[i] = JSON.parse(this[i], filter);
        }
        return js;
	};
	
    /**
     * @param {Object} js
     * @param {Object} filter
     */
	$.strip = $.stripjs = function(js, filter){
	    return $.eval($.js2json(js, filter, ''));
	};
    
    /**
     * @param {Object} filter
     */
    $.fn.strip = $.fn.stripjs = function(filter){
	    return $.eval(this.js2json(filter, ''));
	};
	
	
    /**
     * __json__ is used internally to store the selected
     * json parsing methodolgy
     * 
     * This method of optimization is from 
     * 
     * http://weblogs.asp.net/yuanjian/archive/2009/03/22/json-performance-comparison-of-eval-new-function-and-json.aspx
     */
	var __json__ = null;
	if ( typeof JSON !== "undefined" ) {
		__json__ = JSON;
	}
	var JSON = {
	    parse: function( text , safe) {
           if(__json__ !== null || safe){
    	       return ( __json__ !== null) ?
    	           __json__.parse( text ) :
        	       __JSON__.parse(text);
           }
           if ( browser.gecko ) {
                return new Function( "return " + text )();
           }
            return eval( "(" + text + ")" );
	    }
	};  
    
           
	/*
	    http://www.JSON.org/json2.js
	    2008-07-15
	
	    Public Domain.
	
	    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
	
	    See http://www.JSON.org/js.html
	
	   
	    This code should be minified before deployment.
	    See http://javascript.crockford.com/jsmin.html
	
	    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
	    NOT CONTROL.
	*/
    var __JSON__ = function () {

        function f(n) {
            // Format integers to have at least two digits.
            return n < 10 ? '0' + n : n;
        }

        Date.prototype.toJSON = function (key) {

            return this.getUTCFullYear()   + '-' +
                 f(this.getUTCMonth() + 1) + '-' +
                 f(this.getUTCDate())      + 'T' +
                 f(this.getUTCHours())     + ':' +
                 f(this.getUTCMinutes())   + ':' +
                 f(this.getUTCSeconds())   + 'Z';
        };

        String.prototype.toJSON = function (key) {
            return String(this);
        };
        Number.prototype.toJSON =
        Boolean.prototype.toJSON = function (key) {
            return this.valueOf();
        };

        var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
            escapeable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
            gap,
            indent,
            meta = {    // table of character substitutions
                '\b': '\\b',
                '\t': '\\t',
                '\n': '\\n',
                '\f': '\\f',
                '\r': '\\r',
                '"' : '\\"',
                '\\': '\\\\'
            },
            rep;


        function quote(string) {
        	
            escapeable.lastIndex = 0;
            return escapeable.test(string) ?
                '"' + string.replace(escapeable, function (a) {
                    var c = meta[a];
                    if (typeof c === 'string') {
                        return c;
                    }
                    return '\\u' + ('0000' +
                            (+(a.charCodeAt(0))).toString(16)).slice(-4);
                }) + '"' :
                '"' + string + '"';
        }


        function str(key, holder) {

            var i,          // The loop counter.
                k,          // The member key.
                v,          // The member value.
                length,
                mind = gap,
                partial,
                value = holder[key];

            if (value && typeof value === 'object' &&
                    typeof value.toJSON === 'function') {
                value = value.toJSON(key);
            }
            if (typeof rep === 'function') {
                value = rep.call(holder, key, value);
            }

            switch (typeof value) {
            case 'string':
                return quote(value);

            case 'number':
                return isFinite(value) ? String(value) : 'null';

            case 'boolean':
            case 'null':

                return String(value);
            
            case 'xml':

                return '"'+value.toXMLString().
                            replace('\n', '\\\n', 'g').
                            replace('"','\\"','g')+'"';    
            case 'object':

                if (!value) {
                    return 'null';
                }
                gap += indent;
                partial = [];

                if (typeof value.length === 'number' &&
                        !(value.propertyIsEnumerable('length'))) {

                    length = value.length;
                    for (i = 0; i < length; i += 1) {
                        partial[i] = str(i, value) || 'null';
                    }
                    
                    v = partial.length === 0 ? '[]' :
                        gap ? '[\n' + gap +
                                partial.join(',\n' + gap) + '\n' +
                                    mind + ']' :
                              '[' + partial.join(',') + ']';
                    gap = mind;
                    return v;
                }

                if (rep && typeof rep === 'object') {
                    length = rep.length;
                    for (i = 0; i < length; i += 1) {
                        k = rep[i];
                        if (typeof k === 'string') {
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v);
                            }
                        }
                    }
                } else {

                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v);
                            }
                        }
                    }
                }

                v = partial.length === 0 ? '{}' :
                    gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
                            mind + '}' : '{' + partial.join(',') + '}';
                gap = mind;
                return v;
            }
        }

        return {
            stringify: function (value, replacer, space) {

                var i;
                gap = '';
                indent = '';

                if (typeof space === 'number') {
                    for (i = 0; i < space; i += 1) {
                        indent += ' ';
                    }

                } else if (typeof space === 'string') {
                    indent = space;
                }

                rep = replacer;
                if (replacer && typeof replacer !== 'function' &&
                        (typeof replacer !== 'object' ||
                         typeof replacer.length !== 'number')) {
                    throw new Error('JSON.stringify');
                }

                return str('', {'': value});
            },


            parse: function (text, reviver) {
                var j;

                function walk(holder, key) {
                    var k, v, value = holder[key];
                    if (value && typeof value === 'object') {
                        for (k in value) {
                            if (Object.hasOwnProperty.call(value, k)) {
                                v = walk(value, k);
                                if (v !== undefined) {
                                    value[k] = v;
                                } else {
                                    delete value[k];
                                }
                            }
                        }
                    }
                    return reviver.call(holder, key, value);
                }

                cx.lastIndex = 0;
                if (cx.test(text)) {
                    text = text.replace(cx, function (a) {
                        return '\\u' + ('0000' +
                                (+(a.charCodeAt(0))).toString(16)).slice(-4);
                    });
                }

                if (/^[\],:{}\s]*$/.
test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').
replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
	
                    j = eval('(' + text + ')');

                    return typeof reviver === 'function' ?
                        walk({'': j}, '') : j;
                }

                throw new SyntaxError('JSON.parse');
            }
        };
    }();

    /**
	 * from yui we determine the browser
	 */
	//yui
	var Browser = function() {
	   var o = {
	       ie: 0,
	       opera: 0,
	       gecko: 0,
	       webkit: 0
	   };
	   var ua = navigator.userAgent, m;
	   if ( ( /KHTML/ ).test( ua ) ) {
	       o.webkit = 1;
	   }
	   // Modern WebKit browsers are at least X-Grade
	   m = ua.match(/AppleWebKit\/([^\s]*)/);
	   if (m&&m[1]) {
	       o.webkit=parseFloat(m[1]);
	   }
	   if (!o.webkit) { // not webkit
	       // @todo check Opera/8.01 (J2ME/MIDP; Opera Mini/2.0.4509/1316; fi; U; ssr)
	       m=ua.match(/Opera[\s\/]([^\s]*)/);
	       if (m&&m[1]) {
	           o.opera=parseFloat(m[1]);
	       } else { // not opera or webkit
	           m=ua.match(/MSIE\s([^;]*)/);
	           if (m&&m[1]) {
	               o.ie=parseFloat(m[1]);
	           } else { // not opera, webkit, or ie
	               m=ua.match(/Gecko\/([^\s]*)/);
	               if (m) {
	                   o.gecko=1; // Gecko detected, look for revision
	                   m=ua.match(/rv:([^\s\)]*)/);
	                   if (m&&m[1]) {
	                       o.gecko=parseFloat(m[1]);
	                   }
	               }
	           }
	       }
	   }
	   return o;
	};
	var browser = Browser();

})(jQuery);
/*
 * jQuery Templating Plugin
 *   NOTE: Created for demonstration purposes.
 * Copyright 2010, John Resig
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */
(function(jQuery){

// Override the DOM manipulation function
var oldManip = jQuery.fn.domManip,
    console = ('console' in window) ? window.console : {
        log: function(){},
        debug: function(){},
        info: function(){},
        warn: function(){},
        error: function(){}
    };

jQuery.fn.extend({
	render: function( data ) {
		return this.map(function(i, tmpl){
            
            // yuck but I cant get jquery to return text nodes that are part of a 
            // template that looks like ' this text doesnt show <p>just the paragraph</p>'
            // apparently because line 125 in jquery 1.4.2 uses match[1] to build the
            // fragment not match[0].  I'll have to see if this is my bug or theirs
            var rendered = jQuery.render( tmpl, data );
			return  jQuery( 
                jQuery('<div>'+ 
                    ( jQuery.isArray(rendered) ? rendered.join('') : rendered ) +
                '</div>')[0].childNodes 
            ).get();
		});
	},
	
	// This will allow us to do: .append( "template", dataObject )
	domManip: function( args ) {
		// This appears to be a bug in the appendTo, etc. implementation
		// it should be doing .call() instead of .apply(). See #6227
		if ( args.length > 1 && args[0].nodeType ) {
			arguments[0] = [ jQuery.makeArray(args) ];
		}

		if ( args.length === 2 && typeof args[0] === "string" && typeof args[1] !== "string" ) {
            arguments[0] = jQuery.render( args[0], args[1] );
            arguments[0] = jQuery.isArray(  arguments[0] ) ? 
                [ arguments[0].join('') ] : 
                [ arguments[0] ];
		}
		
		return oldManip.apply( this, arguments );
	}
});

jQuery.extend({
    // note: render was changed to return a string not a jQuery object.
    // while fn.render does return a jquery object
	render: function( tmpl, data, asArray, partial ) {
        var fn, request;
		
		// Use a pre-defined template, if available
		if ( jQuery.templates[ tmpl ] ) {
			//console.log('rendering template %s', tmpl);
			fn = jQuery.templates[ tmpl ];
		// We're pulling from a script node
		} else if ( tmpl.nodeType ) {
			var node = tmpl, elemData = jQuery.data( node )||{};
            //if script node is empty and has a src attribute honor it
            if(node.src){
                //call re-call render via syncronous ajax with src url
                return jQuery.render({
                    async: false,
                    url: node.src, 
                    templateData: data
                });
            }else{
                fn = elemData.tmpl || jQuery.tmpl( node.innerHTML );
            }
        // passing object implies ajax fetch of remote template
		} else if ( jQuery.isPlainObject( tmpl ) ){
            // TODO: re-think but render as-is cant support async
            // since it is expected to return the rendered template
            // as a string - might be nice to have optional arg for
            // callback of aynch template rendering. :DONE
			if(tmpl.url && jQuery.templates[ tmpl.url ]){
				fn = jQuery.templates[ tmpl.url ];
				
                if( tmpl.success )
                    tmpl.success( fn.call( tmpl.templateData, jQuery, tmpl.templateData, 0, tmpl.asArray, tmpl.partial ) );
			}else{
            	var options = jQuery.extend( {}, tmpl, {
	                // url is a required property of the passed options
	                type: 'GET',
	                dataType: 'text',
	                success: function( text ){
	                    jQuery.templates[ tmpl.url ] = jQuery.tmpl( text );
	                    // if a rendering callback was provided, use it
	                    if( tmpl.success )
	                        tmpl.success( jQuery.render( tmpl.url, tmpl.templateData, tmpl.asArray, tmpl.partial ) );
                        
	                },
	                error: function( xhr, status, e ){
	                    jQuery.templates[ tmpl.url ] = jQuery.tmpl( 
	                        'Failed to load template from '+tmpl.url +
	                        '('+status+')'+e
	                    );
	                    // if a rendering callback was provided, use it
	                    if( tmpl.error )
	                        tmpl.error( jQuery.render( tmpl.url, tmpl.templateData, tmpl.asArray, tmpl.partial  ) );
	                }
	            });
		        request = jQuery.ajax( options );
			}
            
            // for non async renderings if they provide no success callback
            // allow the rendered template to be returned
            return ( tmpl.async === false ) && !tmpl.success ? 
                jQuery.render( tmpl.url, tmpl.templateData ) : request;
        }

		fn = fn || jQuery.tmpl( tmpl );
		
		// We assume that if the template string is being passed directly
		// in the user doesn't want it cached. They can stick it in
		// jQuery.templates to cache it.
		if ( jQuery.isArray( data ) ) {
			return jQuery.map( data, function( data, i ) {
				return fn.call( data, jQuery, data, i, asArray, partial);
			});

		} else {
            return fn.call( data, jQuery, data, 0, asArray, partial );
		}
	},
	
	// You can stick pre-built template functions here
	templates: {},
    

	encode: function( text ) {
		return text != null ? document.createTextNode( text.toString() ).nodeValue : "";
	},

    /*
     * For example, someone could do:
     *   jQuery.templates.foo = jQuery.tmpl("some long templating string");
     *   $("#test").append("foo", data);
     */
	tmpl: function(str, data, i, partial) {
        if(!(TAG && EXPRESSION)){
            TAG = new RegExp(
                jQuery.tmpl.startTag + 
                '\\s*(\\/?)(\\w+|.)(?:\\((.*?)\\))?(?: (.*?))?\\s*'+
                jQuery.tmpl.endTag, 'g'
            );
            EXPRESSION = new RegExp(
                jQuery.tmpl.startExpression + 
                '([^'+jQuery.tmpl.endExpression+']*)'+
                jQuery.tmpl.endExpression, 'g'
            );
            //normalize to string form so they can be used to generate real
            //start and end tags
            jQuery.tmpl.startTag = jQuery.tmpl.startTag.replace('\\','', 'g');
            jQuery.tmpl.endTag = jQuery.tmpl.endTag.replace('\\','', 'g');
        }
		// Generate a reusable function that will serve as a template
		// generator (and which will be cached).
        
        var fn,
            fnstring = "\n\
var $ = jQuery, \n\
    T = [], \n\
	asArray = arguments.length>3?arguments[3]:false,\n\
	partial = arguments.length>4?arguments[4]:false,\n\
    _ = $.tmpl.filters; \n\
\n\
//make data available on tmpl.filters as object not part of global scope \n\
_.data = T.data = $data; \n\
_.$i = T.index = $i||0; \n\
T._ = null; //can be used for tmp variables\n\
function pushT(value, _this, encode){\n\
    return encode === false ? \n\
        T.push(typeof value ==='function'?value.call(_this):value) : \n\
        T.push($.encode(typeof( value )==='function'?value.call(_this):value));\n\
}\n\
\n\
// Introduce the data as local variables using with(){} \n\
with($.extend(true, {}, _, $data)){\n\
try{\n\
    T.push('" +
        // Convert the template into pure JavaScript
        str .replace(/([\\'])/g, "\\$1")
            .replace(/[\r\n]/g, " $n ")
            .replace(EXPRESSION, jQuery.tmpl.startTag+"= $1"+jQuery.tmpl.endTag)
            .replace(TAG, function(all, slash, type, fnargs, args) {
                var tmpl = jQuery.tmpl.tags[ type ];
                
                if ( !tmpl ) {
                    throw "Template not found: " + type;
                }
                var def = tmpl._default||[];
                var result = "');" + tmpl[slash ? "suffix" : "prefix"]
                    .split("$1").join(args || def[0])
                    .split("$2").join(fnargs || def[1]) + 
                    "\n        T.push('";
                
                return result;
            }).replace(/ \$n /g,"\\n")
+ "');\n\
}catch(e){\n\
    if($.tmpl.debug){\n\
        T.push(' '+e+' ');\n\
    }else{\n\
        T.push('');\n\
    }\n\
}//end try/catch\n\
}\n\
//reset the tmpl.filter data object \n\
_.data = null;\n\
return asArray ? T : T.join('')";
        
        
        //provide some feedback if they are in tmpl.debug mode
        //if (jQuery.tmpl.debug)
        //    console.log('Generated Function: \n%s', fnstring);
        
        try{    
            fn = new Function("jQuery","$data","$i",fnstring );
        }catch(e){
            //a little help debugging;
            console.warn(fnstring);
            throw(e);
        }
        
        // Provide some basic currying to the user
		return data ? fn.call( this, jQuery, data, i ) : fn;
	}
});

/*
 * jQuery.tmpl options 
 * 
 * tmpl.debug
 * By default its false, but when set to true you will get additional debug
 * messages as well as be able to see firebug output of compiled templates
 * before they are compiled as Functions
 * 
 * tmpl.startTag etc
 * These allow for the possibility of modifying the global tag/expression
 * characters in case they conflict with another preprocessor.  They must
 * use RegExp style string so special characters must be escaped by \\
 */
jQuery.extend( jQuery.tmpl, {
    debug : false,
    startTag : '{{',
    endTag : '}}',
    startExpression :'\\${',
    endExpression :'}'
});

var TAG,
    EXPRESSION;
    
/*
 * jQuery.tmpl.filters
 * 
 * These are the core supported filters.  Filters are functions made available
 * to templates.  Some may be chainable, some are not.  See the tmpl.filter.js
 * plugin for an example of how to extend filters for a good cause.  
 * 
 * Extending filters is a much better pattern than adding functions to the 
 * template data object, though that is also valid.
 */
jQuery.tmpl.filters = {
    //default filters
    join: function(){
       return Array.prototype.join.call(arguments[0], arguments[1]);
    }
};


    
/* jQuery.tmpl.tags
 * 
 * These are the core supported tags.  each should have an example in the
 * example directory.
 *  
 * NOTE: the source is shifted to help readability in this block and for
 * template debugging via firebug
 */
    
jQuery.tmpl.tags = {

// allows template developers to provide notes            
'comment': {
    prefix: "\n\
    /*",
    suffix: "\n\
    */"
},

// iterate over items in an array
'each': {
    _default: [ null, "$i" ],
    prefix: "\n\
        jQuery.each( $1, function($2){\n\
            with(this){",
    suffix: "\n\
            }\n\
        });"
},

// if/elseif/else - a general logical operator
'if': {
    prefix: "\n\
        if( $1 ){",
    suffix: "\n\
        }"
},

'elseif': {
    prefix: "\n\
        }else if( $1 ){"
},

'else': {
    prefix: "\n\
        }else{"
},

// allows for html injection
'html': {
    prefix: "\n\
        pushT($1, this, false);"
},


// allows for html injection?
'ignore': {
    prefix: "",
    suffix: ""
},

// provides support for alternate evaluation tag syntax, reused internally
'=': {
    _default: [ "this" ],
    prefix: "\n\
        pushT($1, this);"
}

};//end jQuery.tmpl.tags

    
})(jQuery);

        

/**
 * @author thatcher
 */
(function(){
    
    jQuery.tmpl.blocks = {};

    jQuery.extend(jQuery.tmpl.tags,{

block: {
    
    _default: [ null, null ],
    prefix: "\n\
	(function(){\n\
		var name = '$1',\n\
			tmp, diff1, diff2;\n\
		if(!T.blocks){\n\
			T.blocks = $.tmpl.blocks;\n\
		}\n\
		if(!T.blocks[name]){\n\
			T.blocks[name] = {start:T.length};\n\
		}\n\
        var B = (function(){\n\
           	var T = [];\n\
            function pushT(value, _this, encode){\n\
                return encode === false ? \n\
                    T.push(typeof value ==='function'?value.call(_this):value) : \n\
                    T.push($.encode(typeof( value )==='function'?value.call(_this):value));\n\
            }\n",
    suffix:"\n\
			return T;\n\
		})();\n\
		diff1 = T.blocks[name].end ? \n\
			T.blocks[name].end - T.blocks[name].start : 0;\n\
		Array.prototype.splice.apply(T,[\n\
			T.blocks[name].start+1,\n\
			diff1 \n\
		].concat(B));\n\
		T.blocks[name].end = T.blocks[name].start + B.length;\n\
		diff2 = T.blocks[name].end - T.blocks[name].start;\n\
		for(tmp in T.blocks){\n\
			if(T.blocks[tmp].start > T.blocks[name].start){\n\
				T.blocks[tmp].start += diff2 - diff1;\n\
				T.blocks[tmp].end += diff2 - diff1;\n\
			}\n\
		}\n\
	})();\n\
		"
	/*
	prefix: "\n\
        T.push('<!--block-$1--><!--endblock-$1-->');\n\
        for(var b=0;b<T.length;b++){\n\
            if(T[b].match('<!--block-$1-->')){\n\
                var r = /<\!--block-$1-->.*<\!--endblock-$1-->/,\n\
					block = '$1';\n\
                T[b] = T[b].replace(/[\\r\\n]/g, \" $n \").replace(r, (function(){\n\
                    var T = ['<!--block-$1-->'],\n\
                        end = '<!--endblock-$1-->';\n\
                    function pushT(value, _this, encode){\n\
                        return encode === false ? \n\
                            T.push(typeof value ==='function'?value.call(_this):value.replace(/ \\$n /g, '\\n')) : \n\
                            T.push($.encode(typeof( value )==='function'?value.call(_this):value).replace(/ \\$n /g, '\\n'));\n\
                    }\n",
    suffix:"\n\
                    T.push(end);\n\
					jQuery.tmpl.blocks[block] = T.join('').replace(/ \\$n /g, '\\n');\n\
                    return jQuery.tmpl.blocks[block];\n\
                })()).replace(/ \\$n /g, '\\n');\n\
                break;\n\
            };\n\
        }"
	*/
}

});

})();
/**
 * @author thatcher
 */

(function($){


jQuery.extend(jQuery.tmpl.tags,{
    extend: {
        _default: [ null, null ],
        prefix: "\n\
        T._ = $1;\n\
        if( T._.match('#') && (!partial||T.include)){\n\
            if(!( T._ in $.templates )){\n\
                /*pre-compile template*/\n\
                $.templates[ T._ ] = $.tmpl($( T._ ).text());\n\
            }\n\
        }else{\n\
            if(!( T._ in $.templates) && (!partial||T.include)){\n\
                $.ajax({\n\
                    url: T._,\n\
                    type: 'GET',\n\
                    dataType: 'text',\n\
                    async: false,\n\
                    success: function(text){\n\
                        $.templates[ T._ ] = $.tmpl( text );\n\
                    },\n\
                    error: function(xhr, status, e){\n\
                        $.templates[ T._ ] = $.tmpl( xhr.responseText );\n\
                    }\n\
                });\n\
            }\n\
        }\n\
        /*finally render partial*/\n\
		if(!partial||T.include){\n\
	        Array.prototype.push.apply(T, $.templates[ T._ ].\n\
				call(this, jQuery, $.extend({},$data,this), 0, true, false) );\n\
		}\n\
        T._ = null;\n\
        "
    }
});

// extend may also work basically like what most folks would think of
// as 'include'
jQuery.tmpl.tags.include = {
	_default: jQuery.tmpl.tags.extend._default,
    prefix: "\n\
		T.include = true;\n\
		"+jQuery.tmpl.tags.extend.prefix
};


})(jQuery);

/**
 * jQuery.tmpl.filters Plugin
 * @author thatcher
 * I just tweaked ariels collection implementation a bit and added
 * the last ten lines or so.
 */
(function( $ ){

/**
 * jQuery.Collection
 * Copyright (c) 2008 Ariel Flesler - aflesler(at)gmail(dot)com
 * Licensed under GPL license (http://www.opensource.org/licenses/gpl-license.php).
 * Date: 1/28/2008
 *
 * @projectDescription Extensible and inheritable jQuery-like collections
 * @author Ariel Flesler
 * @version 1.0.3
 *
 * @id $.collection
 * @param {  , Array } items Any amount of items for the collection, this is a generic (and the base) collection.
 * @return { $.collection } Returns a generic $.collection object.
 *
 * @id $.collection.build
 * @return {subclass of $.collection} Returns a subclass of it's caller ( $.collection in the first case ).
 */
    var f = function(){},
        // get an instance of this constructor, without calling it
        emptyInstance = function( c ){
            f.prototype = (c._constructor||c).prototype;
            return new f();
        },
        //calls the constructor of the object, passing an empty object.
        callConstructor = function( obj, args ){
            return obj.init.apply(emptyInstance(obj), args);
        },
        //generate a constructor for a new collections
        getConstructor = function(){
            return(function( list ){
                var constructor = arguments.callee,
                    obj = this instanceof constructor ? this : 
                        emptyInstance(constructor);
                //special case, cloning
                if( list && list._constructor === constructor ){
                    return obj.setArray( list.get() );
                } return obj.init.apply(obj,arguments);
            }); 
        };
        
    var $collection = getConstructor();
    
    $.extend( $collection, {
        extend: $.extend,
        fn:$collection.prototype,
        statics:'extend,isFunction,isArray,isPlainObject,'+
        'isEmptyObject,error,each,trim,makeArray,inArray,merge,'+
        'grep,map',
        // creates a new collection, that include this 
        // collections prototype
        build:function(){
            // inheritance is possible, all collection will first 
            // inherit from $.collection
            var constr = getConstructor();
            
            //copy the statics
            this.include( constr, jQuery, $collection.statics );
            //create inheritance.
            constr.prototype = constr.fn = emptyInstance(this);
            //we could lose it
            constr._constructor = 
                constr.fn._constructor = 
                    constr.fn.constructor = 
                        constr;
            
            return constr;
        },
        // imports the given methods (names) into target, 
        // from source (optional parse function)
        include:function( target, source, methods, parse ){
            if( !methods || !methods.slice ){
                var args = Array.prototype.slice.call(arguments);
                // insert 'this' first
                args.unshift(this); 
                // call again with fixed arguments
                return this.include.apply(this,args);
            }
            $.each( 
                methods.split ? 
                    methods.split(/\s?,\s?/) : 
                    methods, 
                function( i, func ){
                    target[func] = parse ? 
                        parse(source[func], func, source) : 
                        source[func];
                });
            return target;
        }
    });
    
    $collection.extend( $collection.fn, {
        
        extend:     $collection.extend,
        include:    $collection.include,
        
        init:function( els ){
            // init should always call setArray with the array of 
            // parsed items, to keep jQuery's array structure.
            var items = typeof els == 'object' && 'length' in els ? 
                els : 
                arguments;
            //this is just a generic init.
            return this.setArray( items );
        },
        
        // TODO: add more filtering options
        filter:function( filter ){
            if( typeof filter != 'function' ){
                var out = filter.constructor == Array ? 
                    filter : 
                    [filter];
                filter = function(){ 
                    return $.inArray( this, out ) != -1; 
                };
            }
            return this.pushStack($.grep( this, function( e, i ){
                return filter.call( e, i );
            }));
        },
        not:function( right ){
            right = this.filter(right);
            return this.filter(function(){
                return $.inArray( this, right ) == -1;
            });
        },
        is:function( s ){
            return !!(s && this.filter( s ).length);
        },
        add:function(){
            return this.pushStack( $.merge(this.get(), callConstructor(this,arguments) ) );
        },
        pushStack:function(items){
            var ret = emptyInstance(this).setArray( items.get ? items.get() : items  );
            ret.prevObject = this;
            return ret;
        },
        end:function(){
            return this.prevObject || callConstructor(this);
        },
        attr:function( key, value ){
            return value === undefined ? this[0] != null && this[0][key] : this.each(function(){
                this[key] = value;
            });
        },
        setArray: function(array){
            this.length = 0;
            Array.prototype.push.apply(this, array);
            return this;
        }
    });
    
    //all these methods can be used in the collections, and are exactly (and literally) like in jQuery.
    $collection.fn.include( $.fn, 'each,extend,index,get,size,eq,slice,map,andSelf' );
    
    //Basic template filter plugins or tQuery
    var currentFilters = jQuery.tmpl.filters;
    jQuery.tmpl.filters = $collection.build();
    
    jQuery.tmpl.filters.fn.extend({
        toString: function(){
            return this.join(' ');
        }
    });
    
    jQuery.tmpl.filters.extend(currentFilters);
    
            
})( jQuery );

/**
 * @author thatcher
 */
(function(){

    jQuery.extend(jQuery.tmpl.tags,{

"switch": {
    _default: [ null, null ],
    prefix: "\n\
        switch( $1 ){\n\
            case 'thiscaseshouldneverbetrue': ",
    suffix:"\n\
            break;\n\
        }"
        
},
//closed cases fall through, other wise they continue
"case": {
    _default: [ null, null ],
    prefix: "\n\
        case $1 :",
    suffix: "\n\
            break;"
        
        
},
//still provide a default and make it
"default": {
    _default: [ null, null ],
    prefix: "\n\
        default:",
    suffix:"\n\
            break;"
        
}

    });

})();
/*
 * JavaScript Creole 1.0 Wiki Markup Parser
 * $Id$
 *
 * Copyright (c) 2009 Ivan Fomichev
 *
 * Portions Copyright (c) 2007 Chris Purcell
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */

if (!Parse) { var Parse = {}; }
if (!Parse.Simple) { Parse.Simple = {}; }

Parse.Simple.Base = function(grammar, options) {
    if (!arguments.length) { return; }

    this.grammar = grammar;
    this.grammar.root = new this.ruleConstructor(this.grammar.root);
    this.options = options;
};

Parse.Simple.Base.prototype = {
    ruleConstructor: null,
    grammar: null,
    options: null,

    parse: function(node, data, options) {
        if (options) {
            for (i in this.options) {
                if (typeof options[i] == 'undefined') { options[i] = this.options[i]; }
            }
        }
        else {
            options = this.options;
        }
        data = data.replace(/\r\n?/g, '\n');
        this.grammar.root.apply(node, data, options);
        if (options && options.forIE) { node.innerHTML = node.innerHTML.replace(/\r?\n/g, '\r\n'); }
    }
};

Parse.Simple.Base.prototype.constructor = Parse.Simple.Base;

Parse.Simple.Base.Rule = function(params) {
    if (!arguments.length) { return; }

    for (var p in params) { this[p] = params[p]; }
    if (!this.children) { this.children = []; }
};

Parse.Simple.Base.prototype.ruleConstructor = Parse.Simple.Base.Rule;

Parse.Simple.Base.Rule.prototype = {
    regex: null,
    capture: null,
    replaceRegex: null,
    replaceString: null,
    tag: null,
    attrs: null,
    children: null,

    match: function(data, options) {
        return data.match(this.regex);
    },

    build: function(node, r, options) {
        var data;
        if (this.capture !== null) {
            data = r[this.capture];
        }

        var target;
        if (this.tag) {
            target = document.createElement(this.tag);
            node.appendChild(target);
        }
        else { target = node; }

        if (data) {
            if (this.replaceRegex) {
                data = data.replace(this.replaceRegex, this.replaceString);
            }
            this.apply(target, data, options);
        }

        if (this.attrs) {
            for (var i in this.attrs) {
                target.setAttribute(i, this.attrs[i]);
                if (options && options.forIE && i == 'class') { target.className = this.attrs[i]; }
            }
        }
        return this;
    },

    apply: function(node, data, options) {
        var tail = '' + data;
        var matches = [];

        if (!this.fallback.apply) {
            this.fallback = new this.constructor(this.fallback);
        }

        while (true) {
            var best = false;
            var rule  = false;
            for (var i = 0; i < this.children.length; i++) {
                if (typeof matches[i] == 'undefined') {
                    if (!this.children[i].match) {
                        this.children[i] = new this.constructor(this.children[i]);
                    }
                    matches[i] = this.children[i].match(tail, options);
                }
                if (matches[i] && (!best || best.index > matches[i].index)) {
                    best = matches[i];
                    rule = this.children[i];
                    if (best.index == 0) { break; }
                }
            }
                
            var pos = best ? best.index : tail.length;
            if (pos > 0) {
                this.fallback.apply(node, tail.substring(0, pos), options);
            }
            
            if (!best) { break; }

            if (!rule.build) { rule = new this.constructor(rule); }
            rule.build(node, best, options);

            var chopped = best.index + best[0].length;
            tail = tail.substring(chopped);
            for (var i = 0; i < this.children.length; i++) {
                if (matches[i]) {
                    if (matches[i].index >= chopped) {
                        matches[i].index -= chopped;
                    }
                    else {
                        matches[i] = void 0;
                    }
                }
            }
        }

        return this;
    },

    fallback: {
        apply: function(node, data, options) {
            if (options && options.forIE) {
                // workaround for bad IE
                data = data.replace(/\n/g, ' \r');
            }
            node.appendChild(document.createTextNode(data));
        }
    }    
};

Parse.Simple.Base.Rule.prototype.constructor = Parse.Simple.Base.Rule;

Parse.Simple.Creole = function(options) {
    var rx = {};
    rx.link = '[^\\]|~\\n]*(?:(?:\\](?!\\])|~.)[^\\]|~\\n]*)*';
    rx.linkText = '[^\\]~\\n]*(?:(?:\\](?!\\])|~.)[^\\]~\\n]*)*';
    rx.uriPrefix = '\\b(?:(?:https?|ftp)://|mailto:)';
    rx.uri = rx.uriPrefix + rx.link;
    rx.rawUri = rx.uriPrefix + '\\S*[^\\s!"\',.:;?]';
    rx.interwikiPrefix = '[\\w.]+:';
    rx.interwikiLink = rx.interwikiPrefix + rx.link;
    rx.img = '\\{\\{((?!\\{)[^|}\\n]*(?:}(?!})[^|}\\n]*)*)' +
             (options && options.strict ? '' : '(?:') + 
             '\\|([^}~\\n]*((}(?!})|~.)[^}~\\n]*)*)' +
             (options && options.strict ? '' : ')?') +
             '}}';

    var formatLink = function(link, format) {
        if (format instanceof Function) {
            return format(link);
        }

        format = format instanceof Array ? format : [ format ];
        if (typeof format[1] == 'undefined') { format[1] = ''; }
        return format[0] + link + format[1];
    };

    var g = {
        hr: { tag: 'hr', regex: /(^|\n)\s*----\s*(\n|$)/ },

        br: { tag: 'br', regex: /\\\\/ },
        
        preBlock: { tag: 'pre', capture: 2,
            regex: /(^|\n)\{\{\{\n((.*\n)*?)\}\}\}(\n|$)/,
            replaceRegex: /^ ([ \t]*\}\}\})/gm,
            replaceString: '$1' },
        tt: { tag: 'tt',
            regex: /\{\{\{(.*?\}\}\}+)/, capture: 1,
            replaceRegex: /\}\}\}$/, replaceString: '' },

        ulist: { tag: 'ul', capture: 0,
            regex: /(^|\n)([ \t]*\*[^*#].*(\n|$)([ \t]*[^\s*#].*(\n|$))*([ \t]*[*#]{2}.*(\n|$))*)+/ },
        olist: { tag: 'ol', capture: 0,
            regex: /(^|\n)([ \t]*#[^*#].*(\n|$)([ \t]*[^\s*#].*(\n|$))*([ \t]*[*#]{2}.*(\n|$))*)+/ },
        li: { tag: 'li', capture: 0,
            regex: /[ \t]*([*#]).+(\n[ \t]*[^*#\s].*)*(\n[ \t]*\1[*#].+)*/,
            replaceRegex: /(^|\n)[ \t]*[*#]/g, replaceString: '$1' },

        table: { tag: 'table', capture: 0,
            regex: /(^|\n)(\|.*?[ \t]*(\n|$))+/ },
        tr: { tag: 'tr', capture: 2, regex: /(^|\n)(\|.*?)\|?[ \t]*(\n|$)/ },
        th: { tag: 'th', regex: /\|+=([^|]*)/, capture: 1 },
        td: { tag: 'td', capture: 1,
            regex: '\\|+([^|~\\[{]*((~(.|(?=\\n)|$)|' +
                   '\\[\\[' + rx.link + '(\\|' + rx.linkText + ')?\\]\\]' +
                   (options && options.strict ? '' : '|' + rx.img) +
                   '|[\\[{])[^|~]*)*)' },

        singleLine: { regex: /.+/, capture: 0 },
        paragraph: { tag: 'p', capture: 0,
            regex: /(^|\n)([ \t]*\S.*(\n|$))+/ },
        text: { capture: 0, regex: /(^|\n)([ \t]*[^\s].*(\n|$))+/ },

        strong: { tag: 'strong', capture: 1,
            regex: /\*\*([^*~]*((\*(?!\*)|~(.|(?=\n)|$))[^*~]*)*)(\*\*|\n|$)/ },
        em: { tag: 'em', capture: 1,
            regex: '\\/\\/(((?!' + rx.uriPrefix + ')[^\\/~])*' +
                   '((' + rx.rawUri + '|\\/(?!\\/)|~(.|(?=\\n)|$))' +
                   '((?!' + rx.uriPrefix + ')[^\\/~])*)*)(\\/\\/|\\n|$)' },

        img: { regex: rx.img,
            build: function(node, r, options) {
                var img = document.createElement('img');
                img.src = r[1];
                img.alt = r[2] === undefined
                    ? (options && options.defaultImageText ? options.defaultImageText : '')
                    : r[2].replace(/~(.)/g, '$1');
                node.appendChild(img);
            } },

        namedUri: { regex: '\\[\\[(' + rx.uri + ')\\|(' + rx.linkText + ')\\]\\]',
            build: function(node, r, options) {
                var link = document.createElement('a');
                link.href = r[1];
                if (options && options.isPlainUri) {
                    link.appendChild(document.createTextNode(r[2]));
                }
                else {
                    this.apply(link, r[2], options);
                }
                node.appendChild(link);
            } },

        namedLink: { regex: '\\[\\[(' + rx.link + ')\\|(' + rx.linkText + ')\\]\\]',
            build: function(node, r, options) {
                var link = document.createElement('a');
                
                link.href = options && options.linkFormat
                    ? formatLink(r[1].replace(/~(.)/g, '$1'), options.linkFormat)
                    : r[1].replace(/~(.)/g, '$1');
                this.apply(link, r[2], options);
                
                node.appendChild(link);
            } },

        unnamedUri: { regex: '\\[\\[(' + rx.uri + ')\\]\\]',
            build: 'dummy' },
        unnamedLink: { regex: '\\[\\[(' + rx.link + ')\\]\\]',
            build: 'dummy' },
        unnamedInterwikiLink: { regex: '\\[\\[(' + rx.interwikiLink + ')\\]\\]',
            build: 'dummy' },

        rawUri: { regex: '(' + rx.rawUri + ')',
            build: 'dummy' },

        escapedSequence: { regex: '~(' + rx.rawUri + '|.)', capture: 1,
            tag: 'span', attrs: { 'class': 'escaped' } },
        escapedSymbol: { regex: /~(.)/, capture: 1,
            tag: 'span', attrs: { 'class': 'escaped' } }
    };
    g.unnamedUri.build = g.rawUri.build = function(node, r, options) {
        if (!options) { options = {}; }
        options.isPlainUri = true;
        g.namedUri.build.call(this, node, Array(r[0], r[1], r[1]), options);
    };
    g.unnamedLink.build = function(node, r, options) {
        g.namedLink.build.call(this, node, Array(r[0], r[1], r[1]), options);
    };
    g.namedInterwikiLink = { regex: '\\[\\[(' + rx.interwikiLink + ')\\|(' + rx.linkText + ')\\]\\]',
        build: function(node, r, options) {
                var link = document.createElement('a');
                
                var m, f;
                if (options && options.interwiki) {
                m = r[1].match(/(.*?):(.*)/);
                f = options.interwiki[m[1]];
            }
            
            if (typeof f == 'undefined') {
                if (!g.namedLink.apply) {
                    g.namedLink = new this.constructor(g.namedLink);
                }
                return g.namedLink.build.call(g.namedLink, node, r, options);
            }

            link.href = formatLink(m[2].replace(/~(.)/g, '$1'), f);
            
            this.apply(link, r[2], options);
            
            node.appendChild(link);
        }
    };
    g.unnamedInterwikiLink.build = function(node, r, options) {
        g.namedInterwikiLink.build.call(this, node, Array(r[0], r[1], r[1]), options);
    };
    g.namedUri.children = g.unnamedUri.children = g.rawUri.children =
            g.namedLink.children = g.unnamedLink.children =
            g.namedInterwikiLink.children = g.unnamedInterwikiLink.children =
        [ g.escapedSymbol, g.img ];

    for (var i = 1; i <= 6; i++) {
        g['h' + i] = { tag: 'h' + i, capture: 2,
            regex: '(^|\\n)[ \\t]*={' + i + '}[ \\t]' +
                   '([^~]*?(~(.|(?=\\n)|$))*)[ \\t]*=*\\s*(\\n|$)'
        };
    }

    g.ulist.children = g.olist.children = [ g.li ];
    g.li.children = [ g.ulist, g.olist ];
    g.li.fallback = g.text;

    g.table.children = [ g.tr ];
    g.tr.children = [ g.th, g.td ];
    g.td.children = [ g.singleLine ];
    g.th.children = [ g.singleLine ];

    g.h1.children = g.h2.children = g.h3.children =
            g.h4.children = g.h5.children = g.h6.children =
            g.singleLine.children = g.paragraph.children =
            g.text.children = g.strong.children = g.em.children =
        [ g.escapedSequence, g.strong, g.em, g.br, g.rawUri,
            g.namedUri, g.namedInterwikiLink, g.namedLink,
            g.unnamedUri, g.unnamedInterwikiLink, g.unnamedLink,
            g.tt, g.img ];

    g.root = {
        children: [ g.h1, g.h2, g.h3, g.h4, g.h5, g.h6,
            g.hr, g.ulist, g.olist, g.preBlock, g.table ],
        fallback: { children: [ g.paragraph ] }
    };

    Parse.Simple.Base.call(this, g, options);
};

Parse.Simple.Creole.prototype = new Parse.Simple.Base();

Parse.Simple.Creole.prototype.constructor = Parse.Simple.Creole;

/**
 * @author thatcher
 */
(function(){

    var creole = new Parse.Simple.Creole(),
        holder = document.createElement('div');
    
    jQuery.creole = function(markup){
        creole.parse(holder, markup);
        var value = holder.innerHTML;
        holder.innerHTML = '';
        return value;
    };

})();

/**
 * Records of Existence @VERSION - 
 *
 * Copyright (c) 2008-2009 Records of Existence
 * @author thatcher
 */
var RecordsOfExistence = {
	Models:{},
	Views:{},
	Controllers:{},
	Services:{},
	Data:{}
};
(function($){
 	
    $.scan([
        "RecordsOfExistence.Models",    
        "RecordsOfExistence.Views",     
        "RecordsOfExistence.Services", 
        "RecordsOfExistence.Controllers",
        "Claypool.Services",
        "GAE.Services"
    ]);
    
})(jQuery, RecordsOfExistence);
    

/**
 * @author thatcher
 */
(function($){
    //dummy aws settings if none provided
    //AWS=AWS||{};
    
	//-------------------------------------------------------------------------------------//
	//  -   ENVIRONMENTAL CONFIGURATION   -
	//______________________________________________________________________________________//
	$.env({
        automap:{
            'file:///opt':          	'dev.server',
            'file:///base':         	'prod.server',
            'http://localhost':     	'dev.client',
            'recordsofexistence.com':   'prod.client',
			'4.latest.recordsofexistence.appspot.com':'v4.client',
			'3.latest.recordsofexistence.appspot.com':'v3.client',
			'2.latest.recordsofexistence.appspot.com':'v2.client'
        },
	    defaults:{
            root:'/',
			precompile: true,
			preload: false,
			minify: false,
			templates:'http://localhost:8080/app/templates/',
            initialdata:'http://localhost:8080/data/',
            data:'http://roe-prod.s3.amazonaws.com/',
            host:'sdb.amazonaws.com',
            dataType:'text',
            db:'jQuery.gdb',
            dbconnection:{'default':{
                /*
                endpoint:'https://sdb.amazonaws.com/',
                accessKeyId:AWS.accessKeyId,
                secretKey:AWS.secretKey,
                method:'POST'
                */
                //raw:true //returns raw aws response
            }}
	    },
	    //-------------------------------------------------------------------------------------//
	    //  -   APPENGINE CONFIGURATION   -
	    //______________________________________________________________________________________//
	    prod:{
	        server:{
				precompile: true,
				preload: false,
				minify: true,
            	dbclient:'direct',
                root:'/',
	            templates:'http://www.recordsofexistence.com/app/templates/',
                initialdata:'http://www.recordsofexistence.com/data/',
                data:'http://roe-prod.s3.amazonaws.com/'
	        },
			client:{}
	    },
	    //-------------------------------------------------------------------------------------//
	    //  -   DEVELOPMENT CONFIGURATION   -
	    //______________________________________________________________________________________//
	    dev:{
	        server:{
            	dbclient:'direct'
	        }
	    },
	    //-------------------------------------------------------------------------------------//
	    //  -   TEST CONFIGURATION   -
	    //______________________________________________________________________________________//
	    test:{
	        server:{

	        }
	    }
	}); 
    
})(jQuery);
    

/**
 * @author thatcher
 */

(function($){ 
    
   $.logging([
        { category:"RecordsOfExistence",               level:"INFO" },
        { category:"RecordsOfExistence.Filters",       level:"INFO" },
        { category:"RecordsOfExistence.Models",        level:"INFO" },
        { category:"RecordsOfExistence.Views",         level:"INFO"  },
        { category:"RecordsOfExistence.Controllers",   level:"INFO"  },
        { category:"RecordsOfExistence.Services",      level:"INFO" },
        { category:"Claypool.Router",                  level:"WARN"  },
        { category:"Claypool.MVC",                     level:"WARN"  },
        { category:"Claypool.Server",                  level:"WARN"  },
        { category:"Claypool.Models",                  level:"WARN" },
        { category:"Claypool",                         level:"WARN"  },
        { category:"Claypool.Services",                level:"WARN"  },
        { category:"jQuery.plugins.gdb",               level:"INFO" },
        { category:"jQuery",                           level:"INFO"  },
        { category:"root",                             level:"WARN"  }
    ]);     
	
	//$.tmpl.debug = true;
	
})(jQuery);
/**
 * @author thatcher
 */

(function($){

    $.routes({
        "hijax:server": [{
            id: "#recordsofexistence-rest-routes",
            hijaxMap:
                [{ urls :"/rest/?$",                                             controller:"#restService"},
                 { urls :"/rest/<:domain(\\w+):>(/?)$",                           controller:"#restService"},
                 { urls :"/rest/<:domain(\\w+):>/<:id(\\w+):>(/?)$",              controller:"#restService"}]    
        },{
            id: "#recordsofexistence-admin-routes",
            hijaxMap:
                [
                 { urls :"/admin/|:action|/?$",                                 controller:"#adminService"},
                 { urls :"/admin/|:action|/|:domain|/?$",                       controller:"#adminService"},
                 { urls :"/admin/|:action|/|:domain|/|:id|/?$",                 controller:"#adminService"}] 
        },{
            id: "#recordsofexistence-management-routes",
            hijaxMap:
                [{ urls :"/manage/|:command|(/|:target|)?(/)?$",                controller:"#manageService"}]
        },{
            id:"#recordsofexistence-site-routes",
            hijaxMap:
                [{ urls :"/artists$",    	      controller:"#siteService",    action:"artists"},
                 { urls :"/artist/|:id|/?$",      controller:"#siteService",    action:"artist"},
                 { urls :"/contact$",    	      controller:"#siteService",    action:"contact"},
                 { urls :"/events$",    	      controller:"#siteService",    action:"events"},
                 { urls :"/home$",                controller:"#siteService",    action:"home"},
                 { urls :"/news$",    	          controller:"#siteService",    action:"news"},
                 { urls :"/releases$",    	      controller:"#siteService",    action:"releases"},
                 { urls :"/release/|:id|",        controller:"#siteService",    action:"release"}]
        },{
            id:"#recordsofexistence-proxy-routes",
            hijaxMap:
                [{ urls :"/sdb/$",                controller:"#sdbProxyService"}]
        }],
		"hijax:a":[{
            id:"#recordsofexistence-click-routes",
			filter: ':not([href$=mp3])',
            hijaxMap:
                [{ urls :"<:url(^.*$):>",    	  controller:"#siteController"}]
			
		}],	
		"hijax:form":[{
	        id:"#recordsofexistence-submit-routes",
			filter: ':not([action$=webscr])',//paypal
            hijaxMap:
                [{ urls :"<:url(^.*$):>",    	  controller:"#siteController", 	action:"submit"}]

		}]
	});
    
})(jQuery);

/**
 * @author thatcher
 */
(function($, $M){ 
    
    var log;
    
    $M.Artists = function(options){
        $.extend(true, this, options, $.model('artists', {
            $id:{
                pattern:/roe[0-9]{3}/,
                not:[null],
                msg:'$id must be defined and should be a three digits, eg 001'
            },
            image:{
                pattern:/^[.]{1,256}$/,
                not:[null],
                msg:'image is the url used to display as the artists thumbnail'
            },
            name:{
                pattern:/^.{1,64}$/,
                not:[null],
                msg:'name must be defined, less than 64 characters and can use any characters'
            },
            description:{
                pattern:/.{1,512}/,
                not:[null],
                msg:'description is not required but must be a valid string, upto 512 characters long'
            },
            deleted:{
                pattern:/^[0-9]{1,32}$/,
                msg:'timestamp when record was removed or null for an active record'
            }
        }));
        log = $.logger('RecordsOfExistence.Models.Artists');
    };
    
    $.extend( $M.Artists.prototype, {
        all:function(callback){
            var _this = this;
            this.find({
                async:false,
                //select:'select * from `reo_artists` where `deleted` = "null"',
                select:"new Query('artists')",
                success: function(results){
                    log.debug('loaded all %s artists', results.data.length );
                    callback(results.data);
                },
                error: function(xhr, status, e){
                    log.error('failed to load all artists. (%s)', status).
                        exception(e);
                    callback([_this.template({
                        $id:'roe500',
                        description:'failed to load artists. ('+status+')'
                    })]);
                }
            });
        },
        current:function(callback){
            var _this = this;
            this.find({
                async:false,
                //select:'select * from `reo_artists` where `deleted` = "null"',
                select:"new Query('artists').addFilter('deleted', $EQUAL, '')",
                success:function(results){
                    log.debug('loaded all %s artists', results.data.length );
                    callback(results.data);
                },
                error: function(xhr, status, e){
                    log.error('failed to load all artists. (%s)', status).
                        exception(e);
                    callback([_this.template({
                        $id:'roe500',
                        description:'failed to load artists. ('+status+')'
                    })]);
                }
            });
        },
        forId: function(id, callback){
            var _this = this;
            log.debug('getting artist for id %s', id );
            this.get({
                async: false,
                id:id,
                success: function(results){
                    log.debug('found artist for %s', id );
                    if(results.data.length){
                        callback(results.data[0]);
                    }else{
                        callback(_this.template(id));
                    }
                },
                error:function(xhr, status, e){
                    log.error('failed to find item for id %s', id);
                    callback(_this.template(id));
                }
            });
        },
        template: function(options){
            log.debug('generating template artist');
            return $.extend({
                $id:            'roe404',
                name:           $.title(2, false),
                description:    $.paragraphs(1, false),
                image:          'error/thumb.jpg',
                deleted:        ''
            }, options );
        }
    });
    
})(jQuery, RecordsOfExistence.Models);
 
/**
 * @author thatcher
 */
(function($, $M){ 
    
    var data,// the currently cached data
        log;
    
    $M.Events = function(options){
        $.extend(true, this, options, $.model('events', {
            $id:{
                pattern:/^[0-9]+$/,
                not:[null],
                msg:'id must be defined'
            },
            title:{
                pattern:/^.{1,64}$/,
                not:[null],
                msg:'title must be defined, less than 64 characters.'
            },
            date:{
                pattern:/^.{1,64}$/,
                not:[null],
                msg:'a required human readable description of the date (eg May 5th, 2013)'
            },
            location:{
                pattern:/^.{1,256}$/,
                not:[null],
                msg:'a required human readable description the events location'
            },
            image:{
                pattern:/^.{1,256}$/,
                not:[null],
                msg:'a relative url for an event image'
            },
            description:{
                pattern:/.{1,1024}/,
                not:[null],
                msg:'description is not required but must be a valid string, upto 1024 characters long'
            },
            deleted:{
                pattern:/^[0-9]{1,32}$/,
                msg:'timestamp when record was removed or null for an active record'
            }
        }));
        data = [];
        log = $.logger('RecordsOfExistence.Models.Events');
    };
    
    $.extend( $M.Events.prototype, {
        all:function(callback){
            var _this = this;
            this.find({
                async:false,
                //select:'select * from `events`',
                select:"new Query('events')",
                success:function(results){
                    log.debug('loaded all %s events', results.data.length );
                    callback(results.data.reverse());
                },
                error: function(xhr, status, e){
                    log.error('failed to load all events.', e);
                    callback([_this.template({$id:'roe500'})]);
                }
            });
        },
        current:function(callback){
            var _this = this;
            this.find({
                async:false,
                //select:'select * from `events`',
                select:"new Query('events').addFilter('deleted', $EQUAL, '')",
                success:function(results){
                    log.debug('loaded all %s events', results.data.length );
                    callback(results.data.reverse());
                },
                error: function(xhr, status, e){
                    log.error('failed to load all events.', e);
                    callback([_this.template({$id:'roe500'})]);
                }
            });
        },
        recent:function(count, callback){
            this.current(function(results){
                callback(results.slice(0,
                    results.length > (count-1) ? count : results.length));
            });
        },
        template: function(options){
            return $.extend(true, {
                $id:'roe404',
                title:$.title(3, false),
                date:new Date()+'',
                location:$.words(3, false).join(' '),
                description: $.sentence(),
                image:'error/thumb.jpg',
                deleted:''
            }, options );
        }
    });
    
    
})(jQuery, RecordsOfExistence.Models);
 
/**
 * @author thatcher
 */
(function($, $M){ 
    
    var log;
    
    $M.News = function(options){
        $.extend(true, this, options,$.model('news', {
            $id:{
                pattern:/^roe[0-9]+$/,
                not:[null],
                msg:'id must be defined'
            },
            title:{
                pattern:/^.{1,64}$/,
                not:[null],
                msg:'title must be defined, less than 64 characters.'
            },
            date:{
                pattern:/^.{1,64}$/,
                not:[null],
                msg:'a required human readable description of the date (eg May 5th, 2013)'
            },
            description:{
                pattern:/.{1,1024}/,
                not:[null],
                msg:'description is not required but must be a valid string, upto 1024 characters long'
            },
            deleted:{
                pattern:/^[0-9]{0,32}$/,
                msg:'timestamp when record was removed or null for an active record'
            }
        }));
        log = $.logger('RecordsOfExistence.Models.News');
    };
    
    $.extend( $M.News.prototype, {
        all:function(callback){
            this.find({
                async:false,
                //select:'select * from `news`',
                select:"new Query('news')",
                success:function(results){
                    log.debug('loaded all %s news', results.data.length );
                    callback(results.data.reverse());
                },
                error: function(){
                    log.error('failed to load all news.');
                    callback([{
                        $id:'roe500',
                        title:'Internal Server Error',
                        date: new Date()+"",
                        calendar: new Date()+"",
                        description:'We are unable to display information right now,\
                            the server may be experiencing a lost database connection.\
                            Please check back again in a few moments.'
                    }]);
                }
            });
        },
        current:function(callback){
            this.find({
                async:false,
                //select:'select * from `news`',
                select:"new Query('news').addFilter('deleted', $EQUAL, '')",
                success:function(results){
                    log.debug('loaded all %s news', results.data.length );
                    callback(results.data.reverse());
                },
                error: function(){
                    log.error('failed to load all news.');
                    callback([{
                        $id:'roe500',
                        title:'Internal Server Error',
                        date: new Date()+"",
                        calendar: new Date()+"",
                        description:'We are unable to display information right now,\
                            the server may be experiencing a lost database connection.\
                            Please check back again in a few moments.'
                    }]);
                }
            });
        },
        recent:function(count, success){
            this.current(function(results){
                success(results.slice(0,
                    results.length > (count-1) ? count : results.length));
            });
        },
        template: function(options){
            return $.extend({
                $id: 'roe999',
                title:$.title(3),
                date:new Date()+'',
                calendar:new Date()+'',
                description:$.paragraphs(2, false),
                deleted:''
            }, options);
        }
    });
    
    
})(jQuery, RecordsOfExistence.Models);
 
/**
 * @author thatcher
 */
(function($, $M){ 
    
    var log;
    
    $M.Pressings = function(options){
        $.extend(true, this, options,$.model('pressings', {
            $id:{
                pattern:/^[0-9]+$/,
                not:[null],
                msg:'id must be defined and should be a positive integer'
            },
            ska:{
                pattern:/^.{7}$/,
                msg:'ska is the paypal id generated for the pressing if it for sale.'
            },
            release:{
                pattern:/^[0-9]{3}$/,
                not:[null],
                msg:'should refer to the release id.'
            },
            price:{
                pattern:/^[0-9]+$/,
                not:[null],
                msg:'a non-negative integer specifying the cost of the pressing'
            },
            count:{
                pattern:/^[0-9]{1,5}$/,
                not:[null],
                msg:'a positive integer specifying the total number records for this pressing'
            },
            format:{
                pattern:/^(Compact Disc)$/,
                not:[null],
                msg:'The format of the pressing (currently only "Compact Disc" is supported).'
            },
            description:{
                pattern:/^.+$/,
                not:[null],
                msg:'any valid string, but cannot be empty or null'
            },
            deleted:{
                pattern:/^[0-9]{1,32}$/,
                msg:'timestamp when record was removed or null for an active record'
            }
        }));
        log = $.logger('RecordsOfExistence.Models.Pressings');
    };
    
    $.extend( $M.Pressings.prototype, {

        all:function(callback){
            var _this = this;
            this.find({
                async:false,
                select:"new Query('pressings').addFilter('deleted', $EQUAL, '')",
                success:function(results){
                    log.debug('loaded all %s releases', results.data.length );
                    callback(results.data);
                },
                error: function(){
                    log.error('failed to load all releases.');
                    var releases = [];
                    for(var i=0;i<6;i++){
                        releases[i] = _this.template();
                    }
                    callback(releases);
                }
            });
        },
        
        forRelease:function(id,callback){
            var _this = this;
            this.find({
                async:false,
                select:"new Query('pressings').addFilter('release', $EQUAL, '"+id+"')",
                success:function(results){
                    log.debug('loaded pressings for release %s', id );
                    callback(results.data);
                },
                error: function(e){
                    log.error('failed to load all pressings for release %s.').
                        exception(e);
                    callback([_this.template()]);
                }
            });
        },
        
        currentForRelease:function(id,callback){
            var _this = this;
            this.find({
                async:false,
                select:"new Query('pressings').addFilter('release', $EQUAL, '"+id+"').addFilter('deleted', $EQUAL, '')",
                success:function(results){
                    log.debug('loaded pressings for release %s', id );
                    callback(results.data);
                },
                error: function(e){
                    log.error('failed to load all pressings for release %s.').
                        exception(e);
                    callback([_this.template()]);
                }
            });
        },
        
        changeReleaseId: function(oldID, newID){
            var _this = this;
            this.forRelease(oldID, function(releases){
                if(releases)
                    log.debug('found %s pressing to change release id', releases.length);
                $(releases).each(function(){
                    var pressingId = this.$id;
                    this.release = newID;
                    _this.save({
                        id: this.$id,
                        async: false,
                        data: this,
                        success: function(){
                            log.info('successfully changed release id for pressing %s',pressingId);
                        },
                        error: function(xhr, status, e){
                            log.error('failed to changed release id for pressing %s',pressingId)
                               .exception(e);
                        }
                    })
                });
            });
        },
        
        template: function(options){
            return $.extend({
                $id:'404',
                release:'000',
                price:0,
				ska:'',
                count: 'format',
                format:'Audio CD',
                deleted: '',
                description:$.paragraph(false)
            }, options);
        }
    });
    
})(jQuery, RecordsOfExistence.Models);
 
/**
 * @author thatcher
 */
(function($, $M){ 
    
    var log;
    
    $M.Releases = function(options){
        $.extend(true, this, options, $.model('releases', {
            $id:{
                pattern:/^[0-9]{3}$/,
                not:[null],
                msg:'id must be defined and should be a three numbers'
            },
            image:{
                pattern:/^[a-z0-9_]{1,32}$/,
                not:[null],
                msg:'url should be the data of the data folder, usually the in lowercase and underscores'
            },
            artist:{
                pattern:/^[0-9]{3}$/,
                not:[null],
                msg:'should refer to the artist id.'
            },
            name:{
                pattern:/^.{1,64}$/,
                not:[null],
                msg:'The human readable name of the release.'
            },
            label_id:{
                pattern:/^.{1,64}$/,
                not:[null],
                msg:'The release control number.'
            },
            description:{
                pattern:/^.{1,1024}$/,
                not:[null],
                msg:'describes the release. any valid string, but cannot be empty or null, upto 1024 characters'
            },
            tracks:{
                pattern:/^.{1,64}$/,
                msg:'a list of track names for this release. names can be upto 64 characters long'
            },
            deleted:{
                pattern:/^[0-9]{1,32}$/,
                msg:'timestamp when record was removed or null for an active record'
            },
            featured:{
                msg:'display on front page?'
            }
        }));
        log = $.logger('RecordsOfExistence.Models.Releases');
    };
    
    $.extend( $M.Releases.prototype, {
        all:function(callback){
            var _this = this;
            this.find({
                async:false,
                select:"new Query('releases')",
                success:function(results){
                    log.debug('loaded all %s releases', results.data.length );
                    callback(results.data.reverse());
                },
                error: function(){
                    log.error('failed to load all releases.');
                    var releases = [];
                    for(var i=0;i<6;i++){
                        releases[i] = _this.template();
                    }
                    callback(releases);
                }
            });
        },
        current:function(callback){
            var _this = this;
            this.find({
                async:false,
                select:"new Query('releases').addFilter('deleted', $EQUAL, '')",
                success:function(results){
                    log.debug('loaded all %s releases', results.data.length );
                    callback(results.data.reverse());
                },
                error: function(){
                    log.error('failed to load all releases.');
                    var releases = [];
                    for(var i=0;i<6;i++){
                        releases[i] = _this.template();
                    }
                    callback(releases);
                }
            });
        },
        featured: function(callback){
            var _this = this;
            this.find({
                async:false,
                select:"new Query('releases').addFilter('deleted', $EQUAL, '').addFilter('featured', $EQUAL, 'true')",
                success:function(results){
                    log.debug('loaded all %s releases', results.data.length );
                    callback(results.data);
                },
                error: function(){
                    log.error('failed to load all releases.');
                    var releases = [];
                    for(var i=0;i<2;i++){
                        releases[i] = _this.template();
                    }
                    callback(releases);
                }
            });
        },
        forArtist:function(id, callback){
            this.find({
                async:false,
                //select:"select * from `releases` where `artist` = '"+id+"'",
                select:"new Query('releases').addFilter('artist', $EQUAL, '"+id+"')"+
                    ".addFilter('deleted', $EQUAL, '')",
                success:function(results){
                    log.debug('Found %s releases for artist %s',results.data.length, id);
                    callback(results.data);
                },
                error: function(xhr, status, e){
                    log.error('failed to load all releases for artist %s.', e);
                    callback(_this.template(id));
                }
            });
        },
        forId: function(id, callback){
            var _this = this;
            this.get({
                async: false,
                id:id,
                success: function(results){
                    if(results.data.length){
                        callback(results.data[0]);
                    }else{
                        callback(_this.template(id));
                    }
                },
                error:function(xhr, status, e){
                    log.error('failed to find item for id %s', id);
                    callback(_this.template({
                        $id: id
                    }));
                }
            });
        },
        
        changeArtistId: function(oldID, newID){
            var _this = this;
            this.forArtist(oldID, function(artists){
                if(artists)
                    log.debug('found %s pressing to change release id', artists.length);
                $(artists).each(function(){
                    var releaseId = this.$id;
                    this.artist = newID;
                    _this.save({
                        id: this.$id,
                        async: false,
                        data: this,
                        success: function(){
                            log.info('successfully changed release id for pressing %s',releaseId);
                        },
                        error: function(xhr, status, e){
                            log.error('failed to changed release id for pressing %s',releaseId)
                               .exception(e);
                        }
                    })
                });
            });
        },
        
        template: function(options){
            log.debug('generating template artist for %s', options.$id );
            var count = 7,
                template_tracks = [];
            for (var i=0;i<count;i++){
                template_tracks[i] = (i<10?'0'+i:''+i)+'. '+$.title(3, false);
            }
            return $.extend({
                $id:            options.$id||'roe404',
                name:           $.title(2, false),
                description:    $.paragraph(false),
                artist:         'roe000',
                image:          'error/thumb.jpg',
                tracks:         template_tracks,
                deleted:        '',
                featured:        '',
                label_id:        ''
            }, options);
        }
    });
    
    
})(jQuery, RecordsOfExistence.Models);
 
/**
 * @author thatcher
 */
(function($, $V){
    
    var log,
		templates;
    
    $V.Site = function(options){
        $.extend(true, this, options);
        log = $.logger('RecordsOfExistence.Views.Site');
		templates = {};
    };
    
    
    $.extend($V.Site.prototype, {
        write: function(model){
			var rendered = '';
            log.info("Rendering html template %s ", model.template);
           	$.render({
                async:false,
                url: model.template,
                templateData: model,
                success: function(response){
                    log.debug("Rendered template");
                    rendered = response;
                },
                error: function(xhr, status, e){
                    log.error('failed to render : %s ', model.template).
                        exception(e);
                    throw('Error Rendering template '+ model.template);
                }
            });
	        log.info("Finsihed rendering html template %s ", model.template);
            return rendered;
        },
		update: function(model){
			log.debug('updating view');
			//basic 'partial' rendering
			var tmpl;
           	$.render({
                async:false,
                url: model.template,
                templateData: model,
				partial: true,
				asArray: true,
                success: function(response){
                    log.debug("Rendered template");
                    tmpl = response;
                },
                error: function(xhr, status, e){
                    log.error('failed to render : %s ', model.template).
                        exception(e);
                    throw('Error Rendering template '+ model.template);
                }
            });
	        log.info("Finsihed rendering html template %s ", model.template);
			
			document.title = tmpl.slice(tmpl.blocks.title.start,tmpl.blocks.title.end).
				join('');
			$('#main').empty().append(tmpl.slice(tmpl.blocks.main.start,tmpl.blocks.main.end).
				join(''));
		}
    });
    
    $.tmpl.filters.fn.extend({
        even: function(){
            return this.map(function(index){
                if(index % 2 == 0){
                    return this;
                }
            });
        },
        odd: function(){
            return this.map(function(index){
                if(index % 2 == 1){
                    return this;
                }
            });
        },
        every_third_from: function(from){
            if(!from || from % 3 == 0){
                return this.map(function(index){
                    if(index % 3 == 0){
                        return this;
                    }
                });
            }else if( from % 3 == 1){
                return this.map(function(index){
                    if(index % 3 == 1){
                        return this;
                    }
                });
            }else{
                return this.map(function(index){
                    if(index % 3 == 2){
                        return this;
                    }
                });
            }
        }
    });
    
})(jQuery, RecordsOfExistence.Views);

(function($,$C){
	
	var log,
		hash = '',
		inaction = false,
		cache = RecordsOfExistence.Data||{},
		guid = $.uuid();
	
	$C.Site = function(options){
		$.extend(true, this, options);
		log = $.logger('RecordsOfExistence.Controllers.Site');
	};
	
	$.extend($C.Site.prototype, {
		handle: function(event){
			var _this = this,
				url = event.params('url');
			log.debug('handling event for url %s', url);
			inaction = true;	
			if(url.match('admin')){
				cache = {};
			}else if(cache[url]){
				success(url, cache[url]);
				event.m(cache[url]).render(function(){
					document.location.hash = hash = "#"+url;
				});
				return;
			}
			$.ajax({
				url: url + (url.match('\\?')?"&"+guid:"?"+guid),
				dataType: 'json',
				success: function(data){
					cache[url] = data;
					success(url, data);
					event.m(data).render(function(){
						document.location.hash = hash = "#"+url;
					});
				},
				error: function(xhr, status, e){
					inaction = false;
					log.error('failed to load data for url %s', url).
						exception(e);
				}
			});
		},
		submit: function(event){
			var _this = this,
				url = event.params('url');
			log.debug('handling event for url %s', url)	;	
			inaction = true;
			if(url.match('admin')){
				cache = {};
			}else if(cache[url]){
				success(url, cache[url]);
				event.m(cache[url]).render(function(){
					document.location.hash = hash = "#"+url;
				});
				return;
			}
			$.ajax({
				url: url,
				dataType: 'json',
				type: event.target.method||'GET',
				data: event.params(),
				success: function(data, status, xhr){
					cache[url] = data;
					success(url, data);
					document.location.hash = hash = "#"+url;
				},
				error: function(xhr, status, e){
					inaction = false;
					log.error('failed to load data for url %s', url).
						exception(e);
				}
			});
		},
		go: function(){
			var a = document.location.hash,
				_this = this;
			if(hash !== a  && !inaction){	
				hash = a;
				a = $('<a href="'+a.substring(1)+'" style="display:none">'+a+'</a>');
				$(document.body).append(a);
				setTimeout(function(){
					a.click().remove();
				}, 100 );
			}
		}
	});
	
	var success = function(url, data, status, xhr){
			inaction = false;
			cache[url] = data;
			log.debug('posted form for url %s rendering %s', url);
			url = data.request.requestURI + 
				(data.request.queryString ? 
					"?"+data.request.queryString.replace('&fo=json','') : "");
			log.debug('resulting url %s', url);
	};
	
	
})(jQuery, RecordsOfExistence.Controllers);
/**
 * @author thatcher
 */
(function($,  $S){
    
    var log,
        Artists,
        Releases,
        Pressings,
        News,
        Events;
    
    $S.Site = function(options){
        log = $.logger('RecordsOfExistence.Services.Site');
        $.extend(true, this, options);
        Artists     = $.$('#artistsModel');
        Releases    = $.$('#releasesModel');
        Pressings   = $.$('#pressingsModel');
        News        = $.$('#newsModel');
        Events      = $.$('#eventsModel');
    };
    
    $.extend($S.Site.prototype,{
        
        artists: function(event){
            log.debug('Serving artists page.');
            var query = (event.m('admin'))?'all':'current';
            Artists[query](function(results){
                event.
                    m({
                        artists:   results,
                        template:  $.env('templates') +'html/pages/artists.tmpl'
                    }).
                    render();
            });
        },
        
        artist: function(event){
            var id = event.params('id');
            log.debug('Serving artist %s page.', id);
            
            var artist,
                releases;
            
            Artists.forId(id, function(result){
                artist = result;
                //find the releases for this artist
                Releases.forArtist(id, function(results){
                    releases = results;
                    event.
                        m({
                            id:         id,
                            artist:     artist,
                            releases:   releases,
                            template:   $.env('templates') +'html/pages/artist.tmpl'
                        }).
                        render();
                    
                });
            });
        },
        
        events: function(event){
            log.debug('Serving events page.');
            var query = (event.m('admin'))?'all':'current';
            Events[query](function(results){
                event.
                    m({
                        events:   results,
                        template:  $.env('templates') +'html/pages/events.tmpl'
                    }).
                    render();
            });
        },
        
        contact: function(event){
            event.
                m({template:  $.env('templates') +'html/pages/contact.tmpl'}).
                render();
        },
        
        home: function(event){
            log.debug('Serving home page.');
            
            // The name is a little distracting but events is not related to
            // the controller/service event.  Events is an application specific 
            // model that provides a calendar of 'whats going on when'
            // - Recent Events -
            // only provide the last three events to avoid clutter     
            var events,
                releases,
                news;
            Events.recent(3,function(results){
                events = results;
                
                // - Recent Releases -
                // provides the last two releases to promote interest
                Releases.featured(function(results){
                    recent = results;
                    
                    // - Recent Events -
                    // only provide the last 5 news entriew to avoid clutter 
                    News.recent(5, function(results){
                        news = results;
                        
                        event.
                            m({
                                recent:     recent,
                                news:       news,
                                events:     events,
                                template:   $.env('templates') +'html/pages/home.tmpl'
                            }).
                            render();
                    });
                });
            });
            
        },
        
        releases: function(event){
            log.debug('Serving releases page.');
            var query = (event.m('admin'))?'all':'current';
            Releases[query](function(results){
                event.
                    m({
                        releases:   results,
                        template:   $.env('templates') +'html/pages/releases.tmpl'
                    }).
                    render();
            });
        },
        
        release: function(event){
            var id = event.params('id');
            //find the releases based on the id passed
                
            Releases.forId(id, function(release){
                
                //find the artist for this release
                Artists.forId(release.artist,  function(artist){
                    
                    var query = (event.m('admin'))?'forRelease':'currentForRelease';
                    //finally find the pressings for this release
                    Pressings[query](id, function(pressings){
                        event.
                            m({
                                id:         id,
                                artist:     artist,
                                release:    release,
                                pressings:  pressings,
                                template:   $.env('templates') + 'html/pages/release.tmpl'
                            }).
                            render();
                    });
                    
                });
            });
        },
        
        news: function(event){
            log.debug('Serving news page.');
            var query = (event.m('admin'))?'all':'current';
            News[query](function(results){
                event.
                    m({
                        news:   results,
                        template:  $.env('templates') +'html/pages/news.tmpl'
                    }).
                    render();
            });
        }
        
    });
    
})(jQuery, RecordsOfExistence.Services );

/**
 * @author thatcher
 */
//  -   BOOT THE APP  -
jQuery.noConflict();
(function($){
    
    //A static logger for any initialization routines we might add here
    var log = $.logger("RecordsOfExistence"),
		hash = '';
    
    //The environments are described in environments.js
    try{
		//use automap based on window.location
       	$.env();
       
 	}catch(e){
 	   log.error("Environmental selection is invalid!").exception(e);
 	}
    
    $(document).ready(function(){
        log.info("Initializing Application");
        $.boot(function(){
          //you can do additional initialization here
            log.info("Successfully Initialized Application");
			setInterval($.$('#siteController').go, 200);
        });
    });    
    
})(jQuery);  

/**
 * @author thatcher
 */
(function($){

    $(document).ready(function(){
        $('#hide_deleted').bind('click', function(){
            $('.deleted').hide();
        });
        $('#show_deleted').bind('click', function(){
            $('.deleted').show();
        });
    });


})(jQuery);
jQuery.templates[jQuery.env("templates")+"html/analytics.tmpl"]=
function anonymous(jQuery, $data, $i) {
    var $ = jQuery, T = [], asArray = arguments.length > 3 ? arguments[3] : false, partial = arguments.length > 4 ? arguments[4] : false, _ = $.tmpl.filters;
    _.data = T.data = $data;
    _.$i = T.index = $i || 0;
    T._ = null;
    function pushT(value, _this, encode) {
        return encode === false ? T.push(typeof value === "function" ? value.call(_this) : value) : T.push($.encode(typeof (value) === "function" ? value.call(_this) : value));
    }
    with ($.extend(true, {}, _, $data)) {
        try {
            T.push("<script src=\"http://www.google-analytics.com/urchin.js\" type=\"text/javascript\"></script>\n\n<script type=\"text/javascript\">\n    _uacct = \"UA-3433323-1\";\n    urchinTracker();\n</script>");
        }
        catch (e) {
            if ($.tmpl.debug) {
                T.push(" " + e + " ");
            } else {
                T.push("");
            }
        }
    }
    _.data = null;
    return asArray ? T : T.join("");
}

jQuery.templates[jQuery.env("templates")+"html/base.tmpl"]=
function anonymous(jQuery, $data, $i) {
    var $ = jQuery, T = [], asArray = arguments.length > 3 ? arguments[3] : false, partial = arguments.length > 4 ? arguments[4] : false, _ = $.tmpl.filters;
    _.data = T.data = $data;
    _.$i = T.index = $i || 0;
    T._ = null;
    function pushT(value, _this, encode) {
        return encode === false ? T.push(typeof value === "function" ? value.call(_this) : value) : T.push($.encode(typeof (value) === "function" ? value.call(_this) : value));
    }
    with ($.extend(true, {}, _, $data)) {
        try {
            T.push("<html xml:lang=\"eng\"  dir=\"ltr\" xml:space=\"default\">\n\n    <head \tprofile=\"http://a9.com/-/spec/opensearch/1.1/\">\n\t\t\n\t\t\t<title>\n\t\t\t\t");
            (function () {
                var name = "title", tmp, diff1, diff2;
                if (!T.blocks) {
                    T.blocks = $.tmpl.blocks;
                }
                if (!T.blocks[name]) {
                    T.blocks[name] = {start:T.length};
                }
                var B = (function () {
                    var T = [];
                    function pushT(value, _this, encode) {
                        return encode === false ? T.push(typeof value === "function" ? value.call(_this) : value) : T.push($.encode(typeof (value) === "function" ? value.call(_this) : value));
                    }
                    T.push("\n\t\t\t\tRecords of Existence\n\t\t\t\t");
                    return T;
                })();
                diff1 = T.blocks[name].end ? T.blocks[name].end - T.blocks[name].start : 0;
                Array.prototype.splice.apply(T, [T.blocks[name].start + 1, diff1].concat(B));
                T.blocks[name].end = T.blocks[name].start + B.length;
                diff2 = T.blocks[name].end - T.blocks[name].start;
                for (tmp in T.blocks) {
                    if (T.blocks[tmp].start > T.blocks[name].start) {
                        T.blocks[tmp].start += diff2 - diff1;
                        T.blocks[tmp].end += diff2 - diff1;
                    }
                }
            })();
            T.push("\n\t\t\t</title>\n\t\t\n        \n\t\t");
            T.include = true;
            T._ = $.env("templates") + "html/meta.tmpl";
            if (T._.match("#") && (!partial || T.include)) {
                if (!(T._ in $.templates)) {
                    $.templates[T._] = $.tmpl($(T._).text());
                }
            } else {
                if (!(T._ in $.templates) && (!partial || T.include)) {
                    $.ajax({url:T._, type:"GET", dataType:"text", async:false, success:function (text) {
                        $.templates[T._] = $.tmpl(text);
                    }, error:function (xhr, status, e) {
                        $.templates[T._] = $.tmpl(xhr.responseText);
                    }});
                }
            }
            if (!partial || T.include) {
                Array.prototype.push.apply(T, $.templates[T._].call(this, jQuery, $.extend({}, $data, this), 0, true, false));
            }
            T._ = null;
            T.push("\n        ");
            (function () {
                var name = "meta_extra", tmp, diff1, diff2;
                if (!T.blocks) {
                    T.blocks = $.tmpl.blocks;
                }
                if (!T.blocks[name]) {
                    T.blocks[name] = {start:T.length};
                }
                var B = (function () {
                    var T = [];
                    function pushT(value, _this, encode) {
                        return encode === false ? T.push(typeof value === "function" ? value.call(_this) : value) : T.push($.encode(typeof (value) === "function" ? value.call(_this) : value));
                    }
                    T.push("\n\t\t\t<!-- extension point for additional metadata  -->\n        ");
                    return T;
                })();
                diff1 = T.blocks[name].end ? T.blocks[name].end - T.blocks[name].start : 0;
                Array.prototype.splice.apply(T, [T.blocks[name].start + 1, diff1].concat(B));
                T.blocks[name].end = T.blocks[name].start + B.length;
                diff2 = T.blocks[name].end - T.blocks[name].start;
                for (tmp in T.blocks) {
                    if (T.blocks[tmp].start > T.blocks[name].start) {
                        T.blocks[tmp].start += diff2 - diff1;
                        T.blocks[tmp].end += diff2 - diff1;
                    }
                }
            })();
            T.push("\n        \n\t\t");
            T.include = true;
            T._ = $.env("templates") + "html/stylesheets.tmpl";
            if (T._.match("#") && (!partial || T.include)) {
                if (!(T._ in $.templates)) {
                    $.templates[T._] = $.tmpl($(T._).text());
                }
            } else {
                if (!(T._ in $.templates) && (!partial || T.include)) {
                    $.ajax({url:T._, type:"GET", dataType:"text", async:false, success:function (text) {
                        $.templates[T._] = $.tmpl(text);
                    }, error:function (xhr, status, e) {
                        $.templates[T._] = $.tmpl(xhr.responseText);
                    }});
                }
            }
            if (!partial || T.include) {
                Array.prototype.push.apply(T, $.templates[T._].call(this, jQuery, $.extend({}, $data, this), 0, true, false));
            }
            T._ = null;
            T.push("\n        ");
            (function () {
                var name = "stylesheet_extra", tmp, diff1, diff2;
                if (!T.blocks) {
                    T.blocks = $.tmpl.blocks;
                }
                if (!T.blocks[name]) {
                    T.blocks[name] = {start:T.length};
                }
                var B = (function () {
                    var T = [];
                    function pushT(value, _this, encode) {
                        return encode === false ? T.push(typeof value === "function" ? value.call(_this) : value) : T.push($.encode(typeof (value) === "function" ? value.call(_this) : value));
                    }
                    T.push("\n\t\t\t<!-- extension point for additional stylesheets -->\n        ");
                    return T;
                })();
                diff1 = T.blocks[name].end ? T.blocks[name].end - T.blocks[name].start : 0;
                Array.prototype.splice.apply(T, [T.blocks[name].start + 1, diff1].concat(B));
                T.blocks[name].end = T.blocks[name].start + B.length;
                diff2 = T.blocks[name].end - T.blocks[name].start;
                for (tmp in T.blocks) {
                    if (T.blocks[tmp].start > T.blocks[name].start) {
                        T.blocks[tmp].start += diff2 - diff1;
                        T.blocks[tmp].end += diff2 - diff1;
                    }
                }
            })();
            T.push("\n        \n\t\t");
            T.include = true;
            T._ = $.env("templates") + "html/links.tmpl";
            if (T._.match("#") && (!partial || T.include)) {
                if (!(T._ in $.templates)) {
                    $.templates[T._] = $.tmpl($(T._).text());
                }
            } else {
                if (!(T._ in $.templates) && (!partial || T.include)) {
                    $.ajax({url:T._, type:"GET", dataType:"text", async:false, success:function (text) {
                        $.templates[T._] = $.tmpl(text);
                    }, error:function (xhr, status, e) {
                        $.templates[T._] = $.tmpl(xhr.responseText);
                    }});
                }
            }
            if (!partial || T.include) {
                Array.prototype.push.apply(T, $.templates[T._].call(this, jQuery, $.extend({}, $data, this), 0, true, false));
            }
            T._ = null;
            T.push("\n        ");
            (function () {
                var name = "link_extra", tmp, diff1, diff2;
                if (!T.blocks) {
                    T.blocks = $.tmpl.blocks;
                }
                if (!T.blocks[name]) {
                    T.blocks[name] = {start:T.length};
                }
                var B = (function () {
                    var T = [];
                    function pushT(value, _this, encode) {
                        return encode === false ? T.push(typeof value === "function" ? value.call(_this) : value) : T.push($.encode(typeof (value) === "function" ? value.call(_this) : value));
                    }
                    T.push("\n\t\t\t<!-- extension point for additional links  -->\n        ");
                    return T;
                })();
                diff1 = T.blocks[name].end ? T.blocks[name].end - T.blocks[name].start : 0;
                Array.prototype.splice.apply(T, [T.blocks[name].start + 1, diff1].concat(B));
                T.blocks[name].end = T.blocks[name].start + B.length;
                diff2 = T.blocks[name].end - T.blocks[name].start;
                for (tmp in T.blocks) {
                    if (T.blocks[tmp].start > T.blocks[name].start) {
                        T.blocks[tmp].start += diff2 - diff1;
                        T.blocks[tmp].end += diff2 - diff1;
                    }
                }
            })();
            T.push("\n        \n\t\t");
            T.include = true;
            T._ = $.env("templates") + "html/scripts.tmpl";
            if (T._.match("#") && (!partial || T.include)) {
                if (!(T._ in $.templates)) {
                    $.templates[T._] = $.tmpl($(T._).text());
                }
            } else {
                if (!(T._ in $.templates) && (!partial || T.include)) {
                    $.ajax({url:T._, type:"GET", dataType:"text", async:false, success:function (text) {
                        $.templates[T._] = $.tmpl(text);
                    }, error:function (xhr, status, e) {
                        $.templates[T._] = $.tmpl(xhr.responseText);
                    }});
                }
            }
            if (!partial || T.include) {
                Array.prototype.push.apply(T, $.templates[T._].call(this, jQuery, $.extend({}, $data, this), 0, true, false));
            }
            T._ = null;
            T.push("\n\t\t");
            (function () {
                var name = "script_extra", tmp, diff1, diff2;
                if (!T.blocks) {
                    T.blocks = $.tmpl.blocks;
                }
                if (!T.blocks[name]) {
                    T.blocks[name] = {start:T.length};
                }
                var B = (function () {
                    var T = [];
                    function pushT(value, _this, encode) {
                        return encode === false ? T.push(typeof value === "function" ? value.call(_this) : value) : T.push($.encode(typeof (value) === "function" ? value.call(_this) : value));
                    }
                    T.push("\n\t\t\t<!-- extension point for additional stylesheets  -->\n\t\t");
                    return T;
                })();
                diff1 = T.blocks[name].end ? T.blocks[name].end - T.blocks[name].start : 0;
                Array.prototype.splice.apply(T, [T.blocks[name].start + 1, diff1].concat(B));
                T.blocks[name].end = T.blocks[name].start + B.length;
                diff2 = T.blocks[name].end - T.blocks[name].start;
                for (tmp in T.blocks) {
                    if (T.blocks[tmp].start > T.blocks[name].start) {
                        T.blocks[tmp].start += diff2 - diff1;
                        T.blocks[tmp].end += diff2 - diff1;
                    }
                }
            })();
            T.push("\n\t\t\n\t\t\n\t\t<meta name=\"viewport\" content=\"width=device-width; initial-scale=1.0; maximum-scale=1.0; user-scalable=0;\" />\n\t\t<!--link rel=\"apple-touch-icon\"  href=\"TODO\" /-->\n\t\t\n    </head>\n    <body>\n\t\t<!--Header-->\n\t\t<div id='header' class=\"container\">\n        ");
            T.include = true;
            T._ = $.env("templates") + "html/header.tmpl";
            if (T._.match("#") && (!partial || T.include)) {
                if (!(T._ in $.templates)) {
                    $.templates[T._] = $.tmpl($(T._).text());
                }
            } else {
                if (!(T._ in $.templates) && (!partial || T.include)) {
                    $.ajax({url:T._, type:"GET", dataType:"text", async:false, success:function (text) {
                        $.templates[T._] = $.tmpl(text);
                    }, error:function (xhr, status, e) {
                        $.templates[T._] = $.tmpl(xhr.responseText);
                    }});
                }
            }
            if (!partial || T.include) {
                Array.prototype.push.apply(T, $.templates[T._].call(this, jQuery, $.extend({}, $data, this), 0, true, false));
            }
            T._ = null;
            T.push("\n\t\t</div>\n\t\t\n\t\t<!--Main Content-->\n        <div id='main' class=\"container\">\n\t\t\t");
            (function () {
                var name = "main", tmp, diff1, diff2;
                if (!T.blocks) {
                    T.blocks = $.tmpl.blocks;
                }
                if (!T.blocks[name]) {
                    T.blocks[name] = {start:T.length};
                }
                var B = (function () {
                    var T = [];
                    function pushT(value, _this, encode) {
                        return encode === false ? T.push(typeof value === "function" ? value.call(_this) : value) : T.push($.encode(typeof (value) === "function" ? value.call(_this) : value));
                    }
                    T.push("\n\t\t\t\t<!-- main layout extension point-->\n\t\t\t");
                    return T;
                })();
                diff1 = T.blocks[name].end ? T.blocks[name].end - T.blocks[name].start : 0;
                Array.prototype.splice.apply(T, [T.blocks[name].start + 1, diff1].concat(B));
                T.blocks[name].end = T.blocks[name].start + B.length;
                diff2 = T.blocks[name].end - T.blocks[name].start;
                for (tmp in T.blocks) {
                    if (T.blocks[tmp].start > T.blocks[name].start) {
                        T.blocks[tmp].start += diff2 - diff1;
                        T.blocks[tmp].end += diff2 - diff1;
                    }
                }
            })();
            T.push("\n\t\t</div>\n\t\t\t\n\t\t\t\n\t\t<!--Footer-->\n\t\t<div \tid=\"footer\" \n\t\t\t\tclass=\"container\">\n\t\t\t<div class=\"column span-23 last\">\n                ");
            T.include = true;
            T._ = $.env("templates") + "html/footer.tmpl";
            if (T._.match("#") && (!partial || T.include)) {
                if (!(T._ in $.templates)) {
                    $.templates[T._] = $.tmpl($(T._).text());
                }
            } else {
                if (!(T._ in $.templates) && (!partial || T.include)) {
                    $.ajax({url:T._, type:"GET", dataType:"text", async:false, success:function (text) {
                        $.templates[T._] = $.tmpl(text);
                    }, error:function (xhr, status, e) {
                        $.templates[T._] = $.tmpl(xhr.responseText);
                    }});
                }
            }
            if (!partial || T.include) {
                Array.prototype.push.apply(T, $.templates[T._].call(this, jQuery, $.extend({}, $data, this), 0, true, false));
            }
            T._ = null;
            T.push("\n\t\t\t\t");
            (function () {
                var name = "global-footer_extra", tmp, diff1, diff2;
                if (!T.blocks) {
                    T.blocks = $.tmpl.blocks;
                }
                if (!T.blocks[name]) {
                    T.blocks[name] = {start:T.length};
                }
                var B = (function () {
                    var T = [];
                    function pushT(value, _this, encode) {
                        return encode === false ? T.push(typeof value === "function" ? value.call(_this) : value) : T.push($.encode(typeof (value) === "function" ? value.call(_this) : value));
                    }
                    T.push("\n\t\t\t\t\t<!-- extension point for additional elements -->\n\t\t\t\t");
                    return T;
                })();
                diff1 = T.blocks[name].end ? T.blocks[name].end - T.blocks[name].start : 0;
                Array.prototype.splice.apply(T, [T.blocks[name].start + 1, diff1].concat(B));
                T.blocks[name].end = T.blocks[name].start + B.length;
                diff2 = T.blocks[name].end - T.blocks[name].start;
                for (tmp in T.blocks) {
                    if (T.blocks[tmp].start > T.blocks[name].start) {
                        T.blocks[tmp].start += diff2 - diff1;
                        T.blocks[tmp].end += diff2 - diff1;
                    }
                }
            })();
            T.push("\n\t\t\t</div>\n\t\t</div>\n\t\t\n\t\t<!--Analytics\n        ");
            T.include = true;
            T._ = $.env("templates") + "html/analytics.tmpl";
            if (T._.match("#") && (!partial || T.include)) {
                if (!(T._ in $.templates)) {
                    $.templates[T._] = $.tmpl($(T._).text());
                }
            } else {
                if (!(T._ in $.templates) && (!partial || T.include)) {
                    $.ajax({url:T._, type:"GET", dataType:"text", async:false, success:function (text) {
                        $.templates[T._] = $.tmpl(text);
                    }, error:function (xhr, status, e) {
                        $.templates[T._] = $.tmpl(xhr.responseText);
                    }});
                }
            }
            if (!partial || T.include) {
                Array.prototype.push.apply(T, $.templates[T._].call(this, jQuery, $.extend({}, $data, this), 0, true, false));
            }
            T._ = null;
            T.push("\n\t\t-->\n    </body>\n</html>\n\n");
        }
        catch (e) {
            if ($.tmpl.debug) {
                T.push(" " + e + " ");
            } else {
                T.push("");
            }
        }
    }
    _.data = null;
    return asArray ? T : T.join("");
}

jQuery.templates[jQuery.env("templates")+"html/footer.tmpl"]=
function anonymous(jQuery, $data, $i) {
    var $ = jQuery, T = [], asArray = arguments.length > 3 ? arguments[3] : false, partial = arguments.length > 4 ? arguments[4] : false, _ = $.tmpl.filters;
    _.data = T.data = $data;
    _.$i = T.index = $i || 0;
    T._ = null;
    function pushT(value, _this, encode) {
        return encode === false ? T.push(typeof value === "function" ? value.call(_this) : value) : T.push($.encode(typeof (value) === "function" ? value.call(_this) : value));
    }
    with ($.extend(true, {}, _, $data)) {
        try {
            T.push("<div style='text-align:center;'>\n\t<em class='small'>\n\t&copy; 2009-2010 recordsofexistence\n\t</em>\n</div>\n<div id='copyright' style='text-align:center;'>\n    <img id=\"claypool-logo\" \n         src='");
            pushT($.env("root") + "images/claypool-button.png", this);
            T.push("' \n         alt=\"jquery-claypool\" \n         title=\"This site uses jquery-claypool\" \n         width=\"80\" \n         height=\"15\"\n         style='float:left;'/>\n    <img id=\"blueprint-logo\" \n\t\t src='");
            pushT($.env("root") + "images/button.png", this);
            T.push("' \n         alt=\"blueprint\" \n\t     title=\"This site uses blueprint-css\" \n\t\t width=\"80\" \n\t\t height=\"15\"\n         style='float:right;'/> \n</div>\n\n");
        }
        catch (e) {
            if ($.tmpl.debug) {
                T.push(" " + e + " ");
            } else {
                T.push("");
            }
        }
    }
    _.data = null;
    return asArray ? T : T.join("");
}

jQuery.templates[jQuery.env("templates")+"html/header.tmpl"]=
function anonymous(jQuery, $data, $i) {
    var $ = jQuery, T = [], asArray = arguments.length > 3 ? arguments[3] : false, partial = arguments.length > 4 ? arguments[4] : false, _ = $.tmpl.filters;
    _.data = T.data = $data;
    _.$i = T.index = $i || 0;
    T._ = null;
    function pushT(value, _this, encode) {
        return encode === false ? T.push(typeof value === "function" ? value.call(_this) : value) : T.push($.encode(typeof (value) === "function" ? value.call(_this) : value));
    }
    with ($.extend(true, {}, _, $data)) {
        try {
            T.push("<div class=\"column span-7 first\">\n    <a href='");
            pushT($.env("root") + "home", this);
            T.push("'>\n\t    <img \tsrc='");
            pushT($.env("root") + "images/logo.png", this);
            T.push("' \n\t\t\t    alt=\"Records of Existence \" \n                height='80px'/>\n    </a> \n</div> \n<div class=\"column span-15 prepend-top last\" id='global-nav' >\n\t<ul >\n        <li><a href='");
            pushT($.env("root") + "home", this);
            T.push("'>home</a></li> |\n        <li><a href='");
            pushT($.env("root") + "releases", this);
            T.push("'>releases</a></li> | \n        <li><a href='");
            pushT($.env("root") + "artists", this);
            T.push("'>artists</a></li> | \n        <li><a href='");
            pushT($.env("root") + "contact", this);
            T.push("'>contact</a></li>  \n        <!--li>\n        <span id=\"sharethisbutton\">\n            <script type=\"text/javascript\" src=\"http://w.sharethis.com/widget/?tabs=web%2Cpost%2Cemail&amp;charset=utf-8&amp;style=default&amp;publisher=b0f530fc-b206-4fb8-b8a8-478191e675c2&amp;headerbg=%23c20000&amp;linkfg=%23c20000\">\n                    \n            </script>\n        </span>\n        </li-->\n    </ul>\n</div>\n\t");
        }
        catch (e) {
            if ($.tmpl.debug) {
                T.push(" " + e + " ");
            } else {
                T.push("");
            }
        }
    }
    _.data = null;
    return asArray ? T : T.join("");
}

jQuery.templates[jQuery.env("templates")+"html/links.tmpl"]=
function anonymous(jQuery, $data, $i) {
    var $ = jQuery, T = [], asArray = arguments.length > 3 ? arguments[3] : false, partial = arguments.length > 4 ? arguments[4] : false, _ = $.tmpl.filters;
    _.data = T.data = $data;
    _.$i = T.index = $i || 0;
    T._ = null;
    function pushT(value, _this, encode) {
        return encode === false ? T.push(typeof value === "function" ? value.call(_this) : value) : T.push($.encode(typeof (value) === "function" ? value.call(_this) : value));
    }
    with ($.extend(true, {}, _, $data)) {
        try {
            T.push("<!--link \ttitle=\"jquery-claypool\" \n\t\thref=\"describe\" \n\t\ttype=\"application/opensearchdescription+xml\" \n\t\trel=\"search\"/-->\n\t\t\n<link \trel=\"shortcut icon\" \n\t\thref='");
            pushT($.env("root"), this);
            T.push("images/favicon.ico' />\n\t\t");
        }
        catch (e) {
            if ($.tmpl.debug) {
                T.push(" " + e + " ");
            } else {
                T.push("");
            }
        }
    }
    _.data = null;
    return asArray ? T : T.join("");
}

jQuery.templates[jQuery.env("templates")+"html/meta.tmpl"]=
function anonymous(jQuery, $data, $i) {
    var $ = jQuery, T = [], asArray = arguments.length > 3 ? arguments[3] : false, partial = arguments.length > 4 ? arguments[4] : false, _ = $.tmpl.filters;
    _.data = T.data = $data;
    _.$i = T.index = $i || 0;
    T._ = null;
    function pushT(value, _this, encode) {
        return encode === false ? T.push(typeof value === "function" ? value.call(_this) : value) : T.push($.encode(typeof (value) === "function" ? value.call(_this) : value));
    }
    with ($.extend(true, {}, _, $data)) {
        try {
            T.push("<meta \tcontent=\"en-us\" \n\t\thttp-equiv=\"Content-Language\"/>\n<meta \tcontent=\"text/html; charset=utf-8\" \n\t\thttp-equiv=\"Content-Type\"/>\n<meta \tname=\"keywords\"\n\t\tcontent=\"records of existence, records, records label, albums,\n\t\t         releases, ep, lp, cd, hand printed, limited edition,\n\t\t\t\t vox populi, music, artists, musicians, thenurbs, nagato,\n\t\t\t\t hovel, shepherstown\"/>\n<meta \tname=\"description\"\n\t\tcontent=\"Records of Existence is an artist run label of \n                 underground independent artists.  We specialize \n                 in doing limited edition Hand-Printed and \n                 Hand-Assembled releases to make the release \n                 as unique as the artists.\" />\n<meta   name=\"google-site-verification\" \n        content=\"TXTKjI0eSKAeIALYTE0lW3j5zTzeEN2wgBJmR9RR3hw\" />");
        }
        catch (e) {
            if ($.tmpl.debug) {
                T.push(" " + e + " ");
            } else {
                T.push("");
            }
        }
    }
    _.data = null;
    return asArray ? T : T.join("");
}

jQuery.templates[jQuery.env("templates")+"html/scripts.tmpl"]=
function anonymous(jQuery, $data, $i) {
    var $ = jQuery, T = [], asArray = arguments.length > 3 ? arguments[3] : false, partial = arguments.length > 4 ? arguments[4] : false, _ = $.tmpl.filters;
    _.data = T.data = $data;
    _.$i = T.index = $i || 0;
    T._ = null;
    function pushT(value, _this, encode) {
        return encode === false ? T.push(typeof value === "function" ? value.call(_this) : value) : T.push($.encode(typeof (value) === "function" ? value.call(_this) : value));
    }
    with ($.extend(true, {}, _, $data)) {
        try {
            T.push("\n<!-- \n/**\n *  The common libraries and plugins\n *  may be useful to the client as well\n *  so we simply include them from the \n *  public server path\n */ -->\n\t\n");
            if ($.env("minify")) {
                T.push(" \n<script src='");
                pushT($.env("root") + "dist/app.min.js", this);
                T.push("'     \ttype=\"text/javascript\" ></script>\n");
            } else {
                T.push("\n<script src='");
                pushT($.env("root") + "lib/firebug/firebug.js", this);
                T.push("'   type=\"text/javascript\" ></script>\n<script src='");
                pushT($.env("root") + "lib/jquery.js", this);
                T.push("'        \ttype=\"text/javascript\" ></script>\n<script src='");
                pushT($.env("root") + "lib/jquery.claypool.js", this);
                T.push("'   type=\"text/javascript\" ></script>\n<script src='");
                pushT($.env("root") + "lib/jquery.livequery.js", this);
                T.push("'  type=\"text/javascript\" ></script>\n\n<script src='");
                pushT($.env("root") + "plugins/jquery.json.js", this);
                T.push("'   type=\"text/javascript\" ></script>\n<script src='");
                pushT($.env("root") + "plugins/jquery.tmpl.js", this);
                T.push("'   type=\"text/javascript\" ></script>\n<script src='");
                pushT($.env("root") + "plugins/tmpl.blocks.js", this);
                T.push("'   type=\"text/javascript\" ></script>\n<script src='");
                pushT($.env("root") + "plugins/tmpl.extend.js", this);
                T.push("'   type=\"text/javascript\" ></script>\n<script src='");
                pushT($.env("root") + "plugins/tmpl.filters.js", this);
                T.push("'  type=\"text/javascript\" ></script>\n<script src='");
                pushT($.env("root") + "plugins/tmpl.switch.js", this);
                T.push("'   type=\"text/javascript\" ></script>\n<script src='");
                pushT($.env("root") + "plugins/creole.js", this);
                T.push("'   \t\ttype=\"text/javascript\" ></script>\n\n<script src='");
                pushT($.env("root") + "app/configs/config.js", this);
                T.push("'     \ttype=\"text/javascript\" ></script>\n<script src='");
                pushT($.env("root") + "app/configs/environments.js", this);
                T.push("'  type=\"text/javascript\" ></script>\n<script src='");
                pushT($.env("root") + "app/configs/logging.js", this);
                T.push("'     \ttype=\"text/javascript\" ></script>\n<script src='");
                pushT($.env("root") + "app/configs/routes.js", this);
                T.push("'     \ttype=\"text/javascript\" ></script>\n\n<script src='");
                pushT($.env("root") + "app/models/artists.js", this);
                T.push("'     \ttype=\"text/javascript\" ></script>\n<script src='");
                pushT($.env("root") + "app/models/events.js", this);
                T.push("'     \ttype=\"text/javascript\" ></script>\n<script src='");
                pushT($.env("root") + "app/models/news.js", this);
                T.push("'     \t\ttype=\"text/javascript\" ></script>\n<script src='");
                pushT($.env("root") + "app/models/pressings.js", this);
                T.push("'     \ttype=\"text/javascript\" ></script>\n<script src='");
                pushT($.env("root") + "app/models/releases.js", this);
                T.push("'     \ttype=\"text/javascript\" ></script>\n<script src='");
                pushT($.env("root") + "app/views/site.js", this);
                T.push("'     \t\ttype=\"text/javascript\" ></script>\n<script src='");
                pushT($.env("root") + "app/controllers/site.js", this);
                T.push("'     \ttype=\"text/javascript\" ></script>\n<script src='");
                pushT($.env("root") + "app/services/site.js", this);
                T.push("'     \ttype=\"text/javascript\" ></script>\n\n<script src='");
                pushT($.env("root") + "app/boot/client.js", this);
                T.push("'     \ttype=\"text/javascript\" ></script>\n\n<script src='");
                pushT($.env("root") + "scripts/admin.js", this);
                T.push("'     \ttype=\"text/javascript\" ></script>\n\n");
                if ($.env("preload")) {
                    T.push("\n<script src='");
                    pushT($.env("root") + "dist/data.js", this);
                    T.push("'     \ttype=\"text/javascript\" ></script>\n");
                }
                T.push("\n\n");
                if ($.env("precompile")) {
                    T.push("\n");
                    T.include = true;
                    T._ = $.env("templates") + "html/templates.tmpl";
                    if (T._.match("#") && (!partial || T.include)) {
                        if (!(T._ in $.templates)) {
                            $.templates[T._] = $.tmpl($(T._).text());
                        }
                    } else {
                        if (!(T._ in $.templates) && (!partial || T.include)) {
                            $.ajax({url:T._, type:"GET", dataType:"text", async:false, success:function (text) {
                                $.templates[T._] = $.tmpl(text);
                            }, error:function (xhr, status, e) {
                                $.templates[T._] = $.tmpl(xhr.responseText);
                            }});
                        }
                    }
                    if (!partial || T.include) {
                        Array.prototype.push.apply(T, $.templates[T._].call(this, jQuery, $.extend({}, $data, this), 0, true, false));
                    }
                    T._ = null;
                    T.push("\n");
                }
                T.push("\n\n");
            }
            T.push("\n");
        }
        catch (e) {
            if ($.tmpl.debug) {
                T.push(" " + e + " ");
            } else {
                T.push("");
            }
        }
    }
    _.data = null;
    return asArray ? T : T.join("");
}

jQuery.templates[jQuery.env("templates")+"html/stylesheets.tmpl"]=
function anonymous(jQuery, $data, $i) {
    var $ = jQuery, T = [], asArray = arguments.length > 3 ? arguments[3] : false, partial = arguments.length > 4 ? arguments[4] : false, _ = $.tmpl.filters;
    _.data = T.data = $data;
    _.$i = T.index = $i || 0;
    T._ = null;
    function pushT(value, _this, encode) {
        return encode === false ? T.push(typeof value === "function" ? value.call(_this) : value) : T.push($.encode(typeof (value) === "function" ? value.call(_this) : value));
    }
    with ($.extend(true, {}, _, $data)) {
        try {
            T.push("<!--Print Stylesheets-->\n<link \thref='");
            pushT($.env("root") + "css/blueprint/print.css", this);
            T.push("' \n\t\trel=\"stylesheet\"         \n\t\ttype=\"text/css\" \n\t\tmedia=\"print\"/>\n\n<!--Screen Stylesheets-->\t\t\n\n<link \thref='");
            pushT($.env("root") + "css/blueprint/screen.css", this);
            T.push("'   \n\t\ttype=\"text/css\" \n\t\tmedia=\"screen, projection\"\n\t\trel=\"stylesheet\" />\n<link   href='");
            pushT($.env("root") + "css/sprite.css", this);
            T.push("'   \n        type=\"text/css\" \n        media=\"screen, projection\"\n        rel=\"stylesheet\" />\n<link   href='");
            pushT($.env("root") + "css/site.css", this);
            T.push("' \n        type=\"text/css\" \n        rel=\"stylesheet\" />\n\n\n<!-- extra stylesheet for admin mode -->\n<link\n    href='");
            pushT($.env("root") + "css/site-admin.css", this);
            T.push("' \n    type=\"text/css\"\n    rel=\"stylesheet\"\n/>\n\n<link\n    href='");
            pushT($.env("root") + "css/mobile.css", this);
            T.push("' \n    type=\"text/css\"\n    rel=\"stylesheet\"\n/>\n\n<!--Quirks Mode Stylesheets-->\t\t\t\t\n<!--[if lt IE 8]>\n<link \thref=\"/css/blueprint/ie.css\"\n\t\ttype=\"text/css\" \n\t\tmedia=\"screen, projection\"\n\t\trel=\"stylesheet\" />\n <![endif]-->\n");
        }
        catch (e) {
            if ($.tmpl.debug) {
                T.push(" " + e + " ");
            } else {
                T.push("");
            }
        }
    }
    _.data = null;
    return asArray ? T : T.join("");
}

jQuery.templates[jQuery.env("templates")+"html/forms/artist.tmpl"]=
function anonymous(jQuery, $data, $i) {
    var $ = jQuery, T = [], asArray = arguments.length > 3 ? arguments[3] : false, partial = arguments.length > 4 ? arguments[4] : false, _ = $.tmpl.filters;
    _.data = T.data = $data;
    _.$i = T.index = $i || 0;
    T._ = null;
    function pushT(value, _this, encode) {
        return encode === false ? T.push(typeof value === "function" ? value.call(_this) : value) : T.push($.encode(typeof (value) === "function" ? value.call(_this) : value));
    }
    with ($.extend(true, {}, _, $data)) {
        try {
            T.push("\n<form id='editArtist' \n    method='post' \n    action='");
            pushT($.env("root") + "admin/save/artists/" + artist.$id, this);
            T.push("'>\n    \n        <div class='first column span-7 prepend-2 colborder'>\n            <span class=\"ss_sprite  ss_comment_add\">\n              edit artist name  \n            </span>\n            <h4>\n                <input \n                    id='name' \n                    type='text' \n                    name='name'\n                    value='");
            pushT(artist.name, this);
            T.push("'\n                />\n            </h4>\n            <span  class=\"ss_sprite  ss_image_add\">\n                edit artist id |\n            </span>\n            <br/>\n            <input \n                id=    '$id'\n                type=  'text' \n                name=  '$id'\n                value= '");
            pushT(artist.$id, this);
            T.push("'\n            />\n            <br/>\n            <br/>\n            <span class=\"ss_sprite  ss_image_add\">\n              edit artist image \n            </span>\n            <br/>\n            <input\n                id='image' \n                type='text'\n                name='image'\n                value='");
            pushT(artist.image, this);
            T.push("'\n            />\n            <img src='");
            pushT($.env("data") + artist.image, this);
            T.push("' \n                 alt='");
            pushT(artist.image, this);
            T.push("'  \n                 height='150px'/>\n            <strong>releases</strong>\n            <ul>\n                ");
            jQuery.each(releases, function ($i) {
                with (this) {
                    T.push("\n                <li>\n                    <span class=\"ss_sprite  ss_delete\">\n                        <a href='");
                    pushT($.env("root") + "admin/remove/releases/" + this.$id, this);
                    T.push("'>\n                             remove this release \n                        </a> | \n                    </span>\n                    <span class=\"ss_sprite  ss_comment_add\">\n                        <a href='");
                    pushT($.env("root") + "release/" + this.$id + "?admin", this);
                    T.push("'>\n                             edit this release \n                        </a> \n                    </span>\n                    <br/>\n                    ");
                    pushT(this.name, this);
                    T.push("\n                </li>\n                <li>\n                     <a href='");
                    pushT($.env("root") + "admin/add/releases/?artist=" + artist.$id, this);
                    T.push("'></a>\n                         <span class=\"ss_sprite  ss_add\">\n                             Add Release\n                         </span>\n                     </a>\n                 </li>\n                 ");
                }
            });
            T.push("\n            </ul>\n        </div>\n        <div class=' last column span-12'>\n            <span class=\"ss_sprite  ss_comment_add\">\n                  edit artist description  \n            </span>\n            <textarea id='description'\n                name='description'\n            >");
            pushT(artist.description + "", this);
            T.push("</textarea>\n            <input\n                type='submit' \n                value='save' \n                class='submit'\n            />\n        </div>    \n</form>");
        }
        catch (e) {
            if ($.tmpl.debug) {
                T.push(" " + e + " ");
            } else {
                T.push("");
            }
        }
    }
    _.data = null;
    return asArray ? T : T.join("");
}

jQuery.templates[jQuery.env("templates")+"html/forms/event.tmpl"]=
function anonymous(jQuery, $data, $i) {
    var $ = jQuery, T = [], asArray = arguments.length > 3 ? arguments[3] : false, partial = arguments.length > 4 ? arguments[4] : false, _ = $.tmpl.filters;
    _.data = T.data = $data;
    _.$i = T.index = $i || 0;
    T._ = null;
    function pushT(value, _this, encode) {
        return encode === false ? T.push(typeof value === "function" ? value.call(_this) : value) : T.push($.encode(typeof (value) === "function" ? value.call(_this) : value));
    }
    with ($.extend(true, {}, _, $data)) {
        try {
            T.push("<form action='");
            pushT($.env("root") + "admin/save/events/" + this.$id, this);
            T.push("'\n      method='post'>\n    <input\n        type='hidden'\n        name='$id'\n        value='");
            pushT(this.$id, this);
            T.push("'\n    />\n    <span class=\"date ss_sprite  ss_image_add\">\n      edit event date | \n    </span> <br/>\n    <input \n        class='date' \n        type='text'\n        name='date' \n        value='");
            pushT(this.date, this);
            T.push("'\n    />\n    <br/>\n    <span  class=\"ss_sprite  ss_delete\">\n        <a href='");
            pushT($.env("root") + "admin/" + (this.deleted.length ? "restore" : "remove") + "/events/" + this.$id, this);
            T.push("'>\n        | ");
            pushT((this.deleted.length ? "restore" : "remove"), this);
            T.push(" event\n        </a>\n    </span>\n    <br/>\n    <span class=\"ss_sprite  ss_image_add\">\n        edit artist image\n        <br/>\n        <input\n            id=    'image' \n            type=  'text'\n            name=  'image' \n            value= '");
            pushT(this.image, this);
            T.push("'\n        />\n    </span>\n    <a href='#'>\n        <img \n            src='");
            pushT($.env("data") + this.image, this);
            T.push("'\n            alt='");
            pushT(this.title, this);
            T.push("'\n            width='60px'\n        />\n    </a>\n    <br/>\n    <span class=\"ss_sprite  ss_comment_edit\">\n        edit event title\n        <br/>\n        <input \n            type=  'text'\n            name=  'title' \n            value= '");
            pushT(this.title, this);
            T.push("'\n        />\n    </span>\n    <br/>\n    <span class=\"ss_sprite  ss_comment_edit\">\n        edit event location\n        <br/>\n        <input\n            class= 'location' \n            type=  'text'\n            name=  'location' \n            value= '");
            pushT(this.location, this);
            T.push("'\n        />\n    </span>\n    <br/>\n    <span class=\"ss_sprite  ss_comment_edit\">\n        edit event description\n        <br/>\n        <textarea\n            class= 'description' \n            name=  'description'\n        >");
            pushT(this.description, this);
            T.push("</textarea>\n    </span>\n    <br/>\n    <input\n        type=  'submit' \n        value= 'save'\n        class= 'submit'\n    />\n    \n</form>");
        }
        catch (e) {
            if ($.tmpl.debug) {
                T.push(" " + e + " ");
            } else {
                T.push("");
            }
        }
    }
    _.data = null;
    return asArray ? T : T.join("");
}

jQuery.templates[jQuery.env("templates")+"html/forms/news.tmpl"]=
function anonymous(jQuery, $data, $i) {
    var $ = jQuery, T = [], asArray = arguments.length > 3 ? arguments[3] : false, partial = arguments.length > 4 ? arguments[4] : false, _ = $.tmpl.filters;
    _.data = T.data = $data;
    _.$i = T.index = $i || 0;
    T._ = null;
    function pushT(value, _this, encode) {
        return encode === false ? T.push(typeof value === "function" ? value.call(_this) : value) : T.push($.encode(typeof (value) === "function" ? value.call(_this) : value));
    }
    with ($.extend(true, {}, _, $data)) {
        try {
            T.push("<form action='");
            pushT("admin/save/news/" + this.$id, this);
            T.push("'\n      method='post'>\n    <input\n        type='hidden'\n        name='$id'\n        value='");
            pushT(this.$id, this);
            T.push("'\n    />\n    <span class=  \"title ss_sprite  ss_image_add\">\n        edit news title | \n        <span class= \"ss_sprite  ss_delete\">\n            <a href='");
            pushT($.env("root") + "admin/" + (this.deleted.length ? "restore" : "remove") + "/news/" + this.$id, this);
            T.push("'>\n                 ");
            pushT((this.deleted.length ? "restore" : "remove"), this);
            T.push(" news \n            </a>\n        </span>\n        <br/>\n        <input\n            class= 'title' \n            type=  'text'\n            name=  'title'\n            value= '");
            pushT(this.title, this);
            T.push("'\n        />\n    </span>\n    <br/>\n    <span class=\"date ss_sprite  ss_comment_add\"\n        >edit news date | \n        <br/>\n        <input\n            class= 'date' \n            type=  'text'\n            name=  'date' \n            value= '");
            pushT(this.date, this);
            T.push("'\n        />\n    </span>\n    <p>\n        <span class=\"ss_sprite  ss_comment_add\">\n            edit news description\n            <textarea\n                class='description'\n                name='description'\n                style='border-bottom:1px dotted #567'>\n                ");
            pushT(this.description, this);
            T.push("\n            </textarea>\n        </span>\n    </p>\n                    \n    <input\n        id=    '");
            pushT("submit/news/" + this.$id, this);
            T.push("'\n        type=  'submit', \n        value= 'save', \n        class= 'submit'\n    />\n    <hr/>\n</form>");
        }
        catch (e) {
            if ($.tmpl.debug) {
                T.push(" " + e + " ");
            } else {
                T.push("");
            }
        }
    }
    _.data = null;
    return asArray ? T : T.join("");
}

jQuery.templates[jQuery.env("templates")+"html/forms/paypal.tmpl"]=
function anonymous(jQuery, $data, $i) {
    var $ = jQuery, T = [], asArray = arguments.length > 3 ? arguments[3] : false, partial = arguments.length > 4 ? arguments[4] : false, _ = $.tmpl.filters;
    _.data = T.data = $data;
    _.$i = T.index = $i || 0;
    T._ = null;
    function pushT(value, _this, encode) {
        return encode === false ? T.push(typeof value === "function" ? value.call(_this) : value) : T.push($.encode(typeof (value) === "function" ? value.call(_this) : value));
    }
    with ($.extend(true, {}, _, $data)) {
        try {
            T.push("\n<form id='paypal-");
            pushT(this.ska, this);
            T.push("'\n      method='post'\n      action='https://www.paypal.com/cgi-bin/webscr'\n      target='paypal'>\n    \n    <div class='last column box span-4'>\n        <br/>\n        <h6>purchase this pressing</h6>\n        <p align='center'>\n            <em>");
            pushT(this.format, this);
            T.push("</em>\n            <br/>\n            <span class='cost'> $ ");
            pushT(this.price, this);
            T.push("</span>\n            <br/>\n            <input\n                type='hidden'\n                name='cmd'\n                value='_s-xclick'\n            />\n            <input\n                type='hidden'\n                name='hosted_button_id'\n                value='");
            pushT(this.ska, this);
            T.push("'\n            />\n            <input\n                id=    '");
            pushT(this.ska, this);
            T.push("'\n                class= 'addtocart'\n                type=  'image'\n                src=   'https://www.paypal.com/en_US/i/btn/btn_cart_LG.gif'\n                alt=   'PayPal - The safer, easier way to pay online!'\n                name=  'submit'\n            />\n        </p>\n    </div>\n\n</form>\n    ");
        }
        catch (e) {
            if ($.tmpl.debug) {
                T.push(" " + e + " ");
            } else {
                T.push("");
            }
        }
    }
    _.data = null;
    return asArray ? T : T.join("");
}

jQuery.templates[jQuery.env("templates")+"html/forms/pressing.tmpl"]=
function anonymous(jQuery, $data, $i) {
    var $ = jQuery, T = [], asArray = arguments.length > 3 ? arguments[3] : false, partial = arguments.length > 4 ? arguments[4] : false, _ = $.tmpl.filters;
    _.data = T.data = $data;
    _.$i = T.index = $i || 0;
    T._ = null;
    function pushT(value, _this, encode) {
        return encode === false ? T.push(typeof value === "function" ? value.call(_this) : value) : T.push($.encode(typeof (value) === "function" ? value.call(_this) : value));
    }
    with ($.extend(true, {}, _, $data)) {
        try {
            T.push("<form id='editPressings-");
            pushT(this.$id, this);
            T.push("'\n      method='post'\n      action='/admin/save/pressings/");
            pushT(this.$id, this);
            T.push("'>\n    <input\n        type='hidden'\n        name='$id'\n        value='");
            pushT(this.$id, this);
            T.push("'\n    />   \n    <div class='pressing span-22 ");
            pushT(this.deleted ? "deleted" : "", this);
            T.push("'>\n        \n        <div class='first column span-13 prepend-2 colborder'>\n            <span style= \"float:left;\"\n                  class= \"ss_sprite  ss_delete\" >\n                <a  id='pressings/");
            pushT(this.$id, this);
            T.push("' \n                    href='");
            pushT($.env("root"), this);
            T.push("admin/");
            pushT((this.deleted.length ? "restore" : "remove"), this);
            T.push("/pressings/");
            pushT(this.$id, this);
            T.push("?release=");
            pushT(this.release, this);
            T.push("'>\n                     | ");
            pushT((this.deleted.length ? "restore" : "remove"), this);
            T.push(" release \n                </a>\n            </span>\n            <span class= \"ss_sprite  ss_comment_add\">\n               edit pressing description | \n            </span>\n            <textarea\n                id=    'description'\n                name=  'description'\n            >");
            pushT(this.description, this);
            T.push("</textarea>\n            <input\n                type=  'hidden' \n                name=  'release'\n                value= '");
            pushT(this.release, this);
            T.push("'\n            />\n            <input\n                type=  'submit'\n                value= 'save'\n                class= 'submit'\n            />\n        </div>\n        <div class='last column small box span-4'>\n            <h6>purchase this pressing</h6>\n            <p align='center'>\n                    <span class= \"ss_sprite  ss_cd\">\n                       edit release format | \n                    </span>\n                    <input\n                        id=    'format' \n                        type=  'text'\n                        name=  'format'\n                        value= '");
            pushT(this.format, this);
            T.push("'\n                    />\n                    <br/>\n                    <span class= \"ss_sprite  ss_money\">\n                        edit release price | \n                    </span>\n                    <input\n                        id=    'price' \n                        type=  'text'\n                        name=  'price'\n                        value= '");
            pushT(this.price, this);
            T.push("'\n                    />\n                    <br/>\n                    <span class= \"ss_sprite  ss_creditcards \">\n                        edit release ska | \n                    </span>\n                    <input\n                        id=    'ska' \n                        type=  'text'\n                        name=  'ska'\n                        value= '");
            pushT(this.ska, this);
            T.push("'\n                    />\n            </p>\n        </div>\n                \n    </div>\n    \n</form>");
        }
        catch (e) {
            if ($.tmpl.debug) {
                T.push(" " + e + " ");
            } else {
                T.push("");
            }
        }
    }
    _.data = null;
    return asArray ? T : T.join("");
}

jQuery.templates[jQuery.env("templates")+"html/forms/release.tmpl"]=
function anonymous(jQuery, $data, $i) {
    var $ = jQuery, T = [], asArray = arguments.length > 3 ? arguments[3] : false, partial = arguments.length > 4 ? arguments[4] : false, _ = $.tmpl.filters;
    _.data = T.data = $data;
    _.$i = T.index = $i || 0;
    T._ = null;
    function pushT(value, _this, encode) {
        return encode === false ? T.push(typeof value === "function" ? value.call(_this) : value) : T.push($.encode(typeof (value) === "function" ? value.call(_this) : value));
    }
    with ($.extend(true, {}, _, $data)) {
        try {
            T.push("<form id='editRelease' \n      method='post' \n      action='");
            pushT($.env("root") + "admin/save/releases/" + release.$id, this);
            T.push("'>\n    <div class='first column span-5 colborder push-1'>\n        \n        <span class=\"ss_sprite  ss_comment_add\">\n            edit release name |\n        </span>\n        <em>Release</em><br/>\n        <input \n            type=  'text' \n            name=  'name'\n            value= '");
            pushT(release.name, this);
            T.push("'\n        />\n        <h5>\n            <a href='#'>\n                ");
            pushT(artist.name, this);
            T.push("\n            </a>\n        </h5>\n        <span  class=\"ss_sprite  ss_comment_add\">\n            edit release id |\n        </span>\n        <input \n            id=    '$id'\n            type=  'text' \n            name=  '$id'\n            value= '");
            pushT(release.$id, this);
            T.push("'\n        />\n        <br/>\n        <span  class=\"ss_sprite  ss_comment_add\">\n            feature? true or blank |\n        </span>\n        <input \n            id=    'featured'\n            type=  'text' \n            name=  'featured'\n            value= '");
            pushT(release.featured, this);
            T.push("'\n        />\n        <br/>\n        <span  class=\"ss_sprite  ss_comment_add\">\n            edit label id |\n        </span>\n        <input \n            id=    'label_id'\n            type=  'text' \n            name=  'label_id'\n            value= '");
            pushT(release.label_id, this);
            T.push("'\n        />\n        <br/>\n        <span  class=\"ss_sprite  ss_image_add\">\n            edit release image |\n        </span>\n        <input \n            id=    'image'\n            type=  'text' \n            name=  'image'\n            value= '");
            pushT(release.image, this);
            T.push("'\n        />\n        <br/>\n        <input \n            type=  'hidden' \n            name=  'artist'\n            value= '");
            pushT(artist.$id, this);
            T.push("'\n        />\n        <br/>\n        <input \n            id=    'submitRelease'\n            type=  'submit' \n            value= 'save'\n            class= 'submit'\n        />\n    </div>\n       \n    <div id='cover' \n         class='column span-6 colborder'>\n        <img src='");
            pushT($.env("data") + release.image, this);
            T.push("' \n             alt='release image'  \n             height='150px'\n        />\n    </div>\n    \n    <div id='media' \n         class='column span-9'>\n        \n        <ul>\n            ");
            jQuery.each(release.tracks, function (index, title) {
                with (this) {
                    T.push("\n            <li>\n                <span class= \"ss_sprite  ss_delete\">\n                <a href='");
                    pushT($.env("root") + "admin/remove/tracks/" + "?release=" + release.$id + "&index=" + index, this);
                    T.push("'>\n                    remove track | \n                </a>\n                <input \n                    id=    '");
                    pushT("tracks." + index, this);
                    T.push("'\n                    type=  'text' \n                    name=  '");
                    pushT("tracks." + index, this);
                    T.push("'\n                    value= '");
                    pushT(title, this);
                    T.push("'\n                />\n                </span>\n            </li>\n            ");
                }
            });
            T.push("\n        \n            <li>\n            <span class= \"ss_sprite  ss_add\">\n                <a id=    '");
            pushT("track." + release.tracks.length, this);
            T.push("' \n                   href=  '");
            pushT($.env("root") + "admin/add/tracks/?release=" + release.$id, this);
            T.push("'\n                   name=  '");
            pushT("track." + release.tracks.length, this);
            T.push("'> \n                    Add a new track\n                </a>\n            </span>\n            </li>\n        </ul>\n    </div>\n    \n    <div class='column span-18 push-3' >\n        <span class= \"ss_sprite  ss_comment_add\">\n            edit release description |\n        </span>\n        <textarea\n            id='description'\n            name='description'\n            style='border-bottom:1px dotted #567'\n        >");
            pushT(release.description, this);
            T.push("</textarea>\n    </div>\n    \n    \n</form>");
        }
        catch (e) {
            if ($.tmpl.debug) {
                T.push(" " + e + " ");
            } else {
                T.push("");
            }
        }
    }
    _.data = null;
    return asArray ? T : T.join("");
}

jQuery.templates[jQuery.env("templates")+"html/pages/artist.tmpl"]=
function anonymous(jQuery, $data, $i) {
    var $ = jQuery, T = [], asArray = arguments.length > 3 ? arguments[3] : false, partial = arguments.length > 4 ? arguments[4] : false, _ = $.tmpl.filters;
    _.data = T.data = $data;
    _.$i = T.index = $i || 0;
    T._ = null;
    function pushT(value, _this, encode) {
        return encode === false ? T.push(typeof value === "function" ? value.call(_this) : value) : T.push($.encode(typeof (value) === "function" ? value.call(_this) : value));
    }
    with ($.extend(true, {}, _, $data)) {
        try {
            T.push("");
            T._ = $.env("templates") + "html/base.tmpl";
            if (T._.match("#") && (!partial || T.include)) {
                if (!(T._ in $.templates)) {
                    $.templates[T._] = $.tmpl($(T._).text());
                }
            } else {
                if (!(T._ in $.templates) && (!partial || T.include)) {
                    $.ajax({url:T._, type:"GET", dataType:"text", async:false, success:function (text) {
                        $.templates[T._] = $.tmpl(text);
                    }, error:function (xhr, status, e) {
                        $.templates[T._] = $.tmpl(xhr.responseText);
                    }});
                }
            }
            if (!partial || T.include) {
                Array.prototype.push.apply(T, $.templates[T._].call(this, jQuery, $.extend({}, $data, this), 0, true, false));
            }
            T._ = null;
            T.push("\n    \n");
            (function () {
                var name = "title", tmp, diff1, diff2;
                if (!T.blocks) {
                    T.blocks = $.tmpl.blocks;
                }
                if (!T.blocks[name]) {
                    T.blocks[name] = {start:T.length};
                }
                var B = (function () {
                    var T = [];
                    function pushT(value, _this, encode) {
                        return encode === false ? T.push(typeof value === "function" ? value.call(_this) : value) : T.push($.encode(typeof (value) === "function" ? value.call(_this) : value));
                    }
                    T.push("\n    Records of Existence Artist ");
                    pushT(artist.name, this);
                    T.push("\n");
                    return T;
                })();
                diff1 = T.blocks[name].end ? T.blocks[name].end - T.blocks[name].start : 0;
                Array.prototype.splice.apply(T, [T.blocks[name].start + 1, diff1].concat(B));
                T.blocks[name].end = T.blocks[name].start + B.length;
                diff2 = T.blocks[name].end - T.blocks[name].start;
                for (tmp in T.blocks) {
                    if (T.blocks[tmp].start > T.blocks[name].start) {
                        T.blocks[tmp].start += diff2 - diff1;
                        T.blocks[tmp].end += diff2 - diff1;
                    }
                }
            })();
            T.push("\n\n");
            (function () {
                var name = "main", tmp, diff1, diff2;
                if (!T.blocks) {
                    T.blocks = $.tmpl.blocks;
                }
                if (!T.blocks[name]) {
                    T.blocks[name] = {start:T.length};
                }
                var B = (function () {
                    var T = [];
                    function pushT(value, _this, encode) {
                        return encode === false ? T.push(typeof value === "function" ? value.call(_this) : value) : T.push($.encode(typeof (value) === "function" ? value.call(_this) : value));
                    }
                    T.push("\n<div id='artist'>\n    <h3>\n        <a href='");
                    pushT($.env("root") + "artists", this);
                    T.push("'>\n            &lt; artists\n        </a>\n    </h3>\n    ");
                    if (admin) {
                        T.push("\n        ");
                        T.include = true;
                        T._ = $.env("templates") + "html/forms/artist.tmpl";
                        if (T._.match("#") && (!partial || T.include)) {
                            if (!(T._ in $.templates)) {
                                $.templates[T._] = $.tmpl($(T._).text());
                            }
                        } else {
                            if (!(T._ in $.templates) && (!partial || T.include)) {
                                $.ajax({url:T._, type:"GET", dataType:"text", async:false, success:function (text) {
                                    $.templates[T._] = $.tmpl(text);
                                }, error:function (xhr, status, e) {
                                    $.templates[T._] = $.tmpl(xhr.responseText);
                                }});
                            }
                        }
                        if (!partial || T.include) {
                            Array.prototype.push.apply(T, $.templates[T._].call(this, jQuery, $.extend({}, $data, this), 0, true, false));
                        }
                        T._ = null;
                        T.push("\n    ");
                    } else {
                        T.push("\n    <div class='first column span-7 push-2 colborder'>\n        \n        <h4>\n            ");
                        pushT(artist.name, this);
                        T.push("\n        </h4>\n        <img src='");
                        pushT($.env("data") + artist.image, this);
                        T.push("' \n             alt='");
                        pushT(artist.image, this);
                        T.push("'  \n             height='150px'/>\n        <strong>releases</strong>\n        <ul>\n            ");
                        jQuery.each(releases, function ($i) {
                            with (this) {
                                T.push("\n            <li>\n                <a href='");
                                pushT($.env("root") + "release/" + this.$id, this);
                                T.push("'>\n                    ");
                                pushT(this.name, this);
                                T.push("\n                </a>\n            </li>\n             ");
                            }
                        });
                        T.push("\n        </ul>\n    </div>\n    <div class=' last column span-12'>\n        <p>");
                        pushT(artist.description, this);
                        T.push("</p>\n    </div>\n    ");
                    }
                    T.push("\n</div>\n");
                    return T;
                })();
                diff1 = T.blocks[name].end ? T.blocks[name].end - T.blocks[name].start : 0;
                Array.prototype.splice.apply(T, [T.blocks[name].start + 1, diff1].concat(B));
                T.blocks[name].end = T.blocks[name].start + B.length;
                diff2 = T.blocks[name].end - T.blocks[name].start;
                for (tmp in T.blocks) {
                    if (T.blocks[tmp].start > T.blocks[name].start) {
                        T.blocks[tmp].start += diff2 - diff1;
                        T.blocks[tmp].end += diff2 - diff1;
                    }
                }
            })();
            T.push("\n");
        }
        catch (e) {
            if ($.tmpl.debug) {
                T.push(" " + e + " ");
            } else {
                T.push("");
            }
        }
    }
    _.data = null;
    return asArray ? T : T.join("");
}

jQuery.templates[jQuery.env("templates")+"html/pages/artists.tmpl"]=
function anonymous(jQuery, $data, $i) {
    var $ = jQuery, T = [], asArray = arguments.length > 3 ? arguments[3] : false, partial = arguments.length > 4 ? arguments[4] : false, _ = $.tmpl.filters;
    _.data = T.data = $data;
    _.$i = T.index = $i || 0;
    T._ = null;
    function pushT(value, _this, encode) {
        return encode === false ? T.push(typeof value === "function" ? value.call(_this) : value) : T.push($.encode(typeof (value) === "function" ? value.call(_this) : value));
    }
    with ($.extend(true, {}, _, $data)) {
        try {
            T.push("");
            T._ = $.env("templates") + "html/base.tmpl";
            if (T._.match("#") && (!partial || T.include)) {
                if (!(T._ in $.templates)) {
                    $.templates[T._] = $.tmpl($(T._).text());
                }
            } else {
                if (!(T._ in $.templates) && (!partial || T.include)) {
                    $.ajax({url:T._, type:"GET", dataType:"text", async:false, success:function (text) {
                        $.templates[T._] = $.tmpl(text);
                    }, error:function (xhr, status, e) {
                        $.templates[T._] = $.tmpl(xhr.responseText);
                    }});
                }
            }
            if (!partial || T.include) {
                Array.prototype.push.apply(T, $.templates[T._].call(this, jQuery, $.extend({}, $data, this), 0, true, false));
            }
            T._ = null;
            T.push("\n\n");
            (function () {
                var name = "title", tmp, diff1, diff2;
                if (!T.blocks) {
                    T.blocks = $.tmpl.blocks;
                }
                if (!T.blocks[name]) {
                    T.blocks[name] = {start:T.length};
                }
                var B = (function () {
                    var T = [];
                    function pushT(value, _this, encode) {
                        return encode === false ? T.push(typeof value === "function" ? value.call(_this) : value) : T.push($.encode(typeof (value) === "function" ? value.call(_this) : value));
                    }
                    T.push("\nRecords of Existence Artists\n");
                    return T;
                })();
                diff1 = T.blocks[name].end ? T.blocks[name].end - T.blocks[name].start : 0;
                Array.prototype.splice.apply(T, [T.blocks[name].start + 1, diff1].concat(B));
                T.blocks[name].end = T.blocks[name].start + B.length;
                diff2 = T.blocks[name].end - T.blocks[name].start;
                for (tmp in T.blocks) {
                    if (T.blocks[tmp].start > T.blocks[name].start) {
                        T.blocks[tmp].start += diff2 - diff1;
                        T.blocks[tmp].end += diff2 - diff1;
                    }
                }
            })();
            T.push("\n\n");
            (function () {
                var name = "main", tmp, diff1, diff2;
                if (!T.blocks) {
                    T.blocks = $.tmpl.blocks;
                }
                if (!T.blocks[name]) {
                    T.blocks[name] = {start:T.length};
                }
                var B = (function () {
                    var T = [];
                    function pushT(value, _this, encode) {
                        return encode === false ? T.push(typeof value === "function" ? value.call(_this) : value) : T.push($.encode(typeof (value) === "function" ? value.call(_this) : value));
                    }
                    T.push("\n<div id='artists'>\n    <h3>artists</h3>\n    \n    ");
                    if (admin) {
                        T.push("\n    <div style='clear:both;text-align:center;'>\n        <span  class=\"ss_sprite  ss_add\">\n            <a href='");
                        pushT($.env("root") + "admin/add/artists/", this);
                        T.push("'>\n            Add artist\n            </a>\n        </span><br/>\n        <a id='show_deleted'\n           href='#show/deleted'>\n           show deleted artists\n        </a>\n        <span> | </span>\n        <a id='hide_deleted'\n           href='#hide/deleted'>\n           hide deleted artists\n        </a>\n    </div>\n    ");
                    }
                    T.push(" \n    \n    <div class='first column span-11  '>\n        <ul>\n            ");
                    jQuery.each(_(artists).even(), function ($i) {
                        with (this) {
                            T.push("\n            <li class='");
                            pushT((this.deleted.length ? "deleted" : ""), this);
                            T.push("'>\n                ");
                            if (admin) {
                                T.push("\n                <span class=\"ss_sprite  ss_comment_edit\">\n                    <a href='");
                                pushT($.env("root") + "artist/" + this.$id + "?admin", this);
                                T.push("'>\n                     | edit artist \n                    </a><br/>\n                </span>\n                <span class=\"ss_sprite  ss_comment_delete\">\n                    <a href='");
                                pushT($.env("root") + "admin/" + (this.deleted.length ? "restore" : "remove") + "/artists/" + this.$id, this);
                                T.push("'>\n                        | ");
                                pushT(this.deleted.length ? "restore" : "remove", this);
                                T.push(" artist \n                    </a><br/>\n                </span>\n                <span class=\"ss_sprite  ss_cd_add\">\n                    <a href='");
                                pushT($.env("root") + "admin/add/releases/?artist=" + this.$id, this);
                                T.push("'>\n                         | add release \n                    </a><br/>\n                </span>\n                ");
                            }
                            T.push("\n                <a href='");
                            pushT($.env("root") + "artist/" + this.$id, this);
                            T.push("'>\n                    <strong>");
                            pushT(this.name, this);
                            T.push("</strong>\n                    <img src='");
                            pushT($.env("data") + this.image, this);
                            T.push("'\n                         alt='");
                            pushT(this.name, this);
                            T.push("'\n                         height='80px'/>\n                </a>\n            </li>\n            ");
                        }
                    });
                    T.push("\n        </ul>\n    </div>\n    <div class=' last column span-10'>\n        <ul>\n            ");
                    jQuery.each(_(artists).odd(), function ($i) {
                        with (this) {
                            T.push("\n            <li class='");
                            pushT((this.deleted.length ? "deleted" : ""), this);
                            T.push("'>\n                ");
                            if (admin) {
                                T.push("\n                <span class=\"ss_sprite  ss_comment_edit\">\n                    <a href='");
                                pushT($.env("root") + "artist/" + this.$id + "?admin", this);
                                T.push("'>\n                     | edit artist \n                    </a><br/>\n                </span>\n                <span class=\"ss_sprite  ss_comment_delete\">\n                    <a href='");
                                pushT($.env("root") + "admin/" + (this.deleted.length ? "restore" : "remove") + "/artists/" + this.$id, this);
                                T.push("'>\n                        | ");
                                pushT(this.deleted.length ? "restore" : "remove", this);
                                T.push(" artist \n                    </a><br/>\n                </span>\n                <span class=\"ss_sprite  ss_cd_add\">\n                    <a href='");
                                pushT($.env("root") + "admin/add/releases/?artist=" + this.$id, this);
                                T.push("'>\n                         | add release \n                    </a><br/>\n                </span>\n                ");
                            }
                            T.push("\n                <a href='");
                            pushT($.env("root"), this);
                            T.push("artist/");
                            pushT(this.$id, this);
                            T.push("'>\n                    <img src='");
                            pushT($.env("data") + this.image, this);
                            T.push("'\n                         alt='");
                            pushT(this.name, this);
                            T.push("'\n                         height='80px'/>\n                    <strong>");
                            pushT(this.name, this);
                            T.push("</strong>\n                </a>\n            </li>\n            ");
                        }
                    });
                    T.push("\n        </ul>\n    </div>\n</div>\n");
                    return T;
                })();
                diff1 = T.blocks[name].end ? T.blocks[name].end - T.blocks[name].start : 0;
                Array.prototype.splice.apply(T, [T.blocks[name].start + 1, diff1].concat(B));
                T.blocks[name].end = T.blocks[name].start + B.length;
                diff2 = T.blocks[name].end - T.blocks[name].start;
                for (tmp in T.blocks) {
                    if (T.blocks[tmp].start > T.blocks[name].start) {
                        T.blocks[tmp].start += diff2 - diff1;
                        T.blocks[tmp].end += diff2 - diff1;
                    }
                }
            })();
            T.push("\n");
        }
        catch (e) {
            if ($.tmpl.debug) {
                T.push(" " + e + " ");
            } else {
                T.push("");
            }
        }
    }
    _.data = null;
    return asArray ? T : T.join("");
}

jQuery.templates[jQuery.env("templates")+"html/pages/contact.tmpl"]=
function anonymous(jQuery, $data, $i) {
    var $ = jQuery, T = [], asArray = arguments.length > 3 ? arguments[3] : false, partial = arguments.length > 4 ? arguments[4] : false, _ = $.tmpl.filters;
    _.data = T.data = $data;
    _.$i = T.index = $i || 0;
    T._ = null;
    function pushT(value, _this, encode) {
        return encode === false ? T.push(typeof value === "function" ? value.call(_this) : value) : T.push($.encode(typeof (value) === "function" ? value.call(_this) : value));
    }
    with ($.extend(true, {}, _, $data)) {
        try {
            T.push("");
            T._ = $.env("templates") + "html/base.tmpl";
            if (T._.match("#") && (!partial || T.include)) {
                if (!(T._ in $.templates)) {
                    $.templates[T._] = $.tmpl($(T._).text());
                }
            } else {
                if (!(T._ in $.templates) && (!partial || T.include)) {
                    $.ajax({url:T._, type:"GET", dataType:"text", async:false, success:function (text) {
                        $.templates[T._] = $.tmpl(text);
                    }, error:function (xhr, status, e) {
                        $.templates[T._] = $.tmpl(xhr.responseText);
                    }});
                }
            }
            if (!partial || T.include) {
                Array.prototype.push.apply(T, $.templates[T._].call(this, jQuery, $.extend({}, $data, this), 0, true, false));
            }
            T._ = null;
            T.push("\n\n");
            (function () {
                var name = "title", tmp, diff1, diff2;
                if (!T.blocks) {
                    T.blocks = $.tmpl.blocks;
                }
                if (!T.blocks[name]) {
                    T.blocks[name] = {start:T.length};
                }
                var B = (function () {
                    var T = [];
                    function pushT(value, _this, encode) {
                        return encode === false ? T.push(typeof value === "function" ? value.call(_this) : value) : T.push($.encode(typeof (value) === "function" ? value.call(_this) : value));
                    }
                    T.push("\nRecords of Existence Contact\n");
                    return T;
                })();
                diff1 = T.blocks[name].end ? T.blocks[name].end - T.blocks[name].start : 0;
                Array.prototype.splice.apply(T, [T.blocks[name].start + 1, diff1].concat(B));
                T.blocks[name].end = T.blocks[name].start + B.length;
                diff2 = T.blocks[name].end - T.blocks[name].start;
                for (tmp in T.blocks) {
                    if (T.blocks[tmp].start > T.blocks[name].start) {
                        T.blocks[tmp].start += diff2 - diff1;
                        T.blocks[tmp].end += diff2 - diff1;
                    }
                }
            })();
            T.push("\n\n");
            (function () {
                var name = "main", tmp, diff1, diff2;
                if (!T.blocks) {
                    T.blocks = $.tmpl.blocks;
                }
                if (!T.blocks[name]) {
                    T.blocks[name] = {start:T.length};
                }
                var B = (function () {
                    var T = [];
                    function pushT(value, _this, encode) {
                        return encode === false ? T.push(typeof value === "function" ? value.call(_this) : value) : T.push($.encode(typeof (value) === "function" ? value.call(_this) : value));
                    }
                    T.push("\n<div class=\"span-16 column first\">\n    <div id='contact'>\n        <h3>contact</h3>\n        <p>\n            <img src='");
                    pushT($.env("root") + "images/goldrecord.png", this);
                    T.push("' \n                 alt='records of existence'\n                 height='70px'/>\n            If you'ld like to get in touch, please do. We will try to respond quickly. \n            We gladly accept submissions.  However, keep in mind that we are a small \n            label with a limited amount of resources and time to put into our releases.  \n            So many of our releases are done by hand with sizable investment of time.  \n            This is a labor of love that we do to make the releases as unique as the \n            bands they showcase.  So if we LOVE it, we will put it out if we think \n            its a good fit.  \n        </p>\n        <p>\n            We mostly focus on projects from our regional area in \n            the mid-atlantic as these are more often those we have come to call friends.  \n            Our interests and tastes are diverse.  If you're a fan of what we do, we may\n            very well be a good match.  stop by sometime.\n        </p>\n        <p align=\"center\">\n            <em>\n                Records of Existence<br/>\n                  P.O. Box 995<br/>\n               Shepherdstown, WV 25443\n            </em><br/>\n          <!--/**a href=\"mailto:info@recordsofexistence.org\">\n              info@recordsofexistence.org\n          </a*/-->\n       </p>\n    </div>\n</div>\n<div class=\"span-7 column last\">\n    <div id='mailing_list'>\n        <h3>mailing list</h3>\n        <p>Please join our list to keep up to date!</p>\n        <span>\n            <a href=\"mailto:recordsofexistence@hotmail.com\" \n                target=\"new\">\n                  recordsofexistence mailing list\n            </a>\n        </span>\n        <!--/**form action=\"mailinglist/subscribe\" method=\"get\">\n            <input name=\"email\" size=\"13\" value=\"you@it.com\" type=\"text\"/>\n            <input class=\"button\" value=\"ok\" type=\"submit\"/>\n        </form*/-->\n    </div>\n </div>\n");
                    return T;
                })();
                diff1 = T.blocks[name].end ? T.blocks[name].end - T.blocks[name].start : 0;
                Array.prototype.splice.apply(T, [T.blocks[name].start + 1, diff1].concat(B));
                T.blocks[name].end = T.blocks[name].start + B.length;
                diff2 = T.blocks[name].end - T.blocks[name].start;
                for (tmp in T.blocks) {
                    if (T.blocks[tmp].start > T.blocks[name].start) {
                        T.blocks[tmp].start += diff2 - diff1;
                        T.blocks[tmp].end += diff2 - diff1;
                    }
                }
            })();
            T.push("\n");
        }
        catch (e) {
            if ($.tmpl.debug) {
                T.push(" " + e + " ");
            } else {
                T.push("");
            }
        }
    }
    _.data = null;
    return asArray ? T : T.join("");
}

jQuery.templates[jQuery.env("templates")+"html/pages/error.tmpl"]=
function anonymous(jQuery, $data, $i) {
    var $ = jQuery, T = [], asArray = arguments.length > 3 ? arguments[3] : false, partial = arguments.length > 4 ? arguments[4] : false, _ = $.tmpl.filters;
    _.data = T.data = $data;
    _.$i = T.index = $i || 0;
    T._ = null;
    function pushT(value, _this, encode) {
        return encode === false ? T.push(typeof value === "function" ? value.call(_this) : value) : T.push($.encode(typeof (value) === "function" ? value.call(_this) : value));
    }
    with ($.extend(true, {}, _, $data)) {
        try {
            T.push("");
            T._ = $.env("templates") + "html/base.tmpl";
            if (T._.match("#") && (!partial || T.include)) {
                if (!(T._ in $.templates)) {
                    $.templates[T._] = $.tmpl($(T._).text());
                }
            } else {
                if (!(T._ in $.templates) && (!partial || T.include)) {
                    $.ajax({url:T._, type:"GET", dataType:"text", async:false, success:function (text) {
                        $.templates[T._] = $.tmpl(text);
                    }, error:function (xhr, status, e) {
                        $.templates[T._] = $.tmpl(xhr.responseText);
                    }});
                }
            }
            if (!partial || T.include) {
                Array.prototype.push.apply(T, $.templates[T._].call(this, jQuery, $.extend({}, $data, this), 0, true, false));
            }
            T._ = null;
            T.push("\n    \n");
            (function () {
                var name = "title", tmp, diff1, diff2;
                if (!T.blocks) {
                    T.blocks = $.tmpl.blocks;
                }
                if (!T.blocks[name]) {
                    T.blocks[name] = {start:T.length};
                }
                var B = (function () {
                    var T = [];
                    function pushT(value, _this, encode) {
                        return encode === false ? T.push(typeof value === "function" ? value.call(_this) : value) : T.push($.encode(typeof (value) === "function" ? value.call(_this) : value));
                    }
                    T.push("\nRecords of Existence Error\n");
                    return T;
                })();
                diff1 = T.blocks[name].end ? T.blocks[name].end - T.blocks[name].start : 0;
                Array.prototype.splice.apply(T, [T.blocks[name].start + 1, diff1].concat(B));
                T.blocks[name].end = T.blocks[name].start + B.length;
                diff2 = T.blocks[name].end - T.blocks[name].start;
                for (tmp in T.blocks) {
                    if (T.blocks[tmp].start > T.blocks[name].start) {
                        T.blocks[tmp].start += diff2 - diff1;
                        T.blocks[tmp].end += diff2 - diff1;
                    }
                }
            })();
            T.push("\n\n");
            (function () {
                var name = "main", tmp, diff1, diff2;
                if (!T.blocks) {
                    T.blocks = $.tmpl.blocks;
                }
                if (!T.blocks[name]) {
                    T.blocks[name] = {start:T.length};
                }
                var B = (function () {
                    var T = [];
                    function pushT(value, _this, encode) {
                        return encode === false ? T.push(typeof value === "function" ? value.call(_this) : value) : T.push($.encode(typeof (value) === "function" ? value.call(_this) : value));
                    }
                    T.push("\n<h3>An unexpected error occured.</h3>\n");
                    return T;
                })();
                diff1 = T.blocks[name].end ? T.blocks[name].end - T.blocks[name].start : 0;
                Array.prototype.splice.apply(T, [T.blocks[name].start + 1, diff1].concat(B));
                T.blocks[name].end = T.blocks[name].start + B.length;
                diff2 = T.blocks[name].end - T.blocks[name].start;
                for (tmp in T.blocks) {
                    if (T.blocks[tmp].start > T.blocks[name].start) {
                        T.blocks[tmp].start += diff2 - diff1;
                        T.blocks[tmp].end += diff2 - diff1;
                    }
                }
            })();
            T.push("\n");
        }
        catch (e) {
            if ($.tmpl.debug) {
                T.push(" " + e + " ");
            } else {
                T.push("");
            }
        }
    }
    _.data = null;
    return asArray ? T : T.join("");
}

jQuery.templates[jQuery.env("templates")+"html/pages/events.tmpl"]=
function anonymous(jQuery, $data, $i) {
    var $ = jQuery, T = [], asArray = arguments.length > 3 ? arguments[3] : false, partial = arguments.length > 4 ? arguments[4] : false, _ = $.tmpl.filters;
    _.data = T.data = $data;
    _.$i = T.index = $i || 0;
    T._ = null;
    function pushT(value, _this, encode) {
        return encode === false ? T.push(typeof value === "function" ? value.call(_this) : value) : T.push($.encode(typeof (value) === "function" ? value.call(_this) : value));
    }
    with ($.extend(true, {}, _, $data)) {
        try {
            T.push("");
            T._ = $.env("templates") + "html/base.tmpl";
            if (T._.match("#") && (!partial || T.include)) {
                if (!(T._ in $.templates)) {
                    $.templates[T._] = $.tmpl($(T._).text());
                }
            } else {
                if (!(T._ in $.templates) && (!partial || T.include)) {
                    $.ajax({url:T._, type:"GET", dataType:"text", async:false, success:function (text) {
                        $.templates[T._] = $.tmpl(text);
                    }, error:function (xhr, status, e) {
                        $.templates[T._] = $.tmpl(xhr.responseText);
                    }});
                }
            }
            if (!partial || T.include) {
                Array.prototype.push.apply(T, $.templates[T._].call(this, jQuery, $.extend({}, $data, this), 0, true, false));
            }
            T._ = null;
            T.push("\n\n");
            (function () {
                var name = "title", tmp, diff1, diff2;
                if (!T.blocks) {
                    T.blocks = $.tmpl.blocks;
                }
                if (!T.blocks[name]) {
                    T.blocks[name] = {start:T.length};
                }
                var B = (function () {
                    var T = [];
                    function pushT(value, _this, encode) {
                        return encode === false ? T.push(typeof value === "function" ? value.call(_this) : value) : T.push($.encode(typeof (value) === "function" ? value.call(_this) : value));
                    }
                    T.push("\nRecords of Existence Events\n");
                    return T;
                })();
                diff1 = T.blocks[name].end ? T.blocks[name].end - T.blocks[name].start : 0;
                Array.prototype.splice.apply(T, [T.blocks[name].start + 1, diff1].concat(B));
                T.blocks[name].end = T.blocks[name].start + B.length;
                diff2 = T.blocks[name].end - T.blocks[name].start;
                for (tmp in T.blocks) {
                    if (T.blocks[tmp].start > T.blocks[name].start) {
                        T.blocks[tmp].start += diff2 - diff1;
                        T.blocks[tmp].end += diff2 - diff1;
                    }
                }
            })();
            T.push("\n\n");
            (function () {
                var name = "main", tmp, diff1, diff2;
                if (!T.blocks) {
                    T.blocks = $.tmpl.blocks;
                }
                if (!T.blocks[name]) {
                    T.blocks[name] = {start:T.length};
                }
                var B = (function () {
                    var T = [];
                    function pushT(value, _this, encode) {
                        return encode === false ? T.push(typeof value === "function" ? value.call(_this) : value) : T.push($.encode(typeof (value) === "function" ? value.call(_this) : value));
                    }
                    T.push("\n<div id='events' >\n    <h3>events</h3>\n    \n    ");
                    if (admin) {
                        T.push("\n    <div style='clear:both;text-align:center;'>\n        <span  class=\"ss_sprite  ss_add\">\n            <a href='");
                        pushT($.env("root") + "admin/add/events/", this);
                        T.push("'>\n            Add event\n            </a>\n        </span><br/>\n        <a id='show_deleted'\n           href='#show/deleted'>\n           show deleted events\n        </a>\n        <span> | </span>\n        <a id='hide_deleted'\n           href='#hide/deleted'>\n           hide deleted events\n        </a>\n    </div>\n    ");
                    }
                    T.push(" \n    \n    <div style='width:auto;overflow-x:auto;'>\n        ");
                    jQuery.each(events, function ($i) {
                        with (this) {
                            T.push("\n        \n        <div class='event column span-5 ");
                            pushT(admin ? "" : "colborder", this);
                            T.push(" ");
                            pushT((this.deleted.length ? "deleted" : ""), this);
                            T.push("'>\n        ");
                            if (admin) {
                                T.push("\n            ");
                                T.include = true;
                                T._ = $.env("templates") + "html/forms/event.tmpl";
                                if (T._.match("#") && (!partial || T.include)) {
                                    if (!(T._ in $.templates)) {
                                        $.templates[T._] = $.tmpl($(T._).text());
                                    }
                                } else {
                                    if (!(T._ in $.templates) && (!partial || T.include)) {
                                        $.ajax({url:T._, type:"GET", dataType:"text", async:false, success:function (text) {
                                            $.templates[T._] = $.tmpl(text);
                                        }, error:function (xhr, status, e) {
                                            $.templates[T._] = $.tmpl(xhr.responseText);
                                        }});
                                    }
                                }
                                if (!partial || T.include) {
                                    Array.prototype.push.apply(T, $.templates[T._].call(this, jQuery, $.extend({}, $data, this), 0, true, false));
                                }
                                T._ = null;
                                T.push("\n        ");
                            } else {
                                T.push("\n            <span>");
                                pushT(this.date, this);
                                T.push("</span>\n            <br/>\n\n                <img \n                    src='");
                                pushT($.env("data") + this.image, this);
                                T.push("'\n                    alt='");
                                pushT(this.title, this);
                                T.push("'\n                    width='60px'\n                />\n            <br/>\n            <strong>");
                                pushT(this.title, this);
                                T.push("</strong>\n            <p>");
                                pushT(this.location, this);
                                T.push("</p>\n            <p>");
                                pushT(this.description, this);
                                T.push("</p>\n        ");
                            }
                            T.push("        \n         </div>\n        \n        ");
                            if (($i + 1) % 4 == 0) {
                                T.push("\n        <div style='margin-top:8em;clear:both;'>\n        <br/>\n        </div>\n        ");
                            }
                            T.push("\n        \n        ");
                        }
                    });
                    T.push("\n    </div>      \n    \n</div>\n");
                    return T;
                })();
                diff1 = T.blocks[name].end ? T.blocks[name].end - T.blocks[name].start : 0;
                Array.prototype.splice.apply(T, [T.blocks[name].start + 1, diff1].concat(B));
                T.blocks[name].end = T.blocks[name].start + B.length;
                diff2 = T.blocks[name].end - T.blocks[name].start;
                for (tmp in T.blocks) {
                    if (T.blocks[tmp].start > T.blocks[name].start) {
                        T.blocks[tmp].start += diff2 - diff1;
                        T.blocks[tmp].end += diff2 - diff1;
                    }
                }
            })();
            T.push("\n");
        }
        catch (e) {
            if ($.tmpl.debug) {
                T.push(" " + e + " ");
            } else {
                T.push("");
            }
        }
    }
    _.data = null;
    return asArray ? T : T.join("");
}

jQuery.templates[jQuery.env("templates")+"html/pages/home.tmpl"]=
function anonymous(jQuery, $data, $i) {
    var $ = jQuery, T = [], asArray = arguments.length > 3 ? arguments[3] : false, partial = arguments.length > 4 ? arguments[4] : false, _ = $.tmpl.filters;
    _.data = T.data = $data;
    _.$i = T.index = $i || 0;
    T._ = null;
    function pushT(value, _this, encode) {
        return encode === false ? T.push(typeof value === "function" ? value.call(_this) : value) : T.push($.encode(typeof (value) === "function" ? value.call(_this) : value));
    }
    with ($.extend(true, {}, _, $data)) {
        try {
            T.push("");
            T._ = $.env("templates") + "html/base.tmpl";
            if (T._.match("#") && (!partial || T.include)) {
                if (!(T._ in $.templates)) {
                    $.templates[T._] = $.tmpl($(T._).text());
                }
            } else {
                if (!(T._ in $.templates) && (!partial || T.include)) {
                    $.ajax({url:T._, type:"GET", dataType:"text", async:false, success:function (text) {
                        $.templates[T._] = $.tmpl(text);
                    }, error:function (xhr, status, e) {
                        $.templates[T._] = $.tmpl(xhr.responseText);
                    }});
                }
            }
            if (!partial || T.include) {
                Array.prototype.push.apply(T, $.templates[T._].call(this, jQuery, $.extend({}, $data, this), 0, true, false));
            }
            T._ = null;
            T.push("\n    \n");
            (function () {
                var name = "title", tmp, diff1, diff2;
                if (!T.blocks) {
                    T.blocks = $.tmpl.blocks;
                }
                if (!T.blocks[name]) {
                    T.blocks[name] = {start:T.length};
                }
                var B = (function () {
                    var T = [];
                    function pushT(value, _this, encode) {
                        return encode === false ? T.push(typeof value === "function" ? value.call(_this) : value) : T.push($.encode(typeof (value) === "function" ? value.call(_this) : value));
                    }
                    T.push("\nRecords of Existence\n");
                    return T;
                })();
                diff1 = T.blocks[name].end ? T.blocks[name].end - T.blocks[name].start : 0;
                Array.prototype.splice.apply(T, [T.blocks[name].start + 1, diff1].concat(B));
                T.blocks[name].end = T.blocks[name].start + B.length;
                diff2 = T.blocks[name].end - T.blocks[name].start;
                for (tmp in T.blocks) {
                    if (T.blocks[tmp].start > T.blocks[name].start) {
                        T.blocks[tmp].start += diff2 - diff1;
                        T.blocks[tmp].end += diff2 - diff1;
                    }
                }
            })();
            T.push("\n\n");
            (function () {
                var name = "main", tmp, diff1, diff2;
                if (!T.blocks) {
                    T.blocks = $.tmpl.blocks;
                }
                if (!T.blocks[name]) {
                    T.blocks[name] = {start:T.length};
                }
                var B = (function () {
                    var T = [];
                    function pushT(value, _this, encode) {
                        return encode === false ? T.push(typeof value === "function" ? value.call(_this) : value) : T.push($.encode(typeof (value) === "function" ? value.call(_this) : value));
                    }
                    T.push("\n<div class=\"span-17 column first\">\n    <div id='welcome'>\n        <h3>welcome</h3>\n        <div class='span-4 push-2 column first colborder'>\n            <img src='");
                    pushT($.env("root") + "images/goldrecord.png", this);
                    T.push("' \n                 alt='records of existence'\n                 style='float:right;'/>\n        </div>\n        <div class='span-9 column last'>\n            <p>\n                 Records of Existence is an artist run label of \n                 underground independent artists.  We specialize \n                 in doing limited edition Hand-Printed and \n                 Hand-Assembled releases to make the release \n                 as unique as the artists.  \n            </p>\n        </div>\n    </div>\n    <div id='recentnews' >\n        <h3>recent <a href='");
                    pushT($.env("root") + "news", this);
                    T.push("'>news</a></h3>\n        <ul class='roe_recent_news'>\n            ");
                    jQuery.each(news, function ($i) {
                        with (this) {
                            T.push("\n            <li>\n               <h4>");
                            pushT(this.title, this);
                            T.push("<br/><em>");
                            pushT(this.date, this);
                            T.push("</em></h4>\n               <p>");
                            pushT(this.description, this);
                            T.push("</p>\n            </li>\n           ");
                        }
                    });
                    T.push("\n        </ul>\n        <a href='");
                    pushT($.env("root") + "news", this);
                    T.push("'>news archives</a>\n    </div>\n</div>\n<div class=\"span-6 column last\">\n    <div id='newreleases'>\n        <h3>new <a href='");
                    pushT($.env("root") + "releases", this);
                    T.push("'>releases</a></h3>\n        <ul>\n            ");
                    jQuery.each(recent, function ($i) {
                        with (this) {
                            T.push("\n            <li>\n                <a href='");
                            pushT($.env("root") + "release/" + this.$id, this);
                            T.push("'>\n                    <span class='small'>");
                            pushT(this.name, this);
                            T.push("</span>\n                    <img src='");
                            pushT($.env("data") + this.image, this);
                            T.push("'\n                         alt='");
                            pushT(this.name, this);
                            T.push("'\n                         height='80px'\n                    />\n                </a>\n                <p>");
                            pushT(this.description.substring(0, 128) + "...", this);
                            T.push("</p>\n                <br/>\n            </li>\n            ");
                        }
                    });
                    T.push("\n         </ul>\n    </div>\n    <div id='upcomingevents'>\n        <h3>upcoming <a href='");
                    pushT($.env("root") + "events", this);
                    T.push("'>events</a></h3>\n        <p><em>click on an event for more information</em></p>\n        <ul>\n            ");
                    jQuery.each(events, function ($i) {
                        with (this) {
                            T.push("\n            <li>\n                <h6 style='color:white;'>");
                            pushT(this.date, this);
                            T.push("</h6>\n                <a href='");
                            pushT($.env("root") + "events", this);
                            T.push("'>\n                    <img\n                        src='");
                            pushT($.env("data") + this.image, this);
                            T.push("'\n                        alt='");
                            pushT(this.title + "  " + this.location, this);
                            T.push("'\n                        title='");
                            pushT(this.title + "  " + this.location, this);
                            T.push("'\n                        height='30px'\n                    />\n                    <span class='small'>");
                            pushT(this.title, this);
                            T.push("</span>\n                </a>\n            </li>\n            ");
                        }
                    });
                    T.push("\n         </ul>\n    </div>\n</div>\n");
                    return T;
                })();
                diff1 = T.blocks[name].end ? T.blocks[name].end - T.blocks[name].start : 0;
                Array.prototype.splice.apply(T, [T.blocks[name].start + 1, diff1].concat(B));
                T.blocks[name].end = T.blocks[name].start + B.length;
                diff2 = T.blocks[name].end - T.blocks[name].start;
                for (tmp in T.blocks) {
                    if (T.blocks[tmp].start > T.blocks[name].start) {
                        T.blocks[tmp].start += diff2 - diff1;
                        T.blocks[tmp].end += diff2 - diff1;
                    }
                }
            })();
            T.push("\n");
        }
        catch (e) {
            if ($.tmpl.debug) {
                T.push(" " + e + " ");
            } else {
                T.push("");
            }
        }
    }
    _.data = null;
    return asArray ? T : T.join("");
}

jQuery.templates[jQuery.env("templates")+"html/pages/news.tmpl"]=
function anonymous(jQuery, $data, $i) {
    var $ = jQuery, T = [], asArray = arguments.length > 3 ? arguments[3] : false, partial = arguments.length > 4 ? arguments[4] : false, _ = $.tmpl.filters;
    _.data = T.data = $data;
    _.$i = T.index = $i || 0;
    T._ = null;
    function pushT(value, _this, encode) {
        return encode === false ? T.push(typeof value === "function" ? value.call(_this) : value) : T.push($.encode(typeof (value) === "function" ? value.call(_this) : value));
    }
    with ($.extend(true, {}, _, $data)) {
        try {
            T.push("");
            T._ = $.env("templates") + "html/base.tmpl";
            if (T._.match("#") && (!partial || T.include)) {
                if (!(T._ in $.templates)) {
                    $.templates[T._] = $.tmpl($(T._).text());
                }
            } else {
                if (!(T._ in $.templates) && (!partial || T.include)) {
                    $.ajax({url:T._, type:"GET", dataType:"text", async:false, success:function (text) {
                        $.templates[T._] = $.tmpl(text);
                    }, error:function (xhr, status, e) {
                        $.templates[T._] = $.tmpl(xhr.responseText);
                    }});
                }
            }
            if (!partial || T.include) {
                Array.prototype.push.apply(T, $.templates[T._].call(this, jQuery, $.extend({}, $data, this), 0, true, false));
            }
            T._ = null;
            T.push("\n\n");
            (function () {
                var name = "title", tmp, diff1, diff2;
                if (!T.blocks) {
                    T.blocks = $.tmpl.blocks;
                }
                if (!T.blocks[name]) {
                    T.blocks[name] = {start:T.length};
                }
                var B = (function () {
                    var T = [];
                    function pushT(value, _this, encode) {
                        return encode === false ? T.push(typeof value === "function" ? value.call(_this) : value) : T.push($.encode(typeof (value) === "function" ? value.call(_this) : value));
                    }
                    T.push("\nRecords of Existence News\n");
                    return T;
                })();
                diff1 = T.blocks[name].end ? T.blocks[name].end - T.blocks[name].start : 0;
                Array.prototype.splice.apply(T, [T.blocks[name].start + 1, diff1].concat(B));
                T.blocks[name].end = T.blocks[name].start + B.length;
                diff2 = T.blocks[name].end - T.blocks[name].start;
                for (tmp in T.blocks) {
                    if (T.blocks[tmp].start > T.blocks[name].start) {
                        T.blocks[tmp].start += diff2 - diff1;
                        T.blocks[tmp].end += diff2 - diff1;
                    }
                }
            })();
            T.push("\n\n");
            (function () {
                var name = "main", tmp, diff1, diff2;
                if (!T.blocks) {
                    T.blocks = $.tmpl.blocks;
                }
                if (!T.blocks[name]) {
                    T.blocks[name] = {start:T.length};
                }
                var B = (function () {
                    var T = [];
                    function pushT(value, _this, encode) {
                        return encode === false ? T.push(typeof value === "function" ? value.call(_this) : value) : T.push($.encode(typeof (value) === "function" ? value.call(_this) : value));
                    }
                    T.push("\n<div id='news' >\n    <h3>news archives</h3>\n    \n    ");
                    if (admin) {
                        T.push("\n    <div style='clear:both;text-align:center;'>\n        <span  class=\"ss_sprite  ss_add\">\n            <a href='");
                        pushT($.env("root") + "admin/add/news/", this);
                        T.push("'>\n            Add news\n            </a>\n        </span><br/>\n        <a id='show_deleted'\n           href='#show/deleted'>\n           show deleted news\n        </a>\n        <span> | </span>\n        <a id='hide_deleted'\n           href='#hide/deleted'>\n           hide deleted news\n        </a>\n    </div>\n    ");
                    }
                    T.push(" \n\n    ");
                    jQuery.each(news, function ($i) {
                        with (this) {
                            T.push("\n    <div class='");
                            pushT((this.deleted.length ? "deleted" : ""), this);
                            T.push("'>\n    ");
                            if (admin) {
                                T.push("\n        ");
                                T.include = true;
                                T._ = $.env("templates") + "html/forms/news.tmpl";
                                if (T._.match("#") && (!partial || T.include)) {
                                    if (!(T._ in $.templates)) {
                                        $.templates[T._] = $.tmpl($(T._).text());
                                    }
                                } else {
                                    if (!(T._ in $.templates) && (!partial || T.include)) {
                                        $.ajax({url:T._, type:"GET", dataType:"text", async:false, success:function (text) {
                                            $.templates[T._] = $.tmpl(text);
                                        }, error:function (xhr, status, e) {
                                            $.templates[T._] = $.tmpl(xhr.responseText);
                                        }});
                                    }
                                }
                                if (!partial || T.include) {
                                    Array.prototype.push.apply(T, $.templates[T._].call(this, jQuery, $.extend({}, $data, this), 0, true, false));
                                }
                                T._ = null;
                                T.push("\n    ");
                            } else {
                                T.push("\n        <h4>");
                                pushT(this.title, this);
                                T.push("</h4> \n        <p>\n            <strong>");
                                pushT(this.date, this);
                                T.push("</strong> \n            <br/>\n            <span>");
                                pushT(this.description, this);
                                T.push("</span>\n        </p>\n    ");
                            }
                            T.push("\n    </div>\n    ");
                        }
                    });
                    T.push("\n</div>\n");
                    return T;
                })();
                diff1 = T.blocks[name].end ? T.blocks[name].end - T.blocks[name].start : 0;
                Array.prototype.splice.apply(T, [T.blocks[name].start + 1, diff1].concat(B));
                T.blocks[name].end = T.blocks[name].start + B.length;
                diff2 = T.blocks[name].end - T.blocks[name].start;
                for (tmp in T.blocks) {
                    if (T.blocks[tmp].start > T.blocks[name].start) {
                        T.blocks[tmp].start += diff2 - diff1;
                        T.blocks[tmp].end += diff2 - diff1;
                    }
                }
            })();
            T.push("\n");
        }
        catch (e) {
            if ($.tmpl.debug) {
                T.push(" " + e + " ");
            } else {
                T.push("");
            }
        }
    }
    _.data = null;
    return asArray ? T : T.join("");
}

jQuery.templates[jQuery.env("templates")+"html/pages/release.tmpl"]=
function anonymous(jQuery, $data, $i) {
    var $ = jQuery, T = [], asArray = arguments.length > 3 ? arguments[3] : false, partial = arguments.length > 4 ? arguments[4] : false, _ = $.tmpl.filters;
    _.data = T.data = $data;
    _.$i = T.index = $i || 0;
    T._ = null;
    function pushT(value, _this, encode) {
        return encode === false ? T.push(typeof value === "function" ? value.call(_this) : value) : T.push($.encode(typeof (value) === "function" ? value.call(_this) : value));
    }
    with ($.extend(true, {}, _, $data)) {
        try {
            T.push("");
            T._ = $.env("templates") + "html/base.tmpl";
            if (T._.match("#") && (!partial || T.include)) {
                if (!(T._ in $.templates)) {
                    $.templates[T._] = $.tmpl($(T._).text());
                }
            } else {
                if (!(T._ in $.templates) && (!partial || T.include)) {
                    $.ajax({url:T._, type:"GET", dataType:"text", async:false, success:function (text) {
                        $.templates[T._] = $.tmpl(text);
                    }, error:function (xhr, status, e) {
                        $.templates[T._] = $.tmpl(xhr.responseText);
                    }});
                }
            }
            if (!partial || T.include) {
                Array.prototype.push.apply(T, $.templates[T._].call(this, jQuery, $.extend({}, $data, this), 0, true, false));
            }
            T._ = null;
            T.push("\n\n");
            (function () {
                var name = "title", tmp, diff1, diff2;
                if (!T.blocks) {
                    T.blocks = $.tmpl.blocks;
                }
                if (!T.blocks[name]) {
                    T.blocks[name] = {start:T.length};
                }
                var B = (function () {
                    var T = [];
                    function pushT(value, _this, encode) {
                        return encode === false ? T.push(typeof value === "function" ? value.call(_this) : value) : T.push($.encode(typeof (value) === "function" ? value.call(_this) : value));
                    }
                    T.push("\nRecords of Existence Release ");
                    pushT(release.name, this);
                    T.push("\n");
                    return T;
                })();
                diff1 = T.blocks[name].end ? T.blocks[name].end - T.blocks[name].start : 0;
                Array.prototype.splice.apply(T, [T.blocks[name].start + 1, diff1].concat(B));
                T.blocks[name].end = T.blocks[name].start + B.length;
                diff2 = T.blocks[name].end - T.blocks[name].start;
                for (tmp in T.blocks) {
                    if (T.blocks[tmp].start > T.blocks[name].start) {
                        T.blocks[tmp].start += diff2 - diff1;
                        T.blocks[tmp].end += diff2 - diff1;
                    }
                }
            })();
            T.push("\n\n");
            (function () {
                var name = "main", tmp, diff1, diff2;
                if (!T.blocks) {
                    T.blocks = $.tmpl.blocks;
                }
                if (!T.blocks[name]) {
                    T.blocks[name] = {start:T.length};
                }
                var B = (function () {
                    var T = [];
                    function pushT(value, _this, encode) {
                        return encode === false ? T.push(typeof value === "function" ? value.call(_this) : value) : T.push($.encode(typeof (value) === "function" ? value.call(_this) : value));
                    }
                    T.push("\n<div id='release'>\n\n    <h3><a href='");
                    pushT($.env("root") + "releases", this);
                    T.push("'>&lt; releases</a></h3>\n    ");
                    if (admin) {
                        T.push("\n        ");
                        T.include = true;
                        T._ = $.env("templates") + "html/forms/release.tmpl";
                        if (T._.match("#") && (!partial || T.include)) {
                            if (!(T._ in $.templates)) {
                                $.templates[T._] = $.tmpl($(T._).text());
                            }
                        } else {
                            if (!(T._ in $.templates) && (!partial || T.include)) {
                                $.ajax({url:T._, type:"GET", dataType:"text", async:false, success:function (text) {
                                    $.templates[T._] = $.tmpl(text);
                                }, error:function (xhr, status, e) {
                                    $.templates[T._] = $.tmpl(xhr.responseText);
                                }});
                            }
                        }
                        if (!partial || T.include) {
                            Array.prototype.push.apply(T, $.templates[T._].call(this, jQuery, $.extend({}, $data, this), 0, true, false));
                        }
                        T._ = null;
                        T.push("\n    ");
                    } else {
                        T.push("\n    <div class='first column span-5 colborder'>\n        <br/><br/>\n        <h4>");
                        pushT(release.name, this);
                        T.push("</h4>\n        <h5>\n            <a href='");
                        pushT($.env("root") + "artist/" + artist.$id, this);
                        T.push("'>\n                ");
                        pushT(artist.name, this);
                        T.push("\n            </a>\n        </h5>\n        <em>Release</em><br/>\n        <span>");
                        pushT(release.label_id, this);
                        T.push("</span> \n        <br/><br/>\n    </div>\n     \n    <div id='cover' \n         class='column span-6 colborder'>\n        <img src='");
                        pushT($.env("data") + release.image, this);
                        T.push("' \n             alt='release image'  \n             height='150px'\n        />\n    </div>\n    <div id='media' \n         class='column span-9'>\n        <ol class='clear'>\n            ");
                        jQuery.each(release.tracks, function (i, title) {
                            with (this) {
                                T.push("\n            <li>\n                <a target='_blank'\n                    href='");
                                pushT($.env("data") + "releases/" + release.$id + "/web/mp3/" + title.substring(0, 2) + ".mp3", this);
                                T.push("'>\n                    ");
                                pushT(title, this);
                                T.push("\n                    <img src='");
                                pushT($.env("root") + "images/audio_bullet.gif", this);
                                T.push("'/>\n                </a>\n            </li>\n            ");
                            }
                        });
                        T.push("\n        </ol>\n    </div>\n    \n    <div class='column span-18 push-3' >\n        <p>");
                        pushT(release.description, this);
                        T.push("</p>\n    </div>\n    ");
                    }
                    T.push("\n    \n    <div  class='column span-22'>\n        <h3> pressings </h3>\n        ");
                    if (admin) {
                        T.push("\n            ");
                        jQuery.each(pressings, function ($i) {
                            with (this) {
                                T.push("\n            ");
                                T.include = true;
                                T._ = $.env("templates") + "html/forms/pressing.tmpl";
                                if (T._.match("#") && (!partial || T.include)) {
                                    if (!(T._ in $.templates)) {
                                        $.templates[T._] = $.tmpl($(T._).text());
                                    }
                                } else {
                                    if (!(T._ in $.templates) && (!partial || T.include)) {
                                        $.ajax({url:T._, type:"GET", dataType:"text", async:false, success:function (text) {
                                            $.templates[T._] = $.tmpl(text);
                                        }, error:function (xhr, status, e) {
                                            $.templates[T._] = $.tmpl(xhr.responseText);
                                        }});
                                    }
                                }
                                if (!partial || T.include) {
                                    Array.prototype.push.apply(T, $.templates[T._].call(this, jQuery, $.extend({}, $data, this), 0, true, false));
                                }
                                T._ = null;
                                T.push("    \n            ");
                            }
                        });
                        T.push("\n            <div style='clear:both;text-align:center;'>\n                <span  class= \"ss_sprite  ss_add\" >\n                    <a href='");
                        pushT($.env("root"), this);
                        T.push("admin/add/pressings/?release=");
                        pushT(release.$id, this);
                        T.push("'>\n                        Add a new pressing\n                    </a>\n                </span>\n            </div>\n        ");
                    } else {
                        T.push("\n            ");
                        jQuery.each(pressings, function ($i) {
                            with (this) {
                                T.push("\n            <div class='pressing span-16'>\n                <div class='first column span-13 prepend-2 colborder'>\n                    <p>");
                                pushT(this.description, this);
                                T.push("</p> \n                </div>\n            </div>\n            <div class='last column small box span-4'>\n                ");
                                T.include = true;
                                T._ = $.env("templates") + "html/forms/paypal.tmpl";
                                if (T._.match("#") && (!partial || T.include)) {
                                    if (!(T._ in $.templates)) {
                                        $.templates[T._] = $.tmpl($(T._).text());
                                    }
                                } else {
                                    if (!(T._ in $.templates) && (!partial || T.include)) {
                                        $.ajax({url:T._, type:"GET", dataType:"text", async:false, success:function (text) {
                                            $.templates[T._] = $.tmpl(text);
                                        }, error:function (xhr, status, e) {
                                            $.templates[T._] = $.tmpl(xhr.responseText);
                                        }});
                                    }
                                }
                                if (!partial || T.include) {
                                    Array.prototype.push.apply(T, $.templates[T._].call(this, jQuery, $.extend({}, $data, this), 0, true, false));
                                }
                                T._ = null;
                                T.push("\n            </div>  \n            ");
                            }
                        });
                        T.push("\n        ");
                    }
                    T.push("\n    </div>\n</div>\n");
                    return T;
                })();
                diff1 = T.blocks[name].end ? T.blocks[name].end - T.blocks[name].start : 0;
                Array.prototype.splice.apply(T, [T.blocks[name].start + 1, diff1].concat(B));
                T.blocks[name].end = T.blocks[name].start + B.length;
                diff2 = T.blocks[name].end - T.blocks[name].start;
                for (tmp in T.blocks) {
                    if (T.blocks[tmp].start > T.blocks[name].start) {
                        T.blocks[tmp].start += diff2 - diff1;
                        T.blocks[tmp].end += diff2 - diff1;
                    }
                }
            })();
            T.push("\n");
        }
        catch (e) {
            if ($.tmpl.debug) {
                T.push(" " + e + " ");
            } else {
                T.push("");
            }
        }
    }
    _.data = null;
    return asArray ? T : T.join("");
}

jQuery.templates[jQuery.env("templates")+"html/pages/releases.tmpl"]=
function anonymous(jQuery, $data, $i) {
    var $ = jQuery, T = [], asArray = arguments.length > 3 ? arguments[3] : false, partial = arguments.length > 4 ? arguments[4] : false, _ = $.tmpl.filters;
    _.data = T.data = $data;
    _.$i = T.index = $i || 0;
    T._ = null;
    function pushT(value, _this, encode) {
        return encode === false ? T.push(typeof value === "function" ? value.call(_this) : value) : T.push($.encode(typeof (value) === "function" ? value.call(_this) : value));
    }
    with ($.extend(true, {}, _, $data)) {
        try {
            T.push("");
            T._ = $.env("templates") + "html/base.tmpl";
            if (T._.match("#") && (!partial || T.include)) {
                if (!(T._ in $.templates)) {
                    $.templates[T._] = $.tmpl($(T._).text());
                }
            } else {
                if (!(T._ in $.templates) && (!partial || T.include)) {
                    $.ajax({url:T._, type:"GET", dataType:"text", async:false, success:function (text) {
                        $.templates[T._] = $.tmpl(text);
                    }, error:function (xhr, status, e) {
                        $.templates[T._] = $.tmpl(xhr.responseText);
                    }});
                }
            }
            if (!partial || T.include) {
                Array.prototype.push.apply(T, $.templates[T._].call(this, jQuery, $.extend({}, $data, this), 0, true, false));
            }
            T._ = null;
            T.push("\n\n");
            (function () {
                var name = "title", tmp, diff1, diff2;
                if (!T.blocks) {
                    T.blocks = $.tmpl.blocks;
                }
                if (!T.blocks[name]) {
                    T.blocks[name] = {start:T.length};
                }
                var B = (function () {
                    var T = [];
                    function pushT(value, _this, encode) {
                        return encode === false ? T.push(typeof value === "function" ? value.call(_this) : value) : T.push($.encode(typeof (value) === "function" ? value.call(_this) : value));
                    }
                    T.push("\nRecords of Existence Releases\n");
                    return T;
                })();
                diff1 = T.blocks[name].end ? T.blocks[name].end - T.blocks[name].start : 0;
                Array.prototype.splice.apply(T, [T.blocks[name].start + 1, diff1].concat(B));
                T.blocks[name].end = T.blocks[name].start + B.length;
                diff2 = T.blocks[name].end - T.blocks[name].start;
                for (tmp in T.blocks) {
                    if (T.blocks[tmp].start > T.blocks[name].start) {
                        T.blocks[tmp].start += diff2 - diff1;
                        T.blocks[tmp].end += diff2 - diff1;
                    }
                }
            })();
            T.push("\n    \n");
            (function () {
                var name = "main", tmp, diff1, diff2;
                if (!T.blocks) {
                    T.blocks = $.tmpl.blocks;
                }
                if (!T.blocks[name]) {
                    T.blocks[name] = {start:T.length};
                }
                var B = (function () {
                    var T = [];
                    function pushT(value, _this, encode) {
                        return encode === false ? T.push(typeof value === "function" ? value.call(_this) : value) : T.push($.encode(typeof (value) === "function" ? value.call(_this) : value));
                    }
                    T.push("\n<div id='releases'>\n    <h3>releases</h3>\n    ");
                    if (admin) {
                        T.push("\n    <div style='clear:both;text-align:center;'>\n        <span  class=\"ss_sprite  ss_add\">\n            <a href='");
                        pushT($.env("root") + "artists?admin", this);
                        T.push("'>\n            Add release (via artist)\n            </a>\n        </span><br/>\n        <a id='show_deleted'\n           href='#show/deleted'>\n           show deleted releases\n        </a>\n        <span> | </span>\n        <a id='hide_deleted'\n           href='#hide/deleted'>\n           hide deleted releases\n        </a>\n    </div>\n    ");
                    }
                    T.push(" \n    \n    <div class='first column span-7 '>\n        <ul>\n            ");
                    jQuery.each(_(releases).every_third_from(0), function ($i) {
                        with (this) {
                            T.push("\n            <li>\n                <div class='span-7  ");
                            pushT(this.deleted.length ? "deleted" : "", this);
                            T.push("'>\n                    ");
                            if (admin) {
                                T.push("  \n                    \n                        <span class=\"ss_sprite  ss_comment_edit\">\n                            <a href='");
                                pushT($.env("root"), this);
                                T.push("release/");
                                pushT(this.$id, this);
                                T.push("?admin'>\n                                | edit release \n                            </a>\n                            <br/>\n                        </span>\n                        \n                        <span class= \"ss_sprite  ss_delete\">\n                            <a href='");
                                pushT($.env("root"), this);
                                T.push("admin/");
                                pushT((this.deleted.length ? "restore" : "remove"), this);
                                T.push("/releases/");
                                pushT(this.$id, this);
                                T.push("'>\n                                 | ");
                                pushT((this.deleted.length ? "restore" : "remove"), this);
                                T.push(" release \n                            </a>\n                            <br>\n                        </span>\n                    ");
                            }
                            T.push("\n                    <a href='");
                            pushT($.env("root"), this);
                            T.push("release/");
                            pushT(this.$id, this);
                            T.push("'\n                       style=''>\n                       <img\n                            src='");
                            pushT($.env("data") + this.image, this);
                            T.push("'\n                            alt='");
                            pushT(this.name, this);
                            T.push("' \n                            height='100px'\n                        />\n                        <br/>\n                        <span class='quiet small'>release # ");
                            pushT(this.label_id, this);
                            T.push("</span>\n                    </a>\n                    <strong>");
                            pushT(this.name, this);
                            T.push("</strong>\n                    <br/>\n                    <span>");
                            pushT(this.description.substring(0, 128), this);
                            T.push("...</span>\n                </div>\n            </li>\n            ");
                        }
                    });
                    T.push("\n        </ul>\n    </div>\n    <div class=\"column span-7\">\n        <ul>\n            ");
                    jQuery.each(_(releases).every_third_from(1), function ($i) {
                        with (this) {
                            T.push("\n            <li>\n                <div class='span-7  ");
                            pushT(this.deleted.length ? "deleted" : "", this);
                            T.push("'>\n                    ");
                            if (admin) {
                                T.push("  \n                    \n                        <span class=\"ss_sprite  ss_comment_edit\">\n                            <a href='");
                                pushT($.env("root"), this);
                                T.push("release/");
                                pushT(this.$id, this);
                                T.push("?admin'>\n                                | edit release \n                            </a>\n                            <br/>\n                        </span>\n                        \n                        <span class= \"ss_sprite  ss_delete\">\n                            <a href='");
                                pushT($.env("root"), this);
                                T.push("admin/");
                                pushT((this.deleted.length ? "restore" : "remove"), this);
                                T.push("/releases/");
                                pushT(this.$id, this);
                                T.push("'>\n                                 | ");
                                pushT((this.deleted.length ? "restore" : "remove"), this);
                                T.push(" release \n                            </a>\n                            <br/>\n                        </span>\n                    ");
                            }
                            T.push("\n                    <a href='");
                            pushT($.env("root"), this);
                            T.push("release/");
                            pushT(this.$id, this);
                            T.push("'\n                       style=''>\n                       <img\n                            src='");
                            pushT($.env("data") + this.image, this);
                            T.push("'\n                            alt='");
                            pushT(this.name, this);
                            T.push("' \n                            height='100px'\n                        />\n                        <br/>\n                        <span class='quiet small'>release # ");
                            pushT(this.label_id, this);
                            T.push("</span>\n                    </a>\n                    <strong>");
                            pushT(this.name, this);
                            T.push("</strong>\n                    <br/>\n                    <span>");
                            pushT(this.description.substring(0, 128), this);
                            T.push("...</span>\n                </div>\n            </li>\n            ");
                        }
                    });
                    T.push("\n        </ul>\n    </div>\n    <div class='last column span-7'>\n        <ul>\n            ");
                    jQuery.each(_(releases).every_third_from(2), function ($i) {
                        with (this) {
                            T.push("\n            <li>\n                <div class='span-7  ");
                            pushT(this.deleted.length ? "deleted" : "", this);
                            T.push("'>\n                    ");
                            if (admin) {
                                T.push("  \n                    \n                        <span class=\"ss_sprite  ss_comment_edit\">\n                            <a href='");
                                pushT($.env("root"), this);
                                T.push("release/");
                                pushT(this.$id, this);
                                T.push("?admin'>\n                                | edit release \n                            </a>\n                            <br/>\n                        </span>\n                        \n                        <span class= \"ss_sprite  ss_delete\">\n                            <a href='");
                                pushT($.env("root"), this);
                                T.push("admin/");
                                pushT((this.deleted.length ? "restore" : "remove"), this);
                                T.push("/releases/");
                                pushT(this.$id, this);
                                T.push("'>\n                                 | ");
                                pushT((this.deleted.length ? "restore" : "remove"), this);
                                T.push(" release \n                            </a>\n                            <br/>\n                        </span>\n                    ");
                            }
                            T.push("\n                    <a href='");
                            pushT($.env("root"), this);
                            T.push("release/");
                            pushT(this.$id, this);
                            T.push("'\n                       style=''>\n                       <img\n                            src='");
                            pushT($.env("data") + this.image, this);
                            T.push("'\n                            alt='");
                            pushT(this.name, this);
                            T.push("' \n                            height='100px'\n                        />\n                        <br/>\n                        <span class='quiet small'>release # ");
                            pushT(this.label_id, this);
                            T.push("</span>\n                    </a>\n                    <strong>");
                            pushT(this.name, this);
                            T.push("</strong>\n                    <br/>\n                    <span>");
                            pushT(this.description.substring(0, 128), this);
                            T.push("...</span>\n                </div>\n            </li>\n            ");
                        }
                    });
                    T.push("\n        </ul>\n    </div>\n</div>\n");
                    return T;
                })();
                diff1 = T.blocks[name].end ? T.blocks[name].end - T.blocks[name].start : 0;
                Array.prototype.splice.apply(T, [T.blocks[name].start + 1, diff1].concat(B));
                T.blocks[name].end = T.blocks[name].start + B.length;
                diff2 = T.blocks[name].end - T.blocks[name].start;
                for (tmp in T.blocks) {
                    if (T.blocks[tmp].start > T.blocks[name].start) {
                        T.blocks[tmp].start += diff2 - diff1;
                        T.blocks[tmp].end += diff2 - diff1;
                    }
                }
            })();
            T.push("\n");
        }
        catch (e) {
            if ($.tmpl.debug) {
                T.push(" " + e + " ");
            } else {
                T.push("");
            }
        }
    }
    _.data = null;
    return asArray ? T : T.join("");
}
