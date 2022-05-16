import { scan, shareReplay, startWith } from 'rxjs';
import { PaddleControllerCreator, PongGame } from './interfaces';
import {
  createEventStream,
  initialPongState,
  pongReducer,
} from './pong-reducer';

export function createPongGame({
  leftPaddle,
  rightPaddle,
}: {
  leftPaddle: PaddleControllerCreator;
  rightPaddle: PaddleControllerCreator;
}): PongGame {
  const events$ = createEventStream(leftPaddle, rightPaddle);
  const state$ = events$.pipe(
    scan(pongReducer, initialPongState),
    startWith(initialPongState),
    shareReplay(1)
  );
  state$.subscribe();
  leftPaddle.passState(state$);
  rightPaddle.passState(state$);
  return {
    state$,
    leftPaddleController: leftPaddle.paddleController,
    rightPaddleController: rightPaddle.paddleController,
  };
}
