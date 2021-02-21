function calendar() {
	fetch( 'calendar.json' )
	.then( response => response.json() )
 	.then(
 		function( calendar ) {
			let main = document.getElementById("body");
			let h2 = document.createElement("h2");
			h2.innerHTML = "All articles";
			main.appendChild( h2 );
			let dl = document.createElement("dl");
			main.appendChild( dl );

			Object.keys(calendar).forEach( function( key ) {
				let dt = document.createElement("dt");
				dl.appendChild( dt );
				dt.innerHTML = key;
				let dd = document.createElement("dd");
				dt.appendChild( dd );
				let ul = document.createElement("ul");
				dd.appendChild( ul );

				calendar[key].forEach( function( article ) {
					let li = document.createElement("li");
					ul.appendChild( li );
					let a = document.createElement("a");
					li.appendChild( a );
					a.innerHTML = article.title;
					a.href = "/?" + article.id;
				});
			});

			// Loading the front page roll means we give this page a generic site title.
			let nodes = document.getElementsByTagName("TITLE");
			nodes[0].innerHTML = "All david.mcglashan.net articles";
 		}
 	);
}