/// Detailed Trace Viewer
console.log("Trace Viewer Content Script");

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
messageArray = [];

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
    
    let displayHeaderElements = [
            { 
                "tab": headerHeaderDetails,
                "body": headerDetails,
            },
            { 
                "tab": headerBodyDetails,
                "body": bodyDetails,
            },
            { 
                "tab": headerBodyContents,
                "body": bodyContents,
            },
            {
                "tab": fullTraceHeader,
                "body": fullTrace,
            }
        ]
        
    displayHeaderElements.forEach((currentElement, i) => {
        currentElement.tab.addEventListener('click', () => {
            if (currentElement.tab.getAttribute("class") == "tabGroupButtonDisabled") {
                return
            };
            
            // Set the clicked tab as active
            currentElement.tab.setAttribute("class", "tabGroupButtonOn");
            currentElement.body.style.display = "";
            
            // Update all other tabs
            displayHeaderElements.forEach((otherElement, x) => {
                if (otherElement.tab !== currentElement.tab) {
                    if (otherElement.tab.getAttribute("class") != "tabGroupButtonDisabled") {
                        otherElement.tab.setAttribute("class", "tabGroupButtonOff");
                        otherElement.body.style.display = "none";
                    };
                }
            });
        });
    });
    
    fillFullTraceTab();
});

