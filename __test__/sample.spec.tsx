import React from 'react';
import { render, screen } from '@testing-library/react';

const SampleComponent = () => <div>Hello Jest</div>;

describe('SampleComponent', () => {
  it('renders correctly', () => {
    render(<SampleComponent />);
    expect(screen.getByText('Hello Jest')).toBeInTheDocument();
  });
});
