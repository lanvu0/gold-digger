const priceDisplay = document.getElementById('price-display');
const investBtn = document.getElementById('invest-btn');
const investmentAmountInput = document.getElementById('investment-amount');
const connectionStatus = document.getElementById('connection-status');
const dialog = document.querySelector('dialog');
const investmentSummary = document.getElementById('investment-summary');
const closeBtn = document.getElementById('close-btn');

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
            dialog.showModal();
            investmentSummary.textContent = `You just bought ${investObj.goldSold} ounces (ozt) for $${investObj.amountPaid}. The sale has been executed and you will receive documentation shortly.`;

        } else {
            console.log(`POST request failed`, response.status);
        }

    } catch (err) {
        console.error(`Network error: ${err}`);
    }
})

closeBtn.addEventListener('click', () => {
    dialog.close();
})