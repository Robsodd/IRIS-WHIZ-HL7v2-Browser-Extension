/// Javascript Utils
console.log("Utils loaded");


let currentUrl = window.location.href;
let stubUrl;
let currentNamespace;

let messageArray = [];
let sortedMessageArray = [];
let mainIframe;
let tabBar;

let fullTrace;
let fullTraceHeader;
let headerHeaderDetails;
let headerBodyDetails;
let headerBodyContents;

let tabGroupBody;
let headerDetails;
let bodyDetails;
let bodyContents;

try {
	stubUrl = currentUrl.split("EnsPortal");
} catch (e) {
	console.log("Error", e);
}

let schemaTable;
let schemaTableStyle;

try {
	schemaTable = document.querySelector("body > table:nth-child(1) > tbody");
	schemaTableStyle = document.querySelector("body > table:nth-child(1)");
} catch (e) {
	console.log("Error", e);
}

let statusDiv;

window.addEventListener("load", function() { 
	statusDiv = document.createElement("div");
	let zen1 = document.getElementById("zen1");
	if (zen1 == undefined) {
		
	} else {
		statusDiv.id = "status";
		zen1.prepend(statusDiv);
		statusDiv.style.position = "absolute";
		statusDiv.style.top = "50px";
		statusDiv.style.padding = "15px 10px";
		statusDiv.style.color = "#fff";
		statusDiv.style.fontWeight = "400";
		statusDiv.style.letterSpacing = "1px";
		statusDiv.style.borderRadius = "5px";
		statusDiv.style.width = "50%";
		statusDiv.style.textAlign = "center";
		statusDiv.style.marginLeft = "25%";
		statusDiv.style.marginRight = "auto";
		statusDiv.style.zIndex = "3";
		statusDiv.style.display = "none";
	}	
});


// EVENT FOR TRIGGERING THE EXPANSION CONTENT SCRIPT
let addExpansionEvent; // The custom event that will be created
addExpansionEvent = document.createEvent("HTMLEvents");
addExpansionEvent.initEvent("addExpansion", true, true);
addExpansionEvent.eventName = "addExpansion";

// EVENT FOR TRIGGERING THE MOUSE OVER COMPARE CONTENT SCRIPT
let addMouseOverCompare;
addMouseOverCompare = document.createEvent("HTMLEvents");
addMouseOverCompare.initEvent("addMouseOverCompare", true, true);
addMouseOverCompare.eventName = "addMouseOverCompare";

// EVENT FOR TRIGGERING THE COPY RAW TEXT CONTENT SCRIPT
let copyRawText;
copyRawText = document.createEvent("HTMLEvents");
copyRawText.initEvent("copyRawText", true, true);
copyRawText.eventName = "copyRawText";

let messageTabSearchEvent; // The custom event that will be created
messageTabSearchEvent = document.createEvent("HTMLEvents");
messageTabSearchEvent.initEvent("messageTabSearch", true, true);
messageTabSearchEvent.eventName = "messageTabSearch";

let expandSchemaEvent; // The custom event that will be created
expandSchemaEvent = document.createEvent("HTMLEvents");
expandSchemaEvent.initEvent("expandSchema", true, true);
expandSchemaEvent.eventName = "expandSchema";
expandSchemaEvent.schemaSearch = false

let contractSchemaEvent; // The custom event that will be created
contractSchemaEvent = document.createEvent("HTMLEvents");
contractSchemaEvent.initEvent("contractSchema", true, true);
contractSchemaEvent.eventName = "contractSchema";

let disableTextCompareEvent; // The custom event that will be created
disableTextCompareEvent = document.createEvent("HTMLEvents");
disableTextCompareEvent.initEvent("disableTextCompare", true, true);
disableTextCompareEvent.eventName = "disableTextCompare";

let enableTextCompareEvent; // The custom event that will be created
enableTextCompareEvent = document.createEvent("HTMLEvents");
enableTextCompareEvent.initEvent("enableTextCompare", true, true);
enableTextCompareEvent.eventName = "enableTextCompare";

function buttonStyling(buttonObject) {
	/// Default button styling
	buttonObject.style.zIndex = "2";
	buttonObject.style.paddingLeft = "4px";
	buttonObject.style.paddingRight = "4px";
	buttonObject.style.border = "solid 1px black";
	buttonObject.style.cursor = "pointer";
	buttonObject.style.whiteSpace = "nowrap";
}


