/**
 *
 * Tests for CovidMap
 *
 * @see https://github.com/react-boilerplate/react-boilerplate/tree/master/docs/testing
 *
 */

import React from 'react';
import { render } from 'react-testing-library';
import { IntlProvider } from 'react-intl';
// import 'jest-dom/extend-expect'; // add some helpful assertions

import CovidMap from '../index';
import { DEFAULT_LOCALE } from '../../../i18n';

describe('<CovidMap />', () => {
  /**
   * Unskip this test to use it
   *
   * @see {@link https://jestjs.io/docs/en/api#testskipname-fn}
   */
  it.skip('Should render and match the snapshot', () => {
    const {
      container: { firstChild },
    } = render(
      <IntlProvider locale={DEFAULT_LOCALE}>
        <CovidMap />
      </IntlProvider>,
    );
    expect(firstChild).toMatchSnapshot();
  });
});
