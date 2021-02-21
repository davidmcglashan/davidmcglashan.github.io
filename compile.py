import glob
import json

# This function converts the document id keys into a month/date UK English string.
names = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
def monthify( str ):
	year = str[:4]
	month = str[4:6]
	return names[int(month)-1] + " " + year

# Load the settings.json.
with open('settings.json') as readf:
    settings = json.load(readf)

# Compile a quick set of exclusions.
exclude = set()
for ex in settings["exclude"]:
	exclude.add( settings["from"] + "/" + ex )

# Get all the articles into reverse order; they'll be newest at the top on the site.
files = glob.glob( settings["from"] + "/*.txt")
files.sort()
files.reverse()

roll = []
sidebar = []
calendar = {}
count = 0

for file in files:	

	# Don't process excluded files.
	if file in exclude:
		continue

	with open(file) as f:
		text = f.read()
		lines = text.split("\n")

		# Ignore drafts.
		if lines[0].startswith( 'DRAFT' ):
			continue

		# Read the article metadata. "id" comes from the filename, without the path and
		# extension. Title is simply the first line of the article text.
		artId = file[ len(settings["from"]+"/") : len(file)-4 ]
		artTitle = lines[0].strip()

		# Compile the sidebar (id and title only) for as long as its length is specified.
		if count < settings["sidebar"]["length"]:
			obj = {}
			obj['id'] = artId
			obj['title'] = artTitle
			sidebar.append( obj )

		# Compile the article roll for as long as its length is specified.
		if count < settings["roll"]["length"]:
			obj = {}
			obj['id'] = artId
			obj['title'] = artTitle
			obj['article'] = text
			roll.append( obj )

		# All articles go in the calendar (id and title only)
		obj = {}
		obj['id'] = artId
		obj['title'] = artTitle
		key = monthify( artId )
		if key in calendar:
			month = calendar[key]
		else:
			month = list()
			calendar[key] = month
		month.append( obj )

	count += 1

# Write everything out to files
with open( settings["sidebar"]["file"], 'w') as w:
	w.write( json.dumps(sidebar) )
	w.close()

with open( settings["roll"]["file"], 'w') as w:
	w.write( json.dumps(roll) )
	w.close()

with open( settings["calendar"]["file"], 'w') as w:
	w.write( json.dumps(calendar) )
	w.close()
