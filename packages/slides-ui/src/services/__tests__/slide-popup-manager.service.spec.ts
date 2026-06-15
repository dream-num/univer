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

import { ICommandService, Injector, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { ICanvasPopupService } from '@univerjs/ui';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SlideCanvasPopMangerService } from '../slide-popup-manager.service';

describe('SlideCanvasPopMangerService', () => {
    let service: SlideCanvasPopMangerService;
    let addPopup: ReturnType<typeof vi.fn>;
    let removePopup: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        addPopup = vi.fn(() => 'popup-1');
        removePopup = vi.fn();
        const injector = new Injector();
        injector.add([ICanvasPopupService, { useValue: { addPopup, removePopup } as unknown as ICanvasPopupService }]);
        injector.add([IRenderManagerService, { useValue: { getRenderById: () => null } as unknown as IRenderManagerService }]);
        injector.add([IUniverInstanceService, { useValue: { getCurrentUnitOfType: (type: UniverInstanceType) => type === UniverInstanceType.UNIVER_SLIDE ? { getUnitId: () => 'slide-1' } : null } as unknown as IUniverInstanceService }]);
        injector.add([ICommandService, { useValue: {} as ICommandService }]);
        injector.add([SlideCanvasPopMangerService]);
        service = injector.get(SlideCanvasPopMangerService);
    });

    it('does not create a canvas popup when the current slide has no renderer', () => {
        const disposable = service.attachPopupToObject({ left: 0, top: 0, width: 10, height: 10 } as never, { componentKey: 'slide-comment' });

        disposable.dispose();

        expect(addPopup).not.toHaveBeenCalled();
        expect(removePopup).not.toHaveBeenCalled();
    });
});
