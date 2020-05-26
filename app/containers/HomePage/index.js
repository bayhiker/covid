/**
 *
 * HomePage
 *
 */

import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';
import { useLocation } from 'react-router-dom';

import { Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useInjectSaga } from 'utils/injectSaga';
import { useInjectReducer } from 'utils/injectReducer';
import { Helmet } from 'react-helmet';
import reducer from './reducer';
import saga from './saga';
import StateDialog from '../../components/StateDialog';
import { CenteredSection } from '../../utils/styledUtil';
import YouQuizTopBar from '../../components/YouQuizTopBar';
import { stateFips, usStates } from '../../utils/mapUtils';

import {
  makeSelectHomeLoading,
  makeSelectHomeSuccessMessage,
  makeSelectHomeErrorMessage,
  makeSelectHomeSearchWith,
  makeSelectHomeColorMapBy,
  makeSelectHomeColorMapPerCapita,
  makeSelectHomeZoomState,
  makeSelectHomeColorMapNewCases,
  makeSelectHomeCurrentDate,
  makeSelectHomeCurrentPlotTab,
  makeSelectHomeCovidState,
} from './selectors';
import {
  updateSearchWith,
  updateColorMapBy,
  updateColorMapPerCapita,
  updateUserState,
  updateColorMapNewCases,
  updateCurrentDate,
  updateCurrentPlotTab,
} from './actions';
import { clearStateDialog } from '../../utils/dialogState';
import CovidMap from '../../components/CovidMap';
import CovidPlot from '../../components/CovidPlot';
import { updateCovidState } from '../../utils/searchParams';

const key = 'homePage';
// 268689 is phone number code of the word county
const zoomWithCountyHashPrefix = 2.0268689;

const useStyles = makeStyles(() => ({
  grow: {
    flexGrow: 1,
  },
}));

const getZoomWithCountyHash = countyName => {
  // Get a code that uniquely identifies a county within a state
  // All chars multiplied together, mod 9999999 along the way
  let countyHash = 1;
  for (let i = 0; i < countyName.length; i += 1) {
    countyHash =
      (countyHash * countyName.toLowerCase().charCodeAt(i)) % 9999999;
  }
  return zoomWithCountyHashPrefix + countyHash / 10 ** 14;
};

export function HomePage({
  loading,
  successMessage,
  errorMessage,
  searchWith,
  colorMapBy,
  colorMapPerCapita,
  colorMapNewCases,
  zoomState,
  covidState,
  currentDate,
  currentPlotTab,
  onClickDialogOk,
  onChangeSearchWith,
  onChangeColorMapBy,
  onChangeColorMapPerCapita,
  onChangeColorMapNewCases,
  onUpdateUserState,
  onChangeCurrentDate,
  onChangeCurrentPlotTab,
}) {
  const [data, setData] = React.useState({});
  const urlLocation = useLocation();
  useInjectReducer({ key, reducer });
  useInjectSaga({ key, saga });
  const classes = useStyles();

  React.useEffect(() => {
    processLocationAndParams();
  }, []);

  React.useEffect(() => {
    loadData();
  }, [zoomState.dataUrl]);

  const processLocationAndParams = () => {
    const { pathname, search } = urlLocation;
    const [, country, state, county] = pathname.split('/');
    const newUserState = {};
    if (country && country.toUpperCase() === 'US') {
      if (state && state.length === 2) {
        const newZoomState = {};
        const fips = stateFips[state.toUpperCase()];
        if (fips in usStates) {
          newZoomState.zoom = 2;
          newZoomState.geoId = fips;
          if (county && county.length >= 3) {
            // Shortest county name is Lee county, length 3
            newZoomState.zoom = getZoomWithCountyHash(county);
          }
        }
        newZoomState.center = [
          usStates[newZoomState.geoId].lon,
          usStates[newZoomState.geoId].lat,
        ];
        newUserState.zoomState = newZoomState;
      }
    }
    updateCovidState(newUserState, search);
    onUpdateUserState(newUserState);
  };

  const loadData = () => {
    try {
      fetch(zoomState.dataUrl, { compress: true })
        .then(response => response.json())
        .then(d => {
          setData(d);
          checkForCountyHash(d);
          onChangeCurrentDate(d.most_recent_date);
        });
    } catch (error) {
      // TODO Show alert here
    }
  };

  const checkForCountyHash = d => {
    // Check for county information encoded in a zoom a tiny bit larger than zoomWithCountyHashPrefix
    // For example, 2.00268689xxxx mean a county with index xxxx
    if (
      zoomState.zoom < zoomWithCountyHashPrefix ||
      zoomState.zoom > zoomWithCountyHashPrefix + 10 ** -7
    ) {
      return;
    }
    const zoomWithCountyHashTimesTen = Math.floor(zoomState.zoom * 10 ** 15);
    if (zoomWithCountyHashTimesTen % 10 !== 0) {
      return;
    }
    // Now we are resonably sure this is a zoom embedded with a county hash
    const countyHash = (zoomWithCountyHashTimesTen / 10) % 10 ** 7;
    if (!(`${countyHash}` in d.hashes)) {
      return;
    }
    const countyFips = d.hashes[countyHash];
    onUpdateUserState({ zoomState: { zoom: 8, geoId: countyFips } });
  };

  const stateDialogProps = {
    loading,
    successMessage,
    errorMessage,
    onClickDialogOk,
  };

  const youQuizTopBarProps = {
    data,
    covidState,
    onChangeSearchWith,
  };

  const covidMapProps = {
    data,
    currentDate,
    zoomState,
    searchWith,
    colorMapBy,
    colorMapPerCapita,
    colorMapNewCases,
    currentPlotTab,
    onUpdateUserState,
    onChangeCurrentDate,
    onChangeColorMapBy,
    onChangeColorMapPerCapita,
    onChangeColorMapNewCases,
    onChangeCurrentPlotTab,
  };

  const covidPlotProps = {
    data,
    zoomState,
    currentPlotTab,
    onChangeCurrentPlotTab,
  };

  return (
    <article>
      <Helmet>
        <title>COVID-19</title>
        <meta name="description" content="COVID 19 Statistics" />
      </Helmet>
      <div>
        <CenteredSection>
          <YouQuizTopBar {...youQuizTopBarProps} />
          <Grid container spacing={3}>
            <Grid container item xs={12} md={4}>
              <Grid item>
                <div className={classes.grow} />
              </Grid>
              <Grid item>
                <CovidMap {...covidMapProps} />
              </Grid>
              <Grid item>
                <div className={classes.grow} />
              </Grid>
            </Grid>
            <Grid item xs={12} md={8}>
              <CovidPlot {...covidPlotProps} />
            </Grid>
          </Grid>
        </CenteredSection>
        <StateDialog {...stateDialogProps} />
      </div>
    </article>
  );
}

