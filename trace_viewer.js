/// Detailed Trace Viewer
//console.log("Trace Viewer Content Script");

let traceIframe;
let traceMessages;
let traceMessagesCount;
let businessObjects;

// If first message is not HL7 we need to copy the HEAD from the next HL7 message.
let styleCopy = false


let newiframe = document.createElement("iframe");	
	newiframe.style.width = "100%";
	newiframe.style.height = "100%";
	newiframe.scrolling = "auto";
	newiframe.className = "traceViewerIframe";
	newiframe.style.display = "none";
	newiframe.src = stubUrl[0]+"EnsPortal.MessageContents.zen?HeaderClass=Ens.MessageHeader&HeaderId=&btns=disable";
	newiframe.addEventListener("load", function() { 
		newiframe.contentDocument.childNodes[0].childNodes[0].innerHTML = messageStyleString
		console.log("!!!!!!!!!!!!!!!!!!!!!new Iframe loaded!!!!!!!!!!!!!!!!!!!!!");
	})

function fullTraceDisplayOff() {
	fullTrace.style.display = "none";
	fullTraceHeader.className = "tabGroupButtonOff";
}


function fullTraceDisplayOn() {
	fullTrace.style.display = "";
	fullTraceHeader.className = "tabGroupButtonOn";
	headerDetails.style.display = "none";
	bodyDetails.style.display = "none";
	bodyContents.style.display = "none";
	headerHeaderDetails.className = "tabGroupButtonOff";
	headerBodyDetails.className = "tabGroupButtonOff";
	headerBodyContents.className = "tabGroupButtonOff";
}

/// TRACE BODY:
let iframeCounter = 0;
let messageIframesLoaded = 0;

