/// COPY RAW text
console.log("Copy RAW text Content Script");

document.addEventListener("copyRawText", function(e) {
	console.log("copyRawText Listener Triggered");
	copyRaw(e.messageNumber);
});

if (currentUrl.includes("VisualTrace.zen")) {
	// Event listener handles this case.
} else {
	// Add copy Raw Button

	if (currentUrl.includes("&btns=disable")) {
		// Skip creating the buttons!
	} else {
		
		addButtonBar(document);
		buttonBarStyle(document);
		copyRawTextButtonBar(document);
	}
}


function copyRaw(messageNumber) {
	
	let messageUrl = stubUrl[0] + "EnsPortal.MessageContents.zen?HeaderClass=Ens.MessageHeader&HeaderId="
	let requestUrl = messageUrl + String(messageNumber) + "&RAW=1";
	//console.log(messageRequest(requestUrl, messageNumber));
	
	let iframe = document.createElement("iframe");
	
	iframe.src = messageUrl + String(messageNumber) + "&RAW=1";
	iframe.style.display = "none";
	iframe.style.position = "fixed";
	iframe.style.top = "0px";
	iframe.id = String(messageNumber) + "RAWTEXT";
	
	iframe.addEventListener("load", function() {
		let copyText = iframe.contentDocument.querySelector("body > pre").innerText;
		const textArea = document.createElement("textarea");
		
		textArea.value = copyText;
		document.body.appendChild(textArea);

		textArea.select();
		try {
			document.execCommand('copy');
		} catch (err) {
			console.error('Unable to copy to clipboard', err);
		}
		document.body.removeChild(iframe);
		document.body.removeChild(textArea);
		
	});
	document.body.appendChild(iframe);
	
}



function messageRequest(theUrl, messageNumber) {
	
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.onreadystatechange = function() { 
		if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
			console.log("Inside: ", xmlHttp.responseText);
			//JSON.parse(xmlHttp.responseText)
			let responseMsg = xmlHttp.responseText.split('<pre style="padding: 5px;">')[1].split('</pre>')[0]
			console.log(responseMsg);
			const textArea = document.createElement("textarea");
			textArea.value = responseMsg;
			//textArea.src = messageUrl + String(messageNumber) + "&RAW=1";
			textArea.style.display = "none";
			textArea.style.position = "fixed";
			textArea.style.top = "0px";
			textArea.id = String(messageNumber) + "RAWTEXT";
			
			try {
				document.execCommand('copy');
			} catch (err) {
				console.error('Unable to copy to clipboard', err);
			}
			return responseMsg;
	}
	xmlHttp.open("GET", theUrl, true); // true for asynchronous 
	xmlHttp.send(null);

}

