var trj_logBuffer;

window.onload = function() {
	trj_logBuffer = "";
	
	var scripts = document.getElementsByTagName("trajectory");
	var scriptText;
	for (var i = 0; i < scripts.length; i++) {
		var src = scripts[i].getAttribute('src');
		if(src && src.indexOf("TrajectoryRecord") == -1) {
			scriptText = trj_readFile(src);
			scriptText = trj_modifyText(scriptText);
			
			scripts[i].parentNode.removeChild(scripts[i]);
			
			newTag = document.createElement("script");
			newTag.innerHTML = scriptText;
			document.head.appendChild(newTag);
		}
	}
}

var trj_readFile = function(filePath) {
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

var trj_modifyText = function(text) {
	text = trj_logInput(text);
	text = trj_logTimer(text);
	text = trj_logRandom(text);
	text = trj_logTick(text);
	
	return text;
}

var trj_logInput = function(text) {
	var openPiece = "ig.input.state(";
	var closePiece = ")";
	
	var opening = 0;
	var closing = 0;
	var current = 0;
	while(true) {
		opening = text.indexOf(openPiece, current);
		closing = text.indexOf(closePiece, opening) + 1;
		if(opening == -1 || closing == -1)	break;
		text = trj_logBetween(text, opening, closing, "trj_logBoolean");
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
		text = trj_logBetween(text, opening, closing, "trj_logBoolean");
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
		text = trj_logBetween(text, opening, closing, "trj_logBoolean");
		current = closing;
	}
	
	var target = "ig.input.mouse.x";
	
	current = 0;
	while(true) {
		current = text.indexOf(target, current);
		if(current == -1)	break;
		text = trj_logBetween(text, current, current + target.length, "trj_logNumber");
		current += target.length;
	}
	
	target = "ig.input.mouse.y";
	
	current = 0;
	while(true) {
		current = text.indexOf(target, current);
		if(current == -1)	break;
		text = trj_logBetween(text, current, current + target.length, "trj_logNumber");
		current += target.length;
	}
	
	return text;
}

var trj_logTimer = function(text) {
return text;
	var openPiece = "this.";
	var closePiece = ".delta()";
	
	var opening = 0;
	var closing = 0;
	var current = 0;
	while(true) {
		closing = text.indexOf(closePiece, current) + closePiece.length;
		opening = text.lastIndexOf(openPiece, closing);
		if(opening == -1 || closing == -1)	break;
		text = trj_logBetween(text, opening, closing, "trj_logNumber");
		current = closing + "trj_logNumber".length;
	}
	
	return text;
}

var trj_logRandom = function(text) {
	var target = "Math.random()";
	
	var current = 0;
	while(true) {
		current = text.indexOf(target, current);
		if(current == -1)	break;
		text = trj_logBetween(text, current, current + target.length, "trj_logNumber");
		current += target.length + "trj_logNumber".length;
	}
	
	return text;
}

var trj_logTick = function(text) {
	var target = "ig.system.tick";
	
	var current = 0;
	while(true) {
		current = text.indexOf(target, current);
		if(current == -1)	break;
		text = trj_logBetween(text, current, current + target.length, "trj_logNumber");
		current += target.length + "trj_logNumber".length;
	}
	
	return text;
}

var trj_logBetween = function(text, first, last, logType) {
	var fill = logType + "(" + text.slice(first, last) + ")";
	text = text.slice(0, first) + fill + text.slice(last);
	
	return text;
}

var trj_logNumber = function(value) {
	trj_logBuffer += value + "\n";
	
	return value;
}

var trj_logBoolean = function(value) {
	if(value != true && value != false) {
		if(value == undefined || value == null)
			value = false;
		else
			value = true;
	}
	trj_logBuffer += value + "\n";
	
	return value;
}

function destroyClickedElement(event)
{
	document.body.removeChild(event.target);
}

var trj_dumpLogToFile = function() {
	var textFileAsBlob = new Blob([trj_logBuffer], {type:'text/plain'});
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
    trj_dumpLogToFile();
    return false;
}

window.onkeydown = function(event) {
	event = event || window.event;
	if(event.keyCode === 81)
		trj_dumpLogToFile();
}