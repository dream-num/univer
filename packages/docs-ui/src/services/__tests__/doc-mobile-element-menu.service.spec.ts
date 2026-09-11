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

import type { IDocMobileElementTarget } from '../doc-mobile-element-menu.service';
import { Univer, UniverInstanceType } from '@univerjs/core';
import { CanvasColorService, ICanvasColorService, IRenderManagerService, RenderManagerService } from '@univerjs/engine-render';
import { CanvasPopupService, ICanvasPopupService } from '@univerjs/ui';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DocMobileElementMenuService } from '../doc-mobile-element-menu.service';
import { DocCanvasPopManagerService } from '../doc-popup-manager.service';

describe('DocMobileElementMenuService', () => {
    let univer: Univer;
    let service: DocMobileElementMenuService;
    const target: IDocMobileElementTarget = {
        unitId: 'doc',
        rect: { left: 10, top: 500, right: 200, bottom: 580 },
        onEdit: vi.fn(),
        onDelete: vi.fn(),
    };

    beforeEach(() => {
        univer = new Univer();
        const injector = univer.__getInjector();
        injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
        injector.add([ICanvasColorService, { useClass: CanvasColorService }]);
        injector.add([ICanvasPopupService, { useClass: CanvasPopupService }]);
        injector.add([DocCanvasPopManagerService]);
        injector.add([DocMobileElementMenuService]);
        univer.createUnit(UniverInstanceType.UNIVER_DOC, { id: 'doc', body: { dataStream: '\r\n' } });
        injector.get(IRenderManagerService).createRender('doc');
        service = injector.get(DocMobileElementMenuService);
    });

    afterEach(() => univer.dispose());

    it('retains the consumed object anchor while its floating menu closes for editing', async () => {
        service.capture(target);
        expect(service.takeTarget('doc')).toBe(target);
        await Promise.resolve();
        service.show(target);
        service.close();
        expect(service.getEditingBounds('doc')).toBe(target.rect);
        expect(service.getEditingBounds('another-doc')).toBeNull();
    });

    it('clears the previous anchor on a non-object gesture and rejects unconsumed hits', async () => {
        service.show(target);
        expect(service.takeTarget('doc')).toBeNull();
        expect(service.getEditingBounds('doc')).toBeNull();
        service.capture(target);
        await Promise.resolve();
        expect(service.takeTarget('doc')).toBeNull();
    });

    it('replaces a previous object anchor when another editor opens', () => {
        service.show(target);
        const listBounds = { left: 10, top: 100, right: 10, bottom: 100 };
        service.setEditingBounds('doc', listBounds);
        service.close();
        expect(service.getEditingBounds('doc')).toBe(listBounds);
        expect(service.getEditingBounds('another-doc')).toBeNull();
    });
});
