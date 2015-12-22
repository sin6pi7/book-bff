'use strict';

const request = require('good-guy-http')({
  maxRetries: 3,
  json: true
});
const jp100 = require('jsonpath');

module.exports = (req, res, next) => {
  const isbn = req.params.isbn;

  const detailsPromise = request(`https://tspdyqxhrd.localtunnel.me/book?isbn=${isbn}`);
  const countPromise = request(`https://book-inventory-jm.herokuapp.com/stock/${isbn}`);

  Promise.all([detailsPromise, countPromise])
    .then((data) => {
      const title = jp100.query(data[0], '$..title');
      const thumbnail = jp100.query(data[0], '$..thumbnail');
      const count = jp100.query(data[1], '$..count');

      res.render('book', {
        title,
        thumbnail,
        count,
        partials: {
          layout: 'layout'
        }
      });
    })
    .catch((errs) => {
      next(errs);
    });
  };