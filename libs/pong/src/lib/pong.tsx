import { useEffect, useRef } from 'react';
import { createAiPaddleController } from './logic/ai-paddle-controller';
import { BOARD_HEIGHT, BOARD_WIDTH } from './logic/constants';
import { PaddleControllerFactory } from './logic/interfaces';
import { createMouseController } from './logic/mouse-controller';
import { createPaddleControllerCreator } from './logic/paddle-controller-creator';
import { createPongGame } from './logic/pong';
import { createPongGameView } from './pong-view';
import styles from './pong.module.scss';

/* eslint-disable-next-line */
export interface PongProps {
  leftController: () => PaddleControllerFactory;
  rightController: () => PaddleControllerFactory;
}

export function Pong({ leftController, rightController }: PongProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  function init() {
    if (!canvasRef.current) {
      throw Error('Canvas Ref not found');
    }
    const pongGame = createPongGame({
      leftPaddle: createPaddleControllerCreator(
        'left',
        leftController as any,
        canvasRef.current
      ),
      rightPaddle: createPaddleControllerCreator(
        'right',
        rightController as any,
        canvasRef.current
      ),
    });
    createPongGameView(pongGame, canvasRef.current);
  }
  useEffect(init, []);
  return <canvas ref={canvasRef} height={BOARD_HEIGHT} width={BOARD_WIDTH} />;
}

export default Pong;
