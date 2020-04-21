/**
 *
 * CovidPlot
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import {
  Typography,
  AppBar,
  Tabs,
  Tab,
  Box,
  makeStyles,
} from '@material-ui/core';
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
  let confirmedDoubledSinceIndex = 0;
  let deathsDoubledSinceIndex = 0;
  for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
    const seriesKey = dateToTitle(d);
    const totalConfirmed = countyLevel
      ? data.confirmed[seriesKey][geoId]
      : timeSeriesConfirmed[seriesKey];
    const totalDeaths = countyLevel
      ? data.deaths[seriesKey][geoId]
      : timeSeriesDeaths[seriesKey];
    const mobility = countyLevel
      ? data.mobility[seriesKey][geoId]
      : timeSeriesMobility[seriesKey];
    const dataPoint = {
      name: dateToShortTitle(d),
      confirmed: totalConfirmed,
      deaths: totalDeaths,
      'new confirmed': totalConfirmed - prevTotalConfirmed,
      'new deaths': totalDeaths - prevTotalDeaths,
    };
    if (
      !firstValidMobilityFound &&
      prevMobility !== -1 &&
      prevMobility !== mobility
    ) {
      firstValidMobilityFound = true;
    }

    if (firstValidMobilityFound) {
      dataPoint.mobility = mobility;
    }

    // Calculate doubled in x days
    if (totalConfirmed > 63) {
      while (
        confirmedDoubledSinceIndex < casesDataToPlot.length - 1 &&
        casesDataToPlot[confirmedDoubledSinceIndex].confirmed <
          totalConfirmed / 2
      ) {
        confirmedDoubledSinceIndex += 1;
      }
      dataPoint['confirmed doubles every(days)'] =
        casesDataToPlot.length - confirmedDoubledSinceIndex;
    }
    if (totalDeaths > 3) {
      while (
        deathsDoubledSinceIndex < casesDataToPlot.length - 1 &&
        casesDataToPlot[deathsDoubledSinceIndex].deaths < totalDeaths / 2
      ) {
        deathsDoubledSinceIndex += 1;
      }
      dataPoint['deaths doubles every(days)'] =
        casesDataToPlot.length - deathsDoubledSinceIndex;
    }
    casesDataToPlot.push(dataPoint);
    prevTotalConfirmed = totalConfirmed;
    prevTotalDeaths = totalDeaths;
    prevMobility = mobility;
  }

  return {
    caption,
    casesDataToPlot,
  };
};

const getCasesCharts = (caption, casesDataToPlot) => (
  <div>
    <CenteredSection>
      <Typography variant="h5">{caption}</Typography>
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
            stroke="#EE0"
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

const getDoublingCharts = casesDataToPlot => (
  <div>
    <CenteredSection>
      <Typography variant="h5">Doubling Every x Days</Typography>
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
            dataKey="confirmed doubles every(days)"
            stroke="#00F"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="deaths doubles every(days)"
            stroke="#F00"
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="mobility"
            stroke="#EE0"
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

function CovidPlot({ data, zoomState, perCapita }) {
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
        <Tab label="Cases" {...a11yProps(0)} />
        <Tab label="Doubling" {...a11yProps(1)} />
      </Tabs>
      <TabPanel value={value} index={0}>
        {getCasesCharts(caption, casesDataToPlot)}
      </TabPanel>
      <TabPanel value={value} index={1}>
        {getDoublingCharts(casesDataToPlot)}
      </TabPanel>
    </div>
  );
}

CovidPlot.propTypes = {
  data: PropTypes.any,
  zoomState: PropTypes.any,
  perCapita: PropTypes.bool,
};

export default CovidPlot;
