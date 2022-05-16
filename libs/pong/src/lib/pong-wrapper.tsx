import { useState } from 'react';
import { createAiPaddleController } from './logic/ai-paddle-controller';
import { PaddleControllerFactory } from './logic/interfaces';
import { createMouseController } from './logic/mouse-controller';
import Pong from './pong';
import { Select } from './select';

type PongWrapperState = 'initializing' | 'playing';

const controllers: Record<string, PaddleControllerFactory> = {
  ai: createAiPaddleController,
  mouse: createMouseController,
};

export function PongWrapper() {
  const [state, setState] = useState<PongWrapperState>('initializing');
  const [rightController, setRightController] = useState<
    () => PaddleControllerFactory
  >(() => controllers['ai']);
  const [leftController, setLeftController] = useState<
    () => PaddleControllerFactory
  >(() => controllers['mouse']);
  return state === 'initializing' ? (
    <>
      <Select
        id="left"
        label="Select Left Controller"
        options={['ai', 'mouse']}
        onChange={(value) => setLeftController(() => controllers[value])}
      ></Select>
      <Select
        id="right"
        label="Select Right Controller"
        options={['ai', 'mouse']}
        onChange={(value) => setRightController(() => controllers[value])}
      ></Select>
      <button
        disabled={!leftController || !rightController}
        onClick={() => {
          setState('playing');
        }}
      >
        Start Game
      </button>
    </>
  ) : (
    (leftController && rightController && (
      <Pong leftController={leftController} rightController={rightController} />
    )) ?? <></>
  );
}
