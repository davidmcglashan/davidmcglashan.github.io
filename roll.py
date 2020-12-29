import glob
import json

files = glob.glob("articles/*.txt")
files.sort()
files.reverse()

count = 0

roll = []

for file in files:	
	# max 10 articles
	count += 1
	if ( count == 10 ):
		break

	# Exclude 404 from the roll
	if file.endswith( "/404.txt" ):
		continue

	with open(file) as f:
		obj = {}
		text = f.read()
		lines = text.split("\n")
		obj['id'] = file[9:17]
		obj['title'] = lines[0].strip()
		obj['article'] = text
		roll.append( obj )

print( json.dumps( roll ) )