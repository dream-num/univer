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

import type { ICanvasPopup } from '../../../services/canvas-pop-manager.service';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it } from 'vitest';
import { CellAlertType } from '../../../services/cell-alert-manager.service';
import { CellAlert } from '../CellAlertPopup';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe('CellAlert', () => {
    it('uses flex gap instead of a physical icon margin', () => {
        const container = document.createElement('div');
        const root = createRoot(container);
        const popup = {
            componentKey: 'univer.sheet.cell-alert',
            extraProps: {
                alert: {
                    type: CellAlertType.ERROR,
                    title: 'Invalid value',
                    message: 'Value must be at least 100',
                },
            },
        } as ICanvasPopup;

        act(() => root.render(<CellAlert popup={popup} />));

        const titleRow = Array.from(container.querySelectorAll('div')).find((element) => element.textContent === 'Invalid value');
        expect(titleRow?.className).toContain('univer-gap-x-1.5');
        expect(container.querySelector('svg')?.getAttribute('class')).not.toContain('univer-mr-1.5');

        act(() => root.unmount());
    });
});
