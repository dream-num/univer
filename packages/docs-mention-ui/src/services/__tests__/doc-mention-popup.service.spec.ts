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

import { Injector } from '@univerjs/core';
import { DocCanvasPopManagerService } from '@univerjs/docs-ui';
import { describe, expect, it } from 'vitest';
import { DocMentionPopupService } from '../doc-mention-popup.service';
import { DocMentionService } from '../doc-mention.service';

class CapturingDocCanvasPopManagerService {
    readonly popupDisposals: number[] = [];
    readonly attached: unknown[] = [];

    attachPopupToRange(range: unknown, popup: unknown, unitId: string) {
        this.attached.push({ range, popup, unitId });
        return { dispose: () => this.popupDisposals.push(this.attached.length) };
    }
}

const CapturingDocCanvasPopManagerServiceCtor = CapturingDocCanvasPopManagerService as unknown as typeof DocCanvasPopManagerService;

function createService() {
    const injector = new Injector();
    injector.add([DocCanvasPopManagerService, { useClass: CapturingDocCanvasPopManagerServiceCtor }]);
    injector.add([DocMentionService]);
    injector.add([DocMentionPopupService]);
    const popupManager = injector.get(DocCanvasPopManagerService) as unknown as CapturingDocCanvasPopManagerService;

    return {
        service: injector.get(DocMentionPopupService),
        mentionService: injector.get(DocMentionService),
        attached: popupManager.attached,
        popupDisposals: popupManager.popupDisposals,
    };
}

describe('DocMentionPopupService', () => {
    it('opens an edit popup for the active mention and disposes it when editing ends', () => {
        const { service, mentionService, attached, popupDisposals } = createService();
        const popups: unknown[] = [];
        const sub = service.editPopup$.subscribe((value) => popups.push(value));

        mentionService.startEditing({ unitId: 'doc-1', index: 12 });
        expect(service.editPopup).toMatchObject({ anchor: 12, unitId: 'doc-1' });
        expect(attached).toMatchObject([{
            range: { startOffset: 12, endOffset: 12, collapsed: true },
            unitId: 'doc-1',
        }]);

        mentionService.endEditing();
        expect(service.editPopup).toBeNull();
        expect(popupDisposals).toEqual([1]);
        expect(popups.at(-1)).toBeNull();

        sub.unsubscribe();
    });

    it('replaces an existing edit popup and closes when the popup reports outside clicks', () => {
        const { service, mentionService, attached, popupDisposals } = createService();

        mentionService.startEditing({ unitId: 'doc-1', index: 4 });
        mentionService.startEditing({ unitId: 'doc-1', index: 7 });

        expect(service.editPopup).toMatchObject({ anchor: 7, unitId: 'doc-1' });
        expect(popupDisposals).toEqual([1]);
        expect(attached).toMatchObject([
            { range: { startOffset: 4, endOffset: 4, collapsed: true }, unitId: 'doc-1' },
            { range: { startOffset: 7, endOffset: 7, collapsed: true }, unitId: 'doc-1' },
        ]);

        const latestPopup = attached.at(-1) as { popup: { onClickOutside: () => void } };
        latestPopup.popup.onClickOutside();

        expect(mentionService.editing).toBeUndefined();
        expect(service.editPopup).toBeNull();
        expect(popupDisposals).toEqual([1, 2]);
    });

    it('leaves empty popup states unchanged when there is nothing to close', () => {
        const { service, popupDisposals } = createService();

        service.closeEditPopup();
        service.showInfoPopup();
        service.closeInfoPopup();

        expect(service.editPopup).toBeUndefined();
        expect(service.infoPopup).toBeUndefined();
        expect(popupDisposals).toEqual([]);
    });
});
