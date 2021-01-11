import React from "react";
import MapTile from "../components/MapTile";
import MapPosition from "../components/MapPosition";
import Marker from "../components/Marker";
import "./Game.css";

const mapSize = {x: 10, y: 10};
const startPosition = {x: Math.floor((mapSize.x+1)/2), y: Math.floor((mapSize.y+1)/2)};

const teamName = "B";
const block = "block";

class Game extends React.Component {
	state = {
		mapSize: mapSize,
		position: startPosition,
		diceValues: [],
		tilesOwner: [],
		positionsMark: [],
		candidatePos: [],
		lineOwner: []
	}

	/**
	 * 주사위를 던져 두 개의 랜덤한 숫자를 출력하고 이동할 수 있는 위치를 표시한다.
	 * 주사위 하나는 방향(UP = 1, RIGHT = 2, DOWN = 3, LEFT = 4),
	 * 나머지 하나는 거리로 한다.
	 */
	throwDices = () => {
		const { mapSize, position, positionsMark, candidatePos } = this.state;

		// 이미 주사위를 던진 경우
		if(candidatePos.length !== 0) {
			console.log("이동할 좌표 선택해 주세요.");
			
			// === 주사위 초기화 (for debug) ===
			candidatePos.forEach(pos => positionsMark[pos.y][pos.x] = false);
			this.setState({ diceValues: [], positionsMark, candidatePos: [] });
			// =============================

			return;
		}

		// 주사위 결과
		const diceValues = [
			Math.floor(Math.random() * 4) + 1, 
			Math.floor(Math.random() * 4) + 1];

		/**
		 * DIR 방향으로 DIS 거리 이동할 때 도착하는 곳의 좌표를
		 * 후보(candidatePos)에 추가하고 맵에 표시(positionsMark)한다.
		 */
		function addCandidatePos(dir, dis) {
			let candX, candY;		// 이동 가능한 좌표
			switch(dir) {
				case 1:
					candX = position.x;
					candY = Math.max(position.y - dis, 0);
					break;
				case 2:
					candX = Math.min(position.x + dis, mapSize.x);
					candY = position.y;
					break;
				case 3:
					candX = position.x;
					candY = Math.min(position.y + dis, mapSize.y);
					break;
				case 4:
					candX = Math.max(position.x - dis, 0);
					candY = position.y;
					break;
				default:
					return;
			}
			// 현재 위치와 다른 경우에만 후보에 추가
			if(position.x !== candX || position.y !== candY) {
				candidatePos.push({x: candX, y: candY});
				positionsMark[candY][candX] = true;
			}
		};
		
		addCandidatePos(diceValues[0], diceValues[1]);
		if(diceValues[0] !== diceValues[1])
			addCandidatePos(diceValues[1], diceValues[0]);

		if(candidatePos.length === 0)
			return;

		this.setState({ diceValues, positionsMark, candidatePos });
	}

