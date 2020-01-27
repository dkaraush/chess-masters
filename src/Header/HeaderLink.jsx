import React from 'react';

import { Link, withRouter } from 'react-router-dom';
import _Button from '../Components/Button/Button';

const Button = withRouter(_Button);

class HeaderLink extends React.Component {
	constructor(props) {
		super(props);

		this.id = ~~(Math.random() * 9999) + "";
		this.route = this.props.route;

		this.state = { active: window.location.pathname === this.route }
	}

	componentDidMount() {
		if (typeof HeaderLink.all[this.route] === 'undefined')
			HeaderLink.all[this.route] = {};
		HeaderLink.all[this.route][this.id] = this;
	}

	componentWillUnmount() {
		if (typeof HeaderLink.all[this.route] === 'undefined' ||
			typeof HeaderLink.all[this.route][this.id] === 'undefined')
			return;
		delete HeaderLink.all[this.route][this.id];
	}

	update() {
		for (let route in HeaderLink.all) {
			let isActive = route === this.props.route;
			for (let id in HeaderLink.all[route]) {
				let link = HeaderLink.all[route][id];
				if (isActive != link.state.active)
					link.setState({ active: isActive });
			}
		}
	}

	render() {
		return (
			<Button to={ this.props.route } 
				  onClick={this.update.bind(this)}
				  className={this.state.active ? 'active' : ''}>
				{ this.props.children }
			</Button>
		);
	}
}
HeaderLink.all = [];

export default HeaderLink;