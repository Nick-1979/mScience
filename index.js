require('dotenv').config();
const axios = require('axios');
const { Octokit } = require('@octokit/rest');
const fs = require('fs');
const cron = require('node-cron');

const octokit = new Octokit({ auth: process.env.GIT_ACCESS_TOKEN });

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

    if (!response || response.data === undefined) {
      console.error('Invalid response received.');
      return;
    }

    // Update the data file with the new JSON object
    const json = JSON.stringify(response.data);
    fs.writeFileSync('data.json', json);

    const numRecords = response.data.results.length;
    console.log(`Data file updated successfully! ${numRecords} records fetched.`);

    // Upload the file to GitHub
    uploadFileToGitHub();

  } catch (error) {
    console.error('An error occurred:', error);
  }
}

async function uploadFileToGitHub() {
  const owner = process.env.GITHUB_USERNAME;
  const repo = process.env.GITHUB_REPO_NAME;
  const filePath = 'data.json';
  const branch = 'master'; // or specify the branch you want to update

  const fileData = fs.readFileSync(filePath);

  try {
    const { data: { commit } } = await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: filePath,
      message: 'Update data file',
      content: fileData.toString('base64'),
      branch,
    });

    console.log('File uploaded successfully. Commit:', commit);
  } catch (error) {
    console.error('Error uploading file:', error);
  }
}


// Run the fetch script immediately
fetchPolkadotData();

// Then schedule the fetch task to run every 12 hours
cron.schedule('0 */12 * * *', fetchPolkadotData);