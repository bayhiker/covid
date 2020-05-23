import {
  titleToDate,
  dateToTitle,
  dateToShortTitle,
  newDateWithOffset,
} from '../../utils/dateUtils';
import {
  zoomLevelIsCounty,
  zoomLevelIsState,
  usStates,
} from '../../utils/mapUtils';

export const rollingDaysRadius = 3; // Makes rolling window 7 days
export const getNewCasesDataKey = caseType => `new ${caseType}`;
export const getDoublingDataKey = caseType => `${caseType} doubled every(days)`;
export const getRollingAverageDataKey = caseType =>
  `${caseType} centered rolling average`;

export const extractDataToPlot = (data, zoomState) => {
  const casesDataToPlot = [];
  const metaData = {
    caption: 'United State',
    references: {
      rollingAverageTrendStart: {},
      rollingAverageTrendDuration: {},
    },
  };

  if (!data || !data.most_recent_date) {
    return {
      metaData,
      casesDataToPlot,
    };
  }
  const startDate = titleToDate(data.least_recent_date);
  const endDate = titleToDate(data.most_recent_date);

  const countyLevel = zoomLevelIsCounty(zoomState);
  const { geoId } = zoomState;

  if (countyLevel) {
    metaData.caption = `${data.names[geoId]} County`;
  } else if (zoomLevelIsState(zoomState)) {
    metaData.caption = usStates[geoId.substring(0, 2)].name;
  }

  const timeSeriesConfirmed = data.confirmed.time_series;
  const timeSeriesDeaths = data.deaths.time_series;
  const timeSeriesMobility = data.mobility.time_series;
  const timeSeriesSettledCases = data.testing.settled_cases.time_series;
  const timeSeriesPositiveRate = data.testing.positive_rate.time_series;
  const timeSeriesPendingCases = data.testing.pending_cases.time_series;

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

  const calculateRollingAverage = caseType => {
    const totalDays = casesDataToPlot.length;
    let prevRollingAverage = -1;
    let trendDuration = 0;
    for (let i = 0; i < totalDays; i += 1) {
      const windowStart = i > rollingDaysRadius ? i - rollingDaysRadius : 0;
      const windowEnd =
        i + rollingDaysRadius >= totalDays
          ? totalDays - 1
          : i + rollingDaysRadius;
      let counter = 0;
      let total = 0;
      for (let j = windowStart; j <= windowEnd; j += 1) {
        counter += 1;
        total += casesDataToPlot[j][getNewCasesDataKey(caseType)];
      }
      const rollingAverage = Math.floor(total / counter);
      casesDataToPlot[i][getRollingAverageDataKey(caseType)] = rollingAverage;
      if (rollingAverage > prevRollingAverage) {
        trendDuration = 1;
      } else {
        trendDuration += 1;
      }
      prevRollingAverage = rollingAverage;
    }
    metaData.references.rollingAverageTrendStart[caseType] = dateToShortTitle(
      newDateWithOffset(endDate, 1 - trendDuration),
    );
    metaData.references.rollingAverageTrendDuration[caseType] = trendDuration;
  };

  const findPositiveRateTrend = () => {
    if (countyLevel) {
      return;
    }
    const totalDays = casesDataToPlot.length;
    let trendStartIndex = totalDays - 1;
    while (
      trendStartIndex > 0 &&
      casesDataToPlot[trendStartIndex - 1]['positive rate'] >
        casesDataToPlot[trendStartIndex]['positive rate']
    ) {
      trendStartIndex -= 1;
    }
    metaData.references.positiveRateTrendStart = dateToShortTitle(
      newDateWithOffset(startDate, trendStartIndex),
    );
    metaData.references.positiveRateTrendDuration =
      totalDays - trendStartIndex + 1;
  };

  for (
    let d = new Date(startDate.getTime()); // new Date So we don't unintentionaly change startDate
    d <= endDate;
    d.setDate(d.getDate() + 1)
  ) {
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
    };
    currentDataPoint[getNewCasesDataKey('confirmed')] =
      currentTotalCases.confirmed - prevTotalConfirmed;
    currentDataPoint[getNewCasesDataKey('deaths')] =
      currentTotalCases.deaths - prevTotalDeaths;
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
    if (!countyLevel) {
      currentDataPoint['total tests'] = timeSeriesSettledCases[seriesKey];
      currentDataPoint['positive rate'] = timeSeriesPositiveRate[seriesKey];
      currentDataPoint['pending cases'] = timeSeriesPendingCases[seriesKey];
    }

    // Calculate and filled doubled in x days
    searchForDoubled('confirmed', 63);
    searchForDoubled('deaths', 5);

    casesDataToPlot.push(currentDataPoint);
    prevTotalConfirmed = currentTotalCases.confirmed;
    prevTotalDeaths = currentTotalCases.deaths;
    prevMobility = mobility;
  }
  // Calculate rolling averages for new cases
  calculateRollingAverage('confirmed');
  calculateRollingAverage('deaths');
  // Calculate positive rate downward trend start date and duration
  findPositiveRateTrend();

  return {
    metaData,
    casesDataToPlot,
  };
};
