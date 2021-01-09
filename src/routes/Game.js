import React from "react";
import Map from "../components/Map";
import Marker from "../components/Marker";
import "./Game.css";

const mapSize = {x: 9, y: 9};
const startPosition = {x: Math.floor(mapSize.x/2), y: Math.floor(mapSize.y/2)};

class Game extends React.Component {
	state = {
		mapSize: mapSize,
		position: startPosition,
		diceValues: [0, 0],
		tilesMark: [],
		candidatePos: [undefined, undefined]
	}

	throwDices = () => {
		console.log("주사위 던짐!");
		const { position, tilesMark, candidatePos } = this.state;
		if(candidatePos[0] !== undefined) {
			console.log("이동할 좌표 선택해 주세요.");
			return;
		}

		const one = Math.floor(Math.random() * 4) + 1;
		const two = Math.floor(Math.random() * 4) + 1;
		let x, y;

		switch(one) {
			case 1:
				x = position.x;
				y = position.y - two;
			break;
			case 2:
				x = position.x + two;
				y = position.y;
			break;
			case 3:
				x = position.x;
				y = position.y + two;
			break;
			case 4:
				x = position.x - two;
				y = position.y;
			break;
			default:
				return;
		}

		candidatePos[0] = {x, y};
		tilesMark[y][x] = true;

		if(one !== two) {
			switch(two) {
				case 1:
					x = position.x;
					y = position.y - two;
				break;
				case 2:
					x = position.x + two;
					y = position.y;
				break;
				case 3:
					x = position.x;
					y = position.y + two;
				break;
				case 4:
					x = position.x - two;
					y = position.y;
				break;
				default:
					return;
			}
			candidatePos[1] = {x, y};
			tilesMark[y][x] = true;
		}

		this.setState({ diceValues: [one, two], tilesMark, candidatePos });
	}

	handleClick = (e, x, y) => {
		const { tilesMark, candidatePos } = this.state;
		console.log("click:", x, y);

		if(candidatePos[0] === undefined)
			return;

		let newPosition;

		if(candidatePos[0].x === x && candidatePos[0].y === y)
			newPosition = candidatePos[0];
		else if(candidatePos !== undefined) {
			if(candidatePos[1].x === x && candidatePos[1].y === y)
				newPosition = candidatePos[1];
			else
				return;
			tilesMark[candidatePos[1].y][candidatePos[1].x] = false;
		}
		else
			return;

		tilesMark[candidatePos[0].y][candidatePos[0].x] = false;
		this.setState({ position: newPosition, diceValues: [0, 0], tilesMark, candidatePos: [undefined, undefined] });
	// 	const { x, y } = e.target.id;
	// 	const { candidatePos, tiles } = this.state;

	// 	if (candidatePos[0] !== undefined) {
	// 		tiles[candidatePos[0].y][candidatePos[0].x] = 
	// 		<div
	// 		key={candidatePos[0].x}
	// 		onClick={this.handleClick}>
	// 			<Tile
	// 			key={candidatePos[0].x}
	// 			id={{x: candidatePos[0].x, y: candidatePos[0].y}}
	// 			owner={1}
	// 			isMark={false} />
	// 		</div>;

	// 		if (candidatePos[1] !== undefined)
	// 			tiles[candidatePos[1].y][candidatePos[1].x] = 
	// 			<div
	// 			key={candidatePos[1].x}
	// 			onClick={this.handleClick}>
	// 				<Tile
	// 				key={candidatePos[1].x}
	// 				id={{x: candidatePos[1].x, y: candidatePos[1].y}}
	// 				owner={1}
	// 				isMark={false} />
	// 			</div>;
	// 	}

	// 	this.setState({ candidatePos: [undefined, undefined] });
	}

	componentDidMount() {
		const { x, y } = this.state.mapSize;
		const tilesMark = [];

		for (let j=0; j<y; j++) {
			const row = [];

			for (let i=0; i<x; i++)
				row.push(false);
			tilesMark.push(row);
		}
		this.setState({ tilesMark });
	}

	render() {
		const { diceValues, position, tilesMark } = this.state;
		const {
			throwDices,
			handleClick
		} = this;

		console.log("현재 위치:", position);
		console.log("주사위 결과:", diceValues);
		console.log("tilesMark:", tilesMark);

		return (
			<div className="container">
				<div>Game Main</div>
				<div>one:{diceValues[0]} two:{diceValues[1]}</div>
				<button
				onClick={throwDices}>
					주사위 던지기
				</button>
				<div className="mapContainer">
					<Map
					tilesMark={tilesMark}
					handleClick={handleClick} />
					<Marker id={1} position={position} />
				</div>
			</div>
		)
	}
}

export default Game;