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
	text = logTimer(text);	
	text = logRandom(text);

	return text;
}

var logTimer = function(text) {
	var openPiece = "this.";
	var closePiece = ".delta()";
	
	var opening;
	var closing;
	var current;
	do {
		closing = text.indexOf(closePiece, current) + closePiece.length;
		opening = text.lastIndexOf(openPiece, closing);
		if(opening == -1 || closing == -1)	break;
		text = logBetween(text, opening, closing, "readLog");
		current = closing + 3; //??????????????
	}while(true);
	
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
		text = logBetween(text, opening, closing, "readLog");
		current = closing;
	}while(true);
	
	return text;
}

var logRandom = function(text) {
	var openPiece = "Math.random(";
	var closePiece = ")";
	
	var opening;
	var closing;
	var current;
	do {
		numParens = 0;
		opening = text.indexOf(openPiece, current);
		closing = text.indexOf(closePiece, opening) + 1;
		if(opening == -1 || closing == -1)	break;
		text = logBetween(text, opening, closing, "readLog");
		current = closing;
	}while(true);
	
	return text;
}


var logBetween = function(text, first, last, logType) {
	var fill = logType + "(" + text.slice(first, last) + ")";
	text = text.slice(0, first) + fill + text.slice(last);
	
	return text;
}

var dumpFileToBuffer = function() {
	var f = "TrajectoryLog.txt";
	var contents = readFile(f);
	logBuffer = contents.split("\n");
}

var readNumber = function(value) {
	var value = logBuffer[currentEntry];
	currentEntry++;
	return value;
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

