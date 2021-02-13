import glob
import json

files = glob.glob("articles/*.txt")
files.sort()
files.reverse()

count = 0

sidebar = []

for file in files:

	# Exclude 404 from the roll
	if file.endswith( "/404.txt" ):
		continue

	with open(file) as f:
		obj = {}
		text = f.read()
		lines = text.split("\n")
		if lines[0].startswith( 'DRAFT' ):
			continue

		obj['id'] = file[9:17]
		obj['title'] = lines[0].strip()
		sidebar.append( obj )

	# max 10 articles
	count += 1
	if ( count == 10 ):
		break

print( json.dumps( sidebar ) )