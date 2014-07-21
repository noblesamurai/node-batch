var _ = require('lodash');

var multiplexer, // called to create payload from items
    demultiplexer, // called to extract individual results from response
    items, //  hold items and their callbacks
    maxItems, timeout,  timer; // parameters

exports.init = function(options) {
  multiplexer = options.multiplexer;
  demultiplexer = options.demultiplexer;
  worker = options.worker;
  maxItems = options.maxItems;
  timeout = options.timeout;

  resetState();
};

exports.handleItem = function(itemPayload, callback) {
  items.push({
    payload: itemPayload,
    callback: callback
  });
  if (items.length === maxItems) {
        flush();
  } else if (items.length === 1) {
    // We are prepared to wait up until timeout for other items.
    timer = setTimeout(flush, timeout);
  }
};

function resetState() {
  items = [];
  clearTimeout(timer);
}

function flush() {
  var myItems = items;
  resetState();

  var payload = multiplexer(_.pluck(myItems, 'payload'));
  worker(payload, issueCallbacks);

  function issueCallbacks(err, result) {
    myItems.forEach(function(item, index) {
      if (err) return item.callback(err);

      item.callback(err, demultiplexer(item.payload, index, result));
    });
  }
}

// vim: set et sw=2 ts=2 colorcolumn=80:
