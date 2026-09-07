/// Message Search
console.log("message_search script start");

/// Listens for messages from the background script
chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		
		// Process on-page context menu message searches
		if (request.type == "message_search") {
			//console.log("message_search Message triggered");
			update_dateTime(request.search_type);
			add_criterion(request);
			sendResponse({response: "Message Searched"});
			return true
		}
		else {
			//console.log("message_search request type unknown?");
		}
		//return true
});


document.addEventListener("messageSearch", function(e) {
	//console.log("messageSearch Event", e);
	// Process on-page context menu message searches
	add_criterion2(e);	
});

/// Perform a delay in miliseconds
function delay(time) {
				return new Promise(resolve => setTimeout(resolve, time));
			}


/// Adds a criterion to the message search page
function add_criterion(request) {	
	//console.log("add_criterion", request)
	let value = request.value
	
	if (typeof value !== "undefined" && value != "undefined") {
		value = value.replace(/\s/g,' ');
		value = value.replace(/\s\^\s/g,'^');
		value = value.replace(/\s\·/g, '');
		value = value.replace(/\s\&\s/g, '&');
	} 
	
	var event = new Event('change');
	let add_criterion_button_click = new Promise((resolve, reject) => {
				let add_criterion_button = document.getElementById("addCriterionBtn")
				add_criterion_button.click()
				resolve(add_criterion_button)
			})
			
	
	/// Find the frame as the ID increments each time you open the criterion selection
	let find_window = new Promise((resolve, reject) => {
		let frame_id = 108;
		let frame = ""
		while (!frame) {
			frame = document.getElementById("frame_" + String(frame_id))
			//console.log(frame_id);
			frame_id++;
			if (frame_id == 300) {
				//console.log("Could not find frame_id. Please refresh the page")
				frame = "Nope"
				reject(frame)
			} else if (frame) {
				//console.log("frame found! ", frame)
				
				frame.addEventListener("load", function(){
					criterion_flow(frame);
				});
				
				resolve(frame)
			}
		}
		
	})

	/// Flow for adding a criterion once the Add Criterion Frame is open
	function criterion_flow(frame) {

		if (request.search_type == "singleMessage") {

			delay(300).then(() => {			
				let criterionType = frame.contentWindow.document.getElementById("control_7")
				criterionType.value = "Header";
				criterionType.dispatchEvent(event);
				});

			delay(700).then(() => {
				//console.log("value33333", value);
				let prop = frame.contentWindow.document.getElementById("prop_0");
				prop.value = "ID";
				prop.dispatchEvent(event);
				});	

			delay(1200).then(() => {
				//console.log("value33333", value);
				let val_0 = frame.contentWindow.document.getElementById("val_0");
				val_0.value = value;
				val_0.dispatchEvent(event);
				});	
		} else {
			let schema = request.schema
			let segment = request.segment
			let field = request.field
			
			delay(300).then(() => {			
				let criterionType = frame.contentWindow.document.getElementById("control_7")
				criterionType.value = "VDocSegment";
				criterionType.dispatchEvent(event);
			});
			delay(600).then(() => {
				let classSelector = frame.contentWindow.document.getElementById("classSelector");
				classSelector.value = "EnsLib.HL7.Message";
				classSelector.dispatchEvent(event);
				});	

			delay(800).then(() => {
				let segmentType = frame.contentWindow.document.getElementById("cond_0_Val_1");
				segmentType.value = String(schema) + ":" + String(segment);
				segmentType.dispatchEvent(event);
				});	
				
			delay(1000).then(() => {
				let fieldName = frame.contentWindow.document.getElementById("cond_0_Val_2");
				fieldName.value = field;
				fieldName.dispatchEvent(event);
				});	
	
			delay(1200).then(() => {
				let operation = frame.contentWindow.document.getElementById("opSelect_0");
				operation.value = "Contains";
				operation.dispatchEvent(event);
				});	
			
			//console.log("value22222", value);
			delay(1400).then(() => {
				if (typeof value !== "undefined" && value != "undefined") {
					//console.log("value33333", value);
					let inputBox = frame.contentWindow.document.getElementById("val_0");
					inputBox.value = value;
					inputBox.dispatchEvent(event);
				}
				});	
		}
		

		
		delay(1600).then(() => {
			if (typeof value !== "undefined" && value != "undefined") {
				let OK_button = frame.contentWindow.document.getElementById("control_34");
				var click = new Event('click');
				OK_button.dispatchEvent(click);
				OK_button.click();
			}
			});		
			
		delay(2000).then(() => {
			if (typeof value !== "undefined" && value != "undefined") {
				let run_report_button = document.getElementById("command_searchButton");
				run_report_button.click();
			}
			});

	};
	
}


