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
} from './constants';
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
});

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
        console.log(`Changing colorMapBy to ${draft.userData.colorMapBy}`);
        break;
      case CHANGE_COLOR_MAP_PER_CAPITA:
        draft.userData.colorMapPerCapita = action.colorMapPerCapita;
        console.log(
          `Changing colorMapPerCapita to ${draft.userData.colorMapPerCapita}`,
        );
        break;
    }
  });

export default homePageReducer;
