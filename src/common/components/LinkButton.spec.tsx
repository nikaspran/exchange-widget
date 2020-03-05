import React from 'react';
import { render } from '@testing-library/react';
import LinkButton from './LinkButton';

describe.skip('<LinkButton />', () => {
  it('should render as a circle when only passed an icon as children', () => {
    const { container } = render(
      <LinkButton>
        <SomeIcon />
      </LinkButton>,
    );
    // expect(container.firstElementChild.className).toContain('circle');
  });
});
