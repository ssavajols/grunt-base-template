define('main',['mod'], function(mod) {

  var data = {message: "this is a sample text from hbs file"};
  document.body.innerHTML = document.body.innerHTML + hbsTemplate["templates/sample"](data);
});
