#!/usr/bin/env node

var program = require('commander');
var publisher = require('./publisher.js');
var fs = require('fs');
var myutil = require('./util.js');

program
  .option('-c, --cmd <create | read | update | delete | list | query>', 'command to execute')
  .option('-o, --org <guid>', 'organisation guid')
  .option('-ds, --ds <guid>', 'dataset guid')
  .option('-k, --key <string>', 'metadata key name')
  .option('-v, --val <string>', 'metadata value text')
  .option('-json, --json <string>', 'json string')
  .option('-xjson, --xjson <string>', 'path to json file')
  .parse(process.argv);

if (!program.cmd) {
  console.error('You must enter a command: --cmd <create | read | update | delete | list | query>');
  process.exit(1);
}

// get a token and continue
publisher.getToken(run);

function run(token){

  // store the access token
  publisher.accessToken = token;

  switch(program.cmd){
    case 'create':
      break;
    case 'read':
      read();
      break;
    case 'update':
      update();
      break;
    case 'delete':
      break;
    case 'list':
      list();
      break;
    case 'query':
      break;
    default:
      console.error('You must enter a command: --cmd <create | read | update | delete | list | query>');
  }
}

// List all datasets from a specified organisation
function list() {
  publisher.getPublishedDatasets(program.org, render);
}

// Reads the metadata of a specific dataset
function read() {

  if (program.org == null || program.ds == null) {
    console.log('You must specify an org id and dataset id.');
    return;
  }

  publisher.getPublishedDataset(program.org, program.ds, render);

}

// Updates a file resource with the specified json
function update() {
  var json = null;

  if (program.org == null || program.ds == null) {
    console.log('You must specify an org id and dataset id.');
    return;
  }

  // check we have something to update
  if (program.json == null && program.xjson == null && program.key == null) {
    console.log('You must specify some json data to update.');
    return;
  }

  // if passed a key but not the value
  if (program.key != null && program.val == null) {
    console.log('You must specify both a key and a value to perform the update.');
    return;
  }

  if ((program.json != null || program.xjson != null) && program.key != null){
    console.log('You can only specify a json fragment to update or a key to update - you cannot specify both. Go to your room!');
    return;
  }

  // update a fragment
  if (program.json != null || program.xjson != null) {
    // get the json and continue
    if (program.json != null) {
      completeUpdate(JSON.parse(program.json), program.upload);
    }
    if (program.xjson != null) {
      fs.readFile(program.xjson, 'utf8', function (err, data) {
        if (err) throw err;
        completeUpdate(JSON.parse(data), program.upload);
      });
    }
  }

  // update a specific key
  if (program.key != null && program.val != null) {

    // get the existing metadata - pass in true at the end to get raw json rather than entities
    publisher.getPublishedDataset(program.org, program.ds, function(err, result){

      // the metadata is a subset of the response
      var metadata = result.MetadataResultSet.Metadata;

      // change the key to the new value
      myutil.setValues(metadata, program.key, program.val);

      // send back to the server
      completeUpdate(metadata);

    }, true);
  }
}


function completeUpdate(json) {

  publisher.changeDataset(program.org, program.ds, json, renderTransaction);

}

function render(err, results) {
  if (err == null && null != results) {
    if (Array.isArray(results)) {
      results.forEach(function (result) {
        console.log('%s [%s] \nOrg=[%s] \nDataset=[%s]', result.title, result.id, result.dataset.organisation.id, result.dataset.id);
      });
    } else {
      console.log('%s [%s] \nOrg=[%s] \nDataset=[%s]', results.title, results.id, results.organisation.id, results.id);
    }
  } else {
    console.log(err);
  }
}

function renderTransaction(err, result){
  if (err == null && null != result) {
    console.log('Transaction: ' + result.RequestId);
  } else {
    console.log(err);
  }
}