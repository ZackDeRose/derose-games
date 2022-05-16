import { distinctUntilChanged, map, NEVER, Observable } from 'rxjs';
import { AI_PADDLE_FORGIVENESS } from './constants';
import {
  PaddleController,
  PaddleInstruction,
  PongGameState,
} from './interfaces';

export function createAiPaddleController(
  paddleId: 'left' | 'right',
  gameState$: Observable<PongGameState>
): PaddleController {
  const instruction = gameState$.pipe(
    map(aiInstructions(paddleId)),
    distinctUntilChanged()
  );
  return {
    instruction,
    action: NEVER,
  };
}

const aiInstructions =
  (position: 'left' | 'right') =>
  (state: PongGameState): PaddleInstruction => {
    const paddleY = (position === 'left' ? state.leftPaddle : state.rightPaddle)
      .middlePosition;
    const ballY = state.ball.position.y;
    // console.log('in aiInstructions', paddleY, ballY);
    if (ballY < paddleY - AI_PADDLE_FORGIVENESS) {
      return 'up';
    }
    if (ballY > paddleY + AI_PADDLE_FORGIVENESS) {
      return 'down';
    }
    return 'idle';
  };
