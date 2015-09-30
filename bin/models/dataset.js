var Organisation = require('./organisation.js');

function Dataset(orgid, id, title) {
  this.organisation = new Organisation(orgid);
  this.id = id;
  this.title = title;
}

module.exports = Dataset;