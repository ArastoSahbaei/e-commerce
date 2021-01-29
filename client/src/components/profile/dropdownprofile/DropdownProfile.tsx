import React, { useContext } from 'react'
import './DropdownProfile.css'
import { useHistory } from 'react-router-dom'
import RoutingPath from '../../../routes/RoutingPath'
import { UserContext } from '../../../shared/provider/UserProvider'
import LocalStorage from '../../../shared/cache/LocalStorage'

export const DropdownProfile = () => {
	const history = useHistory()
	const [, setAuthenticatedUser] = useContext(UserContext)

	const logout = () => {
		setAuthenticatedUser({
			authenticated: false,
			id: undefined,
			username: undefined,
			shoppingCart: [{ products: [] }]
		})
		localStorage.removeItem(LocalStorage.authenticationToken)
		history.push(RoutingPath.homeView)
	}

	return (
		<div className="profileDropdown">
			<span>Arasto Sahbaei</span> <br />
			<span>arasto.sahbaei@gmail.com</span>
			<hr />
			<span onClick={() => history.push(RoutingPath.userProfileView)}>Profile</span>
			<span onClick={() => history.push(RoutingPath.userSettingsView)}>Settings</span>
			<span onClick={() => logout()}>Logout</span>
			<hr />
			<span>Theme: Dark mode</span>
			<span>Language: EN</span>
			<span>Location: Unknown</span>
			<span>GDPR</span>
			<span>Report a issue/bug</span>
		</div>
	)
}