/// Adds a criterion to the message search page *v2 is for event handling instead of message handling
function add_criterion2(messageSearchEvent) {
	
	//console.log("add_criterion messageSearchEvent", messageSearchEvent)
	
	let criterionType = messageSearchEvent.criterionType; //
	let selector = messageSearchEvent.selector; // 
	let criterionRows = messageSearchEvent.criterionRows;
	let schema = messageSearchEvent.schema;
	let segment = messageSearchEvent.segment;
	let field = messageSearchEvent.field;
	let value = messageSearchEvent.value;
	
	//console.log("messageSearchEvent.criterionRows", messageSearchEvent.criterionRows);
	
	if (typeof value !== "undefined" && value != "undefined") {
		value = value.replace(/\s/g,' ');
		value = value.replace(/\s\^\s/g,'^');
		value = value.replace(/\s\·/g, '');
		value = value.replace(/\s\&\s/g, '&');
	} 
	
	var event = new Event('change');
	let add_criterion_button_click = new Promise((resolve, reject) => {
				let add_criterion_button = document.getElementById("addCriterionBtn")
				add_criterion_button.click();
				resolve(add_criterion_button);
			})
			
	
	/// Find the frame as the ID increments each time you open the criterion selection
	let find_window = new Promise((resolve, reject) => {
		let frame_id = 108;
		let frame = ""
		while (!frame) {
			frame = document.getElementById("frame_" + String(frame_id))
			//console.log(frame_id);
			frame_id++;
			if (frame_id == 300) {
				//console.log("Could not find frame_id. Please refresh the page")
				frame = "Nope";
				reject(frame);
			} else if (frame) {
				//console.log("frame found! ", frame)
				
				frame.addEventListener("load", function(){
					criterion_flow(frame);
				});
				
				resolve(frame);
			}
		}
		
	})

	/// Flow for adding a criterion once the Add Criterion Frame is open
	function criterion_flow(frame) {
				
		if ((criterionType == "VDocPath") || (criterionType == "VDocSegment") || (criterionType == "Header")||(criterionType == "Body")) {
			delay(300).then(() => {
				let criterionType = frame.contentWindow.document.getElementById("control_7");
				criterionType.value = messageSearchEvent.criterionType;
				criterionType.dispatchEvent(event);
				});
			
			delay(600).then(() => {
				let classSelector = frame.contentWindow.document.getElementById("classSelector");
				classSelector.value = selector;
				classSelector.dispatchEvent(event);
				});	
				
			// Loop through our rows
			let delay_time = 800;
			let joinCount = 0;
			//console.log("criterionRows", criterionRows);
			let criterionRowsLength = criterionRows.length;
			for (let i = 0; i < criterionRowsLength; i++) {
				//console.log("criterionRows[", String(i), "]", criterionRows[i]);
				// If Row = JoinSelect then add Join Select
				if (criterionRows[i].joinSelect) {
					delay(delay_time).then(() => {
						let addCondition = frame.contentWindow.document.getElementById("imgDiv");
						addCondition.childNodes[0].click();
						});	
					delay_time = delay_time + 200;
					
					delay(delay_time).then(() => {
						joinCount++
						let joinSelect = frame.contentWindow.document.getElementById("joinSelect_" + String(joinCount));
						//console.log("criterionRows[i].joinSelect", criterionRows[i].joinSelect);
						joinSelect.value = criterionRows[i].joinSelect
						joinSelect.dispatchEvent(event);
					});	
					
					delay_time = delay_time + 200;
				
					
				} else {
				
					delay(delay_time).then(() => {
						let segmentType;
						if ((messageSearchEvent.criterionType == "Header")||(messageSearchEvent.criterionType == "Body")) { 
							// skip
						} else {
							segmentType = frame.contentWindow.document.getElementById("cond_" + String(i-joinCount) + "_Val_1");
							segmentType.value = criterionRows[i].cond_Val_1;
							segmentType.dispatchEvent(event);
						}
						});	
						
					delay_time = delay_time + 200;
					
					delay(delay_time).then(() => {
						let fieldName
						if ((messageSearchEvent.criterionType == "Header")||(messageSearchEvent.criterionType == "Body")) {
							fieldName = frame.contentWindow.document.getElementById("prop_" + String(i-joinCount));
						} else {
							fieldName = frame.contentWindow.document.getElementById("cond_" + String(i-joinCount) + "_Val_2");
						}
						fieldName.value = criterionRows[i].cond_Val_2;
						fieldName.dispatchEvent(event);
						});	
						
					delay_time = delay_time + 200;
					
					delay(delay_time).then(() => {
						let operation = frame.contentWindow.document.getElementById("opSelect_" + String(i-joinCount));
						operation.value = criterionRows[i].opSelect;
						operation.dispatchEvent(event);
						});	
						
					delay_time = delay_time + 200;
					
					delay(delay_time).then(() => {
						let inputBox = frame.contentWindow.document.getElementById("val_" + String(i-joinCount));
						inputBox.value = criterionRows[i].val;
						inputBox.dispatchEvent(event);
						});	
					delay_time = delay_time + 200;
				}
			}
			// Click OK
			delay(delay_time).then(() => {
				let OK_button = frame.contentWindow.document.getElementById("control_34");
				var click = new Event('click');
				OK_button.dispatchEvent(click);
				OK_button.click();
				});		
		}
	}

	
}