	/**
	 * 파라미터로 들어온 선을 포함하는 닫힌 경로를 찾는다. 
	 * 그리고 그 경로 내부의 TILE 들의 OWNER 로 설정한다.
	 * @param {number} startX 선의 시작점 X 좌표
	 * @param {number} startY 선의 시작점 Y 좌표
	 * @param {number} direction 시작점에서 부터 방향 (1~4:상우하좌)
	 */
	fillTiles(startX, startY, direction, lineOwner) {
		console.log("타일 채우기:", startX, startY, direction);
		const { mapSize, tilesOwner } = this.state;
		const lineOwnerCopy = [];				// for finding closed shape
		const lineOwnerCopy2 = [];			// for finding tiles to fill
		const closedShapeLines = [];		// 닫힌 경로를 구성하는 line
		let preX = startX;
		let preY = startY;
		let dir = direction;
		const shouldFillTiles = [];			// 칠해야 하는 타일

		// deep copy
		lineOwner.forEach(row => {
			const rowCopy = [];
			const rowCopy2 = [];
			row.forEach(owner => {
				rowCopy.push({...owner});
				rowCopy2.push({...owner});
			});
			lineOwnerCopy.push(rowCopy);
			lineOwnerCopy2.push(rowCopy2);
		});

		/**
		 * (curX, curY) 를 꼭짓점으로 하는 선이 있는지 확인하고
		 * 있으면 preX, preY, dir 를 업데이트하고 closed shape 를 구성하는 선에 넣는다.
		 * 연결되어 있는 선이 하나도 없다면 closed shape 를 구성하지 않는 선이므로 제외.
		 */
		function check(curX, curY, up, right, down, left) {
			// 시작했던 line 으로 돌아온 경우, 순환이 있다는 뜻
			if(curX === startX && curY === startY)
				return false;

			if(up && curY > 0 && lineOwnerCopy[curY-1][curX].left === teamName) {
				lineOwnerCopy[curY-1][curX].left = "no";
				preX = curX;
				preY = curY;
				dir = 1;
				closedShapeLines.push({x: curX, y: curY, dir});
			}
			else if(right && lineOwnerCopy[curY][curX].top === teamName) {
				lineOwnerCopy[curY][curX].top = "no";
				preX = curX;
				preY = curY;
				dir = 2;
				closedShapeLines.push({x: curX, y: curY, dir});
			}
			else if(down && lineOwnerCopy[curY][curX].left === teamName) {
				lineOwnerCopy[curY][curX].left = "no";
				preX = curX;
				preY = curY;
				dir = 3;
				closedShapeLines.push({x: curX, y: curY, dir});
			}
			else if(left && curX > 0 && lineOwnerCopy[curY][curX-1].top === teamName) {
				lineOwnerCopy[curY][curX-1].top = "no";
				preX = curX;
				preY = curY;
				dir = 4;
				closedShapeLines.push({x: curX, y: curY, dir});
			}
			else {
				closedShapeLines.pop();
				// 순환이 없는 경우
				if(closedShapeLines.length === 0)
					return false;
				const last = closedShapeLines[closedShapeLines.length-1];
				preX = last.x;
				preY = last.y;
				dir = last.dir;
			}
			return true;
		}

		closedShapeLines.push({x: preX, y: preY, dir});
		if(dir === 1)
			lineOwnerCopy[preY-1][preX].left = "no";
		else if(dir === 2)
			lineOwnerCopy[preY][preX].top = "no";
		else if(dir === 3)
			lineOwnerCopy[preY][preX].left = "no";
		else if(dir === 4)
			lineOwnerCopy[preY][preX-1].top = "no";

		while(true) {
			console.log(preX, preY, dir);
			// UP 방향의 선인 경우: 위, 오른쪽, 왼쪽과 연결되어 있는지 확인
			if(dir === 1) {
				if(!check(preX, preY-1, true, true, false, true))
					break;
			}
			// RIGHT 방향의 선인 경우: 위, 오른쪽, 아래와 연결되어 있는지 확인
			else if(dir === 2) {
				if(!check(preX+1, preY, true, true, true, false))
					break;
			}
			// DOWN 방향의 선인 경우: 오른쪽, 아래, 왼쪽과 연결되어 있는지 확인
			else if(dir === 3) {
				if(!check(preX, preY+1, false, true, true, true))
					break;
			}
			// LEFT 방향의 선인 경우: 위, 아래, 왼쪽과 연결되어 있는지 확인
			else if(dir === 4) {
				if(!check(preX-1, preY, true, false, true, true))
					break;
			}
		}

		console.log(closedShapeLines);

		if(closedShapeLines.length === 0)
			return [];

		// 확실히 칠해지는 한 타일을 찾기 위해, 가장 왼쪽에 있는 타일을 찾는다.
		let mostLeftTile = {...mapSize};
		for(let i=0; i<closedShapeLines.length; i++) {
			const {x, y, dir} = closedShapeLines[i];
			if(mostLeftTile.x > x) {
				if(dir === 1 && tilesOwner[y-1][x] !== teamName)
					mostLeftTile = {x, y: y-1};
				else if(dir === 3 && tilesOwner[y][x] !== teamName)
					mostLeftTile = {x, y};
			}
		}
		console.log(mostLeftTile);
		shouldFillTiles.push( mostLeftTile );

		// mostLeftTile 을 시작으로 인접한 타일을 칠하고 배열에 추가
		for(let i=0; i<shouldFillTiles.length; i++) {
			const tile = shouldFillTiles[i];
			console.log("타일:", tile);
			if(lineOwnerCopy2[tile.y][tile.x].top !== teamName) {
				lineOwnerCopy2[tile.y][tile.x].top = teamName;
				shouldFillTiles.push({x: tile.x, y: tile.y-1});
			}
			if(lineOwnerCopy2[tile.y][tile.x].left !== teamName) {
				lineOwnerCopy2[tile.y][tile.x].left = teamName;
				shouldFillTiles.push({x: tile.x-1, y: tile.y});
			}
			if(lineOwnerCopy2[tile.y][tile.x+1].left !== teamName) {
				lineOwnerCopy2[tile.y][tile.x+1].left = teamName;
				shouldFillTiles.push({x: tile.x+1, y: tile.y});
			}
			if(lineOwnerCopy2[tile.y+1][tile.x].top !== teamName) {
				lineOwnerCopy2[tile.y+1][tile.x].top = teamName;
				shouldFillTiles.push({x: tile.x, y: tile.y+1});
			}
			// 칠한 타일의 내부선/외곽선 block 하기
			lineOwner[tile.y][tile.x].top = block;
			lineOwner[tile.y][tile.x].left = block;
			lineOwner[tile.y][tile.x+1].left = block;
			lineOwner[tile.y+1][tile.x].top = block;
		};

		// 외곽선은 다시 block 풀기
		// closedShapeLines.forEach(line => {
		// 	const {x, y, dir} = line;
		// 	if(dir === 1 && !(tilesOwner[y-1][x] === teamName && x > 0 && tilesOwner[y-1][x-1] === teamName))
		// 		lineOwner[y-1][x].left = teamName;
		// 	else if(dir === 2 && !(tilesOwner[y][x] === teamName && y > 0 && tilesOwner[y-1][x] === teamName))
		// 		lineOwner[y][x].top = teamName;
		// 	else if(dir === 3 && !(tilesOwner[y][x] === teamName && x > 0 && tilesOwner[y][x-1] === teamName))
		// 		lineOwner[y][x].left = teamName;
		// 	else if(dir === 4 && !(tilesOwner[y][x-1] === teamName && y > 0 && tilesOwner[y-1][x-1] === teamName))
		// 		lineOwner[y][x-1].top = teamName;
		// });

		console.log("결과 타일:", shouldFillTiles);
		return shouldFillTiles;
	}

