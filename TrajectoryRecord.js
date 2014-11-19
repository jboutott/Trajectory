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

/*var findBlocks = function(text, block) {
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
}*/

var logBetween = function(text, first, last) {
	var fill = "logValue(" + text.slice(first, last) + ")";
	console.log(fill);
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
	//console.log("LOGGED: " + value);
	
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