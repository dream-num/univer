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

import type { IDocumentData } from '@univerjs/core';
import { CustomRangeType, ICommandService, toDisposable, Univer, UniverInstanceType } from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';
import { DocCanvasPopManagerService } from '@univerjs/docs-ui';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DocHyperLinkPopupService } from '../../../services/hyper-link-popup.service';
import {
    ClickDocHyperLinkOperation,
    ShowDocHyperLinkEditPopupOperation,
    ToggleDocHyperLinkInfoPopupOperation,
} from '../popup.operation';

const unitId = 'hyper-link-popup-doc';

function createDocData(): IDocumentData {
    return {
        id: unitId,
        body: {
            dataStream: 'Hello world\r\n',
            customRanges: [{
                rangeId: 'unsafe-link',
                rangeType: CustomRangeType.HYPERLINK,
                startIndex: 0,
                endIndex: 4,
                properties: {
                    url: 'javascript:alert(1)',
                },
            }],
        },
        documentStyle: {
            pageSize: {
                width: 594.3,
                height: 840.51,
            },
            marginTop: 72,
            marginBottom: 72,
            marginRight: 90,
            marginLeft: 90,
        },
    };
}

class TestDocCanvasPopManagerService {
    attachPopupToRange() {
        return toDisposable(() => {});
    }
}

describe('doc hyperlink popup operations', () => {
    let univer: Univer;
    let commandService: ICommandService;
    let selectionManager: DocSelectionManagerService;
    let popupService: DocHyperLinkPopupService;

    beforeEach(() => {
        univer = new Univer();
        const injector = univer.__getInjector();
        injector.add([DocSelectionManagerService]);
        injector.add([DocCanvasPopManagerService, { useClass: TestDocCanvasPopManagerService as never }]);
        injector.add([DocHyperLinkPopupService]);

        univer.createUnit(UniverInstanceType.UNIVER_DOC, createDocData());
        commandService = injector.get(ICommandService);
        commandService.registerCommand(ShowDocHyperLinkEditPopupOperation);
        commandService.registerCommand(ToggleDocHyperLinkInfoPopupOperation);
        commandService.registerCommand(ClickDocHyperLinkOperation);
        selectionManager = injector.get(DocSelectionManagerService);
        popupService = injector.get(DocHyperLinkPopupService);
        selectionManager.__TEST_ONLY_setCurrentSelection({
            unitId,
            subUnitId: unitId,
        });
    });

    afterEach(() => {
        univer.dispose();
    });

    it('opens the hyperlink editor for a selected document range', async () => {
        selectionManager.__TEST_ONLY_add([{
            startOffset: 0,
            endOffset: 5,
            collapsed: false,
            isActive: true,
            segmentId: '',
            style: null as never,
        }]);

        const result = await commandService.executeCommand(ShowDocHyperLinkEditPopupOperation.id);

        expect(result).toBe(true);
        expect(popupService.editing).toBeUndefined();
    });

    it('keeps the hyperlink editor closed when there is no selected text', async () => {
        const result = await commandService.executeCommand(ShowDocHyperLinkEditPopupOperation.id);

        expect(result).toBe(false);
        expect(popupService.editing).toBeNull();
    });

    it('opens the hyperlink editor for an existing link and stores its range context', async () => {
        const link = {
            unitId,
            linkId: 'link-1',
            startIndex: 6,
            endIndex: 10,
            segmentId: '',
        };

        const result = await commandService.executeCommand(ShowDocHyperLinkEditPopupOperation.id, { link });

        expect(result).toBe(true);
        expect(popupService.editing).toEqual(link);
    });

    it('shows and hides hyperlink information for the selected link', async () => {
        const link = {
            unitId,
            linkId: 'link-1',
            startIndex: 6,
            endIndex: 10,
            segmentId: '',
        };

        const showResult = await commandService.executeCommand(ToggleDocHyperLinkInfoPopupOperation.id, link);
        expect(showResult).toBe(true);
        expect(popupService.showing).toEqual(link);

        const hideResult = await commandService.executeCommand(ToggleDocHyperLinkInfoPopupOperation.id);
        expect(hideResult).toBe(true);
        expect(popupService.showing).toBeNull();
    });

    it('does not open unsafe hyperlink URLs', async () => {
        const result = await commandService.executeCommand(ClickDocHyperLinkOperation.id, {
            unitId,
            linkId: 'unsafe-link',
            segmentId: '',
        });

        expect(result).toBe(false);
    });
});
