require("dotenv").config();
const express = require("express")
const bodyParser = require('body-parser')

const morgan = require("morgan")
const helmet = require("helmet")

const CorsMiddleware = require("./middlewares/CorsMiddleware")
const app = express()

app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));





const PORT = process.env.PORT


app.listen(PORT, () => {
    console.log(`App is listening on port ${PORT}`)
})
