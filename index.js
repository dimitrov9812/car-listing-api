const express = require('express');
const { v4: uuidv4 } = require('uuid');
const fileHandler = require('./utils/fileHandler');
const app = express();
const cors = require('cors');
const PORT = 3000;

// Data validation keys
const expectedCarKeys = [
  "make", "model", "price", "type", "features", "pictures", "publisher"
];

const expectedFeatureKeys = [
  "airConditioning", "sunroof", "heatedSeats", "bluetooth",
  "backupCamera", "cruiseControl", "laneAssist", "parkingSensors",
  "keylessEntry", "remoteStart", "leatherSeats", "navigationSystem",
  "appleCarPlay", "androidAuto", "blindSpotMonitor", "adaptiveHeadlights",
  "fogLights", "alloyWheels", "tintedWindows", "sportPackage"
];

const expectedPublisherKeys = [
  "firstName", "lastName", "displayName", "phone", "address", "profilePicture"
];

app.use(cors());
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
  const carData = req.body;

  // Basic shape checks
  if (!carData || typeof carData !== 'object' || Array.isArray(carData)) {
    return res.status(400).json({ error: "Expected a valid car object." });
  }

  // Check top-level keys
  const carKeys = Object.keys(carData);
  const hasAllTopLevelKeys = expectedCarKeys.every(key => carKeys.includes(key));
  if (!hasAllTopLevelKeys || carKeys.length !== expectedCarKeys.length) {
    return res.status(400).json({ error: "Car object must include exactly the required top-level fields." });
  }

  // Check features
  const featureKeys = Object.keys(carData.features || {});
  const hasAllFeatures = expectedFeatureKeys.every(key => featureKeys.includes(key));
  if (!hasAllFeatures || featureKeys.length !== expectedFeatureKeys.length) {
    return res.status(400).json({ error: "Features object must include exactly the 20 defined boolean fields." });
  }

  // Check publisher
  const publisherKeys = Object.keys(carData.publisher || {});
  const hasAllPublisherKeys = expectedPublisherKeys.every(key => publisherKeys.includes(key));
  if (!hasAllPublisherKeys || publisherKeys.length !== expectedPublisherKeys.length) {
    return res.status(400).json({ error: "Publisher object must include all required fields." });
  }

  // If valid, proceed
  const cars = await fileHandler.read(DB_FILE);
  const newCar = {
    id: uuidv4(),
    ...carData,
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
