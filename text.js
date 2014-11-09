var readFile = function(filePath)
{
var xmlhttp;
if (window.XMLHttpRequest)
  {// code for IE7+, Firefox, Chrome, Opera, Safari
  xmlhttp=new XMLHttpRequest();
  }
else
  {// code for IE6, IE5
  xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
  }
xmlhttp.open("GET",filePath,false);
xmlhttp.send();
console.log(xmlhttp.responseText);
}

var grabInput = function() {
  var scripts = document.getElementsByTagName("script");
  for (var i=0; i < scripts.length; i++) {
     if(scripts[i].src) {
     	console.log("Reading " + scripts[i].src);
     	readFile(scripts[i].src);
     }
  }
};