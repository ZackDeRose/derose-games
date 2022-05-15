import { render } from '@testing-library/react';

import Pong from './pong';

describe('Pong', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Pong />);
    expect(baseElement).toBeTruthy();
  });
});
