const express = require('express');
const { v4: uuidv4 } = require('uuid');
const fileHandler = require('./utils/fileHandler');
const app = express();
const PORT = 3000;

app.use(express.json());

const DB_FILE = './cars.json';

app.get('/cars', async (req, res) => {
  const cars = await fileHandler.read(DB_FILE);
  res.json(cars);
});

app.get('/cars/:id', async (req, res) => {
  const cars = await fileHandler.read(DB_FILE);
  const car = cars.find(c => c.id === req.params.id);
  car ? res.json(car) : res.status(404).send({ error: 'Car not found' });
});

app.post('/cars', async (req, res) => {
  const cars = await fileHandler.read(DB_FILE);
  const newCar = {
    id: uuidv4(),
    ...req.body,
    datePublished: new Date().toISOString()
  };
  cars.push(newCar);
  await fileHandler.write(DB_FILE, cars);
  res.status(201).json(newCar);
});

app.put('/cars/:id', async (req, res) => {
  const cars = await fileHandler.read(DB_FILE);
  const index = cars.findIndex(c => c.id === req.params.id);
  if (index === -1) return res.status(404).send({ error: 'Car not found' });

  cars[index] = { ...cars[index], ...req.body };
  await fileHandler.write(DB_FILE, cars);
  res.json(cars[index]);
});

app.delete('/cars/:id', async (req, res) => {
  const cars = await fileHandler.read(DB_FILE);
  const updatedCars = cars.filter(c => c.id !== req.params.id);
  await fileHandler.write(DB_FILE, updatedCars);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`🚗 Car Listing API is running at http://localhost:${PORT}`);
});
