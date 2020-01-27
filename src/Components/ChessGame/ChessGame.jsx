import React from 'react';
import Chess from 'chess.js';

import './ChessGame.css';

const THREE = window.THREE;
const cameraSizeW = 3;
const cameraSizeH = 2;
const aspectRatioChange = 1.5;
const levelY = -0.08;
const maxStepsCount = 99999;
const movementDuration = 1000;

const isMobile = ((nav) =>
	/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(nav) ||
	/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(nav.substr(0,4))
)(window.navigator.userAgent || window.navigator.vendor || window.opera);

class ChessGame extends React.Component {
	constructor(props) {
		super(props);

		this.t = 0;
		this.lastTick = Date.now();

		this.state = {loading: true};
		this.status = false;

		this.scene = null;
		this.camera = null;
		this.renderer = null;
		this.width = 0;
		this.height = 0;
		this.aspect = 0;

		this.chessPieces = [];

		this.ref = React.createRef();

		this.chess = new Chess();
		this.count = 0;
		this.lastMovement = null;

		this.models = {};
		this.movement = [];

		this.onResize = this.resize.bind(this);
	}

	downloadModels() {
		let i = 0, n = 0;
		for (let type in ChessGame.modelPathes) {
			n++;
			((type) => {
				let loader = new THREE.BufferGeometryLoader();
				loader.load(ChessGame.modelPathes[type], (model) => {
					this.models[type] = model;
					i++;
					if (i === n) {
						this.setState({loading: false});
						this.init();
					}
				})
			})(type);
		}
	}

	componentDidMount() {
		window.addEventListener('resize', this.onResize);
		this.downloadModels();
	}
	componentWillUnmount() {
		this.status = false;
		window.removeEventListener('resize', this.onResize);
		if (this.scene)
			this.scene = null;
		if (this.camera)
			this.camera = null;
		if (this.renderer)
			this.renderer = null;
	}

	resize() {
		let canvas = this.ref.current;
		if (canvas === null)
			return;
		let parent = canvas.parentElement;

		canvas.width = this.width = parent.clientWidth * window.devicePixelRatio;
		canvas.height = this.height = parent.clientHeight * window.devicePixelRatio;
		this.aspect = this.width / this.height;

		if (this.camera) {
			let bounds = this.cameraBounds();
			this.camera.left = bounds[0];
			this.camera.right = bounds[1];
			this.camera.top = bounds[2];
			this.camera.bottom = bounds[3];
			this.camera.updateProjectionMatrix();
		}
		if (this.scene)
			this.scene.updateMatrixWorld();
		if (this.renderer)
			this.renderer.setSize( this.width, this.height );
	}

	cameraBounds() {
		if (this.aspect > aspectRatioChange) {
			return [
				cameraSizeH * this.aspect / -2,
				cameraSizeH * this.aspect / 2,
				cameraSizeH / 2,
				cameraSizeH / - 2
			];
		} else {
			return [
				cameraSizeW / -2,
				cameraSizeW / 2,
				cameraSizeW / this.aspect / 2,
				cameraSizeW / this.aspect / - 2
			];
		}
	}

	init() {
		let canvas = this.ref.current;
		if (canvas === null) {
			console.warn("canvas is null! at init()");
			return;
		}

		this.resize();

		this.scene = new THREE.Scene();
		// this.camera = new THREE.PerspectiveCamera( 75, this.width/this.height, 0.1, 1000 );
		let bounds = this.cameraBounds();
		this.camera = new THREE.OrthographicCamera(
			bounds[0],
			bounds[1],
			bounds[2],
			bounds[3],
			1, 1000
		);
		this.camera.position.x = 5;
		this.camera.position.y = 5;
		this.camera.position.z = -5;
		this.camera.lookAt(new THREE.Vector3(0,0,0));
		this.scene.add(this.camera);
		window.scene = this.scene;

		this.renderer = new THREE.WebGLRenderer({
			canvas: canvas,
			alpha: true,
			antialias: true
		});
		this.renderer.setSize( this.width, this.height );

		this.light = new THREE.DirectionalLight( 0xffffff, 1);
		this.light.name = "Light";
		this.light.position.set(0.25, 1, -1);
		this.scene.add( this.light );


		this.light2 = new THREE.PointLight( 0xffffff, 0.6, 0 );
		this.light2.name = "Light 2";
		this.light2.position.set(5, 3, -4);
		this.scene.add(this.light2);

		// debug
		// let controls = new THREE.OrbitControls( this.camera , canvas);

		let loader = new THREE.ObjectLoader();
		loader.load('models/board.json', board => {
			board.scale.y = 0.5;
			board.receiveShadow = true;
			this.scene.add(board);
		});

		this.initChess();

		setTimeout(() => {
			this.status = true;
			requestAnimationFrame(this.update.bind(this, true));
		}, 24);
	}

