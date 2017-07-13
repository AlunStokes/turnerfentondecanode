module.exports = {
  //takes url and array of navbar entries as inputs, returns the index of array occupied by url, else -1
  getActivePage: function(url, navbarArray, callback) {
    this.removeUrlParameters(url.split('/')[1], function(page) {
      for (var i = 0; i < navbarArray.length; i++) {
        if (navbarArray[i].link == page) {
          callback(i);
          return;
        }
      }
      callback(-1);
    });
  },
  generateRandomString: function(numChars, callback) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for( var i=0; i < numChars; i++ )
    text += possible.charAt(Math.floor(Math.random() * possible.length));
    callback(text);
  },
  removeUrlParameters: function(url, callback) {
    var index = 0;
    var newUrl = url;
    var index = url.indexOf('?');
    if(index == -1){
      index = url.indexOf('#');
    }
    if(index != -1){
      newUrl = url.substring(0, index);
    }
    callback(newUrl);
  },
  isUrl: function(string) {
    var pattern = new RegExp('^(https?:\/\/)?'+ // protocol
    '((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|'+ // domain name
    '((\d{1,3}\.){3}\d{1,3}))'+ // OR ip (v4) address
    '(\:\d+)?(\/[-a-z\d%_.~+]*)*'+ // port and path
    '(\?[;&a-z\d%_.~+=-]*)?'+ // query string
    '(\#[-a-z\d_]*)?$','i'); // fragment locater
  if(!pattern.test(str)) {
    return false;
  } else {
    return true;
  }
  }
}
