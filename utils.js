/// Javascript Utils
console.log("Utils loaded");

let settings
let mouseoverEnabled = false

let currentUrl = window.location.href;

let stubUrl;
let currentURLBeforeCSP

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

// Side by side compare 
let initialImport = true;

try {
	stubUrl = currentUrl.split("EnsPortal");
	currentURLBeforeCSP = currentURL.split("/csp/");
} catch (e) {
	//console.log("Error", e);
}

let schemaTable;
let schemaTableStyle;

try {
	schemaTable = document.querySelector("body > table:nth-child(1) > tbody");
	schemaTableStyle = document.querySelector("body > table:nth-child(1)");
} catch (e) {
	//console.log("Error", e);
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


let sideBySideCompareEvent;
sideBySideCompareEvent = document.createEvent("HTMLEvents");
sideBySideCompareEvent.initEvent("sideBySideCompare", true, true);
sideBySideCompareEvent.eventName = "sideBySideCompare";

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


let searchSegmentsEvent; // The custom event that will be created
searchSegmentsEvent = document.createEvent("HTMLEvents");
searchSegmentsEvent.initEvent("searchSegments", true, true);
searchSegmentsEvent.eventName = "searchSegments";


let searchExpandedSchemaEvent; // The custom event that will be created
searchExpandedSchemaEvent = document.createEvent("HTMLEvents");
searchExpandedSchemaEvent.initEvent("searchExpandedSchema", true, true);
searchExpandedSchemaEvent.eventName = "searchExpandedSchema";


// EVENT FOR TRIGGERING THE categoryList script
let categoryListEvent; // The custom event that will be created
categoryListEvent = document.createEvent("HTMLEvents");
categoryListEvent.initEvent("categoryList", true, true);
categoryListEvent.eventName = "categoryList";

// EVENT FOR TRIGGERING THE category list selection
let categoryListSelectionEvent; // The custom event that will be created
categoryListSelectionEvent = document.createEvent("HTMLEvents");
categoryListSelectionEvent.initEvent("categoryListSelection", true, true);
categoryListSelectionEvent.eventName = "categoryListSelection";



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
	object.className = "IWMsgOutline";
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
	let messageBtnBar = Document.createElement('ul');
	messageBtnBar.classList.add("messageBtnBar");

	//messageBtnBar.style.backgroundColor = "black";
	//messageBtnBar.style.position = "sticky";
	//messageBtnBar.style.bottom = "100%";
	//messageBtnBar.style.left = "100%";	
	//messageBtnBar.style.width = "max-content";
	messageBtnBar.id = "buttonBar" + String(messageId);
	
	//messageBtnBar.addEventListener("click", function(e) {
		//for (let i = 0; i < self.childElementCount; i++) {
			//self.children[i].style.display = "";
		//}
	//})
	
	return messageBtnBar
}

// Hides parent element when clicked
function closeButtonHide(Document, messageBtnBar) {
	
	let closeBtnHide = Document.createElement('btn');
	closeBtnHide.classList.add("whizButton");
	closeBtnHide.classList.add("closeBtnHide");
	
	
	closeBtnHide.title = "Close";
	closeBtnHide.innerText = "x";
	closeBtnHide.addEventListener('click', () => {
		closeBtnHide.parentNode.parentNode.parentNode.style.display = "none";
	})

	let li = Document.createElement('li');
	li.append(closeBtnHide);
	messageBtnBar.appendChild(li);
	//messageBtnBar.appendChild(closeBtnHide);	
	return closeBtnHide
}

// Deletes parent element when clicked
function closeButtonDelete(Document, messageBtnBar) {
	
	let closeBtnDelete = Document.createElement('btn');
	closeBtnDelete.classList.add("whizButton");
	closeBtnDelete.classList.add("closeBtnDelete");
	

	closeBtnDelete.title = "Close";
	closeBtnDelete.innerText = "x";
	closeBtnDelete.addEventListener('click', () => {
		messageBtnBar.parentNode.parentNode.removeChild(messageBtnBar.parentNode);
	})
	//messageBtnBar.appendChild(closeBtnDelete);
	let li = Document.createElement('li');
	li.append(closeBtnDelete);
	messageBtnBar.appendChild(li);
	
	return closeBtnDelete
}
				

function copyRawTextButton(Document, messageId, messageBtnBar) {
	
	let copyRawTextBtn = document.createElement('btn');
		copyRawTextBtn.classList.add("whizButton");
		copyRawTextBtn.classList.add("copyRawTextBtn");
		copyRawTextBtn.id = "copyRawText" + messageId
		copyRawTextBtn.title = "copyRawText";
		copyRawTextBtn.innerText = "Copy Raw Text";
					
		copyRawTextBtn.addEventListener('click', () => {
			copyRawText.messageNumber = String(messageId);
			Document.dispatchEvent(copyRawText);
		})
	//messageBtnBar.appendChild(copyRawTextBtn);
	let li = Document.createElement('li');
	li.append(copyRawTextBtn);
	messageBtnBar.appendChild(li);

	return copyRawTextBtn
}

