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

import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';

import { SheetsHyperLinkRenderController, SheetsHyperLinkRenderManagerController } from '../render-controllers/render.controller';

describe('SheetsHyperLinkRenderController', () => {
    it('should mark skeleton dirty when link updates', async () => {
        const makeForceDirty = vi.fn();
        const linkUpdate$ = new Subject<void>();

        const controller = new SheetsHyperLinkRenderController({
            mainComponent: { makeForceDirty },
        } as any, { linkUpdate$ } as any);

        linkUpdate$.next();

        // debounced by 16ms
        await new Promise((resolve) => setTimeout(resolve, 30));
        expect(makeForceDirty).toHaveBeenCalledTimes(1);

        controller.dispose();
    });
});

describe('SheetsHyperLinkRenderManagerController', () => {
    it('should inject link fields into cell content interceptor', () => {
        let interceptorHandler: any;

        const sheetInterceptorService = {
            intercept: vi.fn((_point: any, config: any) => {
                interceptorHandler = config.handler;
                return { dispose: vi.fn() };
            }),
        } as any;

        const hyperLinkModel = {
            getHyperLinkByLocation: vi.fn(() => ({ id: 'l1', payload: '#gid=s1&range=A1' })),
        } as any;

        const controller = new SheetsHyperLinkRenderManagerController(sheetInterceptorService, hyperLinkModel);
        expect(sheetInterceptorService.intercept).toHaveBeenCalledTimes(1);

        const next = vi.fn((v) => v);
        const rawData = { v: 1 };
        const cell = rawData;
        const result = interceptorHandler(cell, { row: 0, col: 0, unitId: 'u1', subUnitId: 's1', rawData }, next);

        expect(result).toEqual(expect.objectContaining({
            linkUrl: '#gid=s1&range=A1',
            linkId: 'l1',
        }));
        expect(next).toHaveBeenCalledTimes(1);
        // should not mutate rawData
        expect(rawData).toEqual({ v: 1 });

        controller.dispose();
    });

    it('should passthrough when cell is empty or has no link', () => {
        let interceptorHandler: any;

        const sheetInterceptorService = {
            intercept: vi.fn((_point: any, config: any) => {
                interceptorHandler = config.handler;
                return { dispose: vi.fn() };
            }),
        } as any;

        const hyperLinkModel = {
            getHyperLinkByLocation: vi.fn(() => null),
        } as any;

        const controller = new SheetsHyperLinkRenderManagerController(sheetInterceptorService, hyperLinkModel);

        const next = vi.fn((v) => v);
        const out = interceptorHandler(null, { row: 0, col: 0, unitId: 'u1', subUnitId: 's1', rawData: null }, next);
        expect(out).toBe(null);
        expect(next).toHaveBeenCalledWith(null);

        controller.dispose();
    });
});
