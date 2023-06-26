/// Javascript Utils
console.log("Utils loaded");


let currentUrl = window.location.href
let stubUrl
let currentNamespace

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

let schemaTable
let schemaTableStyle

try {
	schemaTable = document.querySelector("body > table:nth-child(1) > tbody");
	schemaTableStyle = document.querySelector("body > table:nth-child(1)");
} catch (e) {
	console.log("Error", e);
}
 

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
	//buttonObject.style.position = "absolute";
	//buttonObject.style.marginRight = "5px";
	//buttonObject.style.top = "5px";
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
	object.style.paddingBottom = "10px";
	object.style.overflowX = "auto";
}

// Hides parent element when clicked
function closeButtonHide(Document) {
	let closeButtonHide = Document.createElement('btn');
	closeButtonHide.style.backgroundColor = "pink";
	closeButtonHide.style.paddingLeft = "3px";
	closeButtonHide.style.paddingRight = "3px";
	closeButtonHide.style.border = "solid 1px black";
	closeButtonHide.style.cursor = "pointer";
	closeButtonHide.style.position = "absolute";
	closeButtonHide.style.top = "5px";
	closeButtonHide.style.right = "15px";
	closeButtonHide.title = "Close";
	closeButtonHide.innerText = "x";
	closeButtonHide.addEventListener('click', () => {
		closeButtonHide.parentNode.style.display = "none";
	})
	return closeButtonHide
}

// Deletes parent element when clicked
function closeButtonDelete(Document) {
	let closeButtonDelete = Document.createElement('btn');
	closeButtonDelete.style.backgroundColor = "pink";
	closeButtonDelete.style.paddingLeft = "3px";
	closeButtonDelete.style.paddingRight = "3px";
	closeButtonDelete.style.border = "solid 1px black";
	closeButtonDelete.style.cursor = "pointer";
	closeButtonDelete.style.position = "absolute";
	closeButtonDelete.style.top = "5px";
	closeButtonDelete.style.right = "15px";
	closeButtonDelete.title = "Close";
	closeButtonDelete.innerText = "x";
	closeButtonDelete.addEventListener('click', () => {
		closeButtonDelete.parentNode.parentNode.removeChild(closeButtonDelete.parentNode);
	})
	return closeButtonDelete
}
				

function copyRawTextButton(Document, messageId) {
	let copyRawTextButton = document.createElement('btn');
		copyRawTextButton.style.backgroundColor = "lightgrey";
		copyRawTextButton.style.paddingLeft = "4px";
		copyRawTextButton.style.paddingRight = "4px";
		copyRawTextButton.style.border = "solid 1px black";
		copyRawTextButton.style.cursor = "pointer";
		copyRawTextButton.style.position = "absolute";
		copyRawTextButton.style.top = "5px";
		copyRawTextButton.style.right = "60px";
		copyRawTextButton.title = "copyRawText";
		copyRawTextButton.innerText = "Copy Raw Text";
					
		copyRawTextButton.addEventListener('click', () => {
			copyRawText.messageNumber = String(messageId);
			Document.dispatchEvent(copyRawText);
		})
	return copyRawTextButton
}

function minimiseButton(Document, messageDiv) {
	let minimiseButton = Document.createElement('btn');
	minimiseButton.style.backgroundColor = "lightblue";
	minimiseButton.style.paddingLeft = "4px";
	minimiseButton.style.paddingRight = "4px";
	minimiseButton.style.border = "solid 1px black";
	minimiseButton.style.cursor = "pointer";
	minimiseButton.style.position = "absolute";
	minimiseButton.style.top = "5px";
	minimiseButton.style.right = "40px";
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
	return minimiseButton
}	

