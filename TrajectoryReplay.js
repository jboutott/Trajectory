var logBuffer;
var currentEntry;
var tookOver = false;

window.onload = function() {
	logBuffer = "";
	currentEntry = 0;
	dumpFileToBuffer();
	var scripts = document.getElementsByTagName("trajectory");
	var scriptText;
	for (var i = 0; i < scripts.length; i++) {
		var src = scripts[i].getAttribute('src');
		if(src && src.indexOf("TrajectoryReplay") == -1) {
			scriptText = readFile(src);
			scriptText = modifyText(scriptText);
			
			scripts[i].parentNode.removeChild(scripts[i]);
			
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
	text = logTick(text);
	
	return text;
}

var logTimer = function(text) {
	var openPiece = "this.";
	var closePiece = ".delta()";
	
	var opening = 0;
	var closing = 0;
	var current = 0;
	while(true) {
		closing = text.indexOf(closePiece, current) + closePiece.length;
		opening = text.lastIndexOf(openPiece, closing);
		if(opening == -1 || closing == -1)	break;
		text = logBetween(text, opening, closing, "readNumber");
		current = closing + 4; //??????????????
	}
	
	return text;
}

var logInput = function(text) {
	var openPiece = "ig.input.state(";
	var closePiece = ")";
	
	var opening = 0;
	var closing = 0;
	var current = 0;
	while(true) {
		opening = text.indexOf(openPiece, current);
		closing = text.indexOf(closePiece, opening) + 1;
		if(opening == -1 || closing == -1)	break;
		text = logBetween(text, opening, closing, "readBoolean");
		current = closing;
	}
	
	openPiece = "ig.input.pressed(";
	closePiece = ")";
	
	opening = 0;
	closing = 0;
	current = 0;
	while(true) {
		opening = text.indexOf(openPiece, current);
		closing = text.indexOf(closePiece, opening) + 1;
		if(opening == -1 || closing == -1)	break;
		text = logBetween(text, opening, closing, "readBoolean");
		current = closing;
	}
	
	openPiece = "ig.input.released(";
	closePiece = ")";
	
	opening = 0;
	closing = 0;
	current = 0;
	while(true) {
		opening = text.indexOf(openPiece, current);
		closing = text.indexOf(closePiece, opening) + 1;
		if(opening == -1 || closing == -1)	break;
		text = logBetween(text, opening, closing, "readBoolean");
		current = closing;
	}
	
	var target = "ig.input.mouse.x";
	
	current = 0;
	while(true) {
		current = text.indexOf(target, current);
		if(current == -1)	break;
		text = logBetween(text, current, current + target.length, "readNumber");
		current += target.length;
	}
	
	target = "ig.input.mouse.y";
	
	current = 0;
	while(true) {
		current = text.indexOf(target, current);
		if(current == -1)	break;
		text = logBetween(text, current, current + target.length, "readNumber");
		current += target.length;
	}
	
	return text;
}

var logRandom = function(text) {
	var target = "Math.random()";
	
	var current = 0;
	while(true) {
		current = text.indexOf(target, current);
		if(current == -1)	break;
		text = logBetween(text, current, current + target.length, "readNumber");
		current += target.length;
	}
	
	return text;
}

var logTick = function(text) {
	var target = "ig.system.tick";
	
	var current = 0;
	while(true) {
		current = text.indexOf(target, current);
		if(current == -1)	break;
		text = logBetween(text, current, current + target.length, "readNumber");
		current += target.length;
	}
	
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
	if ((currentEntry >= logBuffer.length) || tookOver) {
		// Replay has ended/developer has taken over
		return value;
	}
	var entry = logBuffer[currentEntry];
	currentEntry++;

	return entry;
}

var readBoolean = function(value) {

	if ((currentEntry >= logBuffer.length) || tookOver) {
		// Replay has ended/developer has taken over
		return value;
	}
	var entry = logBuffer[currentEntry];
	currentEntry++;

	if (entry === "true") {
		return true;
	} else if (entry === "false") {
		return false;
	}
	
	return entry;
}

window.onkeydown = function(event) {
	tookOver = true;
}