	handleClick = (e, x, y) => {
		const { mapSize, position, tilesOwner, positionsMark, candidatePos, lineOwner } = this.state;
		let newPosition;
		const shouldFillTiles = [];
		const lineOwnerCopy = [];
		
		console.log("타일 클릭:", x, y);

		// 후보들 중에 클릭한 좌표가 있는지 검사
		for(let i=0; i<candidatePos.length; i++) {
			const pos = candidatePos[i];
			if(pos.x === x && pos.y === y) {
				newPosition = pos;
				break;
			}
		}
		if(newPosition === undefined)
			return;

		// 후보 좌표 마크 제거
		candidatePos.forEach(pos => positionsMark[pos.y][pos.x] = false);

		// deep copy
		lineOwner.forEach(row => {
			const rowCopy = [];
			row.forEach(owner => rowCopy.push({...owner}));
			lineOwnerCopy.push(rowCopy);
		});

		// x 축 방향으로 선을 그을 때
		if(position.x !== newPosition.x) {
			const next = position.x < newPosition.x ? 1 : -1;
			for(let i=position.x; i !== newPosition.x; i=i+next) {
				if(next === 1) {
					if(lineOwnerCopy[position.y][i].top !== teamName &&
						 lineOwnerCopy[position.y][i].top !== block) {
						lineOwnerCopy[position.y][i] = {...lineOwnerCopy[position.y][i], top: teamName};
						if((i < mapSize.x && (lineOwnerCopy[position.y][i+1].top === teamName || lineOwnerCopy[position.y][i+1].left === teamName))
							||
							(position.y > 0 && lineOwnerCopy[position.y-1][i+1].left === teamName))
							shouldFillTiles.push(...this.fillTiles(i, position.y, 2, lineOwnerCopy));
					}
				}
				else {
					if(lineOwnerCopy[position.y][i-1].top !== teamName &&
						 lineOwnerCopy[position.y][i-1].top !== block) {
						lineOwnerCopy[position.y][i-1] = {...lineOwnerCopy[position.y][i-1], top: teamName};
						if((i-2 >= 0 && lineOwnerCopy[position.y][i-2].top === teamName) ||
							 (i-1 >= 0 && lineOwnerCopy[position.y][i-1].left === teamName) ||
							 (position.y > 0 && i > 0 && lineOwnerCopy[position.y-1][i-1].left === teamName))
							 shouldFillTiles.push(...this.fillTiles(i, position.y, 4, lineOwnerCopy));
					}
				}
			}
		}
		// y 축 방향으로 선을 그을 때
		else {
			const next = position.y < newPosition.y ? 1 : -1;
			for(let i=position.y; i !== newPosition.y; i=i+next) {
				if(next === 1) {
					if(lineOwnerCopy[i][position.x].left !== teamName &&
						 lineOwnerCopy[i][position.x].left !== block) {
						lineOwnerCopy[i][position.x] = {...lineOwnerCopy[i][position.x], left: teamName};
						if(i < mapSize.y && 
							(lineOwnerCopy[i+1][position.x].top === teamName || 
							 lineOwnerCopy[i+1][position.x].left === teamName ||
							 (position.x > 0 && lineOwnerCopy[i+1][position.x-1].top === teamName)))
							 shouldFillTiles.push(...this.fillTiles(position.x, i, 3, lineOwnerCopy));
					}
				}
				else {
					if(lineOwnerCopy[i-1][position.x].left !== teamName &&
						 lineOwnerCopy[i-1][position.x].left !== block) {
						lineOwnerCopy[i-1][position.x] = {...lineOwnerCopy[i-1][position.x], left: teamName};
						if((i > 0 && lineOwnerCopy[i-1][position.x].top === teamName) ||
							 (i > 1 && lineOwnerCopy[i-2][position.x].left === teamName) ||
							 (i > 0 && position.x > 0 && lineOwnerCopy[i-1][position.x-1].top === teamName))
							 shouldFillTiles.push(...this.fillTiles(position.x, i, 1, lineOwnerCopy));
					}
				}
			}
		}
		console.log("칠해야 하는 타일:", shouldFillTiles);
		shouldFillTiles.forEach(tile => tilesOwner[tile.y][tile.x] = teamName);
		this.setState({ position: newPosition, diceValues: [], tilesOwner, positionsMark, candidatePos: [], lineOwner: lineOwnerCopy });
	}