function messageStyling(object){
	/// Style messages
	object.className = "MsgOutline";
	object.style.border = "solid 2px darkBlue";
	object.style.backgroundColor = "white";
	object.style.borderRadius = "5px";
	object.style.marginTop = "10px";
	object.style.marginBottom = "10px";
	object.style.width = "auto";
	object.style.position = "relative";
	object.style.paddingTop = "5px";
	object.style.overflowX = "auto";
}

// Button bar for individual messages
function messageButtonBar(Document, messageId) {
	let messageBtnBar = Document.createElement('div');
	messageBtnBar.style.position = "sticky";
	messageBtnBar.style.bottom = "100%";
	messageBtnBar.style.left = "100%";	
	messageBtnBar.style.width = "max-content";
	messageBtnBar.id = "buttonBar" + String(messageId);
	return messageBtnBar
}

// Hides parent element when clicked
function closeButtonHide(Document, messageBtnBar) {
	
	let closeBtnHide = Document.createElement('btn');
	closeBtnHide.style.backgroundColor = "pink";
	closeBtnHide.style.paddingLeft = "3px";
	closeBtnHide.style.paddingRight = "3px";
	closeBtnHide.style.border = "solid 1px black";
	closeBtnHide.style.cursor = "pointer";
	closeBtnHide.style.marginLeft = "-35px";
	closeBtnHide.title = "Close";
	closeBtnHide.innerText = "x";
	closeBtnHide.addEventListener('click', () => {
		closeBtnHide.parentNode.parentNode.style.display = "none";
	})
	messageBtnBar.appendChild(closeBtnHide);	
	return closeBtnHide
}

// Deletes parent element when clicked
function closeButtonDelete(Document, messageBtnBar) {
	
	let closeBtnDelete = Document.createElement('btn');
	closeBtnDelete.style.backgroundColor = "pink";
	closeBtnDelete.style.paddingLeft = "3px";
	closeBtnDelete.style.paddingRight = "3px";
	closeBtnDelete.style.border = "solid 1px black";
	closeBtnDelete.style.cursor = "pointer";
	closeBtnDelete.style.position = "absolute";
	closeBtnDelete.style.top = "10px";
	closeBtnDelete.style.right = "10px";
	closeBtnDelete.title = "Close";
	closeBtnDelete.innerText = "x";
	closeBtnDelete.addEventListener('click', () => {
		messageBtnBar.parentNode.parentNode.removeChild(messageBtnBar.parentNode);
	})
	messageBtnBar.appendChild(closeBtnDelete);
	return closeBtnDelete
}
				

function copyRawTextButton(Document, messageId, messageBtnBar) {
	
	let copyRawTextButton = document.createElement('btn');
		copyRawTextButton.style.backgroundColor = "lightgrey";
		copyRawTextButton.style.paddingLeft = "4px";
		copyRawTextButton.style.paddingRight = "4px";
		copyRawTextButton.style.border = "solid 1px black";
		copyRawTextButton.style.cursor = "pointer";
		copyRawTextButton.style.marginLeft = "-137px";
		copyRawTextButton.title = "copyRawText";
		copyRawTextButton.innerText = "Copy Raw Text";
					
		copyRawTextButton.addEventListener('click', () => {
			copyRawText.messageNumber = String(messageId);
			Document.dispatchEvent(copyRawText);
		})
	messageBtnBar.appendChild(copyRawTextButton);
	
}

function minimiseButton(Document, messageDiv, messageBtnBar) {
	let minimiseButton = Document.createElement('btn');
	minimiseButton.style.backgroundColor = "lightblue";
	minimiseButton.style.paddingLeft = "4px";
	minimiseButton.style.paddingRight = "4px";
	minimiseButton.style.border = "solid 1px black";
	minimiseButton.style.cursor = "pointer";
	minimiseButton.style.marginLeft = "-35px";
	minimiseButton.title = "Minimise";
	minimiseButton.innerText = "-";
	minimiseButton.addEventListener('click', () => {
		let tables = messageDiv.getElementsByTagName("table")
		
		for (let i = 0; i < tables.length; i ++) {
			if (tables[i].style.display == "none") {
				tables[i].style.display = "";
				minimiseButton.set = "";
			} else {
				tables[i].style.display = "none";
				minimiseButton.set = "minimised";
			}
		}
	})
	console.log("buttonBar", messageBtnBar, messageDiv.id);
	messageBtnBar.appendChild(minimiseButton);
}	