HomePage.propTypes = {
  loading: PropTypes.bool,
  successMessage: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  errorMessage: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  searchWith: PropTypes.string,
  currentDate: PropTypes.oneOfType(PropTypes.string, PropTypes.bool),
  currentPlotTab: PropTypes.number,
  colorMapBy: PropTypes.oneOf(['confirmed', 'deaths']),
  colorMapPerCapita: PropTypes.bool,
  colorMapNewCases: PropTypes.bool,
  zoomState: PropTypes.any,
  covidState: PropTypes.any,
  onClickDialogOk: PropTypes.func,
  onChangeSearchWith: PropTypes.func,
  onChangeColorMapBy: PropTypes.func,
  onChangeColorMapPerCapita: PropTypes.func,
  onChangeColorMapNewCases: PropTypes.func,
  onUpdateUserState: PropTypes.func,
  onChangeCurrentDate: PropTypes.func,
  onChangeCurrentPlotTab: PropTypes.func,
};

const mapStateToProps = createStructuredSelector({
  loading: makeSelectHomeLoading(),
  successMessage: makeSelectHomeSuccessMessage(),
  errorMessage: makeSelectHomeErrorMessage(),
  searchWith: makeSelectHomeSearchWith(),
  currentDate: makeSelectHomeCurrentDate(),
  currentPlotTab: makeSelectHomeCurrentPlotTab(),
  colorMapBy: makeSelectHomeColorMapBy(),
  colorMapPerCapita: makeSelectHomeColorMapPerCapita(),
  colorMapNewCases: makeSelectHomeColorMapNewCases(),
  zoomState: makeSelectHomeZoomState(),
  covidState: makeSelectHomeCovidState(),
});

function mapDispatchToProps(dispatch) {
  return {
    onClickDialogOk: () => {
      dispatch(clearStateDialog());
    },
    onChangeSearchWith: evt => {
      dispatch(updateSearchWith(evt.target.value));
    },
    onChangeColorMapBy: evt => {
      dispatch(updateColorMapBy(evt.target.value));
    },
    onChangeColorMapPerCapita: evt => {
      dispatch(updateColorMapPerCapita(evt.target.checked));
    },
    onChangeColorMapNewCases: evt => {
      dispatch(updateColorMapNewCases(evt.target.checked));
    },
    onUpdateUserState: userState => {
      dispatch(updateUserState(userState));
    },
    onChangeCurrentDate: newCurrentDate => {
      dispatch(updateCurrentDate(newCurrentDate));
    },
    onChangeCurrentPlotTab: (evt, newCurrentPlotTab) => {
      dispatch(updateCurrentPlotTab(newCurrentPlotTab));
    },
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(
  withConnect,
  memo,
)(HomePage);
