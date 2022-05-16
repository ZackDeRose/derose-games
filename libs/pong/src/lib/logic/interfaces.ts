import { Observable } from 'rxjs';
import { PongEventType } from './pong-reducer';

export interface PongGame {
  state$: Observable<PongGameState>;
  leftPaddleController: PaddleController;
  rightPaddleController: PaddleController;
}

export interface Paddle {
  middlePosition: number;
  color: string;
  currentInstruction: PaddleInstruction;
}

export interface PaddleController {
  instruction: Observable<PaddleInstruction>;
  action: Observable<void>;
}

export type PaddleControllerFactory = (
  position: 'left' | 'right',
  state$: Observable<PongGameState>,
  canvas: HTMLCanvasElement
) => PaddleController;

export type PaddleInstruction = 'up' | 'down' | 'idle';

export interface PaddleControllerCreator {
  factory: (
    position: 'left' | 'right',
    state$: Observable<PongGameState>,
    canvas: HTMLCanvasElement
  ) => PaddleController;
  passState: (state$: Observable<PongGameState>) => void;
  paddleController: PaddleController;
}

export interface Velocity {
  direction: number;
  magnitude: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface Ball {
  position: Position;
  velocity: Velocity;
  color: string;
}

export interface PongGameState {
  ball: Ball;
  leftPaddle: Paddle;
  rightPaddle: Paddle;
  score: {
    leftPlayer: number;
    rightPlayer: number;
  };
  lastEvent: PongEventType;
}
