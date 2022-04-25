const nodeAddress = 'ELASTIC_SEARCH_NODE_ADDRESS';
const indexName = 'extension_registry_prod';
import util from 'util';
import fs from 'fs';
import searchClient from '@aicore/elasticsearch-lib';
import { Client } from '@elastic/elasticsearch';
let client = null;
import { createRequire } from "module"; // Bring in the ability to create the 'require' method
const require = createRequire(import.meta.url); // construct the require method
const registryData = require('./brackets_registry.json'); //place the metadata registry json file in the root directory before running the script.
//var util = require('util');
//const fs = require('fs');
let downloadMapping = require('./success(final).json');
const EXTENSION = 'EXTENSION';
const THEME = 'THEME';
const prefix = "@phoenix-plugin-registry/"

async function run() {
    console.log("Total number of records :" + Object.keys(downloadMapping).length);
    const keyToUrl = new Map();
    const failureMap = new Map();
    let successCount = 0;
    let failureCount = 0;
    let themesCount = 0;
    let darKThemesCount = 0;
    let lightCount = 0;
    let i = 0;
    /** 
    This piece was later on added to manually backfill the failed items by hardcoding the extension names as params.
    Comment the for loop below
    console.log("printing :");
    console.log(JSON.stringify(registryData['fthiagogv.naturegreen-dark-syntax']));
    await searchClient.bulkInsert(nodeAddress, indexName, [registryData['fthiagogv.naturegreen-dark-syntax']]);
    */

    for (const [key, value] of Object.entries(downloadMapping)) {
       i++;
       if ((i % 5) === 0) {
         console.log("Pausing for 5 secs");
         await new Promise(resolve => setTimeout(resolve, 5000));
       }
      console.log("Success Count : " + successCount);
      console.log("Failure Count : " + failureCount);
      console.log("Processing Entry : " + registryData[key].metadata.name);
      try {       
        registryData[key].metadata.downloadUrl = value;
        
        // set asset type
        if (registryData[key].metadata.hasOwnProperty('theme')) {
          registryData[key].metadata.assetType = THEME;
          themesCount++;
          // set the theme type
          if (registryData[key].metadata.theme.dark === true) {
            darKThemesCount++;
            registryData[key].metadata.theme.type = 'DARK';
          } else {
            lightCount++;
            registryData[key].metadata.theme.type = 'LIGHT';
          }

        } else {
          registryData[key].metadata.assetType = EXTENSION;
        }
        if (registryData[key].metadata.hasOwnProperty('bugs')) {

            if (typeof(registryData[key].metadata.bugs) === 'object') {
              let url = '';
               if(registryData[key].metadata.bugs.hasOwnProperty('web')) {
                   url = registryData[key].metadata.bugs.web;
               } else {
                url = JSON.stringify(registryData[key].metadata.bugs);
               }
               delete registryData[key].metadata.bugs;
               registryData[key].metadata.bugs = url; 
            }
        }

        //console.log("PrintiregistryData[key].metadatang JSON string");
        //console.log(JSON.stringify(registryData[key].metadata, null, "\t"));
        // the commented method below has the same logic as "bulkInsert"
        //await performBulkOperation(indexName, [registryData[key].metadata]);
        await searchClient.bulkInsert(nodeAddress, indexName, [registryData[key]]);
        successCount++;
      } catch (err) {
        console.log("[FAILED] Failed to publish to elastic-search : " + JSON.stringify(err));
        failureMap.set(registryData[key].metadata.name, err.toString());
        failureCount++;
      }
      
    }
    console.log("Script finished saving failed items.");

    fs.writeFileSync('./backfill-success.json', util.inspect(keyToUrl) , 'utf-8');
    fs.writeFileSync('./backfill-failure.json', util.inspect(failureMap) , 'utf-8');
    console.log("Total success entries : " + successCount + " Total failure entries : " + failureCount);

}


run().catch(console.log);