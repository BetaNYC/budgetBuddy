var autoload, fs;

fs = require('fs');

exports.autoload = autoload = function(dir, app) {
  return fs.readdirSync(dir).forEach(function(file) {
    var path, stats, _base;
    path = "" + dir + "/" + file;
    stats = fs.lstatSync(path);
    if (stats.isDirectory()) {
      return autoload(path, app);
    } else {
      return typeof (_base = require(path)) === "function" ? _base(app) : void 0;
    }
  });
};

Array.prototype.last = function() {
  return this[this.length - 1];
};

String.prototype.capitalize = function() {
  return this.replace(/(?:^|\s)\S/g, function(a) {
    return a.toUpperCase();
  });
};

String.prototype.classify = function(str) {
  var classified, word, words, _i, _len;
  classified = [];
  words = str.split('_');
  for (_i = 0, _len = words.length; _i < _len; _i++) {
    word = words[_i];
    classified.push(word.capitalize());
  }
  return classified.join('');
};

exports.output = function(obj, res, format) {
  if (obj.length === 0) {
    return res.send(404, "not found");
  } else {
    switch (format) {
      case "json":
        res.type("application/json");
        return res.send(obj);
    }
  }
};
