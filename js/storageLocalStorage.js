
//-------------------------------- Local Storage -------------------------------------------

/* All stored data are in JSON stringified form
 * The storage structure is:
 * - the list of book is in 'Gamebooks / BookIndex'
 * - each book description is in 'Gamebooks / ' + bookId + ' / Book'
 * - the list of media for a book is in 'Gamebooks / MediaIndex'
 * - each media is in 'Gamebooks / Media / ' + mediaName
 * - the list of sections for a book is in 'Gamebooks / ' + bookId + ' / TextIndex'
 * - each media is in 'Gamebooks / ' + bookId + ' / Text / ' + textId
 * - the saved states are in 'GameBooks / ' + bookId + ' / State'
 */

(function() {

	var store = localStorage;

	BookLocalStorage = {
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

		addBook:function( bookId, bookData, cb )
		{
			// store all text
			var textindex = [];
			for( var key in bookData.text )
			{
				store.setItem( 'Gamebooks / ' + bookId + ' / Text / ' + key, JSON.stringify( bookData.text[ key ] ) );
				textindex.push( key );
			}
			store.setItem( 'Gamebooks / ' + bookId + ' / TextIndex', JSON.stringify( textindex ) );
			delete bookData.text;

			// store the book metadata
			store.setItem( 'Gamebooks / ' + bookId + ' / Book', JSON.stringify( bookData ) );

			// add the book to the book list
			var str = store.getItem( 'Gamebooks / BookIndex' );
			var booklist = [];
			if( str ) booklist = JSON.parse( str );
			booklist.push( bookId );
			store.setItem( 'Gamebooks / BookIndex', JSON.stringify( booklist ) );

			setTimeout( cb, 0 );
		},

		serializeBook:function( bookId, cb )
		{
			var bookdata = JSON.parse( store.getItem( 'Gamebooks / ' + bookId + ' / Book' ) );

			var textindex = JSON.parse( store.getItem( 'Gamebooks / ' + bookId + ' / TextIndex' ) );
			bookdata.text = {};
			textindex.forEach( function( id ){ bookdata.text[ id ] = JSON.parse( store.getItem( 'Gamebooks / ' + bookId + ' / Text / ' + id ) ); });

			setTimeout( function(){ cb( bookdata ) }, 0 );
		},

		delBook:function( bookId, cb )
		{
			var textindex = JSON.parse( store.getItem( 'Gamebooks / ' + bookId + ' / TextIndex' ) );
			textindex.forEach( function( id ){ store.removeItem( 'Gamebooks / ' + bookId + ' / Text / ' + id ); });
			store.removeItem( 'Gamebooks / ' + bookId + ' / TextIndex' );

			store.removeItem( 'Gamebooks / ' + bookId + ' / Book' );

			// remove book from local index
			var booklist = JSON.parse( store.getItem( 'Gamebooks / BookIndex' ) );
			booklist = booklist.filter( function( name ){ return name != bookId; } );
			store.setItem( 'Gamebooks / BookIndex', JSON.stringify( booklist ) );

			if( cb ) setTimeout( cb, 0 );
		},

		updateBook:function( bookId, bookData )
		{
		},

		getMediaList:function( cb )
		{
			var mediaindex = JSON.parse( store.getItem( 'Gamebooks / MediaIndex' ) );
			setTimeout( function(){
				cb( mediaindex )
			}, 0 );
		},

		getMedia:function( mediaId, cb )
		{
			var str = store.getItem( 'Gamebooks / Media / ' + mediaId );
			if( str )
				setTimeout( function(){ cb( JSON.parse( str ) ) }, 0 );
			else
				alert( "Sorry, can't find the media you're looking for" );
		},

		testMedia:function( mediaId, cb )
		{
			cb( store.getItem( 'Gamebooks / Media / ' + mediaId ) != null );
		},
		
		addMedia:function( mediaId, mediaData, cb )
		{
			var str = store.getItem( 'Gamebooks / Media / ' + mediaId );
			if( !str )
			{
				store.setItem( 'Gamebooks / Media / ' + mediaId, JSON.stringify( mediaData ) );

				var str = store.getItem( 'Gamebooks / MediaIndex' );
				var mediaindex = [];
				if( str ) mediaindex = JSON.parse( str );
				mediaindex = mediaindex.filter( function( name ){ return name != mediaId; } );
				mediaindex.push( mediaId );
				store.setItem( 'Gamebooks / MediaIndex', JSON.stringify( mediaindex ) );
				if( cb ) setTimeout( cb, 0 );
			}
			else
				alert( 'Tried to create a media "' + mediaId + '" but it already exists' );
		},

		updateMedia:function( mediaId, mediaData, cb )
		{
			var str = store.getItem( 'Gamebooks / Media / ' + mediaId );
			if( str )
			{
				store.setItem( 'Gamebooks / Media / ' + mediaId, JSON.stringify( mediaData ) );
				if( cb ) setTimeout( cb, 0 );
			}
			else
				alert( 'Can\'t update unexisting media "' + mediaId + '"' );
		},

		removeMedia:function( mediaId, cb )
		{
			var str = store.getItem( 'Gamebooks / Media / ' + mediaId );
			if( str )
			{
				store.removeItem( 'Gamebooks / Media / ' + mediaId );
				var mediaindex = JSON.parse( store.getItem( 'Gamebooks / MediaIndex' ) );
				mediaindex = mediaindex.filter( function( name ){ return name != mediaId; } );
				store.setItem( 'Gamebooks / MediaIndex', JSON.stringify( mediaindex ) );

				if( cb ) setTimeout( cb, 0 );
			}
			else
				alert( 'Media "' + mediaId + '" doesn\'t exist' );
		},

		getTextList:function( bookId, cb )
		{
			var textindex = JSON.parse( store.getItem( 'Gamebooks / ' + bookId + ' / TextIndex' ) );
			setTimeout( function(){
				cb( textindex )
			}, 0 );
		},

		getText:function( bookId, textId, cb )
		{
			var str = store.getItem( 'Gamebooks / ' + bookId + ' / Text / ' + textId );
			if( str )
				setTimeout( function(){ cb( JSON.parse( str ) ) }, 0 );
			else
				alert( "Sorry, can't find the section you're looking for" );
		},

		addText:function( bookId, textId, textData, cb )
		{
			var str = store.getItem( 'Gamebooks / ' + bookId + ' / Text / ' + textId );
			if( !str )
			{
				store.setItem( 'Gamebooks / ' + bookId + ' / Text / ' + textId, JSON.stringify( textData ) );

				var textlist = JSON.parse( store.getItem( 'Gamebooks / ' + bookId + ' / TextIndex' ) );
				textlist.push( textId );
				store.setItem( 'Gamebooks / ' + bookId + ' / TextIndex', JSON.stringify( textlist ) );
				if( cb ) setTimeout( cb, 0 );
			}
			else
				alert( 'Tried to create a section "' + textId + '" but it already exists' );
		},

		updateText:function( bookId, textId, textData, cb )
		{
			var str = store.getItem( 'Gamebooks / ' + bookId + ' / Text / ' + textId );
			if( str )
			{
				store.setItem( 'Gamebooks / ' + bookId + ' / Text / ' + textId, JSON.stringify( textData ) );
				if( cb ) setTimeout( cb, 0 );
			}
			else
				alert( 'Can\'t update unexisting section "' + textId + '"' );
		},

		removeText:function( bookId, textId, cb )
		{
			var str = store.getItem( 'Gamebooks / ' + bookId + ' / Text / ' + textId );
			if( str )
			{
				store.removeItem( 'Gamebooks / ' + bookId + ' / Text / ' + textId );
				var textindex = JSON.parse( store.getItem( 'Gamebooks / ' + bookId + ' / TextIndex' ) );
				textindex = textindex.filter( function( id ){ return id != textId; } );
				store.setItem( 'Gamebooks / ' + bookId + ' / TextIndex', JSON.stringify( textindex ) );

				if( cb ) setTimeout( cb, 0 );
			}
			else
				alert( 'Section "' + textId + '" doesn\'t exist' );
		},

		saveState:function( bookId, stateData, cb )
		{
			store.setItem( 'GameBooks / ' + bookId + ' / State', JSON.stringify( stateData ) );
			if( cb ) setTimeout( cb, 0 );
		},

		loadState:function( bookId, cb )
		{
			var state = store.getItem( 'GameBooks / ' + bookId + ' / State' );
			setTimeout( function(){ cb( JSON.parse( state ) ) }, 0 );
		},

		removeState:function( bookId, cb )
		{
			store.removeItem( 'GameBooks / ' + bookId + ' / State' );
			if( cb ) setTimeout( cb, 0 );
		},
		
		loadSettings:function( cb )
		{
			var settings = store.getItem( 'GameBooks / Settings' );
			setTimeout( function(){ cb( JSON.parse( settings ) ) }, 0 );
		},
		
		saveSettings:function( settings, cb )
		{
			store.setItem( 'GameBooks / Settings', JSON.stringify( settings ) );
			if( cb ) setTimeout( cb, 0 );
		}
	};
})();
