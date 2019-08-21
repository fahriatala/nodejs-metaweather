const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require("body-parser");
const fetch = require('node-fetch');
const axios = require('axios');
const weather = 'https://www.metaweather.com/api/location/';

// app.use(morgan("dev"));
app.use('/uploads', express.static('uploads'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === 'OPTIONS') {
      res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
      return res.status(200).json({});
  }
  next();
});

// app.use((req, res, next) => {
//     res.status(200).json({
//         message: 'It Works!'
//     });
// });

app.get('/weather/coordinates', async (request, response) => {
    const latlon = request.query.latlon.split(',');
    console.log(latlon);
    const lat = latlon[0];
    const lon = latlon[1];
    console.log(lat, lon);
    // const api_key = process.env.API_KEY;
    const weather_url = weather + 'search/?lattlong=' + lat + ',' + lon;
    const weather_response = await fetch(weather_url);
    const weather_data = await weather_response.json();

    const result = {
        data: weather_data,
      };

    response.json(result);
  });

  app.get('/weather/cities', async (request, response, next) => {
    try{
        const city = request.query.city;
        if( !city) {
            const error = new Error();
            error.message = 'Empty City Parameters';
            throw error;
        }
        console.log(city);
        const weather_url = weather + 'search/?query=' + city;
        const weather_response = await fetch(weather_url);
        const weather_data = await weather_response.json();

        const result = {
            data: weather_data,
        };

        response.json(result);
    } catch(err){
        response.status(500).json({
            error: err
        });
      }
  });  

  app.get('/weather/woeid', async (req, response, next) => {
    const woe = await req.body.woeid;
    if( !woe) {
        const error = new Error();
        error.message = 'Empty Woe Parameters';
        throw error;
    }
    try {
        const fetch =  await axios.get(weather + woe);
        const result = {
            data: fetch.data.consolidated_weather
        }
        response.json(result);
    } catch (error) {
      console.error(error)
    }
  });


app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});

app.use((error, req, res,next) => {
    res.status(error.status || 500);
    res.json({
        error:{
            message: error.message
        }
    });
});

module.exports = app;
