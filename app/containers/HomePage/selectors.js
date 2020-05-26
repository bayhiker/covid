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

export const makeSelectHomeCovidState = () =>
  makeSelectUserData(selectHomePageDomain);

export default makeSelectHomePage;
