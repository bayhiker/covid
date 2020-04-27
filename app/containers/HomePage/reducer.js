/* eslint-disable no-param-reassign */
/*
 *
 * HomePage reducer
 *
 */
import produce from 'immer';
import {
  DEFAULT_ACTION,
  CHANGE_SEARCH_WITH,
  CHANGE_COLOR_MAP_BY,
  CHANGE_COLOR_MAP_PER_CAPITA,
  UPDATE_ZOOM_STATE,
  GEO_JSON_URL_COUNTIES,
  GEO_JSON_URL_STATES,
  CHANGE_COLOR_MAP_NEW_CASES,
  CHANGE_CURRENT_DATE,
} from './constants';
import { config } from '../../constants';
import {
  SUCCESS_ACTION,
  ERROR_ACTION,
  CLEAR_STATE_DIALOG_ACTION,
  getDialogInitialState,
  resetDialogState,
  mergeUserData,
} from '../../utils/dialogState';

export const initialState = getDialogInitialState({
  searchWith: '',
  colorMapBy: 'deaths',
  colorMapPerCapita: false,
  colorMapNewCases: false,
  // Data to be dynamically loaded from server
  data: {},
  currentDate: false,
  zoomState: {
    zoom: 1,
    // Must set to somewhere within the US, otherwise you'll get "null" errors:
    // https://github.com/zcreativelabs/react-simple-maps/issues/170
    center: [-95.71, 37.09],
    // ID of the geo in focus, For Example:
    // '0' for the whole US, '06' for CA, '06085' for Santa Clara County
    geoId: '0',
    geoJsonUrl: 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json',
    dataUrl: `${config.DATA_URL_PREFIX}/0.json`,
  },
});

function updateZoomState(draft, zoomState) {
  if ('center' in zoomState) {
    draft.userData.zoomState.center = zoomState.center;
  }
  if ('zoom' in zoomState) {
    draft.userData.zoomState.zoom = zoomState.zoom;
    draft.userData.zoomState.geoJsonUrl =
      zoomState.zoom >= 2 ? GEO_JSON_URL_COUNTIES : GEO_JSON_URL_STATES;
  }
  if ('geoId' in zoomState) {
    draft.userData.zoomState.geoId = zoomState.geoId;
  }
  const { zoom, geoId } = draft.userData.zoomState;
  let dataUrl = `${config.DATA_URL_PREFIX}/0.json`;
  if (zoom >= 2) {
    let geoIdState = 20;
    if (geoId !== undefined || geoId !== '0') {
      geoIdState = geoId.substring(0, 2);
    }
    dataUrl = `${config.DATA_URL_PREFIX}/${geoIdState}.json`;
  }
  draft.userData.zoomState.dataUrl = dataUrl;
}

/* eslint-disable default-case, no-param-reassign */
const homePageReducer = (state = initialState, action) =>
  produce(state, draft => {
    resetDialogState(draft);
    switch (action.type) {
      case DEFAULT_ACTION:
        break;
      case SUCCESS_ACTION:
        draft.successMessage = action.successMessage;
        mergeUserData(draft, action);
        break;
      case ERROR_ACTION:
        draft.errorMessage = action.errorMessage;
        mergeUserData(draft, action);
        break;
      case CLEAR_STATE_DIALOG_ACTION:
        // resetDialogState(draft) already clears loading/error/successMessage.
        // This action is still needed so reducer can be called.
        break;
      case CHANGE_SEARCH_WITH:
        draft.userData.searchWith = action.searchWith;
        break;
      case CHANGE_COLOR_MAP_BY:
        draft.userData.colorMapBy =
          action.colorMapBy === 'confirmed' ? 'confirmed' : 'deaths';
        break;
      case CHANGE_COLOR_MAP_PER_CAPITA:
        draft.userData.colorMapPerCapita = action.colorMapPerCapita;
        break;
      case CHANGE_COLOR_MAP_NEW_CASES:
        draft.userData.colorMapNewCases = action.colorMapNewCases;
        break;
      case UPDATE_ZOOM_STATE:
        updateZoomState(draft, action.zoomState);
        break;
      case CHANGE_CURRENT_DATE:
        draft.userData.currentDate = action.currentDate;
        break;
    }
  });

export default homePageReducer;