function copyRawTextButtonBar(Document) {
	let copyRawBtn = Document.createElement('btn');

	buttonStyling(copyRawBtn);
	copyRawBtn.style.backgroundColor = "lightgrey";
	copyRawBtn.style.margin = "5px"
	copyRawBtn.style.position = ""
	
	copyRawBtn.innerText = "Copy Raw Text";
	copyRawBtn.title = "Copy Raw Text version of this message";
	
	copyRawBtn.addEventListener('click', () => {
		let messageNumber = currentUrl.split("&HeaderId=")[1];
		if (messageNumber.includes("&")) {
			messageNumber = messageNumber.split("&")[0]
		}
		copyRawText.messageNumber = messageNumber
		Document.dispatchEvent(copyRawText);
	})
	let li = Document.createElement('li');
	li.append(copyRawBtn);
	let buttonBar = Document.getElementById("buttonBar")
	buttonBar.appendChild(li);
}


function expandSchemaButton(Document) {
	let expandSchemaBtn = Document.createElement('btn');
	buttonStyling(expandSchemaBtn);
	expandSchemaBtn.style.backgroundColor = "DodgerBlue";
	expandSchemaBtn.style.color = "white";
	expandSchemaBtn.style.margin = "5px";
	expandSchemaBtn.style.position = "";
	expandSchemaBtn.innerText = "Expand All";
	expandSchemaBtn.title = "Expand all segments as schema";
	expandSchemaBtn.addEventListener('click', () => {
		console.log("schema button clicked");
		if (clicked) {
			clicked = false;
			Document.dispatchEvent(contractSchemaEvent);
			//contractSchema(); // Event
		} else {
			clicked = true;
			expandSchemaEvent.schemaSearch = true;
			Document.dispatchEvent(expandSchemaEvent);
			//expandSchema(); // Event
		}
	})
	let li = Document.createElement('li');
	li.append(expandSchemaBtn);
	let buttonBar = Document.getElementById("buttonBar")
	buttonBar.appendChild(li);
	
}
function messageImportBtn(Document) {
	
	let compareDropDown = document.createElement('select');
	compareDropDown.name = "compareDropDown";
	compareDropDown.id = "compareDropDown";
	compareDropDown.addEventListener('click', () => { 
		while (compareDropDown.options.length > 0) {
			compareDropDown.remove(0);
		}
		messageTabSearchEvent.compareDropDown = compareDropDown;
		Document.dispatchEvent(messageTabSearchEvent);
	} );
	
	let messageImportBtn = Document.createElement('btn');
	buttonStyling(messageImportBtn);
	messageImportBtn.style.backgroundColor = "DarkTurquoise";
	messageImportBtn.style.color = "white";
	messageImportBtn.style.margin = "5px";
	messageImportBtn.style.position = "";
	messageImportBtn.innerText = "Import Message";
	messageImportBtn.title = "Import Message from a Full Contents tab";
	messageImportBtn.addEventListener('click', () => {
		// When there is a "click"
		compareDropDownSelect = Document.getElementById("compareDropDown");
		messageTabGetMessage(compareDropDownSelect.value);
		
		/// TODO - swap this delay for a proper promise on the messageTabGetMessage!!!
		delay(500).then(() => {
			Document.dispatchEvent(addMouseOverCompare);
		});
		
	})
	
	let li = Document.createElement('li');
	li.append(messageImportBtn);
	li.append(compareDropDown);
	let buttonBar = Document.getElementById("buttonBar");
	buttonBar.appendChild(li);
}
let mouseoverEnabled = false
function textCompareBtn(Document) {
	let textCompareButton = Document.createElement('btn');
	buttonStyling(textCompareButton);
	textCompareButton.style.backgroundColor = "salmon";
	textCompareButton.style.color = "white";
	
	textCompareButton.style.paddingLeft = "4px";
	textCompareButton.style.paddingRight = "4px";
	textCompareButton.style.border = "solid 1px black";
	
	textCompareButton.style.cursor = "pointer";
	textCompareButton.style.position = "sticky";
	textCompareButton.style.bottom = "5px";
	
	textCompareButton.style.right = "5px";
	textCompareButton.style.marginLeft = "5px";
	textCompareButton.title = "Hover mouse over segments and fields to perform comparison.";
	textCompareButton.innerText = "Enable Text Compare";
	
	textCompareButton.addEventListener('click', () => {
		if (mouseoverEnabled) {
			Document.dispatchEvent(disableTextCompareEvent);
			mouseoverEnabled = false;
			textCompareButton.style.backgroundColor = "#df663d";
			textCompareButton.innerText = "Enable Text Compare";
		} else {
			Document.dispatchEvent(enableTextCompareEvent);
			mouseoverEnabled = true;
			textCompareButton.style.backgroundColor = "salmon";
			textCompareButton.innerText = "Disable Text Compare";
		}
	})
	//Document.getElementsByTagName("body")[0].appendChild(minimiseAllButton);
	let li = Document.createElement('li');
	li.append(textCompareButton);
	let buttonBar = Document.getElementById("buttonBar");
	buttonBar.appendChild(li);
}

