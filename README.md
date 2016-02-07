# steveortiz.github.io
software developer @rackspace, specializing in web apps, chess enthusiast and texas aggie

To run a development environment:

```bash
docker run --rm --label=jekyll --volume=$(pwd):/srv/jekyll \
  -it -p 4000:4000 -e POLLING=true -e VERBOSE=true \
  jekyll/jekyll:pages
```
