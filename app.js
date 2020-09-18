require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const MOVIES = require('./movies.json');

const app = express();

const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'common'
app.use(morgan(morganSetting))
app.use(helmet());
app.use(cors());
app.use(function validateBearerToken(req, res, next) {

  const apiToken = process.env.API_TOKEN;
  const authToken = req.get('Authorization');

  if (!authToken || authToken.split(' ')[1] !== apiToken) {
    return res.status(401).json({ error: 'Unauthorized Request' });
  }
  next();
});

const PORT = 8000;

app.get('/movie', (req, res) => {

  const { genre, country, avg_vote } = req.query;
  let results = [...MOVIES];

  if (genre) {
    results = results.filter(movie =>
      movie.genre.toLowerCase().includes(genre.toLowerCase()));
  }


  if (country) {
    results = results.filter(movie =>
      movie.country.toLowerCase().includes(country.toLowerCase()));
  }

  if (avg_vote) {
    let num = parseFloat(avg_vote);
    results = results.filter(movie =>
      movie.avg_vote >= num);
  }

  res.json(results);
})

app.use((error, req, res, next) => {
  let response
  if (process.env.NODE_ENV === 'production') {
    response = { error: { message: 'server error' }}
  } else {
    response = { error }
  }
  res.status(500).json(response)
})


module.exports = app;