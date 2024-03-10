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

const fs = require('fs')
// const file = fs.readFileSync('./FFCE118E328DBD3AC4789B83609C0CA0.txt')
const https = require('https')

const AuthRoute = require("./router/AuthenticationRouter")
const ReportRoute = require("./router/DailyReportsRouter")
const ApprovalRoute = require("./router/ApprovalRouter")
const DashboardFetcherRoute = require("./router/dashboardFetcherRouter")
const ReportsFetcherRoute = require("./router/reportsFetcherRouter")
const SalesReportRoute = require("./router/SalesReportRouter")
const ForecastingRoute = require("./router/ForecastingRouter")
const AuditTrailRoute = require("./router/AuditTrailRouter")
const EggVisualization = require("./router/EggVisualization")
const FlocksVisualization = require("./router/FlocksVisualization")
const SalesVisualization = require("./router/SalesVisualization")
const ComparisonVisualization = require("./router/ComparisonVisualization")

const key = fs.readFileSync('private.key')
const cert = fs.readFileSync('certificate.crt')

const cred = {
    key,
    cert
}


app.use("/api", CorsMiddleware, AuthRoute, ReportRoute, ApprovalRoute, DashboardFetcherRoute, SalesReportRoute, ReportsFetcherRoute, ForecastingRoute, AuditTrailRoute, EggVisualization, FlocksVisualization, SalesVisualization, ComparisonVisualization)

// app.get('/.well-known/pki-validation/FFCE118E328DBD3AC4789B83609C0CA0.txt', (req,res) =>{
//     res.sendFile('/home/ubuntu/poultry-BE/FFCE118E328DBD3AC4789B83609C0CA0.txt')
// })


const PORT = process.env.PORT
const HTTPSPORT = process.env.HTTPSPORT

app.listen(PORT, () => {
    console.log(`App is listening on port ${PORT}`)
})

const httpsServer = https.createServer(cred, app)
httpsServer.listen(HTTPSPORT)
