#! /bin/zsh

export BASE="/Users/david/Web/david.mcglashan.net"

cd $BASE

echo 'emptying Apache folder ...'
rm -R $BASE/Apache/*

echo 'restoring index.html ...'
cp $BASE/index.html $BASE/Apache/index.html

echo 'restoring articles'
cp -R $BASE/articles $BASE/Apache/articles

echo 'rebuilding sidebar'
python3 $BASE/sidebar.py > $BASE/Apache/sidebar.json

echo 'rebuilding article roll'
python3 $BASE/roll.py > $BASE/Apache/roll.json

echo 'restoring javascript'
cat $BASE/*.js > $BASE/Apache/js.js

echo 'restoring CSS'
cp $BASE/css.css $BASE/Apache/css.css