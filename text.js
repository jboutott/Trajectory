var readFile = function(filePath) {
    var reader = new FileReader();
    reader.onload = function(e) {
        var text = fileReader.result;
        console.log("Text: " + text);
    }
    reader.onerror = function(e) {
    	 console.log("Error: " + e);
    }
    reader.readAsText(filePath);
};

var grabInput = function() {
  var scripts = document.getElementsByTagName("script");
  for (var i=0; i < scripts.length; i++) {
     if(scripts[i].src) {
     	console.log("Reading " + scripts[i].src);
     	readFile(scripts[i].src);
     }
  }
};