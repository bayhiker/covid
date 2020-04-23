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

import {
  DEFAULT_ACTION,
  CHANGE_SEARCH_WITH,
  CHANGE_COLOR_MAP_BY,
  CHANGE_COLOR_MAP_PER_CAPITA,
  CHANGE_COLOR_MAP_NEW_CASES,
  CHANGE_CURRENT_DATE,
  UPDATE_ZOOM_STATE,
} from './constants';

export function defaultAction() {
  return {
    type: DEFAULT_ACTION,
  };
}

export function changeSearchWith(searchWith) {
  return {
    type: CHANGE_SEARCH_WITH,
    searchWith,
  };
}

export function changeColorMapBy(colorMapBy) {
  return {
    type: CHANGE_COLOR_MAP_BY,
    colorMapBy,
  };
}

export function changeColorMapPerCapita(colorMapPerCapita) {
  return {
    type: CHANGE_COLOR_MAP_PER_CAPITA,
    colorMapPerCapita,
  };
}

export function changeColorMapNewCases(colorMapNewCases) {
  return {
    type: CHANGE_COLOR_MAP_NEW_CASES,
    colorMapNewCases,
  };
}

export function changeCurrentDate(currentDate) {
  return {
    type: CHANGE_CURRENT_DATE,
    currentDate,
  };
}

/**
 * @param {*} zoomState: {level:x, center: [lat,lng], geoId:z}
 */
export function updateZoomState(zoomState) {
  return {
    type: UPDATE_ZOOM_STATE,
    zoomState,
  };
}
