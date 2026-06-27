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

import type { IEmbedHostContainerContribution } from '@univerjs/embed-ui';
import { UniverInstanceType } from '@univerjs/core';
import {
    createSheetsFloatingObjectHostAdapterContribution,
    createSheetsSheetTabHostAdapterContribution,
    EMBED_SHEETS_FLOATING_COMPONENT_KEY,
} from '@univerjs/sheets-drawing';

export function createSheetsFloatingObjectHostContainerContribution(): IEmbedHostContainerContribution {
    return {
        hostType: UniverInstanceType.UNIVER_SHEET,
        entry: 'sheets-floating-object',
        layout: 'doc-width-scale',
        supportedLayouts: ['doc-width-scale', 'aspect-fit', 'scroll-contained'],
        menuBehavior: 'floating',
    };
}

export function createSheetsSheetTabHostContainerContribution(): IEmbedHostContainerContribution {
    return {
        hostType: UniverInstanceType.UNIVER_SHEET,
        entry: 'sheets-sheet-tab',
        layout: 'tab-peer',
        supportedLayouts: ['tab-peer'],
        menuBehavior: 'host-override',
        mount: (context) => {
            const hostElement = queryEmbedHostElement('data-embed-sheets-sheet-tab-host', context.descriptor.hostAnchorId);
            return hostElement ? { hostElement } : {};
        },
    };
}

function queryEmbedHostElement(attribute: string, value: string): HTMLElement | null {
    return document.querySelector<HTMLElement>(`[${attribute}="${escapeAttributeValue(value)}"]`);
}

function escapeAttributeValue(value: string): string {
    return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

export { createSheetsFloatingObjectHostAdapterContribution, createSheetsSheetTabHostAdapterContribution, EMBED_SHEETS_FLOATING_COMPONENT_KEY };
