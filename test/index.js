var async = require('async'),
    expect = require('expect.js');

describe('the module', function() {
  var module;
  beforeEach(function() {
    module = new require('../index')({
      multiplexer: function(items) {
        return items.join(',');
      },
      demultiplexer: function(item, index, result) {
        return result[index];
      },
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
  });

  it('receives the correct results', function(done) {
    async.map([1,2,3,4], function(item, callback) {
      module.handleItem(item, callback);
    },
    function cb(err, results) {
      if(err) return done(err);

      expect(results).to.eql([1,4,9,16]);
      done();
    });
  });
  it('still runs after the timeout but items < maxItems', function(done) {
    async.map([1,2], function(item, callback) {
      module.handleItem(item, callback);
    },
    done);
  });
});

// vim: set et sw=2 ts=2 colorcolumn=80:
