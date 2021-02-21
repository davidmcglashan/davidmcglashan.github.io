function load( page ) {
		fetch( 'articles/' + page + '.txt' )
			.then( function(response) {
				if ( response.status === 200 ) {
					response.text().then( textString => parse( textString ) );
				} else {
					load( '404' );
				}
			})
			.catch( err => console.error( err ) )
}

/* Load the sidebar JSON and build the sidebar from what it returns. */
fetch( 'sidebar.json' )
	.then( response => response.json() )
 	.then(
 		function( articles ) {
			let nav = document.getElementById("nav");
			articles.forEach( function( obj ) {
				let li = document.createElement("li");
				nav.appendChild( li );
				let a = document.createElement("a");
				li.appendChild( a );
				a.innerHTML = obj.title;
				a.href = "/?" + obj.id;
			});
 		}
 	);

/* Determine if we're loading a single article or the current roll of articles. If 
   there's a search parameter in the URL then we assume it's a single page and try
   to make sense of that ...
 */
let loadRoll = true
if ( window.location.search ) {
	loadRoll = false
	search = window.location.search;
	if ( search === '?calendar' ) {
		calendar();
	} else if ( search.length === 9 ) {
		load( search.substring(1) );
	} else {
		load( '404' );
	}
}

if ( loadRoll ) {
	fetch( 'roll.json' )
	.then( response => response.json() )
 	.then(
 		function( articles ) {
			let nav = document.getElementById("nav");
			articles.forEach( function( obj ) {
				parse( obj.article )
			});

			// Loading the front page roll means we give this page a generic site title.
			let nodes = document.getElementsByTagName("TITLE");
			nodes[0].innerHTML = "david.mcglashan.net";
 		}
 	);
}