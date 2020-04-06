/**
 *
 * App.js
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 *
 */

import React from 'react';
import { Switch, Route } from 'react-router-dom';
import styled from 'styled-components';

import NotFoundPage from 'containers/NotFoundPage/Loadable';
import HomePage from 'containers/HomePage/Loadable';

import GlobalStyle from '../../global-styles';

const AppWrapper = styled.div`
  max-width: calc(1024px + 16px * 2);
  margin: 0 auto;
  display: flex;
  min-height: 100%;
  padding: 0 16px;
  flex-direction: column;
`;

export default function App() {
  return (
    <div>
      <AppWrapper>
        <Switch>
          <Route exact path="/" component={HomePage} />
          <Route component={NotFoundPage} />
        </Switch>
        <GlobalStyle />
      </AppWrapper>
    </div>
  );
}
