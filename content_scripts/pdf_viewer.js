/// PDF Viewer


chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		
		// Process on-page context menu message searches
		if (request.type == "pdf_viewer") {
			console.log("pdf_viewer triggered");
			try {
				console.log(request.selectionText);
				decode(request.selectionText);
			} catch {
				alert("Unable to convert base64 text to PDF. Make sure you're highlighting the whole text.");
				sendResponse({response: "Unable to base64 text to PDF. Make sure you're highlighting the whole text."});
			}

			sendResponse({response: "PDF Converted"});
			return true
		}
		else {
			//console.log(String(request.type) + " request type unknown");
		}
		//return true
});

function decode(base64) {
	/// Opens a new page showing the decoded PDF
	if (base64.includes("|")) {
		// Sometimes you can't see the end of the base64 encoded string as it goes off the maximum
		// width of the page. This cuts our string off at the next field seperator.
		base64 = base64.split("|")[0];
	}
	//var base64 = ("OBX-5 STRING HERE")
	const blob = base64ToBlob( base64, 'application/pdf' );
	const url = URL.createObjectURL( blob );
	const pdfWindow = window.open("");
	pdfWindow.document.write("<iframe width='100%' height='100%' src='" + url + "'></iframe>");
	function base64ToBlob( base64, type = "application/octet-stream" ) {
	  const binStr = atob( base64 );
	  const len = binStr.length;
	  const arr = new Uint8Array(len);
	  for (let i = 0; i < len; i++) {
		arr[ i ] = binStr.charCodeAt( i );
	  }
	  return new Blob( [ arr ], { type: type } );
	}
}


