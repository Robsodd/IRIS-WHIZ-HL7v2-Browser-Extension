console.log("prettify Content Script loaded");

let AUTO_PRETTIFY = true; 
let settingsLoaded = false;

chrome.storage.local.get({ settings: {} }, function(stored) {
    if (stored.settings.autoPrettify !== undefined) {
        AUTO_PRETTIFY = stored.settings.autoPrettify;
    }
    settingsLoaded = true;
    detectAndPrettifyData();
});

function detectAndPrettifyData() {
    if (!settingsLoaded) return; 

    // 🛑 FAST-LANE WORKER BYPASS 🛑
    try {
        if (window.frameElement && window.frameElement.style.display === "none") {
            if (document.body) document.body.dataset.prettified = "true"; 
            return;
        }
    } catch(e) {}

    let containers = document.querySelectorAll('.MsgContents, #document');
    let elementsToProcess = [];

    containers.forEach(el => {
        if (el.dataset.prettified || el.dataset.processing) return;
        
        if (el.querySelector('.whiz-prettify-wrapper')) {
            el.dataset.prettified = "true";
            return;
        }

        if (!el.textContent.trim()) return;
        el.dataset.processing = "true";
        elementsToProcess.push(el);
    });

    if (elementsToProcess.length === 0) {
        let body = document.body;
        if (body && !body.dataset.prettified && !body.dataset.processing) {
            body.dataset.processing = "true";
            elementsToProcess.push(body);
        }
    }

    if (elementsToProcess.length === 0) return;

    elementsToProcess.forEach(el => {
        if (!el.isConnected) return;

        let originalHTML = el.innerHTML;
        let text = el.textContent || el.innerText;
        let cleanText = text.trim();

        // 🛑 MOVED: PER-MESSAGE HL7 CHECK 🛑
        // Now it only looks for HL7 links INSIDE this specific message container!
        let isHL7 = false;
        try {
            let links = el.getElementsByTagName("a");
            for (let aElem of links) {
                if (aElem.href && aElem.href.includes('EnsPortal.HL7')) {
                    isHL7 = true;
                    break;
                }
            }
        } catch (e) {}

        if (isHL7 || /^\s*(MSH\||HL7)/i.test(cleanText) || el.classList.contains("whiz-hl7-payload")) {
            el.dataset.prettified = "true"; // Mark this specific message as HL7 (done)
            return; // Move on to the next message in the trace
        }

        if (cleanText.startsWith("<![CDATA[")) {
            cleanText = cleanText.substring(9);
        }
        if (cleanText.endsWith("]]>")) {
            cleanText = cleanText.substring(0, cleanText.length - 3);
        }
        cleanText = cleanText.trim();

        // --- CHECK 1: IS IT XML? ---
        let firstAngle = cleanText.indexOf('<');
        let lastAngle = cleanText.lastIndexOf('>');

        if (firstAngle !== -1 && lastAngle !== -1 && firstAngle < lastAngle) {
            let xmlString = cleanText.substring(firstAngle, lastAngle + 1);
            xmlString = xmlString.replace(/\]\]\]\]><!\[CDATA\[>/g, ']]&gt;');

            try {
                let parser = new DOMParser();
                let xmlDoc = parser.parseFromString(xmlString, "application/xml");
                let parserErrors = xmlDoc.getElementsByTagName("parsererror");

                if (parserErrors.length === 0 && xmlDoc.documentElement) {
                    prettifyXML(el, xmlDoc.documentElement, originalHTML);
                    return;
                } else {
                    let errorText = parserErrors[0].textContent;
                    if (errorText.toLowerCase().includes("unexpected end") || errorText.toLowerCase().includes("premature end")) {
                        renderTruncatedWarning(el, xmlString, "XML", originalHTML);
                        return;
                    }
                }
            } catch (e) {}
        }

        // --- CHECK 2: IS IT JSON? ---
        let firstBrace = cleanText.indexOf('{');
        let lastBrace = cleanText.lastIndexOf('}');
        let firstBracket = cleanText.indexOf('[');
        let lastBracket = cleanText.lastIndexOf(']');

        if ((firstBrace !== -1 && lastBrace !== -1) || (firstBracket !== -1 && lastBracket !== -1)) {
            let startIdx = firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket) ? firstBrace : firstBracket;
            let endIdx = startIdx === firstBrace ? lastBrace : lastBracket;
            let jsonString = cleanText.substring(startIdx, endIdx + 1);
            try {
                JSON.parse(jsonString);
                prettifyJSON(el, jsonString, originalHTML);
                return;
            } catch (e) {
                if (e.message.toLowerCase().includes("unexpected end") || e.message.toLowerCase().includes("unterminated")) {
                    renderTruncatedWarning(el, jsonString, "JSON", originalHTML);
                    return;
                }
            }
        }

        el.dataset.prettified = "failed";
    });
    
    if (document.body) document.body.dataset.prettified = "true";
}
function injectToggleWrapper(el, originalHTML, prettyContainer) {
    const createHTML = (tag) => document.createElementNS("http://www.w3.org/1999/xhtml", tag);
    
    let wrapper = createHTML('div');
    wrapper.className = "whiz-prettify-wrapper";
    
    wrapper.style.setProperty("display", "flex", "important");
    wrapper.style.setProperty("flex-direction", "column", "important");
    
    // 🛑 EXACT ID TARGETING 🛑
    // Grab the message ID from the parent div (e.g., "1290")
    let msgId = el.parentElement ? el.parentElement.id : null;
    let buttonBar = null;
    
    // Target the exact button bar ID for this specific message
    if (msgId) {
        // Look up exactly "buttonBar1290"
        buttonBar = document.getElementById('buttonBar' + msgId) || document.querySelector('[id="buttonBar' + msgId + '"]');
    }
    
    // Fallback just in case we are on a page where the parent doesn't have the ID
    if (!buttonBar && el.parentElement) {
        buttonBar = el.parentElement.querySelector('.messageBtnBar');
    }
    
    let toggleBtn = createHTML(buttonBar ? 'btn' : 'button'); 
    
    toggleBtn.innerText = AUTO_PRETTIFY ? "Show Raw" : "Show Prettified";
    
    if (buttonBar) {
        // NATIVE BUTTON BAR STYLING
        toggleBtn.className = "whizButton prettifyToggleBtn";
        toggleBtn.style.setProperty("background-color", "purple", "important");
        toggleBtn.style.setProperty("color", "white", "important");
        toggleBtn.title = "Toggle Prettified View";
        toggleBtn.style.setProperty("display", "inline-block", "important");
    } else {
        // STANDALONE PAGE FALLBACK (Purple Button)
        toggleBtn.className = "whizbutton";
        toggleBtn.style.setProperty("background-color", "purple", "important");
        toggleBtn.style.setProperty("color", "white", "important");
        toggleBtn.style.setProperty("padding", "6px 12px", "important");
        toggleBtn.style.setProperty("cursor", "pointer", "important");
        toggleBtn.style.setProperty("border", "none", "important");
        toggleBtn.style.setProperty("border-radius", "4px", "important");
        toggleBtn.style.setProperty("font-weight", "bold", "important");
        toggleBtn.style.setProperty("order", "-1", "important");
        toggleBtn.style.setProperty("align-self", "flex-start", "important");
    }

    let rawDiv = createHTML('div');
    rawDiv.innerHTML = originalHTML;
    rawDiv.style.setProperty("display", AUTO_PRETTIFY ? "none" : "block", "important");
    rawDiv.style.setProperty("width", "100%", "important");
    
    prettyContainer.style.setProperty("display", AUTO_PRETTIFY ? "block" : "none", "important");
    prettyContainer.style.setProperty("width", "100%", "important");

    let isPretty = AUTO_PRETTIFY;
    toggleBtn.addEventListener('click', () => {
        isPretty = !isPretty;
        if (isPretty) {
            rawDiv.style.setProperty("display", "none", "important");
            prettyContainer.style.setProperty("display", "block", "important");
            toggleBtn.innerText = "Show Raw";
        } else {
            rawDiv.style.setProperty("display", "block", "important");
            prettyContainer.style.setProperty("display", "none", "important");
            toggleBtn.innerText = "Show Prettified";
        }
    });

    wrapper.appendChild(rawDiv);
    wrapper.appendChild(prettyContainer);

    if (buttonBar) {
        // Wrap the button in an <li> and insert it at the very start of the correct button bar
        let li = createHTML('li');
        li.appendChild(toggleBtn);
        buttonBar.insertBefore(li, buttonBar.firstChild);
    } else {
        wrapper.appendChild(toggleBtn); 
    }

    el.innerHTML = '';
    el.appendChild(wrapper);
    el.dataset.prettified = "true";
}