window.addEventListener("load", function() {
	
	traceIframe = document.getElementById("frame_19").getSVGDocument();
	traceMessages = traceIframe.getElementsByTagName("rect");
	traceMessagesCount = traceIframe.getElementsByTagName("circle").length;
	businessObjects = traceIframe.getElementsByClassName("HostTitle");
	tabBar = document.getElementById("bar_26");
	
	fullTraceHeader = tabBar.rows[0].insertCell(7);
	fullTraceHeader.innerHTML = "&nbsp;FullTrace&nbsp;";
	fullTraceHeader.className = "tabGroupButtonOff";
	fullTraceHeader.id = "traceButton";
	fullTraceHeader.title = "Full Message Trace";

	headerHeaderDetails = document.getElementById("btn_1_26");
	headerBodyDetails = document.getElementById("btn_2_26");
	headerBodyContents = document.getElementById("btn_3_26");

	tabGroupBody = document.getElementById("body_26");
	headerDetails = document.getElementById("headerDetails");
	bodyDetails = document.getElementById("bodyDetails");
	bodyContents = document.getElementById("bodyContents");
	fullTrace = document.createElement('div');


	fullTrace.style.display = "none";
	fullTrace.id = "fullTrace";
	fullTrace.style.height = "100%";

	tabGroupBody.appendChild(fullTrace);
	fullTrace.appendChild(newiframe)
	
	fullTraceHeader.addEventListener('click', () => {
		fullTraceDisplayOn();
	})
	headerHeaderDetails.addEventListener('click', () => {
		fullTraceDisplayOff();
	});
	headerBodyDetails.addEventListener('click', () => {
		fullTraceDisplayOff();
	});
	headerBodyContents.addEventListener('click', () => {
		fullTraceDisplayOff();
	});
	
	for (let i = 0; i < traceMessages.length; i++) {
		
		if (traceMessages[i].id.includes("message")) {
			let messageId = traceMessages[i].id.split("_")[1];
			let iframe = document.createElement("iframe");	
			
			let traceMessageUrl = stubUrl[0] + "EnsPortal.MessageContents.zen?HeaderClass=Ens.MessageHeader&HeaderId=";

			if (iframeCounter == 0) {
				// Allow scripts but disable buttons
				iframe.src = traceMessageUrl + String(messageId) + "&btns=disable";
			} else {
				// Prevent unwanted scripts running in iframe
				iframe.src = traceMessageUrl + String(messageId) + "&schema_expansion=disable&text_compare=disable&copy_raw_text=disable";
			}
			
			iframe.style.width = "100%";

			
			if (iframeCounter == 0) { 
				// Use first message iframe as Body to host all messages
				fullTrace.appendChild(iframe);
				console.log("this is the main iframe", iframe);
				mainIframe = iframe;
			} else {
				// All other messages to be scraped from their iframe and then iframe closed
				let br = document.createElement("br");
				document.body.appendChild(br);
				document.body.appendChild(iframe);
				iframe.style.height = iframe.scrollHeight + "px";
				iframe.scrolling = "auto";
				iframe.className = "traceViewerIframe";
				iframe.style.display = "none";
			}
			
			iframe.addEventListener("load", function() {
				messageIframesLoaded ++
				let messageDiv = document.createElement('div');
				messageStyling(messageDiv);
				let unknownElement
				console.log("IFRAME: ", iframe);
				if (iframe == mainIframe) {
					// Check if main frame is a HL7 message:
					//console.log("DOES THIS = HL7???? ",iframe.contentDocument.getElementsByTagName("div")[0].innerHTML.trim().substring(0,3));
					if  (iframe.contentDocument.getElementsByTagName("div")[0].innerHTML.trim().substring(0,3) == "HL7") {
						console.log("MAIN IFRAME:", mainIframe.contentDocument.getElementsByTagName("body")[0]);
						messageDiv.appendChild(mainIframe.contentDocument.getElementsByTagName("body")[0].childNodes[0]);
						messageDiv.appendChild(mainIframe.contentDocument.getElementsByTagName("body")[0].childNodes[0]);
						messageDiv.appendChild(mainIframe.contentDocument.getElementsByTagName("body")[0].childNodes[0]);
						messageDiv.appendChild(mainIframe.contentDocument.getElementsByTagName("body")[0].childNodes[0]);
						messageDiv.appendChild(mainIframe.contentDocument.getElementsByTagName("body")[0].childNodes[0]);
						mainIframe.style.height = "100%";
						scrollBarStyle(mainIframe.contentDocument);
					} else {
						//traceMessagesCount = traceMessagesCount + 1
						// Logic when first message is not HL7 as we need appropriate src to enable scripts to load
						unknownElement = document.createElement("div")
						unknownElement.innerHTML = iframe.contentDocument.childNodes[1].childNodes[1].innerHTML
						messageDiv.appendChild(unknownElement);
						
						fullTrace.removeChild(iframe)
						newiframe.style.display = "";
						iframe = newiframe
						mainIframe = newiframe
						//console.log("mainIframe.contentDocument:???? ", mainIframe.contentDocument);
						mainIframe.contentDocument.getElementsByTagName("body")[0].style = ""
						mainIframe.style.height = "100%";
						scrollBarStyle(mainIframe.contentDocument);
					}
					
				} 
					
				let elems = traceMessages[i].parentElement.children; // This is all the elements that make up our message box
				let messageStartLocation = 0;
				let messageEndLocation = 0;
				let messageClassName; // Used to evaluate if message is send or response
				let messageStartOperation = "" ;
				let messageEndOperation = "";
				let messageType = "";
				let messageHeading;
				
				// Get Starting Operation of Message
				// Loop through elements in the message icons and find the Start Location
				for (let eachElem = 0; eachElem < elems.length; eachElem++ ) {
					if (elems[eachElem].className.animVal.includes("MsgStart")) {
						messageStartLocation = elems[eachElem].attributes.cx.value;
					} else if ((elems[eachElem].className.animVal.includes("MsgLine")) && (messageType == "")) {
						messageClassName = elems[eachElem].className.animVal; // e.g. MsgStart or MsgStartResponse
						if (messageClassName.includes("Response")) {
							messageType = "responder";
						} else {
							messageType = "sender";
						}
					}
				}
				// Loop trough our busines_objects and find the header for the operation that matches our Start Location
				for (let y = 0; y < businessObjects.length; y++) {
					if ((businessObjects[y].attributes.x.value == messageStartLocation) && (businessObjects[y].textContent != "")) {
						messageStartOperation = messageStartOperation + businessObjects[y].innerHTML;			
					}
				}
				// Loop through elements in the message icons and find the End Location
				for (let eachElem = 0; eachElem < elems.length; eachElem++ ) {
					if (elems[eachElem].className.animVal.includes("MsgTerm")) {
						messageEndLocation = parseInt(elems[eachElem].attributes.x.value) + 7;
					}
				}
				
				// Get Ending Operation of Message
				for (let y = 0; y < businessObjects.length; y++) {
					if ((businessObjects[y].attributes.x.value == String(messageEndLocation)) && (businessObjects[y].textContent != "")) {
						messageEndOperation = messageEndOperation + businessObjects[y].innerHTML;
					}					
				}
				
				if (messageType == "responder") {
					messageHeading = '<a style="padding: 10px">' + messageEndOperation + ' <---- ' + messageStartOperation + '</a>';
				} else {
					messageHeading = '<a style="padding: 10px">' + messageStartOperation + ' ----> ' + messageEndOperation + '</a>';
				}
				
				if (iframe != mainIframe) {
					messageDiv.innerHTML = iframe.contentDocument.getElementsByTagName("body")[0].innerHTML;
				}
				
				messageDiv.innerHTML = messageHeading + messageDiv.innerHTML
				
				console.log("mainIframe.contentDocument: ", mainIframe.contentDocument);
				let closeBtnHide = closeButtonHide(mainIframe.contentDocument);
				messageDiv.appendChild(closeBtnHide);
				
				let minimiseBtn = minimiseButton(mainIframe.contentDocument, messageDiv);
				messageDiv.appendChild(minimiseBtn);
				
				try {
					messageDiv.id = messageId;
					messageArray.push({messageNumber: parseInt(messageId), object: messageDiv});
					console.log(messageArray);
					messageAppend();
					let copyRawTextBtn = copyRawTextButton(mainIframe.contentDocument, messageId);
					
					messageDiv.appendChild(copyRawTextBtn);
				} catch(err) {
					// skip
					console.log("unable to add this div: ", messageDiv, err)
				}
									
				if (iframe != mainIframe) {
					iframe.parentNode.removeChild(iframe);
				}
				
				
			});
			iframeCounter ++
		}
		
	
	}
});