function minimiseButton(Document, messageDiv, messageBtnBar) {
	let minimiseBtn = Document.createElement('btn');
	minimiseBtn.classList.add("whizButton");
	minimiseBtn.classList.add("minimiseBtn");

	minimiseBtn.title = "Minimise";
	minimiseBtn.innerText = "-";
	minimiseBtn.addEventListener('click', () => {
		let tables = messageDiv.getElementsByTagName("table")
		let l = tables.length;
		for (let i = 0; i < l; i ++) {
			if (tables[i].style.display == "none") {
				tables[i].style.display = "";
				minimiseBtn.set = "";
			} else {
				tables[i].style.display = "none";
				minimiseBtn.set = "minimised";
			}
		}
	})
	//console.log("buttonBar", messageBtnBar, messageDiv.id);
	//messageBtnBar.appendChild(minimiseBtn);
	let li = Document.createElement('li');
	li.append(minimiseBtn);
	messageBtnBar.appendChild(li);
}	



function copyRawTextButtonBar(Document) {
	let copyRawBtn = Document.createElement('btn');

	copyRawBtn.classList.add("whizButton");
	copyRawBtn.classList.add("copyRawBtn");
	
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
	let buttonBar = Document.getElementById("btnBarMessageSizing")
	buttonBar.appendChild(li);
}

function sideBySideCompareButton(Document, messageBtnBar) {
	let sideBySideCompareBtn = Document.createElement('btn');

	sideBySideCompareBtn.classList.add("whizButton");
	sideBySideCompareBtn.classList.add("sideBySideCompareBtn");
	
	sideBySideCompareBtn.style.display = "inherit";
	
	sideBySideCompareBtn.title = "Splitscreen View: Move to other side";
	sideBySideCompareBtn.innerText = "||";

	sideBySideCompareBtn.addEventListener('click', (e) => {
		sideBySideCompareEvent.messageId = e.target.parentElement.parentElement.parentElement.id;
		Document.dispatchEvent(sideBySideCompareEvent);
	})

	let li = Document.createElement('li');
	li.append(sideBySideCompareBtn);
	messageBtnBar.appendChild(li);
	//console.log("buttonBar", messageBtnBar, messageDiv.id);
	//messageBtnBar.appendChild(sideBySideCompareBtn);
}


