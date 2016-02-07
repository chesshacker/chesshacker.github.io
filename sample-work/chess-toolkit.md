---
layout: default
title: Chess Toolkit
quote: "It's classified.  I could tell you, but then I'd have to kill you."
cite: "Maverick in <strong>Top Gun (1986)</strong>"
permalink: /sample-work/chess-toolkit/
---

<p class="lead" markdown="1">For the past nine years, I have been working for the military on sensitive, proprietary and often classified projects, so I can't share the code I have developed at work.  Fortunately, I also enjoy programming at home, and I can freely share my home projects.  One of my favorite hobbies is chess, so naturally I was drawn to writing chess software.  I recently decided to package some of my work as a reusable library, which I dubbed the [Chess Toolkit][toolkit] and released under the Apache License.  This is the best example of my work.</p>

The Chess Toolkit is about 4,000 source lines of code for the library, 4,000 lines of tests, and 1,000 lines of examples.  It also includes a detailed [Manual.][manual]  It is mostly written in C, but includes some yacc, lex and Ruby code.  The library is packaged using standard autoconf tools, and the unit tests use GNU Check.  Assuming you have a typical GNU software development environment, it should build, test and install with the usual incantation:

{% highlight bash %}
./configure; make check; sudo make install
{% endhighlight %}

In the Chess Toolkit examples, I have included a sample Ruby Gem, which demonstrates how this library could be used with other programming languages.  The Ruby Gem is meant to be an example, and not a final product; but it is both powerful and easy to use.  To demonstrate my Chess Toolkit, I have written a simple program using the example Ruby Gem, Rails 4 and jQuery.  This demonstration also ties into some of my other work, where I processed millions of chess games, scored them using a unique algorithm of my own invention, and saved the results in a MySQL database.  The score for each position equates directly to a shift in the player's <abbr title="The Elo rating system is a method for calculating the relative skill level of players">Elo rating</abbr>; or to put it simply, positive scores are better for white and negative is better for black.

<div class="row">
  <div class="col-sm-6 text-center stacks">
    <a href="https://github.com/steve-ortiz/chess_toolkit/archive/master.zip" class="btn btn-primary btn-large">Download the Chess Toolkit</a>
  </div>
  <div class="col-sm-6 text-center stacks">
    <a href="/sample-work/chess-openings/" class="btn btn-primary btn-large">Try the Chess Toolkit Demo</a>
  </div>
</div>

[toolkit]: https://github.com/steve-ortiz/chess_toolkit
[manual]: https://github.com/steve-ortiz/chess_toolkit/blob/master/MANUAL.md
