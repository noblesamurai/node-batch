var multiplexer, // called to create payload from items
    demultiplexer, // called to extract individual results from response
    demuxKeys, items, callbacks, // hold keys, items, callbacks
    maxItems, timeout,  timer; // parameters

exports.init = function(options) {
  multiplexer = options.multiplexer;
  demultiplexer = options.demultiplexer;
  worker = options.worker;
  maxItems = options.maxItems;
  timeout = options.timeout;

  resetState();
};

exports.handleItem = function(key, itemPayload, callback) {
  demuxKeys.push(key);
  items.push(itemPayload);
  callbacks.push(callback);
  if (items.length === maxItems) {
        flush();
  } else if (items.length === 1) {
    // We are prepared to wait up until timeout for other items.
    timer = setTimeout(flush, timeout);
  }
};

function resetState() {
  demuxKeys = [];
  items = [];
  callbacks = [];
}

function flush() {
  var myDemuxKeys = demuxKeys,
      myItems = items,
      myCallbacks = callbacks;

  resetState();

  clearTimeout(timer);
  var payload = multiplexer(myItems);
  worker(payload, issueCallbacks);

  function issueCallbacks(err, result) {
    myCallbacks.forEach(function(callback, index) {
      callback(err, demultiplexer(myDemuxKeys[index], result));
    });
  }
}

// vim: set et sw=2 ts=2 colorcolumn=80:
