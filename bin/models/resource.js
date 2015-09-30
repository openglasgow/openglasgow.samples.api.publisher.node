var Dataset = require('./dataset.js');
var Organisation = require('./organisation.js');

function Resource(orgid, dsid, id, title) {
  this.dataset = new Dataset(orgid, dsid);
  this.id = id;
  this.title = title;
}

module.exports = Resource;