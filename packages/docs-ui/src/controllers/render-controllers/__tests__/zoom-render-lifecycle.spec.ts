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

import type { ICommandInfo } from '@univerjs/core';
import { DOCS_NORMAL_EDITOR_UNIT_ID_KEY, DocumentFlavor, EventSubject, UniverInstanceType } from '@univerjs/core';
import { Subject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SetDocZoomRatioOperation } from '../../../commands/operations/set-doc-zoom-ratio.operation';
import { MobileDocZoomRenderController } from '../mobile/zoom.render-controller';
import { DocZoomRenderController } from '../zoom.render-controller';

describe.each([{ name: 'desktop', mobile: false }, { name: 'mobile', mobile: true }])('$name Doc zoom callback lifetime', ({ mobile }) => {
    const controllers: DocZoomRenderController[] = [];

    function createController(unitId = 'doc-unit') {
        const state = { zoom: 1, currentSheetId: 'sheet-a', currentDocZoom: 3, fitWidth: false, availableWidth: 800 };
        const doc = {
            getUnitId: () => unitId,
            getSettings: () => ({ zoomRatio: state.zoom }),
            getSnapshot: () => ({ documentStyle: { documentFlavor: DocumentFlavor.MODERN } }),
        };
        const skeletons = new Subject<object | null>();
        const transforms = new EventSubject();
        const commands = new Set<(command: ICommandInfo) => void>();
        const sheetScales = new Map([['sheet-a', 1.25], ['sheet-b', 1.75]]);
        const Controller = mobile ? MobileDocZoomRenderController : DocZoomRenderController;
        const controller = new Controller(
            {
                unitId,
                unit: doc,
                scene: { onMouseWheel$: new EventSubject() },
                engine: { onTransformChange$: transforms },
            } as never,
            { getContextValue: () => false } as never,
            { currentSkeleton$: skeletons } as never,
            {
                getCurrentUnitOfType: (type: UniverInstanceType) => type === UniverInstanceType.UNIVER_SHEET
                    ? { getUnitId: () => state.currentSheetId }
                    : { getSettings: () => ({ zoomRatio: state.currentDocZoom }) },
            } as never,
            {
                onCommandExecuted: (callback: (command: ICommandInfo) => void) => {
                    commands.add(callback);
                    return { dispose: () => commands.delete(callback) };
                },
                beforeCommandExecuted: () => ({ dispose: vi.fn() }),
            } as never,
            {} as never,
            {} as never,
            {} as never,
            { getRenderUnitById: (id: string) => ({ scene: { scaleX: sheetScales.get(id) } }) } as never,
            {
                getOptions: () => ({ mode: state.fitWidth ? 'fit-width' : 'none' }),
                getAvailableWidth: () => state.availableWidth,
            } as never
        );
        controllers.push(controller);
        return { controller, state, doc, skeletons, transforms, commands, sheetScales };
    }

    beforeEach(() => {
        vi.useFakeTimers();
        vi.spyOn(DocZoomRenderController.prototype, 'updateViewZoom').mockImplementation(() => {});
    });

    afterEach(() => {
        controllers.splice(0).forEach((controller) => controller.dispose());
        vi.clearAllTimers();
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    it.each([10, 100, 4000])('coalesces %i skeleton replacements into one update using the latest zoom', (count) => {
        const { controller, state, skeletons } = createController();
        vi.advanceTimersByTime(20);
        vi.mocked(controller.updateViewZoom).mockClear();

        for (let index = 0; index < count; index++) {
            skeletons.next({});
        }
        state.zoom = 1.6;

        expect(vi.getTimerCount()).toBe(1);
        vi.advanceTimersByTime(0);
        expect(controller.updateViewZoom).toHaveBeenCalledExactlyOnceWith(1.6, false);
        expect(vi.getTimerCount()).toBe(0);
    });

    it('keeps a queued update on its own document when the active document changes', () => {
        const { controller, state, skeletons } = createController();
        vi.advanceTimersByTime(20);
        vi.mocked(controller.updateViewZoom).mockClear();
        state.zoom = 1.3;
        state.currentDocZoom = 2;
        skeletons.next({});
        state.currentDocZoom = 4;

        vi.advanceTimersByTime(0);

        expect(controller.updateViewZoom).toHaveBeenCalledExactlyOnceWith(1.3, false);
    });

    it('preserves an explicit zoom command while a skeleton update is queued', () => {
        const { controller, state, skeletons, commands } = createController();
        vi.advanceTimersByTime(20);
        vi.mocked(controller.updateViewZoom).mockClear();
        skeletons.next({});
        state.zoom = 1.8;
        commands.forEach((callback) => callback({ id: SetDocZoomRatioOperation.id, params: { unitId: 'other-doc' } }));
        expect(controller.updateViewZoom).not.toHaveBeenCalled();
        commands.forEach((callback) => callback({ id: SetDocZoomRatioOperation.id, params: { unitId: 'doc-unit' } }));
        expect(vi.mocked(controller.updateViewZoom).mock.calls.at(-1)?.[0]).toBe(1.8);

        vi.advanceTimersByTime(0);

        expect(controller.updateViewZoom).toHaveBeenLastCalledWith(1.8, false);
        expect(controller.updateViewZoom).toHaveBeenCalledTimes(2);
    });

    it('reads the current Sheet renderer when delayed initialization runs', () => {
        const { controller, state } = createController(DOCS_NORMAL_EDITOR_UNIT_ID_KEY);
        state.currentSheetId = 'sheet-b';

        vi.advanceTimersByTime(20);

        expect(controller.updateViewZoom).toHaveBeenCalledExactlyOnceWith(1.75, true);
    });

    it('reads the latest Sheet scale when a skeleton update runs', () => {
        const { controller, state, skeletons, sheetScales } = createController(DOCS_NORMAL_EDITOR_UNIT_ID_KEY);
        vi.advanceTimersByTime(20);
        vi.mocked(controller.updateViewZoom).mockClear();
        skeletons.next({});
        state.currentSheetId = 'sheet-b';
        sheetScales.set('sheet-b', 2.25);

        vi.advanceTimersByTime(0);

        expect(controller.updateViewZoom).toHaveBeenCalledExactlyOnceWith(2.25, false);
    });

    it('retains fit-to-width resize updates while skeleton work is pending', () => {
        const { controller, state, skeletons, transforms } = createController();
        vi.advanceTimersByTime(20);
        vi.mocked(controller.updateViewZoom).mockClear();
        skeletons.next({});
        state.zoom = 1.45;
        state.fitWidth = true;
        state.availableWidth = 1200;

        transforms.emitEvent({});
        expect(controller.updateViewZoom).toHaveBeenCalledExactlyOnceWith(1.45, false);
        vi.advanceTimersByTime(16);
        expect(controller.updateViewZoom).toHaveBeenCalledTimes(2);
        expect(controller.updateViewZoom).toHaveBeenLastCalledWith(1.45, false);

        controller.dispose();
        expect(vi.getTimerCount()).toBe(0);
        transforms.emitEvent({});
        expect(controller.updateViewZoom).toHaveBeenCalledTimes(2);
    });

    it('cancels a queued update when the skeleton is removed', () => {
        const { controller, skeletons } = createController();
        vi.advanceTimersByTime(20);
        vi.mocked(controller.updateViewZoom).mockClear();
        skeletons.next({});
        expect(vi.getTimerCount()).toBe(1);

        skeletons.next(null);

        expect(vi.getTimerCount()).toBe(0);
        vi.advanceTimersByTime(0);
        expect(controller.updateViewZoom).not.toHaveBeenCalled();
    });

    it('cancels initialization and all replaced updates and unsubscribes on disposal', () => {
        const { controller, skeletons, commands } = createController();
        for (let index = 0; index < 100; index++) {
            skeletons.next({});
        }

        controller.dispose();

        expect(vi.getTimerCount()).toBe(0);
        expect(skeletons.observed).toBe(false);
        expect(commands.size).toBe(0);
        skeletons.next({});
        vi.advanceTimersByTime(5000);
        expect(controller.updateViewZoom).not.toHaveBeenCalled();
        expect(vi.getTimerCount()).toBe(0);
    });

    it('does not access the render context from retained callbacks after disposal', () => {
        const timeout = vi.spyOn(window, 'setTimeout');
        const { controller, skeletons, doc } = createController();
        skeletons.next({});
        const callbacks = timeout.mock.calls.map(([callback]) => callback as () => void);
        expect(callbacks).toHaveLength(2);
        controller.dispose();
        const getSettings = vi.spyOn(doc, 'getSettings');

        callbacks.forEach((callback) => callback());

        expect(getSettings).not.toHaveBeenCalled();
        expect(controller.updateViewZoom).not.toHaveBeenCalled();
        expect(vi.getTimerCount()).toBe(0);
    });
});
