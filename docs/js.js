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
}function load( page ) {
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
			let nav = document.getElementById("nav_ul");
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
			let nav = document.getElementById("nav_ul");
			articles.forEach( function( obj ) {
				parse( obj.article )
			});

			// Loading the front page roll means we give this page a generic site title.
			let nodes = document.getElementsByTagName("TITLE");
			nodes[0].innerHTML = "david.mcglashan.net";
 		}
 	);
}function escapeHtml( unsafe ) {
	return unsafe.trim()
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}

function hyperlinks( str ) {
	let tokens = str.split("^");

	// No. of tokens found determines what we do with the string. One string = zero tokens: do no further processing.
	if ( tokens.length === 1 ) {
		return tokens[0];
	}
	if ( tokens.length === 2 ) {
		return tokens[0] + "^" + tokens[1];
	}

	// Iterate the tokens inserting alternating open and closed nodes between them.
	let open = false;
	let ret = "";
	let href;
	let replace;
	tokens.forEach( function(str,i) {
		// If this token isn't an open link, put it on the return string.
		if ( !open ) {
    		ret = ret + str;
    		open = true;
    		return;
		}

		// Open link means this token contains the link text and the href for the <a> tag.
		let ix = str.indexOf("|");
		if ( ix !== -1 ) {
	    	ret = ret + "<a href=\""+ str.substring(ix+1) + "\">" + html( str.substring(0,ix) ) + "</a>";
		} else {
			ret = ret + "<a href=\""+ str + "\">" + str + "</a>";
		}
		open = false;
	});

	return ret;
}

function images( str ) {
	let tokens = str.split("$");

	// No. of tokens found determines what we do with the string. One string = zero tokens: do no further processing.
	if ( tokens.length === 1 ) {
		return tokens[0];
	}
	if ( tokens.length === 2 ) {
		return tokens[0] + "$" + tokens[1];
	}

	// Iterate the tokens inserting alternating open and closed nodes between them.
	let open = false;
	let ret = "";
	let href;
	let replace;
	tokens.forEach( function(str,i) {
		// If this token isn't an open link, put it on the return string.
		if ( !open ) {
    		ret = ret + str;
    		open = true;
    		return;
		}

		// If the token contains a | then there's an image URL and alt text.
		let ix = str.indexOf("|");
		if ( ix !== -1 ) {
	    	ret = ret + "<a href=\"" + str.substring(0,ix) + "\"><img alt=\""+ str.substring(ix+1) + "\" src=\"" + str.substring(0,ix) + "\"></a>";
		} else {
	    	ret = ret + "<a href=\"" + str + "\"><img alt=\""+ str + "\" src=\"" + str + "\"></a>";
		}
		open = false;
	});

	return ret;
}

function replace( str, char, node ) {
	let tokens = str.split(char);

	// No. of tokens found determines what we do with the string. One string = zero tokens: do no further processing.
	if ( tokens.length === 1 ) {
		return tokens[0];
	}

	// An even number of tokens indicates there's an odd number of tags. In this case we leave the last one in there, assuming tags are paired up to that point.
	let hanging = tokens.length % 2 === 0

	// Iterate the tokens inserting alternating open and closed nodes between them.
	let open = false;
	let ret = "";
	tokens.forEach( function(str,i) {
		ret = ret + str;
		
		let replace = (!hanging && i < tokens.length-1) || (hanging && i < tokens.length-2);
		if ( replace ) {
    		ret = ret + "<" + ( open ? "/" : "" ) + node + ">"
    	} else if ( hanging && i < tokens.length-1) {
    		ret = ret + char;
    	}
		open = !open;
	});

	return ret;
}

// Parse the text, looking for bold and italics and whatnot 
function html( str ) {
	str = hyperlinks( str ); 
	str = images( str ); 
	str = replace( str, "*", "strong" );
	str = replace( str, "_", "em" );
	return str;
}

function listable( str ) {
	if ( str.startsWith( "# ") ) {
		return "OL";
	}
	if ( str.startsWith( "* ") ) {
		return "UL";
	}
	return null;
}

function parse( text ) {
	let main = document.getElementById("body");
	let article = document.createElement("article");
	main.appendChild( article );

	let lines = text.split("\n");
	let parent;
	let parseOff = false;

	lines.forEach( function( str,i,a ) {
		// First line is the article title. Add an H2 for this, and also set
		// the <title> tag.
		if ( i === 0 ) {
			let title = document.createElement( "h2" );
			title.innerHTML = str;
			article.appendChild( title );
			let nodes = document.getElementsByTagName("TITLE");
			nodes[0].innerHTML = str + " - david.mcglashan.net";
			return;
		} else if ( i === 1 ) {
			let parts = str.split("/");
			let time = document.createElement( "time" );
			time.innerHTML = parts[ parts.length === 2 ? 1 : 0 ];
			time.setAttribute( "datetime", parts[0] );
			article.appendChild( time );
			return;
		}

		str = escapeHtml( str );
		if ( str.length > 0 ) {

			if ( str === '!parseOff' ) {
				parseOff = !parseOff;

				// Use a <pre> tag for !parseOff content.
				if ( parseOff ) {
					parent = document.createElement("pre");
					article.appendChild( parent );
				} else {
					parent = null;
				}
				return;
			}

			// If we're in parseOff mode, don't do anything fancy.
			if ( parseOff ) {
				parent.innerHTML = parent.innerHTML + str.replace(/!!/g, "!") + "\n";
				return;
			}

			let listElement = listable( str );
			if ( listElement ) {
				// Treat the line as a list indent
				let list = document.createElement("li");
				list.innerHTML = html( str.substring(2) );

				// Do we already have a valid list parent? Has it changed from UL to OL?
				if ( !parent || parent.tagName !== listElement ) {
					parent = document.createElement( listElement );
					article.appendChild( parent );
				}
				parent.appendChild( list );
			} else {
				// Paragraph text.
				let para = document.createElement("p");
				para.innerHTML = html( str );
				article.appendChild( para );
				parent = null;
			}
		} else {
			parent = null;
		}
	});
}function nav() {
	document.getElementById("body").style.display = "none";
	document.getElementById("nav").style.display = "block";
}
