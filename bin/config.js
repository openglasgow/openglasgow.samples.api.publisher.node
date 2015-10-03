var config = {};

// properties
config.Authbase = 'https://login.windows.net/';
config.TenantId = 'open.glasgow.gov.uk';
config.ResourceId = 'http://GCCCTPECServicesPrep.cloudapp.net:8080/';
config.ClientId = ''; //api connector
config.ClientKey = '';  //api connector
config.SubscriptionKey = ''; //api connector

// The access token can be used for calls that require an Authorisation Code rather than Client Credentials
// You can get this from the Azure API portal for now and it will expire after a few hours.
config.AccessToken = '';

module.exports = config;