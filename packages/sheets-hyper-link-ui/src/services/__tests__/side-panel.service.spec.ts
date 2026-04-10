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

import { SheetHyperLinkType } from '@univerjs/sheets-hyper-link';
import { describe, expect, it, vi } from 'vitest';
import { SheetsHyperLinkSidePanelService } from '../side-panel.service';

describe('SheetsHyperLinkSidePanelService', () => {
    it('should register, resolve and remove custom hyperlink views', () => {
        const service = new SheetsHyperLinkSidePanelService();
        const customView = {
            type: 'sheet-anchor',
            option: { label: 'Sheet Anchor', value: 'sheet-anchor' },
            Form: vi.fn(),
            convert: vi.fn(() => ({ display: 'A1', payload: '#A1', type: 'sheet-anchor' })),
            match: vi.fn((link) => link.payload === '#A1'),
        };

        expect(service.isBuiltInLinkType(SheetHyperLinkType.URL)).toBe(false);
        expect(service.isBuiltInLinkType('custom')).toBe(true);

        service.registerCustomHyperLink(customView as any);
        expect(service.getOptions()).toEqual([customView.option]);
        expect(service.getCustomHyperLink('sheet-anchor')).toBe(customView);
        expect(service.findCustomHyperLink({ payload: '#A1' } as any)).toBe(customView);

        service.removeCustomHyperLink('sheet-anchor');
        expect(service.getCustomHyperLink('sheet-anchor')).toBeUndefined();

        service.registerCustomHyperLink(customView as any);
        service.dispose();
        expect(service.getOptions()).toEqual([]);
    });
});
