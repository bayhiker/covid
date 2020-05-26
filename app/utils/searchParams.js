/* eslint-disable no-param-reassign */
export function updateCovidState(covidState, urlSearchString) {
  const urlParams = new URLSearchParams(urlSearchString);
  const m = urlParams.get('m');
  const p = urlParams.get('p');
  if (m) {
    if (m.includes('c')) {
      covidState.colorMapBy = 'confirmed';
    }
    if (m.includes('d')) {
      covidState.colorMapBy = 'deaths';
    }
    if (m.includes('n')) {
      covidState.colorMapNewCases = true;
    }
    if (m.includes('p')) {
      covidState.colorMapPerCapita = true;
    }
  }
  if (p) {
    covidState.currentPlotTab = parseInt(p, 10);
  }
}

export function getSearchString(covidState) {
  const urlSearchParams = new URLSearchParams();
  const map = `${covidState.colorMapBy === 'confirmed' ? 'c' : 'd'}${
    covidState.colorMapNewCases ? 'n' : ''
  }${covidState.colorMapPerCapita ? 'p' : ''}`;
  const plot = `${covidState.currentPlotTab}`;
  urlSearchParams.append('m', map);
  urlSearchParams.append('p', plot);
  return urlSearchParams.toString();
}
