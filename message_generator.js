// Test Message Generator

console.log("LOADED MESSAGE GENERATOR SCRIPT");

let whizTestingDiv;

let GPTPrompt;

let schemaDropdown;
let docTypeDropdown;
let textAreaGPTPrompt;

window.addEventListener("load", function() { 
	chrome.storage.local.get({
		settings: {},
		}
		,function(stored) {
			if (stored.settings.ChatGPTKey == undefined) {
				return
			} else if (stored.settings.ChatGPTKey == "") {
				return
			} else {
				APIKey = "Bearer " + stored.settings.ChatGPTKey;
			}
			let table = document.getElementById("group_6");
			//console.log("table", table);
			var row = table.insertRow(0);
			var cell = row.insertCell(0)
			whizTestingDiv = document.createElement("div");
			cell.appendChild(whizTestingDiv);
			whizTestingDiv.className = "generateDiv";
			schemaDropdown = document.createElement("select");
			schemaDropdown.id = "schemaDropdown";
			schemaDropdown.className = "gptForm";
			schemaDropdownLabel = document.createElement("Label");
			schemaDropdownLabel.setAttribute("for", "schemaDropdown");
			schemaDropdownLabel.innerText = "Schema";
			schemaDropdownLabel.className = "gptFormLabel";				
			
			docTypeDropdown = document.createElement("select")
			docTypeDropdown.id = "docTypeDropdown";
			docTypeDropdown.className = "gptForm";
			docTypeDropdownLabel = document.createElement("Label");
			docTypeDropdownLabel.setAttribute("for", "docTypeDropdown");
			docTypeDropdownLabel.innerText = "Doc Type";
			docTypeDropdownLabel.className = "gptFormLabel";

			var docTypeOption = document.createElement("option");
			docTypeOption.text = "Choose Schema First"
			docTypeDropdown.add(docTypeOption);
			
			docTypeDropdown.style.maxWidth = "200px";
			let title = document.createElement("h3");
			title.innerText = "Chat GPT Generate HL7 Message";
			textAreaGPTPrompt = document.createElement("textarea");
			textAreaGPTPrompt.id = "textAreaGPTPrompt";
			textAreaGPTPrompt.className = "gptFormTextArea";
			textAreaGPTPromptLabel = document.createElement("Label");
			textAreaGPTPromptLabel.setAttribute("for", "textAreaGPTPrompt");
			textAreaGPTPromptLabel.innerText = "Prompt";
			textAreaGPTPromptLabel.className = "gptFormLabel";
			
			
			let generateButton = document.createElement("button");
			generateButton.innerText = "Generate"
			generateButton.addEventListener('click', (e) => { 
				chatGPTRequest();
			});
			
			whizTestingDiv.appendChild(title);
			whizTestingDiv.appendChild(schemaDropdownLabel);
			whizTestingDiv.appendChild(schemaDropdown);
			
			whizTestingDiv.appendChild(docTypeDropdownLabel);
			whizTestingDiv.appendChild(docTypeDropdown);
			
			whizTestingDiv.appendChild(textAreaGPTPromptLabel);
			whizTestingDiv.appendChild(textAreaGPTPrompt);
			
			whizTestingDiv.appendChild(generateButton);
			let iframe = document.createElement("iframe");	
			let iframeURL = stubUrl[0] + "EnsPortal.HL7.SchemaMain.zen";
			// Iframe.src = http://healthshare-mirror-test:57772/csp/healthshare/mycare_misc_tst/EnsPortal.HL7.SchemaMain.zen
			iframe.src = iframeURL;
			iframe.style.width = "100%";
			document.body.appendChild(iframe);
			iframe.style.height = iframe.scrollHeight + "px";
			iframe.scrolling = "auto";
			iframe.className = "traceViewerIframe";
			iframe.style.display = "none";
			
			
			iframe.addEventListener("load", function() {
				//let iframeSchemaTable = iframe.contentDocument.getElementById("group_18");
				
				// click tab group
				iframe.contentDocument.getElementById("btn_2_30").click()
				schemaDropdown.addEventListener('change', (e) => {
						
						removeOptions(docTypeDropdown);
						let iframeDocTypes = iframe.contentDocument.getElementById("htmlDocTypes").querySelectorAll("a");
						//console.log("iframeDocTypes", iframeDocTypes);
						var docTypeOption = document.createElement("option");
						docTypeOption.text = "Select"
						docTypeDropdown.add(docTypeOption);
						for (let i = 0; i < iframeDocTypes.length; i++) {
							//console.log( iframeDocTypes[i].textContent + " -  " + iframeDocTypes[i].title);
							var docTypeOption = document.createElement("option");
							docTypeOption.text = iframeDocTypes[i].textContent + " -  " + iframeDocTypes[i].title
							/*docTypeOption.addEventListener("change", function() {
								iframeSchemaRows[i].click();
								
							})*/
						docTypeDropdown.add(docTypeOption);
						}
					});
					
				docTypeDropdown.addEventListener('change', (e) => {
					let dateTime = getDate();
					textAreaGPTPrompt.textContent = "create a HL7 V2 '" + schemaDropdown.value + ":" + docTypeDropdown.value +  "' message for " + dateTime.raw + "(date). If a patient is usually included in the message use Anne Taters born 25/07/1991 as the patient otherwise do not include the PID segment. Include only the message in your response."
					textAreaGPTPrompt.value = "create a HL7 V2 '" + schemaDropdown.value + ":" + docTypeDropdown.value +  "' message for " + dateTime.raw + "(date). If a patient is usually included in the message use Anne Taters born 25/07/1991 as the patient otherwise do not include the PID segment. Include only the message in your response.";
				});
					
				// get content from body_30
				// Content
				
				let iframeSchemaTable = iframe.contentDocument.getElementById("tpBody_24");
				let iframeSchemaRows = iframeSchemaTable.querySelectorAll("tr");
				//console.log("iframeSchemaRows",iframeSchemaRows);
				var schemaOption = document.createElement("option");
				schemaOption.text = "Select"
				schemaDropdown.add(schemaOption);
				for (let i = 0; i < iframeSchemaRows.length; i++) {
					//console.log( iframeSchemaRows[i].textContent.split("\n"));
					var schemaOption = document.createElement("option");
					schemaOption.text = iframeSchemaRows[i].textContent.split("\n")[2];
					schemaDropdown.add(schemaOption);
				}
				

				
			});
		}
	);
	
});



