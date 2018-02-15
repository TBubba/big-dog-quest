'use strict';
// Import(s)
//var ... = require('...');

// Constructor
var SegmentManager = function() {
  this.segments = Object.create(null); // [key] = Segment
  this.current  = '';
  this.previous = '';
}

SegmentManager.prototype.add = function(segment) {
  this.segments[segment.key] = segment;
  return segment;
}

SegmentManager.prototype.get = function(key) {
  return this.segments[key] || null;
}

// Sets a random segment from the current segments paths array as the current ("walk down that path")
SegmentManager.prototype.next = function() {
  var prev = this.current;
  this.current = getRandomFromArrayExcept(this.getCurrent().paths, this.previous);
  //console.log('next:', this.previous, '|', prev, '|', this.current);
  this.previous = prev;
}

// Sets the current segment to a random one
SegmentManager.prototype.setRandomCurrent = function() {
  var prev = this.current;
  this.current = getRandomFromObjectExcept(this.segments, this.previous).key;
  //console.log('random:', this.previous, '|', prev, '|', this.current);
  this.previous = prev;
}

SegmentManager.prototype.getCurrent = function() {
  return this.segments[this.current] || null;
}

SegmentManager.prototype.getPrevious = function() {
  return this.segments[this.previous] || null;
}

// Returns a random element from an array, except for the element with the same value as "except"
function getRandomFromArrayExcept(array, except) {
  var index = Math.floor(Math.random() * (array.length-1));
  if (array[index] === except) { index++; }
  return array[index];
}

// Returns a random property of an object, except for the property with the same key as "except"
function getRandomFromObjectExcept(object, except) {
  var keys = Object.keys(object);
  var index = (keys.length-1) * Math.random() << 0;
  if (keys[index] === except) { index++; }
  return object[keys[index]];
}

// Export(s)
module.exports = SegmentManager;
