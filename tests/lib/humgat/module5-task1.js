//
// humgat/module5-task1.js
//

var humgat = require('./utils/humgat.js').create();
var branchName = 'module5-task1';

require('./utils/humgat-common.js')(humgat);
require('./utils/humgat/redirects.js')(humgat);

var selector = {
  filterPopular:   '.filters-item[for$=popular]',
  filterDiscussed: '.filters-item[for$=discussed]'
};

humgat.redirects({
  urlPattern: '//o0.github.io/assets/json/pictures.json',
  file: 'pictures.json'
}).on('resource.redirect', function() {
  this.on('page.loaded', function() {
    this.off('page.loaded');

    var branchConfig = this.config.tasks[branchName];
    var contents = branchConfig.contents;

    this.emit('filter.pictures.check', selector.filterPopular,   contents.popular, 'Популярные');
    this.emit('filter.pictures.check', selector.filterDiscussed, contents.discussed, 'Обсуждаемые');

    this.emit('suite.done');
  });
}).on('filter.pictures.check', function(selector, contents, filterName) {
  this.dom.click(selector, true);

  this.dom.assertEqual(
    contents,
    function() {
      var elements = document.querySelectorAll('.pictures .picture img');
      var src, idx;
      var content = [];

      if(elements) {
        for(var i = 0; i < elements.length; ++i) {
          src = elements[i].src;
          idx = src.indexOf('/', 8);
          content.push(src.substr(idx));
        }
      }

      return content;
    },
    'Сравнение по фильтру `' + filterName + '`');
}).run();
