const priceDisplay = document.getElementById('price-display');
const investBtn = document.getElementById('invest-btn');
const investmentAmountInput = document.getElementById('investment-amount');
const connectionStatus = document.getElementById('connection-status');
const investmentSummaryDialog = document.getElementById('investment-summary-dialog');
const investmentSummary = document.getElementById('investment-summary');
const transactionBtn = document.getElementById('transaction-btn');
const transactionHistoryDialog = document.getElementById('transaction-history-dialog');
const transactionHistory = document.getElementById('transaction-history');
const allCloseBtns = document.querySelectorAll('.close-btn');

let currentGoldPice = null;

// Server-Sent Events is one-way from server -> client
const eventSource = new EventSource('/gold-price-stream');

eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);

    currentGoldPice = data.price;

    connectionStatus.textContent = 'Live Price 🟢';

    priceDisplay.textContent = `${currentGoldPice}`;
}

eventSource.onerror = () => {
    currentGoldPice = null;
    console.log('Connection failed...');
    connectionStatus.textContent = 'Disconnected 🔴'
    priceDisplay.textContent = '----.--';
}

// Click Handler (sends data)
investBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    const amountPaid = Number(investmentAmountInput.value);

    // Add check to ensure numbers are valid
    if (currentGoldPice === null || isNaN(amountPaid) || amountPaid <= 0) {
        alert("Please wait for a valid gold price and enter a valid investment amount");
        return;
    }

    console.log(`Sending investment of ${amountPaid} at gold price ${currentGoldPice}`);

    // Send POST request
    try {
        
        const response = await fetch('/invest', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amountPaid: amountPaid,
                goldPrice: currentGoldPice
            })
        });

        if (response.ok) {
            console.log('Investment successfully submitted!');
            investmentAmountInput.value = '';

            // Prepare investmentSummary
            const investObj = (await response.json()).body;

            // Enable investment summary pop-up
            investmentSummaryDialog.showModal();
            investmentSummary.textContent = `You just bought ${investObj.goldSold} ounces (ozt) for $${investObj.amountPaid}. The sale has been executed and you will receive documentation shortly.`;

        } else {
            console.log(`POST request failed`, response.status);
        }

    } catch (err) {
        console.error(`Network error: ${err}`);
    }
})

// Show transaction history
transactionBtn.addEventListener('click', async () => {
    // Send GET request for transaction history
    try {
        const res = await fetch('/transactions');

        if (!res.ok) {
            throw new Error(`Failed to fetch transactions. Status: ${res.status}`);
        }

        const investObjArr = await res.json();

        const tableBody = document.querySelector('#transaction-history tbody');

        // Clear any old rows
        tableBody.innerHTML = '';

        if (investObjArr.length === 0) {
            const row = tableBody.insertRow();
            const cell = row.insertCell();
            cell.textContent = 'No transactions found.';
            cell.colSpan = 4;
        } else {
            // Loop through transactions in reverse (show newest first)
            investObjArr.reverse().forEach(investObj => {
                const row = tableBody.insertRow();
                const cellDate = row.insertCell();
                cellDate.textContent = new Date(investObj.timestamp).toLocaleString();

                const cellAmount = row.insertCell();
                cellAmount.textContent = `$${investObj.amountPaid.toFixed(2)}`;

                const cellGold = row.insertCell();
                cellGold.textContent = investObj.goldSold.toFixed(4);

                const cellPrice = row.insertCell();
                cellPrice.textContent = `$${investObj.pricePerOz.toFixed(2)}`;
            })
        };
        
        transactionHistoryDialog.showModal();
        transactionHistoryDialog.scrollTop = 0;

    } catch (err) {
        console.error(err);
        alert('Could not load transaction history.');
    }
})

// Event listener to close dialog modal
allCloseBtns.forEach(closeBtn => {
    closeBtn.addEventListener('click', () => {
        const dialog = closeBtn.closest('dialog');
        if (dialog) {
            dialog.close();
        }
    })
})