	board() {
		return this.chess.board().map(a => a.map(this.pieceKey));
	}

	initChess() {
		if (!this.chess)
			this.chess = new Chess();

		if (this.chessPieces.length > 0) {
			for (let i = 0; i < this.chessPieces.length; ++i) {
				this.movement.push({
					key: this.chessPieces[i].key,
					from: this.chessPieces[i].pos,
					to: null
				});
			}
			return;
		}

		this.count = 0;
		this.chess.reset();

		let board = this.board();
		for (let y = 0; y < board.length; ++y) {
			for (let x = 0; x < board[y].length; ++x) {
				if (board[y][x] !== null) {
					let piece = this.chessPiece(x, y, board[y][x]);
					this.chessPieces.push({obj: piece, key: board[y][x], pos: [x, y]});
					this.scene.add(piece);
					this.movement.push({
						key: board[y][x],
						to: [x, y],
						from: null
					});
				}
			}
		}
		this.lastMovement = this.t;
	}

	chessPiece(x, y, key) {
		let group = new THREE.Group();
		let piece = new THREE.Mesh(
			this.models[key[1]],
			new THREE.MeshStandardMaterial({
				color: key[0] === 'w' ? 0xC8A98F : 0x7E160E,
				transparent: true,
				opacity: 1,
				depthWrite: false
			})
		);
		piece.castShadow = true;
		piece.receiveShadow = false;
		piece.scale.x = 0.125 * 0.5;
		piece.scale.y = 0.125 * 0.5;
		piece.scale.z = 0.125 * 0.5;
		if (key[1] == 'p') {
			piece.position.x += 0.005;
			piece.position.z -= 0.005;
		}
		piece.position.y = 0.125;
		// if (key[1] === 'n')
		piece.rotation.y = (key[0] === 'w' ? 0.6 : 1.6) * Math.PI;
		group.add(piece);
		let pos = this.toWorldPos(x, levelY, y);
		group.position.set(pos.x, pos.y, pos.z);
		return group;
	}

	pieceKey(data) {
		if (data === null)
			return null;
		return data.color + data.type;
	}

	toWorldPos(x, h, y) {
		return new THREE.Vector3(
			(x - 3.5) * 0.125 * 2, 
			h,
			(-y + 3.5) * 0.125 * 2
		);
	}

