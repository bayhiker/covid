// import produce from 'immer';
import homePageReducer from '../reducer';
// import { someAction } from '../actions';

/* eslint-disable default-case, no-param-reassign */
describe('homePageReducer', () => {
  let state;
  beforeEach(() => {
    state = {
      loading: false,
      successMessage: false,
      errorMessage: false,
      userData: {
        problemsFilter: '',
        currentProblem: false,
        problems: false,
      },
    };
  });

  it('returns the initial state', () => {
    const expectedResult = state;
    expect(homePageReducer(undefined, {})).toEqual(expectedResult);
  });

  /**
   * Example state change comparison
   *
   * it('should handle the someAction action correctly', () => {
   *   const expectedResult = produce(state, draft => {
   *     draft.loading = true;
   *     draft.error = false;
   *     draft.userData.nested = false;
   *   });
   *
   *   expect(appReducer(state, someAction())).toEqual(expectedResult);
   * });
   */
});
