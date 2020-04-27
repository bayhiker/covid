// import produce from 'immer';
import { config } from 'constants';
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
        searchWith: '',
        colorMapBy: 'deaths',
        colorMapPerCapita: false,
        colorMapNewCases: false,
        // Data to be dynamically loaded from server
        data: {},
        currentDate: false,
        zoomState: {
          zoom: 1,
          center: [-95.71, 37.09],
          geoId: '0',
          geoJsonUrl: 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json',
          dataUrl: `${config.DATA_URL_PREFIX}/0.json`,
        },
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
