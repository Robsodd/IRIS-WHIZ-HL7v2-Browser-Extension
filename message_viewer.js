/// Message Viewer Content Script
console.log("Message Viewer Content Script");

let resultsDiv;
let resultsMessages;
let headerMessageTrace;
let traceContent;
let messageViewerBtnBar;
messageViewerBtnBar = messageViewerButtonBar(document);

console.log(messageViewerBtnBar);

window.addEventListener("load", function() {

	

	chrome.storage.local.get({
		settings: {},	
		},	function(stored) {
			if (stored.settings.TimeFormat) {
				// Change time format to COMPLETE
				let timeFormat = document.getElementById("control_27");
				timeFormat.click();
				timeFormat.value = "999";
				//timeFormat.click();
				delay(1000).then(() => {
					timeFormat.value = "999";
				})
				
			}
			
			if (stored.settings.SortOrder) {
				// Change SortOrder to OLDEST FIRST
				let sortOrder = document.getElementById("control_26");
				sortOrder.click();
				sortOrder.value = "1";
				//sortOrder.click();
				delay(1000).then(() => {
					sortOrder.click();
					sortOrder.value = "1";
				})
			}		
		}
	);
	
	// HEADERS & TRACE TAB CONTROLS
	resultsDiv = document.getElementById("resultsTable")
	resultsMessages = resultsDiv.getElementsByTagName("tr")

	tabBar = document.getElementById("bar_82")
	fullTraceHeader = tabBar.rows[0].insertCell(9);
	fullTraceHeader.innerHTML = "&nbsp;Selected Messages&nbsp;";
	fullTraceHeader.className = "tabGroupButtonOff";
	fullTraceHeader.id = "selectedMessagesTab";
	fullTraceHeader.title = "Selected Messages";

	headerHeaderDetails = document.getElementById("btn_1_82");
	headerBodyDetails = document.getElementById("btn_2_82");
	headerBodyContents = document.getElementById("btn_3_82");
	headerMessageTrace = document.getElementById("btn_4_82");

	// BODY
	tabGroupBody = document.getElementById("body_82");
	headerDetails = document.getElementById("headerDetails");
	bodyDetails = document.getElementById("bodyDetails");
	bodyContents = document.getElementById("bodyContents");
	traceContent = document.getElementById("traceContent");
	selecteMessagesTab = document.createElement('div');

	let notice = "<i>Check a message's checkbox to show the message here.</i>";
	selecteMessagesTab.innerHTML = notice + selecteMessagesTab.innerHTML;
	selecteMessagesTab.style.display = "none";
	selecteMessagesTab.id = "selecteMessagesTab";
	selecteMessagesTab.style.height = "100%";
	
	// Click behaviour for tabs
	let fullTraceDisplayTabElements = [headerHeaderDetails, headerBodyDetails, headerBodyContents, headerMessageTrace]
	let fullTraceDisplayBodyElements = [headerDetails, bodyDetails, bodyContents, traceContent] // Order must match above array
	let fullTraceDisplayTabElementsLength = fullTraceDisplayTabElements.length;
	for (let i = 0; i < fullTraceDisplayTabElementsLength; i++) {
		fullTraceDisplayTabElements[i].addEventListener('click', (e) => {
			console.log("ELEM CLICKED: ", fullTraceDisplayTabElements[i], fullTraceDisplayBodyElements[i]);
			console.log("currentTarget", e.currentTarget);
			e.currentTarget.setAttribute("class", "tabGroupButtonOn");
			fullTraceDisplayBodyElements[i].style.display = "";
			// THE RELATED DIV .style.display = "";
			fullTraceDisplayOff();
		});
	}
	
	tabGroupBody.appendChild(selecteMessagesTab);

	fullTraceHeader.addEventListener('click', () => {
		fullTraceDisplayOn();
	})

	// This event listener triggers on row selection.
	resultsDiv.addEventListener("change", function(e) {
		
		// Check that it was the checkbox being clicked
		if (e.target.type == "checkbox") {
			
			let messageId = e.target.parentElement.parentElement.children[3].innerText;
			//console.log("messageID = ", messageId);
			let messageSearchNumber = e.target.parentElement.parentElement.children[2].innerText;
			let messageCreated = e.target.parentElement.parentElement.children[4].innerText;
			let messageStatus = e.target.parentElement.parentElement.children[7].innerText;
			
			// Default checkbox value is 'on' - treat the same as "unchecked"
			if ((e.target.value == "on") || (e.target.value == "unchecked"))  {
				e.target.value = "checked";
				let messageStartOperation = e.target.parentElement.parentElement.children[8].innerText;
				let messageEndOperation = e.target.parentElement.parentElement.children[9].innerText;
				let messageHeading;
				let traceMessageUrl = stubUrl[0] + "EnsPortal.MessageContents.zen?HeaderClass=Ens.MessageHeader&HeaderId=";
				let iframe = document.createElement("iframe");	

				if (!mainIframe) {
					iframe.src = traceMessageUrl + String(messageId) + "&btns=disable";
				} else {
					iframe.src = traceMessageUrl + String(messageId) + "&schema_expansion=disable&text_compare=disable&copy_raw_text=disable";
				}
				
				iframe.style.width = "100%";
				
				if (!mainIframe) {
					// Use first message iframe as Body to host all messages
					iframe.style.display = "none";

					selecteMessagesTab.appendChild(iframe);
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

					let messageDiv = document.createElement('div');
					let messageDivContents = document.createElement('div');
					messageDivContents.classList.add("MsgContents");
					let message = {messageNumber: parseInt(messageId), object: messageDiv, messageStartOperation: messageStartOperation, messageEndOperation: messageEndOperation,};
					messageStyling(messageDiv);
					if (messageStatus != "OK") {
						messageDiv.style.borderColor = "red"
					}
					if (iframe == mainIframe) {
						// Check if main frame is a HL7 message:
						//console.log("DOES THIS = HL7???? ",iframe.contentDocument.getElementsByTagName("div")[0].innerHTML.trim().substring(0,3));
						if  (iframe.contentDocument.getElementsByTagName("div")[0].innerHTML.trim().substring(0,3) == "HL7") {
							//console.log("MAIN IFRAME:", mainIframe.contentDocument.getElementsByTagName("body")[0].innerHTML);
							messageDivContents.appendChild(mainIframe.contentDocument.getElementsByTagName("body")[0].childNodes[0]);
							messageDivContents.appendChild(mainIframe.contentDocument.getElementsByTagName("body")[0].childNodes[0]);
							messageDivContents.appendChild(mainIframe.contentDocument.getElementsByTagName("body")[0].childNodes[0]);
							messageDivContents.appendChild(mainIframe.contentDocument.getElementsByTagName("body")[0].childNodes[0]);
							messageDivContents.appendChild(mainIframe.contentDocument.getElementsByTagName("body")[0].childNodes[0]);
							mainIframe.style.display = "";
							
							// Add buttons to main iframe
							addButtonBar(mainIframe.contentDocument);
							buttonBarStyle(mainIframe.contentDocument);
							
							minimiseAllButton(mainIframe.contentDocument);
							wrapRowsButton(mainIframe.contentDocument);
							shareButton(mainIframe.contentDocument);
							textCompareBtn(mainIframe.contentDocument);
							compareLegendButtons(mainIframe.contentDocument);
							searchExpandedSchemaButton(mainIframe.contentDocument);
							searchSegmentsButton(mainIframe.contentDocument);

							
							mainIframe.style.width = "99%";
							mainIframe.style.height = "95%";
							
							scrollBarStyle(mainIframe.contentDocument);
							
						} else {
							let unknownElement = document.createElement("div")
							unknownElement.innerText = "*The first message is not a HL7 message. This situation is yet to be catered for.";
							messageDivContents.appendChild(unknownElement);
							messageDivContents.appendChild(mainIframe.contentDocument.getElementsByTagName("body")[0].childNodes);
							//messageDiv.appendChild(mainIframe.contentDocument.getElementsByTagName("body")[0].childNodes[0]);
						}
						
						//messageDiv.innerHTML = iframe.contentDocument.getElementsByTagName("body")[0].innerHTML;
						
						// mainIframe.contentDocument.getElementsByTagName("body")[0].appendChild(messageDiv);
					} else {
						messageDivContents.innerHTML = iframe.contentDocument.getElementsByTagName("body")[0].innerHTML;
					}
					
					messageHeading = '<a class="IWMsgTitle" style="color: red; padding: 10px"">#' + String(messageSearchNumber) + ' ' + messageCreated + '</a><br><a style="padding: 10px">' + messageStartOperation + ' ----> ' + messageEndOperation + '</a>';
					messageDivContents.innerHTML = messageHeading + messageDivContents.innerHTML;
					
					let closeButton = document.createElement('btn');
					let li = document.createElement('li');
					li.appendChild(closeButton)
					//buttonStyling(closeButton);
					closeButton.innerText = "x";
					closeButton.style.position = "relative";
					closeButton.classList.add("WhizButton");
					closeButton.classList.add("closeBtnDelete");
					
					closeButton.addEventListener('click', () => {
						closeButton.parentNode.parentNode.style.display = "none";
						// Uncheck box?
						// remove message from messageArray and sortedMessageArray
						

						//console.log("messageDiv element to be removed: ", messageDiv);
						message.object.parentElement.removeChild(message.object);					
						// Remove from the array
						messageArray = messageArray.filter(obj => {
						  return obj.messageNumber !== parseInt(messageId);
						})
						sortedMessageArray = sortedMessageArray.filter(obj => {
						  return obj.messageNumber !== parseInt(messageId);
						})
						
						
					})
					
					messageArray.push(message);
					messageDiv.id = messageId;
					

					let messageBtnBar = messageButtonBar(mainIframe.contentDocument, messageDiv.id)
					messageDiv.appendChild(messageBtnBar);
					messageDiv.appendChild(messageDivContents);
					messageAppend(message);
					
					// Add buttons to messageDiv
					
					
					//closeButtonHide(mainIframe.contentDocument, messageBtnBar);
					copyRawTextButton(mainIframe.contentDocument, messageId, messageBtnBar);
					minimiseButton(mainIframe.contentDocument, messageDiv, messageBtnBar);
					messageBtnBar.appendChild(li);
										
					if (iframe != mainIframe) {
						iframe.parentNode.removeChild(iframe);
					}
				});
			
			} else {
				e.target.value = "unchecked"
				let messageDiv = messageArray.filter(obj => {
				  return obj.messageNumber === parseInt(messageId);
				})
				messageDiv[0].object.parentElement.removeChild(messageDiv[0].object);
				//console.log("message array, pre deleted", messageArray);
				
				// Remove from the array
				messageArray = messageArray.filter(obj => {
				  return obj.messageNumber !== parseInt(messageId);
				})
				//console.log("message array, post deleted", messageArray);
				
			}
		}	

	});

});


