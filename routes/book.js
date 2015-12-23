'use strict';

const request = require('good-guy-http')({
  maxRetries: 3,
  json: true
});

const jp100 = require('jsonpath');
const ESI = require('nodesi');

module.exports = (req, res, next) => {
  const isbn = req.params.isbn;

  request(`https://book-catalog-proxy.herokuapp.com/book?isbn=${isbn}`)
    .then((data) => {
      const title = jp100.query(data, '$..title');
      const thumbnail = jp100.query(data, '$..thumbnail');

      return new Promise((resolve, reject) => {
        req.app.render('book', {
          title,
          thumbnail,
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
        cache: false,
        onError: (src, error) => `<!-- GET ${src} resulted with ${error} -->`
      });

      return esi.process(html, {
        headers: {
          Accept: 'text/html'
        }
      });
    })
    .then(html => res.send(html))
    .catch((errs) => {
      next(errs);
    });
};