/*
 * Home Actions
 *
 * Actions change things in your application
 * Since this boilerplate uses a uni-directional data flow, specifically redux,
 * we have these actions which are the only way your application interacts with
 * your application state. This guarantees that your state is up to date and nobody
 * messes it up weirdly somewhere.
 *
 * To add a new Action:
 * 1) Import your constant
 * 2) Add a function like this:
 *    export function yourAction(var) {
 *        return { type: YOUR_ACTION_CONSTANT, var: var }
 *    }
 */

import { DEFAULT_ACTION, UPDATE_USER_STATE } from './constants';

export function defaultAction() {
  return {
    type: DEFAULT_ACTION,
  };
}

export function updateSearchWith(searchWith) {
  return updateUserState({ searchWith });
}

export function updateColorMapBy(colorMapBy) {
  return updateUserState({ colorMapBy });
}

export function updateColorMapPerCapita(colorMapPerCapita) {
  return updateUserState({ colorMapPerCapita });
}

export function updateColorMapNewCases(colorMapNewCases) {
  return updateUserState({ colorMapNewCases });
}

export function updateCurrentDate(currentDate) {
  return updateUserState({ currentDate });
}

export function updateCurrentPlotTab(currentPlotTab) {
  return updateUserState({ currentPlotTab });
}

export function updateZoomState(zoomState) {
  return updateUserState({ zoomState });
}

export function updateUserState(userState) {
  return {
    type: UPDATE_USER_STATE,
    userState,
  };
}
