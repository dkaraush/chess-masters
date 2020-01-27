import React from 'react';

import HeaderLink from './HeaderLink';
import { ReactComponent as Logo } from './logo.svg';

import './Header.css';

export default function () {
	return (
		<div id="header">
            <div className="inner">
                <div id="logo">
                	<Logo />
                    <span>ChessMasters</span>
                </div>
                <div id="menu">
                	<HeaderLink route="/">Home</HeaderLink>
                	<HeaderLink route="/how/">How it Works</HeaderLink>
                	<HeaderLink route="/masters/">Our Masters</HeaderLink>
                	<HeaderLink route="/pricing/">Pricing</HeaderLink>
                </div>
            </div>
        </div>
	);
}