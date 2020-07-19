import React from 'react';
import PropTypes from 'prop-types';
import {
  Typography,
  Tabs,
  Tab,
  Box,
  makeStyles,
  FormControl,
  InputLabel,
  NativeSelect,
  IconButton,
  Grid,
} from '@material-ui/core';
import RefreshIcon from '@material-ui/icons/Refresh';
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import BarChart from 'chart-race-react';
import { CenteredSection } from '../../utils/styledUtil';
import {
  getNewCasesDataKey,
  getDoublingDataKey,
  getRollingAverageDataKey,
  rollingDaysRadius,
  extractDataToPlot,
  extractRaceData,
} from './data';

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
    width: '100%',
    backgroundColor: theme.palette.background.paper,
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
}));

const formatPercentageTick = value => `${value}%`;

const formatNumericTick = value => {
  let formattedTick = `${value}`;
  if (value > 1000) {
    formattedTick = `${(Math.floor(value / 100) / 10).toLocaleString()}K`;
  }
  return formattedTick;
};

const getOverviewCharts = (metaData, casesDataToPlot) => (
  <div>
    <CenteredSection>
      <Typography variant="h5">{metaData.caption} - Overview</Typography>
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
            dataKey={getNewCasesDataKey('confirmed')}
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
            dataKey={getNewCasesDataKey('deaths')}
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
            tickFormatter={formatNumericTick}
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

const getNewCasesCharts = (metaData, casesDataToPlot) => (
  <div>
    <CenteredSection>
      <Typography variant="h5">{metaData.caption} - New Cases</Typography>
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
            tickFormatter={formatNumericTick}
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

const getDoublingCharts = (metaData, casesDataToPlot) => (
  <div>
    <CenteredSection>
      <Typography variant="h5">
        {metaData.caption} - Doubling Every x Days
      </Typography>
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

const getRollingCharts = (metaData, casesDataToPlot) => (
  <div>
    <CenteredSection>
      <Typography variant="h5">
        {metaData.caption} - New Cases {2 * rollingDaysRadius + 1}-day Centered
        Rolling Average{' '}
      </Typography>
      <Typography variant="subtitle2" color="textSecondary">
        <a
          href="https://www.itl.nist.gov/div898/handbook/pmc/section4/pmc422.htm"
          target="_"
        >
          Centered Rolling Average
        </a>{' '}
        of new cases. According to guidelines, among other conditions, a place
        should not reopen before 2 weeks of downward trend of new cases.
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
            dataKey={getRollingAverageDataKey('confirmed')}
            stroke="#00F"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey={getRollingAverageDataKey('deaths')}
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
            tickFormatter={formatNumericTick}
            label={{
              value: 'Cases',
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
          <ReferenceLine
            yAxisId="right"
            x={metaData.references.rollingAverageTrendStart.confirmed}
            stroke="#00F"
            label={{
              value: `Downward trend since ${
                metaData.references.rollingAverageTrendDuration.confirmed
              } days ago`,
              angle: -90,
              position: 'right',
            }}
          />
          <ReferenceLine
            yAxisId="right"
            x={metaData.references.rollingAverageTrendStart.deaths}
            stroke="#F00"
            label={{
              value: `Downward trend since ${
                metaData.references.rollingAverageTrendDuration.deaths
              } days ago`,
              angle: -90,
              position: 'left',
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </CenteredSection>
  </div>
);
const getTestingCharts = (metaData, casesDataToPlot) => (
  <div>
    <CenteredSection>
      <Typography variant="h5"> {metaData.caption} - Testings </Typography>
      <Typography variant="subtitle2" color="textSecondary">
        Total number of settled tests, and percentage of positive cases in all
        settled tests.
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
            dataKey="total tests"
            stroke="#00F"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="tests today"
            stroke="#0F0"
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="positive rate today"
            stroke="#F00"
          />
          <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
          <XAxis dataKey="name" />
          <YAxis
            yAxisId="left"
            orientation="left"
            tickFormatter={formatPercentageTick}
            label={{
              value: 'Postive Rate',
              position: 'insideBottomLeft',
            }}
            allowDecimals
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tickFormatter={formatNumericTick}
            label={{
              value: 'Tests',
              position: 'insideBottomRight',
            }}
          />
          <Tooltip />
          <Legend layout="horizontal" verticalAlign="top" align="center" />
          <ReferenceLine
            yAxisId="left"
            x={metaData.references.positiveRateTrendStart}
            stroke="#F00"
            label={{
              value: `${
                metaData.references.positiveRateTrendDuration
              } days ago`,
              angle: -90,
              position: 'right',
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </CenteredSection>
  </div>
);

const getRaceChart = (
  metaData,
  data,
  covidState,
  onUpdateUserState,
  classes,
) => {
  const { len, timeline, colors, raceData } = extractRaceData(data, covidState);
  if (!len) {
    return <div />;
  }
  if (covidState.raceChart.restart) {
    onUpdateUserState({ raceChart: { restart: false } });
    return <div />;
  }
  const labels = Object.keys(raceData).reduce(
    (res, item) => ({
      ...res,
      ...{
        [item]: (
          <div
            style={{
              textAlign: 'right',
              marginTop: '-3px',
              fontSize: '12px',
            }}
          >
            <div>{item}</div>
          </div>
        ),
      },
    }),
    {},
  );

  return (
    <div>
      <CenteredSection>
        <Grid item xs={12}>
          <Grid container justify="center">
            <Grid item>
              <Typography variant="h5">
                {' '}
                {metaData.caption} - Race Chart{' '}
              </Typography>
            </Grid>
            <Grid item>
              <IconButton
                color="primary"
                aria-label="Restart"
                onClick={() => {
                  onUpdateUserState({ raceChart: { restart: true } });
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Grid>
          </Grid>
        </Grid>
        <Typography variant="subtitle2" color="textSecondary">
          Blue, red, or green bar colors stand for democratic, republican, or
          battle-ground states/counties.
        </Typography>
        <FormControl className={classes.formControl}>
          <InputLabel htmlFor="raceBy">Race By</InputLabel>
          <NativeSelect
            defaultValue={covidState.raceChart.raceBy}
            inputProps={{
              name: 'raceBy',
              id: 'raceBy',
            }}
            onChange={event => {
              onUpdateUserState({
                raceChart: { restart: true, raceBy: event.target.value },
              });
            }}
          >
            <option value="confirmed">Confirmed</option>
            <option value="deaths">Deaths</option>
            <option value="confirmed-per-capita">Confirmed Per Million</option>
            <option value="deaths-per-capita">Deaths Per Million</option>
            <option value="confirmed-new">Confirmed New</option>
            <option value="deaths-new">Deaths New</option>
            <option value="confirmed-new-per-capita">
              Confirmed New Per Million
            </option>
            <option value="deaths-new-per-capita">
              Deaths New Per Million
            </option>
            <option value="testing/settled_cases">Testing/Settled Cases</option>
            <option value="testing/positive_rate">Testing/Positive Rate</option>
            <option value="mobility">Mobility</option>
          </NativeSelect>
        </FormControl>
        <div style={{ width: '100%' }}>
          <BarChart
            start
            data={raceData}
            timeline={timeline}
            labels={labels}
            colors={colors}
            len={len}
            timeout={200}
            delay={50}
            timelineStyle={{
              textAlign: 'center',
              fontSize: '18px',
              color: 'rgb(148, 148, 148)',
              marginBottom: '10px',
            }}
            textBoxStyle={{
              textAlign: 'right',
              color: 'rgb(133, 131, 131)',
              fontSize: '12px',
              marginBottom: '10px',
            }}
            barStyle={{
              height: '10px',
              marginTop: '5px',
              marginBottom: '5px',
              borderRadius: '2px',
            }}
            width={[15, 75, 10]}
            maxItems={20}
          />
        </div>
      </CenteredSection>
    </div>
  );
};

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

function CovidPlot({
  data,
  covidState,
  onUpdateUserState,
  onChangeCurrentPlotTab,
}) {
  const classes = useStyles();
  const shouldDrawTestingTab = covidState.zoomState.zoom < 8;
  const shouldDrawRaceChart = covidState.zoomState.zoom < 8;

  const { metaData, casesDataToPlot } = extractDataToPlot(
    data,
    covidState.zoomState,
  );

  return (
    <div className={classes.root}>
      <Tabs
        value={covidState.currentPlotTab}
        onChange={onChangeCurrentPlotTab}
        indicatorColor="primary"
        textColor="primary"
        variant="scrollable"
        scrollButtons="auto"
        aria-label="scrollable auto tabs example"
      >
        <Tab label="Overview" {...a11yProps(0)} />
        <Tab label="New Cases" {...a11yProps(1)} />
        <Tab label="Doubling" {...a11yProps(2)} />
        <Tab label="Rolling" {...a11yProps(3)} />
        {!shouldDrawTestingTab ? '' : <Tab label="Testing" {...a11yProps(4)} />}
        {!shouldDrawRaceChart ? '' : <Tab label="Race" {...a11yProps(5)} />}
      </Tabs>
      <TabPanel value={covidState.currentPlotTab} index={0}>
        {getOverviewCharts(metaData, casesDataToPlot)}
      </TabPanel>
      <TabPanel value={covidState.currentPlotTab} index={1}>
        {getNewCasesCharts(metaData, casesDataToPlot)}
      </TabPanel>
      <TabPanel value={covidState.currentPlotTab} index={2}>
        {getDoublingCharts(metaData, casesDataToPlot)}
      </TabPanel>
      <TabPanel value={covidState.currentPlotTab} index={3}>
        {getRollingCharts(metaData, casesDataToPlot)}
      </TabPanel>
      {!shouldDrawTestingTab ? (
        ''
      ) : (
        <TabPanel value={covidState.currentPlotTab} index={4}>
          {getTestingCharts(metaData, casesDataToPlot)}
        </TabPanel>
      )}
      {!shouldDrawRaceChart ? (
        ''
      ) : (
        <TabPanel value={covidState.currentPlotTab} index={5}>
          {getRaceChart(metaData, data, covidState, onUpdateUserState, classes)}
        </TabPanel>
      )}
    </div>
  );
}

CovidPlot.propTypes = {
  data: PropTypes.any,
  covidState: PropTypes.any,
  onUpdateUserState: PropTypes.func,
  onChangeCurrentPlotTab: PropTypes.func,
};

export default CovidPlot;
