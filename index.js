require('dotenv').config();
const axios = require('axios');
const fs = require('fs');

async function fetchPolkadotData() {
  try {
    const url = 'https://api.merklescience.com/api/v4/attribution/polkadot/?record_type=new&limit=10000000';
    const apiKey = process.env.API_KEY;

    const headers = {
      'Content-Type': 'application/json',
      'accept': 'application/json',
      'X-API-KEY': apiKey,
    };

    const response = await axios.get(url, { headers });

    const json = JSON.stringify(response.data);
    fs.writeFileSync('data.json', json);

    // Display the response data
    console.log(response.data);
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

fetchPolkadotData();
