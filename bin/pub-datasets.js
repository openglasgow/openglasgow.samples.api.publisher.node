#!/usr/bin/env node

var program = require('commander');
var publisher = require('./publisher.js');

program
  .option('-c, --cmd <create | read | update | delete | list | query>', 'command to execute')
  .option('-o, --org <guid>', 'organisation guid')
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
  var ds = publisher.getPublishedDatasets(program.org, render);
}

function render(err, results) {
  if (err == null && null != results) {
    results.forEach(function (result) {
      console.log('%s [%s] \nOrg=[%s]', result.title, result.id, result.organisation.id);
    });
  } else {
    console.log(err);
  }
}