console.log("Text Compare Content Script");

// on page load:
mouseover();
segmentHeaders();

document.addEventListener("messageTabSearch", function(e) {
	messageTabSearch(e.compareDropDown);
});

document.addEventListener("disableTextCompare", function(e) {
	mouseoverEnabled = false;
	//console.log("DisablingTextCompare ", mouseoverEnabled);
});

document.addEventListener("enableTextCompare", function(e) {
	mouseoverEnabled = true;
	//console.log("EnablingTextCompare ", mouseoverEnabled);
});

if (currentUrl.includes("&btns=disable")) {
	// Skip creating the buttons!
} else {
	
	addButtonBar(document);
	buttonBarStyle(document);
	
	textCompareBtn(document);
	messageImportBtn(document);
	wrapRowsButton(document);
	
	compareLegendButtons(document);
}

function messageTabSearch(compareDropDown) {
	//console.log("messageTabSearch");
	chrome.runtime.sendMessage({type: "message_tab_search"}).then((response) => {
		//console.log(response);
		if (compareDropDown.options.length == 0) {
			let tabOption = document.createElement("option");
			tabOption.setAttribute('value', "Choose a tab");
			let optionText = document.createTextNode("Choose a tab");
			tabOption.appendChild(optionText);
			compareDropDown.appendChild(tabOption);
		}
		
		for (let tab in response.results) {
			//console.log("tab", response.results[tab]);
			let tabOption = document.createElement("option");
			let value = response.results[tab].instance + " - " + response.results[tab].namespace + " - " + String(response.results[tab].messageHeaderNumber)
			tabOption.setAttribute('value', response.results[tab].id);
	
			let optionText = document.createTextNode(value);
			tabOption.appendChild(optionText);

			compareDropDown.appendChild(tabOption);
		}
	});
}


function messageTabGetMessage(tabId) {
	//console.log("messageTabGetMessage", String(tabId));
	chrome.runtime.sendMessage({type: "message_tab_get_message", tabId: tabId}).then((response) => {
		//console.log(response);
		
		var htmlObject = document.createElement('div');
		htmlObject.innerHTML = JSON.parse(response.results);
		let htmlBreak = document.createElement('br');
		document.body.appendChild(htmlBreak);
		document.body.appendChild(htmlObject);
		document.dispatchEvent(addExpansionEvent);
	});
	return "done"
}

// Message Handler
chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		//console.log("messageTabGetMessage received", request);
		// Process request for message
		if (request.type == "message_tab_get_message") {
			//console.log("messageTabGetMessage triggered");
			let returnSchemaTable = document.querySelector("body > table.EDIDocumentTable");
			let returnDetails = document.querySelector("body > table:nth-child(2)");
			
			
			let parsed = returnDetails.outerHTML + returnSchemaTable.outerHTML // + JSON.stringify(returnDetails.innerHTML)
			parsed = JSON.stringify(parsed);
			//console.log("returnSchemaTable ", parsed);
			sendResponse({response: parsed});
			return true
		} else {
			//console.log("text_compare request type unknown?");
		}
		return true
});


// Add an event listener
document.addEventListener("addMouseOverCompare", function(e) {
	//console.log("addMouseOverCompare Listener Triggered");
	segmentHeaders();
	mouseover();
});


function segmentHeaders() {
	/// Create segment header objects
	let rows = document.getElementsByClassName("EDIDocumentTableRow")
	
	for (var i = 0, row; row = rows[i]; i++) {
		if (row.cells[3].built == true) {
			// Skip already processed Segment Headers
		} else {
			let field_counter = 0
			let embedded_fields = []

			row.cells[3].built = true
			let segment_header = row.cells[3].innerText
			let segment = row.cells[4].childNodes[0].childNodes[0].childNodes[0].childNodes
			//console.log("Segment", segment);
			let segmentLength = segment.length;
			for (let td = 0; td < segment.length; td ++) {
				field_counter ++
				//console.log("SEGMENT: ", segment[td]);
				if (segment[td].nodeValue == "\n") {
					// Do nothing!
				} else {
					if (segment[td].className == "EDISegmentsTableSeparator") {
						// Skip segment seperators.
					}
					else 
					{
						// Add Field
						embedded_fields.push(segment[td].innerText);
						//console.log(segment[td]);
					}
				   
				}
			}
			embedded_fields.unshift(segment_header);
			row.cells[3].embeddedFields = embedded_fields;
			row.cells[3].embeddedFieldsStr = embedded_fields.toString();
			//console.log("segment header processed", row.cells[3]);
			//embedded_fields.unshift(segment_header);
			//parsed_data.push(embedded_fields);
			
		}
		
	}
}


