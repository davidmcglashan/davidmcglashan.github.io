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

let loadAll = true
if ( window.location.search ) {
	loadAll = false
	page = window.location.search;
	if ( page.length === 9 ) {
		load( page.substring(1) );
	} else {
		load( '404' );
	}
}

fetch( loadAll ? 'roll.json' : 'sidebar.json' )
	.then(response => response.json())
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
				if ( loadAll ) {
					parse( obj.article )
				}
			});

			if ( loadAll ) {
				let nodes = document.getElementsByTagName("TITLE");
				nodes[0].innerHTML = "david.mcglashan.net";
			}
 		}
 	);