function messageAppend() {
	/// Adds all messages to mainIframe in messageNumber order
	console.log("TEST: ", messageIframesLoaded, "/", traceMessagesCount);
	if (messageIframesLoaded == traceMessagesCount) {
		console.log("mainiFraime.contentDocument: ", mainIframe.contentDocument);
		addButtonBar(mainIframe.contentDocument);
		buttonBarStyle(mainIframe.contentDocument);
		
		minimiseAllButton(mainIframe.contentDocument);
		wrapRowsButton(mainIframe.contentDocument);
		uncloseAllButton(mainIframe.contentDocument);
		textCompareBtn(mainIframe.contentDocument);
		compareLegendButtons(mainIframe.contentDocument);

		sortedMessageArray = messageArray.sort((a, b) => {
			return a.messageNumber - b.messageNumber;
		});
		console.log("sortedMessageArray", String(sortedMessageArray.length), sortedMessageArray);
		console.log("messageArray", String(messageArray.length), messageArray);
		for (let x = 0; x < sortedMessageArray.length; x++) {
			syncScrolling(mainIframe.contentDocument, sortedMessageArray[x].object);
			mainIframe.contentDocument.getElementsByTagName("body")[0].appendChild(sortedMessageArray[x].object)
			console.log("!!!!!!!!!!!!!!!!!!!!!mainIframe append child!!!!!!!!!!!!!!!!!!!!!");
		}
		mainIframe.contentDocument.dispatchEvent(addExpansionEvent);
		mainIframe.contentDocument.dispatchEvent(addMouseOverCompare);
				
	}

}


const messageStyleString = `

		<title>Message Content Viewer</title>
		<style type="text/css">
			body {
				font-family: Arial,sans-serif;
				font-size: 1.0em;
				font-weight: regular;
			}
			.portalTitleLink {
				cursor: pointer;
				color: #3B84BC;
				font-weight: regular;
				text-decoration: none;
			}
		</style>
	

	<script type="text/javascript" src="ensemble/Ensemble_Utils.js"></script>
	 <script type="text/javascript">
		try {
			handleZenAutoLogout(915000);
		}
		catch (ex) {}
	</script>

<style>
 
/* EDI Document Table */
TABLE.EDIDocumentTable {
		border: black solid 1px; font-size: 0.8em;
		background: #DDDDFF;
		margin-left: 10px; margin-right: 10px;
		width: 10;
	}
 
TD.EDIDocumentTableExpandor {
		background: #D0D0FF;
		border-bottom: gray solid 1px;
		padding: 2px;
	}
 
TD.EDIDocumentTableSegnum {
		background: white;
		font-weight: bold;
		text-align: right;
		border-bottom: gray solid 1px;
		padding: 2px;
	}
 
TD.EDIDocumentTableSegid {
		background: white;
		border-bottom: gray solid 1px;
		border-right: gray solid 1px;
		padding: 2px;
	}
 
TD.EDIDocumentTableSegname {
		background: #D0D0FF;
		text-align: center;
		font-weight: bold;
		border-bottom: gray solid 1px;
		padding: 2px;
	}
 
/* -- Segment single-row Table */
TABLE.EDISegmentsTable {
		background: white;
		font-size: 0.9em;
		border-bottom: gray solid 1px;
	}
 
TD.EDISegmentsTableValue {
		background: white;
		padding: 2px;
	}
 
TD.EDISegmentsTableSeparator {
		background: white;
		padding: 2px;
	}
 
TD.EDISegmentsTableEmptyfield {
		background: white;
		padding: 2px;
	}
</style>
	
<style id="buttonBarStyle">
.buttonBar {
  list-style-type: none;
  text-align: center;
  margin: 0;
  padding: 0;
  position: sticky;
  top: 0;
  z-index: 2;
}

.buttonBar li {
  display: inline-block;
  margin: 5px;
}
</style>

`
