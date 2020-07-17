import {
  titleToDate,
  dateToTitle,
  dateToShortTitle,
  newDateWithOffset,
  prevDateTitle,
  loopThroughDates,
  getDaysApart,
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
    caption: 'United States',
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
      casesDataToPlot[trendStartIndex - 1]['positive rate today'] >=
        casesDataToPlot[trendStartIndex]['positive rate today']
    ) {
      trendStartIndex -= 1;
    }
    metaData.references.positiveRateTrendStart = dateToShortTitle(
      newDateWithOffset(startDate, trendStartIndex),
    );
    metaData.references.positiveRateTrendDuration = totalDays - trendStartIndex;
  };

  loopThroughDates(startDate, endDate, d => {
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
      const settledCases = timeSeriesSettledCases[seriesKey];
      const seriesKeyYesterday = prevDateTitle(seriesKey);
      let settledCasesYesterday = timeSeriesSettledCases[seriesKeyYesterday];
      if (!settledCasesYesterday) {
        settledCasesYesterday = 0;
      }
      currentDataPoint['total tests'] = settledCases;
      currentDataPoint['tests today'] = settledCases - settledCasesYesterday;
      currentDataPoint['positive rate today'] =
        timeSeriesPositiveRate[seriesKey];
      currentDataPoint['pending cases'] = timeSeriesPendingCases[seriesKey];
    }

    // Calculate and filled doubled in x days
    searchForDoubled('confirmed', 63);
    searchForDoubled('deaths', 5);

    casesDataToPlot.push(currentDataPoint);
    prevTotalConfirmed = currentTotalCases.confirmed;
    prevTotalDeaths = currentTotalCases.deaths;
    prevMobility = mobility;
  });
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

const getRaceDataSlice = (data, raceBy) => {
  const { names, population, mobility, testing, confirmed, deaths } = data;
  if (raceBy === 'mobility') return mobility;
  if (raceBy === 'testing/settled_cases') return testing.settled_cases;
  if (raceBy === 'testing/positive_rate') return testing.positive_rate;
  if (raceBy === 'confirmed') return confirmed;
  if (raceBy === 'deaths') return deaths;
  let dataSlice = null;
  // Now raceBy can only be (confirmed|deaths){-new}{-per-capita}
  if (raceBy.startsWith('confirmed')) {
    dataSlice = confirmed;
  } else if (raceBy.startsWith('deaths')) {
    dataSlice = deaths;
  } else {
    // Catch call scenario
    return confirmed;
  }
  // We'll be changing data content, make a deep copy to avoid unintentional consequences
  dataSlice = JSON.parse(JSON.stringify(dataSlice));
  if (raceBy.includes('-new')) {
    const startDate = titleToDate(data.most_recent_date);
    const endDate = newDateWithOffset(titleToDate(data.least_recent_date), 1);
    Object.keys(names).forEach(fips => {
      loopThroughDates(startDate, endDate, d => {
        dataSlice[dateToTitle(d)][fips] =
          dataSlice[dateToTitle(d)][fips] -
          dataSlice[dateToTitle(newDateWithOffset(d, -1))][fips];
      });
    });
  }
  if (raceBy.includes('-per-capita')) {
    const startDate = titleToDate(data.least_recent_date);
    const endDate = titleToDate(data.most_recent_date);
    Object.keys(names).forEach(fips => {
      loopThroughDates(startDate, endDate, d => {
        let perCapitaValue = 0;
        if (fips in population && population[fips] > 0) {
          perCapitaValue =
            Math.floor(
              (100 * (dataSlice[dateToTitle(d)][fips] * 1000000)) /
                population[fips],
            ) / 100;
        }
        dataSlice[dateToTitle(d)][fips] = perCapitaValue;
      });
    });
  }
  return dataSlice === null ? confirmed : dataSlice;
};

export const extractRaceData = (data, covidState) => {
  if (!('names' in data)) {
    return {};
  }
  const { names, votes2016 } = data;
  const fipsList = Object.keys(names);
  const nameToFips = {};
  Object.keys(names).forEach(fips => {
    nameToFips[names[fips]] = fips;
  });
  const dataSlice = getRaceDataSlice(data, covidState.raceChart.raceBy);

  // Assemble raceData
  const raceData = {};
  const startDate = titleToDate(data.least_recent_date);
  const endDate = titleToDate(data.most_recent_date);
  const lastKnownValues = {};
  loopThroughDates(startDate, endDate, d => {
    const dateTitle = dateToTitle(d);
    const currentDateValues =
      dateTitle in dataSlice ? dataSlice[dateTitle] : {};
    fipsList.forEach((fips, i) => {
      const name = names[fips];
      if (!(name in raceData)) raceData[name] = [];
      let value = 0;
      if (fips in currentDateValues) {
        value = currentDateValues[fips];
      } else if (fips in lastKnownValues) {
        value = lastKnownValues[fips];
      }
      raceData[name].push(value);
    });
  });
  const keys = Object.keys(raceData);
  const len = raceData[keys[0]].length;
  const bgThreshold = 1.1;
  const maxLiberalFactor = 2;
  const colors = keys.reduce((res, item) => {
    let color = '#00ff00'; // battle ground state/county
    const fips = nameToFips[item];
    if (fips in votes2016) {
      const { t, c } = votes2016[nameToFips[item]];
      let liberalFactor = c / t;
      if (liberalFactor < 1 / maxLiberalFactor)
        liberalFactor = 1 / maxLiberalFactor;
      if (liberalFactor > maxLiberalFactor) liberalFactor = maxLiberalFactor;
      if (liberalFactor > bgThreshold) {
        const lighter = Math.floor(
          ((maxLiberalFactor - liberalFactor) * 221) /
            (maxLiberalFactor - bgThreshold),
        ).toString(16);
        color = `#${lighter}${lighter}FF`;
      } else if (liberalFactor < 1 / bgThreshold) {
        const lighter = Math.floor(
          ((maxLiberalFactor - 1 / liberalFactor) * 221) /
            (maxLiberalFactor - bgThreshold),
        ).toString(16);
        color = `#FF${lighter}${lighter}`;
      }
    }
    return {
      ...res,
      ...{ [item]: color },
    };
  }, {});

  const timeline = [];
  loopThroughDates(startDate, endDate, d => {
    timeline.push(dateToShortTitle(d));
  });

  return {
    len,
    timeline,
    colors,
    raceData,
  };
};
