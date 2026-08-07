import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RoundTimeline } from './RoundTimeline';

afterEach(cleanup);

describe('RoundTimeline', () => {
  it('lets the player scrub the progress bar and select its round points', async () => {
    const onSelectRound = vi.fn();
    const user = userEvent.setup();
    render(<RoundTimeline totalRounds={5} activeRoundNumber={2} onSelectRound={onSelectRound} />);

    const progressBar = screen.getByRole('slider', { name: 'Navegar pelos rounds' });
    expect(progressBar).toHaveAttribute('min', '1');
    expect(progressBar).toHaveAttribute('max', '5');
    expect(progressBar).toHaveValue('2');

    fireEvent.change(progressBar, { target: { value: '4' } });
    expect(onSelectRound).toHaveBeenCalledWith(4);

    await user.click(screen.getByRole('button', { name: 'Round 5 de 5' }));
    expect(onSelectRound).toHaveBeenCalledWith(5);
    expect(screen.getByRole('button', { name: 'Round 2 de 5' })).toHaveAttribute(
      'aria-current',
      'step'
    );
  });
});
