#!/bin/bash

if test "$(git rev-parse --abbrev-ref HEAD)" != main; then
    echo Should be on the main branch to deploy
    exit 1
fi

npm run-script build || exit 1

git checkout gh-pages
mv dist/* .
git add index.html main.css main.js assets/ # the only files on the front end
git commit -m "auto commit $(date)"
git checkout -
# git push origin gh-pages