function minimiseAllButton(Document) {
	let minimiseAllButton = Document.createElement('btn');
	buttonStyling(minimiseAllButton);
	
	minimiseAllButton.style.backgroundColor = "darkblue";
	minimiseAllButton.style.color = "white";
	minimiseAllButton.style.paddingLeft = "4px";
	minimiseAllButton.style.paddingRight = "4px";
	minimiseAllButton.style.border = "solid 1px black";
	minimiseAllButton.style.cursor = "pointer";
	minimiseAllButton.style.position = "sticky";
	minimiseAllButton.style.bottom = "5px";
	minimiseAllButton.style.right = "5px";
	minimiseAllButton.style.marginLeft = "5px";
	
	minimiseAllButton.title = "Minimise All";
	minimiseAllButton.innerText = "Minimise All";
	
	
	minimiseAllButton.addEventListener('click', () => {
		let buttons = Document.getElementsByTagName('btn');
		for (let i =0; i < buttons.length; i++) {
			if (buttons[i].title == "Minimise") {
				if (buttons[i].set == "minimised") {
					// Button only built to minimise.
				} else {
					buttons[i].set = "minimised"
					buttons[i].click();
				} 
			}
		}
	})
	let li = Document.createElement('li');
	li.append(minimiseAllButton);
	let buttonBar = Document.getElementById("buttonBar")
	buttonBar.appendChild(li);
}

let wrapSetting = ""
let wrapWidth = ""
let wrapOverflowX = ""

function wrapRowsButton(Document) {
	/// Adds button to enable wrapping of table rows
	let wrapRowsButton = Document.createElement('btn');

	buttonStyling(wrapRowsButton);
	wrapRowsButton.style.backgroundColor = "green";
	wrapRowsButton.style.color = "white";
	
	wrapRowsButton.style.cursor = "pointer";
	wrapRowsButton.style.position = "sticky";
	wrapRowsButton.style.bottom = "5px";
	
	wrapRowsButton.title = "Allow text in message segments to wrap to next line.";
	wrapRowsButton.innerText = "Wrap Rows";
	wrapRowsButton.style.marginLeft = "5px";
	
	wrapRowsButton.addEventListener('click', () => {

		let tableData = Document.getElementsByTagName("td");

		if (wrapSetting == "") {
			wrapSetting = "inline-block" ;
			wrapWidth = "95%";
			wrapOverflowX = "hidden";
		} else {
			wrapSetting = "" ;
			wrapWidth = "";
			wrapOverflowX = "auto";
		}

		for (let i = 0; i < tableData.length; i++) {
			tableData[i].style.display = wrapSetting;
		}
		let EDIDocumentTable = Document.getElementsByClassName("EDIDocumentTable");

		for (let i = 0; i < EDIDocumentTable.length; i++) {
			EDIDocumentTable[i].style.width = wrapWidth;
			EDIDocumentTable[i].parentElement.style.overflowX = wrapOverflowX;
		}
	});
	
	let li = Document.createElement('li');
	li.append(wrapRowsButton);
	let buttonBar = Document.getElementById("buttonBar");
	buttonBar.appendChild(li);
}


function showRelatedButton(messageDocument) {
	let showRelatedButton = messageDocument.createElement('btn');
	buttonStyling(showRelatedButton);
	
	showRelatedButton.style.backgroundColor = "turquoise";
	showRelatedButton.style.paddingLeft = "4px";
	showRelatedButton.style.paddingRight = "4px";
	showRelatedButton.style.border = "solid 1px black";
	showRelatedButton.style.cursor = "pointer";
	showRelatedButton.style.position = "sticky";
	showRelatedButton.style.bottom = "5px";
	showRelatedButton.style.right = "105px";
	showRelatedButton.style.marginLeft = "5px";
	
	showRelatedButton.title = "Show messages related to the highlighted message";
	showRelatedButton.innerText = "Show Related";
	
	let li = messageDocument.createElement('li');
	li.append(showRelatedButton);
	let buttonBar = messageDocument.getElementById("buttonBar")
	buttonBar.appendChild(li);
	return showRelatedButton
}