	move() {
		for (let i = 0; i < this.movement.length; ++i) {
			let move = this.movement[i];
			let index = this.chessPieces.findIndex(c => 
				(c.pos === null && move.from === null) || 
				(move.from !== null && c.pos[0] === move.from[0] && c.pos[1] === move.from[1]) ||
				(move.from === null && c.pos !== null && move.to !== null &&
				 c.pos[0] === move.to[0] && c.pos[1] === move.to[1])
			);
			if (move.to === null && index >= 0) {
				this.scene.remove(this.chessPieces[index].obj);
				this.chessPieces.splice(index, 1);
			} else if (index >= 0) {
				this.chessPieces[index].pos = move.to;
			}
		}

		this.movement = [];
		if (!this.chess.game_over() && this.count < maxStepsCount) {
			let moves = this.chess.moves();
			let move = moves[~~(Math.random() * (moves.length - 1))];
			let wasBoard = this.board();

			this.chess.move(calcBestMove(isMobile ? 1 : 2, this.chess, this.chess.turn())[1]);
			this.count++;
			let newBoard = this.board();

			let moved = {};
			let go = (type, key, pos) => {
				if (!moved[key])
					moved[key] = [null, null];
				moved[key][type] = pos;
				if (moved[key][1-type] !== null) {
					this.movement.push({
						key: key,
						from: moved[key][0],
						to: moved[key][1]
					});
					delete moved[key];
				}
			}
			for (let y = 0; y < newBoard.length; ++y) {
				for (let x = 0; x < newBoard[y].length; ++x) {
					if (newBoard[y][x] !== wasBoard[y][x]) {
						if (newBoard[y][x] !== null && wasBoard[y][x] !== null) {
							this.movement.push({
								key: wasBoard[y][x],
								from: [x, y],
								to: null
							});

							// TO
							go(1, newBoard[y][x], [x, y]);
						} else if (newBoard[y][x] === null) {
							// FROM
							go(0, wasBoard[y][x], [x, y]);
						} else if (wasBoard[y][x] === null) {
							// TO
							go(1, newBoard[y][x], [x, y]);
						}
					}
				}
			}
			if (Object.keys(moved).length > 0) {
				for (let key in moved) {
					if (moved[key][1] !== null || moved[key][0] !== null) {
						this.movement.push({
							key: key,
							from: moved[key][0],
							to: moved[key][1]
						});
						let pos = moved[key][0] || moved[key][1];
						let piece = this.chessPiece(pos[0], pos[1], key);
						this.chessPieces.push({obj: piece, key: key, pos: pos});
						this.scene.add(piece);
					}
				}
			}
		} else {
			this.initChess();
		}
		this.lastMovement = this.t;
	}

	set(obj, a) {
		obj.position.set(a.x, a.y, a.z);
	}

	minus(a, b) {
		return new THREE.Vector3(a.x-b.x,a.y-b.y,a.z-b.z);
	}

	normalize(a) {
		let dist = a.distanceTo(new THREE.Vector3(0,0,0));
		return new THREE.Vector3(a.x/dist, a.y/dist, a.z/dist);
	}

	animate(t) {
		t = this.range(t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t, 0, 1);

		for (let i = 0; i < this.movement.length; ++i) {
			let move = this.movement[i];
			let index = this.chessPieces.findIndex(c => 
				(c.pos === null && move.from === null) || 
				(move.from !== null && c.pos[0] === move.from[0] && c.pos[1] === move.from[1]) ||
				(move.from === null && c.pos !== null && move.to !== null &&
				 c.pos[0] === move.to[0] && c.pos[1] === move.to[1])
			);
			let piece = this.chessPieces[index].obj;

			if (move.to !== null && move.from !== null && index >= 0) {
				let from = 	this.toWorldPos(move.from[0], levelY, move.from[1]),
					to = 	this.toWorldPos(move.to[0], levelY, move.to[1]);
				let pos = from.lerp(to, t);

				// let dir = this.normalize(this.minus(to, from));
				// let u = Math.sin(t * Math.PI);
				// console.log(dir);
				// var mx = new THREE.Matrix4().lookAt(from, to, new THREE.Vector3(dir.x*u,1,dir.z*u));
				// piece.quaternion.setFromRotationMatrix(mx);

				pos.y = levelY + Math.sin(t * Math.PI) * 0.2;
				this.set(piece, pos);
				piece.children[0].material.depthWrite = true;
			} else if (move.to === null && index >= 0) {
				let u = Math.sin((move.from[0]+move.from[1]) / 14 * Math.PI * 2) / 2 + 1,
					p =  this.range(t*2 - u*0.5, 0, 1);
				this.set(piece,
						 this.toWorldPos(move.from[0], levelY - p*0.05, move.from[1]));
				piece.children[0].material.opacity = 1 - p;
				if (p > 0.5)
					piece.children[0].material.depthWrite = false;
			} else if (move.from === null && index >= 0) {
				let u = Math.sin((move.to[0]+move.to[1]) / 14 * Math.PI * 2) / 2 + 1,
					p =  this.range(t*2 - u*0.5, 0, 1);
				this.set(piece,
						 this.toWorldPos(move.to[0], levelY + (1-p)*0.05, move.to[1]));
				piece.children[0].material.opacity = p;
				piece.children[0].material.depthWrite = true;
			}
		}
	}

