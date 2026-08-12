let selectedGateway = "orange";

let timerInterval = null;
let statusInterval = null;

let timeLeft = 120;

// ========================================
// API LOCALE
// ========================================

const API_URL = "";

// ===========================
// DROPDOWN
// ===========================

function toggleDropdown() {

    const dropdown =
        document.getElementById("dropdown");

    dropdown.style.display =
        dropdown.style.display === "flex"
            ? "none"
            : "flex";

}

function selectOption(value) {

    selectedGateway = value;

    if (value === "orange") {

        document.getElementById("selected").innerText =
            "Orange Money";

    }

    else if (value === "mtn") {

        document.getElementById("selected").innerText =
            "MTN Mobile Money";

    }

    document.getElementById("dropdown").style.display =
        "none";

}

window.onclick = function(event) {

    if (!event.target.closest(".select-container")) {

        document.getElementById("dropdown").style.display =
            "none";

    }

};

// ===========================
// TIMER
// ===========================

function formatTime(seconds) {

    const min =
        Math.floor(seconds / 60);

    const sec =
        seconds % 60;

    return `${min}:${sec < 10 ? "0" : ""}${sec}`;

}

function startTimer() {

    stopTimer();

    timeLeft = 120;

    document.getElementById("modal-timer").innerText =
        formatTime(timeLeft);

    timerInterval =
        setInterval(() => {

            timeLeft--;

            document.getElementById("modal-timer").innerText =
                formatTime(timeLeft);

            if (timeLeft <= 0) {

                stopTimer();

                stopStatusPolling();

                openModal(
                    "Temps dépassé.",
                    false
                );

            }

        }, 1000);

}

function stopTimer() {

    if (timerInterval) {

        clearInterval(timerInterval);

        timerInterval = null;

    }

}

// ===========================
// STATUS POLLING
// ===========================

function stopStatusPolling() {

    if (statusInterval) {

        clearInterval(statusInterval);

        statusInterval = null;

    }

}

async function checkStatus(token) {

    try {

        const res =
            await fetch(
                `${API_URL}/api/status/${encodeURIComponent(token)}`
            );

        const data =
            await res.json();

        console.log(
            "STATUT PAIEMENT :",
            data
        );

        // ========================================
        // PAIEMENT REUSSI
        // ========================================

        if (
            data.status === "SUCCESS" ||
            data.success === true
        ) {

            stopStatusPolling();

            stopTimer();

            openModal(
                "✅ Paiement réussi",
                false
            );

            return;

        }

        // ========================================
        // PAIEMENT REFUSE
        // ========================================

        if (
            data.status === "FAILED"
        ) {

            stopStatusPolling();

            stopTimer();

            openModal(
                data.message ||
                "❌ Paiement refusé",
                false
            );

            return;

        }

        // ========================================
        // PAIEMENT ANNULE
        // ========================================

        if (
            data.status === "CANCELLED"
        ) {

            stopStatusPolling();

            stopTimer();

            openModal(
                "Paiement annulé",
                false
            );

            return;

        }

        // ========================================
        // PENDING
        // ========================================

        console.log(
            "Paiement encore en attente..."
        );

    }

    catch (err) {

        console.log(
            "Erreur vérification statut :",
            err
        );

    }

}

function startStatusPolling(token) {

    stopStatusPolling();

    // Vérification immédiate
    checkStatus(token);

    // Puis toutes les 3 secondes
    statusInterval =
        setInterval(() => {

            checkStatus(token);

        }, 3000);

}

// ===========================
// MODAL
// ===========================

function openModal(message, loading = true) {

    document.getElementById("modal").style.display =
        "flex";

    document.getElementById("modal-text").innerText =
        message;

    document.getElementById("modal-loader").style.display =
        loading
            ? "block"
            : "none";

    document.getElementById("modal-close").style.display =
        loading
            ? "none"
            : "inline-block";

}

function closeModal() {

    document.getElementById("modal").style.display =
        "none";

    stopTimer();

    stopStatusPolling();

}

// ===========================
// CANCEL PAYMENT
// ===========================

function cancelPayment() {

    closeModal();

}

// ===========================
// PAYMENT
// ===========================

async function pay() {

    const phone =
        document
            .getElementById("phone")
            .value
            .replace(/\s/g, "");

    // ========================================
    // VALIDATION
    // ========================================

    if (!/^6\d{8}$/.test(phone)) {

        openModal(
            "Numéro invalide. Exemple : 670000000",
            false
        );

        return;

    }

    // ========================================
    // MODAL INITIALISATION
    // ========================================

    openModal(
        "Initialisation du paiement...",
        true
    );

    startTimer();

    try {

        // ========================================
        // APPEL LOCAL NODE.JS
        // ========================================

        const res =
            await fetch(
                `${API_URL}/api/pay`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        phone,

                        gateway:
                            selectedGateway

                    })

                }
            );

        const data =
            await res.json();

        console.log(
            "REPONSE SERVEUR :",
            data
        );

        // ========================================
        // ERREUR SERVEUR
        // ========================================

        if (!res.ok) {

            throw new Error(
                data.message ||
                "Impossible d'initialiser le paiement."
            );

        }

        // ========================================
        // VERIFICATION TRANSACTION ID
        // ========================================

        const transactionId =
            data.transactionId ||
            data.token;

        if (!transactionId) {

            throw new Error(
                "Identifiant de transaction manquant."
            );

        }

        // ========================================
        // MESSAGE CLIENT
        // ========================================

        openModal(
            data.message ||
            "Confirmez le paiement sur votre téléphone...",
            true
        );

        // ========================================
        // POLLING
        // ========================================

        startStatusPolling(
            transactionId
        );

    }

    catch (err) {

        console.error(
            "PAY ERROR :",
            err
        );

        stopTimer();

        stopStatusPolling();

        openModal(
            err.message ||
            "Une erreur est survenue.",
            false
        );

    }

}