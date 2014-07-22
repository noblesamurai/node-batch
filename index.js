var _ = require('lodash');

module.exports = function(options) {
  if (!(options.maxItems && options.timeout && options.multiplexer &&
        options.demultiplexer && options.worker)) throw new Error('missing option');
  var items = [],
      timer;

  var obj = {};

  obj.handleItem = function(itemPayload, callback) {
    items.push({
      payload: itemPayload,
      callback: callback
    });
    if (items.length === options.maxItems) {
      flush();
    } else if (items.length === 1) {
      // We are prepared to wait up until timeout for other items.
      timer = setTimeout(flush, options.timeout);
    }
  };

  function resetState() {
    items = [];
    clearTimeout(timer);
  }

  function flush() {
    var myItems = items;
    resetState();

    var payload = options.multiplexer(_.pluck(myItems, 'payload'));
    options.worker(payload, issueCallbacks);

    function issueCallbacks(err, result) {
      myItems.forEach(function(item, index) {
        if (err) return item.callback(err);

        item.callback(err, options.demultiplexer(item.payload, index, result));
      });
    }
  }
  return obj;
};
// vim: set et sw=2 ts=2 colorcolumn=80:
