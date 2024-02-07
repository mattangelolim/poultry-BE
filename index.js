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
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

const AuthRoute = require("./router/AuthenticationRouter")
const ReportRoute = require("./router/DailyReportsRouter")
const ApprovalRoute = require("./router/ApprovalRouter")


app.use("/api", AuthRoute, ReportRoute, ApprovalRoute)


const PORT = process.env.PORT


app.listen(PORT, () => {
    console.log(`App is listening on port ${PORT}`)
})
