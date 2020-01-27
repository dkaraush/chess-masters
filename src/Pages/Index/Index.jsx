import React from 'react';

import Button from '../../Components/Button/Button';
import ChessGame from '../../Components/ChessGame/ChessGame';

import './Index.css';

export default function () {
	return (
		<div id="index">
			<div className="main">
				<div>
					<h1>Take your chess game to the next level</h1>
					<p>Connect with top ranked chess players from around the world and learn the secrets to becoming a chess master.</p>
					<Button>Become A Master</Button>
				</div>
			</div>
			<div className="chess">
				<ChessGame />
			</div>
			<div className="bg">
				<span />
				<span />
				<span />
			</div>
		</div>
	);
}