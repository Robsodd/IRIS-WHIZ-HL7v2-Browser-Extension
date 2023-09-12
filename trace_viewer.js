/// Detailed Trace Viewer
//console.log("Trace Viewer Content Script");

let traceIframe;
let traceMessages;
let traceMessagesCount;
let businessObjects;
let currentRelated = "";
let showRelatedLines = [];


var clickEvent = document.createEvent ('MouseEvents');

// If first message is not HL7 we need to copy the HEAD from the next HL7 message.
let styleCopy = false;


let newiframe = document.createElement("iframe");	
	newiframe.style.width = "100%";
	newiframe.style.height = "100%";
	newiframe.scrolling = "auto";
	newiframe.className = "traceViewerIframe";
	newiframe.style.display = "none";
	newiframe.src = stubUrl[0]+"EnsPortal.MessageContents.zen?HeaderClass=Ens.MessageHeader&HeaderId=&btns=disable";
	newiframe.addEventListener("load", function() { 
		newiframe.contentDocument.childNodes[0].childNodes[0].innerHTML = messageStyleString
		//console.log("!!!!!!!!!!!!!!!!!!!!!new Iframe loaded!!!!!!!!!!!!!!!!!!!!!");
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
	
	/*
	headerHeaderDetails.addEventListener('click', () => {
		fullTraceDisplayOff();
	});
	headerBodyDetails.addEventListener('click', () => {
		fullTraceDisplayOff();
	});
	headerBodyContents.addEventListener('click', () => {
		fullTraceDisplayOff();
	});
	*/
	
		// Click behaviour for tabs
	let fullTraceDisplayTabElements = [headerHeaderDetails, headerBodyDetails, headerBodyContents]
	let fullTraceDisplayBodyElements = [headerDetails, bodyDetails, bodyContents] // Order must match above array
	
	for (let i = 0; i < fullTraceDisplayTabElements.length; i++) {
		fullTraceDisplayTabElements[i].addEventListener('click', (e) => {
			console.log("ELEM CLICKED: ", fullTraceDisplayTabElements[i], fullTraceDisplayBodyElements[i]);
			console.log("currentTarget", e.currentTarget);
			e.currentTarget.setAttribute("class", "tabGroupButtonOn");
			fullTraceDisplayBodyElements[i].style.display = "";
			// THE RELATED DIV .style.display = "";
			fullTraceDisplayOff();
		});
	}
	
	fillFullTraceTab();
	
});

