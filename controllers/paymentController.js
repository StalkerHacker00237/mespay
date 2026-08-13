import { v4 as uuidv4 } from "uuid";

import {
    initiatePayment,
    verifyPayment
} from "../services/mesombService.js";

// ========================================
// CREATE PAYMENT
// ========================================

export const createPayment = async (req, res) => {

    try {

        const {
            phone,
            gateway
        } = req.body;

        // ========================================
        // VALIDATION
        // ========================================

        if (!phone || !gateway) {

            return res.status(400).json({

                success: false,

                message:
                    "Numéro ou moyen de paiement manquant"

            });

        }

        // ========================================
        // FORMAT TELEPHONE
        // ========================================

        let formattedPhone = String(phone)
            .replace(/\s/g, "")
            .replace(/-/g, "")
            .replace(/\(/g, "")
            .replace(/\)/g, "");

        if (formattedPhone.startsWith("+237")) {

            formattedPhone =
                formattedPhone.substring(4);

        }

        else if (formattedPhone.startsWith("237")) {

            formattedPhone =
                formattedPhone.substring(3);

        }

        // ========================================
        // VALIDATION NUMERO CAMEROUN
        // ========================================

        if (!/^6\d{8}$/.test(formattedPhone)) {

            return res.status(400).json({

                success: false,

                message:
                    "Numéro camerounais invalide. Exemple : 670000000"

            });

        }

        // ========================================
        // GATEWAY -> MESOMB SERVICE
        // ========================================

        let operator = "";

        switch (gateway) {

            case "orange":

                operator = "ORANGE";

                break;

            case "mtn":

                operator = "MTN";

                break;

            default:

                return res.status(400).json({

                    success: false,

                    message:
                        "Opérateur non supporté"

                });

        }

        // ========================================
        // ID DE TRANSACTION INTERNE
        // ========================================

        const orderId =
            "ORDER-" + uuidv4();

        console.log("========================================");
        console.log("NOUVEAU PAIEMENT");
        console.log("========================================");

        console.log({

            phone: formattedPhone,

            operator,

            amount: 100,

            orderId

        });

        // ========================================
        // INITIATION MESOMB
        // ========================================

        const payment =
            await initiatePayment({

                phone: formattedPhone,

                operator,

                amount: 100,

                orderId

            });

        console.log(
            "Résultat initiation :",
            payment
        );

        // ========================================
        // ECHEC
        // ========================================

        if (
            !payment.success ||
            payment.status === "FAILED"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    payment.message ||
                    "Impossible d'initialiser le paiement.",

                status:
                    payment.status ||

                    "FAILED"

            });

        }

        // ========================================
        // TRANSACTION ID
        // ========================================

        const transactionId =
            payment.transactionId;

        if (!transactionId) {

            console.error(
                "⚠️ MeSomb n'a pas retourné de transaction ID."
            );

            return res.status(500).json({

                success: false,

                message:
                    "La transaction a été initialisée mais son identifiant est introuvable."

            });

        }

        // ========================================
        // REPONSE FRONTEND
        // ========================================

        return res.json({

            success: true,

            message:
                payment.message ||
                "Confirmez le paiement sur votre téléphone.",

            // On conserve le nom "token"
            // pour ne pas casser immédiatement
            // la structure actuelle du frontend.
            token: transactionId,

            transactionId,

            status:
                payment.status ||
                "PENDING",

            operator,

            amount: 100

        });

    }

    catch (error) {

        console.error("========================================");
        console.error("CREATE PAYMENT ERROR");
        console.error("========================================");

        console.error(error);

        const message =
            error?.message ||
            error?.error ||
            error?.erreur ||
            error?.response?.data?.message ||
            "Erreur serveur lors de l'initialisation du paiement.";

        return res.status(500).json({

            success: false,

            message

        });

    }

};

// ========================================
// STATUS
// ========================================

export const checkPaymentStatus = async (req, res) => {

    try {

        const transactionId =
            req.params.token;

        if (!transactionId) {

            return res.status(400).json({

                success: false,

                message:
                    "Identifiant de transaction manquant."

            });

        }

        const payment =
            await verifyPayment(transactionId);

        console.log(
            "STATUT TRANSACTION :",
            payment
        );

        return res.json(payment);

    }

    catch (error) {

        console.error("========================================");
        console.error("STATUS PAYMENT ERROR");
        console.error("========================================");

        console.error(error);

        return res.status(500).json({

            success: false,

            message:
                error?.message ||
                "Impossible de vérifier le paiement"

        });

    }

};
