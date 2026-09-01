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

import type { DocumentDataModel } from '@univerjs/core';
import type { IRenderContext } from '@univerjs/engine-render';
import {
    createDocumentModelWithStyle,
    CustomRangeType,
    IUniverInstanceService,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import {
    DocInterceptorService,
    DocLayoutExecutorService,
    DocSelectionManagerService,
    DocSkeletonManagerService,
} from '@univerjs/docs';
import { DocCanvasPopManagerService } from '@univerjs/docs-ui';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DocHyperLinkPopupService } from '../../../services/hyper-link-popup.service';
import { DocHyperLinkRenderController } from '../render.controller';

describe('DocHyperLinkRenderController', () => {
    afterEach(() => vi.restoreAllMocks());

    it('updates popup state without requiring a document layout controller or changing page geometry', () => {
        vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
            font: '',
            measureText: (text: string) => ({ width: text.length * 8, actualBoundingBoxAscent: 8, actualBoundingBoxDescent: 2 }),
        } as never);
        const univer = new Univer();
        const injector = univer.__getInjector();
        const model = createDocumentModelWithStyle('Link text\r', {});
        model.getBody()!.customRanges = [{ startIndex: 0, endIndex: 3, rangeId: 'link', rangeType: CustomRangeType.HYPERLINK }];
        injector.get(IUniverInstanceService).__addUnit(model);
        const context = { unit: model, unitId: model.getUnitId(), type: UniverInstanceType.UNIVER_DOC } as IRenderContext<DocumentDataModel>;
        injector.add([DocLayoutExecutorService]);
        injector.add([DocSelectionManagerService]);
        injector.add([DocSkeletonManagerService, { useFactory: () => injector.createInstance(DocSkeletonManagerService, context) }]);
        injector.add([DocInterceptorService, { useFactory: () => injector.createInstance(DocInterceptorService, context) }]);
        // Canvas popup mounting is the unavailable platform boundary in this unit test.
        const disposePopup = vi.fn();
        injector.add([DocCanvasPopManagerService, { useValue: {
            attachPopupToRange: () => ({ dispose: disposePopup, canDispose: () => true }),
        } as unknown as DocCanvasPopManagerService }]);
        injector.add([DocHyperLinkPopupService]);
        injector.add([DocHyperLinkRenderController, { useFactory: () => injector.createInstance(DocHyperLinkRenderController, context) }]);

        const controller = injector.get(DocHyperLinkRenderController);
        const skeletonManager = injector.get(DocSkeletonManagerService);
        const skeleton = skeletonManager.getSkeleton();
        const pages = skeleton.getSkeletonData()!.pages;
        const calculate = vi.spyOn(skeleton, 'calculate');
        const startLayout = vi.spyOn(skeleton, 'startIncrementalLayout');
        const popup = injector.get(DocHyperLinkPopupService);
        const link = { unitId: model.getUnitId(), linkId: 'link', startIndex: 0, endIndex: 3 };
        try {
            for (let click = 0; click < 3; click++) {
                popup.showInfoPopup(link);
                expect(popup.showing).toMatchObject(link);
                expect(skeletonManager.getViewModel().getCustomRange(0)?.active).toBe(true);
                popup.hideInfoPopup();
                expect(popup.showing).toBeNull();
                expect(skeletonManager.getViewModel().getCustomRange(0)?.active).toBe(false);
            }
            expect(calculate).not.toHaveBeenCalled();
            expect(startLayout).not.toHaveBeenCalled();
            expect(skeleton.getSkeletonData()!.pages).toBe(pages);
            expect(disposePopup).toHaveBeenCalled();
        } finally {
            controller.dispose();
            skeleton.dispose();
            univer.dispose();
        }
    });
});
