#!/usr/bin/env node

var program = require('commander');
var publisher = require('./publisher.js');
var myutil = require('./util.js');

program
  .option('-c, --cmd <changeDatasetsKeyValue | changeDatasetResourcesKeyValue | changeResourcesKeyValue>', 'command to execute')
  .option('-o, --org <guid>', 'organisation guid')
  .option('-ds, --ds <guid>', 'dataset guid')
  .option('-k, --key <string>', 'metadata key name')
  .option('-v, --val <string>', 'metadata value text')
  .option('-rk, --rkey <string>', 'metadata key name in resource')
  .option('-rv, --rval <string>', 'metadata value text in resource')
  .option('-nv, --newval <string>', 'metadata value replacement text in the dataset or resource')
  .option('-commit, --commit <boolean>', 'set to true to commit')
  .parse(process.argv);

if (!program.cmd) {
  console.error('You must enter a command: --cmd');
  process.exit(1);
}

// get a token and continue
publisher.getToken(run);

function run(token){

  // store the access token
  publisher.accessToken = token;

  switch(program.cmd){
    case 'changeDatasetsKeyValue':
      changeDatasetsKeyValue();
      break;
    case 'changeDatasetResourcesKeyValue':
      changeDatasetResourcesKeyValue();
      break;
    case 'changeResourcesKeyValue':
      changeResourceKeyValue();
      break;
    default:
      console.error('You must enter a command: --cmd');
  }
}

// scoped to have a reference to an interval
_interval = null;

// Changes all datasets matching the input key/value pairs to the replacement key/value pairs
function changeDatasetsKeyValue() {

  if (program.key == null || program.val == null) {
    console.log('You must specify a key and value to search on.');
    return;
  }

  // Exhaustive search by matching key and value until there are no results that match
  // We need to wait until the index is updated with the changed datasets, so we will wait 30 secs
  // before the next query and use an id cache to ensure we aren't repeating the previous update.
  // Paging won't work as the datasets may be updated and hence change the resultset.
  var timeoutInSeconds = 30;

  // now keep running the query every 30 secs
  _changeDatasetsKeyValue();
  _interval = setInterval(_changeDatasetsKeyValue ,timeoutInSeconds * 1000);
}

function _changeDatasetsKeyValue()
{
  console.log('Running Search ...');

  var results = publisher.searchDatasetsByKeyAndValue(program.key, program.val, function(err, results){
    if (err) throw err;

    // if no results, we're done!
    if (results == null || results.length == 0){
      clearInterval(_interval);
      return;
    }

    // now enumerate results and set the new key
    for (var result in results) {
      console.log('Dataset = ' + results[result].id);
      console.log('Org = ' + results[result].organisation.id);

      if (program.commit == 'true') {
        console.log('Committing Changes.');
        publisher.changeDatasetKeyValue(results[result].organisation.id, results[result].id, program.key, program.newval, renderTransaction);
      } else {
        console.log('Updates not committed. To commit, add the --commit true flag to the call.');
      }
    }

  });
}

// Changes all resources for the specified dataset matching the input key/value pairs to the replacement key/value pairs
function changeDatasetResourcesKeyValue() {

  // get the matching datasets, then enumerate the resources to find the matching key/value pair

  if (program.key == null || program.val == null || program.rkey == null || program.rval == null) {
    console.log('You must specify a key, value, dataset and resource search criteria to search on.');
    return;
  }

  // search a dataset by matching key and value
  publisher.searchDatasetsByKeyAndValue(program.key, program.val, function(err, results) {

    // now go through each dataset, get its resources and match on the metadata
    for (var k in results) (function (k) {
      var dataset = results[k];

      publisher.getPublishedResources(dataset.organisation.id, dataset.id, function(err, json) {

        // now go through, get all versions of the file
        for (var ki in json.MetadataResultSet) (function (ki) {
          var file = json.MetadataResultSet[ki];

          // get the existing resource version metadata - pass in true at the end to get raw json rather than entities
          publisher.getPublishedResource(dataset.organisation.id, dataset.id, file.FileId, function(err, version){

            // the metadata is a subset of the response
            var metadata = version.MetadataResultSet.FileMetadata;
            if (metadata.License == program.rval) {

              //console.log(metadata);

              // change the key to the new value
              myutil.setValues(metadata, program.rkey, program.newval);

              if (program.commit == 'true') {
                console.log('Committing Changes.');
                publisher.changeResource(dataset.organisation.id, dataset.id, file.FileId, file.Version, metadata, renderTransaction);
              } else {
                console.log('Updates not committed. To commit, add the --commit true flag to the call.');
              }

            }
          }, true);

        })(ki);

      }, true);

    })(k);

  });

}

function changeDatasetResourcesKeyValueX() {

  // get the matching datasets, then enumerate the resources to find the matching key/value pair

  if (program.key == null || program.val == null || program.rkey == null || program.rval == null) {
    console.log('You must specify a key, value, dataset and resource search criteria to search on.');
    return;
  }

  // search a dataset by matching key and value
  publisher.searchDatasetsByKeyAndValue(program.key, program.val, function(err, results) {

    // now go through each dataset, get its resources and match on the metadata
    for (var k in results) {
      //console.log(JSON.stringify(results[k]));
      var dataset = results[k];

      publisher.getPublishedResources(dataset.organisation.id, dataset.id, function(err, json) {

        // now go through, get all versions of the file
        for (var ki in json.MetadataResultSet) {
          var file = json.MetadataResultSet[ki];

          console.log('Org = ' + dataset.organisation.id);
          console.log('Dataset = ' + dataset.title);
          console.log('Dataset = ' + dataset.id);
          console.log('File = ' + file.Title);
          //console.log('File = ' + JSON.stringify(file));
          console.log('File = ' + file.FileId);
          console.log('File = ' + file.Version);
throw '';

                                        // get the existing metadata - pass in true at the end to get raw json rather than entities
                                        publisher.getPublishedResource(dataset.organisation.id, dataset.id, file.Version, function(err, version){

                                          console.log(version);
                                          throw 'done';
                                          // the metadata is a subset of the response
                                          var metadata = version.MetadataResultSet.FileMetadata;
                                          console.log(JSON.stringify(metadata));

                                          // change the key to the new value
                                          ///myutil.setValues(metadata, program.key, program.val);

                                          // send back to the server
                                          ///completeUpdate(metadata, null);
                                          //publisher.updateResource(program.org, program.ds, program.res, metadata, renderTransaction);

                                        }, true);
        }

      }, true);
    }

  });

}

// Changes all resources matching the input key/value pairs to the replacement key/value pairs
function changeResourcesKeyValue() {
  throw 'Not Implemented';
}

function renderTransaction(err, result){
  if (err == null && null != result) {
    console.log('Transaction: ' + result.RequestId);
  } else {
    console.log(err);
  }
}