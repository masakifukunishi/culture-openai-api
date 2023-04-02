const openAIText = require("./lib/openAIText");
const openAIImage = require("./lib/openAIImage");
const amazonS3 = require("./lib/amazonS3");
const mongoDB = require("./lib/mongoDB");

const insertCounties = async () => {
  // let countriyNames = await openAIText.getCountries();
  let countriyNames = ["Japan"];
  let countries = [];
  for (let countryName of countriyNames) {
    countries.push(await openAIText.getCountryInfo(countryName));
  }
  await mongoDB.insertMany("countries", countries);
};

const insertCountyCultures = async () => {
  let countries = await mongoDB.getCountries();
  for (let country of countries) {
    let cultureNames = [];
    let cultures = [];
    cultureNames = await openAIText.getCountyCultures(country.name);
    for (let cultureName of cultureNames) {
      cultures.push(await openAIText.getCountyCultureDescription(country.name, cultureName));
    }
    await mongoDB.updateField("countries", country._id, "cultures", cultures);
  }
};

const insertCountyFood = async () => {
  let countries = await mongoDB.getCountries();
  for (let country of countries) {
    let foodNames = [];
    let food = [];
    foodNames = await openAIText.getCountyFood(country.name);
    for (let foodName of foodNames) {
      food.push(await openAIText.getCountyFoodDescription(country.name, foodName));
    }
    await mongoDB.updateField("countries", country._id, "food", food);
  }
};

const insertCities = async () => {
  let countries = await mongoDB.getCountries();
  for (let country of countries) {
    let citieNames = [];
    citieNames = await openAIText.getCities(country.name);
    let cities = [];
    for (let cityName of citieNames) {
      cities.push(await openAIText.getCityInfo(cityName));
      cities[cities.length - 1].countryID = country._id.toString();
      cities[cities.length - 1].countryCode = country.countryCode;
      cities[cities.length - 1].countryName = country.name;
    }
    await mongoDB.insertMany("cities", cities);
  }
};

const insertCountryImage = async () => {
  let countries = await mongoDB.getCountries();
  for (let country of countries) {
    const imageURL = await openAIImage.generateCountryImage(country.name);
    const s3Location = (await amazonS3.uploadFile(imageURL)).Location;
    console.log(s3Location);
  }
};

const main = async () => {
  // await insertCounties();
  // await insertCountyCultures();
  // await insertCountyFood();
  await insertCountryImage();
  // await insertCities();
};
main();
