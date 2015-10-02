// publisher.js

var config = require('./config');
var OAuth = require('adal-node');
var request = require('request');
var util = require('util');
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
const API_READ_ENDPOINT_LIST_ORGANISATION_DATASET_RESOURCES = API_READ_ENDPOINT_LIST_ORGANISATION_DATASETS + "/%s/Files";
const API_READ_ENDPOINT_LIST_ORGANISATION_DATASET_RESOURCE = API_READ_ENDPOINT_LIST_ORGANISATION_DATASET_RESOURCES + "/%s";

const API_WRITE_ENDPOINT_ORGANISATION_DATASET_RESOURCE_CREATE = API_READ_ENDPOINT_LIST_ORGANISATION_DATASET_RESOURCES;
const API_WRITE_ENDPOINT_ORGANISATION_DATASET_RESOURCE_NEW_VERSION = API_READ_ENDPOINT_LIST_ORGANISATION_DATASET_RESOURCES + "/%s";

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
  // Gets the files for a given dataset
  getPublishedResources: function(orgid, dsid, render){
    console.log('Getting all resources for ' + dsid);

    var uri = util.format(API_READ_ENDPOINT + API_READ_ENDPOINT_LIST_ORGANISATION_DATASET_RESOURCES, orgid, dsid);

    // make the get request
    this._doGet(uri, function (err, json) {

      var result = [];

      // create entities from the json returned
      for (var k in json.MetadataResultSet) {
        result.push(new Resource(orgid, dsid, json.MetadataResultSet[k].FileId, json.MetadataResultSet[k].Title));
      }

      // now render it
      render(err, result);

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
  }
};