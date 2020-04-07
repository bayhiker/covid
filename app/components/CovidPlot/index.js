/**
 *
 * CovidPlot
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import {
  titleToDate,
  dateToTitle,
  dateToShortTitle,
} from '../../utils/dateUtils';

const extractDataToPlot = (data, perCapita, dataToPlot) => {
  if (!data || !data.most_recent_date) {
    return;
  }
  const timeSeriesConfirmed = data.confirmed.time_series;
  const timeSeriesDeaths = data.deaths.time_series;
  const startDate = titleToDate(data.least_recent_date);
  const endDate = titleToDate(data.most_recent_date);
  let prevTotalDeaths = 0;
  let prevTotalConfirmed = 0;
  for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
    const seriesKey = dateToTitle(d);
    const totalConfirmed = timeSeriesConfirmed[seriesKey];
    const totalDeaths = timeSeriesDeaths[seriesKey];
    dataToPlot.push({
      name: dateToShortTitle(d),
      confirmed: totalConfirmed,
      deaths: totalDeaths,
      'new confirmed': totalConfirmed - prevTotalConfirmed,
      'new deaths': totalDeaths - prevTotalDeaths,
    });
    prevTotalConfirmed = timeSeriesConfirmed[seriesKey];
    prevTotalDeaths = timeSeriesDeaths[seriesKey];
  }
};

function CovidPlot({ data, perCapita }) {
  const dataToPlot = [];
  extractDataToPlot(data, perCapita, dataToPlot);
  return (
    <div>
      <LineChart width={1024} height={400} data={dataToPlot}>
        <Line type="monotone" dataKey="confirmed" stroke="#00F" />
        <Line type="monotone" dataKey="deaths" stroke="#000" />
        <Line type="monotone" dataKey="new deaths" stroke="#F00" />
        <Line type="monotone" dataKey="new confirmed" stroke="#0F0" />
        <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend layout="horizontal" verticalAlign="top" align="center" />
      </LineChart>
    </div>
  );
}

CovidPlot.propTypes = {
  data: PropTypes.any,
  perCapita: PropTypes.bool,
};

export default CovidPlot;
