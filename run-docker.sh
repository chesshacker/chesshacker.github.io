#!/bin/bash
set -ex

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
docker run --rm -v $DIR:/srv/jekyll -it -p 4000:4000 -e POLLING=true -e VERBOSE=true jekyll/jekyll:pages
