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

import type { ISheetHyperLink } from '@univerjs/sheets-hyper-link';
import type { ICustomHyperLinkView } from '../side-panel.service';
import { Injector } from '@univerjs/core';
import { SheetHyperLinkType } from '@univerjs/sheets-hyper-link';
import { describe, expect, it } from 'vitest';
import { SheetsHyperLinkSidePanelService } from '../side-panel.service';

function createService(): SheetsHyperLinkSidePanelService {
    const injector = new Injector();
    injector.add([SheetsHyperLinkSidePanelService]);
    return injector.get(SheetsHyperLinkSidePanelService);
}

describe('SheetsHyperLinkSidePanelService', () => {
    it('should register, resolve and remove custom hyperlink views', () => {
        const service = createService();
        const customView: ICustomHyperLinkView = {
            type: 'sheet-anchor',
            option: { label: 'Sheet Anchor', value: 'sheet-anchor' },
            Form: () => null,
            convert: () => ({ display: 'A1', payload: '#A1', type: 'sheet-anchor' }),
            match: (link) => link.payload === '#A1',
        };

        expect(service.isBuiltInLinkType(SheetHyperLinkType.URL)).toBe(false);
        expect(service.isBuiltInLinkType('custom')).toBe(true);

        service.registerCustomHyperLink(customView);
        expect(service.getOptions()).toEqual([customView.option]);
        expect(service.getCustomHyperLink('sheet-anchor')).toBe(customView);
        expect(service.findCustomHyperLink({ payload: '#A1' } as ISheetHyperLink)).toBe(customView);

        service.removeCustomHyperLink('sheet-anchor');
        expect(service.getCustomHyperLink('sheet-anchor')).toBeUndefined();

        service.registerCustomHyperLink(customView);
        service.dispose();
        expect(service.getOptions()).toEqual([]);
    });
});
