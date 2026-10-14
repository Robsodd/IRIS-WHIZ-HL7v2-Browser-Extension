/// COPY RAW text
console.log("[IRIS Whiz - Debug] Copy RAW script loaded");

if (document instanceof XMLDocument || (document.contentType && document.contentType.includes("xml"))) {
    console.log("[IRIS Whiz - Debug] XML document detected, skipping Copy RAW text.");
} else {
    
    // 🛑 METHOD 1: NATIVE CLICK LISTENER (Using "Starts With" selector)
    document.addEventListener("click", function(e) {
        // This targets ANY element whose ID starts with "copyRawText" (e.g. copyRawText1290)
        let copyBtn = e.target.closest('[id^="copyRawText"]');
        
        if (copyBtn) {
            // Strip the letters to isolate just the message number
            let messageNumber = copyBtn.id.replace('copyRawText', '');
            console.log("[IRIS Whiz - Debug] 🟢 CLICK DETECTED! Fetching message:", messageNumber);
            copyRaw(messageNumber);
        }
    });

    // 🛑 METHOD 2: CUSTOM EVENT FALLBACK
    // Just in case your button builder relies on the old custom event dispatcher
    document.addEventListener("copyRawText", function(e) {
        console.log("[IRIS Whiz - Debug] 🔊 CUSTOM EVENT Triggered for message:", e.messageNumber);
        copyRaw(e.messageNumber);
    });

    if (currentUrl.includes("VisualTrace.zen")) {
        console.log("[IRIS Whiz - Debug] VisualTrace.zen detected.");
    } else {
        // Add copy Raw Button on standalone pages
        if (currentUrl.includes("&btns=disable")) {
            console.log("[IRIS Whiz - Debug] btns=disable detected. Skipping button creation.");
        } else {
            addButtonBar(document);
            buttonBarStyle(document);
            copyRawTextButtonBar(document);
        }
    }
}

// 🚀 BULLETPROOF FETCH + EXECCOMMAND
async function copyRaw(messageNumber) {
    console.log("[IRIS Whiz - Debug] 1. copyRaw() started for message:", messageNumber);
    
    let messageUrl = stubUrl[0] + "EnsPortal.MessageContents.zen?HeaderClass=Ens.MessageHeader&HeaderId=";
    let requestUrl = messageUrl + String(messageNumber) + "&RAW=1";
    console.log("[IRIS Whiz - Debug] 2. Request URL:", requestUrl);
    
    try {
        let response = await fetch(requestUrl);
        let htmlText = await response.text();
        console.log("[IRIS Whiz - Debug] 3. Fetch successful. Extracting payload...");
        
        // Extract the payload perfectly
        let rawContent = htmlText.split('<pre style="padding: 5px;">')[1].split('</pre>')[0];
        
        // Decode HTML entities (InterSystems turns < into &lt; in RAW=1 view)
        const decoder = document.createElement("textarea");
        decoder.innerHTML = rawContent;
        let decodedText = decoder.value;
        
        // Create a temporary textarea in the CURRENT document
        const copyArea = document.createElement("textarea");
        copyArea.value = decodedText;
        
        // Hide it off-screen
        copyArea.style.position = "fixed";
        copyArea.style.left = "-9999px";
        document.body.appendChild(copyArea);
        
        // Select and copy natively
        copyArea.select();
        let success = document.execCommand('copy');
        
        // Clean up immediately
        document.body.removeChild(copyArea);
        
        if (success) {
            console.log("[IRIS Whiz - Debug] 4. 📋 SUCCESS! Payload copied to clipboard.");
            
            // Give the user visual feedback!
            let btn = document.getElementById('copyRawText' + messageNumber);
            if (btn) {
                let originalText = btn.innerText;
                btn.innerText = "Copied!";
                btn.style.backgroundColor = "#090"; // Flash green
                setTimeout(() => {
                    btn.innerText = originalText;
                    btn.style.backgroundColor = "";
                }, 1500);
            }
            
        } else {
            console.error("[IRIS Whiz - Debug] 4. ❌ execCommand failed to copy.");
        }
        
    } catch (err) {
        console.error('[IRIS Whiz - Debug] ❌ Fetch error:', err);
    }
}
