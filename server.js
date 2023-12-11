import express from "express";
import 'dotenv/config'
import cors from "cors";
import morgan from "morgan";
import bodyParser from "body-parser";

import xss from "xss-clean";
import mongoSanitize from "express-mongo-sanitize";

import dbConnection from "./dbConfig/dbConnection.js";
import router from "./routes/index.js";
// import errorMiddleware from "./middlewares/errorMiddleware.js";

const app = express();

// eslint-disable-next-line no-undef
const PORT = process.env.PORT || 8800;

// MONGODB CONNECTION
dbConnection();

// middlenames
app.use(cors());
app.use(xss());
app.use(mongoSanitize());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));

// routes
app.all('/', (req, res) => res.send('Welcome to Portfol!'))
app.all('/api-v1', (req, res) => res.send('Portfol API!'))
app.use(router);


//error middleware
// app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Dev Server running on port: ${PORT}`);
});