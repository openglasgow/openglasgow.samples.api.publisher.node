// publisher.js

var config = require('./config');
var OAuth = require('adal-node');
var request = require('request');
var util = require('util');
var myutil = require('./util.js');
var fs = require('fs');
var path = require('path')
var _ = require('lomath');

var Organisation = require('./models/organisation.js');
var Dataset = require('./models/dataset.js');
var Resource = require('./models/resource.js');

// define the api endpoints
const API_READ_ENDPOINT = "https://api.open.glasgow.gov.uk/read/";
const API_WRITE_ENDPOINT = "https://api.open.glasgow.gov.uk/write/";
const API_READ_ENDPOINT_LIST_ORGANISATIONS = "Organisations";
const API_READ_ENDPOINT_LIST_ORGANISATION_DATASETS = API_READ_ENDPOINT_LIST_ORGANISATIONS + "/%s/Datasets";
const API_READ_ENDPOINT_LIST_ORGANISATION_DATASET = API_READ_ENDPOINT_LIST_ORGANISATION_DATASETS + "/%s";
const API_READ_ENDPOINT_LIST_ORGANISATION_DATASET_RESOURCES = API_READ_ENDPOINT_LIST_ORGANISATION_DATASETS + "/%s/Files";
const API_READ_ENDPOINT_LIST_ORGANISATION_DATASET_RESOURCE = API_READ_ENDPOINT_LIST_ORGANISATION_DATASET_RESOURCES + "/%s";
const API_READ_ENDPOINT_SEARCH_KEYVALUE = "Datasets?key=%s&value=%s";

const API_WRITE_ENDPOINT_ORGANISATION_DATASET_CHANGE = API_READ_ENDPOINT_LIST_ORGANISATION_DATASET;
const API_WRITE_ENDPOINT_ORGANISATION_DATASET_RESOURCE_CREATE = API_READ_ENDPOINT_LIST_ORGANISATION_DATASET_RESOURCES;
const API_WRITE_ENDPOINT_ORGANISATION_DATASET_RESOURCE_NEW_VERSION = API_READ_ENDPOINT_LIST_ORGANISATION_DATASET_RESOURCES + "/%s";
const API_WRITE_ENDPOINT_ORGANISATION_DATASET_RESOURCE_CHANGE_VERSION = API_WRITE_ENDPOINT_ORGANISATION_DATASET_RESOURCE_NEW_VERSION + '/Version/%s';

