'use strict';

const request = require('good-guy-http')({
  maxRetries: 3,
  json: true
});
const jp100 = require('jsonpath');
const ESI = require('nodesi');

module.exports = (req, res, next) => {
  const isbn = req.params.isbn;

  const detailsPromise = request(`https://tspdyqxhrd.localtunnel.me/book?isbn=${isbn}`);
  const countPromise = request(`https://book-inventory-jm.herokuapp.com/stock/${isbn}`);

  Promise.all([detailsPromise, countPromise])
    .then((data) => {
      const title = jp100.query(data[0], '$..title');
      const thumbnail = jp100.query(data[0], '$..thumbnail');
      const count = jp100.query(data[1], '$..count');

      return new Promise((resolve, reject) => {
        req.app.render('book', {
          title,
          thumbnail,
          count,
          partials: {
            layout: 'layout'
          }
        }, (err, html) => {
          if (err) reject(err);
          resolve(html);
        });
      });
    })
    .then(html => {
      const esi = new ESI({
        onError: (src, error) => `<!-- GET ${src} resulted with ${error} -->`
      });

      return esi.process(html);
    })
    .then(html => res.send(html))
    .catch((errs) => {
      next(errs);
    });
};