import { createSelector } from 'reselect';
export const SUCCESS_ACTION = 'app/SUCCESS';
export const ERROR_ACTION = 'app/ERROR';
export const CLEAR_STATE_DIALOG_ACTION = 'app/CLEAR_STATE_DIALOG';

/**
 * Generate reducer initial state with common loading/successMessage/errorMessage state.
 * successMessage and errorMessage can be either false or a success/error message
 * @param {*} userData A dictonary containing user state data
 */
export function getDialogInitialState(userData) {
  return {
    loading: false,
    successMessage: false, // false, or a success message
    errorMessage: false, // false, or an error message
    userData,
  };
}

/* eslint-disable no-param-reassign */
export function resetDialogState(draft) {
  draft.loading = false;
  draft.successMessage = false;
  draft.errorMessage = false;
}

// **************** Actions *******************

export function successAction(successMessage, userData = {}) {
  return {
    type: SUCCESS_ACTION,
    successMessage,
    userData,
  };
}

export function errorAction(errorMessage, userData = {}) {
  return {
    type: ERROR_ACTION,
    errorMessage,
    userData,
  };
}

export function clearStateDialog() {
  return {
    type: CLEAR_STATE_DIALOG_ACTION,
  };
}

// ***************** Utility functions **********************
export function mergeUserData(draft, action) {
  if (draft && action && action.userData) {
    if (!draft.userData) {
      draft.userData = action.userData;
    } else {
      Object.keys(action.userData).forEach(key => {
        draft.userData[key] = action.userData[key];
      });
    }
  }
}

// **************** Selectors *******************

export function makeSelectUserData(domain, userDataName) {
  return createSelector(
    domain,
    substate => substate.userData[userDataName],
  );
}

export function makeSelectLoading(domain) {
  return createSelector(
    domain,
    substate => substate.loading,
  );
}

export function makeSelectSuccessMessage(domain) {
  return createSelector(
    domain,
    substate => substate.successMessage,
  );
}

export function makeSelectErrorMessage(domain) {
  return createSelector(
    domain,
    substate => substate.errorMessage,
  );
}
