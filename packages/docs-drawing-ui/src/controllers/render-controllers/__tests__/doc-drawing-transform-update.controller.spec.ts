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

import { setDocsTableRenderViewportProvider } from '@univerjs/engine-render';
import { afterEach, describe, expect, it } from 'vitest';
import { getDocsTableCellAnchorContext } from '../../doc-drawing-transformer-update.controller';
import { getDocsTableCellDrawingOffset } from '../doc-drawing-transform-update.controller';

describe('DocDrawingTransformUpdateController', () => {
    afterEach(() => {
        setDocsTableRenderViewportProvider(null);
    });

    it('projects drawings in table cells through table, row, cell and scroll offsets', () => {
        setDocsTableRenderViewportProvider((unitId, tableId) => {
            if (unitId !== 'unit-1' || tableId !== 'table-1') {
                return null;
            }

            return {
                contentWidth: 480,
                scrollLeft: 30,
                viewportWidth: 160,
            };
        });

        const table = {
            left: 40,
            tableId: 'table-1#-#0',
            top: 80,
        };
        const row = {
            top: 12,
        };
        const cell = {
            left: 120,
            marginLeft: 8,
            marginTop: 6,
        };

        expect(getDocsTableCellDrawingOffset('unit-1', table as never, row as never, cell as never)).toEqual({
            left: 138,
            top: 98,
        });
    });

    it('resolves a table cell drawing anchor to the host page and scrolled cell offset', () => {
        setDocsTableRenderViewportProvider((unitId, tableId) => {
            if (unitId !== 'unit-1' || tableId !== 'table-1') {
                return null;
            }

            return {
                contentWidth: 480,
                scrollLeft: 30,
                viewportWidth: 160,
            };
        });

        const hostPage = { type: 'body' };
        const cell = {
            left: 120,
            marginLeft: 8,
            marginTop: 6,
        };
        const row = {
            cells: [cell],
            top: 12,
        };
        const table = {
            left: 40,
            parent: hostPage,
            rows: [row],
            tableId: 'table-1#-#0',
            top: 80,
        };
        Object.assign(row, { parent: table });
        Object.assign(cell, { parent: row });

        expect(getDocsTableCellAnchorContext('unit-1', cell as never)).toMatchObject({
            hostPage,
            offset: {
                left: 138,
                top: 98,
            },
        });
    });
});
