// netlify/functions/storeSearch.js
const fetch = require("node-fetch");

exports.handler = async (_event, _context) => {
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
};