/// Prefixes a Zero to a number for formating of datetime (e.g. from 1 to 01 for January)
function AddZero(num) {
	return (num >= 0 && num < 10) ? "0" + num : num + "";
}

// Listens for the Search Window opening

/// For running anything once the page has loadedload
window.addEventListener("load", function(event){
	var queryString = window.location.search;
	//console.log("Page Loaded");
	
	// Run auto search on load if needed
	if (queryString.includes("MESSAGE_SEARCH=true")){
		
		var urlParams = new URLSearchParams(queryString);
		console.log("urlParams", urlParams, "search_type", urlParams.get("search_type"));
		if (urlParams.get('search_type') == "singleMessage") {
			// update_dateTime(urlParams.get('search_type')); // Set datetime to exact message time?
			remove_criterion().then(() => {
				delay(300).then(() => {
					//=true&searchType=${searchType}&criterionType=${criterionType}&prop_0=${prop_0}&value=${messageId}`;
					this.document.getElementById("control_33").value = "";
					this.document.getElementById("control_34").value = "3";
					this.document.getElementById("control_36").value = "";
					this.document.getElementById("control_39").value = "";
					this.document.getElementById("control_37").value = urlParams.get('value');
					this.document.getElementById("control_40").value = urlParams.get('value');
					delay(100).then(() => {
						let run_report_button = document.getElementById("command_searchButton");
						run_report_button.click();
					});
				});	
			});			
		} else if (urlParams.get('search_type') == "session") {
			// update_dateTime(urlParams.get('search_type')); // Set dateTime to exact session start time/end time
		} else {
			update_dateTime(urlParams.get('search_type'));
			var request = {
				schema: urlParams.get('schema'),
				segment: urlParams.get('segment'),
				field: urlParams.get('field'),
				value: urlParams.get('value'),
				search_type: urlParams.get('search_type')
			}
			remove_criterion().then(() => {
				add_criterion(request);
			});			
		}

		//
		
	}
	
	window.removeEventListener("load", event, false);
}, false);


/// Removes any criterion left on the page from previous searches stored in the cache
function remove_criterion() {
	return new Promise((resolve, reject) => {
		console.log("Removing Criterion");
		//let buttons = document.getElementsByClassName("critLink")
		let buttons = document.getElementsByTagName("input")
		console.log("checking Criterion", buttons);
		//console.log("buttons", buttons);
		let buttonsLength = buttons.length;
		var click = new Event('click');
		for (i = 0; i < buttonsLength; i++) {
			console.log("checking Criterion", i);
			//console.log("button title:", i, buttons[i].title);
			if ((buttons[i].title == "Disable criterion") && (buttons[i].getAttribute("checked")=="checked")) {
				console.log("click criterion", buttons[i]);
				buttons[i].dispatchEvent(click);
				buttons[i].click();
			} 
		} 
		resolve("Old criterion removed");
	});
}

/// Updates the search time if blank so that we don't accidentally search over too long a period
function update_dateTime(search_type) {
	var dateTextInput = document.getElementById("control_36")
	//console.log("dateTextInput", dateTextInput);
	// 2022-11-01 00:00:00
	
	if (search_type != "") {
		var today = new Date();
		var new_date = new Date(today);
		
		if (search_type == "searchItem_0") {
			var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
		} else if (search_type == "searchItem_1") {
			new_date.setDate(new_date.getDate() - 1)
			var date = new_date.getFullYear()+'-'+(new_date.getMonth()+1)+'-'+new_date.getDate();
		} else if (search_type == "searchItem_7") {
			
			new_date.setDate(new_date.getDate() - 7)
			var date = new_date.getFullYear()+'-'+(new_date.getMonth()+1)+'-'+new_date.getDate();
		} else if (search_type == "searchItem_14") {
			
			new_date.setDate(new_date.getDate() - 14)
			var date = new_date.getFullYear()+'-'+(new_date.getMonth()+1)+'-'+new_date.getDate();
		} else if (dateTextInput.value == "") {
			var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
		} else if (dateTextInput.value != "") {
			return
		}
		var change = new Event('change');
		
		var dateTime = String(date) + " 00:00:00" 
		
		dateTextInput.value = dateTime;
		dateTextInput.dispatchEvent(change);
	}
}

