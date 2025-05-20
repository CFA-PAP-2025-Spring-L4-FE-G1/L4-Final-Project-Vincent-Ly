const fetch = require("node-fetch")
const express = require('express')
const app = express()
const port = 3000
require('dotenv').config()

app.use(express.static('static'))

let token = ""
let tokenAPIURL = "https://api-ce.kroger.com/v1/connect/oauth2/token";

const locationHeader = {
  "Authorization" : `Basic ${process.env.API_KEY}`,
  "Content-Type" : "application/x-www-form-urlencoded"
}
const tokenAPIOptions = {
  "method" : "POST",
  "headers" : locationHeader,
  "body" : "grant_type=client_credentials&scope=product.compact"
}
fetch(tokenAPIURL, tokenAPIOptions)
.then(function func(res) {
  return res.json()
})
.then(function func(data) {
  token = data.access_token;
  console.log(token)//
})

app.get('/storeSearch', async (req, res) => {
  const zip = req.query.zip;
  // const token = process.env.ACCESS_TOKEN;
    if (!token) {
      return res.status(500).json({ error: "No ACCESS_TOKEN env var set." });
    }
  
    const apiUrl =
      "https://api-ce.kroger.com/v1/locations?filter.zipCode.near=";
  
    try {
      const resp = await fetch(apiUrl + zip, {
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await resp.json();
      console.log(data);//

      return res.status(resp.status).json(data);
    } catch (err) {
      return res.status(502).json({ error: err.message });
    }
})

app.get('/check-stock', async (req, res) => { //from chat. so cool
    const ingred = req.query.ingred;
    const locationId = req.query.locationId;
    const productsAPIURL = "https://api-ce.kroger.com/v1/products";
    // const token = process.env.ACCESS_TOKEN;
    if (!token) {
      return res.status(500).json({ error: "No ACCESS_TOKEN env var set." });
    }

    try {
      const response = await fetch(`${productsAPIURL}?filter.limit=50&filter.fulfillment=ais&filter.locationId=${locationId}&filter.term=${ingred}`, {
          headers: {
              "Accept": "application/json",
              "Authorization": `Bearer ${token}`
          }
      });
      if (!response.ok) {
        throw new Error(`Kroger API error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("TESTING", ingred);//
      console.log("TESTING", locationId);//

      console.log(data);//
      // Handle empty data array
      if (!data.data || data.data.length === 0) {
        return res.status(404).json({ error: "No products found" });
      }
      res.json(data);
    } catch (err) {
      console.error('Error communicating with Kroger API:', err.message);
      res.status(502).json({ error: err.message });
    }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
