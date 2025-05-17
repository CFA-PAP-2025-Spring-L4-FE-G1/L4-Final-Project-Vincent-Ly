const fetch = require("node-fetch")
const express = require('express')
const app = express()
const port = 3000

app.use(express.static('static'))

app.get('/storeSearch', async (req, res) => {
  const token = process.env.ACCESS_TOKEN;
    if (!token) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "No ACCESS_TOKEN env var set." })
      };
    }
  
    const apiUrl =
      "https://api-ce.kroger.com/v1/locations?filter.zipCode.near=98037";
  
    try {
      const resp = await fetch(apiUrl, {
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await resp.json();
      return {
        statusCode: resp.status,
        body: JSON.stringify(data)
      };
    } catch (err) {
      return {
        statusCode: 502,
        body: JSON.stringify({ error: err.message })
      };
    }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
