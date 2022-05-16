import { interval, map, merge, Observable, shareReplay } from 'rxjs';
import {
  BALL_SPEED_STARTING_SPEED,
  BALL_STARTING_POSITION,
  BOARD_HEIGHT,
  BOARD_WIDTH,
  FRAMES_PER_SECOND,
  PADDLE_LENGTH,
  PADDLE_SPEED,
} from './constants';
import {
  Ball,
  Paddle,
  PaddleControllerCreator,
  PaddleInstruction,
  PongGameState,
  Velocity,
} from './interfaces';

export interface PaddleControllerInstructionEvent {
  type: 'new paddle controller instruction';
  instruction: PaddleInstruction;
  paddle: 'left' | 'right';
}

export interface ControllerActionEvent {
  type: 'controller action performed';
  paddle: 'left' | 'right';
}

export interface FrameAdvanceEvent {
  type: 'frame advance';
}

export type PongEvent =
  | PaddleControllerInstructionEvent
  | ControllerActionEvent
  | FrameAdvanceEvent;

export type PongEventType = PongEvent['type'];

export const createEventStream = (
  leftPaddle: PaddleControllerCreator,
  rightPaddle: PaddleControllerCreator
): Observable<PongEvent> => {
  const events$ = merge(
    leftPaddle.paddleController.instruction.pipe(
      map((instruction) => ({
        type: 'new paddle controller instruction' as const,
        instruction,
        paddle: 'left' as const,
      }))
    ),
    rightPaddle.paddleController.instruction.pipe(
      map((instruction) => ({
        type: 'new paddle controller instruction' as const,
        instruction,
        paddle: 'right' as const,
      }))
    ),
    leftPaddle.paddleController.action.pipe(
      map(() => ({
        type: 'controller action performed' as const,
        paddle: 'left' as const,
      }))
    ),
    rightPaddle.paddleController.action.pipe(
      map(() => ({
        type: 'controller action performed' as const,
        paddle: 'right' as const,
      }))
    ),
    interval(1000 / FRAMES_PER_SECOND).pipe(
      map(() => ({ type: 'frame advance' as const }))
    )
  ).pipe(shareReplay(1));
  events$.subscribe();
  return events$;
};

export function pongReducer(
  state: PongGameState,
  event: PongEvent
): PongGameState {
  switch (event.type) {
    case 'new paddle controller instruction':
      return {
        ...state,
        [`${event.paddle}Paddle`]: {
          ...state[`${event.paddle}Paddle`],
          currentInstruction: event.instruction,
        },
        lastEvent: event.type,
      };
    // TODO: action event restarts the game
    // case 'controller action performed':
    //     return { ...state, [action.paddle]: { ...state[action.paddle], currentInstruction: 'idle' } };
    case 'frame advance':
      return nextFrame(state);
    default:
      return state;
  }
}
export const initialPongState: PongGameState = {
  ball: resetBall(),
  leftPaddle: {
    middlePosition: BOARD_HEIGHT / 2,
    color: 'blue',
    currentInstruction: 'idle',
  },
  rightPaddle: {
    middlePosition: BOARD_HEIGHT / 2,
    color: 'red',
    currentInstruction: 'idle',
  },
  score: {
    leftPlayer: 0,
    rightPlayer: 0,
  },
  lastEvent: 'frame advance',
};

function nextFrame(state: PongGameState): PongGameState {
  const leftPaddle = updatePaddle(state.leftPaddle);
  const rightPaddle = updatePaddle(state.rightPaddle);
  const { ball, scorer } = updateBall(state.ball, leftPaddle, rightPaddle);
  const score =
    scorer === 'left'
      ? { ...state.score, leftPlayer: state.score.leftPlayer + 1 }
      : scorer === 'right'
      ? { ...state.score, rightPlayer: state.score.rightPlayer + 1 }
      : state.score;
  return {
    ...state,
    ball,
    leftPaddle,
    rightPaddle,
    score,
    lastEvent: 'frame advance',
  };
}

