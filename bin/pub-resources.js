#!/usr/bin/env node

var program = require('commander');
var publisher = require('./publisher.js');
var myutil = require('./util.js');
var fs = require('fs');

program
  .option('-c, --cmd <create | read | update | delete | list | query>', 'command to execute')
  .option('-o, --org <guid>', 'organisation guid')
  .option('-ds, --ds <guid>', 'dataset guid')
  .option('-r, --res <guid>', 'resource guid')
  .option('-k, --key <string>', 'metadata key name')
  .option('-v, --val <string>', 'metadata value text')
  .option('-json, --json <string>', 'json string')
  .option('-xjson, --xjson <string>', 'path to json file')
  .option('-up, --upload <string>', 'path to resource to upload')
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
      create();
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

  if (program.org == null || program.ds == null) {
    console.log('You must specify an org id and dataset id.');
    return;
  }

  publisher.getPublishedResources(program.org, program.ds, render);
}

// Reads the metadata of a specific resource (but does not download the file)
function read() {

  if (program.org == null || program.ds == null || program.res == null) {
    console.log('You must specify an org id, dataset id and resource id.');
    return;
  }

  publisher.getPublishedResource(program.org, program.ds, program.res, render);

}

// Creates file resources with the specified json
function create() {
  var json = null;

  if (program.org == null || program.ds == null) {
    console.log('You must specify an org id and dataset id.');
    return;
  }

  // check we have something to create
  if (program.json == null && program.xjson == null) {
    console.log('You must specify some json metadata data to create.');
    return;
  }

  // create a fragment
  if (program.json != null) {
    completeCreate(JSON.parse(program.json), program.upload);
  }
  if (program.xjson != null) {
    fs.readFile(program.xjson, 'utf8', function (err, data) {
      if (err) throw err;
      completeCreate(JSON.parse(data), program.upload);
    });
  }
}

// Updates a file resource with the specified json
function update() {
  var json = null;

  if (program.org == null || program.ds == null || program.res == null) {
    console.log('You must specify an org id, dataset id and resource id.');
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
    publisher.getPublishedResource(program.org, program.ds, program.res, function(err, result){

      // the metadata is a subset of the response
      var metadata = result.MetadataResultSet.FileMetadata;

      // change the key to the new value
      myutil.setValues(metadata, program.key, program.val);

      // send back to the server
      publisher.updateResource(program.org, program.ds, program.res, metadata, renderTransaction);

    }, true);
  }
}

function completeCreate(json, file) {

  if (file != null) {
    publisher.createResourceWithFile(program.org, program.ds, json, file, renderTransaction);
  } else {
    publisher.createResource(program.org, program.ds, json, renderTransaction);
  }
}

function completeUpdate(json, file) {

  if (file != null) {
    publisher.updateResourceWithFile(program.org, program.ds, program.res, json, file, renderTransaction);
  } else {
    publisher.updateResource(program.org, program.ds, program.res, json, renderTransaction);
  }
}

function render(err, results) {

  if (err == null && null != results) {
    if (Array.isArray(results)) {
      results.forEach(function (result) {
        console.log('%s [%s] \nOrg=[%s] \nDataset=[%s]', result.title, result.id, result.dataset.organisation.id, result.dataset.id);
      });
    } else {
      console.log('%s [%s] \nOrg=[%s] \nDataset=[%s]', results.title, results.id, results.dataset.organisation.id, results.dataset.id);
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