	componentDidMount() {
		const { tilesOwner, positionsMark, mapSize: {x, y}, lineOwner } = this.state;

		for (let j=0; j<=y; j++) {
			const tilesOwnerRow = [];
			const markRow = [];
			const lineOwnerRow = [];

			for (let i=0; i<=x; i++) {
				tilesOwnerRow.push("no");
				markRow.push(false);
				lineOwnerRow.push({top: "no", left: "no"});
			}
			tilesOwner.push(tilesOwnerRow);
			positionsMark.push(markRow);
			lineOwner.push(lineOwnerRow);
		}
		this.setState({ tilesOwner, positionsMark, lineOwner });
	}

	render() {
		const { mapSize, diceValues, position, tilesOwner, positionsMark, lineOwner } = this.state;
		const {
			throwDices,
			handleClick
		} = this;

		return (
			<div className="container">
				<div>Game Main</div>
				{diceValues.length !== 0 ?
				<div>one:{diceValues[0]} two:{diceValues[1]}</div>
				:
				<div>주사위를 던져주세요</div>
				}
				<button
				onClick={throwDices}>
					주사위 던지기
				</button>
				<div className="mapContainer">
				<MapTile mapSize={mapSize} tilesOwner={tilesOwner} lineOwner={lineOwner} />
				<MapPosition
					positionsMark={positionsMark}
					handleClick={handleClick} />
					<Marker owner={teamName} position={position} />
				</div>
			</div>
		)
	}
}

export default Game;