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
	text = logInput(text);
	//text = matchString(text, ".delta()");
	
	//text = findBlocks(text, "if");
	//text = findBlocks(text, "switch");
	//Math.random();
	//timer.delta();
	return text;
}

var logInput = function(text) {
	var openPiece = "ig.input.state(";
	var closePiece = ")";
	
	var opening;
	var closing;
	var current;
	do {
		numParens = 0;
		opening = text.indexOf(openPiece, current);
		closing = text.indexOf(closePiece, opening) + 1;
		if(opening == -1 || closing == -1)	break;
		text = logBetween(text, opening, closing);
		current = closing;
	}while(true);
	
	return text;
}

var logBetween = function(text, first, last) {
	var fill = "readLog(" + text.slice(first, last) + ")";
	text = text.slice(0, first) + fill + text.slice(last);
	
	return text;
}

var logValue = function(value) {
	if(value != true && value != false) {
		if(value == undefined || value == null)
			value = false;
		else
			value = true;
	}
	logBuffer += value + "\n";
	
	return value;
}

var dumpFileToBuffer = function() {
	var f = "TrajectoryLog.txt";
	var contents = readFile(f);
	logBuffer = contents.split("\n");
}

var readLog = function(value) {
	var returnValue = logBuffer[currentEntry];
	currentEntry++;
	if (returnValue === "true") {
		return true;
	} else if (returnValue === "false") {
		return false;
	}
	
	return value;
}

