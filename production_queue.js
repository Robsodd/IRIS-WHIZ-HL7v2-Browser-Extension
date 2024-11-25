console.log("Production Queue Script Loaded");


let queueTable;
let grpQueue;

let queueBtn = document.getElementById("btn_2_62");
if (queueBtn == null) {
    queueBtn = document.getElementById("btn_2_59");
}

const style = document.createElement('style');
style.innerHTML = `
    #grpQueue tr:first-child th {
        cursor: pointer;
    }
    #grpQueue tr:first-child th:hover {
        background-color: #f0f0f0;
        color: #333;
    }
`;
document.head.appendChild(style);


queueBtn.addEventListener('click', ()=> {
    queueTable = document.getElementById("queueListTbl");
    reorderQueueTable('Count');
    addHeaderClickListeners()
    grpQueue = document.querySelector('#grpQueue');

    // Create the text box
    const filterInput = document.createElement('input');
    filterInput.type = 'text';
    filterInput.placeholder = 'Filter queue table...';
    filterInput.style.marginBottom = '10px'; // Add spacing below the input

    // Insert the text box at the top of grpQueue
    grpQueue.insertBefore(filterInput, grpQueue.firstChild);

    // Add event listener for filtering
    filterInput.addEventListener('input', () => {
        const filterValue = filterInput.value.toLowerCase().trim();
        const rows = grpQueue.querySelectorAll('tr:not(:first-child)'); // Skip the header row
        
        rows.forEach(row => {
            const rowText = row.innerText.toLowerCase();
            row.style.display = rowText.includes(filterValue) ? '' : 'none';
        });
    });

    
})

function addHeaderClickListeners() {
    const headers = Array.from(queueTable.querySelectorAll('th'));

    headers.forEach(header => {
        header.addEventListener('click', () => {
            const headerValue = header.innerText.trim();
            reorderQueueTable(headerValue);
        });
    });
}

function reorderQueueTable(sortBy) {
    const headers = Array.from(queueTable.querySelectorAll('th'));
    const sortIndex = headers.findIndex(header => header.innerText.trim().toLowerCase() === sortBy.toLowerCase());

    if (sortIndex === -1) {
        console.error(`Header "${sortBy}" not found.`);
        return;
    }

    // Extract the header row
    const headerRow = queueTable.querySelector('tr:first-child');

    // Extract all rows except the header row
    const rows = Array.from(queueTable.querySelectorAll('tr')).filter(row => row !== headerRow);

    rows.sort((a, b) => {   
        const valueA = a.children[sortIndex]?.innerText.trim() || '';
        const valueB = b.children[sortIndex]?.innerText.trim() || '';

        // Customize sorting logic based on column data type (e.g., numbers, strings)
        if (!isNaN(valueA) && !isNaN(valueB)) {
            return Number(valueB) - Number(valueA); // Numerical sorting
        }
        return valueA.localeCompare(valueB); // String sorting
    });

    // Clear existing rows from tbody
    const tbody = queueTable.querySelector('tbody');
    tbody.innerHTML = '';
    tbody.appendChild(headerRow);
    rows.forEach(row => tbody.appendChild(row));
    

    // Append the sorted rows back into the tbody
    

}






function searchQueue(e) {
	console.log(e);
	let key = e.key;
	let eValue = e.target.value;
	if (keys.includes(key)) {
		//console.log(e.key, "skipped")
		return
	}
	
	let textSearch = eValue.toLowerCase();
	textSearch = textSearch.replace(/\s/gm, " ");

	for (var i = titles.length - 1, page; page = titles[i]; i--) {
		console.log("Check queue: ", page);
		//console.log((row.childNodes[4].innerText.toUpperCase() == (textSearchArray[1].toUpperCase())));
		let compareText = page.title.replace(/\s/gm, " ");
		compareText = compareText.toLowerCase();
		if (compareText.includes(textSearch)) {
			document.getElementById(page.id).style.display = "";
		} else {
			document.getElementById(page.id).style.display = "none";
		}

	}		
	
}