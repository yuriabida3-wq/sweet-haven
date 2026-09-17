let currentProduct = { name: '', price: 0 };
let quantity = 1;

function openOrderModal(productName, price) {
    currentProduct = { name: productName, price: price };
    quantity = 1;
    document.getElementById('modalProductName').value = productName;
    document.getElementById('modalQuantity').value = 1;
    document.getElementById('modalPhone').value = '';
    document.getElementById('modalDestination').value = '';
    document.getElementById('destinationGroup').style.display = 'none';
    document.querySelector('input[name="orderType"][value="Pickup"]').checked = true;
    updateTotal();
    document.getElementById('orderModal').style.display = 'flex';
}

function closeOrderModal() { document.getElementById('orderModal').style.display = 'none'; }

function changeQty(amount) {
    quantity += amount;
    if (quantity < 1) quantity = 1;
    document.getElementById('modalQuantity').value = quantity;
    updateTotal();
}

function toggleDestination() {
    const type = document.querySelector('input[name="orderType"]:checked').value;
    document.getElementById('destinationGroup').style.display = (type === 'Delivery') ? 'block' : 'none';
}

function updateTotal() {
    let baseTotal = currentProduct.price * quantity;
    if (currentProduct.price === 0) {
        document.getElementById('modalTotalPrice').innerText = 'To be confirmed';
    } else {
        document.getElementById('modalTotalPrice').innerText = 'KSh ' + baseTotal;
    }
}

function submitOrder() {
    const qty = document.getElementById('modalQuantity').value;
    const phone = document.getElementById('modalPhone').value.trim();
    const orderType = document.querySelector('input[name="orderType"]:checked').value;
    const destination = document.getElementById('modalDestination').value.trim();
    const total = currentProduct.price * qty;
    const receiptId = 'SH-' + Math.floor(1000 + Math.random() * 9000);
    
    if (phone === '') {
        alert('Please enter your phone number so we can contact you.');
        return;
    }
    if (orderType === 'Delivery' && destination === '') {
        alert('Please enter your delivery destination.');
        return;
    }

    let message = `*🧾 SWEET HAVEN RECEIPT*\n----------------------------\n*Order ID:* ${receiptId}\n*Customer Phone:* ${phone}\n*Item:* ${currentProduct.name}\n*Quantity:* ${qty}\n*Order Type:* ${orderType}\n`;
    if (orderType === 'Delivery') message += `*Destination:* ${destination}\n*Delivery Fee:* To be confirmed\n`;
    if (currentProduct.price > 0) message += `*Total Amount:* KSh ${total}\n`;
    else message += `*Amount:* To be discussed\n`;
    message += `----------------------------\nPlease confirm my order. Thank you! 🍭`;

    let orders = JSON.parse(localStorage.getItem('sweetHavenOrders')) || [];
    orders.push({ 
        id: receiptId, 
        phone: phone,
        item: currentProduct.name, 
        qty: qty, 
        type: orderType, 
        destination: destination, 
        total: total, 
        status: 'Pending',
        date: new Date().toLocaleString() 
    });
    localStorage.setItem('sweetHavenOrders', JSON.stringify(orders));

    window.open(`https://wa.me/254740503058?text=${encodeURIComponent(message)}`, '_blank');
    closeOrderModal();
}

function showOwnerLogin() {
    document.getElementById('publicSite').style.display = 'none';
    document.getElementById('ownerSite').style.display = 'block';
    document.getElementById('ownerLoginBox').style.display = 'block';
    document.getElementById('ownerDashboardBox').style.display = 'none';
    window.scrollTo(0, 0);
}

function loginOwner() {
    const pass = document.getElementById('ownerPassword').value;
    if (pass === 'admin123') {
        document.getElementById('ownerLoginBox').style.display = 'none';
        document.getElementById('ownerDashboardBox').style.display = 'block';
        renderOwnerOrders();
    } else {
        alert('Incorrect Password. Hint: admin123');
    }
}

function logoutOwner() {
    document.getElementById('ownerSite').style.display = 'none';
    document.getElementById('publicSite').style.display = 'block';
    document.getElementById('ownerPassword').value = '';
    window.scrollTo(0, 0);
}

function renderOwnerOrders() {
    const tbody = document.getElementById('ordersTableBody');
    let orders = JSON.parse(localStorage.getItem('sweetHavenOrders')) || [];
    
    let totalRevenue = 0;
    let pendingCount = 0;

    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" style="text-align: center; color: #888; padding: 20px;">No orders yet.</td></tr>';
    } else {
        tbody.innerHTML = orders.map((order, index) => {
            if(order.status === 'Pending') pendingCount++;
            totalRevenue += parseInt(order.total) || 0;

            return `
            <tr>
                <td>${order.date}</td>
                <td><strong>${order.id}</strong></td>
                <td><strong>${order.phone}</strong></td>
                <td>${order.item}</td>
                <td>${order.qty}</td>
                <td>${order.type}</td>
                <td>${order.type === 'Delivery' ? order.destination : 'N/A'}</td>
                <td>KSh ${order.total}</td>
                <td><span class="status-badge ${order.status === 'Pending' ? 'status-pending' : 'status-completed'}">${order.status}</span></td>
                <td>
                    ${order.status === 'Pending' ? `<button class="action-btn" onclick="markCompleted(${index})">Mark Delivered</button>` : '✅ Done'}
                </td>
            </tr>
            `;
        }).join('');
    }

    document.getElementById('statRevenue').innerText = 'KSh ' + totalRevenue;
    document.getElementById('statOrders').innerText = orders.length;
    document.getElementById('statPending').innerText = pendingCount;
}

function markCompleted(index) {
    let orders = JSON.parse(localStorage.getItem('sweetHavenOrders')) || [];
    if(orders[index]) {
        orders[index].status = 'Completed';
        localStorage.setItem('sweetHavenOrders', JSON.stringify(orders));
        renderOwnerOrders();
    }
}

function exportCSV() {
    let orders = JSON.parse(localStorage.getItem('sweetHavenOrders')) || [];
    if (orders.length === 0) { alert('No orders to export.'); return; }

    let csvContent = "data:text/csv;charset=utf-8,Date,Order ID,Customer Phone,Item,Quantity,Type,Destination,Total (KSh),Status\n";
    
    orders.forEach(function(order) {
        let row = [
            `"${order.date}"`,
            `"${order.id}"`,
            `"${order.phone}"`,
            `"${order.item}"`,
            `"${order.qty}"`,
            `"${order.type}"`,
            `"${order.destination || 'N/A'}"`,
            `"${order.total}"`,
            `"${order.status}"`
        ].join(",");
        csvContent += row + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Sweet_Haven_Sales_Report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

document.addEventListener('DOMContentLoaded', () => {
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
});
