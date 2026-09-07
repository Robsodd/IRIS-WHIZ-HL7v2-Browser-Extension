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
    if (document.getElementById("IWFilterInput")) {
        return
    }
    console.log("IWFilterInput?",document.getElementById("IWFilterInput"))
   
    
    addHeaderClickListeners()
    grpQueue = document.querySelector('#grpQueue');

    // Create the text box
    
    const filterInput = document.createElement('input');
    filterInput.id = "IWFilterInput";
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

// Initialize a variable to track the current sort state
let lastSort = { column: null, direction: 'descending' };

function reorderQueueTable(sortBy) {
    console.log(lastSort);
    const headers = Array.from(queueTable.querySelectorAll('th'));
    const sortIndex = headers.findIndex(header => header.innerText.trim().toLowerCase() === sortBy.toLowerCase());

    if (sortIndex === -1) {
        console.error(`Header "${sortBy}" not found.`);
        return;
    }

    // Determine sort direction
    let sortDirection = 'descending';
    if (lastSort.column === sortBy && lastSort.direction === 'descending') {
        sortDirection = 'ascending';
    }
    lastSort = { column: sortBy, direction: sortDirection };

    // Extract the header row
    const headerRow = queueTable.querySelector('tr:first-child');

    // Extract all rows except the header row
    const rows = Array.from(queueTable.querySelectorAll('tr')).filter(row => row !== headerRow);

    rows.sort((a, b) => {
        const valueA = a.children[sortIndex]?.innerText.trim() || '';
        const valueB = b.children[sortIndex]?.innerText.trim() || '';

        // Customize sorting logic based on column data type (e.g., numbers, strings)
        if (!isNaN(valueA) && !isNaN(valueB)) {
            return sortDirection === 'ascending'
                ? Number(valueA) - Number(valueB) // Ascending numerical sorting
                : Number(valueB) - Number(valueA); // Descending numerical sorting
        }
        return sortDirection === 'ascending'
            ? valueA.localeCompare(valueB) // Ascending string sorting
            : valueB.localeCompare(valueA); // Descending string sorting
    });

    // Clear existing rows from tbody
    const tbody = queueTable.querySelector('tbody');
    tbody.innerHTML = '';
    tbody.appendChild(headerRow);

    // Append the sorted rows back into the tbody
    rows.forEach(row => tbody.appendChild(row));
}




function setupRefreshControls() {
    // Event listener for button click
    let triggerButton = document.getElementById('btn_4_59'); // Ensemble
    if (!triggerButton) {
        triggerButton = document.getElementById('btn_4_62'); // Iris
        if (!triggerButton) {
            console.error('Button "btn_4_59"/"btn_4_62"  not found.');
            return;
        }
    }

    triggerButton.addEventListener('click', () => {
        let targetCell = document.getElementById('zenLayoutTableCell_93'); //ensemble
        if (!targetCell) {
            targetCell = document.getElementById('zenLayoutTableCell_96'); // Iris
            if (!targetCell) { 
                console.error('Target cell "zenLayoutTableCell_93"/"zenLayoutTableCell_96" not found.');
                return;
            }
           
        }
        
        // Check if the elements already exist
        if (targetCell.querySelector('.refresh-controls')) {
            console.log('Refresh controls already exist. Skipping creation.');
            return;
        }

        // Create a container for the refresh controls
        const container = document.createElement('div');
        container.className = 'refresh-controls';
        container.style.display = 'flex';
        container.style.alignItems = 'center';
        container.style.marginTop = '10px';

        // Find the original refresh button
        const originalElement = document.querySelector('img[title="Refresh the diagram"]');
        if (!originalElement) {
            console.error('Original refresh button not found.');
            return;
        }

        // Create a copy of the refresh button
        const copiedElement = originalElement.cloneNode(true);
        copiedElement.style.marginLeft = "5px";
        copiedElement.title = "Click to refresh messages";
        copiedElement.onclick = () => originalElement.click();
        container.appendChild(copiedElement);

        // Create a dropdown for auto-refresh
        const dropdown = document.createElement('select');
        dropdown.title = "Frequency with which to auto-refresh the diagram";
        dropdown.style.marginLeft = "10px";

        // Dropdown options
        const options = [
            { value: "", text: "Refresh Interval - None" },
            { value: "1000", text: "1 Second" },
            { value: "5000", text: "5 Seconds" },
            { value: "10000", text: "10 Seconds" },
            { value: "30000", text: "30 Seconds" },
            { value: "60000", text: "60 Seconds" },
            { value: "120000", text: "2 Minutes" },
            { value: "300000", text: "5 Minutes" },
        ];

        // Populate the dropdown
        options.forEach(({ value, text }) => {
            const option = document.createElement('option');
            option.value = value;
            option.innerText = text;
            dropdown.appendChild(option);
        });

        container.appendChild(dropdown);

        // Append the container to the target cell
        targetCell.appendChild(container);

        // Auto-refresh interval logic
        let refreshInterval = null;

        dropdown.addEventListener('change', (e) => {
            const interval = parseInt(e.target.value, 10);

            // Clear the existing interval
            if (refreshInterval) {
                clearInterval(refreshInterval);
                refreshInterval = null;
            }

            // Set up a new interval if a valid time is selected
            if (interval) {
                refreshInterval = setInterval(() => originalElement.click(), interval);
            }
        });
    });
}

// Attach the setup function to the window load event
window.addEventListener('load', setupRefreshControls);
