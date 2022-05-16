import {
  BALL_RADIUS,
  BOARD_HEIGHT,
  BOARD_WIDTH,
  PADDLE_LENGTH,
  PADDLE_WIDTH,
} from './logic/constants';
import { Ball, PongGame, PongGameState } from './logic/interfaces';

export function createPongGameView(game: PongGame, canvas: HTMLCanvasElement) {
  const context = canvas.getContext('2d');
  if (!context) {
    throw Error('unable to create canvas context');
  }
  game.state$.subscribe((gameState) => drawState(gameState, context));
}

function drawState(gameState: PongGameState, ctx: CanvasRenderingContext2D) {
  drawBackground(ctx);
  drawScoreBoard(gameState, ctx);
  drawNet(ctx);
  drawBall(gameState.ball, ctx);
  drawLeftPaddle(gameState, ctx);
  drawRightPaddle(gameState, ctx);
}

function drawNet(ctx: CanvasRenderingContext2D) {
  const numberOfDashes = 35;
  const sections = numberOfDashes * 2 - 1;
  const sectionHeight = BOARD_HEIGHT / sections;
  for (let i = 0; i < BOARD_HEIGHT; i += sectionHeight * 2) {
    drawRectangle(BOARD_WIDTH / 2 - 1, i, 2, sectionHeight, 'white', ctx);
  }
}

function drawLeftPaddle(
  gameState: PongGameState,
  ctx: CanvasRenderingContext2D
) {
  drawRectangle(
    0,
    gameState.leftPaddle.middlePosition - PADDLE_LENGTH / 2,
    PADDLE_WIDTH,
    PADDLE_LENGTH,
    'blue',
    ctx
  );
}

function drawRightPaddle(
  gameState: PongGameState,
  ctx: CanvasRenderingContext2D
) {
  drawRectangle(
    BOARD_WIDTH - PADDLE_WIDTH,
    gameState.rightPaddle.middlePosition - PADDLE_LENGTH / 2,
    PADDLE_WIDTH,
    PADDLE_LENGTH,
    'red',
    ctx
  );
}

function drawScoreBoard(
  gameState: PongGameState,
  ctx: CanvasRenderingContext2D
) {
  ctx.font = '64px Arial';
  ctx.fillStyle = 'blue';
  ctx.fillText(gameState.score.leftPlayer + '', 100, 100);
  ctx.fillStyle = 'red';
  ctx.fillText(gameState.score.rightPlayer + '', BOARD_WIDTH - 150, 100);
}

function drawBackground(ctx: CanvasRenderingContext2D) {
  drawRectangle(0, 0, ctx.canvas.width, ctx.canvas.height, 'black', ctx);
}

function drawRectangle(
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
  ctx: CanvasRenderingContext2D
) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width, height);
}

function drawBall(
  ball: Ball,
  ctx: CanvasRenderingContext2D,
  outlineWidth = 5,
  outerColor = 'white'
) {
  ctx.fillStyle = outerColor;
  ctx.beginPath();
  ctx.arc(ball.position.x, ball.position.y, BALL_RADIUS, 0, Math.PI * 2, true);
  ctx.fill();
  ctx.fillStyle = ball.color;
  ctx.beginPath();
  ctx.arc(
    ball.position.x,
    ball.position.y,
    BALL_RADIUS - outlineWidth,
    0,
    Math.PI * 2,
    true
  );
  ctx.fill();
}
