let cart = JSON.parse(localStorage.getItem("cart")) || [];

function formatRupiah(angka) {
    return angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function addCart(nama, harga) {
    cart.push({ nama, harga });
    localStorage.setItem("cart", JSON.stringify(cart));
    sessionStorage.setItem("itemAdded", "true");

    // Show notification if on product page
    const notification = document.getElementById("notification");
    if (notification) {
        notification.style.display = "block";
        setTimeout(() => {
            notification.style.display = "none";
        }, 3000);
    } else {
        alert("Produk masuk keranjang");
    }

    updateCartBadge();
}

function loadCart() {
    let list = document.getElementById("cart");
    let total = 0;
    list.innerHTML = "";

    cart.forEach(item => {
        total += item.harga;
        let li = document.createElement("li");
        li.textContent = `${item.nama} - Rp ${formatRupiah(item.harga)}`;
        list.appendChild(li);
    });

    document.getElementById("total").textContent = "Total: Rp " + formatRupiah(total);
    localStorage.setItem("total", total);

    // Show notification if item was added
    if (sessionStorage.getItem("itemAdded") === "true") {
        document.getElementById("notification").style.display = "block";
        sessionStorage.removeItem("itemAdded");
        // Hide after 3 seconds
        setTimeout(() => {
            document.getElementById("notification").style.display = "none";
        }, 3000);
    }
}

function tampilTotalBayar() {
    let total = localStorage.getItem("total");
    if (total === null) {
        total = 0;
    } else {
        total = parseInt(total);
    }
    document.getElementById("totalBayar").textContent = "Rp " + formatRupiah(total);
    document.getElementById("nominalTransfer").value = total;

    let status = sessionStorage.getItem("paid") === "true" ? "Sudah Dibayar" : "Belum Dibayar";
    document.getElementById("statusPembayaran").textContent = "Status: " + status;
}

function prosesBayar(method) {
    let total = localStorage.getItem("total");
    if (total === null) {
        total = 0;
    } else {
        total = parseInt(total);
    }
    let pesan = `Pembayaran berhasil via ${method}\nTotal: Rp ${formatRupiah(total)}`;
    if (method === "bank") {
        pesan += `\nRekening Pengirim: ${document.getElementById("rekeningPengirim").value}`;
    }
    let wa = "https://wa.me/6282331224203?text=" + encodeURIComponent(pesan);

    // Generate struk sebagai gambar
    let strukData = generateStrukImage(method, total);
    document.getElementById("strukImage").src = strukData;

    // Tampilkan struk
    document.getElementById("strukContainer").style.display = "block";

    sessionStorage.setItem("paid", "true");
    document.getElementById("statusPembayaran").textContent = "Status: Sudah Dibayar";

    // Kirim WA dan download bukti teks
    let bukti = `BUKTI PEMBAYARAN\nTotal: Rp ${formatRupiah(total)}\nMetode: ${method}\nStatus: BERHASIL`;
    if (method === "bank") {
        bukti += `\nRekening Pengirim: ${document.getElementById("rekeningPengirim").value}`;
    }
    let blob = new Blob([bukti], { type: "text/plain" });
    let link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "bukti_pembayaran.txt";
    link.click();

    window.open(wa, "_blank");
    localStorage.clear();
    updateCartBadge();
}

function showPaymentDetails() {
    const selected = document.querySelector('input[name="paymentMethod"]:checked').value;
    document.getElementById("qrisDetails").style.display = selected === "qris" ? "block" : "none";
    document.getElementById("cashDetails").style.display = selected === "cash" ? "block" : "none";
    document.getElementById("bankDetails").style.display = selected === "bank" ? "block" : "none";

    if (selected === "bank") {
        document.getElementById("nominalTransfer").value = localStorage.getItem("total");
        // Reset selection
        document.querySelectorAll('.bank-card').forEach(card => card.classList.remove('selected'));
        document.getElementById("selectedBank").style.display = "none";
    }
}

function downloadQris() {
    const link = document.createElement('a');
    link.href = document.getElementById('qrisImage').src;
    link.download = 'qris-code.png';
    link.click();
}

function downloadStruk() {
    const link = document.createElement('a');
    link.href = document.getElementById('strukImage').src;
    link.download = 'struk-pembayaran.png';
    link.click();
}

function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    if (badge) {
        if (cart.length > 0) {
            badge.style.display = 'inline';
        } else {
            badge.style.display = 'none';
        }
    }
}

// Call on load
updateCartBadge();

function konfirmasiBayar(method) {
    if (method === "bank") {
        const rekening = document.getElementById("rekeningPengirim").value;
        const nominal = document.getElementById("nominalTransfer").value;
        if (!rekening || !nominal) {
            alert("Isi nomor rekening dan nominal!");
            return;
        }
    }

    prosesBayar(method);
}

function generateStrukImage(method, total) {
    let canvas = document.createElement("canvas");
    canvas.width = 300;
    canvas.height = 400;
    let ctx = canvas.getContext("2d");

    // Background
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, 300, 400);
    ctx.strokeRect(0, 0, 300, 400);

    // Header
    ctx.fillStyle = "#000";
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.fillText("STRUK PEMBAYARAN", 150, 30);

    ctx.font = "16px Arial";
    ctx.fillText("Toko Sembako Sahara", 150, 60);

    // Detail
    ctx.textAlign = "left";
    ctx.font = "14px Arial";
    ctx.fillText(`Metode: ${method}`, 20, 100);
    ctx.fillText(`Total: Rp ${formatRupiah(total)}`, 20, 130);
    if (method === "bank") {
        ctx.fillText(`Rekening: ${document.getElementById("rekeningPengirim").value}`, 20, 160);
    }
    ctx.fillText("Status: BERHASIL", 20, 190);
    ctx.fillText(`Tanggal: ${new Date().toLocaleString()}`, 20, 220);

    // Footer
    ctx.textAlign = "center";
    ctx.fillText("Terima Kasih", 150, 350);

    return canvas.toDataURL("image/png");
}
