import {
  distinctUntilChanged,
  fromEvent,
  map,
  NEVER,
  Observable,
  switchMap,
} from 'rxjs';
import { MOUSE_PADDLE_FORGIVENESS } from './constants';
import { PaddleController, PongGameState } from './interfaces';

export function createMouseController(
  position: 'left' | 'right',
  gameState$: Observable<PongGameState>,
  canvas: HTMLCanvasElement
): PaddleController {
  const mouseY$: Observable<number> = fromEvent(canvas, 'mousemove').pipe(
    map((event) => {
      const { y } = calculateMousePosition(event as any);
      return y;
    })
  );
  function calculateMousePosition({ clientX, clientY }: any) {
    // TODO: adjust for scrolling/document position
    // const rect = canvas.getBoundingClientRect();
    // const root = document.documentElement;
    // const mouseX = clientX - rect.left - root.scrollLeft;
    // const mouseY = clientY - rect.top - root.scrollTop;
    const mouseX = clientX;
    const mouseY = clientY;
    return {
      x: mouseX,
      y: mouseY,
    };
  }
  return {
    instruction: mouseY$.pipe(
      switchMap((mouseY) =>
        gameState$.pipe(
          map(
            (state) =>
              (position === 'left' ? state.leftPaddle : state.rightPaddle)
                .middlePosition
          ),
          distinctUntilChanged(),
          map((paddleY) => {
            // console.log(mouseY, paddleY);
            if (mouseY < paddleY - MOUSE_PADDLE_FORGIVENESS) {
              return 'up';
            }
            if (mouseY > paddleY + MOUSE_PADDLE_FORGIVENESS) {
              return 'down';
            }
            return 'idle';
          })
        )
      ),
      distinctUntilChanged()
    ),
    action: NEVER,
  };
}
