window.onload = function() {
	var scripts = document.getElementsByTagName("script");
	var scriptText;
	for (var i = 0; i < scripts.length; i++) {
		if(scripts[i].src && scripts[i].src.indexOf("TrajectoryRecord") == -1) {
			console.log("Reading file: " + scripts[i].src);
			scriptText = readFile(scripts[i].src);
			
			console.log("Modifying the file...");
			scriptText = modifyText(scriptText);
			
			console.log("Deleting original script tag...");
			scripts[i].parentNode.removeChild(scripts[i]);
			
			console.log("Creating new script tag...");
			newTag = document.createElement("script");
			newTag.innerHTML = scriptText;
			document.head.appendChild(newTag);
		}
	}
};

var readFile = function(filePath) {
	var xmlhttp;
	//IE7+, Firefox, Chrome, Opera, Safari
	if(window.XMLHttpRequest) {
		xmlhttp = new XMLHttpRequest();
	}
	//IE6, IE5
	else {
		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	}
	xmlhttp.open("GET", filePath, false);
	xmlhttp.send();
	return xmlhttp.responseText;
}

var modifyText = function(text) {
	return text.replace("world", "WORLD");
}