function updatePaddle(paddle: Paddle): Paddle {
  function convertInstruction(instruction: PaddleInstruction): number {
    switch (instruction) {
      case 'up':
        return -1;
      case 'down':
        return 1;
      case 'idle':
        return 0;
    }
  }
  return {
    ...paddle,
    middlePosition:
      paddle.middlePosition +
      convertInstruction(paddle.currentInstruction) * PADDLE_SPEED,
  };
}

function updateBall(
  ball: Ball,
  leftPaddle: Paddle,
  rightPaddle: Paddle
): { ball: Ball; scorer?: 'left' | 'right' } {
  const afterMovement = moveBallPerVelocity(ball);
  const afterCheckingTopWall = adjustForHittingTopWall(afterMovement);
  const afterCheckingBottomWall =
    adjustForHittingBottomWall(afterCheckingTopWall);
  const { ball: afterLeftWall, score: isLeftScore } = adjustForHittingLeftWall(
    afterCheckingBottomWall,
    leftPaddle
  );
  const { ball: afterRightWall, score: isRightScore } =
    adjustForHittingRightWall(afterLeftWall, rightPaddle);
  if (isLeftScore) {
    return {
      ball: resetBall(),
      scorer: 'left',
    };
  }
  if (isRightScore) {
    return { ball: resetBall(), scorer: 'right' };
  }
  return { ball: afterRightWall };
}

function resetBall(direction: 'left' | 'right' = 'right'): Ball {
  return {
    position: BALL_STARTING_POSITION,
    velocity: {
      direction: direction === 'left' ? -1 : 1,
      magnitude: BALL_SPEED_STARTING_SPEED,
    },
    color: 'black',
  };
}

function moveBallPerVelocity(ball: Ball): Ball {
  const deltaX = ball.velocity.magnitude * Math.cos(ball.velocity.direction);
  const deltaY = ball.velocity.magnitude * Math.sin(ball.velocity.direction);
  return {
    ...ball,
    position: {
      x: ball.position.x + deltaX,
      y: ball.position.y + deltaY,
    },
  };
}

function adjustForHittingTopWall(ball: Ball): Ball {
  if (ball.position.y < 0) {
    return { ...ball, velocity: horizontalCollision(ball.velocity) };
  }
  return ball;
}
function adjustForHittingBottomWall(ball: Ball): Ball {
  if (ball.position.y > BOARD_HEIGHT) {
    return { ...ball, velocity: horizontalCollision(ball.velocity) };
  }
  return ball;
}

function adjustForHittingLeftWall(
  ball: Ball,
  paddle: Paddle
): { ball: Ball; score: boolean } {
  if (ball.position.x < 0) {
    if (
      ball.position.y > paddle.middlePosition - PADDLE_LENGTH / 2 &&
      ball.position.y < paddle.middlePosition + PADDLE_LENGTH / 2
    ) {
      return {
        ball: { ...ball, velocity: verticalCollision(ball.velocity) },
        score: false,
      };
    } else {
      return { ball, score: true };
    }
  }
  return { ball, score: false };
}

function adjustForHittingRightWall(
  ball: Ball,
  paddle: Paddle
): { ball: Ball; score: boolean } {
  if (ball.position.x > BOARD_WIDTH) {
    if (
      ball.position.y > paddle.middlePosition - PADDLE_LENGTH / 2 &&
      ball.position.y < paddle.middlePosition + PADDLE_LENGTH / 2
    ) {
      return {
        ball: { ...ball, velocity: verticalCollision(ball.velocity) },
        score: false,
      };
    } else {
      return { ball, score: true };
    }
  }
  return { ball, score: false };
}

function verticalCollision(velocity: Velocity): Velocity {
  return {
    direction: Math.PI - velocity.direction,
    magnitude: velocity.magnitude,
  };
}

function horizontalCollision(velocity: Velocity): Velocity {
  return {
    direction: -velocity.direction,
    magnitude: velocity.magnitude,
  };
}