let hideUnrelatedBtn
function hideUnrelatedButton(messageDocument) {
	hideUnrelatedBtn = messageDocument.createElement('btn');
	buttonStyling(hideUnrelatedBtn);
	
	hideUnrelatedBtn.style.backgroundColor = "cream";
	hideUnrelatedBtn.style.paddingLeft = "4px";
	hideUnrelatedBtn.style.paddingRight = "4px";
	hideUnrelatedBtn.style.border = "solid 1px black";
	hideUnrelatedBtn.style.cursor = "pointer";
	hideUnrelatedBtn.style.position = "sticky";
	hideUnrelatedBtn.style.bottom = "5px";
	hideUnrelatedBtn.style.right = "105px";
	hideUnrelatedBtn.style.marginLeft = "5px";
	
	hideUnrelatedBtn.title = "Hide Visual Trace messages that are unrelated to the current view";
	hideUnrelatedBtn.innerText = "Hide Unrelated";
	hideUnrelatedBtn.style.display = "none";

	let li = messageDocument.createElement('li');
	li.append(hideUnrelatedBtn);
	let buttonBar = messageDocument.getElementById("buttonBar")
	buttonBar.appendChild(li);
	return hideUnrelatedBtn
}


function searchExpandedSchemaButton(Document) {
	let searchDiv = Document.createElement('div');
	let searchExpandedSchemaBtn = Document.createElement('btn');
	buttonStyling(searchExpandedSchemaBtn);
	
	searchExpandedSchemaBtn.style.backgroundColor = "aqua";
	searchExpandedSchemaBtn.style.paddingLeft = "4px";
	searchExpandedSchemaBtn.style.paddingRight = "4px";
	searchExpandedSchemaBtn.style.border = "solid 1px black";
	searchExpandedSchemaBtn.style.cursor = "pointer";
	searchExpandedSchemaBtn.style.position = "sticky";
	searchExpandedSchemaBtn.style.bottom = "5px";
	searchExpandedSchemaBtn.style.right = "105px";
	searchExpandedSchemaBtn.style.marginLeft = "5px";
	searchExpandedSchemaBtn.style.display = "";
	
	searchExpandedSchemaBtn.title = "Expand schema and enable search mode";
	searchExpandedSchemaBtn.innerText = "Search Schema";

	let searchlabel = Document.createElement('label');
	let searchInput = Document.createElement('input');
	
	searchInput.setAttribute('id', 'searchExpandedSchemaButton');
	searchInput.setAttribute('name', 'search');
	searchInput.setAttribute('type', 'text');
	searchInput.setAttribute('placeholder', 'Search Schema & Values');
	
	searchInput.title = "Press ENTER when blank to exit search mode";
	
	searchInput.style.display = "none";
	searchlabel.style.display = "none";
	
	searchDiv.appendChild(searchlabel);
	searchDiv.appendChild(searchInput);
	searchDiv.appendChild(searchExpandedSchemaBtn);
	
	searchInput.addEventListener('keyup', function(e) { 
		//iterate through rows, hide if text not found
		let schemaRows = Document.getElementsByClassName("searchableSchema");
		if (e.target.value == '') {
			if (e.key == "Enter") {
				searchExpandedSchemaBtn.style.display = ""
				searchInput.style.display = "none";
				searchlabel.style.display = "none";
				Document.dispatchEvent(contractSchemaEvent);
			}
			for (let i = 0; i < schemaRows.length; i++) {
				schemaRows[i].style.display = '';
			}
		} else {
			
			// Allows search with spaces
			let textSearch = e.target.value.toLowerCase()
			textSearch = textSearch.replace(/\s/gm, " ");
			
			for (let i = 0; i < schemaRows.length; i++) {
				
				// Allows search with spaces
				let tableValue = schemaRows[i].innerText.toLowerCase()
				tableValue = tableValue.replace(/\s/gm, " ");
				
				if (tableValue.includes(textSearch)) {
					schemaRows[i].style.display = '';
				} else {
					schemaRows[i].style.display = 'none';
				}
			}
		}
		
	});
	
	searchExpandedSchemaBtn.addEventListener('click', () => {
		searchExpandedSchemaBtn.style.display = "none";
		searchInput.style.display = "";
		searchlabel.style.display = "";
		expandSchemaEvent.schemaSearch = true
		Document.dispatchEvent(expandSchemaEvent);
		searchInput.focus();
		
	})
	let li = Document.createElement('li');
	li.append(searchDiv);
	let buttonBar = Document.getElementById("buttonBar");
	buttonBar.appendChild(li);
	
}

