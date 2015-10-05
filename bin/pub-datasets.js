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
      query();
      break;
    default:
      console.error('You must enter a command: --cmd <create | read | update | delete | list | query>');
  }
}

// List all datasets from a specified organisation
function list() {
  publisher.getPublishedDatasets(program.org, render);
}

// Searches datasets
function query() {

  // search by matching key and value
  if (program.key != null && program.val != null) {
    publisher.searchDatasetsByKeyAndValue(program.key, program.val, render);
  }

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

    var ojson = null;
    if (program.json != null) {
      ojson = JSON.parse(program.json);
    } else if (program.xjson != null) {

    }

    // get the json and continue
    if (program.json != null) {
      publisher.changeDataset(program.org, program.ds, JSON.parse(program.json), renderTransaction);
    }
    if (program.xjson != null) {
      fs.readFile(program.xjson, 'utf8', function (err, data) {
        if (err) throw err;
        publisher.changeDataset(program.org, program.ds, JSON.parse(data), renderTransaction);
      });
    }
  }

  // update a specific key
  if (program.key != null && program.val != null) {

    publisher.changeDatasetKeyValue(program.org, program.ds, program.key, program.val, renderTransaction);
  }
}


function render(err, results) {
  if (err == null && null != results) {
    if (Array.isArray(results)) {
      results.forEach(function (result) {
        //console.log('%s [%s] \nOrg=[%s] \nDataset=[%s]', result.title, result.id, result.dataset.organisation.id, result.dataset.id);
        console.log('%s [%s] \nOrg=[%s]', result.title, result.id, result.organisation.id);
      });
    } else {
      console.log('%s [%s] \nOrg=[%s]', results.title, results.id, results.organisation.id);
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