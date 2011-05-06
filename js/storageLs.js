
/* Creates the symbols BookLs and BookDb to abstract storage details
 * into respectively LocalStorage and IndexedDB
 */

//-------------------------------- Local Storage -------------------------------------------

/* All stored data are in JSON stringified form
 * The storage structure is:
 * - the list of book is in 'Gamebooks / BookIndex'
 * - each book description is in 'Gamebooks / ' + bookName + ' / Book'
 * - the list of media for a book is in 'Gamebooks / ' + bookName + ' / MediaIndex'
 * - each media is in 'Gamebooks / ' + bookName + ' / Media / ' + mediaName
 * - the list of sections for a book is in 'Gamebooks / ' + bookName + ' / TextIndex'
 * - each media is in 'Gamebooks / ' + bookName + ' / Text / ' + textId
 * - the saved states are in 'GameBooks / ' + bookName + ' / State'
 */

(function() {

	var store = localStorage;

	BookLs = {
		type:'LocalStorage',
		initLocal:function( cb )
		{
			if( store )
				cb();
			else
				alert( "Sorry, can't run.\n\nNo IndexedDB nor LocalStorage support in your browser.\nPlease find a decent one (hint: anyone but IE)." );
		},

		clearAll:function( cb )
		{
			setTimeout( function() {
				localStore.clear( 'Gamebooks / ' );
				cb();
			}, 0 );
		},

		getBookList:function( cb )
		{
			var str = store.getItem( 'Gamebooks / BookIndex' );
			var books = [];
			if( str ) books = JSON.parse( str );

			var bookList = {};
			books.forEach( function( book ){
				bookList[ book ] = JSON.parse( store.getItem( 'Gamebooks / ' + book + ' / Book' ) );
			});

			setTimeout( function(){ cb( bookList ) }, 0 );
		},

		addBook:function( bookData, cb )
		{
			// store all media
			var mediaindex = [];
			for( var key in bookData.media )
			{
				store.setItem( 'Gamebooks / ' + bookData.title + ' / Media / ' + key, JSON.stringify( bookData.media[ key ] ) );
				mediaindex.push( key );
			}
			store.setItem( 'Gamebooks / ' + bookData.title + ' / MediaIndex', JSON.stringify( mediaindex ) );
			delete bookData.media;

			// store all text
			var textindex = [];
			for( var key in bookData.text )
			{
				store.setItem( 'Gamebooks / ' + bookData.title + ' / Text / ' + key, JSON.stringify( bookData.text[ key ] ) );
				textindex.push( key );
			}
			store.setItem( 'Gamebooks / ' + bookData.title + ' / TextIndex', JSON.stringify( textindex ) );
			delete bookData.text;

			// store the book metadata
			store.setItem( 'Gamebooks / ' + bookData.title + ' / Book', JSON.stringify( bookData ) );

			// add the book to the book list
			var str = store.getItem( 'Gamebooks / BookIndex' );
			var booklist = [];
			if( str ) booklist = JSON.parse( str );
			booklist.push( bookData.title );
			store.setItem( 'Gamebooks / BookIndex', JSON.stringify( booklist ) );

			setTimeout( cb, 0 );
		},

		serializeBook:function( bookName, withMedia, cb )
		{
			var bookdata = JSON.parse( store.getItem( 'Gamebooks / ' + bookName + ' / Book' ) );

			var textindex = JSON.parse( store.getItem( 'Gamebooks / ' + bookName + ' / TextIndex' ) );
			bookdata.text = {};
			textindex.forEach( function( id ){ bookdata.text[ id ] = JSON.parse( store.getItem( 'Gamebooks / ' + bookName + ' / Text / ' + id ) ); });

			if( withMedia )
			{
				var mediaindex = JSON.parse( store.getItem( 'Gamebooks / ' + bookName + ' / MediaIndex' ) );
				bookdata.media = {};
				mediaindex.forEach( function( id ){ bookdata.media[ id ] = JSON.parse( store.getItem( 'Gamebooks / ' + bookName + ' / Media / ' + id ) ); });
			}

			setTimeout( function(){ cb( bookdata ) }, 0 );
		},

		delBook:function( bookName, cb )
		{
			var mediaindex = JSON.parse( store.getItem( 'Gamebooks / ' + bookName + ' / MediaIndex' ) );
			mediaindex.forEach( function( id ){ store.removeItem( 'Gamebooks / ' + bookName + ' / Media / ' + id ); });
			store.removeItem( 'Gamebooks / ' + bookName + ' / MediaIndex' );

			var textindex = JSON.parse( store.getItem( 'Gamebooks / ' + bookName + ' / TextIndex' ) );
			textindex.forEach( function( id ){ store.removeItem( 'Gamebooks / ' + bookName + ' / Text / ' + id ); });
			store.removeItem( 'Gamebooks / ' + bookName + ' / TextIndex' );

			store.removeItem( 'Gamebooks / ' + bookName + ' / Book' );

			// remove book from local index
			var booklist = JSON.parse( store.getItem( 'Gamebooks / BookIndex' ) );
			booklist = booklist.filter( function( name ){ return name != bookName; } );
			store.setItem( 'Gamebooks / BookIndex', JSON.stringify( booklist ) );

			if( cb ) setTimeout( cb, 0 );
		},

		updateBook:function( bookData )
		{
		},

		getMediaList:function( bookName, cb )
		{
			var mediaindex = JSON.parse( store.getItem( 'Gamebooks / ' + bookName + ' / MediaIndex' ) );
			setTimeout( function(){
				cb( mediaindex )
			}, 0 );
		},

		getMedia:function( bookName, mediaName, cb )
		{
			var str = store.getItem( 'Gamebooks / ' + bookName + ' / Media / ' + mediaName );
			if( str )
				setTimeout( function(){ cb( JSON.parse( str ) ) }, 0 );
			else
				alert( "Sorry, can't find the media you're looking for" );
		},

		addMedia:function( bookName, mediaName, mediaData, cb )
		{
			var str = store.getItem( 'Gamebooks / ' + bookName + ' / Media / ' + mediaName );
			if( !str )
			{
				store.setItem( 'Gamebooks / ' + bookName + ' / Media / ' + mediaName, JSON.stringify( mediaData ) );

				var mediaindex = JSON.parse( store.getItem( 'Gamebooks / ' + bookName + ' / MediaIndex' ) );
				mediaindex.push( mediaName );
				store.setItem( 'Gamebooks / ' + bookName + ' / MediaIndex', JSON.stringify( mediaindex ) );
				if( cb ) setTimeout( cb, 0 );
			}
			else
				alert( 'Tried to create a section "' + textId + '" but it already exists' );
		},

		updateMedia:function( bookName, mediaName, mediaData, cb )
		{
			var str = store.getItem( 'Gamebooks / ' + bookName + ' / Media / ' + mediaName );
			if( str )
			{
				store.setItem( 'Gamebooks / ' + bookName + ' / Media / ' + mediaName, JSON.stringify( mediaData ) );
				if( cb ) setTimeout( cb, 0 );
			}
			else
				alert( 'Can\'t update unexisting media "' + mediaName + '"' );
		},

		removeMedia:function( bookName, mediaName, cb )
		{
			var str = store.getItem( 'Gamebooks / ' + bookName + ' / Media / ' + mediaName );
			if( str )
			{
				store.removeItem( 'Gamebooks / ' + bookName + ' / Media / ' + mediaName );
				var mediaindex = JSON.parse( store.getItem( 'Gamebooks / ' + bookName + ' / MediaIndex' ) );
				mediaindex = mediaindex.filter( function( name ){ return name != mediaName; } );
				store.setItem( 'Gamebooks / ' + bookName + ' / MediaIndex', JSON.stringify( mediaindex ) );

				if( cb ) setTimeout( cb, 0 );
			}
			else
				alert( 'Media "' + mediaName + '" doesn\'t exist' );
		},

		getTextList:function( bookName, cb )
		{
			var textindex = JSON.parse( store.getItem( 'Gamebooks / ' + bookName + ' / TextIndex' ) );
			setTimeout( function(){
				cb( textindex )
			}, 0 );
		},

		getText:function( bookName, textId, cb )
		{
			var str = store.getItem( 'Gamebooks / ' + bookName + ' / Text / ' + textId );
			if( str )
				setTimeout( function(){ cb( JSON.parse( str ) ) }, 0 );
			else
				alert( "Sorry, can't find the section you're looking for" );
		},

		addText:function( bookName, textId, textData, cb )
		{
			var str = store.getItem( 'Gamebooks / ' + bookName + ' / Text / ' + textId );
			if( !str )
			{
				store.setItem( 'Gamebooks / ' + bookName + ' / Text / ' + textId, JSON.stringify( textData ) );

				var textlist = JSON.parse( store.getItem( 'Gamebooks / ' + bookName + ' / TextIndex' ) );
				textlist.push( textId );
				store.setItem( 'Gamebooks / ' + bookName + ' / TextIndex', JSON.stringify( textlist ) );
				if( cb ) setTimeout( cb, 0 );
			}
			else
				alert( 'Tried to create a section "' + textId + '" but it already exists' );
		},

		updateText:function( bookName, textId, textData, cb )
		{
			var str = store.getItem( 'Gamebooks / ' + bookName + ' / Text / ' + textId );
			if( str )
			{
				store.setItem( 'Gamebooks / ' + bookName + ' / Text / ' + textId, JSON.stringify( textData ) );
				if( cb ) setTimeout( cb, 0 );
			}
			else
				alert( 'Can\'t update unexisting section "' + textId + '"' );
		},

		removeText:function( bookName, textId, cb )
		{
			var str = store.getItem( 'Gamebooks / ' + bookName + ' / Text / ' + textId );
			if( str )
			{
				store.removeItem( 'Gamebooks / ' + bookName + ' / Text / ' + textId );
				var textindex = JSON.parse( store.getItem( 'Gamebooks / ' + bookName + ' / TextIndex' ) );
				textindex = textindex.filter( function( id ){ return id != textId; } );
				store.setItem( 'Gamebooks / ' + bookName + ' / TextIndex', JSON.stringify( textindex ) );

				if( cb ) setTimeout( cb, 0 );
			}
			else
				alert( 'Section "' + textId + '" doesn\'t exist' );
		},

		saveState:function( bookName, stateData, cb )
		{
			store.setItem( 'GameBooks / ' + bookName + ' / State', JSON.stringify( stateData ) );
			if( cb ) setTimeout( cb, 0 );
		},

		loadState:function( bookName, cb )
		{
			var state = store.getItem( 'GameBooks / ' + bookName + ' / State' );
			setTimeout( function(){ cb( JSON.parse( state ) ) }, 0 );
		},

		removeState:function( bookName, cb )
		{
			store.removeItem( 'GameBooks / ' + bookName + ' / State' );
			if( cb ) setTimeout( cb, 0 );
		}
	};
})();
