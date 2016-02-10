---
---
$(document).ready(function(){

  // toggle content
  $("h3").nextUntil("h3, hr").hide();

  $("h3").click(function() {
    $(this).nextUntil("h3, hr").slideToggle("fast");
    $(this).toggleClass("active", 1000);
  });

});
