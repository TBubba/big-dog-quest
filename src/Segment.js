'use strict';
// Import(s)
//var ... = require('...');

// Constructor
var Segment = function(key, start, end, paths) {
  this.key   = key   || '';
  this.start = start || 0;
  this.end   = end   || 0;
  this.paths = (paths) ? paths.slice() : [];
}

// Export(s)
module.exports = Segment;
