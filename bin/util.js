module.exports = {
  //return an array of objects according to key, value, or key and value matching
  getObjects: function(obj, key, val) {
    var objects = [];
    for (var i in obj) {
      if (!obj.hasOwnProperty(i)) continue;
      if (typeof obj[i] == 'object') {
        objects = objects.concat(this.getObjects(obj[i], key, val));
      } else
      //if key matches and value matches or if key matches and value is not passed (eliminating the case where key matches but passed value does not)
      if (i == key && obj[i] == val || i == key && val == '') { //
        objects.push(obj);
      } else if (obj[i] == val && key == ''){
        //only add if the object is not already in the array
        if (objects.lastIndexOf(obj) == -1){
          objects.push(obj);
        }
      }
    }
    return objects;
  },

  //return an array of values that match on a certain key
  getValues: function(obj, key) {
    var objects = [];
    for (var i in obj) {
      if (!obj.hasOwnProperty(i)) continue;
      if (typeof obj[i] == 'object') {
        objects = objects.concat(this.getValues(obj[i], key));
      } else if (i == key) {
        objects.push(obj[i]);
      }
    }
    return objects;
  },

  //sets all instances of the given key to the new value
  setValues: function(obj, key, newval) {
    for (var i in obj) {
      if (!obj.hasOwnProperty(i)) continue;
      if (typeof obj[i] == 'object') {
        this.setValues(obj[i], key, newval);
      } else if (i == key) {
        obj[i] = newval;
      }
    }
  },

  //return an array of keys that match on a certain value
  getKeys: function(obj, val) {
    var objects = [];
    for (var i in obj) {
      if (!obj.hasOwnProperty(i)) continue;
      if (typeof obj[i] == 'object') {
        objects = objects.concat(this.getKeys(obj[i], val));
      } else if (obj[i] == val) {
        objects.push(i);
      }
    }
    return objects;
  }
};