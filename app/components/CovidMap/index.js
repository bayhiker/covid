import React from 'react';
import PropTypes from 'prop-types';
// import styled from 'styled-components';

import MoreIcon from '@material-ui/icons/MoreVert';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Annotation,
  ZoomableGroup,
} from 'react-simple-maps';
import { scaleQuantize } from 'd3-scale';
import { geoCentroid } from 'd3';
import ReactTooltip from 'react-tooltip';
import {
  Typography,
  Slider,
  makeStyles,
  Toolbar,
  FormControl,
  FormControlLabel,
  Switch,
  Menu,
  MenuItem,
  IconButton,
  FormLabel,
  RadioGroup,
  Radio,
} from '@material-ui/core';

import {
  usStates,
  zoomLevelIsCountry,
  zoomLevelIsCounty,
  geoIsCounty,
  geoIsState,
} from '../../utils/mapUtils';
import { CenteredSection } from '../../utils/styledUtil';
import {
  titleToDate,
  dateToTitle,
  dateToShortTitle,
  prevDateTitle,
  getDaysApart,
  newDateWithOffset,
} from '../../utils/dateUtils';

const colorScale = scaleQuantize()
  .domain([1, 10])
  .range([
    '#ffedea',
    '#ffcec5',
    '#ffad9f',
    '#ff8a75',
    '#ff5533',
    '#e2492d',
    '#be3d26',
    '#9a311f',
    '#782618',
  ]);

const stateOffsets = {
  VT: [50, -8],
  NH: [34, 2],
  MA: [30, -1],
  RI: [28, 2],
  CT: [35, 10],
  NJ: [34, 1],
  DE: [33, 0],
  MD: [47, 10],
  DC: [49, 21],
};

const BIG_CASE_NUMBER = 10000000;
const DEFAULT_NEW_CASES = {
  confirmed: {
    minCases: BIG_CASE_NUMBER,
    maxCases: -1,
    minPerCapita: BIG_CASE_NUMBER,
    maxPerCapita: -1,
  },
  deaths: {
    minCases: BIG_CASE_NUMBER,
    maxCases: -1,
    minPerCapita: BIG_CASE_NUMBER,
    maxPerCapita: -1,
  },
}; // New cases on most recent date