function uncloseAllButton(Document) {
	let reopenButton = Document.createElement('btn');
	buttonStyling(reopenButton);
	
	reopenButton.style.backgroundColor = "red";
	reopenButton.style.color = "white";
	reopenButton.style.paddingLeft = "4px";
	reopenButton.style.paddingRight = "4px";
	reopenButton.style.border = "solid 1px black";
	reopenButton.style.cursor = "pointer";
	reopenButton.style.position = "sticky";
	reopenButton.style.bottom = "5px";
	reopenButton.style.right = "105px";
	reopenButton.style.marginLeft = "5px";
	
	reopenButton.title = "Reopen Closed";
	reopenButton.innerText = "Reopen Closed";
	
	reopenButton.addEventListener('click', () => {
		let buttons = Document.getElementsByTagName('btn');
		for (let i =0; i < buttons.length; i++) {
			if (buttons[i].title == "Close") {
				buttons[i].parentNode.parentNode.style.display = "";
			}
		}
		
		// Full Trace tab
		if (messageArray.length > 0) {
			currentRelated = "" // for Show Related button
			for (let i =0; i < messageArray.length; i++) { 
				messageArray[i].svgComponent.style.stroke = "";
				messageArray[i].svgComponent.style.strokeWidth = "";
			}
		}
	})
	let li = Document.createElement('li');
	li.append(reopenButton);
	let buttonBar = Document.getElementById("buttonBar")
	buttonBar.appendChild(li);
}

function shareButton(Document) {
	let shareButton = Document.createElement('btn');
	buttonStyling(shareButton);
	
	shareButton.style.backgroundColor = "purple";
	shareButton.style.color = "white";
	shareButton.style.position = "sticky";
	shareButton.style.bottom = "5px";
	shareButton.style.marginLeft = "5px";
	
	shareButton.title = "Create a link that can be shared with other extension users";
	shareButton.innerText = "Copy Share Link";
	
	shareButton.addEventListener('click', () => {
		let shareLink = stubUrl[0] + "EnsPortal.MessageContents.zen?HeaderClass=Ens.MessageHeader&HeaderId=";
		for (let i = 0; i < sortedMessageArray.length; i++) {
			let messageParams = "&m=" + String(sortedMessageArray[i].messageNumber) + "&s=" + encodeURIComponent(sortedMessageArray[i].messageStartOperation) + "&e=" + encodeURIComponent(sortedMessageArray[i].messageEndOperation);
			if (i == 0) {
				// Page url is based on the first message.
				shareLink = shareLink + String(sortedMessageArray[i].messageNumber) + "&btns=disable&share=1" + messageParams;
			} else {
				shareLink = shareLink + messageParams;
			}				
		}
		const textArea = Document.createElement("textarea");
		textArea.value = shareLink;
		textArea.innerText = shareLink;
		Document.body.appendChild(textArea);
		textArea.select();
		
		try {
			Document.execCommand('copy');
		} catch (err) {
			console.error('Unable to copy to clipboard', err);
		}
		Document.body.removeChild(textArea);
		
		
	})
	let li = Document.createElement('li');
	li.append(shareButton);
	let buttonBar = Document.getElementById("buttonBar");
	buttonBar.appendChild(li);
		
}