function fillFullTraceTab() {
	traceIframe = document.getElementById("frame_19").getSVGDocument();
	traceMessages = traceIframe.getElementsByTagName("rect");
	traceMessagesCount = traceIframe.getElementsByTagName("circle").length;
	businessObjects = traceIframe.getElementsByClassName("HostTitle");

	
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
				//console.log("this is the main iframe", iframe);
				mainIframe = iframe;
			} else {
				// All other messages to be scraped from their iframe and then iframe closed
				//let br = document.createElement("br");
				//document.body.appendChild(br);
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
				//console.log("IFRAME: ", iframe);
				if (iframe == mainIframe) {
					// Check if main frame is a HL7 message:
					//console.log("DOES THIS = HL7???? ",iframe.contentDocument.getElementsByTagName("div")[0].innerHTML.trim().substring(0,3));
					if  (iframe.contentDocument.getElementsByTagName("div")[0].innerHTML.trim().substring(0,3) == "HL7") {
						//console.log("MAIN IFRAME:", mainIframe.contentDocument.getElementsByTagName("body")[0]);
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
					



				let messageHeading;
				
				traceMessages[i].locationInfo = getMessageLocations(traceMessages[i])
				//console.log("traceMessages[i].locationInfo", traceMessages[i].locationInfo)
				
				if (traceMessages[i].locationInfo.messageType == "responder") {
					messageHeading = '<a style="padding: 10px">' + traceMessages[i].locationInfo.endOperation + ' <---- ' + traceMessages[i].locationInfo.startOperation + '</a>';
				} else {
					messageHeading = '<a style="padding: 10px">' + traceMessages[i].locationInfo.startOperation + ' ----> ' + traceMessages[i].locationInfo.endOperation + '</a>';
				}
				
				if (iframe != mainIframe) {
					try {
						messageDiv.innerHTML = iframe.contentDocument.getElementsByTagName("body")[0].innerHTML;
					} catch {
						messageDiv.innerHTML = '</br><p style="color:red">Unable to retrieve HTML content.</p>'
					}
				}
				
				messageDiv.innerHTML = messageHeading + messageDiv.innerHTML
				messageDiv.id = messageId;
				
				let messageBtnBar = messageButtonBar(mainIframe.contentDocument, messageDiv.id)
				messageDiv.appendChild(messageBtnBar);
				
				closeButtonHide(mainIframe.contentDocument, messageBtnBar);
				minimiseButton(mainIframe.contentDocument, messageDiv, messageBtnBar);
				copyRawTextButton(mainIframe.contentDocument, messageId, messageBtnBar);
				
				try {
					//console.log("traceMessages", traceMessages[i]);
					if (traceMessages[i].className.baseVal == "MsgOutlineSelect") {
						messageDiv.setAttribute('selected', 'true');
						messageDiv.style.backgroundColor = "rgb(243,231,153)";
					} else {
						messageDiv.setAttribute("selected", "");
					}
					//messageDiv.setAttribute("selected","");
					// Add message to messageArray
					messageArray.push({messageNumber: parseInt(messageId), object: messageDiv, locationInfo: traceMessages[i].locationInfo, svgComponent: traceMessages[i]});
					
					// Connect Visual Trace svg elements to their corresponding messageDiv in the FullTrace tab
					traceMessages[i].parentElement.addEventListener('mouseover', () => {
						traceMessages[i].style.fill = "#d5d5d5";
						if (messageDiv.getAttribute("selected") == "") {
							messageDiv.style.backgroundColor = "#d5d5d5";
						}
					})
					
					traceMessages[i].parentElement.addEventListener('mouseout', () => {
						traceMessages[i].style.fill = "";
						if (messageDiv.getAttribute("selected") == "") {
							messageDiv.style.backgroundColor = "white";
						}
					})
					
					traceMessages[i].parentElement.addEventListener('click', (e) => {				
							for (let i = 0; i < messageArray.length; i ++) {
								messageArray[i].object.setAttribute('selected',"");
								messageArray[i].object.style.backgroundColor = "white";
							}
							messageDiv.style.backgroundColor = "rgb(243,231,153)";
							messageDiv.setAttribute("selected","true");
					})
					
					messageDiv.addEventListener('mouseover', () => {
						traceMessages[i].style.fill = "#d5d5d5";
						if (messageDiv.getAttribute("selected") == "") {
							messageDiv.style.backgroundColor = "#d5d5d5";
						}
					})
					messageDiv.addEventListener('mouseout', () => {
						traceMessages[i].style.fill = "";
						if (messageDiv.getAttribute("selected") == "") {
							messageDiv.style.backgroundColor = "white";
						}
						
					})
					
					// Scroll to svg element in Trace window on CTRL click messageDiv
					messageDiv.addEventListener('click', (e) => {
						let ctrl = window.event.ctrlKey
						//console.log("keydown triggered");
						if (ctrl) {
														
							let traceIframeScroll = document.getElementById("svgdiv_19");
							//console.log(traceIframeScroll, traceMessages[i].locationInfo.yValue, parseInt(traceMessages[i].locationInfo.startLocation));
							traceIframeScroll.scrollTop = parseInt(traceMessages[i].locationInfo.yValue) - 10
							traceIframeScroll.scrollLeft = parseInt(traceMessages[i].locationInfo.startLocation) - 40
							
						} else {
							
							// Select the matching trace SVG message
							if ((messageDiv.getAttribute('selected') == "") && (e.target ==  e.currentTarget)) {
							for (let i = 0; i < messageArray.length; i ++) {
								messageArray[i].object.setAttribute('selected',"");
								messageArray[i].object.style.backgroundColor = "white"
							}
							messageDiv.style.backgroundColor = "rgb(243,231,153)"
							messageDiv.setAttribute("selected","true");
							clickEvent.initEvent ("mousedown", true, true);
							traceMessages[i].parentElement.dispatchEvent (clickEvent);
						}
							
						}
						
						
					})
										
					//console.log(messageArray);
					messageAppend();

				} catch(err) {
					// skip
					//console.log("unable to add this div: ", messageDiv, err)
				}
									
				if (iframe != mainIframe) {
					iframe.parentNode.removeChild(iframe);
				}
				
				
			});
			iframeCounter ++
		}
		
	
	}
}



