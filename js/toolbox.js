
//--------------------------- gestion des requêtes XMLHTTPRequest ---------------------------

function createRequest()
{
    var xhttp = false;

    if (window.XMLHttpRequest) // Mozilla, Safari,...
        xhttp = new XMLHttpRequest();
        //if (xhttp.overrideMimeType) xhttp.overrideMimeType('text/xml');
	else if (window.ActiveXObject) // IE
		xhttp = new ActiveXObject("Microsoft.XMLHTTP");

    if( !xhttp )
		alert('Abandon :( Impossible de créer une instance XMLHTTP');

    return xhttp;
}

function sendRequestPOST(request, url, arg, callbackfunc)
{
	if( callbackfunc != null ) request.onreadystatechange = callbackfunc;
	request.open( 'POST', url, callbackfunc != null );
	request.setRequestHeader( 'Content-Type','application/x-www-form-urlencoded' );
	request.send( arg );
}

function sendRequestGET(request, url, arg, callbackfunc)
{
	var str = url;
	if( arg != null ) str += '?' + arg;

	if( callbackfunc != null ) request.onreadystatechange = callbackfunc;

    request.open( 'GET', str, callbackfunc != null );
    request.send( null );
}

function argsPOST( args )
{
	var strs = [];
	for( name in args )
		strs.push( name + '=' + encodeCgiArg( args[ name ] ) );
	
	return strs.join( '\n' ) + '\n';
}

function argsGET( args )
{
	var strs = [];
	for( name in args )
		strs.push( name + '=' + encodeCgiArg( args[ name ] ) );
	
	return strs.join( '&' );
}

//--------------------------- XSLT methods ---------------------------

function loadTextDoc( name )
{
	var req = createRequest();
	sendRequestGET( req, name );
	return req.status == 200 ? req.responseText : '';
}

function loadXMLDoc( name )
{
	var req = createRequest();
	sendRequestGET( req, name );
	return req.responseXML;
}

function displayResult( element, xmldoc, xsldoc )
{
	var xml = loadXMLDoc( xmldoc );
	var xsl = loadXMLDoc( xsldoc );

	if (window.ActiveXObject)
	{
		// code for IE
		element.innerHTML = xml.transformNode( xsl );
	}
	else if (document.implementation && document.implementation.createDocument)
	{
		// code for Mozilla, Firefox, Opera, etc.
		var xsltProcessor = new XSLTProcessor();
		xsltProcessor.importStylesheet( xsl );
		var resultDocument = xsltProcessor.transformToFragment( xml, document );
		element.appendChild( resultDocument );
	}
}

//--------------------------- HTML entities encoding ---------------------------
function encodeCgiArg( str )
{
	if( typeof str != 'string' ) return str;

	str = str.replace(/à/g,'&agrave;');
	str = str.replace(/À/g,'&Agrave;');
	str = str.replace(/â/g,'&acirc;');
	str = str.replace(/é/g,'&eacute;');
	str = str.replace(/É/g,'&Eacute;');
	str = str.replace(/è/g,'&egrave;');
	str = str.replace(/ê/g,'&ecirc;');
	str = str.replace(/Ê/g,'&Ecirc;');
	str = str.replace(/î/g,'&icirc;');
	str = str.replace(/Î/g,'&Icirc;');
	str = str.replace(/ô/g,'&ocirc;');
	str = str.replace(/û/g,'&ucirc;');
	str = str.replace(/ù/g,'&ugrave;');
	str = str.replace(/ç/g,'&ccedil;');
	str = str.replace(/</g,'&lt;');
	str = str.replace(/œ/g,'&oelig;');
	str = str.replace(/æ/g,'&aelig;');

	str = str.replace(/ /g,'%20');
	str = str.replace(/\r\n/g,'%0A');
	str = str.replace(/\n/g,'%0A');
	str = str.replace(/&/g,'%26');
	str = str.replace(/\+/g,'%2B');
	str = str.replace(/\*/g,'%2A');
	str = str.replace(/\=/g,'%3D');

	return str;
}

//--------------------------- URL parsing ---------------------------

