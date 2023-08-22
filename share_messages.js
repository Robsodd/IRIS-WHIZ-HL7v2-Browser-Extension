/// Share Messages
console.log("Share Messages Content Script");

/// HEADERS & TRACE TAB CONTROLS

document.body.innerHTML = ""

let pageDiv = document.createElement("div");
document.body.appendChild(pageDiv);


addButtonBar(document);
buttonBarStyle(document);
		
minimiseAllButton(document);
wrapRowsButton(document);
uncloseAllButton(document);
//shareButton(document);
textCompareBtn(document);
compareLegendButtons(document);

scrollBarStyle(document);

const queryString = window.location.search;
console.log(queryString);

const urlParams = new URLSearchParams(queryString);

let param_messages = urlParams.getAll('m')
let param_starts = urlParams.getAll('s')
let param_ends = urlParams.getAll('e')

for (let i = 0; i < param_messages.length; i++) {
	let param_message = {messageNumber: param_messages[i], messageStartOperation: param_starts[i], messageEndOperation: param_ends[i], }
	add_message_to_page(param_message);
	if (i == param_message.length-1) {
		document.dispatchEvent(addExpansionEvent);
		document.dispatchEvent(addMouseOverCompare);
	}
}
		
		
function add_message_to_page(param_message) {

	 // Message number
	let messageId = param_message.messageNumber;
	let messageStartOperation = param_message.messageStartOperation;

	let messageEndOperation = param_message.messageEndOperation;
	let messageHeading;
	/// THIS
	let traceMessageUrl = stubUrl[0] + "EnsPortal.MessageContents.zen?HeaderClass=Ens.MessageHeader&HeaderId=";


	let iframe = document.createElement("iframe");	

			

	iframe.src = traceMessageUrl + String(messageId) + "&schema_expansion=disable&text_compare=disable&copy_raw_text=disable";
	iframe.style.width = "100%";


	// All messages to be scraped from their iframe and then iframe closed
	document.body.appendChild(iframe);
	iframe.style.height = iframe.scrollHeight + "px";
	iframe.scrolling = "auto";
	iframe.className = "traceViewerIframe";
	iframe.style.display = "none";
	
	
	iframe.addEventListener("load", function() {
		//message_iframes_loaded ++
		let messageDiv = document.createElement('div');
		let message = {messageNumber: parseInt(messageId), object: messageDiv};
		messageStyling(messageDiv);

		messageDiv.innerHTML = iframe.contentDocument.getElementsByTagName("body")[0].innerHTML;
		
		messageHeading = '<a style="padding: 10px">' + messageStartOperation + ' ----> ' + messageEndOperation + '</a>'
		
		messageDiv.innerHTML = messageHeading + messageDiv.innerHTML

		let closeButton = closeButtonHide(document);
		messageDiv.appendChild(closeButton);
		
		let minimizeButton = minimiseButton(document, messageDiv);
		messageDiv.appendChild(minimizeButton);
		
		let copyRawTextBtn = copyRawTextButton(document, messageId)
		/*
		buttonStyling(copyRawTextBtn);
		copyRawTextBtn.style.backgroundColor = "lightgrey";
		copyRawTextBtn.style.top = "5px";
		copyRawTextBtn.style.right = "67px";
		copyRawTextBtn.style.position = "absolute";
		copyRawTextBtn.title = "Copy message as raw text";
		copyRawTextBtn.innerText = "Copy Raw";
		*/
		messageArray.push(message);

		messageDiv.id = messageId;
		
		messageAppend(message);
		/*
		copyRawTextBtn.addEventListener('click', () => {
			copyRawText.messageNumber = String(messageId);
			document.dispatchEvent(copyRawText);
		});
		*/
		messageDiv.appendChild(copyRawTextBtn);
		iframe.parentNode.removeChild(iframe);
		
	});
				
}


function messageAppend(message) {
	
	
	syncScrolling(document, message.object);
	// Cycle through array. 
	//console.log("messageArray", messageArray, messageArray[0].messageNumber);
	if (messageArray.length > 1) {
		sortedMessageArray = messageArray.sort((a, b) => {
			return  b.messageNumber - a.messageNumber;
		});
	}
	//console.log("sorted_array", sortedMessageArray);
	for (let x = 0; x < sortedMessageArray.length; x++) {
		//console.log("sorted array messageNumber:", sortedMessageArray[x].messageNumber);
		
		if (sortedMessageArray[x] == message) {
			try {
				document.getElementsByTagName("body")[0].insertBefore(sortedMessageArray[x].object, sortedMessageArray[x+1].object);
			} catch {
				document.getElementsByTagName("body")[0].appendChild(sortedMessageArray[x].object);
			}
		}
	}
	
	if ((sortedMessageArray.length == 0) && (messageArray[0] == message)) {
		document.getElementsByTagName("body")[0].appendChild(message.object);
		sortedMessageArray.push(message.object);
	}
	//console.log("DISPATCH EVENT!");
	document.dispatchEvent(addExpansionEvent);
	document.dispatchEvent(addMouseOverCompare);
	
}
