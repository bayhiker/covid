import { createSelector } from 'reselect';
import { initialState } from './reducer';
import {
  makeSelectUserData,
  makeSelectLoading,
  makeSelectSuccessMessage,
  makeSelectErrorMessage,
} from '../../utils/dialogState';

/**
 * Direct selector to the HomePage state domain
 */

const selectHomePageDomain = state => state.homePage || initialState;

/**
 * Other specific selectors
 */

/**
 * Default selector used by HomePage
 */

const makeSelectHomePage = () =>
  createSelector(
    selectHomePageDomain,
    substate => substate,
  );

const makeSelectHomeLoading = () => makeSelectLoading(selectHomePageDomain);

const makeSelectHomeSuccessMessage = () =>
  makeSelectSuccessMessage(selectHomePageDomain);

const makeSelectHomeErrorMessage = () =>
  makeSelectErrorMessage(selectHomePageDomain);

const makeSelectHomeSearchWith = () =>
  makeSelectUserData(selectHomePageDomain, 'search');

const makeSelectHomeColorMapBy = () =>
  makeSelectUserData(selectHomePageDomain, 'colorMapBy');

const makeSelectHomeColorMapPerCapita = () =>
  makeSelectUserData(selectHomePageDomain, 'colorMapPerCapita');

const makeSelectHomeColorMapNewCases = () =>
  makeSelectUserData(selectHomePageDomain, 'colorMapNewCases');

const makeSelectHomeZoomState = () =>
  makeSelectUserData(selectHomePageDomain, 'zoomState');

export default makeSelectHomePage;
export {
  selectHomePageDomain,
  makeSelectHomeLoading,
  makeSelectHomeSuccessMessage,
  makeSelectHomeErrorMessage,
  makeSelectHomeSearchWith,
  makeSelectHomeColorMapBy,
  makeSelectHomeColorMapPerCapita,
  makeSelectHomeColorMapNewCases,
  makeSelectHomeZoomState,
};
