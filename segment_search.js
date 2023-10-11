// Segment Search
console.log("Segment Search Content Script");


document.addEventListener("searchSegments", function(e) {
	searchSegments(e);
});


if (currentUrl.includes("&btns=disable")) {
	// Skip creating the buttons!
} else {
	addButtonBar(document);
	buttonBarStyle(document);
	searchSegmentsButton(document);
}


const keys = ["ArrowUp", "ArrowRight", "ArrowDown", "ArrowLeft", "Control", "Shift"]
let highlighted = false;
function searchSegments(e) {
	let key = e.keyUpEvent.key;
	let eValue = e.keyUpEvent.target.value;
	if (keys.includes(key)) {
		//console.log(e.key, "skipped")
		return
	}
	
	let textSearch = eValue.toLowerCase();
	textSearch = textSearch.replace(/\s/gm, " ");
	let textSearchLength = textSearch.length;
	let segmentRows = document.getElementsByClassName("EDIDocumentTableRow");
	if ((key == "Enter") && (eValue == '')) {
		e.searchSegmentsBtn.style.display = "inherit";
		e.searchInput.style.display = "none";
		e.searchlabel.style.display = "none";
	} else {
		if (textSearch[0] == "\\") {
			let textSearchArray = textSearch.match(/^\\(...)\\(.*)/)
			console.log("textSearchArray", textSearchArray, textSearch);
			if ((textSearchArray != null) && (textSearchArray[2] != "")) {
				for (var i = 0, row; row = segmentRows[i]; i++) {
					console.log((row.childNodes[4].innerText.toUpperCase() == (textSearchArray[1].toUpperCase())));
					if (row.childNodes[4].innerText.toUpperCase() == (textSearchArray[1].toUpperCase())) {
						let compareText = row.innerText.toLowerCase()
						compareText = compareText.replace(/\s/gm, " ");
						if (compareText.includes(textSearchArray[2])) {
							row.style.display = "";
						} else {
							row.style.display = "none";
						}
					} else {
						//row.style.display = "none";
					}
					
				}
			} else 	{
				
			}
		}  else {
			for (var i = 0, row; row = segmentRows[i]; i++) {
				let compareText = row.innerText.toLowerCase()
				compareText = compareText.replace(/\s/gm, " ");
				compareText = compareText.replace(/\t/gm, ""); //..·.
				compareText = compareText.replace(/\s?\s?\|\s?\s?·?/gm, "|");
				compareText = compareText.replace(/\s?\s?\^\s?\s?·?/gm, "^");
				console.log("compareText", compareText);
				if (compareText.includes(textSearch)) {
					row.style.display = "";
				} else {
					row.style.display = "none";
				}
			}
		}
	}
	
}
/*
function contractSegments() {
	/*
	let expandedSchema = document.getElementsByClassName("additionaltable")
	//console.log("expandedSchema", expandedSchema);
	let expandedSchemaLength = expandedSchema.length;
	for (let i = expandedSchemaLength; i > 0; i--) {
		//console.log("expandedSchema", i, expandedSchema[i-1]);
		if (expandedSchema[i-1].childNodes[0].childNodes[0].childNodes[0].className == "searchSegment") {
			//if (expandedSchema[i-1].childNodes[0].childNodes[0].childNodes[1].childNodes[1].value == "") {
				//expandedSchema[i-1].remove();
			//}
		} else {
			expandedSchema[i-1].remove();
		}
		
	}
	
}


/// Expands the contents of the given Table Row (requires the main table row, not the sub-table used to display the segment fields)
function expandRow(row) {
	if (!row.innerText.includes())
	//console.log("newExpansionTable", newExpansionTable);
	//console.log("segmentTable1 ", segmentTable, segmentTable.childNodes[0].childNodes[0].childNodes.length);
	if (segmentTable.childNodes.length < 2) {

	}
}


// Add event listeners

let expansionElementClassnames = ["EDIDocumentTableExpandor", "EDIDocumentTableSegnum", "EDIDocumentTableSegid",]

// Add an event listener
document.addEventListener("addExpansion", function(e) {
	//console.log("addExpasion Listener Triggered");
	addExpansionListeners();
});
*/





