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
import {
  stateFips,
  usStates,
  zoomWithCountyHashPrefix,
  getZoomWithCountyHash,
} from '../../utils/mapUtils';

import {
  makeSelectHomeLoading,
  makeSelectHomeSuccessMessage,
  makeSelectHomeErrorMessage,
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
let controller = new AbortController();

const useStyles = makeStyles(() => ({
  grow: {
    flexGrow: 1,
  },
}));

export function HomePage({
  loading,
  successMessage,
  errorMessage,
  covidState,
  onClickDialogOk,
  onChangeSearchWith,
  onChangeColorMapBy,
  onChangeColorMapPerCapita,
  onChangeColorMapNewCases,
  onUpdateUserState,
  onChangeCurrentDate,
  onChangeCurrentPlotTab,
}) {
  const classes = useStyles();
  const [data, setData] = React.useState({});
  const urlLocation = useLocation();
  useInjectReducer({ key, reducer });
  useInjectSaga({ key, saga });

  React.useEffect(() => {
    processLocationAndParams();
  }, []);

  React.useEffect(() => {
    loadData();
  }, [covidState.zoomState.dataUrl]);

  const processLocationAndParams = () => {
    const newUserState = {};
    const { pathname, search } = urlLocation;
    updateCovidState(newUserState, search);
    // Process location, if present, location take higher priority then fips in m param
    const [, country, state, county] = pathname.split('/');
    if (country && country.toUpperCase() === 'US') {
      if (state && state.length === 2) {
        const fips = stateFips[state.toUpperCase()];
        const newZoomState = {};
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
    onUpdateUserState(newUserState);
  };

  const loadData = () => {
    try {
      controller.abort(); // Abort previous data calls, prev calls may comeback later and mess up data results
      controller = new AbortController();
      fetch(covidState.zoomState.dataUrl, {
        compress: true,
        signal: controller.signal,
      })
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
      covidState.zoomState.zoom < zoomWithCountyHashPrefix ||
      covidState.zoomState.zoom > zoomWithCountyHashPrefix + 10 ** -7
    ) {
      return;
    }
    const zoomWithCountyHashTimesTen = Math.floor(
      covidState.zoomState.zoom * 10 ** 15,
    );
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
    covidState,
    onUpdateUserState,
    onChangeCurrentDate,
    onChangeColorMapBy,
    onChangeColorMapPerCapita,
    onChangeColorMapNewCases,
    onChangeCurrentPlotTab,
  };

  const covidPlotProps = {
    data,
    covidState,
    onUpdateUserState,
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