	range(x, min, max) {
		return Math.min(Math.max(x, min), max);
	}

	update(loop) {
		if (!this.status)
			return;
		if (loop)
			requestAnimationFrame(this.update.bind(this, true));

		this.t += this.range(Date.now() - this.lastTick, 0, 20);
		this.lastTick = Date.now();

		if (this.t - this.lastMovement > movementDuration)
			this.move();

		this.animate((this.t - this.lastMovement) / movementDuration);

		this.renderer.render(this.scene, this.camera);
	}

	render() {
		return (
			<div className={"chess-demo" + (this.state.loading ? " loading" : "")}>
				<canvas ref={this.ref} />
			</div>
		);
	}
}
ChessGame.modelPathes = {
	'p': 'models/pawn.json',
	'n': 'models/knight.json',
	'q': 'models/queen.json',
	'k': 'models/king.json',
	'b': 'models/bishop.json',
	'r': 'models/rook.json'
};

var evaluateBoard = function(board, color) {
  // Sets the value for each piece using standard piece value
  var pieceValue = {
    'p': 100,
    'n': 350,
    'b': 350,
    'r': 525,
    'q': 1000,
    'k': 10000
  };

  // Loop through all pieces on the board and sum up total
  var value = 0;
  board.forEach(function(row) {
    row.forEach(function(piece) {
      if (piece) {
        // Subtract piece value if it is opponent's piece
        value += pieceValue[piece['type']]
                 * (piece['color'] === color ? 1 : -1);
      }
    });
  });

  return value;
};
var calcBestMove = function(depth, game, playerColor,
                            alpha=Number.NEGATIVE_INFINITY,
                            beta=Number.POSITIVE_INFINITY,
                            isMaximizingPlayer=true) {
  let value;
  if (depth === 0) {
    value = evaluateBoard(game.board(), playerColor);
    return [value, null]
  }

  // Recursive case: search possible moves
  var bestMove = null; // best move not set yet
  var possibleMoves = game.moves();
  // Set random order for possible moves
  possibleMoves.sort(function(a, b){return 0.5 - Math.random()});
  // Set a default best move value
  var bestMoveValue = isMaximizingPlayer ? Number.NEGATIVE_INFINITY
                                         : Number.POSITIVE_INFINITY;
  // Search through all possible moves
  for (var i = 0; i < possibleMoves.length; i++) {
    var move = possibleMoves[i];
    // Make the move, but undo before exiting loop
    game.move(move);
    // Recursively get the value from this move
    value = calcBestMove(depth-1, game, playerColor, alpha, beta, !isMaximizingPlayer)[0];
    // Log the value of this move
    // console.log(isMaximizingPlayer ? 'Max: ' : 'Min: ', depth, move, value,
                // bestMove, bestMoveValue);

    if (isMaximizingPlayer) {
      // Look for moves that maximize position
      if (value > bestMoveValue) {
        bestMoveValue = value;
        bestMove = move;
      }
      alpha = Math.max(alpha, value);
    } else {
      // Look for moves that minimize position
      if (value < bestMoveValue) {
        bestMoveValue = value;
        bestMove = move;
      }
      beta = Math.min(beta, value);
    }
    // Undo previous move
    game.undo();
    // Check for alpha beta pruning
    if (beta <= alpha) {
      // console.log('Prune', alpha, beta);
      break;
    }
  }
  // Log the best move at the current depth
  // console.log('Depth: ' + depth + ' | Best Move: ' + bestMove + ' | ' + bestMoveValue + ' | A: ' + alpha + ' | B: ' + beta);
  // Return the best move, or the only move
  return [bestMoveValue, bestMove || possibleMoves[0]];
}


export default ChessGame;