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

import type { IFloatDom, IFloatDomLayout } from '../canvas-dom-layer.service';
import { Injector } from '@univerjs/core';
import { BehaviorSubject } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { CanvasFloatDomPreviewService, CanvasFloatDomService } from '../canvas-dom-layer.service';

function createService(): CanvasFloatDomService {
    const injector = new Injector();
    injector.add([CanvasFloatDomService]);
    return injector.get(CanvasFloatDomService);
}

function createFloatDom(id: string): IFloatDom {
    return {
        id,
        componentKey: 'shape',
        onPointerDown: () => {},
        onPointerMove: () => {},
        onPointerUp: () => {},
        onWheel: () => {},
        position$: new BehaviorSubject<IFloatDomLayout>({
            startX: 0,
            startY: 0,
            endX: 10,
            endY: 10,
            rotate: 0,
            width: 10,
            height: 10,
            absolute: { left: true, top: true },
        }),
        unitId: 'unit-1',
    };
}

describe('CanvasFloatDomService', () => {
    it('publishes floating DOM layer changes for canvas overlays', () => {
        const service = createService();
        const snapshots: Array<[string, IFloatDom][]> = [];
        const sub = service.domLayers$.subscribe((layers) => snapshots.push(layers));

        service.addFloatDom(createFloatDom('dom-1'));
        service.updateFloatDom('dom-1', { domId: 'runtime-dom-1' });
        service.removeFloatDom('dom-1');

        expect(snapshots.map((layers) => layers.length)).toEqual([0, 1, 1, 0]);
        expect(snapshots[2][0][1].domId).toBe('runtime-dom-1');
        sub.unsubscribe();
    });

    it('ignores missing updates and publishes remove-all changes', () => {
        const service = createService();
        const sizes: number[] = [];
        const sub = service.domLayers$.subscribe((layers) => sizes.push(layers.length));

        service.updateFloatDom('missing', { domId: 'ignored' });
        service.addFloatDom(createFloatDom('dom-1'));
        service.addFloatDom(createFloatDom('dom-2'));
        service.removeFloatDom('missing');
        service.removeAll();

        expect(service.domLayers).toEqual([]);
        expect(sizes).toEqual([0, 1, 2, 0]);
        sub.unsubscribe();
    });

    it('clears retained layer callbacks when disposed', () => {
        const service = createService();
        const sizes: number[] = [];
        let completed = false;
        service.domLayers$.subscribe({
            next: (layers) => sizes.push(layers.length),
            complete: () => {
                completed = true;
            },
        });

        service.addFloatDom(createFloatDom('dom-1'));
        service.dispose();

        expect(service.domLayers).toEqual([]);
        expect(sizes).toEqual([0, 1, 0]);
        expect(completed).toBe(true);
    });

    it('clears preview state when disposed', () => {
        const service = new CanvasFloatDomPreviewService();
        let previewCompleted = false;
        let requestCompleted = false;
        service.previewUpdated$.subscribe({
            complete: () => {
                previewCompleted = true;
            },
        });
        service.previewRequested$.subscribe({
            complete: () => {
                requestCompleted = true;
            },
        });

        service.requestPreview({ id: 'dom-1', width: 20, height: 10 });
        service.setPreview({ id: 'dom-1', image: 'data:image/png;base64,', updatedAt: 1 });
        service.dispose();

        expect(service.getPreview('dom-1')).toBeUndefined();
        expect(service.getPendingRequests()).toEqual([]);
        expect(previewCompleted).toBe(true);
        expect(requestCompleted).toBe(true);
    });
});