function messageAppend(message) {
	/// Appends message to the mainIframe
	console.log("THIS IS MY ISSUE:", message.object);
	syncScrolling(mainIframe.contentDocument, message.object.children[1]);
	
	// Sort the message array
	if (messageArray.length > 1) {
		sortedMessageArray = messageArray.sort((a, b) => {
			return  b.messageNumber - a.messageNumber;
		});
	}

	// Append message to the page in correct place.
	let sortedMessageArrayLength = sortedMessageArray.length;
	for (let x = 0; x < sortedMessageArrayLength; x++) {
		if (sortedMessageArray[x] == message) {
			try {
				mainIframe.contentDocument.getElementsByTagName("body")[0].insertBefore(sortedMessageArray[x].object, sortedMessageArray[x+1].object);
			} catch {
				mainIframe.contentDocument.getElementsByTagName("body")[0].appendChild(sortedMessageArray[x].object);
			}
		}
	}
	
	// Append first message
	if ((sortedMessageArrayLength == 0) && (messageArray[0] == message)) {
		mainIframe.contentDocument.getElementsByTagName("body")[0].appendChild(message.object)
		sortedMessageArray.push(message.object);
	}
	try {
		mainIframe.contentDocument.dispatchEvent(addExpansionEvent);
		mainIframe.contentDocument.dispatchEvent(addMouseOverCompare);
	} catch {
		
	}
	
	
}


function fullTraceDisplayOff() {
	/// Switches the selecteMessagesTab tab off
	selecteMessagesTab.style.display = "none";
	fullTraceHeader.className = "tabGroupButtonOff";
}


function fullTraceDisplayOn() {
	/// Switches the selecteMessagesTab tab on
	selecteMessagesTab.style.display = "";
	fullTraceHeader.className = "tabGroupButtonOn";
	headerDetails.style.display = "none";
	bodyDetails.style.display = "none";
	bodyContents.style.display = "none";
	traceContent.style.display = "none";
	headerHeaderDetails.className = "tabGroupButtonOff";
	headerBodyDetails.className = "tabGroupButtonOff";
	headerBodyContents.className = "tabGroupButtonOff";
	headerMessageTrace.className = "tabGroupButtonOff"; //.setAttribute("class", "tabGroupButtonOff");
}
