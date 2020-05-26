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

export const selectHomePageDomain = state => state.homePage || initialState;

/**
 * Other specific selectors
 */

/**
 * Default selector used by HomePage
 */

export const makeSelectHomePage = () =>
  createSelector(
    selectHomePageDomain,
    substate => substate,
  );

export const makeSelectHomeLoading = () =>
  makeSelectLoading(selectHomePageDomain);

export const makeSelectHomeSuccessMessage = () =>
  makeSelectSuccessMessage(selectHomePageDomain);

export const makeSelectHomeErrorMessage = () =>
  makeSelectErrorMessage(selectHomePageDomain);

export const makeSelectHomeSearchWith = () =>
  makeSelectUserData(selectHomePageDomain, 'search');

export const makeSelectHomeColorMapBy = () =>
  makeSelectUserData(selectHomePageDomain, 'colorMapBy');

export const makeSelectHomeColorMapPerCapita = () =>
  makeSelectUserData(selectHomePageDomain, 'colorMapPerCapita');

export const makeSelectHomeColorMapNewCases = () =>
  makeSelectUserData(selectHomePageDomain, 'colorMapNewCases');

export const makeSelectHomeZoomState = () =>
  makeSelectUserData(selectHomePageDomain, 'zoomState');

export const makeSelectHomeCurrentDate = () =>
  makeSelectUserData(selectHomePageDomain, 'currentDate');

export const makeSelectHomeCurrentPlotTab = () =>
  makeSelectUserData(selectHomePageDomain, 'currentPlotTab');

export const makeSelectHomeCovidState = () =>
  makeSelectUserData(selectHomePageDomain);

export default makeSelectHomePage;
