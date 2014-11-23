var trj_logBuffer;

window.onload = function() {
	trj_logBuffer = "";
	
	var trj_scripts = document.getElementsByTagName("trajectory");
	var trj_scriptText;
	for (var i = 0; i < trj_scripts.length; i++) {
		var trj_src = trj_scripts[i].getAttribute('src');
		if(trj_src && trj_src.indexOf("TrajectoryRecord") == -1) {
			trj_scriptText = trj_readFile(trj_src);
			trj_scriptText = trj_modifyText(trj_scriptText);
			
			trj_scripts[i].parentNode.removeChild(trj_scripts[i]);
			
			trj_newTag = document.createElement("script");
			trj_newTag.innerHTML = trj_scriptText;
			document.head.appendChild(trj_newTag);
		}
	}
}

var trj_readFile = function(trj_filePath) {
	var trj_xmlhttp;
	//IE7+, Firefox, Chrome, Opera, Safari
	if(window.XMLHttpRequest) {
		trj_xmlhttp = new XMLHttpRequest();
	}
	//IE6, IE5
	else {
		trj_xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	}
	trj_xmlhttp.open("GET", trj_filePath, false);
	trj_xmlhttp.send();
	return trj_xmlhttp.responseText;
}

var trj_modifyText = function(trj_text) {
	trj_text = trj_logInput(trj_text);
	trj_text = trj_logTimer(trj_text);
	trj_text = trj_logRandom(trj_text);
	trj_text = trj_logTick(trj_text);
	
	return trj_text;
}

var trj_logInput = function(trj_text) {
	var trj_openPiece = "ig.input.state(";
	var trj_closePiece = ")";
	
	var trj_opening = 0;
	var trj_closing = 0;
	var trj_current = 0;
	while(true) {
		trj_opening = trj_text.indexOf(trj_openPiece, trj_current);
		trj_closing = trj_text.indexOf(trj_closePiece, trj_opening) + 1;
		if(trj_opening == -1 || trj_closing == -1)	break;
		trj_text = trj_logBetween(trj_text, trj_opening, trj_closing, "trj_logBoolean");
		trj_current = trj_closing;
	}
	
	trj_openPiece = "ig.input.pressed(";
	trj_closePiece = ")";
	
	trj_opening = 0;
	trj_closing = 0;
	trj_current = 0;
	while(true) {
		trj_opening = trj_text.indexOf(trj_openPiece, trj_current);
		trj_closing = trj_text.indexOf(trj_closePiece, trj_opening) + 1;
		if(trj_opening == -1 || trj_closing == -1)	break;
		trj_text = trj_logBetween(trj_text, trj_opening, trj_closing, "trj_logBoolean");
		trj_current = trj_closing;
	}
	
	trj_openPiece = "ig.input.released(";
	trj_closePiece = ")";
	
	trj_opening = 0;
	trj_closing = 0;
	trj_current = 0;
	while(true) {
		trj_opening = trj_text.indexOf(trj_openPiece, trj_current);
		trj_closing = trj_text.indexOf(trj_closePiece, trj_opening) + 1;
		if(trj_opening == -1 || trj_closing == -1)	break;
		trj_text = trj_logBetween(trj_text, trj_opening, trj_closing, "trj_logBoolean");
		trj_current = trj_closing;
	}
	
	var trj_target = "ig.input.mouse.x";
	
	trj_current = 0;
	while(true) {
		trj_current = trj_text.indexOf(trj_target, trj_current);
		if(trj_current == -1)	break;
		trj_text = trj_logBetween(trj_text, trj_current, trj_current + trj_target.length, "trj_logNumber");
		trj_current += trj_target.length;
	}
	
	trj_target = "ig.input.mouse.y";
	
	trj_current = 0;
	while(true) {
		trj_current = trj_text.indexOf(trj_target, trj_current);
		if(trj_current == -1)	break;
		trj_text = trj_logBetween(trj_text, trj_current, trj_current + trj_target.length, "trj_logNumber");
		trj_current += trj_target.length;
	}
	
	return trj_text;
}

