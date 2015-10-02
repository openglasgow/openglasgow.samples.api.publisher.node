#!/usr/bin/env node

var program = require('commander');
var publisher = require('./publisher.js');
var fs = require('fs');

program
  .option('-c, --cmd <create | read | update | delete | list | query>', 'command to execute')
  .option('-o, --org <guid>', 'organisation guid')
  .option('-ds, --ds <guid>', 'dataset guid')
  .option('-r, --res <guid>', 'resource guid')
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
  publisher.getPublishedResources(program.org, program.ds, render);
}

// Updates a file resource with the specified json
function update() {
  var json = null;

  if ((program.json == null && program.xjson == null) || program.org == null || program.ds == null || program.res == null) {
    console.log('You must specify an org id, dataset id, resource id and some json data to update.');
  }

  // get the json and continue
  if (program.json != null) { completeUpdate(program.json); }
  if (program.xjson != null) {
    fs.readFile(program.xjson, 'utf8', function (err, data) {
      if (err) throw err;
      completeUpdate(data);
    });
  }
}

function completeUpdate(json) {

  publisher.updateResource(program.org, program.ds, program.res, json, function(err, result) {
    console.log('TransactionId : ' + result.transactionId)
  });
}

function render(err, results) {

  if (err == null && null != results) {
    results.forEach(function (result) {
      console.log('%s [%s] \nOrg=[%s] \nDataset=[%s]', result.title, result.id, result.dataset.organisation.id, result.dataset.id);
    });
  } else {
    console.log(err);
  }
}