function removeOptions(selectElement) {
   var i, L = selectElement.options.length - 1;
   for(i = L; i >= 0; i--) {
	   if (selectElement[i].value == "loading") {
		   continue
	   }
      selectElement.remove(i);
   }
}


let request_finished = false

function chatGPTRequest() {
	request_finished = false
	const xhr = new XMLHttpRequest();
	xhr.open("POST", "https://api.openai.com/v1/chat/completions");
	xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8")

	const req = new XMLHttpRequest();
	xhr.setRequestHeader("Authorization", APIKey);
	xhr.setRequestHeader("username", "");
	xhr.setRequestHeader("password", APIKey);
	GPTPrompt = textAreaGPTPrompt.value;
	let body = JSON.stringify({
		 "model": "gpt-3.5-turbo",
		 "messages": [{"role": "user", "content": GPTPrompt}],
		 "temperature": 0.7
	})
	let textArea = document.getElementById("id_DrawRequestForm");
	//console.log("textAreaOriginal", textArea);
	textArea = textArea.querySelectorAll("textarea");
	textArea = textArea[0]
	//console.log("textAreaLast", textArea);
	xhr.onload = () => {
		//console.log(xhr);
	  if (xhr.status == 200) {
		//console.log(JSON.parse(xhr.responseText));
		let response = JSON.parse(xhr.responseText);
		
		textArea.textContent = response.choices[0].message.content;
	  } else {
		console.log(`Error: ${xhr.status}`);
	  }
	  request_finished = true
	};
	textAreaLoading(xhr, textArea, "Please be patient. Loading"); 

	xhr.send(body);

}

function textAreaLoading(xhr, textArea, loadingstring = "") {
	delay(1000).then(() => {
		if (!request_finished) {
			//console.log(xhr.status);
			let count = (loadingstring.match(/\./g) || []).length
			if (count > 3) {
				loadingstring = "Please be patient. Loading"
			} else {
				loadingstring = loadingstring + "."
			}
			textArea.textContent = loadingstring
			textAreaLoading(loadingstring, textArea, loadingstring);
		}
	});
	
}