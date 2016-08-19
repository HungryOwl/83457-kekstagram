//
// humgat/module3-task2.js
//

var humgat = require('./utils/humgat.js').create();
var fs = require('fs');

require('./utils/humgat-common.js')(humgat);

var clipRect = {
  form: {
    left: 269, top: 572,
    width: 582, height: 62
  }
};

var selector = {
  fileUpload: '#upload-file',
  resizeX: '#resize-x',
  resizeY: '#resize-y',
  resizeSize: '#resize-size'
};

humgat.on('page.open.success', function() {
  var config = this.config;
  var afterFileRead = function() {
    this.emit('need.validation', 0, 0, 150);
    this.emit('need.validation', -10, 0, 150);
    this.emit('need.validation', 0, 100, 150);
    this.emit('need.validation', 0, 0, 250);

    this.emit('suite.done');
  };

  this.page.uploadFile(selector.fileUpload, fs.workingDirectory + '/tests/img/black.png');
  this.setClipRect(clipRect.form);

  setTimeout(afterFileRead.bind(this), 500);
}).on('need.validation', function(x, y, size) {
  this.dom.css('.upload-form-controls', {'background-color': 'rgba(0, 0, 0, 1)'});

  this.dom.fillIn(selector.resizeX, '' + x);
  this.dom.fillIn(selector.resizeY, '' + y);
  this.dom.fillIn(selector.resizeSize, '' + size);
  this.renderStep();
}).run();