function getMessageLocations(message) {
	let elems = message.parentElement.children; // This is all the elements that make up our message box
	
	let messageStartLocation = 0;
	let messageEndLocation = 0;
	let yValue = 0;
	let messageClassName; // Used to evaluate if message is send or response
	let messageStartOperation = "" ;
	let messageEndOperation = "";
	let messageType = "";
	
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
			yValue = parseInt(elems[eachElem].attributes.y.value);
		}
	}
	
	// Get Ending Operation of Message
	for (let y = 0; y < businessObjects.length; y++) {
		if ((businessObjects[y].attributes.x.value == String(messageEndLocation)) && (businessObjects[y].textContent != "")) {
			messageEndOperation = messageEndOperation + businessObjects[y].innerHTML;
		}					
	}
	
	let locationInfo = {
		startLocation: String(messageStartLocation),
		endLocation: String(messageEndLocation),
		yValue: yValue,
		startOperation: messageStartOperation,
		endOperation: messageEndOperation,
		messageType: messageType
	}
	return locationInfo
	
}

function showRelatedButtonLogic(showRelatedBtn) {
	
	
	
	showRelatedBtn.addEventListener('click', () => {
		
		// remove lines
		for (let x = 0; x < showRelatedLines.length; x++) {
			showRelatedLines[x].parentElement.removeChild(showRelatedLines[x]);
		}
		showRelatedLines = [];
		
		// Toggle if currentRelated is same as selected.
		if (currentRelated != "") {
			for (let i =0; i < messageArray.length; i++) {
				if (messageArray[i].object.getAttribute("selected")) {
					if (messageArray[i] == currentRelated) {
						currentRelated = "";
						if (hideUnrelatedCount % 2 == 1) {
							hideUnrelatedBtn.click();
							hideUnrelatedBtn.style.display = "none";
						} else {
							hideUnrelatedBtn.style.display = "none";
						}
						for (let i =0; i < messageArray.length; i++) {
							messageArray[i].object.style.display = "";
							messageArray[i].appended = false;
							messageArray[i].svgComponent.style.stroke = "";
							messageArray[i].svgComponent.style.strokeWidth = "";
						}
						return
										
					}
				}
			}
		} else {
			hideUnrelatedBtn.style.display = "";
		}
		
		// Hide everything
		//let messages = messageDocument.getElementsByClassName("MsgOutline");
		for (let i =0; i < messageArray.length; i++) {
			if (messageArray[i].object.getAttribute("selected") != "") {
				currentRelated = messageArray[i]
			}
			messageArray[i].object.style.display = "none";
			messageArray[i].appended = false;
			messageArray[i].svgComponent.style.stroke = "";
			messageArray[i].svgComponent.style.strokeWidth = "";
		}
		
		// Find selected/highlighted SVG icon
		let selectedMessage = traceIframe.getElementsByClassName("MsgOutlineSelect");
		for (let i =0; i < messageArray.length; i++) {
			let messageText = selectedMessage[0].id
			let messageId = messageText.slice(8)
			if (messageId == String(messageArray[i].messageNumber)) {
				messageArray[i].object.style.display = "";
				messageArray[i].appended = true;
				messageArray[i].svgComponent.style.stroke = "red";
				messageArray[i].svgComponent.style.strokeWidth = 8;
				findRelated(messageArray[i]);
			}
				
		}
		
		function findRelated(messageInput) {
			getEndConnected(messageInput);
			getStartConnected(messageInput);	
		}
		
	});
	
}

function getEndConnected(messageInput) {
	
	//console.log("getEndConnected", messageInput);
	let lineCounter = 0;
	for (let i = 0; i < messageArray.length; i++) {
		// check not original or already appended.
		if ((messageArray[i].appended == false)&& (messageInput.locationInfo.yValue < messageArray[i].locationInfo.yValue)) {
			//console.log(messageInput.locationInfo.endLocation, messageArray[i].locationInfo.startLocation);
			
			// Highlight message
			if 	((messageInput.locationInfo.endLocation == messageArray[i].locationInfo.startLocation)) {
				messageArray[i].appended = true;
				messageArray[i].object.style.display = "";
				messageArray[i].svgComponent.style.stroke = "red";
				messageArray[i].svgComponent.style.strokeWidth = 8;

				getEndConnected(messageArray[i]);
				//if (messageArray[i].locationInfo.messageType != "responder") {
				//}
			}
			// Add line
			if (lineCounter < 100) {
				if (messageInput.locationInfo.endLocation == messageArray[i].locationInfo.startLocation) {
					lineCounter = lineCounter + 1;
					let tempLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
					tempLine.setAttribute("class", "MsgLineRequest");
					tempLine.setAttribute("x1", String(messageInput.locationInfo.endLocation));
					tempLine.setAttribute("y1", String(messageArray[i].locationInfo.yValue)); // start vertical line to at current node (message input)
					tempLine.setAttribute("x2", String(messageInput.locationInfo.endLocation));
					tempLine.setAttribute("y2", String(messageInput.locationInfo.yValue + 20)); // end vertical line at previous node
					tempLine.setAttribute("type", "getEndConnected"); // end vertical line at previous node
					tempLine.style.stroke = "red";
					tempLine.style.strokeWidth = "8";
					showRelatedLines.push(tempLine);
					if (lineCounter > 1) {
						tempLine.style.stroke = "red";
						tempLine.style.opacity = "0.5";
						messageInput.svgComponent.parentElement.appendChild(tempLine);
					} else {
						messageArray[i].svgComponent.parentElement.appendChild(tempLine);
					}
					
				} else {
					
				}
			}
			
		}
	}

}

function getStartConnected(messageInput) {
	
	let lineCounter = 0;
	//console.log("getStartConnected", messageInput);
	//console.log("messageArray", messageArray.length);
	for (let i = messageArray.length - 1; i > -1; i--) {
		//console.log("messageArray[", i);
		// Ignore if already processed & ensure message is earlier
		if ((messageArray[i].appended == false) && (messageInput.locationInfo.yValue > messageArray[i].locationInfo.yValue)) {
			//console.log(messageInput.locationInfo.startLocation, messageArray[i].locationInfo.endLocation);
			
			// Highlight message
			if 	(messageInput.locationInfo.startLocation == messageArray[i].locationInfo.endLocation) {
				messageArray[i].appended = true;
				messageArray[i].object.style.display = "";
				messageArray[i].svgComponent.style.stroke = "red";
				messageArray[i].svgComponent.style.strokeWidth = 8;
				getStartConnected(messageArray[i])
			}
			
			if (lineCounter < 1) {
				if (messageInput.locationInfo.startLocation == messageArray[i].locationInfo.endLocation) {
					// Add temporary line - vertical line to previous node
					lineCounter = lineCounter + 1;
					let tempLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
					tempLine.setAttribute("class", "MsgLineRequest");
					tempLine.setAttribute("x1", String(messageInput.locationInfo.startLocation));
					tempLine.setAttribute("y1", String(messageArray[i].locationInfo.yValue + 20)); // start vertical line to at current node (message input)
					tempLine.setAttribute("x2", String(messageInput.locationInfo.startLocation));
					tempLine.setAttribute("y2", String(messageInput.locationInfo.yValue)); // end vertical line at previous node
					tempLine.setAttribute("type", "getStartConnected"); // end vertical line at previous node
					tempLine.style.stroke = "red";
					tempLine.style.strokeWidth = "8";
					messageInput.svgComponent.parentElement.appendChild(tempLine);
					showRelatedLines.push(tempLine);
				}
			}
		}
	}	
	
}

function messageAppend() {
	/// Adds all messages to mainIframe in messageNumber order
	//console.log("TEST: ", messageIframesLoaded, "/", traceMessagesCount);
	if (messageIframesLoaded == traceMessagesCount) {
		//console.log("mainiFraime.contentDocument: ", mainIframe.contentDocument);
		addButtonBar(mainIframe.contentDocument);
		buttonBarStyle(mainIframe.contentDocument);
		
		minimiseAllButton(mainIframe.contentDocument);
		wrapRowsButton(mainIframe.contentDocument);
		uncloseAllButton(mainIframe.contentDocument);
		textCompareBtn(mainIframe.contentDocument);
		compareLegendButtons(mainIframe.contentDocument);
		searchExpandedSchemaButton(mainIframe.contentDocument);
		
		let showRelatedBtn = showRelatedButton(mainIframe.contentDocument);
		showRelatedButtonLogic(showRelatedBtn);
		
		let hideUnrelatedBtn = hideUnrelatedButton(mainIframe.contentDocument);
		hideUnrelatedLogic(hideUnrelatedBtn);
		
		sortedMessageArray = messageArray.sort((a, b) => {
			return a.messageNumber - b.messageNumber;
		});
		//console.log("sortedMessageArray", String(sortedMessageArray.length), sortedMessageArray);
		//console.log("messageArray", String(messageArray.length), messageArray);
		for (let x = 0; x < sortedMessageArray.length; x++) {
			syncScrolling(mainIframe.contentDocument, sortedMessageArray[x].object);
			mainIframe.contentDocument.getElementsByTagName("body")[0].appendChild(sortedMessageArray[x].object);
			//console.log("!!!!!!!!!!!!!!!!!!!!!mainIframe append child!!!!!!!!!!!!!!!!!!!!!");
		}
		mainIframe.contentDocument.dispatchEvent(addExpansionEvent);
		mainIframe.contentDocument.dispatchEvent(addMouseOverCompare);
				
	}

}

let hideUnrelatedCount = 0
function hideUnrelatedLogic(hideUnrelatedBtn) {
	
	hideUnrelatedBtn.addEventListener('click', () => {
		let display = "none";
		if (hideUnrelatedCount % 2 == 1) {
			display = "";
		}

		let traceIframeCanvas = traceIframe.getElementById("zenCanvas");
		let traceG = traceIframeCanvas.getElementsByTagName("g");
		let traceRuleMarker1 = traceIframeCanvas.getElementsByClassName("ruleMarker1");
		let traceEventMarkerBack = traceIframeCanvas.getElementsByClassName("eventMarkerBack");
		
		for (let i = 0; i < traceG.length; i++){
			traceG[i].style.display = display;
		}
		for (let i = 0; i < traceRuleMarker1.length; i++){
			traceRuleMarker1[i].style.display = display;
		}
		for (let i = 0; i < traceEventMarkerBack.length; i++){
			traceEventMarkerBack[i].style.display = display;
		}
		//console.log(messageArray)
		for (let i = 0; i < messageArray.length; i ++) {
			
			if (messageArray[i].appended == true) {
				messageArray[i].svgComponent.parentElement.style.display = "";
			}
		}
		
		hideUnrelatedCount ++
		
		// Improvement Idea 
		// Iterate through each child element of "g" and adjust element's y value to push all messages to top.
		// must remember inital value to toggle back to
		
	});
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