function mouseover() {
	var aHover = document.getElementsByTagName('a');
	var highlighted = []
	let aHoverLength = aHover.length;
	for (var i = 0; i < aHoverLength; ++i){
		//console.log(aHover[i].title);
		
		if  (aHover[i].parentElement.className == "EDIDocumentTableSegname") {
			aHover[i].addEventListener('mouseover', (event) => {
				// Find and compare with other segments with this name
				if (mouseoverEnabled) {
					var aSearch = document.getElementsByTagName('a');
					let aSearchLength = aSearch.length;
					for (let x = 0; x < aSearchLength; x++) {
						if  (aSearch[x].parentElement.className == "EDIDocumentTableSegname") {
							//console.log("segment aSearch[x]", aSearch[x]);
							if (aSearch[x].parentElement.embeddedFieldsStr == event.relatedTarget.embeddedFieldsStr) {
								aSearch[x].parentElement.nextElementSibling.firstChild.style.background = "green";
								highlighted.push(aSearch[x].parentElement.nextElementSibling.firstChild);
							} else if (aSearch[x].parentElement.embeddedFields[0] == event.relatedTarget.embeddedFields[0]) {
								//console.log("compare segment name: ", aSearch[x].parentElement.embeddedFields[0], event.relatedTarget.embeddedFields[0])
								aSearch[x].parentElement.nextElementSibling.firstChild.style.background = "red";
								highlighted.push(aSearch[x].parentElement.nextElementSibling.firstChild);
							}
						}
					}
				}
			});
		} else {
			aHover[i].addEventListener('mouseover', (event) => {
				if (mouseoverEnabled) {
					var aSearch = document.getElementsByTagName('a');
					//console.log(event.relatedTarget.childNodes[0].title);
					let aSearchLength = aSearch.length;
					for (let x = 0; x < aSearchLength; x++) {
						if (event.relatedTarget.childNodes[0].title == "") {
							// Do nothing.
						} else {
						
							if ((aSearch[x].innerText ==  event.relatedTarget.childNodes[0].innerText) && (aSearch[x].title ==  event.relatedTarget.childNodes[0].title)) {
								// Text && Field matches exactly
								highlighted.push(aSearch[x]);
								//aSearch[x].innerHTML = "<div style='color: red' class='hoverHighlighted'>" + aSearch[x].innerHTML + "</div>"
								aSearch[x].style.color = "white"
								aSearch[x].style.backgroundColor = "green"
								
							} else if ((aSearch[x].innerText.trim() != "·") && (aSearch[x].innerText ==  event.relatedTarget.childNodes[0].innerText)) {
								// Text matches exactly (excluding blanks)
								highlighted.push(aSearch[x]);
								//aSearch[x].innerHTML = "<div style='color: red' class='hoverHighlighted'>" + aSearch[x].innerHTML + "</div>"
								aSearch[x].style.color = ""
								aSearch[x].style.color = ""
								aSearch[x].style.backgroundColor = "LightGreen"
							} else if (aSearch[x].title ==  event.relatedTarget.childNodes[0].title) {
								// Field is same type, if we get here, text does NOT match exactly					
								highlighted.push(aSearch[x]);
								//aSearch[x].innerHTML = "<div style='color: red' class='hoverHighlighted'>" + aSearch[x].innerHTML + "</div>"
								aSearch[x].style.color = "white"
								aSearch[x].style.backgroundColor = "red"
							} else if (((aSearch[x].innerText.length > 2) && (event.relatedTarget.childNodes[0].innerText.includes(aSearch[x].innerText))) || ((event.relatedTarget.childNodes[0].innerText.length > 2) && (aSearch[x].innerText.includes(event.relatedTarget.childNodes[0].innerText)))) {
								// Fields contain similar text
								//console.log("----------START---------");
								//console.log("FOUND <a>:", aSearch[x].innerText);
								//console.log("HOVERED <a>:", event.relatedTarget.childNodes[0].innerText);
								//console.log("Found <a> innerText.Length greater than 2: ",(aSearch[x].innerText.length > 2));
								//console.log("Found <a> is inside hovered element: ",  (event.relatedTarget.childNodes[0].innerText.includes(aSearch[x].innerText)));
								//console.log("BOTH OF ABOVE OR:");
								//console.log("Hovered <a> innerText.Length greater than 2: ", (event.relatedTarget.childNodes[0].innerText.length > 2));
								//console.log("Hovered <a> is inside found <a> element: ",  (aSearch[x].innerText.includes(event.relatedTarget.childNodes[0].innerText)));
								//console.log("----------END---------");
								
								highlighted.push(aSearch[x]);
								aSearch[x].style.color = ""
								aSearch[x].style.backgroundColor = "yellow"
							}
						}
					}
				}
			});
		}
		aHover[i].addEventListener('mouseout', (event) => {
			let highlightedLength = highlighted.length;
			for (let z = highlightedLength; z != 0; z--) {
				highlighted[z-1].style.color = ""	
				highlighted[z-1].style.backgroundColor = ""
				highlighted.splice(z-1, 1);
			}
		});

	}
}

/// Perform a delay in miliseconds
function delay(time) {
				return new Promise(resolve => setTimeout(resolve, time));
			}


function segmentSearch(event, comparedSegment) {
	var aSearch = document.getElementsByTagName('a');
	let aSearchLength = aSearch.length;
	for (let x = 0; x < aSearchLength; x++) {
		if  (aSearch.parentElement.className == "EDIDocumentTableSegname") {
			if (aSearch.embeddedFieldsStr == event.relatedTarget.embeddedFieldsStr) {
				aSearch[x].nextElement.firstChild.style.background = "LightGreen"
				highlighted.push(aSearch[x].nextElement.firstChild);
			}
		}
	}
}

