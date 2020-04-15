/**
 * Tests for regression.js
 */

import LogisticRegression from 'ml-logistic-regression';
import { logit } from '../regression';

describe('regression', () => {
  it('Test logit regression', () => {
    const timeSeries = {
      '1/22/20': 1,
      '1/23/20': 1,
      '1/24/20': 2,
      '1/25/20': 2,
      '1/26/20': 5,
      '1/27/20': 5,
      '1/28/20': 5,
      '1/29/20': 5,
      '1/30/20': 5,
      '1/31/20': 7,
      '2/1/20': 8,
      '2/2/20': 8,
      '2/3/20': 11,
      '2/4/20': 11,
      '2/5/20': 11,
      '2/6/20': 11,
      '2/7/20': 11,
      '2/8/20': 11,
      '2/9/20': 11,
      '2/10/20': 11,
      '2/11/20': 12,
      '2/12/20': 12,
      '2/13/20': 13,
      '2/14/20': 13,
      '2/15/20': 13,
      '2/16/20': 13,
      '2/17/20': 13,
      '2/18/20': 13,
      '2/19/20': 13,
      '2/20/20': 13,
      '2/21/20': 15,
      '2/22/20': 15,
      '2/23/20': 15,
      '2/24/20': 15,
      '2/25/20': 15,
      '2/26/20': 15,
      '2/27/20': 16,
      '2/28/20': 16,
      '2/29/20': 24,
      '3/1/20': 30,
      '3/2/20': 53,
      '3/3/20': 73,
      '3/4/20': 104,
      '3/5/20': 172,
      '3/6/20': 217,
      '3/7/20': 336,
      '3/8/20': 450,
      '3/9/20': 514,
      '3/10/20': 708,
      '3/11/20': 1105,
      '3/12/20': 1557,
      '3/13/20': 2147,
      '3/14/20': 2857,
      '3/15/20': 2918,
      '3/16/20': 4307,
      '3/17/20': 6096,
      '3/18/20': 8873,
      '3/19/20': 14094,
      '3/20/20': 19403,
      '3/21/20': 25725,
      '3/22/20': 33634,
      '3/23/20': 43663,
      '3/24/20': 53736,
      '3/25/20': 65778,
      '3/26/20': 83836,
      '3/27/20': 101657,
      '3/28/20': 121465,
      '3/29/20': 140909,
      '3/30/20': 161831,
      '3/31/20': 188172,
      '4/1/20': 213362,
      '4/2/20': 243762,
      '4/3/20': 275582,
      '4/4/20': 308848,
      '4/5/20': 337065,
      '4/6/20': 366660,
      '4/7/20': 396221,
      '4/8/20': 429047,
      '4/9/20': 461432,
      '4/10/20': 496530,
    };
    const prediction = logit(timeSeries, 10);
    console.log(`Prediction is ${JSON.stringify(prediction)}`);
  });

  it('Test logit regression', () => {
    // eslint-disable-next-line global-require
    const { Matrix } = require('ml-matrix');

    // our training set (X,Y)
    const X = new Matrix([
      [0, -1],
      [1, 0],
      [1, 1],
      [1, -1],
      [2, 0],
      [2, 1],
      [2, -1],
      [3, 2],
      [0, 4],
      [1, 3],
      [1, 4],
      [1, 5],
      [2, 3],
      [2, 4],
      [2, 5],
      [3, 4],
      [1, 10],
      [1, 12],
      [2, 10],
      [2, 11],
      [2, 14],
      [3, 11],
    ]);
    const Y = Matrix.columnVector([
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      2,
      2,
      2,
      2,
      2,
      2,
    ]);

    // the test set (Xtest, Ytest)
    const Xtest = new Matrix([
      [0, -2],
      [1, 0.5],
      [1.5, -1],
      [1, 2.5],
      [2, 3.5],
      [1.5, 4],
      [1, 10.5],
      [2.5, 10.5],
      [2, 11.5],
    ]);
    const Ytest = Matrix.columnVector([0, 0, 0, 1, 1, 1, 2, 2, 2]);

    // we will train our model
    const logreg = new LogisticRegression({
      numSteps: 1000,
      learningRate: 5e-3,
    });
    logreg.train(X, Y);

    // we try to predict the test set
    const finalResults = logreg.predict(Xtest);
  });
});