function compareLegendButtons(Document) {
	let compareLegendDiv = Document.createElement("div");
	

	let legendTitle = Document.createElement("div");
	legendTitle.innerText = "TEXT COMPARE LEGEND";
	legendTitle.style.color = "white";
	legendTitle.style.backgroundColor = "black";
	
	let legendExactMatch = Document.createElement("div");
	legendExactMatch.innerText = "Field name match, value match";
	legendExactMatch.style.color = "white";
	legendExactMatch.style.backgroundColor = "green";

	let legendCopyMatch = Document.createElement("div");
	legendCopyMatch.innerText = "Field name mismatch, value match";
	legendCopyMatch.style.color = "blue";
	legendCopyMatch.style.backgroundColor = "lightgreen";

	let legendNoMatch = Document.createElement("div");
	legendNoMatch.innerText = "Field name match - value mismatch";
	legendNoMatch.style.color = "white";
	legendNoMatch.style.backgroundColor = "red";

	let legendPartialMatch = Document.createElement("div");
	legendPartialMatch.innerText = "Field name mismatch - value partial match";
	legendPartialMatch.style.color = "blue";
	legendPartialMatch.style.backgroundColor = "yellow";
	
	let legendSegmentMatch = Document.createElement("div");
	legendSegmentMatch.innerText = "Segment name match - field raw text match";
	legendSegmentMatch.style.color = "blue";
	legendSegmentMatch.style.backgroundColor = "white";
	legendSegmentMatch.style.border = "3px solid green";
	legendSegmentMatch.style.marginTop = "3px";

	let legendSegmentMisMatch = Document.createElement("div");
	legendSegmentMisMatch.innerText = "Segment name match - field raw text mismatch";
	legendSegmentMisMatch.style.color = "blue";
	legendSegmentMisMatch.style.backgroundColor = "white";
	legendSegmentMisMatch.style.border = "3px solid red";
	legendSegmentMisMatch.style.marginTop = "3px";
	
	compareLegendDiv.appendChild(legendTitle);	
	compareLegendDiv.appendChild(legendExactMatch);
	compareLegendDiv.appendChild(legendCopyMatch);
	compareLegendDiv.appendChild(legendNoMatch);
	compareLegendDiv.appendChild(legendPartialMatch);
	compareLegendDiv.appendChild(legendSegmentMatch);
	compareLegendDiv.appendChild(legendSegmentMisMatch);

	compareLegendDiv.style.position = "absolute";
	compareLegendDiv.style.display = "none";

	compareLegendDiv.style.bottom = "-130";
	compareLegendDiv.style.right = "0";
	compareLegendDiv.style.zIndex = "3";
		
	let hideLegendBtn = Document.createElement('btn');
	let showLegendBtn = Document.createElement('btn');
		
	buttonStyling(hideLegendBtn);
	hideLegendBtn.style.backgroundColor = "gray";
	hideLegendBtn.style.color = "white";
	hideLegendBtn.style.margin = "5px"
	hideLegendBtn.style.position = "sticky"
	hideLegendBtn.innerText = "Hide Legend";
	hideLegendBtn.addEventListener('click', () => {
		compareLegendDiv.style.display = "none";
		showLegendBtn.style.display = "";
	})

	buttonStyling(showLegendBtn);
	showLegendBtn.style.backgroundColor = "gray";
	showLegendBtn.style.color = "white";
	showLegendBtn.innerText = "Show Legend";
	showLegendBtn.addEventListener('click', () => {
		if (compareLegendDiv.style.display == "") {
			compareLegendDiv.style.display = "none";
		} else {
			compareLegendDiv.style.display = "";
			showLegendBtn.style.display = "none";
		}
	})
	compareLegendDiv.appendChild(hideLegendBtn);
	
	let liShowLegendBtn = Document.createElement('li');
	liShowLegendBtn.append(showLegendBtn);
	let buttonBar = Document.getElementById("buttonBar");
	buttonBar.appendChild(compareLegendDiv);
	buttonBar.appendChild(liShowLegendBtn);
	
}



function delay(time) {
	/// Perform a delay in miliseconds
	return new Promise(resolve => setTimeout(resolve, time));
}


function getDomain(url) {
	/// Returns the current domain.
	url = url.split("/")[0];
	domain = url.split("://")[1];
	return domain
}

var scrollBarString = `
	.MsgOutline::-webkit-scrollbar {
  height: 15px;
}

/* Track */
.MsgOutline::-webkit-scrollbar-track {
  /*box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);*/
  background: #f0f0f0;
  border-radius: 3px;
}
 
/* Handle */
.MsgOutline::-webkit-scrollbar-thumb {
  background: #b4b4b4; 
  border-radius: 3px;
}

/* Handle on hover */
.MsgOutline::-webkit-scrollbar-thumb:hover {
  background: lightGrey; 
}
`

const scrollBarStringHighlight = `
	.MsgOutline::-webkit-scrollbar {
  height: 15px;
}

/* Track */
.MsgOutline::-webkit-scrollbar-track {
  /*box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);*/
  background: #f0f0f0;
  border-radius: 3px;
}
 
/* Handle */
.MsgOutline::-webkit-scrollbar-thumb {
  background: #252525; 
  border-radius: 3px;
}

/* Handle on hover */
.MsgOutline::-webkit-scrollbar-thumb:hover {
  background: lightGrey; 
}
`

let scrollBarStyleObject

function scrollBarStyle(Document) {
	scrollBarStyleObject = Document.createElement('style');
	scrollBarStyleObject.textContent = scrollBarString;
	Document.head.append(scrollBarStyleObject);
}

const buttonBarString = `
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
`

