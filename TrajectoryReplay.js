var logBuffer;
var currentEntry;

window.onload = function() {
	logBuffer = "";
	currentEntry = 0;
	dumpFileToBuffer();
	var scripts = document.getElementsByTagName("trajectory");
	var scriptText;
	for (var i = 0; i < scripts.length; i++) {
		var src = scripts[i].getAttribute('src');
		if(src && src.indexOf("TrajectoryRecord") == -1) {
			console.log("Reading file: " + src);
			scriptText = readFile(src);
			console.log("Modifying the file...");
			scriptText = modifyText(scriptText);
			
			console.log("Deleting trajectory tag...");
			scripts[i].parentNode.removeChild(scripts[i]);
			
			console.log("Creating script tag...");
			newTag = document.createElement("script");
			newTag.innerHTML = scriptText;
			document.head.appendChild(newTag);
		}
	}
}

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
	text = findBlocks(text, "if");
	//text = findBlocks(text, "switch");
	//need to handle ( ? : );
	//also what if something is assigned a value of Math.random(), like a velocity
	//we need to log that too
	return text;
}

var findBlocks = function(text, block) {
	var opening;
	var current;
	var numParens;
	do {
		numParens = 0;
		current = text.indexOf(block + "(", current);
		if(current == -1)	break;
		current += block.length + 1;
		opening = current - 1;
		do {
			if(text.charAt(current) == "(")
				numParens++;
			else if(text.charAt(current) == ")")
				numParens--;
			current++;
		}while(numParens >= 0);
		text = logBetween(text, opening, current);
	}while(true);
	
	return text;
}

var logBetween = function(text, first, last) {
	var fill = "readLog(" + text.slice(first + 1, last - 1) + ")";
	text = text.slice(0, first + 1) + fill + text.slice(last - 1);
	
	return text;
}

var dumpFileToBuffer = function() {
	var f = "TrajectoryLog.txt";
	var contents = readFile(f);
	logBuffer = contents.split("\n");
}

var readLog = function(value) {
	//console.log(value);
	var returnValue = logBuffer[currentEntry];
	//console.log(returnValue);
		
	if(value !== true && value !== false) {
		return value;
	}
	
	currentEntry++;	
	if (returnValue === "true") {
		return true;
	} else if (returnValue === "false") {
		return false;
	}
	
	return value;
}

