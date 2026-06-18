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
import { createSheetsEmbedRuntimeService, wireSheetsFloatPreviewBridge } from './embed-register';

describe('sheets embed register', () => {
    it('mounts sheet-tab embeds through the sheets runtime bridge', () => {
        const descriptor = {
            embedId: 'embed-1',
            hostUnitId: 'host-1',
            hostAnchorId: 'anchor-1',
            entry: 'sheets-sheet-tab',
        };
        const mount = vi.fn();
        const unmount = vi.fn();
        const activateTab = vi.fn();
        const clearTab = vi.fn();
        const service = createSheetsEmbedRuntimeService({
            embedModelService: { getDescriptor: vi.fn(() => descriptor) } as any,
            mountService: { mount, unmount } as any,
            activationService: { activateTab, clearTab } as any,
        });

        const disposable = service.mountSheetTab({
            hostUnitId: 'host-1',
            hostAnchorId: 'anchor-1',
            embedId: 'embed-1',
        });

        expect(mount).toHaveBeenCalledWith(descriptor);
        expect(activateTab).toHaveBeenCalledWith(descriptor);

        disposable?.dispose();

        expect(unmount).toHaveBeenCalledWith('embed-1');
        expect(clearTab).toHaveBeenCalledWith('embed-1');
    });

    it('forwards embed preview updates to the host floating anchor preview cache', () => {
        const previewUpdated$ = new Subject<any>();
        const setPreview = vi.fn();
        const disposable = wireSheetsFloatPreviewBridge({
            previewService: { previewUpdated$ } as any,
            embedModelService: {
                getActiveDescriptorsByChildUnit: vi.fn(() => [{
                    embedId: 'embed-1',
                    entry: 'sheets-floating-object',
                    hostAnchorId: 'drawing-1',
                }]),
            } as any,
            canvasFloatDomPreviewService: { setPreview } as any,
        });

        previewUpdated$.next({
            embedId: 'embed-1',
            childUnitId: 'child-1',
            image: 'data:image/png;base64,preview',
            updatedAt: 123,
        });

        expect(setPreview).toHaveBeenCalledWith({
            id: 'drawing-1',
            image: 'data:image/png;base64,preview',
            updatedAt: 123,
        });

        disposable.unsubscribe();
    });

    it('ignores tab previews and non-string images', () => {
        const previewUpdated$ = new Subject<any>();
        const setPreview = vi.fn();
        const disposable = wireSheetsFloatPreviewBridge({
            previewService: { previewUpdated$ } as any,
            embedModelService: {
                getActiveDescriptorsByChildUnit: vi.fn(() => [{
                    embedId: 'embed-1',
                    entry: 'sheets-sheet-tab',
                    hostAnchorId: 'sheet-tab-1',
                }]),
            } as any,
            canvasFloatDomPreviewService: { setPreview } as any,
        });

        previewUpdated$.next({
            embedId: 'embed-1',
            childUnitId: 'child-1',
            image: 'data:image/png;base64,preview',
            updatedAt: 123,
        });
        previewUpdated$.next({
            embedId: 'embed-1',
            childUnitId: 'child-1',
            image: document.createElement('canvas'),
            updatedAt: 124,
        });

        expect(setPreview).not.toHaveBeenCalled();

        disposable.unsubscribe();
    });

    it('requests embed previews when the host scene preview object has no image yet', () => {
        const previewUpdated$ = new Subject<any>();
        const previewRequested$ = new Subject<any>();
        const requestPreview = vi.fn();
        const disposable = wireSheetsFloatPreviewBridge({
            previewService: { previewUpdated$, requestPreview } as any,
            embedModelService: {
                getDescriptor: vi.fn(() => ({
                    embedId: 'embed-1',
                    entry: 'sheets-floating-object',
                    hostAnchorId: 'drawing-1',
                    childUnitId: 'child-1',
                    childType: 2,
                })),
                getActiveDescriptorsByChildUnit: vi.fn(() => []),
            } as any,
            canvasFloatDomPreviewService: {
                setPreview: vi.fn(),
                previewRequested$,
            } as any,
        });

        previewRequested$.next({
            id: 'drawing-1',
            width: 320,
            height: 180,
            data: {
                version: 1,
                embedId: 'embed-1',
                hostUnitId: 'host-1',
            },
        });

        expect(requestPreview).toHaveBeenCalledWith(expect.objectContaining({
            childUnitId: 'child-1',
            width: 320,
            height: 180,
            reason: 'initial',
        }));

        disposable.unsubscribe();
    });

    it('drains pending host scene preview requests when the bridge is registered late', () => {
        const previewUpdated$ = new Subject<any>();
        const requestPreview = vi.fn();
        const disposable = wireSheetsFloatPreviewBridge({
            previewService: { previewUpdated$, requestPreview } as any,
            embedModelService: {
                getDescriptor: vi.fn(() => ({
                    embedId: 'embed-1',
                    entry: 'sheets-floating-object',
                    hostAnchorId: 'drawing-1',
                    childUnitId: 'child-1',
                    childType: 2,
                })),
                getActiveDescriptorsByChildUnit: vi.fn(() => []),
            } as any,
            canvasFloatDomPreviewService: {
                setPreview: vi.fn(),
                getPendingRequests: vi.fn(() => [{
                    id: 'drawing-1',
                    width: 320,
                    height: 180,
                    data: {
                        version: 1,
                        embedId: 'embed-1',
                        hostUnitId: 'host-1',
                    },
                }]),
                previewRequested$: new Subject<any>(),
            } as any,
        });

        expect(requestPreview).toHaveBeenCalledWith(expect.objectContaining({
            childUnitId: 'child-1',
            width: 320,
            height: 180,
            reason: 'initial',
        }));

        disposable.unsubscribe();
    });
});