function expandSchemaButton(Document) {
	let expandSchemaBtn = Document.createElement('btn');
	
	expandSchemaBtn.classList.add("whizButton");
	expandSchemaBtn.classList.add("expandSchemaBtn");

	expandSchemaBtn.style.position = "";
	expandSchemaBtn.innerText = "Expand All";
	expandSchemaBtn.title = "Expand all segments as schema";
	expandSchemaBtn.addEventListener('click', () => {
		//console.log("schema button clicked");
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
	
	let div = document.createElement('div');
	
	let compareDropDown = document.createElement('select');
	compareDropDown.name = "compareDropDown";
	compareDropDown.id = "compareDropDown";
	compareDropDown.style.display = "none";
	compareDropDown.addEventListener('click', () => { 
		while (compareDropDown.options.length > 0) {
			compareDropDown.remove(0);
		}
		messageTabSearchEvent.compareDropDown = compareDropDown;
		Document.dispatchEvent(messageTabSearchEvent);
	} );
	
	compareDropDown.addEventListener('change', (e) => { 
		console.log("e", e);
		if (e.target.value == "Choose a tab") {
			return
		}
		//console.log(messageTabGetMessage(compareDropDown.value))
		messageTabGetMessage(compareDropDown.value, e.target.selectedOptions[0].innerText);
		/// TODO - swap this delay for a proper promise on the messageTabGetMessage!!!
		delay(500).then(() => {
			Document.dispatchEvent(addMouseOverCompare);
		});
		compareDropDown.style.display = "none";		
	});
	
	let messageImportBtn = Document.createElement('btn');
	
	//compareDropDown.classList.add("whizButton");
	messageImportBtn.classList.add("whizButton");
	messageImportBtn.classList.add("messageImportBtn");
	
	messageImportBtn.innerText = "Import Message";
	messageImportBtn.title = "Import Message from a Full Contents tab";
	messageImportBtn.addEventListener('click', () => {
		if (compareDropDown.style.display != "none") {
			compareDropDown.style.display = "none";
			return
		}
		if (compareDropDown.options.length == 0) {
			let tabOption = document.createElement("option");
			tabOption.setAttribute('value', "Choose a tab");
			let optionText = document.createTextNode("Choose a tab");
			tabOption.appendChild(optionText);
			compareDropDown.appendChild(tabOption);
		}
		compareDropDown.value = "Choose a tab";
		compareDropDown.style.display = "";
		
		// When there is a "click"
		//compareDropDownSelect = Document.getElementById("compareDropDown");
		//messageTabGetMessage(compareDropDown.value);
		
		
		
	})
	
	div.append(messageImportBtn);
	div.append(compareDropDown);
	
	let li = Document.createElement('li');
	li.append(div);
	let buttonBar = Document.getElementById("btnBarTextComparison");
	buttonBar.appendChild(li);
}


function textCompareBtn(Document) {
	let textCompareBtn = Document.createElement('btn');
	let li = Document.createElement('li');
	li.append(textCompareBtn);
	let buttonBar = Document.getElementById("btnBarTextComparison");
	buttonBar.appendChild(li);
	console.log("TEXT COMPARE BUTTON ADDED");

	chrome.storage.local.get({
		settings: [],
		instances: [],
		}, function(stored) {
			if (Object.keys(stored).length === 0) {
				instances = [];
				settings = {};
			} else {
				instances = stored.instances;
				settings = stored.settings;
				/*
				if (settings.CustomColours != undefined) {
					customColours = settings.CustomColours;
				}*/
				if (settings.TextCompareOn != undefined) {
					mouseoverEnabled = settings.TextCompareOn;
				}
				
			}
			
			//buttonStyling(textCompareButton);
			
			textCompareBtn.classList.add("whizButton");
			textCompareBtn.classList.add("textCompareBtn");

			if (settings.ButtonsShow) {
				textCompareBtn.style.display = "inherit";
			}
			//textCompareBtn.style.display = "inherit";
			textCompareBtn.title = "Hover mouse over segments and fields to perform comparison.";
			if (mouseoverEnabled) {
				textCompareBtn.innerText = "Disable Text Compare";
				textCompareBtn.style.backgroundColor = "salmon";
				Document.dispatchEvent(enableTextCompareEvent);
				console.log("TEXT COMPARE AUTO ON");
			} else {
				textCompareBtn.innerText = "Enable Text Compare";
			}
			
			textCompareBtn.addEventListener('click', () => {
				if (mouseoverEnabled) {
					Document.dispatchEvent(disableTextCompareEvent);
					mouseoverEnabled = false;
					textCompareBtn.style.backgroundColor = "#df663d";
					textCompareBtn.innerText = "Enable Text Compare";
				} else {
					Document.dispatchEvent(enableTextCompareEvent);
					mouseoverEnabled = true;
					textCompareBtn.style.backgroundColor = "salmon";
					textCompareBtn.innerText = "Disable Text Compare";
				}
			})
			//Document.getElementsByTagName("body")[0].appendChild(minimiseAllButton);
			

	});
	
}

function minimiseAllButton(Document) {
	let minimiseAllBtn = Document.createElement('btn');

	minimiseAllBtn.classList.add("whizButton");
	minimiseAllBtn.classList.add("minimiseAllBtn");

	minimiseAllBtn.title = "Minimise All";
	minimiseAllBtn.innerText = "Minimise All";
	
	
	minimiseAllBtn.addEventListener('click', () => {
		let buttons = Document.getElementsByTagName('btn');
		let l = buttons.length;
		for (let i =0; i < l; i++) {
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
	li.append(minimiseAllBtn);
	let buttonBar = Document.getElementById("btnBarMessageSizing")
	buttonBar.appendChild(li);
}

let wrapSetting = "";
let wrapWidth = "";
let wrapOverflowX = "";
let tableLayout = "";
let wrapWidthSegment = "";
let textWrap = "";
let overflowWrap = "";

function wrapRowsButton(Document) {
	/// Adds button to enable wrapping of table rows
	let wrapRowsBtn = Document.createElement('btn');
	
	wrapRowsBtn.classList.add("whizButton");
	wrapRowsBtn.classList.add("wrapRowsBtn");
	
	wrapRowsBtn.title = "Allow text in message segments to wrap to next line.";
	wrapRowsBtn.innerText = "Wrap Rows";

	
	wrapRowsBtn.addEventListener('click', () => {

		let tableData = Document.getElementsByTagName("td");

		if (wrapSetting == "") {
			wrapSetting = "inline-block" ;
			wrapWidth = "auto";
			wrapWidthSegment = "auto";
			wrapOverflowX = "hidden";
			tableLayout = "fixed";
			textWrap = "balance";
			overflowWrap = "anywhere";
		} else {
			wrapSetting = "" ;
			wrapWidth = "";
			wrapWidthSegment = "";
			wrapOverflowX = "auto";
			tableLayout = "unset";
			textWrap = "";
			overflowWrap = "";
		}
		let l = tableData.length;
		for (let i = 0; i < l; i++) {
			tableData[i].style.display = wrapSetting;
			tableData[i].style.textWrap = textWrap;
			tableData[i].style.overflowWrap = overflowWrap;
		}
		let EDIDocumentTable = Document.getElementsByClassName("EDIDocumentTable");
		let l2 = EDIDocumentTable.length;
		for (let i = 0; i < l2; i++) {
			EDIDocumentTable[i].style.width = wrapWidth;
			EDIDocumentTable[i].parentElement.style.overflowX = wrapOverflowX;
			EDIDocumentTable[i].style.tableLayout = tableLayout;
		}

		let EDISegmentsTable = Document.getElementsByClassName("EDISegmentsTable");
		let l3 = EDISegmentsTable.length;
		for (let i = 0; i < l3; i++) {
			EDISegmentsTable[i].style.width = wrapWidthSegment;
			EDISegmentsTable[i].parentElement.style.overflowX = wrapOverflowX;
			EDISegmentsTable[i].parentElement.style.textWrap = textWrap;
			EDISegmentsTable[i].parentElement.style.overflowWrap = overflowWrap;
			EDISegmentsTable[i].style.textWrap = textWrap;
			EDISegmentsTable[i].style.overflowWrap = overflowWrap;
		}

	});
	
	let li = Document.createElement('li');
	li.append(wrapRowsBtn);
	let buttonBar = Document.getElementById("btnBarMessageSizing");
	buttonBar.appendChild(li);
}


function showRelatedButton(messageDocument) {
	let showRelatedBtn = messageDocument.createElement('btn');

	showRelatedBtn.classList.add("whizButton");
	showRelatedBtn.classList.add("showRelatedBtn");
	
	showRelatedBtn.title = "Show messages related to the highlighted message";
	showRelatedBtn.innerText = "Show Related";
	
	let li = messageDocument.createElement('li');
	li.append(showRelatedBtn);
	let buttonBar = messageDocument.getElementById("btnBarTraceViewer")
	buttonBar.appendChild(li);
	return showRelatedBtn
}

let hideUnrelatedBtn
function hideUnrelatedButton(messageDocument) {
	hideUnrelatedBtn = messageDocument.createElement('btn');
	
	hideUnrelatedBtn.classList.add("whizButton");
	hideUnrelatedBtn.classList.add("hideUnrelatedBtn");
	
	hideUnrelatedBtn.title = "Hide Visual Trace messages that are unrelated to the current view";
	hideUnrelatedBtn.innerText = "Hide Unrelated";
	hideUnrelatedBtn.style.display = "none";

	let li = messageDocument.createElement('li');
	li.append(hideUnrelatedBtn);
	let buttonBar = messageDocument.getElementById("btnBarTraceViewer")
	buttonBar.appendChild(li);
	return hideUnrelatedBtn
}


function searchExpandedSchemaButton(Document) {
	let searchDiv = Document.createElement('div');
	let searchExpandedSchemaBtn = Document.createElement('btn');
	
	searchExpandedSchemaBtn.classList.add("whizButton");
	searchExpandedSchemaBtn.classList.add("searchExpandedSchemaBtn");

	//searchExpandedSchemaBtn.style.display = "";
	
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
	
	searchDiv.appendChild(searchExpandedSchemaBtn);
	searchDiv.appendChild(searchlabel);
	searchDiv.appendChild(searchInput);
	
	const keys = ["ArrowUp", "ArrowRight", "ArrowDown", "ArrowLeft", "Control", "Shift"]
	let highlighted = false;
	searchInput.addEventListener('keyup', function(e) { 
		searchExpandedSchemaEvent.keyUpEvent = e;
		searchExpandedSchemaEvent.searchInput = searchInput;
		searchExpandedSchemaEvent.searchlabel = searchlabel;
		searchExpandedSchemaEvent.searchExpandedSchemaBtn = searchExpandedSchemaBtn;
		Document.dispatchEvent(searchExpandedSchemaEvent);
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
	let buttonBar = Document.getElementById("btnBarMessageSearch");
	buttonBar.appendChild(li);
	
}


function escapeRegExp(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

function uncloseAllButton(Document) {
	let reopenButton = Document.createElement('btn');
	
	reopenButton.classList.add("whizButton");
	reopenButton.classList.add("reopenButton");
	
	reopenButton.title = "Reopen Closed";
	reopenButton.innerText = "Reopen Closed";
	
	reopenButton.addEventListener('click', () => {
		let buttons = Document.getElementsByTagName('btn');
		let l = buttons.length;
		for (let i =0; i < l; i++) {
			if (buttons[i].title == "Close") {
				buttons[i].parentNode.parentNode.parentNode.style.display = "";
			}
		}
		
		// Full Trace tab
		if (messageArray.length > 0) {
			currentRelated = "" // for Show Related button
			let length = messageArray.length;
			for (let i =0; i < length; i++) { 
				messageArray[i].svgComponent.style.stroke = "";
				messageArray[i].svgComponent.style.strokeWidth = "";
			}
		}
	})
	let li = Document.createElement('li');
	li.append(reopenButton);
	let buttonBar = Document.getElementById("btnBarMessageSizing")
	buttonBar.appendChild(li);
}

function shareButton(Document) {
	let shareBtn = Document.createElement('btn');
	//buttonStyling(shareButton);
	
	shareBtn.classList.add("whizButton");
	shareBtn.classList.add("shareBtn");
	
	shareBtn.title = "Create a link that can be shared with other extension users";
	shareBtn.innerText = "Copy Share Link";
	
	shareBtn.addEventListener('click', () => {
		let shareLink = stubUrl[0] + "EnsPortal.MessageContents.zen?HeaderClass=Ens.MessageHeader&HeaderId=";
		let l = sortedMessageArray.length;
		for (let i = 0; i < l; i++) {
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
	li.append(shareBtn);
	let buttonBar = Document.getElementById("btnBarMessageSizing");
	buttonBar.appendChild(li);
		
}



function compareLegendButtons(Document) {
	
	let compareLegendDiv
	let showLegendBtn
	let hideLegendBtn
	
	compareLegendDiv = Document.createElement("div");
		

	let legendTitle = Document.createElement("div");
	legendTitle.innerText = "TEXT COMPARE LEGEND";
	//legendTitle.style.color = "white";
	legendTitle.style.padding = "8px";
	legendTitle.classList.add("legendTitle");
	
	let legendExactMatch = Document.createElement("div");
	legendExactMatch.innerText = "Field name match, value match";
	legendExactMatch.style.color = "white";
	legendExactMatch.style.backgroundColor = "green";
	legendExactMatch.style.padding = "8px";

	let legendCopyMatch = Document.createElement("div");
	legendCopyMatch.innerText = "Field name mismatch, value match";
	legendCopyMatch.style.color = "blue";
	legendCopyMatch.style.backgroundColor = "lightgreen";
	legendCopyMatch.style.padding = "8px";

	let legendNoMatch = Document.createElement("div");
	legendNoMatch.innerText = "Field name match - value mismatch";
	legendNoMatch.style.color = "white";
	legendNoMatch.style.backgroundColor = "red";
	legendNoMatch.style.padding = "8px";

	let legendPartialMatch = Document.createElement("div");
	legendPartialMatch.innerText = "Field name mismatch - value partial match";
	legendPartialMatch.style.color = "blue";
	legendPartialMatch.style.backgroundColor = "yellow";
	legendPartialMatch.style.padding = "8px";
	
	let legendSegmentMatch = Document.createElement("div");
	legendSegmentMatch.innerText = "Segment name match - field raw text match";
	legendSegmentMatch.style.color = "blue";
	legendSegmentMatch.style.backgroundColor = "white";
	legendSegmentMatch.style.border = "6px solid green";
	legendSegmentMatch.style.padding = "4px";

	let legendSegmentMisMatch = Document.createElement("div");
	legendSegmentMisMatch.innerText = "Segment name match - field raw text mismatch";
	legendSegmentMisMatch.style.color = "blue";
	legendSegmentMisMatch.style.backgroundColor = "white";
	legendSegmentMisMatch.style.border = "6px solid red";
	legendSegmentMisMatch.style.padding = "4px";
	
	compareLegendDiv.appendChild(legendTitle);	
	compareLegendDiv.appendChild(legendExactMatch);
	compareLegendDiv.appendChild(legendCopyMatch);
	compareLegendDiv.appendChild(legendNoMatch);
	compareLegendDiv.appendChild(legendPartialMatch);
	compareLegendDiv.appendChild(legendSegmentMatch);
	compareLegendDiv.appendChild(legendSegmentMisMatch);

	compareLegendDiv.style.position = "fixed";
	compareLegendDiv.style.display = "none";
	
	compareLegendDiv.style.backgroundColor = "#ffffff";
	compareLegendDiv.style.border = "5px black solid";
	
	compareLegendDiv.style.top = "10px";
	compareLegendDiv.style.left = "0";
	compareLegendDiv.style.zIndex = "4";
	compareLegendDiv.style.overflow = "visible";
	
		
	hideLegendBtn = Document.createElement('btn');
	showLegendBtn = Document.createElement('btn');
		
		
	hideLegendBtn.classList.add("whizButton");
	hideLegendBtn.classList.add("hideLegendBtn");
	
	hideLegendBtn.innerText = "Hide Legend";
	hideLegendBtn.addEventListener('click', () => {
		compareLegendDiv.style.display = "none";
		showLegendBtn.style.display = "block";
	})

	showLegendBtn.classList.add("whizButton");
	showLegendBtn.classList.add("showLegendBtn");

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
	let buttonBar = Document.getElementById("btnBarTextComparison");
	buttonBar.appendChild(compareLegendDiv);
	buttonBar.appendChild(liShowLegendBtn);
	showLegendBtn.id = "showLegendBtn";

	/*
	Document.addEventListener("mouseup", function(e) {
		console.log("mouseup triggered on: ", e);
		hideLegend(e);
	})
	document.addEventListener("mouseup", function(e) {
		console.log("mouseup triggered on: ", e);
		hideLegend(e);
	})*/
	
	function hideLegend(e) {
		if ((e.target == showLegendBtn) || (e.target == legendTitle)) {
			// Do nothing
		} else if (compareLegendDiv.style.display === "") {
			hideLegendBtn.click();
		}
	}
	


	// Make the divider draggable
	legendTitle.addEventListener("mousedown", (event) => {
		const initialX = event.clientX;
		const initialY = event.clientY;
		const compareLegendDivRect = compareLegendDiv.getBoundingClientRect();
		const initialLeft = compareLegendDivRect.left;
		const initialTop = compareLegendDivRect.top;

		const mousemoveListener = (event) => {  // Store the mousemove listener
			const newLeft = initialLeft + (event.clientX - initialX);
			const newTop = initialTop + (event.clientY - initialY);
			compareLegendDiv.style.left = newLeft + "px";
			compareLegendDiv.style.top = newTop + "px";
			//leftContainer.style.width = newLeft - 16 + "px";
			//rightContainer.style.width = (window.innerWidth - newLeft - compareLegendDiv.offsetWidth) + 16 + "px";
			//rightContainer.style.paddingTop = String(document.getElementById("buttonBar").offsetHeight + 6);

	};
	
		document.addEventListener("mousemove", mousemoveListener);  // Attach listener
	
		compareLegendDiv.addEventListener("mouseup", () => {  // Use divider.removeEventListener
			document.removeEventListener("mousemove", mousemoveListener);  // Remove listener
		
		});
	});

}



function searchSegmentsButton(Document) {
	let searchDiv = Document.createElement('div');
	let searchSegmentsBtn = Document.createElement('btn');
	
	searchSegmentsBtn.classList.add("whizButton");
	searchSegmentsBtn.classList.add("searchSegmentsBtn");
	
	searchSegmentsBtn.id = "searchSegmentsBtn";
	searchSegmentsBtn.title = "Search Segments";
	searchSegmentsBtn.innerText = "Search Segments";
	
	let searchlabel = Document.createElement('label');
	let searchInput = Document.createElement('input');
	
	searchInput.setAttribute('id', 'searchSegmentsInput');
	searchInput.setAttribute('name', 'search');
	searchInput.setAttribute('type', 'text');
	searchInput.setAttribute('placeholder', 'Search Segments & Values');
	
	searchInput.title = "Press ENTER when blank to exit search mode";
	
	searchInput.style.display = "none";
	searchlabel.style.display = "none";
	
	searchDiv.appendChild(searchSegmentsBtn);
	searchDiv.appendChild(searchlabel);
	searchDiv.appendChild(searchInput);
	
	
	searchSegmentsBtn.addEventListener('click', () => {	
		searchSegmentsBtn.style.display = "none";
		searchInput.style.display = "";
		searchlabel.style.display = "";
		expandSchemaEvent.schemaSearch = true
		searchInput.focus();
	})
	
	searchInput.addEventListener('keyup', function(e) { 
		searchSegmentsEvent.keyUpEvent = e;
		searchSegmentsEvent.searchInput = searchInput;
		searchSegmentsEvent.searchlabel = searchlabel;
		searchSegmentsEvent.searchSegmentsBtn = searchSegmentsBtn;
		Document.dispatchEvent(searchSegmentsEvent);
		
	});
	
	let li = Document.createElement('li');
	li.append(searchDiv);
	let buttonBar = Document.getElementById("btnBarMessageSearch");
	buttonBar.appendChild(li);
		
}

let schemaModeFull = false;
function schemaModeButton(Document) {
	let schemaModeBtn = Document.createElement('btn');
	
	schemaModeBtn.classList.add("whizButton");
	schemaModeBtn.classList.add("schemaModeButton");
	
	schemaModeBtn.title = "Toggle Schema between messages known values and full schema";
	
	schemaModeBtn.innerText = "Schema Mode: Known";
	
	schemaModeBtn.addEventListener('click', () => {
		let expandors = document.getElementsByClassName("toggleSchema");
		console.log("schemaModeFull = ", schemaModeFull);
		if (schemaModeFull == false) {
			schemaModeFull = true;
			schemaModeBtn.innerText = "Schema Mode: Full";
			schemaModeBtn.style.backgroundColor = "darkred";
			for (let i = 0; i < expandors.length; i++){ 
				expandors[i].style.backgroundColor = "darkred";
			}
			
		} else {
			schemaModeFull = false
			schemaModeBtn.innerText = "Schema Mode: Known";
			schemaModeBtn.style.backgroundColor = "orange";
			for (let i = 0; i < expandors.length; i++){ 
				expandors[i].style.backgroundColor = "orange";
			}
		}
	})
	let li = Document.createElement('li');
	li.append(schemaModeBtn);
	let buttonBar = Document.getElementById("btnBarMessageSearch")
	buttonBar.appendChild(li);
}

function namespaceCategorySearchButton(Document) {
	let namespaceCategorySearchBtn = Document.createElement('btn');

	namespaceCategorySearchBtn.classList.add("whizButton");
	namespaceCategorySearchBtn.classList.add("namespaceCategorySearchBtn");
	
	namespaceCategorySearchBtn.title = "Show all active productions across all namespaces and enable a joined category search.";
	namespaceCategorySearchBtn.innerText = "Active Production Category Search";
	
	
	
	let namespaceCategoryDropDown = document.createElement('select');
	namespaceCategoryDropDown.name = "namespaceCategoryDropDown";
	namespaceCategoryDropDown.id = "namespaceCategoryDropDown";
	namespaceCategoryDropDown.className = "namespaceCategoryDropDown";
	namespaceCategoryDropDown.title = "Select a category to show all active productions using this category. *"
	
	
	let namespaceCategoryDropDownLabel = document.createElement('Label');
	namespaceCategoryDropDownLabel.id = "namespaceCategoryDropDownLabel";
	namespaceCategoryDropDownLabel.style.display = "none";
	namespaceCategoryDropDownLabel.innerText = "Active Production Category Search:"
	namespaceCategoryDropDownLabel.title = "Select a category to show all active productions using this category."
	namespaceCategoryDropDownLabel.className = "dgmAction";
	
	let loading = document.createElement('option');
	let optionText = document.createTextNode("Fetching active productions:    ");
	loading.appendChild(optionText);
	namespaceCategoryDropDown.appendChild(loading);
	
	namespaceCategoryDropDown.addEventListener('change', (e) => { 
		console.log("e", e);
		categoryListSelectionEvent.optionValue = e.target.value
		Document.dispatchEvent(categoryListSelectionEvent);
	});
	
	namespaceCategorySearchBtn.addEventListener('click', (e) => {
		namespaceCategorySearchBtn.style.display = "none";
		namespaceCategoryDropDown.style.display = "inherit";
		namespaceCategoryDropDownLabel.style.display = "inherit";
		//categoryListEvent.optionValue = e.target.value
		Document.dispatchEvent(categoryListEvent);
	});
	
	let li = Document.createElement('li');
	li.append(namespaceCategorySearchBtn);
	li.append(namespaceCategoryDropDownLabel);
	li.append(namespaceCategoryDropDown);
	let bar = Document.getElementById("namespaceCategorySearchBar")
	bar.appendChild(li);
	return
}

function createNamespaceCategorySearchBar(Document) {
	let diagramHeader = Document.getElementById("diagramHeader");
	let currentPageHeaderTables = diagramHeader.querySelectorAll("table");
	currentPageHeaderTables = currentPageHeaderTables[0]
	let categorySearchCell = currentPageHeaderTables.rows[0].insertCell(4);
	
	let bar = Document.createElement("ul");
	bar.className = "namespaceCategorySearchBar";
	bar.id = "namespaceCategorySearchBar";
	
	categorySearchCell.appendChild(bar);
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
	.MsgContents::-webkit-scrollbar {
  height: 15px;
}

/* Track */
.MsgContents::-webkit-scrollbar-track {
  /*box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);*/
  background: #f0f0f0;
  border-radius: 3px;
}
 
/* Handle */
.MsgContents::-webkit-scrollbar-thumb {
  background: #b4b4b4; 
  border-radius: 3px;
}

/* Handle on hover */
.MsgContents::-webkit-scrollbar-thumb:hover {
  background: lightGrey; 
}
`

const scrollBarStringHighlight = `
	.MsgContents::-webkit-scrollbar {
  height: 15px;
}

/* Track */
.MsgContents::-webkit-scrollbar-track {
  /*box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);*/
  background: #f0f0f0;
  border-radius: 3px;
}
 
/* Handle */
.MsgContents::-webkit-scrollbar-thumb {
  background: #252525; 
  border-radius: 3px;
}

/* Handle on hover */
.MsgContents::-webkit-scrollbar-thumb:hover {
  background: lightGrey; 
}
`

let scrollBarStyleObject

function scrollBarStyle(Document) {
	scrollBarStyleObject = Document.createElement('style');
	scrollBarStyleObject.textContent = scrollBarString;
	Document.head.append(scrollBarStyleObject);
}


function buttonBarStyle(Document) {
	return
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
	let currentPageTitle = document.title
	console.log("currentPageTitle", currentPageTitle);
	if (currentPageTitle.includes("Login")) {
		throw new Error("Prevent buttonBar loading on Login page");
	}
	if (Document.getElementById("buttonBar")) {
		// Skip
	} else {
		let bar = Document.createElement('ul');
		bar.id = "buttonBar";
		bar.className = "buttonBar";
		//bar.style.backgroundColor = "black";
		let messageSizingLi = Document.createElement("li");
		let messageSizingUl = Document.createElement("ul");
		messageSizingUl.id = "btnBarMessageSizing";
		messageSizingUl.classList.add("btnGrp");
		messageSizingLi.appendChild(messageSizingUl);
		bar.appendChild(messageSizingLi);
		// Message sizing:
		// - wrap rows
		// - minimise all
		// - unclose all



		let messageSearchLi = Document.createElement("li");
		let messageSearchUl = Document.createElement("ul");
		messageSearchUl.id = "btnBarMessageSearch";
		messageSearchUl.classList.add("btnGrp");
		messageSearchLi.appendChild(messageSearchUl);
		bar.appendChild(messageSearchLi);

		// Message Search:
		// - Schema Type
		// - Schema Search
		// - Search Segments


		let textComparisonLi = Document.createElement("li");
		let textComparisonUl = Document.createElement("ul");
		textComparisonUl.id = "btnBarTextComparison";
		textComparisonUl.classList.add("btnGrp");
		textComparisonLi.appendChild(textComparisonUl);
		bar.appendChild(textComparisonLi);

		// Text comparison:
		// - Import
		// - Text Compate
		// - Legend


		let traceViewerLi = Document.createElement("li");
		let traceViewerUl = Document.createElement("ul");
		traceViewerUl.id = "btnBarTraceViewer";
		traceViewerUl.classList.add("btnGrp");
		traceViewerLi.appendChild(traceViewerUl);
		bar.appendChild(traceViewerLi);
		// Trace Viewer
		// - Show Related
		// - Hide Related


		
		let displayButton = Document.createElement('button');
		displayButton.classList.add("whizButton");
		displayButton.classList.add("displayBarBtn");
		displayButton.style.display = "inherit";
		displayButton.title = "Display IRIS Whiz Buttons";
		displayButton.innerText = "IRIS Whiz";
		displayButton.id = "whiz"
		bar.append(displayButton);
		let minimiseButtonBarBtn = minimiseButtonBarButton(Document, bar);
		// children[0].className
		displayButton.addEventListener("click", function(e) {
			bar.style.boxShadow = "inset 0 0 100px 100px rgba(255, 255, 255, 0.6)";
			bar.style.border = "1px grey solid"
			minimiseButtonBarBtn.style.display = "inherit";
			displayButton.style.display = "none";
			let buttons = bar.getElementsByClassName("whizButton");
			for (let i = 0; i < buttons.length; i++) {
				if ((buttons[i].classList.contains("whizButton")) && (buttons[i].id != "whiz")) {
					buttons[i].style.display = "inherit";
				}
			}
		})		
	
		Document.body.insertBefore(bar, Document.body.firstChild);
		chrome.storage.local.get({
			settings: {},
			}
			,	function(stored) {
				if (stored.settings.ButtonsShow) {
					displayButton.click();
				}
			}
		);
	}
}


function minimiseButtonBarButton(Document, bar) {
	let minimiseButtonBarBtn = Document.createElement('btn');
	
	minimiseButtonBarBtn.classList.add("minimiseButtonBarBtn");

	minimiseButtonBarBtn.title = "Minimise Button Bar";
	minimiseButtonBarBtn.innerText = "-";
	minimiseButtonBarBtn.addEventListener('click', () => {
		minimiseButtonBarBtn.style.display = "none";
		bar.style.boxShadow = "";
		let buttons = bar.getElementsByClassName("whizButton");
		for (let i = 0; i < buttons.length; i++) {
			if ((buttons[i].classList.contains("whizButton")) && (buttons[i].id != "whiz")) {
				buttons[i].style.display = "none";
			} else if (buttons[i].id == "whiz") {
				buttons[i].style.display = "inherit";
			}
		}
		bar.style.border = "none";
	})
	//console.log("buttonBar", messageBtnBar, messageDiv.id);
	bar.appendChild(minimiseButtonBarBtn);
	return minimiseButtonBarBtn
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

// Syncs scrolling for IWMsgOutline class
function syncScrolling(Document, object) {
	function keypress() {
		let ctrl = window.event.ctrlKey
		//console.log("keydown triggered");
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
		//console.log("Mouse down on element!");
		let divsArray = Document.getElementsByClassName("MsgContents");
		//console.log("divsArray -- ", divsArray);
		let ctrl = window.event.ctrlKey;
		if (ctrl) {
		//console.log("mousedown + ctrl");
		object.onscroll = function() { 
			let length = divsArray.length;
			for (let x = 0; x < length; x ++) {
				if (divsArray[x] != object) {
					syncScroll(object, divsArray[x])
				}
			}
		}
	  } else {
			//console.log("mousedown - ctrl");
			object.onscroll = function() { };
	  
	  }
	});
	
	// Remove scroll link on mouseup
	object.addEventListener("mouseup", function() {
		//console.log("Mouse up on element!");
		let divsArray = Document.getElementsByClassName("MsgContents");
		//console.log("divsArray -- ", divsArray);
		let l = divsArray.length
		for (let x = 0; x < l; x ++) {
			object.onscroll = function() { };
		}
	});
	
	// For synchronising the message scrollbars when CTRL is held
	function syncScroll(from, to)
	{
		//console.log("synScroll!");
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


