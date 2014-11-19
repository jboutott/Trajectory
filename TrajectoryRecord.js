var logBuffer;

window.onload = function() {
	logBuffer = "";
	
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

var logInput = function(text) {
	var openPiece = "ig.input.state(";
	var closePiece = ")";
	
	var opening;
	var closing;
	var current;
	do {
		opening = text.indexOf(openPiece, current);
		closing = text.indexOf(closePiece, opening) + 1;
		if(opening == -1 || closing == -1)	break;
		text = logBetween(text, opening, closing, "logBoolean");
		current = closing;
	}while(true);
	
	var openPiece = "ig.input.pressed(";
	var closePiece = ")";
	
	var opening = 0;
	var closing = 0;
	var current = 0;
	do {
		opening = text.indexOf(openPiece, current);
		closing = text.indexOf(closePiece, opening) + 1;
		if(opening == -1 || closing == -1)	break;
		text = logBetween(text, opening, closing, "logBoolean");
		current = closing;
	}while(true);
	
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
		text = logBetween(text, opening, closing, "logNumber");
		current = closing + 3; //??????????????
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
		opening = text.indexOf(openPiece, current);
		closing = text.indexOf(closePiece, opening) + 1;
		if(opening == -1 || closing == -1)	break;
		text = logBetween(text, opening, closing, "logNumber");
		current = closing;
	}while(true);
	
	return text;
}

var logBetween = function(text, first, last, logType) {
	var fill = logType + "(" + text.slice(first, last) + ")";
	console.log(fill);
	text = text.slice(0, first) + fill + text.slice(last);
	
	return text;
}

var logNumber = function(value) {
	logBuffer += value + "\n";
	console.log(value);
	
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
	console.log(value);
	
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
	console.log("Dumpin'");
}

window.onerror = function handleException(error, url, lineNum) {
    dumpLogToFile();
    return false;
}

window.onkeydown = function(event) {
	event = event || window.event;
	if(event.keyCode == 81)
		dumpLogToFile();
}