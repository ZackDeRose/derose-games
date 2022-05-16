import { Position } from './interfaces';

export const PADDLE_LENGTH = 100;
export const PADDLE_WIDTH = 10;
export const PADDLE_SPEED = 5;
export const BALL_RADIUS = 10;
export const BALL_SPEED_STARTING_SPEED = 5;
export const BOARD_WIDTH = 800;
export const BOARD_HEIGHT = 600;
export const BALL_STARTING_POSITION: Position = {
  x: BOARD_WIDTH / 2,
  y: BOARD_HEIGHT / 2,
};
export const FRAMES_PER_SECOND = 60;
export const AI_PADDLE_FORGIVENESS = 20;
export const MOUSE_PADDLE_FORGIVENESS = 10;
