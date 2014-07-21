work-batcher
==========

Module to handle batching/aggregation of work with a timeout. E.g. batching
requests to an API where you can stuff the payload will multiple queries.

You need to provide a worker.  When either the timeout expires or we have
enough items, the worker will be called. A function to multiplex the results
together for the worker should be provided, as well as a function to
demultiplex the results in the response.

# Usage
```javascript

var batch = require('work-batcher'),
    async = require('async'),
    expect = require('expect.js');

// Call this to init the module.
batch.init({
  // Will assemble the individual payloads into one payload for the worker when
  //  it is time to call it.
  multiplexer: function(items) {
    return items.join(',');
  },
  // Will dis-assemble the result into individual results when the worker gives
  // us a result.
  demultiplexer: function(item, index, result) {
    return result[index];
  },
  // The worker to call.  called when we have maxItems or timeout occurs.
  worker: function(data, callback) {
    var result = {};
    data.split(',').forEach(function(item, index) {
      result[index] = item * item;
    });
    callback(null, result);
  },
  maxItems: 3,
  timeout: 500
});

/**
 * Simple example involving a worker function that returns the squares of each
 * element in the array.
 */
async.map([1,2,3,4], function(item, callback) {
  module.handleItem(item, callback);
},
function cb(err, results) {
  if(err) return done(err);

  expect(results).to.eql([1,4,9,16]);
  done();
});
```
