import "dotenv/config";

import {
    PaymentOperation,
    RandomGenerator
} from "@hachther/mesomb";

// ========================================
// CONFIGURATION MESOMB
// ========================================

const applicationKey =
    process.env.MESOMB_APPLICATION_KEY;

const accessKey =
    process.env.MESOMB_ACCESS_KEY;

const secretKey =
    process.env.MESOMB_SECRET_KEY;

// ========================================
// VERIFICATION CONFIGURATION
// ========================================

if (
    !applicationKey ||
    !accessKey ||
    !secretKey
) {

    console.error(
        "❌ Clés MeSomb manquantes."
    );

    console.error({

        applicationKey:
            Boolean(applicationKey),

        accessKey:
            Boolean(accessKey),

        secretKey:
            Boolean(secretKey)

    });

    throw new Error(
        "Configuration MeSomb incomplète. Vérifiez le fichier .env."
    );
}

// ========================================
// CLIENT MESOMB
// ========================================

const client = new PaymentOperation({

    applicationKey,

    accessKey,

    secretKey

});

console.log(
    "✅ Client MeSomb initialisé."
);

// ========================================
// FORMAT NUMERO CAMEROUN
// ========================================

const formatCameroonPhone = (phone) => {

    let formattedPhone =
        String(phone || "")
            .replace(/\s/g, "")
            .replace(/-/g, "")
            .replace(/\(/g, "")
            .replace(/\)/g, "");

    // +237670000000
    if (
        formattedPhone.startsWith("+237")
    ) {

        formattedPhone =
            formattedPhone.substring(4);

    }

    // 237670000000
    else if (
        formattedPhone.startsWith("237")
    ) {

        formattedPhone =
            formattedPhone.substring(3);

    }

    // ========================================
    // FORMAT LOCAL CAMEROUN
    // ========================================

    if (
        !/^6\d{8}$/.test(formattedPhone)
    ) {

        throw new Error(
            "Numéro camerounais invalide. Utilisez un numéro de 9 chiffres commençant par 6."
        );

    }

    return formattedPhone;

};

// ========================================
// INITIATE PAYMENT / COLLECT
// ========================================

export const initiatePayment = async ({

    phone,

    operator,

    amount,

    orderId

}) => {

    try {

        const payer =
            formatCameroonPhone(phone);

        // ========================================
        // OPERATEUR
        // ========================================

        const service =
            String(operator || "")
                .toUpperCase();

        if (
            service !== "MTN" &&
            service !== "ORANGE"
        ) {

            throw new Error(
                "Opérateur non supporté. Utilisez MTN ou ORANGE."
            );

        }

        // ========================================
        // MONTANT
        // ========================================

        const numericAmount =
            Number(amount);

        if (
            !Number.isFinite(numericAmount) ||
            numericAmount <= 0
        ) {

            throw new Error(
                "Montant de paiement invalide."
            );

        }

        // ========================================
        // LOG
        // ========================================

        console.log(
            "========================================"
        );

        console.log(
            "REQUETE MESOMB COLLECT"
        );

        console.log(
            "========================================"
        );

        console.log({

            payer,

            amount: numericAmount,

            service,

            country: "CM",

            currency: "XAF",

            orderId

        });

        // ========================================
        // COLLECT DIRECT MESOMB
        // ========================================

        const response =
            await client.makeCollect({

                payer,

                amount: numericAmount,

                service,

                country: "CM",

                currency: "XAF",

                nonce:
                    RandomGenerator.nonce()

            });

        // ========================================
        // REPONSE MESOMB
        // ========================================

        console.log(
            "========================================"
        );

        console.log(
            "REPONSE MESOMB"
        );

        console.log(
            "========================================"
        );

        console.dir(
            response,
            {
                depth: 10
            }
        );

        // ========================================
        // VERIFICATION OPERATION
        // ========================================

        const operationSuccess =
            typeof response?.isOperationSuccess ===
            "function"

                ? response.isOperationSuccess()

                : false;

        const transactionSuccess =
            typeof response?.isTransactionSuccess ===
            "function"

                ? response.isTransactionSuccess()

                : false;

        console.log(
            "Operation success :",
            operationSuccess
        );

        console.log(
            "Transaction success :",
            transactionSuccess
        );

        // ========================================
        // TRANSACTION
        // ========================================

        const transaction =
            response?.transaction ||
            response?.data?.transaction ||
            null;

        const transactionId =
            transaction?.pk ||
            response?.pk ||
            response?.id ||
            null;

        // ========================================
        // ECHEC OPERATION
        // ========================================

        if (!operationSuccess) {

            return {

                success: false,

                status: "FAILED",

                message:
                    response?.message ||
                    "Impossible d'initialiser le paiement.",

                transaction,

                transactionId

            };

        }

        // ========================================
        // PAIEMENT INITIALISE
        // ========================================

        return {

            success: true,

            status:
                transaction?.status ||
                response?.status ||
                "PENDING",

            message:
                transaction?.message ||
                response?.message ||
                "Paiement initialisé. Confirmez le paiement sur votre téléphone.",

            transaction,

            transactionId,

            operator: service,

            phone: payer,

            amount: numericAmount,

            orderId

        };

    }

    catch (error) {

        console.error(
            "========================================"
        );

        console.error(
            "❌ ERREUR MESOMB COLLECT"
        );

        console.error(
            "========================================"
        );

        console.error(
            "Message :",
            error?.message
        );

        console.error(
            "Code :",
            error?.code
        );

        console.error(
            "Erreur complète :",
            error
        );

        throw error;

    }

};

