// portfolio-tracker.js

// Array to store holding data (initially empty)
let holdings = [];

// Function to display holdings
function displayHoldings() {
    const holdingsContainer = document.getElementById('holdings-container');
    if (!holdingsContainer) {
        console.error('Holdings container not found!');
        return;
    }

    // Clear previous content and add table header
    holdingsContainer.innerHTML = `
        <thead>
            <tr>
                <th>代码</th>
                <th>数量</th>
                <th>买入价格</th>
                <th>当前价格</th>
                <th>当前价值</th>
                <th>收益/亏损</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;

    const tbody = holdingsContainer.querySelector('tbody');

    holdings.forEach(holding => {
        // Calculate value and gain/loss for this holding
        const currentValue = holding.shares * holding.currentPrice;
        const gainLoss = currentValue - (holding.shares * holding.purchasePrice);
        const gainLossClass = gainLoss >= 0 ? 'gain' : 'loss'; // Class for styling gain/loss

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${holding.symbol.toUpperCase()}</td>
            <td>${holding.shares}</td>
            <td>¥${holding.purchasePrice.toFixed(2)}</td>
            <td>¥${holding.currentPrice.toFixed(2)}</td>
            <td>¥${currentValue.toFixed(2)}</td>
            <td><span class="${gainLossClass}">¥${gainLoss.toFixed(2)}</span></td>
        `;
        tbody.appendChild(row);
    });
}

// Function to display portfolio summary
function displaySummary() {
    const summaryContainer = document.getElementById('summary-container');
    if (!summaryContainer) {
        console.error('Summary container not found!');
        return;
    }

    // Calculate total purchase cost, current value, and gain/loss
    const totalPurchaseCost = holdings.reduce((total, holding) => {
        return total + (holding.shares * holding.purchasePrice);
    }, 0);

    const totalCurrentValue = holdings.reduce((total, holding) => {
        return total + (holding.shares * holding.currentPrice);
    }, 0);

    const totalGainLoss = totalCurrentValue - totalPurchaseCost;
    const totalGainLossClass = totalGainLoss >= 0 ? 'gain' : 'loss'; // Class for styling gain/loss

    summaryContainer.innerHTML = `
        <p><strong>总买入成本:</strong> ¥${totalPurchaseCost.toFixed(2)}</p>
        <p><strong>总当前价值:</strong> ¥${totalCurrentValue.toFixed(2)}</p>
        <p><strong>总收益/亏损:</strong> <span class="${totalGainLossClass}">¥${totalGainLoss.toFixed(2)}</span></p>
    `;
}

// Function to add a new holding from input fields
function addHolding() {
    const symbolInput = document.getElementById('symbol');
    const sharesInput = document.getElementById('shares');
    const purchasePriceInput = document.getElementById('purchase-price');
    const currentPriceInput = document.getElementById('current-price');

    const symbol = symbolInput.value.trim();
    const shares = parseFloat(sharesInput.value);
    const purchasePrice = parseFloat(purchasePriceInput.value);
    const currentPrice = parseFloat(currentPriceInput.value);

    // Basic validation
    if (!symbol || isNaN(shares) || shares <= 0 || isNaN(purchasePrice) || purchasePrice < 0 || isNaN(currentPrice) || currentPrice < 0) {
        alert('请输入有效的持仓信息 (数量、买入价格和当前价格必须为正数)');
        return;
    }

    // Create new holding object
    const newHolding = {
        symbol: symbol,
        shares: shares,
        purchasePrice: purchasePrice,
        currentPrice: currentPrice
    };

    // Add to holdings array
    holdings.push(newHolding);

    // Update display
    displayHoldings();
    displaySummary();

    // Clear input fields
    symbolInput.value = '';
    sharesInput.value = '';
    purchasePriceInput.value = '';
    currentPriceInput.value = '';
    symbolInput.focus(); // Set focus back to symbol input
}

// Event listener for the add button
document.addEventListener('DOMContentLoaded', () => {
    const addButton = document.getElementById('add-holding-btn');
    if (addButton) {
        addButton.addEventListener('click', addHolding);
    }

    // Initial display (will be empty)
    displayHoldings();
    displaySummary();
}); 