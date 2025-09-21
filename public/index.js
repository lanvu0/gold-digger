document.getElementById('invest-btn').addEventListener('click', async (e) => {
    e.preventDefault();

    const value = document.getElementById('investment-amount').value;

    // Send POST request
    try {
        const response = await fetch('/invest', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                body: JSON.stringify({ value: value })
            }
        });

        if (!response.ok) {
            console.log(`POST request failed`, response.status);
        }

    } catch (err) {
        console.error(`Network error: ${err}`);
    }
})

const eventSource = new EventSource('/gold-price-stream');

const priceDisplay = document.getElementById('price-display');

eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    const goldPrice = data.price;

    priceDisplay.textContent = `${goldPrice}`;
}

eventSource.onerror = () => {
    console.log('Connection failed...');
}