//
// humgat/module3-task3.js
//

var humgat = require('./utils/humgat.js').create();

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
  resizeSize: '#resize-size',
  resizeFwd: '#resize-fwd',
  chrome: 'label[for$=chrome]'
};

humgat.on('page.open.success', function() {
  this.emit('need.upload');
  setTimeout(function() {
    humgat.emit('file.read.first-time');
  }, 200);
}).on('need.upload', function() {
  this.uploadFile(selector.fileUpload, '/tests/img/black.png');
}).on('need.resize', function() {
  this.dom.fillIn(selector.resizeX, 0);
  this.dom.fillIn(selector.resizeY, 0);
  this.dom.fillIn(selector.resizeSize, 150);

  this.dom.click(selector.resizeFwd);
}).on('file.read.first-time', function() {
  this.emit('need.resize');
  setTimeout(function() {
    humgat.dom.click(selector.chrome);
    humgat.emit('need.reload');
  }, 200);
}).on('need.reload', function() {
  this.on('page.loaded', function() {
    this.emit('need.upload');
    setTimeout(function() {
      humgat.emit('file.read.second-time');
    }, 200);
  });

  this.page.reload();
}).on('file.read.second-time', function() {
  this.emit('need.resize');

  setTimeout(function() {
    humgat.setClipRect(clipRect.form);
    humgat.dom.css('.upload-form-controls', {'background-color': 'rgba(0, 0, 0, 1)'});
    humgat.renderStep();

    humgat.assertEqual(
      'chrome',
      humgat.getCookie('upload-filter').value,
      'Кука `upload-filter` должна иметь значение `chrome`'
    );

    humgat.emit('suite.done');
  }, 200);
}).run();
