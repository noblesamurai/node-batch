node-batch
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

batch.init({
  multiplexer: function(items) {
    return items.join(',');
  },
  demultiplexer: function(key, result) {
    return result[key];
  },
  worker: function(data, callback) {
    var result = {};
    data.split(',').forEach(function(item) {
      result[item] = item * item;
    });
    callback(null, result);
  },
  maxItems: 3,
  timeout: 500
});

async.map([1,2,3,4], function(item, callback) {
  module.handleItem(item, item, callback);
},
function cb(err, results) {
  if(err) return done(err);

  expect(results).to.eql([1,4,9,16]);
  done();
});
```
