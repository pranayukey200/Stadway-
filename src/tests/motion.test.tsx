// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';

import { render } from '@testing-library/react';
import { ThreeDBackground } from '../components/ThreeDBackground';

describe('ThreeDBackground Motion Reduction Audits', () => {
  it('should verify window.matchMedia is queried for prefers-reduced-motion', () => {
    // Mock getContext of HTMLCanvasElement so getContext('2d') doesn't return null in jsdom
    const mockContext = {
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      createRadialGradient: vi.fn().mockReturnValue({
        addColorStop: vi.fn()
      }),
      fillRect: vi.fn()
    };
    const getContextSpy = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(mockContext as any);

    // Mock window.matchMedia
    const matchMediaMock = vi.fn().mockImplementation(query => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    
    vi.stubGlobal('matchMedia', matchMediaMock);

    const { container } = render(<ThreeDBackground />);
    const canvas = container.querySelector('canvas');
    
    expect(canvas).not.toBeNull();
    expect(matchMediaMock).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');

    getContextSpy.mockRestore();
    vi.unstubAllGlobals();
  });
});