var trj_logTimer = function(trj_text) {
	var trj_openPiece = "this.";
	var trj_closePiece = ".delta()";
	
	var trj_opening = 0;
	var trj_closing = 0;
	var trj_current = 0;
	while(true) {
		trj_closing = trj_text.indexOf(trj_closePiece, trj_current) + trj_closePiece.length;
		trj_opening = trj_text.lastIndexOf(trj_openPiece, trj_closing);
		if(trj_opening == -1 || trj_closing == -1)	break;
		trj_text = trj_logBetween(trj_text, trj_opening, trj_closing, "trj_logNumber");
		trj_current = trj_closing + "trj_logNumber".length;
	}
	
	return trj_text;
}

var trj_logRandom = function(trj_text) {
	var trj_target = "Math.random()";
	
	var trj_current = 0;
	while(true) {
		trj_current = trj_text.indexOf(trj_target, trj_current);
		if(trj_current == -1)	break;
		trj_text = trj_logBetween(trj_text, trj_current, trj_current + trj_target.length, "trj_logNumber");
		trj_current += trj_target.length + "trj_logNumber".length;
	}
	
	return trj_text;
}

var trj_logTick = function(trj_text) {
	var trj_target = "ig.system.tick";
	
	var trj_current = 0;
	while(true) {
		trj_current = trj_text.indexOf(trj_target, trj_current);
		if(trj_current == -1)	break;
		trj_text = trj_logBetween(trj_text, trj_current, trj_current + trj_target.length, "trj_logNumber");
		trj_current += trj_target.length + "trj_logNumber".length;
	}
	
	return trj_text;
}

var trj_logBetween = function(trj_text, trj_first, trj_last, trj_logType) {
	var trj_fill = trj_logType + "(" + trj_text.slice(trj_first, trj_last) + ")";
	trj_text = trj_text.slice(0, trj_first) + trj_fill + trj_text.slice(trj_last);
	
	return trj_text;
}

var trj_logNumber = function(trj_value) {
	trj_logBuffer += trj_value + "\n";
	
	return trj_value;
}

var trj_logBoolean = function(trj_value) {
	if(trj_value != true && trj_value != false) {
		if(trj_value == undefined || trj_value == null)
			trj_value = false;
		else
			trj_value = true;
	}
	trj_logBuffer += trj_value + "\n";
	
	return trj_value;
}

function trj_destroyClickedElement(trj_event)
{
	document.body.removeChild(trj_event.target);
}

var trj_dumpLogToFile = function() {
	var trj_textFileAsBlob = new Blob([trj_logBuffer], {type:'trj_text/plain'});
	var trj_fileName = "TrajectoryLog.txt";

	var trj_downloadLink = document.createElement("a");
	trj_downloadLink.download = trj_fileName;
	trj_downloadLink.innerHTML = "Download File";
	if (window.webkitURL != null)
	{
		// Chrome allows the link to be clicked
		// without actually adding it to the DOM.
		trj_downloadLink.href = window.webkitURL.createObjectURL(trj_textFileAsBlob);
	}
	else
	{
		// Firefox requires the link to be added to the DOM
		// before it can be clicked.
		trj_downloadLink.href = window.URL.createObjectURL(trj_textFileAsBlob);
		trj_downloadLink.onclick = trj_destroyClickedElement;
		trj_downloadLink.style.display = "none";
		document.body.appendChild(trj_downloadLink);
	}

	trj_downloadLink.click();
}

window.onerror = function trj_handleException(trj_error, trj_url, trj_lineNum) {
    trj_dumpLogToFile();
    return false;
}

window.onkeydown = function(trj_event) {
	trj_event = trj_event || window.event;
	if(trj_event.keyCode === 81)
		trj_dumpLogToFile();
}