function fillFullTraceTab() {
    console.log("[IRIS Whiz] 🚀 Starting Ghost Canvas Architecture...");
    
    // 1. RESET ALL GLOBAL STATE
    fullTrace.innerHTML = '';
    messageIframesLoaded = 0; 
    messageArray = []; 

    traceIframe = document.getElementById("frame_19").getSVGDocument();
    traceMessages = traceIframe.getElementsByTagName("rect");
    businessObjects = traceIframe.getElementsByClassName("HostTitle");

    let traceMessageUrl = stubUrl[0] + "EnsPortal.MessageContents.zen?HeaderClass=Ens.MessageHeader&HeaderId=";

    // 2. GATHER MESSAGES
    let traceMessagesArray = [];
    for (let i = 0; i < traceMessages.length; i++) {
        if (/^message_\d+$/.test(traceMessages[i].id)) {
            let msgId = traceMessages[i].id.split("_")[1];
            traceMessagesArray.push({
                id: msgId,
                svgComponent: traceMessages[i],
                index: i
            });
        }
    }

    traceMessagesCount = traceMessagesArray.length;

    if (traceMessagesArray.length === 0) return;

    // ==========================================
    // 3. CREATE GHOST CANVAS
    // ==========================================
    mainIframe = document.createElement("iframe");
    
    // We request an impossibly high ID so InterSystems returns an empty HTML page.
    mainIframe.src = traceMessageUrl + "99999999999&btns=disable";
    mainIframe.style.width = "100%";
    mainIframe.style.height = "100%";
    mainIframe.style.border = "none";
    fullTrace.appendChild(mainIframe);

    mainIframe.addEventListener("load", function() {
        if (mainIframe.dataset.isHostProcessed) return;
        mainIframe.dataset.isHostProcessed = "true";

        let doc = mainIframe.contentDocument;

        // Wipe whatever native error text (and fake button bar) generated on the ghost page
        if (doc.body) {
            doc.body.innerHTML = '';
            doc.body.style.fontSize = "16px";
            doc.body.style.fontFamily = "Arial, sans-serif";
            doc.body.style.color = "black";
            doc.body.style.margin = "8px";
        }

        let style = doc.createElement('style');
        style.textContent = `
            .whiz-placeholder { border: 2px dashed #ccc; border-radius: 5px; margin: 10px 0; padding: 20px; text-align: center; color: #888; background: #fafafa; font-weight: bold; }
        `;
        if (doc.head) doc.head.appendChild(style);

        // ==========================================
        // BUILD THE MASTER BUTTON BAR IMMEDIATELY
        // ==========================================
        addButtonBar(doc);
        buttonBarStyle(doc);
        
        minimiseAllButton(doc);
        wrapRowsButton(doc);
        uncloseAllButton(doc);
        textCompareBtn(doc);
        compareLegendButtons(doc);
        searchExpandedSchemaButton(doc);
        schemaModeButton(doc);
        searchSegmentsButton(doc);
        
        let showRelatedBtn = showRelatedButton(doc);
        showRelatedButtonLogic(showRelatedBtn);
        
        let hideUnrelatedBtn = hideUnrelatedButton(doc);
        hideUnrelatedLogic(hideUnrelatedBtn);

        // INJECT PLACEHOLDERS
        traceMessagesArray.forEach(msgInfo => {
            let placeholder = doc.createElement('div');
            placeholder.id = 'whiz-placeholder-' + msgInfo.id;
            placeholder.className = 'whiz-placeholder';
            placeholder.innerHTML = `⏳ Loading & Prettifying Message ${msgInfo.id}...`;
            if (doc.body) doc.body.appendChild(placeholder);
        });
    });

    // ==========================================
    // 4. THE STYLE HARVESTER
    // ==========================================
    function harvestStyles(workerDoc) {
        let doc = mainIframe.contentDocument;
        let styles = workerDoc.querySelectorAll('style, link[rel="stylesheet"]');
        styles.forEach(el => {
            let isDuplicate = false;
            if (el.tagName === 'LINK') {
                let existing = doc.querySelectorAll('link[rel="stylesheet"]');
                for (let i=0; i<existing.length; i++) { if (existing[i].href === el.href) isDuplicate = true; }
            } else if (el.tagName === 'STYLE') {
                let existing = doc.querySelectorAll('style');
                for (let i=0; i<existing.length; i++) { if (existing[i].innerHTML === el.innerHTML) isDuplicate = true; }
            }
            
            if (!isDuplicate && doc.head) {
                doc.head.appendChild(el.cloneNode(true));
            }
        });
    }

    // ==========================================
    // 5. SPAWN WORKERS
    // ==========================================
    traceMessagesArray.forEach(msgInfo => {
        let messageId = msgInfo.id;
        let svgComponent = msgInfo.svgComponent;
        let index = msgInfo.index;
        
        let iframe = document.createElement("iframe");  
        iframe.src = traceMessageUrl + String(messageId) + "&schema_expansion=disable&text_compare=disable&copy_raw_text=disable&LIMITSIZE=999999999";
        iframe.style.display = "none";
        document.body.appendChild(iframe);
        
        iframe.addEventListener("load", function() {
            let attempts = 0;
            let checkReady = setInterval(() => {
                attempts++;
                try {
                    if (!iframe.contentDocument) {
                        if (attempts >= 60) clearInterval(checkReady);
                        return; 
                    }
                    if (iframe.dataset.isProcessed) { clearInterval(checkReady); return; }

                    let workerDoc = iframe.contentDocument;
                    let workerBody = workerDoc.body;
                    let isRawXML = workerDoc.documentElement && workerDoc.documentElement.tagName.toLowerCase() !== 'html';

                    if (!workerBody && !isRawXML && attempts < 60) return;

                    let isHL7 = false;
                    let isXMLRendered = false;
                    let isPrettified = false;

                    if (workerBody) {
                        let firstDiv = workerBody.querySelector("div");
                        isHL7 = firstDiv && firstDiv.textContent.trim().substring(0,3) === "HL7";
                        let xmlDocContainer = workerDoc.getElementById("document");
                        isXMLRendered = xmlDocContainer && xmlDocContainer.textContent.length > 20;
                        isPrettified = workerBody.getAttribute('data-prettified') === 'true' || workerBody.getAttribute('data-prettified') === 'failed';
                    }

                    if (isPrettified || isHL7 || isXMLRendered || isRawXML || attempts >= 60) {
                        clearInterval(checkReady);
                        if (iframe.dataset.isProcessed) return; 
                        iframe.dataset.isProcessed = "true";
                        
                        harvestStyles(workerDoc);
                        processMessageIframe(iframe, messageId, svgComponent, index);
                    }
                } catch(e) {
                    clearInterval(checkReady);
                }
            }, 50);
        });
    });

    // ==========================================
    // 6. PROCESS AND INJECT
    // ==========================================
    function processMessageIframe(iframe, messageId, traceMsgComponent, index) {
        let doc = mainIframe.contentDocument;
        let messageDiv = createSafeElement(doc, 'div');
        let messageContentDiv = createSafeElement(doc, 'div');
        messageContentDiv.classList.add("MsgContents");
        
        messageStyling(messageDiv);

        try {
            extractPayloadToTarget(iframe.contentDocument, doc, messageContentDiv);
        } catch (err) {
            messageContentDiv.innerHTML = '</br><p style="color:red">Unable to retrieve HTML content.</p>';
        }

        let traceMsg = traceMessages[index];
        traceMsg.locationInfo = getMessageLocations(traceMsg);
        let startOp = traceMsg.locationInfo.startOperation;
        let endOp = traceMsg.locationInfo.endOperation;
        
        let messageHeading = createSafeElement(doc, "a");
        messageHeading.className = "IWMsgTitle";
        messageHeading.style.padding = "10px";
        
        if (traceMsg.locationInfo.messageType == "responder") {
            messageHeading.textContent = endOp + ' <---- ' + startOp; 
        } else {
            messageHeading.textContent = startOp + ' ----> ' + endOp;
        }
        
        messageContentDiv.insertBefore(messageHeading, messageContentDiv.firstChild);
        messageDiv.id = messageId;
        
        let messageBtnBar = messageButtonBar(document, messageDiv.id);
        messageDiv.appendChild(messageBtnBar);
        messageDiv.appendChild(messageContentDiv);

        let messageResendBtn = messageResendButton(document, messageBtnBar);
        if (messageResendBtn && messageResendBtn.style) {
            messageResendBtn.style.display = "block";
        }
        
        sideBySideCompareButton(document, messageBtnBar);
        copyRawTextButton(document, messageId, messageBtnBar);
        minimiseButton(document, messageDiv, messageBtnBar);
        closeButtonHide(document, messageBtnBar);
        
        if (traceMsg.className.baseVal == "MsgOutlineSelect") {
            messageDiv.setAttribute('selected', 'true');
            messageDiv.style.backgroundColor = "rgb(243,231,153)";
        } else {
            messageDiv.setAttribute("selected", "");
        }
        
        // PLACEHOLDER REPLACEMENT 
        let placeholder = doc.getElementById('whiz-placeholder-' + messageId);
        if (placeholder) {
            placeholder.replaceWith(messageDiv);
        } else {
            doc.body.appendChild(messageDiv);
        }
        
        messageIframesLoaded++;
        messageArray.push({messageNumber: parseInt(messageId), object: messageDiv, locationInfo: traceMsg.locationInfo, svgComponent: traceMsg});
        
        traceMsg.parentElement.addEventListener('mouseover', () => {
            traceMsg.style.fill = "#d5d5d5";
            if (messageDiv.getAttribute("selected") == "") messageDiv.style.backgroundColor = "#d5d5d5";
        });
        
        traceMsg.parentElement.addEventListener('mouseout', () => {
            traceMsg.style.fill = "";
            if (messageDiv.getAttribute("selected") == "") messageDiv.style.backgroundColor = "white";
        });
        
        traceMsg.parentElement.addEventListener('click', (e) => {
            let messageArrayLength = messageArray.length;
            for (let j = 0; j < messageArrayLength; j ++) {
                messageArray[j].object.setAttribute('selected',"");
                messageArray[j].object.style.backgroundColor = "white";
            }
            messageDiv.style.backgroundColor = "rgb(243,231,153)";
            messageDiv.setAttribute("selected","true");
        });
        
        messageDiv.addEventListener('mouseover', () => {
            traceMsg.style.fill = "#d5d5d5";
            if (messageDiv.getAttribute("selected") == "") messageDiv.style.backgroundColor = "#d5d5d5";
        });
        
        messageDiv.addEventListener('mouseout', () => {
            traceMsg.style.fill = "";
            if (messageDiv.getAttribute("selected") == "") messageDiv.style.backgroundColor = "white";
        });
        
        messageDiv.childNodes[1].addEventListener('click', (e) => {
            let ctrl = e.ctrlKey;
            if (ctrl) {
                let traceIframeScroll = document.getElementById("svgdiv_19");
                traceIframeScroll.scrollTop = parseInt(traceMsg.locationInfo.yValue) - 10;
                traceIframeScroll.scrollLeft = parseInt(traceMsg.locationInfo.startLocation) - 40;
            } else {
                if ((messageDiv.getAttribute('selected') == "") && (e.target ==  e.currentTarget)) {
                    let messageArrayLength = messageArray.length;
                    for (let j = 0; j < messageArrayLength; j ++) {
                        messageArray[j].object.setAttribute('selected',"");
                        messageArray[j].object.style.backgroundColor = "white";
                    }
                    messageDiv.style.backgroundColor = "rgb(243,231,153)";
                    messageDiv.setAttribute("selected","true");
                    traceMsg.parentElement.dispatchEvent(new MouseEvent("mousedown", {bubbles: true, cancelable: true}));
                }
            }
        });
        
        messageAppend();

        if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
    }
}

