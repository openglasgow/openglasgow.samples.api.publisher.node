#!/usr/bin/env node

var program = require('commander');
var publisher = require('./publisher.js');

program
  .option('-c, --cmd <create | read | update | delete | list | query>', 'command to execute')
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

// List all organisations this user manages
function list() {
  var ds = publisher.getOrganisations(render);
}

function render(err, results) {

  if (err == null && null != results) {
    results.forEach(function (result) {
      console.log('%s [%s]', result.name, result.id);
    });
  } else {
      console.log(err);
  }
}