function renderTruncatedWarning(el, rawString, type, originalHTML) {
    const createHTML = (tag) => document.createElementNS("http://www.w3.org/1999/xhtml", tag);
    const encodeForHTML = (str) => String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    let container = createHTML('div');
    container.style.setProperty("background-color", "#fdfafa", "important");
    container.style.setProperty("border", "1px solid #d14", "important");
    container.style.setProperty("border-radius", "4px", "important");
    container.style.setProperty("padding", "15px", "important");
    container.style.setProperty("margin-top", "10px", "important");

    let warningBanner = createHTML('div');
    warningBanner.style.setProperty("background-color", "#ffebee", "important");
    warningBanner.style.setProperty("color", "#d14", "important");
    warningBanner.style.setProperty("padding", "10px", "important");
    warningBanner.style.setProperty("border-radius", "4px", "important");
    warningBanner.style.setProperty("margin-bottom", "10px", "important");
    warningBanner.style.setProperty("font-family", "sans-serif", "important");
    warningBanner.style.setProperty("font-weight", "bold", "important");
    warningBanner.innerHTML = `⚠️ TRUNCATED MESSAGE: InterSystems reached its character limit and stopped sending data. Showing partial ${type} below.`;

    let pre = createHTML('pre');
    pre.style.setProperty("overflow-x", "auto", "important");
    pre.style.setProperty("white-space", "pre-wrap", "important");
    pre.style.setProperty("word-wrap", "break-word", "important");
    pre.style.setProperty("font-family", "monospace", "important");
    pre.style.setProperty("font-size", "13px", "important");
    pre.style.setProperty("color", "black", "important");
    
    let formattedText = rawString;
    if (type === "XML") {
        formattedText = rawString.replace(/(>)(<)(\/*)/g, '$1\n$2$3');
    }
    
    pre.innerHTML = encodeForHTML(formattedText);
    container.appendChild(warningBanner);
    container.appendChild(pre);

    injectToggleWrapper(el, originalHTML, container);
}

function prettifyJSON(el, jsonString, originalHTML) {
    const createHTML = (tag) => document.createElementNS("http://www.w3.org/1999/xhtml", tag);
    const encodeForAttr = (str) => String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    const encodeForHTML = (str) => String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const makeSearchableSpan = (pureText, color) => `<span class="searchable" style="color:${color}" data-pure="${encodeForAttr(pureText)}">${encodeForHTML(pureText)}</span>`;

    let jsonObj = JSON.parse(jsonString);

    chrome.storage.local.get({ hideNonMatchingFilter: true }, function(stored) {
        let container = createHTML('div');
        container.style.setProperty("background-color", "#f5f5f5", "important");
        container.style.setProperty("border", "1px solid #ccc", "important");
        container.style.setProperty("border-radius", "4px", "important");
        container.style.setProperty("padding", "15px", "important");
        container.style.setProperty("margin-top", "10px", "important");
        
        let styleBlock = createHTML('style');
        styleBlock.textContent = `
            .whiz-ellipsis { display: none; }
            details:not([open]) > summary > .whiz-ellipsis { display: inline !important; }
        `;
        container.appendChild(styleBlock);
        
        let searchRow = createHTML('div');
        searchRow.style.setProperty("display", "flex", "important");
        searchRow.style.setProperty("gap", "15px", "important");
        searchRow.style.setProperty("margin-bottom", "10px", "important");
        searchRow.style.setProperty("align-items", "center", "important");

        let searchInput = createHTML('input');
        searchInput.type = "text";
        searchInput.placeholder = "Filter JSON...";
        searchInput.style.setProperty("flex-grow", "1", "important");
        searchInput.style.setProperty("padding", "5px", "important");
        searchInput.style.setProperty("border", "1px solid #aaa", "important");
        searchInput.style.setProperty("border-radius", "3px", "important");
        
        let toggleLabel = createHTML('label');
        toggleLabel.style.setProperty("font-family", "sans-serif", "important");
        toggleLabel.style.setProperty("font-size", "12px", "important");
        toggleLabel.style.setProperty("display", "flex", "important");
        toggleLabel.style.setProperty("align-items", "center", "important");
        toggleLabel.style.setProperty("gap", "5px", "important");
        toggleLabel.style.setProperty("cursor", "pointer", "important");
        
        let hideCheckbox = createHTML('input');
        hideCheckbox.type = "checkbox";
        hideCheckbox.checked = stored.hideNonMatchingFilter; 
        
        toggleLabel.appendChild(hideCheckbox);
        toggleLabel.appendChild(document.createTextNode("Hide non-matching"));
        
        let expandCollapseBtn = createHTML('button');
        expandCollapseBtn.innerText = "Collapse All";
        expandCollapseBtn.style.setProperty("padding", "4px 8px", "important");
        expandCollapseBtn.style.setProperty("cursor", "pointer", "important");
        expandCollapseBtn.style.setProperty("border", "1px solid #aaa", "important");
        expandCollapseBtn.style.setProperty("border-radius", "3px", "important");
        expandCollapseBtn.style.setProperty("background", "white", "important");
        expandCollapseBtn.style.setProperty("font-size", "12px", "important");
        
        expandCollapseBtn.addEventListener('click', () => {
            let detailsElements = container.querySelectorAll('details');
            let isCollapsing = expandCollapseBtn.innerText === "Collapse All";
            detailsElements.forEach(d => d.open = !isCollapsing);
            expandCollapseBtn.innerText = isCollapsing ? "Expand All" : "Collapse All";
        });

        let matchBadge = createHTML('span');
        matchBadge.style.setProperty("display", "none", "important"); 
        matchBadge.style.setProperty("background-color", "#090", "important"); 
        matchBadge.style.setProperty("color", "white", "important");
        matchBadge.style.setProperty("border-radius", "12px", "important");
        matchBadge.style.setProperty("padding", "2px 8px", "important");
        matchBadge.style.setProperty("font-size", "12px", "important");
        matchBadge.style.setProperty("font-weight", "bold", "important");

        searchRow.appendChild(searchInput);
        searchRow.appendChild(expandCollapseBtn);
        searchRow.appendChild(toggleLabel);
        searchRow.appendChild(matchBadge);
        container.appendChild(searchRow);

        let viewer = createHTML('div');
        viewer.style.setProperty("overflow-x", "auto", "important");
        viewer.style.setProperty("background", "#fff", "important");
        viewer.style.setProperty("padding", "10px", "important");
        viewer.style.setProperty("border", "1px inset #eee", "important");
        
        function buildJsonTree(key, val, isLast) {
            let wrapper = createHTML('div');
            wrapper.className = "data-node";
            wrapper.style.setProperty("margin-left", key === null ? "0px" : "20px", "important");
            wrapper.style.setProperty("font-family", "monospace", "important");
            wrapper.style.setProperty("font-size", "13px", "important");
            wrapper.style.setProperty("line-height", "1.5", "important");
            
            let pureKey = key !== null ? `"${key}"` : "";
            let keyStr = key !== null ? `${makeSearchableSpan(pureKey, '#d14')}: ` : "";
            let comma = isLast ? "" : ",";

            if (typeof val === 'object' && val !== null) {
                let isArray = Array.isArray(val);
                let details = createHTML('details');
                details.open = true; 
                
                let summary = createHTML('summary');
                summary.style.setProperty("cursor", "pointer", "important");
                summary.style.setProperty("display", "list-item", "important");
                
                let children = Object.keys(val);
                
                let hasNestedChildren = children.some(childKey => {
                    let childVal = val[childKey];
                    return typeof childVal === 'object' && childVal !== null && Object.keys(childVal).length > 0;
                });
                
                let openBrace = isArray ? "[" : "{";
                let closeBrace = isArray ? "]" : "}";
                
                let asteriskHtml = hasNestedChildren ? `<span style="color: #d14; margin-left: 2px;">*</span>` : "";
                let countBadge = `<span style="font-size: 10px; background-color: #e0e0e0; color: #444; padding: 2px 7px; border-radius: 10px; font-family: 'Segoe UI', Tahoma, sans-serif; font-weight: bold; margin: 0 5px; box-shadow: inset 0 1px 2px rgba(0,0,0,0.1);">${children.length}${asteriskHtml}</span>`;
                let ellipsisHtml = `<span class="whiz-ellipsis" style="color:#888;"> ..${countBadge}.. ${closeBrace}${comma}</span>`;
                
                summary.innerHTML = keyStr + openBrace + ellipsisHtml;
                details.appendChild(summary);
                
                children.forEach((childKey, index) => {
                    details.appendChild(buildJsonTree(childKey, val[childKey], index === children.length - 1));
                });
                
                let closeDiv = createHTML('div');
                closeDiv.innerHTML = closeBrace + comma;
                details.appendChild(closeDiv);
                
                wrapper.appendChild(details);
                wrapper.searchData = pureKey.toLowerCase(); 
            } else {
                let pureVal = typeof val === 'string' ? `"${val}"` : String(val);
                let color = typeof val === 'string' ? '#090' : (typeof val === 'number' ? 'darkorange' : (val === null ? '#808' : '#00f'));
                
                wrapper.innerHTML = keyStr + makeSearchableSpan(pureVal, color) + comma;
                wrapper.searchData = (pureKey + " " + pureVal).toLowerCase(); 
            }
            return wrapper;
        }

        let treeRoot = buildJsonTree(null, jsonObj, true);
        viewer.appendChild(treeRoot);
        container.appendChild(viewer);

        function applyFilter() {
            let term = searchInput.value.toLowerCase();
            let isHideMode = hideCheckbox.checked;
            let matchCount = 0; 
            
            container.querySelectorAll('.searchable').forEach(span => {
                let pureText = span.getAttribute('data-pure');
                if (term !== "" && pureText.toLowerCase().includes(term)) {
                    let escapedForHTML = encodeForHTML(pureText);
                    let escapedSearchHTML = encodeForHTML(term);
                    let highlightRegex = new RegExp(`(${escapedSearchHTML.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
                    
                    let matches = escapedForHTML.match(highlightRegex);
                    if (matches) matchCount += matches.length;
                    
                    span.innerHTML = escapedForHTML.replace(highlightRegex, `<mark style="background-color: #ffeb3b; color: black; border-radius: 2px;">$1</mark>`);
                } else {
                    span.innerHTML = encodeForHTML(pureText);
                }
            });

            function evaluateNode(node) {
                let isMatch = (node.searchData && node.searchData.includes(term));
                let details = node.querySelector(':scope > details');
                if (details) {
                    details.querySelectorAll(':scope > .data-node').forEach(child => {
                        if (evaluateNode(child)) isMatch = true; 
                    });
                    if (term !== "") details.open = isMatch;
                }
                
                if (term === "" || isMatch) {
                    node.style.setProperty("display", "block", "important");
                } else {
                    node.style.setProperty("display", isHideMode ? "none" : "block", "important");
                }
                return isMatch;
            }
            evaluateNode(treeRoot);

            if (term === "") {
                matchBadge.style.setProperty("display", "none", "important");
            } else {
                matchBadge.style.setProperty("display", "inline-block", "important");
                matchBadge.innerText = matchCount;
                matchBadge.style.setProperty("background-color", matchCount === 0 ? "#d14" : "#090", "important"); 
            }
        }

        hideCheckbox.addEventListener('change', (e) => {
            chrome.storage.local.set({ hideNonMatchingFilter: e.target.checked });
            applyFilter();
        });
        searchInput.addEventListener('keyup', applyFilter);

        injectToggleWrapper(el, originalHTML, container);
    });
}

function prettifyXML(el, xmlRoot, originalHTML) {
    const createHTML = (tag) => document.createElementNS("http://www.w3.org/1999/xhtml", tag);
    const encodeForAttr = (str) => String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    const encodeForHTML = (str) => String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const makeSearchableSpan = (pureText, color) => `<span class="searchable" style="color:${color}" data-pure="${encodeForAttr(pureText)}">${encodeForHTML(pureText)}</span>`;

    chrome.storage.local.get({ hideNonMatchingFilter: true }, function(stored) {
        let container = createHTML('div');
        container.style.setProperty("background-color", "#f5f5f5", "important");
        container.style.setProperty("border", "1px solid #ccc", "important");
        container.style.setProperty("border-radius", "4px", "important");
        container.style.setProperty("padding", "15px", "important");
        container.style.setProperty("margin-top", "10px", "important");
        
        let styleBlock = createHTML('style');
        styleBlock.textContent = `
            .whiz-ellipsis { display: none; }
            details:not([open]) > summary > .whiz-ellipsis { display: inline !important; }
        `;
        container.appendChild(styleBlock);
        
        let searchRow = createHTML('div');
        searchRow.style.setProperty("display", "flex", "important");
        searchRow.style.setProperty("gap", "15px", "important");
        searchRow.style.setProperty("margin-bottom", "10px", "important");
        searchRow.style.setProperty("align-items", "center", "important");

        let searchInput = createHTML('input');
        searchInput.type = "text";
        searchInput.placeholder = "Filter XML...";
        searchInput.style.setProperty("flex-grow", "1", "important");
        searchInput.style.setProperty("padding", "5px", "important");
        searchInput.style.setProperty("border", "1px solid #aaa", "important");
        searchInput.style.setProperty("border-radius", "3px", "important");
        
        let toggleLabel = createHTML('label');
        toggleLabel.style.setProperty("font-family", "sans-serif", "important");
        toggleLabel.style.setProperty("font-size", "12px", "important");
        toggleLabel.style.setProperty("display", "flex", "important");
        toggleLabel.style.setProperty("align-items", "center", "important");
        toggleLabel.style.setProperty("gap", "5px", "important");
        toggleLabel.style.setProperty("cursor", "pointer", "important");
        
        let hideCheckbox = createHTML('input');
        hideCheckbox.type = "checkbox";
        hideCheckbox.checked = stored.hideNonMatchingFilter; 
        
        toggleLabel.appendChild(hideCheckbox);
        toggleLabel.appendChild(document.createTextNode("Hide non-matching"));
        
        let expandCollapseBtn = createHTML('button');
        expandCollapseBtn.innerText = "Collapse All";
        expandCollapseBtn.style.setProperty("padding", "4px 8px", "important");
        expandCollapseBtn.style.setProperty("cursor", "pointer", "important");
        expandCollapseBtn.style.setProperty("border", "1px solid #aaa", "important");
        expandCollapseBtn.style.setProperty("border-radius", "3px", "important");
        expandCollapseBtn.style.setProperty("background", "white", "important");
        expandCollapseBtn.style.setProperty("font-size", "12px", "important");
        
        expandCollapseBtn.addEventListener('click', () => {
            let detailsElements = container.querySelectorAll('details');
            let isCollapsing = expandCollapseBtn.innerText === "Collapse All";
            detailsElements.forEach(d => d.open = !isCollapsing);
            expandCollapseBtn.innerText = isCollapsing ? "Expand All" : "Collapse All";
        });
        
        let matchBadge = createHTML('span');
        matchBadge.style.setProperty("display", "none", "important"); 
        matchBadge.style.setProperty("background-color", "#090", "important"); 
        matchBadge.style.setProperty("color", "white", "important");
        matchBadge.style.setProperty("border-radius", "12px", "important");
        matchBadge.style.setProperty("padding", "2px 8px", "important");
        matchBadge.style.setProperty("font-size", "12px", "important");
        matchBadge.style.setProperty("font-weight", "bold", "important");

        searchRow.appendChild(searchInput);
        searchRow.appendChild(expandCollapseBtn);
        searchRow.appendChild(toggleLabel);
        searchRow.appendChild(matchBadge);
        container.appendChild(searchRow);

        let viewer = createHTML('div');
        viewer.style.setProperty("overflow-x", "auto", "important");
        viewer.style.setProperty("background", "#fff", "important");
        viewer.style.setProperty("padding", "10px", "important");
        viewer.style.setProperty("border", "1px inset #eee", "important");
        
        function createJsonSubTree(jsonObj) {
            function buildSubJsonTree(key, val, isLast) {
                let wrapper = createHTML('div');
                wrapper.className = "data-node";
                wrapper.style.setProperty("margin-left", key === null ? "0px" : "20px", "important");
                wrapper.style.setProperty("font-family", "monospace", "important");
                wrapper.style.setProperty("font-size", "13px", "important");
                wrapper.style.setProperty("line-height", "1.5", "important");
                
                let pureKey = key !== null ? `"${key}"` : "";
                let keyStr = key !== null ? `${makeSearchableSpan(pureKey, '#d14')}: ` : "";
                let comma = isLast ? "" : ",";

                if (typeof val === 'object' && val !== null) {
                    let isArray = Array.isArray(val);
                    let details = createHTML('details');
                    details.open = true; 
                    
                    let summary = createHTML('summary');
                    summary.style.setProperty("cursor", "pointer", "important");
                    summary.style.setProperty("display", "list-item", "important");
                    
                    let children = Object.keys(val);
                    
                    let hasNestedChildren = children.some(childKey => {
                        let childVal = val[childKey];
                        return typeof childVal === 'object' && childVal !== null && Object.keys(childVal).length > 0;
                    });
                    
                    let openBrace = isArray ? "[" : "{";
                    let closeBrace = isArray ? "]" : "}";
                    
                    let asteriskHtml = hasNestedChildren ? `<span style="color: #d14; margin-left: 2px;">*</span>` : "";
                    let countBadge = `<span style="font-size: 10px; background-color: #e0e0e0; color: #444; padding: 2px 7px; border-radius: 10px; font-family: 'Segoe UI', Tahoma, sans-serif; font-weight: bold; margin: 0 5px; box-shadow: inset 0 1px 2px rgba(0,0,0,0.1);">${children.length}${asteriskHtml}</span>`;
                    let ellipsisHtml = `<span class="whiz-ellipsis" style="color:#888;"> ..${countBadge}.. ${closeBrace}${comma}</span>`;
                    
                    summary.innerHTML = keyStr + openBrace + ellipsisHtml;
                    details.appendChild(summary);
                    
                    children.forEach((childKey, index) => {
                        details.appendChild(buildSubJsonTree(childKey, val[childKey], index === children.length - 1));
                    });
                    
                    let closeDiv = createHTML('div');
                    closeDiv.innerHTML = closeBrace + comma;
                    details.appendChild(closeDiv);
                    
                    wrapper.appendChild(details);
                    wrapper.searchData = pureKey.toLowerCase(); 
                } else {
                    let pureVal = typeof val === 'string' ? `"${val}"` : String(val);
                    let color = typeof val === 'string' ? '#090' : (typeof val === 'number' ? 'darkorange' : (val === null ? '#808' : '#00f'));
                    
                    wrapper.innerHTML = keyStr + makeSearchableSpan(pureVal, color) + comma;
                    wrapper.searchData = (pureKey + " " + pureVal).toLowerCase(); 
                }
                return wrapper;
            }
            return buildSubJsonTree(null, jsonObj, true);
        }

        function buildXmlTree(xmlNode, isRoot) {
            let wrapper = createHTML('div');
            wrapper.className = "data-node";
            wrapper.style.setProperty("margin-left", isRoot ? "0px" : "20px", "important");
            wrapper.style.setProperty("font-family", "monospace", "important");
            wrapper.style.setProperty("font-size", "13px", "important");
            wrapper.style.setProperty("line-height", "1.5", "important");
            
            let elementChildren = Array.from(xmlNode.childNodes).filter(n => n.nodeType === 1);
            let hasElementChildren = elementChildren.length > 0;
            
            let isCDATA = Array.from(xmlNode.childNodes).some(n => n.nodeType === 4);
            
            let textContent = Array.from(xmlNode.childNodes)
                .filter(n => n.nodeType === 3 || n.nodeType === 4)
                .map(n => n.nodeValue)
                .join("").trim();

            let embeddedNode = null;
            if (textContent) {
                let cleanVal = textContent.replace(/\]\]&gt;/g, ']]>');
                
                if ((cleanVal.startsWith('{') && cleanVal.endsWith('}')) || 
                    (cleanVal.startsWith('[') && cleanVal.endsWith(']'))) {
                    try {
                        let parsedJson = JSON.parse(cleanVal);
                        embeddedNode = createJsonSubTree(parsedJson);
                    } catch(e) { }
                }

                if (!embeddedNode) {
                    let fA = cleanVal.indexOf('<');
                    let lA = cleanVal.lastIndexOf('>');
                    if (fA !== -1 && lA !== -1 && fA < lA) {
                        let xStr = cleanVal.substring(fA, lA + 1);
                        try {
                            let parser = new DOMParser();
                            let subDoc = parser.parseFromString(xStr, "application/xml");
                            if (subDoc.getElementsByTagName("parsererror").length === 0 && subDoc.documentElement) {
                                embeddedNode = buildXmlTree(subDoc.documentElement, false);
                            }
                        } catch(e) {}
                    }
                }
            }

            let tagNameStr = makeSearchableSpan(xmlNode.nodeName, '#0066cc');
            let closeTagHtml = `&lt;/${tagNameStr}&gt;`;
            
            let openCdataHtml = isCDATA ? `&lt;<span class="searchable" style="color:#0066cc" data-pure="CDATA">CDATA</span>&gt;` : "";
            let closeCdataHtml = isCDATA ? `&lt;/<span class="searchable" style="color:#0066cc" data-pure="CDATA">CDATA</span>&gt;` : "";
            
            let attrsHTML = "";
            let attrsSearchData = "";
            if (xmlNode.attributes) {
                for (let i = 0; i < xmlNode.attributes.length; i++) {
                    let attr = xmlNode.attributes[i];
                    attrsHTML += ` ${makeSearchableSpan(attr.name, '#d14')}="${makeSearchableSpan(attr.value, '#090')}"`;
                    attrsSearchData += ` ${attr.name} ${attr.value}`;
                }
            }

            if (hasElementChildren || embeddedNode) {
                let details = createHTML('details');
                details.open = true;
                
                let summary = createHTML('summary');
                summary.style.setProperty("cursor", "pointer", "important");
                summary.style.setProperty("display", "list-item", "important");
                
                let rawTextToRender = textContent ? textContent.replace(/\]\]&gt;/g, ']]>') : "";
                let textStr = (!embeddedNode && rawTextToRender) ? makeSearchableSpan(rawTextToRender, 'black') : "";
                
                let hasNestedChildren = elementChildren.some(child => {
                    return Array.from(child.childNodes).some(n => n.nodeType === 1);
                });
                if (embeddedNode) hasNestedChildren = true;
                
                let childCount = elementChildren.length + (embeddedNode ? 1 : 0);
                
                let asteriskHtml = hasNestedChildren ? `<span style="color: #d14; margin-left: 2px;">*</span>` : "";
                let countBadge = `<span style="font-size: 10px; background-color: #e0e0e0; color: #444; padding: 2px 7px; border-radius: 10px; font-family: 'Segoe UI', Tahoma, sans-serif; font-weight: bold; margin: 0 5px; box-shadow: inset 0 1px 2px rgba(0,0,0,0.1);">${childCount}${asteriskHtml}</span>`;
                let ellipsisHtml = `<span class="whiz-ellipsis" style="color:#888;"> ..${countBadge}.. ${closeCdataHtml}${closeTagHtml}</span>`;
                
                summary.innerHTML = `&lt;${tagNameStr}${attrsHTML}&gt;` + openCdataHtml + textStr + ellipsisHtml;
                details.appendChild(summary);
                
                elementChildren.forEach(child => {
                    details.appendChild(buildXmlTree(child, false));
                });

                if (embeddedNode) {
                    let embedWrapper = createHTML('div');
                    embedWrapper.style.setProperty("margin-left", "20px", "important");
                    embedWrapper.appendChild(embeddedNode);
                    details.appendChild(embedWrapper);
                }
                
                let closeDiv = createHTML('div');
                closeDiv.innerHTML = closeCdataHtml + closeTagHtml;
                details.appendChild(closeDiv);
                
                wrapper.appendChild(details);
                wrapper.searchData = (xmlNode.nodeName + attrsSearchData + textContent).toLowerCase();
            } else {
                if (textContent) {
                    let rawTextToRender = textContent.replace(/\]\]&gt;/g, ']]>');
                    wrapper.innerHTML = `&lt;${tagNameStr}${attrsHTML}&gt;` + openCdataHtml + makeSearchableSpan(rawTextToRender, 'black') + closeCdataHtml + closeTagHtml;
                } else {
                    wrapper.innerHTML = `&lt;${tagNameStr}${attrsHTML}/&gt;`;
                }
                wrapper.searchData = (xmlNode.nodeName + attrsSearchData + textContent).toLowerCase();
            }
            
            return wrapper;
        }

        let treeRoot = buildXmlTree(xmlRoot, true);
        viewer.appendChild(treeRoot);
        container.appendChild(viewer);

        function applyFilter() {
            let term = searchInput.value.toLowerCase();
            let isHideMode = hideCheckbox.checked;
            let matchCount = 0; 
            
            container.querySelectorAll('.searchable').forEach(span => {
                let pureText = span.getAttribute('data-pure');
                if (term !== "" && pureText.toLowerCase().includes(term)) {
                    let escapedForHTML = encodeForHTML(pureText);
                    let escapedSearchHTML = encodeForHTML(term);
                    let highlightRegex = new RegExp(`(${escapedSearchHTML.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
                    
                    let matches = escapedForHTML.match(highlightRegex);
                    if (matches) matchCount += matches.length;
                    
                    span.innerHTML = escapedForHTML.replace(highlightRegex, `<mark style="background-color: #ffeb3b; color: black; border-radius: 2px;">$1</mark>`);
                } else {
                    span.innerHTML = encodeForHTML(pureText);
                }
            });

            function evaluateNode(node) {
                let isMatch = (node.searchData && node.searchData.includes(term));
                let details = node.querySelector(':scope > details');
                if (details) {
                    details.querySelectorAll(':scope > .data-node').forEach(child => {
                        if (evaluateNode(child)) isMatch = true; 
                    });
                    if (term !== "") details.open = isMatch;
                }
                
                if (term === "" || isMatch) {
                    node.style.setProperty("display", "block", "important");
                } else {
                    node.style.setProperty("display", isHideMode ? "none" : "block", "important");
                }
                return isMatch;
            }
            evaluateNode(treeRoot);

            if (term === "") {
                matchBadge.style.setProperty("display", "none", "important");
            } else {
                matchBadge.style.setProperty("display", "inline-block", "important");
                matchBadge.innerText = matchCount;
                matchBadge.style.setProperty("background-color", matchCount === 0 ? "#d14" : "#090", "important"); 
            }
        }

        hideCheckbox.addEventListener('change', (e) => {
            chrome.storage.local.set({ hideNonMatchingFilter: e.target.checked });
            applyFilter();
        });
        searchInput.addEventListener('keyup', applyFilter);

        injectToggleWrapper(el, originalHTML, container);
    });
}

window.addEventListener("load", function() {
    detectAndPrettifyData();
});

const observer = new MutationObserver((mutations) => {
    for (let mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
            detectAndPrettifyData();
        }
    }
});

if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
}
