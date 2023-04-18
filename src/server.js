require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const morgan = require('morgan');
const {authJwt} = require('./middleware/jwt');
const cookieParser = require('cookie-parser')
const cors = require('cors')
const path = require('path')
// Parsing multi-part formdata
var bodyParser = require('body-parser');
// var multer = require('multer');
// var upload = multer();
// const { logger } = require('./middleware/logger')
const errorHandler = require('./middleware/errorHandler')
const corsOptions = require('./config/corsOptions')
const connectDB = require('./config/dbConn')
const { logEvents } = require('./middleware/logger')

const app = express()

const PORT = process.env.PORT || 3500


connectDB()

app.use(morgan('dev'))

// app.use(cors(corsOptions))
app.use(cors())
app.options('*', cors())

app.use(express.json())

app.use(cookieParser())

// for parsing application/json
app.use(bodyParser.json()); 

// for parsing application/xwww-
app.use(bodyParser.urlencoded({ extended: true })); 
//form-urlencoded

// for parsing multipart/form-data
// app.use(upload.array()); 
// app.use(express.static('public'))

app.use('/', express.static(path.join(__dirname, 'public')));
app.use(authJwt())

app.use('/', require('./routes/root'))
app.use('/auth/update-image', require('./routes/imageRoute'))
app.use('/auth', require('./routes/authRoutes'))
app.use('/users', require('./routes/userRoutes'))
app.use('/services', require('./routes/serviceRoutes'))
app.use('/categories', require('./routes/categoryRoutes'))
app.use('/demands', require('./routes/demandRoutes'))
app.use('/promotions', require('./routes/promotionRoutes'))
app.use('/notifs', require('./routes/notificationRoutes'))

app.all('/*', (req, res)=> {
    res.status(404)

    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'))
    } else if(req.accepts('json')) {
        res.json({ message: '404 Not Found'})
    } else {
        res.type('txt').send('404 Not Found')
    }
})

app.use(errorHandler)

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
        console.log(`Technotes server running on port ${PORT}`);
    })
})

mongoose.connection.on('error', err => {
    console.log(err)
    logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log')
})
