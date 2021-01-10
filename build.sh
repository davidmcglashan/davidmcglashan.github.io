#! /bin/zsh

export BASE="/Users/david/Web/davidmcglashan.github.io"

cd $BASE

echo 'emptying docs folder ...'
rm -R $BASE/docs/*
cp $BASE/CNAME $BASE/docs/CNAME

echo 'restoring index.html ...'
cp $BASE/index.html $BASE/docs/index.html

echo 'restoring articles'
cp -R $BASE/articles $BASE/docs/articles

echo 'rebuilding sidebar'
python3 $BASE/sidebar.py > $BASE/docs/sidebar.json

echo 'rebuilding article roll'
python3 $BASE/roll.py > $BASE/docs/roll.json

echo 'restoring javascript'
cat $BASE/*.js > $BASE/docs/js.js

echo 'restoring CSS'
cp $BASE/css.css $BASE/docs/css.css