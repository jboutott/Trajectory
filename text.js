var readFile = function(filePath) {
    var reader = new FileReader();  // Create a FileReader object
    var f = reader.OpenTextFile(filePath, 1);

    reader.readAsText(f);           // Read the file
    reader.onload = function(res) {    // Define an event handler
        //var text = reader.result;   // This is the file contents
        var text = res.target.result;
        console.log("Text: " + text);
    }
    reader.onerror = function(e) {
    	 console.log("Error: " + e);
    }
    console.log(reader);

};

var fs = require('fs');
var readFile2 = function(filePath) {
	var array = fs.readFileSync(filePath).toString().split("\n");
	for(i in array) {
    	console.log(array[i]);
	}
}

var grabInput = function() {

  var scripts = document.getElementsByTagName("script");
  for (var i=0;i<scripts.length;i++) {
     if (scripts[i].src) {
     	console.log(i,scripts[i].src)
     	readFile(scripts[i].src);
     }
     else
     	console.log(i,scripts[i].innerHTML)
  }
};