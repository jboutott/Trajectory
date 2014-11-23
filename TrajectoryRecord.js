var logBuffer;

window.onload = function() {
	logBuffer = "";
	
	var scripts = document.getElementsByTagName("trajectory");
	var scriptText;
	for (var i = 0; i < scripts.length; i++) {
		var src = scripts[i].getAttribute('src');
		if(src && src.indexOf("TrajectoryRecord") == -1) {
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
		text = logBetween(text, opening, closing, "logBoolean");
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
		text = logBetween(text, opening, closing, "logBoolean");
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
		text = logBetween(text, opening, closing, "logBoolean");
		current = closing;
	}
	
	var target = "ig.input.mouse.x";
	
	current = 0;
	while(true) {
		current = text.indexOf(target, current);
		if(current == -1)	break;
		text = logBetween(text, current, current + target.length, "logNumber");
		current += target.length;
	}
	
	target = "ig.input.mouse.y";
	
	current = 0;
	while(true) {
		current = text.indexOf(target, current);
		if(current == -1)	break;
		text = logBetween(text, current, current + target.length, "logNumber");
		current += target.length;
	}
	
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
		text = logBetween(text, opening, closing, "logNumber");
		current = closing + 3; //??????????????
	}
	
	return text;
}

var logRandom = function(text) {
	var target = "Math.random()";
	
	var current = 0;
	while(true) {
		current = text.indexOf(target, current);
		if(current == -1)	break;
		text = logBetween(text, current, current + target.length, "logNumber");
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
		text = logBetween(text, current, current + target.length, "logNumber");
		current += target.length;
	}
	
	return text;
}

var logBetween = function(text, first, last, logType) {
	var fill = logType + "(" + text.slice(first, last) + ")";
	text = text.slice(0, first) + fill + text.slice(last);
	
	return text;
}

var logNumber = function(value) {
	logBuffer += value + "\n";
	
	return value;
}

var logBoolean = function(value) {
	if(value != true && value != false) {
		if(value == undefined || value == null)
			value = false;
		else
			value = true;
	}
	logBuffer += value + "\n";
	
	return value;
}

function destroyClickedElement(event)
{
	document.body.removeChild(event.target);
}

var dumpLogToFile = function() {
	var textFileAsBlob = new Blob([logBuffer], {type:'text/plain'});
	var fileName = "TrajectoryLog.txt";

	var downloadLink = document.createElement("a");
	downloadLink.download = fileName;
	downloadLink.innerHTML = "Download File";
	if (window.webkitURL != null)
	{
		// Chrome allows the link to be clicked
		// without actually adding it to the DOM.
		downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
	}
	else
	{
		// Firefox requires the link to be added to the DOM
		// before it can be clicked.
		downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
		downloadLink.onclick = destroyClickedElement;
		downloadLink.style.display = "none";
		document.body.appendChild(downloadLink);
	}

	downloadLink.click();
}

window.onerror = function handleException(error, url, lineNum) {
    dumpLogToFile();
    return false;
}

window.onkeydown = function(event) {
	event = event || window.event;
	if(event.keyCode === 81)
		dumpLogToFile();
}