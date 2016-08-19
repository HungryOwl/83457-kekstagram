//
// humgat/module4-task1.js
//

var humgat = require('./utils/humgat.js').create();

require('./utils/humgat-common.js')(humgat);
require('./utils/humgat/redirects.js')(humgat);

humgat.redirects({
  urlPattern: '//up.htmlacademy.ru/assets/js_intensive/jsonp/pictures.js',
  file: 'jsonp.js'
}).on('page.open.success', function() {
  this.setClipRect(0, 0, 1120, 837);

  this.dom.css('.upload', {visibility: 'hidden'});

  humgat.renderStep();
  humgat.emit('suite.done');
  humgat.exit(0);
}).run();