function getArgs()
{
	var args = {};
	var url = document.location.href;
	var cgiargs;
	if( cgiargs = /\?#(.+)$/.exec( url ) )
	{
		cgiargs[1].split( '&' ).forEach( function( item ) {
			var capt;
			if( capt = /(\w+)=(.+)/.exec( item ) )
			{
				var key = capt[1];
				var value = capt[2].replace( /%(\d\d)/g, function( chr, num ){ return String.fromCharCode( parseInt( num, 16 ) ) } );
				var firstChar = value.substr( 0, 1 );
				args[ key ] = ( firstChar == '[' || firstChar == '{' ) ? JSON.parse( value ) : value;
			}
		} );
	}
	return args;
}

//--------------------------- dynamically load a JS file ---------------------------

function loadJS( file )
{
	var req = createRequest();
	sendRequestGET( req, 'js/' + file + '.js' );
	if (req.readyState == 4 && req.status == 200)
	{
		try {
			eval( req.responseText );
		} catch (e) {
			alert( 'Exception when parsing JS file:\n\tjs/' + file + '.js' );
		}
	}
}
	
//--------------------------- page data access ---------------------------

function $(id) {
	var it = window[ id ];
	if( it )
	{
		//alert( id + ' exists in window' );
		var type = typeof it;
		if( type == 'object' )
		{
			//alert( id + ' is an Object' );
			var str = it.toString();
			if( str != '[object Window]' )
			{
				//alert( id + ' and not a window' );
				return it;
			}
		}
	}
	it = document.getElementById(id);
	//alert( it );
	return document.getElementById(id);
}

function getEvent(evnt) { if(evnt == undefined) return window.event; return evnt; }
function getTarget(evnt) { if (evnt.target) return evnt.target; return evnt.srcElement; }

//--------------------------- debug tracer ---------------------------

function trace( text )
{
	var elem = $('trace');
	if( elem == null )
	{
		elem = document.createElement( 'div' );
		elem.id = 'trace';
		document.body.appendChild( elem );
		elem.innerHTML = '<input type="button" value="Clear"><input type="button" value="Remove"><br><textarea cols="160" rows="30" spellcheck="false"></textarea>';
		addEvntListener( elem.firstChild, 'click', function(){ $('trace').lastChild.textContent = ''; });
		addEvntListener( elem.firstChild.nextSibling, 'click', function(){ document.body.removeChild( $('trace') ); });
	}
	elem.lastChild.textContent += text + '\n';
}

/* This is much faster than using (el.innerHTML = str) when there are many
existing descendants, because in some browsers, innerHTML spends much longer
removing existing elements than it does creating new ones.
syntax: el = replaceHtml( el, html )

source:  http://blog.stevenlevithan.com/archives/faster-than-innerhtml
*/

function replaceHtml( el, html )
{
	var oldEl = typeof el === "string" ? document.getElementById(el) : el;
	var newEl = oldEl.cloneNode(false);
	// Replace the old with the new
	newEl.innerHTML = html;
	oldEl.parentNode.replaceChild(newEl, oldEl);
	/* Since we just removed the old element from the DOM, return a reference
	to the new element, which can be used to restore variable references. */
	return newEl;
}

function emptyElement( el )
{
	while( el.firstChild != null )
		el.removeChild( el.firstChild );
}

//--------------------------- events management ---------------------------

function addListener( obj, type, func )
{
	if( obj.eventsFunc == null ) obj.eventsFunc = {};
	obj.eventsFunc.type = func;
	obj.addEventListener( type, func, false );
}

function removeListener( obj, type )
{
	obj.removeEventListener( type, obj.eventsFunc.type, false );
	delete obj.eventsFunc.type;
}

// portable event setup
function addEvntListener( el, type, func )
{
	if( el.addEventListener )
		el.addEventListener( type, func, false );
	else if (el.attachEvent)
		el.attachEvent('on' + type, func );
}

//--------------------------- Local storage ---------------------------

(function() {
	localStore = {
		show:function( base )
		{
			if( ! base ) base = '';
			var baselen = base.length;

			var store = localStorage;
			var str = '';
			for( var i=0; i<store.length; i++)
			{
				var key = store.key( i );
				if( key.substr( 0, baselen ) == base )
					str += key + ' : ' + store.getItem( key ).length + '\n';
			}
			alert( str );
		},
		clear:function( base )
		{
			var baselen = base.length;

			var store = localStorage;
			for( var i=store.length-1; i>= 0; i--)
			{
				var key = store.key( i );
				if( key.substr( 0, baselen ) == base )
					store.removeItem( key );
			}
		},
		clearall:function()
		{
			if( confirm( 'Really completely empty LocalStorage ?' ) )
				localStorage.clear();
		}
	};
})();

function hasIndexedDB()
{
	return window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB ? true : false;
}

function hasWebSQL()
{
	return window.openDatabase;
}

//--------------------------- Oriented object extensions ---------------------------

function inheritFrom(ClassB, ClassA)
{
	for (sProperty in ClassA) {
		ClassB[sProperty] = ClassA[sProperty];
	}
}

function getTime()
{
	return (new Date()).getTime();
}

// returns -1 if a < b, +1 if a > b, 0 if equal. Try to compare numerically if both are numbers, or strings containing numbers
function cmp( a, b )
{
	if( a == undefined ) a = '';		// replace undefined (not sortable) by an empty string
	if( b == undefined ) b = '';
	var ai = ( typeof a == 'number' ) ? a : parseInt( a );	// try to extract a numerical value
	var bi = ( typeof b == 'number' ) ? b : parseInt( b );
	if( !isNaN( ai ) && !isNaN( bi ) )
		return ai < bi ? -1 : ai > bi ? 1 : 0;
	else
		return a < b ? -1 : a > b ? 1 : 0;
}

function cmpobj( a, b, crits )
{
	var res = 0;
	for( var i=0; i < crits.length; i++ )
	{
		var crit = crits[ i ];
		res = cmp( a[ crit ], b[ crit ] );
		if( res ) break;
	}
	return res;
}

// returns the list of keys of an object
function objKeys( obj )
{
	var keys = [];
	for( var i in obj)
		if (obj.hasOwnProperty(i))
			keys.push(i);
	return keys;
}

// make a complete copy of a structure
function deepCopy( obj )
{
	if( Object.prototype.toString.call( obj ) === '[object Array]')
	{
		var out = [];
		for( var i = 0; i < obj.length; i++ )
			out[ i ] = deepCopy( obj[ i ] );
		return out;
	}
	if( typeof obj === 'object' )
	{
		var out = {}
		for ( var i in obj )
			out[ i ] = deepCopy( obj[ i ] );
		return out;
	}
	return obj;
}

// simple json-like serialization for trace dump (no handling of embedded ")
function toStr( obj, pretty, maxdepth, path, refs )
{
	var extarr = function( arr, arg ) { var newa = deepCopy( arr ); newa.push( arg ); return newa; }

	if( maxdepth == undefined ) maxdepth = 2;
	if( path == undefined ) path = [];
	if( refs == undefined ) refs = {};
	if( refs[ obj ] ) return refs[ obj ];
	if( path.length > maxdepth ) return '* too deep *';
	refs[ obj ] = '*' + path.join('>') + '*';

	var tabs = '';
	for( var i=0; i<path.length; i++ ) tabs += '\t';

	var str = '';
	if( Object.prototype.toString.call( obj ) === '[object Array]')
	{
		var out = [];
		for( var i = 0; i < obj.length; i++ )
			out.push( toStr( obj[ i ], pretty, maxdepth, extarr( path, i ), refs ) );
		if( pretty )
			str += '[\n\t' + tabs + out.join( ',\n\t' + tabs + '\t' ) + '\n' + tabs + ']';
		else
			str += '[' + out.join( ',' ) + ']';
	}
	else if( typeof obj == 'object' )
	{
		var out = []
		for ( var i in obj )
			out.push( '"' + i + '":' + toStr( obj[ i ], pretty, maxdepth, extarr( path, i ), refs ) );
		if( pretty )
			str += '{\n\t' + tabs + out.join( ',\n\t' + tabs ) + '\n' + tabs + '}';
		else
			str += '{' + out.join( ',' ) + '}';
	}
	else if( typeof obj == 'function' )
	{
		str += '* function *';
	}
	else if( obj == undefined )
	{
		str += 'undefined';
	}
	else
		str += obj.toString();
		
	return str;
}		

