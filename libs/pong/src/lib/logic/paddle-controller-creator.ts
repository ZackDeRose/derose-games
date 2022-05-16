import {
  filter,
  map,
  Observable,
  Observer,
  shareReplay,
  switchMap,
  take,
} from 'rxjs';
import {
  PaddleController,
  PaddleControllerCreator,
  PongGameState,
} from './interfaces';

export function createPaddleControllerCreator(
  position: 'left' | 'right',
  factory: (
    position: 'left' | 'right',
    state$: Observable<PongGameState>,
    canvas: HTMLCanvasElement
  ) => PaddleController,
  canvas: HTMLCanvasElement
): PaddleControllerCreator {
  let stateReceivedObserver: Observer<Observable<PongGameState> | null>;
  let passState: (state$: Observable<PongGameState>) => void;
  const state$$: Observable<Observable<PongGameState> | null> = new Observable(
    (observer) => {
      stateReceivedObserver = observer;
      passState = (state$: Observable<PongGameState>) => {
        stateReceivedObserver.next(state$);
      };
    }
  ).pipe(shareReplay(1) as any);

  state$$.subscribe();
  const paddleController$: Observable<PaddleController> = state$$.pipe(
    filter((x): x is Observable<PongGameState> => x !== null),
    map((state$) =>
      factory(
        position,
        state$.pipe(
          filter(({ lastEvent }) => lastEvent === 'frame advance'),
          shareReplay(1)
        ),
        canvas
      )
    )
  );
  paddleController$.subscribe();
  const paddleController: PaddleController = {
    instruction: paddleController$.pipe(
      take(1),
      switchMap(({ instruction }) => instruction),
      shareReplay(1)
    ),
    action: paddleController$.pipe(
      switchMap(({ action }) => action),
      shareReplay(1)
    ),
  };
  return {
    factory,
    // eslint-disable-next-line
    // @ts-ignore:next-line
    passState,
    paddleController,
  };
}
