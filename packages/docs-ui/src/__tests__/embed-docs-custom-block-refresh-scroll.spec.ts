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

/**
 * @vitest-environment jsdom
 */

import { UniverInstanceType } from '@univerjs/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
    collectDocsTableLikeEmbedChildUnitIds,
    createDocsCustomBlockSizeRefreshScheduler,
    getCommandUnitId,
    shouldRefreshDocsCustomBlockSizeForCommand,
} from '../embed-docs-custom-block-refresh';
import { scrollDocsTableLikeCustomBlockLive } from '../embed-docs-custom-block-scroll';

describe('docs custom block refresh and scroll helpers', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('collects table-like child units and matches command params', () => {
        const childUnitIds = collectDocsTableLikeEmbedChildUnitIds({
            sheet: { data: { childUnitId: 'sheet-1', childType: UniverInstanceType.UNIVER_SHEET } },
            base: { data: { childUnitId: 'base-1', childType: UniverInstanceType.UNIVER_BASE } },
            slide: { data: { childUnitId: 'slide-1', childType: UniverInstanceType.UNIVER_SLIDE } },
            malformed: { data: { childUnitId: 123, childType: UniverInstanceType.UNIVER_SHEET } },
            empty: null,
        });

        expect(Array.from(childUnitIds).sort()).toEqual(['base-1', 'sheet-1']);
        expect(getCommandUnitId({ unitId: 'unit-a', unitID: 'unit-b' })).toBe('unit-a');
        expect(getCommandUnitId({ unitID: 'unit-b' })).toBe('unit-b');
        expect(getCommandUnitId(null)).toBeUndefined();
        expect(shouldRefreshDocsCustomBlockSizeForCommand({
            childUnitIds,
            commandParams: { unitId: 'sheet-1' },
            hostUnitId: 'doc-1',
        })).toBe(true);
        expect(shouldRefreshDocsCustomBlockSizeForCommand({
            childUnitIds,
            commandParams: { unitId: 'doc-1' },
            hostUnitId: 'doc-1',
        })).toBe(false);
        expect(shouldRefreshDocsCustomBlockSizeForCommand({
            childUnitIds,
            commandParams: { unitId: 'other' },
            hostUnitId: 'doc-1',
        })).toBe(false);
    });

    it('coalesces refresh scheduling and cancels pending frames on dispose', () => {
        const refresh = vi.fn();
        let callback: (() => void) | undefined;
        const requestAnimationFrame = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((next) => {
            callback = () => next(0);
            return 7;
        });
        const cancelAnimationFrame = vi.spyOn(window, 'cancelAnimationFrame');
        const scheduler = createDocsCustomBlockSizeRefreshScheduler(refresh);

        scheduler.schedule();
        scheduler.schedule();
        expect(requestAnimationFrame).toHaveBeenCalledTimes(1);
        callback?.();
        expect(refresh).toHaveBeenCalledTimes(1);

        scheduler.schedule();
        scheduler.dispose();
        expect(cancelAnimationFrame).toHaveBeenCalledWith(7);
        scheduler.dispose();
        expect(cancelAnimationFrame).toHaveBeenCalledTimes(1);
    });

    it('scrolls live block content within horizontal and vertical limits', () => {
        const live = createScrollableElement({
            clientHeight: 200,
            clientWidth: 300,
            scrollHeight: 800,
            scrollWidth: 1000,
        });

        expect(scrollDocsTableLikeCustomBlockLive(new WheelEvent('wheel', { deltaX: 500 }), live, { maxScrollLeft: 420 })).toBe(true);
        expect(live.scrollLeft).toBe(420);

        expect(scrollDocsTableLikeCustomBlockLive(new WheelEvent('wheel', { deltaY: 900 }), live)).toBe(true);
        expect(live.scrollTop).toBe(600);

        expect(scrollDocsTableLikeCustomBlockLive(new WheelEvent('wheel', { deltaY: -50, shiftKey: true }), live)).toBe(true);
        expect(live.scrollLeft).toBe(370);
        expect(live.scrollTop).toBe(600);

        expect(scrollDocsTableLikeCustomBlockLive(new WheelEvent('wheel', { ctrlKey: true, deltaY: 10 }), live)).toBe(false);
        expect(scrollDocsTableLikeCustomBlockLive(new WheelEvent('wheel', { metaKey: true, deltaY: 10 }), live)).toBe(false);
        const prevented = new WheelEvent('wheel', { deltaY: 10 });
        prevented.preventDefault();
        expect(scrollDocsTableLikeCustomBlockLive(prevented, live)).toBe(false);
    });
});

function createScrollableElement(params: {
    clientHeight: number;
    clientWidth: number;
    scrollHeight: number;
    scrollWidth: number;
}): HTMLElement {
    const element = document.createElement('div');
    Object.defineProperties(element, {
        clientHeight: { configurable: true, value: params.clientHeight },
        clientWidth: { configurable: true, value: params.clientWidth },
        scrollHeight: { configurable: true, value: params.scrollHeight },
        scrollWidth: { configurable: true, value: params.scrollWidth },
    });
    return element;
}
