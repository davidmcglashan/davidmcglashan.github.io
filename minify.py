from slimit import minify

with open( "temp.js" ) as f:
	text = f.read()



print minify( text, mangle=True )