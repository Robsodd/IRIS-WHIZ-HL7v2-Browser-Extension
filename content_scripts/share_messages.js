/// Share Messages
console.log("Share Messages Content Script");
initialImport = false; // Enables import to work
/// HEADERS & TRACE TAB CONTROLS

document.body.innerHTML = ""

let pageDiv = document.createElement("div");
document.body.appendChild(pageDiv);


addButtonBar(document);
buttonBarStyle(document);



messageImportBtn(document);


wrapRowsButton(document);

minimiseAllButton(document);
uncloseAllButton(document);


searchExpandedSchemaButton(document);
schemaModeButton(document);
searchSegmentsButton(document);

textCompareBtn(document);
compareLegendButtons(document);

scrollBarStyle(document);

const queryString = window.location.search;
console.log(queryString);

const urlParams = new URLSearchParams(queryString);

let param_messages = urlParams.getAll('m')
let param_starts = urlParams.getAll('s')
let param_ends = urlParams.getAll('e')
let param_messagesLength = param_messages.length;
for (let i = 0; i < param_messagesLength; i++) {
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
		// on message iframe load get data, create messageDiv and append messageDiv to page
		let messageDiv = document.createElement('div');
		let messageDivContents = document.createElement('div');
		messageDivContents.classList.add("MsgContents");

		messageDiv.id = messageId;
		
		let messageBtnBar = messageButtonBar(document, messageDiv.id)
		messageDiv.appendChild(messageBtnBar);
		messageDiv.appendChild(messageDivContents);

		let message = {messageNumber: parseInt(messageId), object: messageDiv};
		messageStyling(messageDiv);

		messageDivContents.innerHTML = iframe.contentDocument.getElementsByTagName("body")[0].innerHTML;
		
		messageHeading = '<a class="IWMsgTitle" style="padding: 10px">' + messageStartOperation + ' ----> ' + messageEndOperation + '</a>'
		
		messageDivContents.innerHTML = messageHeading + messageDivContents.innerHTML

		messageArray.push(message);

		
		sideBySideCompareButton(document, messageBtnBar);	
		copyRawTextButton(document, messageId, messageBtnBar);
		minimiseButton(document, messageDiv, messageBtnBar);
		closeButtonHide(document, messageBtnBar);
		
		messageAppend(message);

		iframe.parentNode.removeChild(iframe);
		
	});
				
}


function messageAppend(message) {
	
	syncScrolling(document, message.object.children[1]);
	// sort messages so they can be added in the message order
	if (messageArray.length > 1) {
		sortedMessageArray = messageArray.sort((a, b) => {
			return  b.messageNumber - a.messageNumber;
		});
	}
	//console.log("sorted_array", sortedMessageArray);
	let sortedMessageArrayLength = sortedMessageArray.length;
	for (let x = 0; x < sortedMessageArrayLength; x++) {
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