const useStyles = makeStyles(theme => ({
  grow: {
    flexGrow: 1,
  },
  sectionDesktop: {
    display: 'none',
    [theme.breakpoints.up('md')]: {
      display: 'flex',
    },
  },
  sectionMobile: {
    display: 'flex',
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
}));

function CovidMap({
  data,
  currentDate,
  zoomState,
  searchWith,
  colorMapBy,
  colorMapPerCapita,
  colorMapNewCases,
  onUpdateUserState,
  onChangeCurrentDate,
  onChangeColorMapBy,
  onChangeColorMapPerCapita,
  onChangeColorMapNewCases,
}) {
  const classes = useStyles();
  const [tooltipContent, setTooltipContent] = React.useState('');
  const [newCases, setNewCases] = React.useState(DEFAULT_NEW_CASES);
  const [mostRecentDate, setMostRecentDate] = React.useState();
  const [sliderMarks, setSliderMarks] = React.useState([]);
  const [logBounds, setLogBounds] = React.useState({
    lower: 0,
    span: 20,
  });
  let caption = '';
  const { population, names } = data;

  const recalculateBounds = () => {
    if (
      !currentDate ||
      !data ||
      !data[colorMapBy] ||
      !newCases ||
      !newCases[colorMapBy]
    ) {
      return;
    }
    const cases = colorMapNewCases
      ? newCases[colorMapBy]
      : data[colorMapBy][currentDate];
    const minCases = colorMapPerCapita ? cases.minPerCapita : cases.minCases;
    const maxCases = colorMapPerCapita ? cases.maxPerCapita : cases.maxCases;

    logBounds.lower = minCases === 0 ? 0 : Math.log2(minCases);
    logBounds.span =
      (maxCases === 0 ? 0 : Math.log2(maxCases)) - logBounds.lower;
  };

  React.useEffect(() => {
    if (!data || !data.most_recent_date) {
      return;
    }
    setMostRecentDate(data.most_recent_date);
    updateSliderMarks();
    recalculateNewCases();
    recalculateBounds();
  }, [data, currentDate]);

  // Recalculate bounds even if no data was reloaded, for example if perCapita switch changed
  recalculateBounds();

  const getAllZeroCases = caseType => {
    const allZeroCases = {
      minCases: 0,
      maxCases: 0,
      minPerCapita: 0,
      maxPerCapita: 0,
    };
    if (!data || !data.most_recent_date) {
      return allZeroCases;
    }
    // Assuming we always have data for most recent day
    const dataMostRecentDay = data[caseType][data.most_recent_date];
    Object.keys(dataMostRecentDay).forEach(fips => {
      if (!fips || !/^\d+$/.test(fips)) {
        return;
      }
      allZeroCases[fips] = 0;
    });
    return allZeroCases;
  };

  const updateSliderMarks = () => {
    if (!data.most_recent_date) {
      return;
    }
    const newSliderMarks = [];
    const endDate = titleToDate(data.most_recent_date);
    const totalDays = getDaysApart(
      data.least_recent_date,
      data.most_recent_date,
    );
    // Add a total of 5 markers
    let i = 0 - totalDays;
    for (; i <= 0; i += Math.floor(totalDays / 5)) {
      newSliderMarks.push({
        value: i,
        label: dateToShortTitle(newDateWithOffset(endDate, i)),
      });
    }
    setSliderMarks(newSliderMarks);
  };

  const recalculateNewCases = () => {
    if (!currentDate) {
      return;
    }
    const updatedNewCases = DEFAULT_NEW_CASES;
    ['confirmed', 'deaths'].forEach(caseType => {
      const dataToday = data[caseType][currentDate];
      const dataYesterday = data[caseType][prevDateTitle(currentDate)];
      if (!dataToday) {
        updatedNewCases[caseType] = getAllZeroCases(caseType);
        return;
      }
      if (!dataYesterday) {
        updatedNewCases[caseType] = dataToday;
        return;
      }
      Object.keys(dataToday).forEach(fips => {
        if (!fips || !/^\d+$/.test(fips)) {
          return;
        }
        const newCasesForFips = dataToday[fips] - dataYesterday[fips];
        updatedNewCases[caseType][fips] = newCasesForFips;
        const newCasesPerCapita =
          (newCasesForFips / population[fips]) * 10 ** 6;
        if (
          newCasesForFips < 0 ||
          Number.isNaN(newCasesForFips) ||
          !Number.isFinite(newCasesForFips) ||
          newCasesPerCapita < 0 ||
          Number.isNaN(newCasesPerCapita) ||
          !Number.isFinite(newCasesPerCapita)
        ) {
          return;
        }
        if (newCasesForFips < newCases[caseType].minCases) {
          newCases[caseType].minCases = newCasesForFips;
        }
        if (newCasesForFips > newCases[caseType].maxCases) {
          newCases[caseType].maxCases = newCasesForFips;
        }
        if (newCasesPerCapita < newCases[caseType].minPerCapita) {
          newCases[caseType].minPerCapita = newCasesPerCapita;
        }
        if (newCasesPerCapita > newCases[caseType].maxPerCapita) {
          newCases[caseType].maxPerCapita = newCasesPerCapita;
        }
      });
    });
    setNewCases(updatedNewCases);
  };

  const getScale = cases => {
    let scale = 0;
    if (cases > 1 && logBounds.span !== 0) {
      scale = Math.floor(
        ((Math.log2(cases) - logBounds.lower) / logBounds.span) * 10,
      );
    }
    return scale;
  };

  const haveDataForGeo = geo => {
    if (zoomLevelIsCountry(zoomState)) {
      return true;
    }
    const currentLoadedGeo = zoomState.geoId;
    if (currentLoadedGeo === undefined || !geo || !geo.id) {
      return false;
    }
    return (
      geo.id === currentLoadedGeo ||
      geo.id.substring(0, 2) === currentLoadedGeo.substring(0, 2)
    );
  };

  const getGeoStats = (geo, date) => {
    const stats = {};
    stats.fipsFormatted = formatGeoId(geo.id);
    stats.geoName = names[stats.fipsFormatted];
    stats.population = population[stats.fipsFormatted];
    stats.confirmed = colorMapNewCases
      ? newCases.confirmed[stats.fipsFormatted]
      : data.confirmed[date][stats.fipsFormatted];
    stats.confirmedPerM = Math.ceil(
      (stats.confirmed / stats.population) * 10 ** 6,
    );
    stats.deaths = colorMapNewCases
      ? newCases.deaths[stats.fipsFormatted]
      : data.deaths[date][stats.fipsFormatted];
    stats.deathsPerM = Math.ceil((stats.deaths / stats.population) * 10 ** 6);
    stats.centroid = geoCentroid(geo);
    return stats;
  };

  const getStateMarkerAnnotation = geo => {
    if (
      !names ||
      !population ||
      !(zoomLevelIsCountry(zoomState) || zoomLevelIsCounty(zoomState)) ||
      !haveDataForGeo(geo)
    ) {
      return false;
    }
    const geoStats = getGeoStats(geo, currentDate);
    const isCounty = geoIsCounty(geo.id);
    let geoAbbreviation = 'US';
    if (isCounty) {
      geoAbbreviation = names[geo.id];
    } else if (geoIsState(geo.id)) {
      if (geo.id in usStates) {
        geoAbbreviation = usStates[geo.id].abbr;
      }
    }

    let suffix = '';
    if (colorMapPerCapita) {
      suffix = `${
        colorMapBy === 'confirmed'
          ? geoStats.confirmedPerM
          : geoStats.deathsPerM
      }`;
    } else if (colorMapBy === 'confirmed') {
      if (geoStats.confirmed >= 1000) {
        suffix = `${Math.ceil(geoStats.confirmed / 1000)}K`;
      } else {
        suffix = `${geoStats.confirmed}`;
      }
    } else {
      suffix = `${geoStats.deaths}`;
    }
    const getGeoMarkerOrAnnotation = () =>
      geoStats.geoName &&
      geoAbbreviation &&
      geoStats.centroid[0] > -160 &&
      geoStats.centroid[0] < -67 &&
      (geoAbbreviation in stateOffsets ? (
        <Annotation
          subject={geoStats.centroid}
          dx={stateOffsets[geoAbbreviation][0]}
          dy={stateOffsets[geoAbbreviation][1]}
          onClick={() => {
            handleMapClick(geo);
          }}
        >
          <text x={4} fontSize={14} alignmentBaseline="middle">
            {`${geoAbbreviation}(${suffix})`}
          </text>
        </Annotation>
      ) : (
        <Marker
          coordinates={geoStats.centroid}
          onClick={() => {
            handleMapClick(geo);
          }}
        >
          <text y="2" fontSize={isCounty ? 2 : 14} textAnchor="middle">
            {`${geoAbbreviation}(${suffix})`}
          </text>
        </Marker>
      ));

    return (
      <g
        key={`${geo.rsmKey}-name`}
        onMouseEnter={() => {
          setTooltipContent(getTooltipContent(geo));
        }}
        onMouseLeave={() => {
          setTooltipContent('');
        }}
      >
        {zoomLevelIsCountry(zoomState) || zoomLevelIsCounty(zoomState)
          ? getGeoMarkerOrAnnotation(geo)
          : ''}
      </g>
    );
  };

  const getStateOrCountyGeography = geo => {
    if (!names || !population || !haveDataForGeo(geo)) {
      return false;
    }
    let cases = 0;
    const fipsFormatted = formatGeoId(geo.id);
    if (data && currentDate) {
      cases = colorMapNewCases
        ? newCases[colorMapBy][fipsFormatted]
        : data[colorMapBy][currentDate][fipsFormatted];
      if (colorMapPerCapita) {
        cases = (cases / population[fipsFormatted]) * 10 ** 6;
      }
    }
    return (
      <Geography
        key={geo.rsmKey}
        geography={geo}
        fill={colorScale(cases !== undefined ? getScale(cases) : '#EEE')}
        onMouseEnter={() => {
          setTooltipContent(getTooltipContent(geo));
        }}
        onMouseLeave={() => {
          setTooltipContent('');
        }}
        onClick={() => {
          handleMapClick(geo);
        }}
        style={{
          default: {
            stroke: '#607D8B',
            strokeWidth: 0.25,
            outline: 'none',
          },
          hover: {
            stroke: '#607D8B',
            strokeWidth: 0.5,
            outline: 'none',
          },
          pressed: {
            stroke: '#607D8B',
            strokeWidth: 0.5,
            outline: 'none',
          },
        }}
      />
    );
  };

  const getTooltipContent = geo => {
    const geoStats = getGeoStats(geo, currentDate);
    return `${geoStats.geoName} (${currentDate})<br>
    Deaths: ${geoStats.deaths} (${geoStats.deathsPerM}/M)}<br>
    Confirmed: ${geoStats.confirmed}
    (${geoStats.confirmedPerM}/M)<br>
    Population: ${geoStats.population.toLocaleString()}`;
  };

  const handleMapClick = geo => {
    const newZoomState = {
      geoId: geo.id,
    };
    if (zoomState.zoom < 2) {
      // Do NOT zoom out if already zoomed in to county level
      newZoomState.zoom = 2;
      newZoomState.center = geoCentroid(geo);
    } else if (zoomState.zoom < 8) {
      newZoomState.zoom = 8;
      newZoomState.center = geoCentroid(geo);
    }
    onUpdateUserState({ zoomState: newZoomState });
  };

  const formatGeoId = geoId => {
    if (geoId === undefined) {
      return '0';
    }
    if (geoId.length <= 2) {
      return `${geoId}`.padStart(2, '0');
    }
    if (geoId.length <= 5) {
      return `${geoId}`.padStart(5, '0');
    }
    // We really shouldn't be here. If we are here, something was wrong
    return geoId;
  };

  const handleSliderChange = (event, newValue) => {
    onChangeCurrentDate(
      dateToTitle(
        newDateWithOffset(titleToDate(data.most_recent_date), newValue),
      ),
    );
  };

  recalculateBounds(data);

  if (zoomLevelIsCountry(zoomState) && colorMapPerCapita) {
    caption = 'Per Million';
  } else {
    caption = '';
  }

  const getValueText = value => {
    if (!data || !data.most_recent_date) {
      return '0/0';
    }
    const d = newDateWithOffset(titleToDate(data.most_recent_date), value);
    return mostRecentDate ? dateToShortTitle(d) : '0/0';
  };

  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState(null);

  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleMobileMenuOpen = event => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const colorMapByRadioGroup = (
    <FormControl component="fieldset">
      <FormLabel component="legend">Color Map By</FormLabel>
      <RadioGroup
        row
        aria-label="position"
        name="colorMapBy"
        value={colorMapBy}
        defaultValue="confirmed"
        onChange={onChangeColorMapBy}
      >
        <FormControlLabel
          value="confirmed"
          control={<Radio color="primary" />}
          label={
            <Typography className={classes.blackText}>Confirmed</Typography>
          }
        />
        <FormControlLabel
          value="deaths"
          control={<Radio color="primary" />}
          label={<Typography className={classes.blackText}>Deaths</Typography>}
        />
      </RadioGroup>
    </FormControl>
  );
  const colorMapPerCapitaSwitch = (
    <FormControlLabel
      value="per-capita"
      control={
        <Switch color="secondary" onChange={onChangeColorMapPerCapita} />
      }
      checked={colorMapPerCapita}
      classes={classes.perCapitaSwitch}
      label={<Typography className={classes.blackText}>Per Capita</Typography>}
      labelPlacement="start"
    />
  );
  const colorMapNewCasesSwitch = (
    <FormControlLabel
      value="new-cases"
      control={<Switch color="secondary" onChange={onChangeColorMapNewCases} />}
      checked={colorMapNewCases}
      classes={classes.newCasesSwitch}
      label={<Typography className={classes.blackText}>New Cases</Typography>}
      labelPlacement="start"
    />
  );

  const mobileMenuId = 'primary-search-account-menu-mobile';
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      <MenuItem>{colorMapByRadioGroup}</MenuItem>
      <MenuItem>{colorMapNewCasesSwitch}</MenuItem>
      <MenuItem>{colorMapPerCapitaSwitch}</MenuItem>
    </Menu>
  );

  return !currentDate ? (
    <div />
  ) : (
    <div>
      <CenteredSection>
        <ReactTooltip html>{tooltipContent}</ReactTooltip>
        <div className={classes.grow}>
          <Toolbar>
            <div className={classes.sectionDesktop}>
              {colorMapByRadioGroup}
              <div className={classes.grow} />
              {colorMapNewCasesSwitch}
              {colorMapPerCapitaSwitch}
            </div>
            <div className={classes.sectionMobile}>
              <IconButton
                aria-label="show more"
                aria-controls={mobileMenuId}
                aria-haspopup="true"
                onClick={handleMobileMenuOpen}
                color="inherit"
              >
                <MoreIcon />
              </IconButton>
            </div>
          </Toolbar>
          {renderMobileMenu}
        </div>
        <Typography variant="h4">{caption}</Typography>
        <ComposableMap data-tip="" projection="geoAlbersUsa">
          <ZoomableGroup
            zoom={zoomState.zoom}
            center={zoomState.center}
            onMoveEnd={evt => {
              onUpdateUserState({
                zoomState: { zoom: evt.zoom, center: evt.coordinates },
              });
            }}
          >
            <Geographies geography={zoomState.geoJsonUrl}>
              {({ geographies }) => (
                <>
                  {geographies.map(geo => getStateOrCountyGeography(geo))}
                  {geographies.map(geo => getStateMarkerAnnotation(geo))}
                </>
              )}
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </CenteredSection>
      <Slider
        defaultValue={0}
        getAriaValueText={getValueText}
        valueLabelFormat={getValueText}
        aria-labelledby="discrete-slider-always"
        marks={sliderMarks}
        valueLabelDisplay="on"
        max={0}
        min={sliderMarks && sliderMarks.length > 0 ? sliderMarks[0].value : 0}
        onChange={handleSliderChange}
      />
    </div>
  );
}

CovidMap.propTypes = {
  data: PropTypes.any,
  currentDate: PropTypes.oneOfType(PropTypes.string, PropTypes.bool),
  searchWith: PropTypes.string,
  colorMapBy: PropTypes.oneOf(['confirmed', 'deaths']),
  colorMapNewCases: PropTypes.bool,
  colorMapPerCapita: PropTypes.bool,
  zoomState: PropTypes.any,
  onUpdateUserState: PropTypes.func,
  onChangeCurrentDate: PropTypes.func,
  onChangeColorMapBy: PropTypes.func,
  onChangeColorMapPerCapita: PropTypes.func,
  onChangeColorMapNewCases: PropTypes.func,
};

export default CovidMap;
