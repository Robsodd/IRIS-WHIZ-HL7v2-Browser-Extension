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
        },  function(stored) {
            if (stored.settings.TimeFormat) {
                // Change time format to COMPLETE
                let timeFormat = document.getElementById("control_27");
                timeFormat.click();
                timeFormat.value = "999";
                delay(1000).then(() => {
                    timeFormat.value = "999";
                })
            }
            
            if (stored.settings.SortOrder) {
                // Change SortOrder to OLDEST FIRST
                let sortOrder = document.getElementById("control_26");
                sortOrder.click();
                sortOrder.value = "1";
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
    fullTraceHeader.id = "selectedMessagesTabHeader";
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
    tabGroupBody.appendChild(selecteMessagesTab);
    MessageViewerTabBar(document);
    
    fullTraceHeader.addEventListener('click', () => {
        fullTraceDisplayOn();
    })

    // This event listener triggers on row selection.
    resultsDiv.addEventListener("change", function(e) {
        
        // Check that it was the checkbox being clicked
        if (e.target.type == "checkbox") {
            
            let messageId = e.target.parentElement.parentElement.children[3].innerText;
            let messageSearchNumber = e.target.parentElement.parentElement.children[2].innerText;
            let messageCreated = e.target.parentElement.parentElement.children[4].innerText;
            let messageStatus = e.target.parentElement.parentElement.children[7].innerText;
            
            if ((e.target.value == "on") || (e.target.value == "unchecked"))  {
                e.target.value = "checked";
                let messageStartOperation = e.target.parentElement.parentElement.children[8].innerText;
                let messageEndOperation = e.target.parentElement.parentElement.children[9].innerText;
                
                let traceMessageUrl = stubUrl[0] + "EnsPortal.MessageContents.zen?HeaderClass=Ens.MessageHeader&HeaderId=";

                // ==========================================
                // 1. CREATE GHOST CANVAS (If it doesn't exist)
                // ==========================================
                if (!mainIframe) {
                    mainIframe = document.createElement("iframe");
                    mainIframe.src = traceMessageUrl + "99999999999&btns=disable";
                    mainIframe.style.width = "99%";
                    mainIframe.style.height = "95%";
                    mainIframe.style.border = "none";
                    selecteMessagesTab.appendChild(mainIframe);

                    mainIframe.addEventListener("load", function() {
                        if (mainIframe.dataset.isHostProcessed) return;
                        mainIframe.dataset.isHostProcessed = "true";

                        let doc = mainIframe.contentDocument;
                        
                        // Wipe the native error text
                        if (doc.body) {
                            doc.body.innerHTML = '';
                            doc.body.style.backgroundColor = "#ffffff";
                            doc.body.style.fontFamily = "Arial, sans-serif";
                        }

                        // Mount the master button bars
                        addButtonBar(doc);
                        buttonBarStyle(doc);
                        minimiseAllButton(doc);
                        wrapRowsButton(doc);
                        shareButton(doc);
                        textCompareBtn(doc);
                        compareLegendButtons(doc);
                        searchExpandedSchemaButton(doc);
                        searchSegmentsButton(doc);
                        scrollBarStyle(doc);
                    });
                }

                // ==========================================
                // 2. CREATE HIDDEN WORKER FOR THE MESSAGE
                // ==========================================
                let iframe = document.createElement("iframe");
                iframe.src = traceMessageUrl + String(messageId) + "&schema_expansion=disable&text_compare=disable&copy_raw_text=disable";
                iframe.style.width = "100%";
                iframe.style.display = "none";
                iframe.className = "traceViewerIframe";
                document.body.appendChild(iframe);
                
                iframe.addEventListener("load", function() {
                    
                    // 🛑 FIX: Prevent the Chrome "about:blank" double-load bug! 🛑
                    try {
                        if (iframe.contentWindow.location.href === "about:blank") return;
                    } catch(e) {}
                    
                    // Extra safety flag to ensure it only processes once
                    if (iframe.dataset.isLoaded) return;
                    iframe.dataset.isLoaded = "true";

                    let attempts = 0;
                    // Ensure the Master Canvas has fully loaded before we try to inject into it!
                    let checkReady = setInterval(() => {
                        attempts++;
                        if (mainIframe && mainIframe.dataset.isHostProcessed) {
                            clearInterval(checkReady);
                            
                            let targetDoc = mainIframe.contentDocument;

                            // CREATE CONTAINERS (Using parent document)
                            let messageDiv = document.createElement('div');
                            let messageDivContents = document.createElement('div');
                            messageDivContents.classList.add("MsgContents");

                            let message = {
                                messageNumber: parseInt(messageId), 
                                object: messageDiv, 
                                messageStartOperation: messageStartOperation, 
                                messageEndOperation: messageEndOperation
                            };

                            messageStyling(messageDiv);
                            if (messageStatus != "OK") {
                                messageDiv.style.borderColor = "red";
                            }

                            // EXTRACTION
                            try {
                                extractPayloadToTarget(iframe.contentDocument, targetDoc, messageDivContents);
                            } catch (err) {
                                messageDivContents.innerHTML = '<br><p style="color:red">Unable to retrieve HTML content.</p>';
                            }

                            // HEADINGS & UI
                            let messageHeading = document.createElement("a"); 
                            messageHeading.className = "IWMsgTitle";
                            messageHeading.style.padding = "10px";
                            messageHeading.style.color = "red";
                            messageHeading.innerHTML = '#' + String(messageSearchNumber) + ' ' + messageCreated + '<br><span style="color:black; padding:10px;">' + messageStartOperation + ' ----> ' + messageEndOperation + '</span>';

                            messageDivContents.insertBefore(messageHeading, messageDivContents.firstChild);                
                            messageDiv.id = messageId;

                            let messageBtnBar = messageButtonBar(targetDoc, messageDiv.id);
                            messageDiv.appendChild(messageBtnBar);
                            messageDiv.appendChild(messageDivContents);

                            // CLOSE BUTTON
                            let closeButton = document.createElement('button'); 
                            let li = document.createElement('li');
                            li.appendChild(closeButton);
                            closeButton.innerText = "x";
                            closeButton.className = "WhizButton closeBtnDelete";
                            closeButton.style.position = "relative";
                            
                            closeButton.addEventListener('click', () => {
                                messageDiv.style.display = "none";
                                if (messageDiv.parentElement) messageDiv.parentElement.removeChild(messageDiv);                
                                
                                messageArray = messageArray.filter(obj => obj.messageNumber !== parseInt(messageId));
                                sortedMessageArray = sortedMessageArray.filter(obj => obj.messageNumber !== parseInt(messageId));
                                
                                // Uncheck the checkbox in the main UI
                                e.target.checked = false;
                                e.target.value = "unchecked";
                            });
                            
                            
                            messageArray.push(message);
                            
                            messageAppend(message);
                            
                            copyRawTextButton(targetDoc, messageId, messageBtnBar);
                            minimiseButton(targetDoc, messageDiv, messageBtnBar);
							messageBtnBar.appendChild(li);
                                                                        
                            // CLEANUP WORKER
                            if (iframe.parentNode) {
                                iframe.parentNode.removeChild(iframe);
                            }
                            
                        } else if (attempts > 100) {
                            clearInterval(checkReady); // Timeout safety net
                        }
                    }, 50);
                });
            
            } else {
                e.target.value = "unchecked";
                let messageDiv = messageArray.filter(obj => {
                  return obj.messageNumber === parseInt(messageId);
                });
                if (messageDiv.length > 0 && messageDiv[0].object.parentElement) {
                    messageDiv[0].object.parentElement.removeChild(messageDiv[0].object);
                }
                
                messageArray = messageArray.filter(obj => {
                  return obj.messageNumber !== parseInt(messageId);
                });
                
                sortedMessageArray = sortedMessageArray.filter(obj => {
                  return obj.messageNumber !== parseInt(messageId);
                });
            }
        }   
    });
});

function messageAppend(message) {
    /// Appends message to the mainIframe
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
        sortedMessageArray.push(message);
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
    headerMessageTrace.className = "tabGroupButtonOff"; 
}
