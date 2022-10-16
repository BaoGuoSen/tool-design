const Mock = require('mockjs');

/**
 * mock使用文档
 * @see http://mockjs.com/examples.html
 */

module.exports = {
  'post /api/user/list': (req, res) => {
    const { list } = Mock.mock({
      'list|6-20': [
        {
          id: '@id'
        }
      ]
    });
  }
};