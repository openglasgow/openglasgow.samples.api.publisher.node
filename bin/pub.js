#!/usr/bin/env node

// initialise module dependencies
var program = require('commander');

program
  .version('0.0.1')
  .command('organisations', 'Organisations operations to this user')
  .command('datasets', 'Datsets operations to this organisation')
  .command('resources', 'Resource operations to this dataset')
  .parse(process.argv);