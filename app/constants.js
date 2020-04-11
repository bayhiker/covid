/*
 * Global constants
 */

const prod = {
  DATA_URL_PREFIX: 'https://youquiz.me/data/covid/us',
};

const dev = {
  DATA_URL_PREFIX: 'http://mike-prodesk/data/covid/us',
};

export const config = process.env.NODE_ENV === 'development' ? dev : prod;