module.exports = {
  accessToken:null,
  // Gets the organisations this user is responsible for
  getOrganisations: function(render){

    var uri = API_READ_ENDPOINT + API_READ_ENDPOINT_LIST_ORGANISATIONS;

    // make the get request
    this._doGet(uri, function (err, json) {

      var result = [];

      // create entities from the json returned
      for (var k in json.MetadataResultSet) {
        result.push(new Organisation(json.MetadataResultSet[k].Id, json.MetadataResultSet[k].Title));
      }

      // now render it
      render(err, result);

    });

  },
  // Gets the datasets for a given organisation
  getPublishedDatasets: function(orgid, render){
    console.log('Getting all datasets for ' + orgid);

    var uri = util.format(API_READ_ENDPOINT + API_READ_ENDPOINT_LIST_ORGANISATION_DATASETS, orgid);

    // make the get request
    this._doGet(uri, function (err, json) {

      var result = [];

      // create entities from the json returned
      for (var k in json.MetadataResultSet) {
        result.push(new Dataset(orgid, json.MetadataResultSet[k].Id, json.MetadataResultSet[k].Title));
      }

      // now render it
      render(err, result);

    });
  },
  // Gets the specified dataset
  getPublishedDataset: function(orgid, dsid, render, raw){
    console.log('Getting dataset ' + dsid);

    var uri = util.format(API_READ_ENDPOINT + API_READ_ENDPOINT_LIST_ORGANISATION_DATASET, orgid, dsid);

    // make the get request
    this._doGet(uri, function (err, json) {

        // if raw is set then return the json directly
        if (raw) {
          render(err, json);
        } else {

          var result = new Dataset(orgid, json.MetadataResultSet.Id, json.MetadataResultSet.Title);

          // now render it
          render(err, result);
        }

    });
  },
  // Updates the specified dataset with the json metadata
  changeDataset: function(orgid, dsid, json, done) {

    console.log('Updating dataset ' + dsid);

    if (config.AccessToken == null || config.AccessToken == '') {
      console.log('A valid Authorisation Token is required to make this call. Set this in the config.js');
      return;
    }

    var uri = util.format(API_WRITE_ENDPOINT + API_WRITE_ENDPOINT_ORGANISATION_DATASET_CHANGE, orgid, dsid);

    this._doPutJson(uri, json, done, config.AccessToken);

  },
  // Updates the specified dataset with the key/value metadata
  changeDatasetKeyValue: function(orgid, dsid, key, value, done) {

    console.log('Updating dataset ' + dsid);

    if (config.AccessToken == null || config.AccessToken == '') {
      console.log('A valid Authorisation Token is required to make this call. Set this in the config.js');
      return;
    }

    // store for use in the callback
    var self = this;

    // get the existing metadata - pass in true at the end to get raw json rather than entities
    this.getPublishedDataset(orgid, dsid, function(err, result){

      // the metadata is a subset of the response
      var metadata = result.MetadataResultSet.Metadata;

      // change the key to the new value
      myutil.setValues(metadata, key, value);

      // send back to the server
      //completeUpdate(metadata);

      var uri = util.format(API_WRITE_ENDPOINT + API_WRITE_ENDPOINT_ORGANISATION_DATASET_CHANGE, orgid, dsid);

      console.log('Sending ' + JSON.stringify(metadata));
      self._doPutJson(uri, metadata, done, config.AccessToken);

    }, true); //true to get back raw json rather than entities

  },
  // Gets the files for a given dataset
  getPublishedResources: function(orgid, dsid, render, raw){
    console.log('Getting all resources for ' + dsid);

    var uri = util.format(API_READ_ENDPOINT + API_READ_ENDPOINT_LIST_ORGANISATION_DATASET_RESOURCES, orgid, dsid);

    // make the get request
    this._doGet(uri, function (err, json) {

        // if raw is set then return the json directly
        if (raw) {
          render(err, json);
        } else {

          var result = [];

          // create entities from the json returned
          for (var k in json.MetadataResultSet) {
            result.push(new Resource(orgid, dsid, json.MetadataResultSet[k].FileId, json.MetadataResultSet[k].Title));
          }

          // now render it
          render(err, result);
        }

    });
  },
  // Gets the metdata for a specified resource
  getPublishedResource: function(orgid, dsid, resid, render, raw){
    console.log('Getting resource metdata for ' + resid);

    var uri = util.format(API_READ_ENDPOINT + API_READ_ENDPOINT_LIST_ORGANISATION_DATASET_RESOURCE, orgid, dsid, resid);

    // make the get request
    this._doGet(uri, function (err, json) {

      // if raw is set then return the json directly
      if (raw) {
        render(err, json);
      } else {

        var result = new Resource(orgid, dsid, json.MetadataResultSet.FileMetadata.FileId, json.MetadataResultSet.FileMetadata.Title);

        // now render it
        render(err, result);
      }
    });
  },
  // Creates the specified resource with the json metadata
  createResource: function(orgid, dsid, json, done) {

    console.log('Creating resource in ' + dsid);

    var uri = util.format(API_WRITE_ENDPOINT + API_WRITE_ENDPOINT_ORGANISATION_DATASET_RESOURCE_CREATE, orgid, dsid);

    this._doPostJson(uri, json, done);

  },
  // Creates the specified resource with the json metadata and file
  createResourceWithFile: function(orgid, dsid, json, file, done) {

    console.log('Creating resource with file in ' + dsid);

    var uri = util.format(API_WRITE_ENDPOINT + API_WRITE_ENDPOINT_ORGANISATION_DATASET_RESOURCE_CREATE, orgid, dsid);

    this._doPostData(uri, json, file, done);

  },
  // Updates the specified resource with the json metadata
  updateResource: function(orgid, dsid, resid, json, done) {

    console.log('Updating resource ' + resid);

    var uri = util.format(API_WRITE_ENDPOINT + API_WRITE_ENDPOINT_ORGANISATION_DATASET_RESOURCE_NEW_VERSION, orgid, dsid, resid);

    this._doPostJson(uri, json, done);

  },
  // Updates the specified resource with the json metadata and file
  updateResourceWithFile: function(orgid, dsid, resid, json, file, done) {

    console.log('Updating resource  with file in ' + resid);

    var uri = util.format(API_WRITE_ENDPOINT + API_WRITE_ENDPOINT_ORGANISATION_DATASET_RESOURCE_NEW_VERSION, orgid, dsid, resid);

    this._doPostData(uri, json, file, done);
  },
  // Changes the specified resource with the json metadata
  changeResource: function(orgid, dsid, resid, verid, json, done) {

    console.log('Updating resource ' + resid);

    if (config.AccessToken == null || config.AccessToken == '') {
      console.log('A valid Authorisation Token is required to make this call. Set this in the config.js');
      return;
    }

    var uri = util.format(API_WRITE_ENDPOINT + API_WRITE_ENDPOINT_ORGANISATION_DATASET_RESOURCE_CHANGE_VERSION, orgid, dsid, resid, verid);

    this._doPutJson(uri, json, done, config.AccessToken);

  },
  // Changes the specified resource with the json metadata and file
  changeResourceWithFile: function(orgid, dsid, resid, verid, json, file, done) {

    console.log('Updating resource  with file in ' + resid);

    var uri = util.format(API_WRITE_ENDPOINT + API_WRITE_ENDPOINT_ORGANISATION_DATASET_RESOURCE_CHANGE_VERSION, orgid, dsid, resid, verid);

    this._doPutData(uri, json, file, done, config.AccessToken);
  },
  searchDatasetsByKeyAndValue: function(key, value, render, raw){

    console.log('Searching datasets with ' + key + ' - ' + value);

    var uri = util.format(API_READ_ENDPOINT + API_READ_ENDPOINT_SEARCH_KEYVALUE, key, value);

    // make the get request
    this._doGet(uri, function (err, json) {

      // if raw is set then return the json directly
      if (raw) {
        render(err, json);
      } else {

        console.log('Found ' + json.TotalCount)
        //console.log(JSON.stringify(json))
        var results = [];

        // create entities from the json returned
        for (var k in json.Results) {
          results.push(new Dataset(json.Results[k].Data.OrganisationId, json.Results[k].Key, json.Results[k].Data.Title));
        }

        // now render it
        render(err, results);

      }

    });

  },
  // Looks through the resources in a dataset for matching key and value
  searchResourcesByKeyAndValue: function(ds, key, value, render, raw){

    console.log('Searching resources in ' + ds + ' with ' + key + ' - ' + value);



    var uri = util.format(API_READ_ENDPOINT + API_READ_ENDPOINT_SEARCH_KEYVALUE, key, value);

    // make the get request
    this._doGet(uri, function (err, json) {

      // if raw is set then return the json directly
      if (raw) {
        render(err, json);
      } else {

        console.log('Found ' + json.TotalCount)
        console.log(JSON.stringify(json))
        var result = [];

        // create entities from the json returned
        for (var k in json.Results) {
          result.push(new Dataset(json.Results[k].Data.OrganisationId, json.Results[k].Key, json.Results[k].Data.Title));
        }

        // now render it
        render(err, result);

      }

    });

  },
  getToken: function(requestComplete) {

    // get an auth context for the specified tenant
    var oauth = new OAuth.AuthenticationContext(config.Authbase + config.TenantId);

    // now get an access token
    oauth.acquireTokenWithClientCredentials(config.ResourceId,
      config.ClientId,
      config.ClientKey,
      function (err, response) {
        if (err) {
          console.log('Error: ' + err.stack);
          throw err;
        } else {

          requestComplete(response.accessToken);
        }
      });
  },
  // Private Functions
  _doGet: function(uri, callback) {

    try {
      // make the http request
      request.get(uri, {
          auth: {
            bearer: this.accessToken
          },
          qs: {
            'subscription-key': config.SubscriptionKey
          },
        }, function (err, res, body) {
          if (res.statusCode != 200) {
            err = res;
          }

          // get the json string into an object
          callback(err, JSON.parse(body));
        }
      );
    } catch (e){
      console.log(e);
      throw e;
    }
  },
  _doPost: function(uri, callback) {

    // make the http request
    request.post(uri, {
        auth: {
          bearer: this.accessToken
        },
        qs: {
          'subscription-key': config.SubscriptionKey
        },
      }, function (err, res, body) {
        if (res.statusCode != 200) {
          err = res;
        }

        // get the json string into an object
        callback(err, JSON.parse(body));
      }
    );
  },
  // Posts form data as part of the post
  _doPostData: function(uri, json, file, callback) {

    // a bug in form-data means it doesn't support nested json, so we need to flatten it
    var f = _.flattenJSON(json);

    // format for posting multi-part content
    var data = {
      body: JSON.stringify(f),
      content: {
        value: fs.createReadStream(file),
        options: {
          filename: path.basename(file)
        }
      }
    };

    // make the http request
    request.post(uri, {
        auth: {
          bearer: this.accessToken
        },
        qs: {
          'subscription-key': config.SubscriptionKey
        },
        formData: data
      }, function (err, res, body) {
        if (res.statusCode != 200) {
          err = res;
        }

        // get the json string into an object
        callback(err, JSON.parse(body));
      }
    );
  },
  _doPutData: function(uri, json, file, callback, token) {

    console.log('Making call to ' + uri);

    // we can override passing a token in - needed for some calls that use an authorisation token
    var t = this.accessToken;
    if (token != null) t = token;


    // a bug in form-data means it doesn't support nested json, so we need to flatten it
    var f = _.flattenJSON(json);

    // format for posting multi-part content
    var data = {
      body: JSON.stringify(f),
      content: {
        value: fs.createReadStream(file),
        options: {
          filename: path.basename(file)
        }
      }
    };

    // make the http request
    request.put(uri, {
        auth: {
          bearer: t
        },
        qs: {
          'subscription-key': config.SubscriptionKey
        },
        formData: data
      }, function (err, res, body) {
        if (res.statusCode != 200) {
          err = res;
        }

        // get the json string into an object
        callback(err, JSON.parse(body));
      }
    );
  },
  _doPostJson: function(uri, json, callback) {

    console.log('Making call to ' + uri);

    // make the http request
    request.post(uri, {
        auth: {
          bearer: this.accessToken
        },
        qs: {
          'subscription-key': config.SubscriptionKey
        },
        json: true,
        body: json
      }, function (err, res, body) {
        if (res.statusCode != 200) {
          err = res;
        }


        // get the json string into an object
        callback(err, body);
      }
    );
  },
  _doPutJson: function(uri, json, callback, token) {

    console.log('Making call to ' + uri);

    // we can override passing a token in - needed for some calls that use an authorisation token
    var t = this.accessToken;
    if (token != null) t = token;

    // make the http request
    request.put(uri, {
        auth: {
          bearer: t
        },
        qs: {
          'subscription-key': config.SubscriptionKey
        },
        json: true,
        body: json
      }, function (err, res, body) {
        if (res.statusCode != 200) {
          err = res;
        }


        // get the json string into an object
        callback(err, body);
      }
    );
  }
};