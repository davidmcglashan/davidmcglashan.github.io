#! /bin/zsh

export BASE="/Users/david/Web/davidmcglashan.github.io"

cd $BASE

echo 'emptying docs folder ...'
rm -R $BASE/docs/*
cp $BASE/CNAME $BASE/docs/CNAME

echo 'restoring index.html ...'
cp $BASE/index.html $BASE/docs/index.html

echo 'restoring articles ...'
cp -R $BASE/articles $BASE/docs/articles

echo 'restoring assets ...'
cp -R $BASE/assets $BASE/docs/assets

echo 'compiling sidebar and pages ...'
python3 $BASE/compile.py

# TODO this minifier requires python v2 and it doesn't work with modern
# javascript. 
echo 'restoring javascript ...'
cat $BASE/js/*.js > $BASE/docs/js.js
#python $BASE/minify.py > $BASE/docs/js.js
#rm $BASE/temp.js

echo 'restoring CSS ...'
cat $BASE/css/*.css > $BASE/docs/css.css