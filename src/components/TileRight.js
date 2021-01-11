import React, { createRef } from "react";
import "./Tile.css";

const ownerColors = {
	A: "red",
	B: "blue",
	no: "#e0e0e0",
	mark: "green",
	block: "orange"
};
const WIDTH = 20;
const HEIGHT = 20;

class TileRight extends React.Component {
	state = {
		canvasRef: createRef()
	}

	draw() {
		let { canvasRef } = this.state;
		const { index, left } = this.props;
		let canvas = canvasRef.current;

		if (canvas !== null) {
			let ctx = canvas.getContext('2d');

			// 캔버스 지우기
			ctx.clearRect(0, 0, WIDTH, HEIGHT);

			// left line
			ctx.beginPath();
			ctx.moveTo(0, 0);
			ctx.lineTo(0, HEIGHT);
			ctx.lineWidth = 4;
			ctx.strokeStyle = ownerColors[left];
			ctx.stroke();

			ctx.font = "10px gothic";
			ctx.fillStyle = "black";
			ctx.fillText(index, 10, 10);
		}
	}

	componentDidMount() {
		this.draw();
	}

	shouldComponentUpdate(nextProps) {
		return (this.props.left !== nextProps.left);
	}

	render() {
		const { canvasRef } = this.state;
		console.log("TileRight: render");

		this.draw();

		return (
			<canvas
			ref={canvasRef}
			width={WIDTH} 
			height={HEIGHT} />
		)
	}
}

export default TileRight;