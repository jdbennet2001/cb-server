var express = require('express')
var cors 	= require('cors')
var app 	= express()

app.use(cors())

app.get('/products/:id', function (req, res, next) {
  res.json({msg: 'This is CORS-enabled for all origins!'})
})

app.listen(2002, () => console.log('CORS-enabled web server listening on port 2002'))