function buttonBarStyle(Document) {
	const style = Document.createElement('style');
	if (Document.getElementById("buttonBarStyle")) {
		// Skip
	} else {
		style.id = "buttonBarStyle";
		style.textContent = buttonBarString;
		Document.head.append(style);
	}
}

function addButtonBar(Document) {
	if (Document.getElementById("buttonBar")) {
		// Skip
	} else {
		const bar = Document.createElement('ul');
		bar.id = "buttonBar";
		bar.className = "buttonBar";
		Document.body.insertBefore(bar, Document.body.firstChild);
	}
}



/// Return datetime object
function getDate() {
	let newDate = new Date();
	let y = String(newDate.getFullYear());
	let m = newDate.getMonth() + 1;
	if (m < 10) {
		m = "0" + String(m);
	} else {
		m = String(m);
	}
	let d = newDate.getDate();
	if (d < 10) {
		d = "0" + String(d);
	} else {
		d = String(d);
	}
	let h = newDate.getHours();
	if (h < 10) {
		h = "0" + String(h);
	} else {
		h = String(h);
	}
	let min = newDate.getMinutes();
	if (min < 10) {
		min = "0" + String(min);
	} else {
		min = String(min)
	}
	let sec = newDate.getSeconds();
	if (sec < 10) {
		sec = "0" + String(sec);
	} else {
		sec = String(sec);
	}
	let datetime = y + m + d + h + min + sec;
	let formatted = d + "/" + m  + "/" + y  + " " + h  + ":" + min + ":" + sec;
 	
	return {"raw": datetime, "formatted": formatted}
}


function successAlert(displayText) {
	var status = document.getElementById('status');
			status.textContent = displayText;
			status.style.background = "green";
			status.style.display = "block";
			setTimeout(function() {
			status.textContent = '';
			status.style.display = "none";
			}, 2000);
}


function errorAlert(displayText) {
	var status = document.getElementById('status');
			status.textContent = displayText;
			status.style.background = "red";
			status.style.display = "block";
			setTimeout(function() {
			status.textContent = '';
			status.style.display = "none";
			}, 2000);
}

// Syncs scrolling for MsgOutline class
function syncScrolling(Document, object) {
	function keypress() {
		let ctrl = window.event.ctrlKey
		console.log("keydown triggered");
		if (ctrl) {
			scrollBarStyleObject.textContent = scrollBarStringHighlight;
		} else {
			scrollBarStyleObject.textContent = scrollBarString;
		}
	}
	document.addEventListener("keydown", function() {
		keypress();
	});
	
	document.addEventListener("keyup", function() {
		keypress();
	});
	
	Document.addEventListener("keydown", function() {
		keypress();
	});
	
	Document.addEventListener("keyup", function() {
		keypress();
	});
	// Hold CTRL to scroll all message boxes simultaneously 
	object.addEventListener("mousedown", function() {
		console.log("Mouse down on element!");
		let divsArray = Document.getElementsByClassName("MsgOutline");
		console.log("divsArray -- ", divsArray);
		let ctrl = window.event.ctrlKey;
		if (ctrl) {
		console.log("mousedown + ctrl");
		object.onscroll = function() { 
		  for (let x = 0; x < divsArray.length; x ++) {
			if (divsArray[x] != object) {
				syncScroll(object, divsArray[x])
			}
		  }
		 }
	  } else {
			 console.log("mousedown - ctrl");
			object.onscroll = function() { };
	  
	  }
	});
	
	// Remove scroll link on mouseup
	object.addEventListener("mouseup", function() {
		console.log("Mouse up on element!");
		let divsArray = Document.getElementsByClassName("MsgOutline");
		console.log("divsArray -- ", divsArray);
		for (let x = 0; x < divsArray.length; x ++) {
			object.onscroll = function() { };
		}
	});
	
	// For synchronising the message scrollbars when CTRL is held
	function syncScroll(from, to)
	{
		console.log("synScroll!");
		var sfh = from.scrollHeight - from.clientHeight,
			sth = to.scrollHeight - to.clientHeight;
		var sfw = from.scrollWidth - from.clientWidth,
			stw = to.scrollWidth - to.clientWidth;

		if (sfh < 1) {
		} else {
			var ph = from.scrollTop / sfh * 100;
		  to.scrollTop = (sth / 100) * ph;
		
		}
		
		if (sfw < 1) {
		} else {
		  var pw = from.scrollLeft / sfw * 100;
			to.scrollLeft = (stw / 100) * pw;
		}
	}
}
