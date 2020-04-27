// import { Matrix } from 'ml-matrix';
// import LogisticRegression from 'ml-logistic-regression';

export const logit = () => {};
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
  const logreg = new LogisticRegression({ numSteps: 1000, learningRate: 5e-3 });
  logreg.train(X, Y);
  const prediction = logreg.predict(Xtest);
  return prediction;
*/