function copyRawTextButtonBar(Document) {
	let copyRawBtn = Document.createElement('btn');

	buttonStyling(copyRawBtn);
	copyRawBtn.style.backgroundColor = "lightgrey";
	copyRawBtn.style.margin = "5px"
	copyRawBtn.style.position = ""
	
	copyRawBtn.innerText = "Copy Raw Text";
	
	copyRawBtn.addEventListener('click', () => {
		let messageNumber = currentUrl.split("&HeaderId=")[1];
		if (messageNumber.includes("&")) {
			messageNumber = messageNumber.split("&")[0]
		}
		copyRawText.messageNumber = messageNumber
		Document.dispatchEvent(copyRawText);
		//copyRaw(messageNumber);
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
	expandSchemaBtn.style.margin = "5px"
	expandSchemaBtn.style.position = ""
	//expandSchemaBtn.className = "commandButton"
	expandSchemaBtn.innerText = "Expand All"
	expandSchemaBtn.addEventListener('click', () => {
		console.log("schema button clicked");
		if (clicked) {
			clicked = false
			Document.dispatchEvent(contractSchemaEvent);
			//contractSchema(); // Event
		} else {
			clicked = true
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
	compareDropDown.name = "compareDropDown"
	compareDropDown.id = "compareDropDown"
	compareDropDown.addEventListener('click', () => { 
		while (compareDropDown.options.length > 0) {
			compareDropDown.remove(0);
		}
		messageTabSearchEvent.compareDropDown = compareDropDown
		Document.dispatchEvent(messageTabSearchEvent);
	} );
	
	let messageImportBtn = Document.createElement('btn');
	buttonStyling(messageImportBtn);
	messageImportBtn.style.backgroundColor = "DarkTurquoise";
	messageImportBtn.style.color = "white"
	messageImportBtn.style.margin = "5px"
	messageImportBtn.style.position = ""
	messageImportBtn.innerText = "Import Message"
	messageImportBtn.addEventListener('click', () => {
		// When there is a "click"
		compareDropDownSelect = Document.getElementById("compareDropDown")
		messageTabGetMessage(compareDropDownSelect.value);
		
		/// TODO - swap this delay for a proper promise on the messageTabGetMessage!!!
		delay(500).then(() => {
			Document.dispatchEvent(addMouseOverCompare);
			//Document.dispatchEvent(addExpansionEvent);
		});
		
	})
	
	let li = Document.createElement('li');
	li.append(messageImportBtn);
	li.append(compareDropDown);
	let buttonBar = Document.getElementById("buttonBar")
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
			//textCompareButton.title = "Enable Text Compare";
			textCompareButton.innerText = "Enable Text Compare";
		} else {
			Document.dispatchEvent(enableTextCompareEvent);
			mouseoverEnabled = true;
			textCompareButton.style.backgroundColor = "salmon";
			//textCompareButton.title = "Disable Text Compare";
			textCompareButton.innerText = "Disable Text Compare";
		}
	})
	//Document.getElementsByTagName("body")[0].appendChild(minimiseAllButton);
	let li = Document.createElement('li');
	li.append(textCompareButton);
	let buttonBar = Document.getElementById("buttonBar")
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
		/*
		for (let i =0; i < buttons.length; i++) {
			if (buttons[i].title == "Minimise") {
				buttons[i].click();
			}
		}
		*/
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
	//Document.getElementsByTagName("body")[0].appendChild(minimiseAllButton);
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
	
	//Document.getElementsByTagName("body")[0].appendChild(wrapRowsButton);
	let li = Document.createElement('li');
	li.append(wrapRowsButton);
	let buttonBar = Document.getElementById("buttonBar")
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
				buttons[i].parentNode.style.display = "";
			}
		}
	})
	//Document.getElementsByTagName("body")[0].appendChild(reopenButton);
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
	//Document.getElementsByTagName("body")[0].appendChild(shareButton);
	let li = Document.createElement('li');
	li.append(shareButton);
	let buttonBar = Document.getElementById("buttonBar")
	buttonBar.appendChild(li);
		
}



function compareLegendButtons(Document) {
	let compareLegendDiv = Document.createElement("div");
	

	let legendTitle = Document.createElement("div");
	legendTitle.innerText = "TEXT COMPARE LEGEND";
	legendTitle.style.color = "white";
	legendTitle.style.backgroundColor = "black";
	//legendTitle.style.marginTop = "3px";
	
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

	compareLegendDiv.style.position = "absolute"
	compareLegendDiv.style.display = "none"

	compareLegendDiv.style.bottom = "-130"
	compareLegendDiv.style.right = "0"
	compareLegendDiv.style.zIndex = "3"
		
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
	let buttonBar = Document.getElementById("buttonBar")
	buttonBar.appendChild(compareLegendDiv);
	buttonBar.appendChild(liShowLegendBtn);
	
}



function delay(time) {
	/// Perform a delay in miliseconds
	return new Promise(resolve => setTimeout(resolve, time));
}


function getDomain(url) {
	/// Returns the current domain.
	url = url.split("/")[0]
	domain = url.split("://")[1]
	return domain
}

const scrollBarString = `
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

function scrollBarStyle(Document) {
	const style = Document.createElement('style');
	style.textContent = scrollBarString;
	Document.head.append(style);
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
		style.id = "buttonBarStyle"
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