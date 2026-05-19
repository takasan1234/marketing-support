import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock("@/lib/api-client", () => ({
  getProjects: vi.fn().mockResolvedValue([]),
}));

describe('Page', () => {
  it('renders the project list heading', async () => {
    const { default: Page } = await import('./page');
    const ui = await Page();
    render(ui);

    expect(screen.getByText('マーケティング支援ツール')).toBeInTheDocument();
    expect(screen.getByText('プロジェクトがまだありません。')).toBeInTheDocument();
  });
});
