/**
 * Test injectors
 */

import {
  getDaysApart,
  dateToTitle,
  prevDateTitle,
  nextDateTitle,
} from '../dateUtils';

describe('checkStore', () => {
  it('Test getDaysApart', () => {
    const day1 = new Date();
    const day2 = new Date();
    day2.setDate(day1.getDate() + 2);
    expect(getDaysApart(dateToTitle(day1), dateToTitle(day2))).toBe(2);
  });

  it('Test prevDateTitle', () => {
    expect(prevDateTitle('3/1/20')).toBe('2/29/20');
  });

  it('Test nextDateTitle', () => {
    expect(nextDateTitle('2/29/20')).toBe('3/1/20');
  });
});
