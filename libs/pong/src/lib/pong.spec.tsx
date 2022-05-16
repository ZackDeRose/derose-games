import { render } from '@testing-library/react';

import { PongWrapper } from './pong-wrapper';

describe('Pong', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PongWrapper />);
    expect(baseElement).toBeTruthy();
  });
});