// ========================================
// VERIFY PAYMENT STATUS
// ========================================

export const verifyPayment = async (
    transactionId
) => {

    try {

        if (!transactionId) {

            throw new Error(
                "Identifiant de transaction manquant."
            );

        }

        console.log(
            "========================================"
        );

        console.log(
            "VERIFICATION TRANSACTION MESOMB"
        );

        console.log(
            "========================================"
        );

        console.log(
            "Transaction ID :",
            transactionId
        );

        const transactions =
            await client.checkTransactions([
                transactionId
            ]);

        console.log(
            "REPONSE CHECK TRANSACTION :"
        );

        console.dir(
            transactions,
            {
                depth: 10
            }
        );

        // ========================================
        // RECUPERATION TRANSACTION
        // ========================================

        const transaction =
            Array.isArray(transactions)

                ? transactions[0]

                : transactions?.transactions?.[0] ||
                  transactions?.transaction ||
                  transactions;

        if (!transaction) {

            return {

                success: false,

                status: "PENDING",

                message:
                    "Transaction introuvable ou statut encore indisponible.",

                transactionId

            };

        }

        // ========================================
        // STATUT
        // ========================================

        const rawStatus =
            String(
                transaction.status || ""
            ).toUpperCase();

        let status = "PENDING";

        if (
            rawStatus === "SUCCESS"
        ) {

            status = "SUCCESS";

        }

        else if (
            rawStatus === "FAILED" ||
            rawStatus === "FAILURE"
        ) {

            status = "FAILED";

        }

        else if (
            rawStatus === "CANCELLED" ||
            rawStatus === "CANCELED"
        ) {

            status = "CANCELLED";

        }

        else if (
            rawStatus === "PENDING" ||
            rawStatus === "INITIATED" ||
            rawStatus === "PROCESSING"
        ) {

            status = "PENDING";

        }

        // ========================================
        // MESSAGE
        // ========================================

        let message =
            transaction.message;

        if (!message) {

            if (
                status === "SUCCESS"
            ) {

                message =
                    "Paiement réussi.";

            }

            else if (
                status === "FAILED"
            ) {

                message =
                    "Paiement refusé.";

            }

            else if (
                status === "CANCELLED"
            ) {

                message =
                    "Paiement annulé.";

            }

            else {

                message =
                    "Paiement en cours...";

            }

        }

        // ========================================
        // REPONSE
        // ========================================

        return {

            success:
                status === "SUCCESS",

            status,

            message,

            transaction,

            transactionId:
                transaction.pk ||
                transactionId

        };

    }

    catch (error) {

        console.error(
            "========================================"
        );

        console.error(
            "❌ ERREUR VERIFICATION MESOMB"
        );

        console.error(
            "========================================"
        );

        console.error(
            "Message :",
            error?.message
        );

        console.error(
            "Code :",
            error?.code
        );

        console.error(
            "Erreur complète :",
            error
        );

        throw error;

    }

};