function getMessageLocations(message) {
    let elems = message.parentElement.children; 
    
    let messageStartLocation = 0;
    let messageEndLocation = 0;
    let yValue = 0;
    let messageClassName; 
    let messageStartOperation = "" ;
    let messageEndOperation = "";
    let messageType = "";
    
    let elemsLength = elems.length;
    for (let eachElem = 0; eachElem < elemsLength; eachElem++ ) {
        if (elems[eachElem].className.animVal.includes("MsgStart")) {
            messageStartLocation = elems[eachElem].attributes.cx.value;
        } else if ((elems[eachElem].className.animVal.includes("MsgLine")) && (messageType == "")) {
            messageClassName = elems[eachElem].className.animVal; 
            if (messageClassName.includes("Response")) {
                messageType = "responder";
            } else {
                messageType = "sender";
            }
        }
    }

    let businessObjectsLength = businessObjects.length;
    for (let y = 0; y < businessObjectsLength; y++) {
        if ((businessObjects[y].attributes.x.value == messageStartLocation) && (businessObjects[y].textContent != "")) {
            messageStartOperation = messageStartOperation + businessObjects[y].innerHTML;           
        }
    }

    for (let eachElem = 0; eachElem < elemsLength; eachElem++ ) {
        if (elems[eachElem].className.animVal.includes("MsgTerm")) {
            messageEndLocation = parseInt(elems[eachElem].attributes.x.value) + 7;
            yValue = parseInt(elems[eachElem].attributes.y.value);
        }
    }
    
    for (let y = 0; y < businessObjectsLength; y++) {
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
    
    if (!showRelatedBtn) {
        return
    }
    showRelatedBtn.addEventListener('click', () => {
        
        let showRelatedLinesLength = showRelatedLines.length;
        for (let x = 0; x < showRelatedLines.length; x++) {
            showRelatedLines[x].parentElement.removeChild(showRelatedLines[x]);
        }
        showRelatedLines = [];
        
        let messageArrayLength = messageArray.length;
        if (currentRelated != "") {
            for (let i =0; i < messageArrayLength; i++) {
                if (messageArray[i].object.getAttribute("selected")) {
                    if (messageArray[i] == currentRelated) {
                        currentRelated = "";
                        if (hideUnrelatedCount % 2 == 1) {
                            hideUnrelatedBtn.click();
                            hideUnrelatedBtn.style.display = "none";
                        } else {
                            hideUnrelatedBtn.style.display = "none";
                        }
                        for (let i =0; i < messageArrayLength; i++) {
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
        
        for (let i =0; i < messageArrayLength; i++) {
            if (messageArray[i].object.getAttribute("selected") != "") {
                currentRelated = messageArray[i]
            }
            messageArray[i].object.style.display = "none";
            messageArray[i].appended = false;
            messageArray[i].svgComponent.style.stroke = "";
            messageArray[i].svgComponent.style.strokeWidth = "";
        }
        
        let selectedMessage = traceIframe.getElementsByClassName("MsgOutlineSelect");
        for (let i =0; i < messageArrayLength; i++) {
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
    let lineCounter = 0;
    let messageArrayLength = messageArray.length;
    for (let i = 0; i < messageArrayLength; i++) {
        if ((messageArray[i].appended == false)&& (messageInput.locationInfo.yValue < messageArray[i].locationInfo.yValue)) {
            
            if  ((messageInput.locationInfo.endLocation == messageArray[i].locationInfo.startLocation)) {
                messageArray[i].appended = true;
                messageArray[i].object.style.display = "";
                messageArray[i].svgComponent.style.stroke = "red";
                messageArray[i].svgComponent.style.strokeWidth = 8;

                getEndConnected(messageArray[i]);
            }
            if (lineCounter < 100) {
                if (messageInput.locationInfo.endLocation == messageArray[i].locationInfo.startLocation) {
                    lineCounter = lineCounter + 1;
                    let tempLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
                    tempLine.setAttribute("class", "MsgLineRequest");
                    tempLine.setAttribute("x1", String(messageInput.locationInfo.endLocation));
                    tempLine.setAttribute("y1", String(messageArray[i].locationInfo.yValue)); 
                    tempLine.setAttribute("x2", String(messageInput.locationInfo.endLocation));
                    tempLine.setAttribute("y2", String(messageInput.locationInfo.yValue + 20)); 
                    tempLine.setAttribute("type", "getEndConnected"); 
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
                }
            }
            
        }
    }
}

function getStartConnected(messageInput) {
    let lineCounter = 0;
    
    let messageArrayLength = messageArray.length;
    for (let i = messageArrayLength - 1; i > -1; i--) {
        if ((messageArray[i].appended == false) && (messageInput.locationInfo.yValue > messageArray[i].locationInfo.yValue)) {
            
            if  (messageInput.locationInfo.startLocation == messageArray[i].locationInfo.endLocation) {
                messageArray[i].appended = true;
                messageArray[i].object.style.display = "";
                messageArray[i].svgComponent.style.stroke = "red";
                messageArray[i].svgComponent.style.strokeWidth = 8;
                getStartConnected(messageArray[i])
            }
            
            if (lineCounter < 1) {
                if (messageInput.locationInfo.startLocation == messageArray[i].locationInfo.endLocation) {
                    lineCounter = lineCounter + 1;
                    let tempLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
                    tempLine.setAttribute("class", "MsgLineRequest");
                    tempLine.setAttribute("x1", String(messageInput.locationInfo.startLocation));
                    tempLine.setAttribute("y1", String(messageArray[i].locationInfo.yValue + 20)); 
                    tempLine.setAttribute("x2", String(messageInput.locationInfo.startLocation));
                    tempLine.setAttribute("y2", String(messageInput.locationInfo.yValue)); 
                    tempLine.setAttribute("type", "getStartConnected"); 
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
    if (messageIframesLoaded == traceMessagesCount) {
        
        sortedMessageArray = messageArray.sort((a, b) => {
            return a.messageNumber - b.messageNumber;
        });

        let sortedMessageArrayLength = sortedMessageArray.length;
        for (let x = 0; x < sortedMessageArrayLength; x++) {
            syncScrolling(mainIframe.contentDocument, sortedMessageArray[x].object.children[1]);
            mainIframe.contentDocument.getElementsByTagName("body")[0].appendChild(sortedMessageArray[x].object);
        }
        mainIframe.contentDocument.dispatchEvent(addExpansionEvent);
        mainIframe.contentDocument.dispatchEvent(addMouseOverCompare);
    }
}

let hideUnrelatedCount = 0
function hideUnrelatedLogic(hideUnrelatedBtn) {

    if (!hideUnrelatedBtn)
    {
        return
    }
    
    hideUnrelatedBtn.addEventListener('click', () => {
        let display = "none";
        if (hideUnrelatedCount % 2 == 1) {
            display = "";
        }

        let traceIframeCanvas = traceIframe.getElementById("zenCanvas");
        let traceG = traceIframeCanvas.getElementsByTagName("g");
        let traceRuleMarker1 = traceIframeCanvas.getElementsByClassName("ruleMarker1");
        let traceEventMarkerBack = traceIframeCanvas.getElementsByClassName("eventMarkerBack");
        
        let traceGLength = traceG.length;
        for (let i = 0; i < traceGLength; i++){
            traceG[i].style.display = display;
        }
        let traceRuleMarker1Length = traceRuleMarker1.length;
        for (let i = 0; i < traceRuleMarker1Length; i++){
            traceRuleMarker1[i].style.display = display;
        }
        let traceEventMarkerBackLength = traceEventMarkerBack.length;
        for (let i = 0; i < traceEventMarkerBackLength; i++){
            traceEventMarkerBack[i].style.display = display;
        }
        
        let messageArrayLength = messageArray.length;
        for (let i = 0; i < messageArrayLength; i ++) {
            
            if (messageArray[i].appended == true) {
                messageArray[i].svgComponent.parentElement.style.display = "";
            }
        }
        
        hideUnrelatedCount ++
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
