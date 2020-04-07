/**
 *
 * CovidTable
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import MaterialTable from 'material-table';
import states from '../../utils/data/states.json';
import { prevDateTitle } from '../../utils/dateUtils';
import YouQuizPopover from '../YouQuizPopover';

function CovidTable({ children, data }) {
  const columns = [
    {
      title: 'State',
      field: 'state',
      editable: 'never',
      cellStyle: { whiteSpace: 'nowrap' },
    },
    {
      title: 'Confirmed',
      editable: 'never',
      defaultSort: 'desc',
      render: rowData => rowData.confirmed.toLocaleString(),
      customSort: (a, b) => a.confirmed - b.confirmed,
    },
    {
      title: data.most_recent_date,
      editable: 'never',
      render: rowData => rowData.confirmed_daily.toLocaleString(),
      customSort: (a, b) => a.confirmed_daily - b.confirmed_daily,
    },
    {
      title: 'Deaths',
      editable: 'never',
      customSort: (a, b) => a.deaths - b.deaths,
      render: rowData => rowData.deaths.toLocaleString(),
    },
    {
      title: data.most_recent_date,
      editable: 'never',
      render: rowData => rowData.deaths_daily.toLocaleString(),
      customSort: (a, b) => a.deaths_daily - b.deaths_daily,
    },
    {
      title: 'Population',
      editable: 'never',
      render: rowData => rowData.population.toLocaleString(),
      customSort: (a, b) => a.population - b.population,
    },
  ];
  const tableData = [];
  if (data && data.most_recent_date) {
    const { confirmed, deaths, population } = data;
    const mostRecentDate = data.most_recent_date;
    const yesterday = prevDateTitle(mostRecentDate);
    Object.keys(states).forEach(key => {
      if (
        !(key in confirmed[mostRecentDate] && key in deaths[mostRecentDate])
      ) {
        return;
      }
      const confirmedTotal = confirmed[mostRecentDate][key];
      const deathsTotal = deaths[mostRecentDate][key];
      tableData.push({
        state: states[key].name,
        confirmed: confirmedTotal,
        deaths: deathsTotal,
        confirmed_daily:
          yesterday in confirmed
            ? confirmedTotal - confirmed[yesterday][key]
            : '-',
        deaths_daily:
          yesterday in deaths ? deathsTotal - deaths[yesterday][key] : '-',
        population: population[key],
      });
    });
  }

  const popoverContent = (
    <MaterialTable
      title="Covid Data"
      columns={columns}
      data={tableData}
      options={{
        headerStyle: { whiteSpace: 'nowrap' },
        maxBodyHeight: 500,
        pageSize: tableData.length,
      }}
    />
  );

  const youQuizPopoverProps = {
    children,
    popoverContent,
  };

  return <YouQuizPopover {...youQuizPopoverProps} />;
}

CovidTable.propTypes = {
  children: PropTypes.any,
  data: PropTypes.any,
};

export default CovidTable;
