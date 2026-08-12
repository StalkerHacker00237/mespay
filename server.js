import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import paymentRoutes from "./routes/paymentRoutes.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =====================================
// MIDDLEWARE
// =====================================

app.use(cors());

app.use(express.json());

// =====================================
// ROUTES API
// =====================================

app.use("/api", paymentRoutes);

// =====================================
// FRONTEND
// =====================================

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);

app.get("/", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "public",
            "index.html"
        )
    );

});

// =====================================
// START
// =====================================

const PORT =
    process.env.PORT || 5000;

console.log("================================");
console.log("MeSomb API Direct");
console.log("BASE_URL :", process.env.BASE_URL);
console.log("PORT :", PORT);
console.log("================================");

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            `🚀 Server running on ${PORT}`
        );

    }
);