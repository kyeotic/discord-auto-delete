import { Route, Router } from '@solidjs/router'
import { Component, JSX } from 'solid-js'
import ProfilePage from '../user/ProfilePage'
import PlayersPage from '../players/PlayersPage'

export const HOME = '/'
export const UTIL = '/util'
export const USER_PROFILE = '/user/profile'
export const PLAYERS = '/players'

export function Routes(props: { root: Component }): JSX.Element {
  return (
    <Router root={props.root}>
      <Route path={HOME} component={ProfilePage} />
      <Route path={PLAYERS} component={PlayersPage} />
      <Route path={USER_PROFILE} component={ProfilePage} />
      {/* <Route path={UTIL} component={DataUtilities} /> */}
    </Router>
  )
}
