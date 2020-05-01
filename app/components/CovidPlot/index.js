/**
 *
 * CovidPlot
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Tabs, Tab, Box, makeStyles } from '@material-ui/core';
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  titleToDate,
  dateToTitle,
  dateToShortTitle,
} from '../../utils/dateUtils';
import {
  zoomLevelIsCounty,
  zoomLevelIsState,
  usStates,
} from '../../utils/mapUtils';
import { CenteredSection } from '../../utils/styledUtil';

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
    width: '100%',
    backgroundColor: theme.palette.background.paper,
  },
}));

const getDoublingDataKey = caseType => `${caseType} doubled every(days)`;

const extractDataToPlot = (data, zoomState) => {
  const casesDataToPlot = [];
  let caption = 'United State';

  if (!data || !data.most_recent_date) {
    return {
      caption,
      casesDataToPlot,
    };
  }
  const startDate = titleToDate(data.least_recent_date);
  const endDate = titleToDate(data.most_recent_date);

  const countyLevel = zoomLevelIsCounty(zoomState);
  const { geoId } = zoomState;

  if (countyLevel) {
    caption = `${data.names[geoId]} County`;
  } else if (zoomLevelIsState(zoomState)) {
    caption = usStates[geoId.substring(0, 2)].name;
  }

  const timeSeriesConfirmed = data.confirmed.time_series;
  const timeSeriesDeaths = data.deaths.time_series;
  const timeSeriesMobility = data.mobility.time_series;

  let prevTotalDeaths = 0;
  let prevTotalConfirmed = 0;
  let prevMobility = -1;
  let firstValidMobilityFound = false;
  const doubledSinceIndex = { confirmed: 0, deaths: 0 };
  let currentTotalCases = {};
  let currentDataPoint = {};
  const searchForDoubled = (caseType, minCases) => {
    if (currentTotalCases[caseType] < minCases) {
      return;
    }
    while (
      doubledSinceIndex[caseType] < casesDataToPlot.length - 1 &&
      casesDataToPlot[doubledSinceIndex[caseType]][caseType] <
        currentTotalCases[caseType] / 2
    ) {
      doubledSinceIndex[caseType] += 1;
    }
    currentDataPoint[getDoublingDataKey(caseType)] =
      casesDataToPlot.length - doubledSinceIndex[caseType];
  };
  for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
    const seriesKey = dateToTitle(d);
    currentTotalCases = {};
    currentTotalCases.confirmed = countyLevel
      ? data.confirmed[seriesKey][geoId]
      : timeSeriesConfirmed[seriesKey];
    currentTotalCases.deaths = countyLevel
      ? data.deaths[seriesKey][geoId]
      : timeSeriesDeaths[seriesKey];
    const mobility = countyLevel
      ? data.mobility[seriesKey][geoId]
      : timeSeriesMobility[seriesKey];
    currentDataPoint = {
      name: dateToShortTitle(d),
      confirmed: currentTotalCases.confirmed,
      deaths: currentTotalCases.deaths,
      'new confirmed': currentTotalCases.confirmed - prevTotalConfirmed,
      'new deaths': currentTotalCases.deaths - prevTotalDeaths,
    };
    if (
      !firstValidMobilityFound &&
      prevMobility !== -1 &&
      prevMobility !== mobility
    ) {
      firstValidMobilityFound = true;
    }

    if (firstValidMobilityFound) {
      currentDataPoint.mobility = mobility;
    }

    // Calculate and filled doubled in x days
    searchForDoubled('confirmed', 63);
    searchForDoubled('deaths', 5);

    casesDataToPlot.push(currentDataPoint);
    prevTotalConfirmed = currentTotalCases.confirmed;
    prevTotalDeaths = currentTotalCases.deaths;
    prevMobility = mobility;
  }

  return {
    caption,
    casesDataToPlot,
  };
};

const getOverviewCharts = (caption, casesDataToPlot) => (
  <div>
    <CenteredSection>
      <Typography variant="h5">{caption} - Overview</Typography>
      <Typography variant="subtitle2" color="textSecondary">
        Overview of total confirmed cases/deaths, new confirmed cases/deaths,
        and{' '}
        <a
          target="_"
          href="https://github.com/descarteslabs/DL-COVID-19#field-description"
        >
          mobility index
        </a>
        .
      </Typography>
      <ResponsiveContainer
        width="100%"
        aspect={2.0 / 1.0}
        maxHeight={512}
        minWidth={200}
      >
        <LineChart data={casesDataToPlot}>
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="confirmed"
            stroke="#00F"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="new confirmed"
            stroke="#0F0"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="deaths"
            stroke="#000"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="new deaths"
            stroke="#F00"
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="mobility"
            stroke="#BBB"
          />
          <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
          <XAxis dataKey="name" />
          <YAxis
            yAxisId="left"
            orientation="left"
            label={{
              value: 'Mobility Index',
              position: 'insideBottomLeft',
            }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            label={{
              value: 'Cases',
              position: 'insideBottomRight',
            }}
          />
          <Tooltip />
          <Legend layout="horizontal" verticalAlign="top" align="center" />
        </LineChart>
      </ResponsiveContainer>
    </CenteredSection>
  </div>
);

const getNewCasesCharts = (caption, casesDataToPlot) => (
  <div>
    <CenteredSection>
      <Typography variant="h5">{caption} - New Cases</Typography>
      <Typography variant="subtitle2" color="textSecondary">
        New confirmed cases, new deaths, plotted against{' '}
        <a
          target="_"
          href="https://github.com/descarteslabs/DL-COVID-19#field-description"
        >
          mobility index
        </a>
      </Typography>
      <ResponsiveContainer
        width="100%"
        aspect={2.0 / 1.0}
        maxHeight={512}
        minWidth={200}
      >
        <LineChart data={casesDataToPlot}>
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="new confirmed"
            stroke="#0F0"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="new deaths"
            stroke="#F00"
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="mobility"
            stroke="#BBB"
          />
          <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
          <XAxis dataKey="name" />
          <YAxis
            yAxisId="left"
            orientation="left"
            label={{
              value: 'Mobility Index',
              position: 'insideBottomLeft',
            }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            label={{
              value: 'Cases',
              position: 'insideBottomRight',
            }}
          />
          <Tooltip />
          <Legend layout="horizontal" verticalAlign="top" align="center" />
        </LineChart>
      </ResponsiveContainer>
    </CenteredSection>
  </div>
);

const getDoublingCharts = (caption, casesDataToPlot) => (
  <div>
    <CenteredSection>
      <Typography variant="h5">{caption} - Doubling Every x Days</Typography>
      <Typography variant="subtitle2" color="textSecondary">
        Cases doubled since x days ago. COVID-19 patient are on average
        hospitalized for{' '}
        <a
          target="_"
          href="https://youquiz.me/community/topic/8/how-long-do-covid-patients-stay-in-the-hospital"
        >
          8 days
        </a>
        , therefore when doubling days falls below 8 days, total hospitalization
        will fall.
      </Typography>
      <ResponsiveContainer
        width="100%"
        aspect={2.0 / 1.0}
        maxHeight={512}
        minWidth={200}
      >
        <LineChart data={casesDataToPlot}>
          <Line
            yAxisId="right"
            type="monotone"
            dataKey={getDoublingDataKey('confirmed')}
            stroke="#00F"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey={getDoublingDataKey('deaths')}
            stroke="#F00"
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="mobility"
            stroke="#BBB"
          />
          <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
          <XAxis dataKey="name" />
          <YAxis
            yAxisId="right"
            orientation="right"
            label={{
              value: 'Days',
              position: 'insideBottomRight',
            }}
            allowDecimals
          />
          <YAxis
            yAxisId="left"
            orientation="left"
            label={{
              value: 'Mobility Index',
              position: 'insideBottomLeft',
            }}
          />
          <Tooltip />
          <Legend layout="horizontal" verticalAlign="top" align="center" />
        </LineChart>
      </ResponsiveContainer>
    </CenteredSection>
  </div>
);

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <Typography
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={`scrollable-auto-tabpanel-${index}`}
      aria-labelledby={`scrollable-auto-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </Typography>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `scrollable-auto-tab-${index}`,
    'aria-controls': `scrollable-auto-tabpanel-${index}`,
  };
}

function CovidPlot({ data, zoomState }) {
  const classes = useStyles();
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  const { caption, casesDataToPlot } = extractDataToPlot(data, zoomState);

  return (
    <div className={classes.root}>
      <Tabs
        value={value}
        onChange={handleChange}
        indicatorColor="primary"
        textColor="primary"
        variant="scrollable"
        scrollButtons="auto"
        aria-label="scrollable auto tabs example"
      >
        <Tab label="Overview" {...a11yProps(0)} />
        <Tab label="New Cases" {...a11yProps(1)} />
        <Tab label="Doubling" {...a11yProps(2)} />
      </Tabs>
      <TabPanel value={value} index={0}>
        {getOverviewCharts(caption, casesDataToPlot)}
      </TabPanel>
      <TabPanel value={value} index={1}>
        {getNewCasesCharts(caption, casesDataToPlot)}
      </TabPanel>
      <TabPanel value={value} index={2}>
        {getDoublingCharts(caption, casesDataToPlot)}
      </TabPanel>
    </div>
  );
}

CovidPlot.propTypes = {
  data: PropTypes.any,
  zoomState: PropTypes.any,
};

export default CovidPlot;
