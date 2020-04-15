import { Matrix } from 'ml-matrix';
import LogisticRegression from 'ml-logistic-regression';

export const logit = (timeSeries, daysToPredict = 10) => {
  /*
  const dates = Object.keys(timeSeries);
  const X = new Matrix(dates.length, 1);
  let counter = 0;
  const values = [];
  dates.forEach(date => {
    counter += 1;
    X.addRowVector([counter]);
    values.push(timeSeries[date]);
  });
  const Y = Matrix.columnVector(values);
  const predictX = [];
  for (let i = 0; i < daysToPredict; i += 1) {
    predictX.push(counter + i);
  }
  */
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
  X.transposeView();
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

  const logreg = new LogisticRegression({ numSteps: 1000, learningRate: 5e-3 });
  logreg.train(X, Y);
  const prediction = logreg.predict(Xtest);
  return prediction;
};
