/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { NORMAL_TEXT_SELECTION_PLUGIN_STYLE } from '@univerjs/engine-render';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NodePositionConvertToCursor } from '../convert-text-range';
import { TextRange } from '../text-range';

describe('TextRange callback lifetime', () => {
    const ranges: TextRange[] = [];

    function createRange() {
        const range = new TextRange(
            { addObject: vi.fn() } as never,
            { getOffsetConfig: () => ({ docsLeft: 0, docsTop: 0 }) } as never,
            { findGlyphByPosition: () => null } as never,
            { glyph: 0 } as never,
            undefined,
            { ...NORMAL_TEXT_SELECTION_PLUGIN_STYLE, strokeActive: '#d020b0', stroke: '#112233' }
        );
        ranges.push(range);
        return range;
    }

    beforeEach(() => {
        vi.useFakeTimers();
        vi.spyOn(NodePositionConvertToCursor.prototype, 'getRangePointData').mockReturnValue({
            contentBoxPointGroup: [[{ x: 10, y: 20 }, { x: 11, y: 20 }, { x: 11, y: 34 }, { x: 10, y: 34 }]],
            borderBoxPointGroup: [],
            cursorList: [{ startOffset: 0, endOffset: 0 }],
        } as never);
    });

    afterEach(() => {
        ranges.splice(0).forEach((range) => range.dispose());
        vi.clearAllTimers();
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    it('keeps the initial 500 ms hide and subsequent 1000 ms blink cadence', () => {
        const range = createRange();
        const anchor = range.getAnchor()!;

        expect(anchor.stroke).toBe('#d020b0');
        expect(vi.getTimerCount()).toBe(2);
        vi.advanceTimersByTime(499);
        expect(anchor.stroke).toBe('#d020b0');
        vi.advanceTimersByTime(1);
        expect(anchor.stroke).toBe('#112233');
        expect(vi.getTimerCount()).toBe(1);
        vi.advanceTimersByTime(500);
        expect(anchor.stroke).toBe('#d020b0');
        expect(vi.getTimerCount()).toBe(2);
        vi.advanceTimersByTime(500);
        expect(anchor.stroke).toBe('#112233');
        vi.advanceTimersByTime(500);
        expect(anchor.stroke).toBe('#d020b0');
    });

    it('cancels the initial hide when a range is replaced before its first blink', () => {
        const range = createRange();
        range.dispose();

        expect(vi.getTimerCount()).toBe(0);
        vi.advanceTimersByTime(5000);
        expect(vi.getTimerCount()).toBe(0);
    });

    it('cancels a hide scheduled by the recurring blink', () => {
        const range = createRange();
        vi.advanceTimersByTime(1000);
        expect(vi.getTimerCount()).toBe(2);

        range.dispose();

        expect(vi.getTimerCount()).toBe(0);
        vi.advanceTimersByTime(5000);
        expect(vi.getTimerCount()).toBe(0);
    });

    it.each([10, 100, 4000].flatMap((count) => [
        { count, delay: 0, phase: 'initial hide' },
        { count, delay: 1000, phase: 'recurring hide' },
    ]))('retains only the surviving range timers after $count replacements during $phase', ({ count, delay }) => {
        let range = createRange();
        for (let index = 0; index < count; index++) {
            vi.advanceTimersByTime(delay);
            range.dispose();
            range = createRange();
        }

        expect(vi.getTimerCount()).toBe(2);
        vi.advanceTimersByTime(1000);
        expect(range.getAnchor()?.stroke).toBe('#d020b0');
        expect(vi.getTimerCount()).toBe(2);
        range.dispose();
        expect(vi.getTimerCount()).toBe(0);
    });

    it('leaves a hidden cursor alone and resumes blinking after activation', () => {
        const range = createRange();
        const anchor = range.getAnchor()!;
        range.deactivate();
        const setProps = vi.spyOn(anchor, 'setProps');

        vi.advanceTimersByTime(1500);

        expect(anchor.visible).toBe(false);
        expect(setProps).not.toHaveBeenCalled();
        range.activate();
        vi.advanceTimersByTime(1000);
        expect(anchor.visible).toBe(true);
        expect(anchor.stroke).toBe('#112233');
    });

    it('does not schedule another hide when the active blink disposes its range', () => {
        const range = createRange();
        vi.spyOn(range, 'activeStatic').mockImplementation(() => range.dispose());

        vi.advanceTimersByTime(1000);

        expect(vi.getTimerCount()).toBe(0);
    });

    it('does not touch disposed graphics or reinstall timers from retained callbacks', () => {
        const timeout = vi.spyOn(globalThis, 'setTimeout');
        const interval = vi.spyOn(globalThis, 'setInterval');
        const range = createRange();
        const firstHide = timeout.mock.calls[0][0] as () => void;
        const blink = interval.mock.calls[0][0] as () => void;
        vi.advanceTimersByTime(1000);
        const recurringHide = timeout.mock.calls.at(-1)![0] as () => void;
        const anchor = range.getAnchor()!;
        range.dispose();
        const setProps = vi.spyOn(anchor, 'setProps');

        firstHide();
        blink();
        recurringHide();

        expect(setProps).not.toHaveBeenCalled();
        expect(vi.getTimerCount()).toBe(0);
    });
});
