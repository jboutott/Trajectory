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
	text = findBlocks(text, "if");
	text = findBlocks(text, "switch");
	//( ? : );
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
		console.log(text.charAt(opening) + " " + text.charAt(current - 1));
		//text = logBetween(text, opening, current - 1);
	}while(true);
	
	return text;
}

var logBetween = function(text, first, last) {
	//text = [text.slice(0, first + 1), "logValue(", text.slice(first + 2)].join('');
	//text = [text.slice(0, last), ")", text.slice(last + 1)].join('');
	
	return text;
}

var logValue = function(value) {
	var result = eval(value);
	logBuffer += result + "\n";
	return result;
}