import { ThemeService } from '@univerjs/core';
import type { UniverRenderingContext } from '@univerjs/engine-render';
import { describe, expect, it, vi } from 'vitest';
import {
    DOC_CUSTOM_RANGE_CHROME_BACKGROUND_ALPHA,
    DOC_CUSTOM_RANGE_CHROME_RADIUS,
    drawDocCustomRangeChrome,
    resolveDocCustomRangeChromeTheme,
} from './doc-custom-range-chrome';

describe('Doc custom range chrome', () => {
    it('derives a subtle background and border from the current primary theme token', () => {
        const themeService = new ThemeService();
        const currentTheme = themeService.getCurrentTheme();
        themeService.setTheme({
            ...currentTheme,
            primary: {
                ...currentTheme.primary,
                600: '#123456',
            },
        });

        expect(resolveDocCustomRangeChromeTheme(themeService)).toEqual({
            background: `rgba(18,52,86,${DOC_CUSTOM_RANGE_CHROME_BACKGROUND_ALPHA})`,
            border: '#123456',
        });
        expect(DOC_CUSTOM_RANGE_CHROME_RADIUS).toBe(1);
        themeService.dispose();
    });

    it('draws a filled rounded rectangle before its outline', () => {
        const calls: string[] = [];
        const ctx = {
            beginPath: vi.fn(() => {
                calls.push('beginPath');
            }),
            fill: vi.fn(() => {
                calls.push('fill');
            }),
            fillStyle: '',
            lineWidth: 0,
            restore: vi.fn(() => {
                calls.push('restore');
            }),
            roundRect: vi.fn(() => {
                calls.push('roundRect');
            }),
            save: vi.fn(() => {
                calls.push('save');
            }),
            stroke: vi.fn(() => {
                calls.push('stroke');
            }),
            strokeStyle: '',
        } satisfies Pick<
            UniverRenderingContext,
            | 'beginPath'
            | 'fill'
            | 'fillStyle'
            | 'lineWidth'
            | 'restore'
            | 'roundRect'
            | 'save'
            | 'stroke'
            | 'strokeStyle'
        >;

        drawDocCustomRangeChrome(ctx, {
            bottom: 28,
            left: 10,
            right: 50,
            top: 8,
        }, {
            background: 'rgba(18,52,86,0.07)',
            border: '#123456',
        });

        expect(ctx.roundRect).toHaveBeenCalledWith(10, 8, 40, 20, 1);
        expect(calls).toEqual([
            'save',
            'beginPath',
            'roundRect',
            'fill',
            'stroke',
            'restore',
        ]);
    });
});
