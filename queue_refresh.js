window.addEventListener("load", () => {

    const titleElement = document.querySelector("#title");
    const hasEnsemble = titleElement && Array.from(titleElement.querySelectorAll(".portalTitleLink"))
        .some(link => link.innerText.trim() === "Ensemble");

    // If the 'Ensemble' condition is met, do not proceed
    if (hasEnsemble) {
        console.log("Ensemble detected in portalTitleLink; select element will not be added.");
        return;
    }

    // Create the select element
    const selectElement = document.createElement("select");
    selectElement.name = "Auto-Refresh Queues";
    selectElement.id = "chkRefreshQueues";
    selectElement.setAttribute("label", "Queues Table");
    selectElement.title = "Frequency with which to auto-refresh the queues table";

    // Options for the select element
    const options = [
        { value: "None", text: "Refresh Interval - None" },
        { value: "1000", text: "1 Second" },
        { value: "5000", text: "5 Seconds" },
        { value: "10000", text: "10 Seconds" },
        { value: "30000", text: "30 Seconds" },
        { value: "60000", text: "60 Seconds" },
        { value: "120000", text: "2 Minutes" },
        { value: "300000", text: "5 Minutes" }
    ];

    // Append options to the select element
    options.forEach(optionData => {
        const option = document.createElement("option");
        option.value = optionData.value;
        option.text = optionData.text;
        selectElement.appendChild(option);
    });

    // Add behavior to trigger the click on the refresh image
    let refreshInterval = null;
    selectElement.addEventListener("change", function () {
        // Clear any existing interval
        if (refreshInterval) {
            clearInterval(refreshInterval);
            refreshInterval = null;
        }

        const selectedValue = this.value;
        if (selectedValue === "None") return;

        // Find the image element
        const refreshImage = document.querySelector('img[title="Refresh All Tables"]');
        if (!refreshImage) {
            console.error("Refresh All Tables image not found!");
            return;
        }

        // Set up a new interval based on the selected value
        refreshInterval = setInterval(() => {
            refreshImage.click();
        }, parseInt(selectedValue, 10));
    });

    // Locate the toolRibbon element
    const toolRibbon = document.getElementById("toolRibbon");

    if (toolRibbon) {
        // Find the table inside the toolRibbon div
        const table = toolRibbon.querySelector("table");
        if (table) {
            // Locate the 4th <td> element (index 3)
            const fourthTd = table.querySelectorAll("td")[3];
            if (fourthTd) {
                // Append the select element to the 4th <td>
                fourthTd.appendChild(selectElement);
            } else {
                console.error("4th <td> element not found in the table.");
            }
        } else {
            console.error("Table not found inside the toolRibbon element.");
        }
    } else {
        console.error("toolRibbon element not found.");
    }
});
