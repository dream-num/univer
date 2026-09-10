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

import type { Root } from 'react-dom/client';
import { Injector, LocaleService, LocaleType } from '@univerjs/core';
import { RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { InsertTableOfContentsDialog } from '../InsertTableOfContentsDialog';
import { TableOfContentsDialog } from '../TableOfContentsDialog';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe('TableOfContentsDialog', () => {
    let root: Root | undefined;
    let container: HTMLDivElement | undefined;

    afterEach(async () => {
        if (root) await act(async () => root?.unmount());
        container?.remove();
    });

    it('defaults to page-only update and allows selecting a full update', async () => {
        const injector = new Injector();
        injector.add([LocaleService, { useClass: LocaleService }]);
        injector.get(LocaleService).load({
            [LocaleType.EN_US]: {
                'docs-toc-ui': {
                    tableOfContents: {
                        updatePageNumbersOnly: 'Update page numbers only',
                        updateEntireTable: 'Update entire table',
                        updateHint: 'Choose an update mode.',
                    },
                },
            },
        });
        const onModeChange = vi.fn();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        await act(async () => root?.render(
            <RediContext.Provider value={{ injector }}>
                <TableOfContentsDialog mode="pageNumbersOnly" onModeChange={onModeChange} />
            </RediContext.Provider>
        ));

        const radios = [...container.querySelectorAll<HTMLInputElement>('input[type="radio"]')];
        expect(radios.map((radio) => radio.checked)).toEqual([true, false]);
        await act(async () => radios[1].click());
        expect(radios.map((radio) => radio.checked)).toEqual([false, true]);
        expect(onModeChange).toHaveBeenCalledWith('entireTable');

        injector.dispose();
    });

    it('edits custom TOC options and updates the preview', async () => {
        const injector = new Injector();
        injector.add([LocaleService, { useClass: LocaleService }]);
        injector.get(LocaleService).load({
            [LocaleType.EN_US]: {
                'docs-toc-ui': {
                    tableOfContents: {
                        levels: 'Show levels',
                        format: 'Formats',
                        formatFromTemplate: 'From template',
                        formatClassic: 'Classic',
                        formatModern: 'Modern',
                        formatSimple: 'Simple',
                        showPageNumbers: 'Show page numbers',
                        rightAlignPageNumbers: 'Right align page numbers',
                        tabLeader: 'Tab leader',
                        leaderNone: 'None',
                        leaderDots: 'Dots',
                        leaderDashes: 'Dashes',
                        leaderUnderline: 'Underline',
                        preview: 'Print preview',
                        previewHeading: 'Heading',
                    },
                },
            },
        });
        const onChange = vi.fn();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        await act(async () => root?.render(
            <RediContext.Provider value={{ injector }}>
                <InsertTableOfContentsDialog
                    options={{ levels: 3, showPageNumbers: true, rightAlignPageNumbers: true, tabLeader: 'dots', format: 'fromTemplate' }}
                    onChange={onChange}
                />
            </RediContext.Provider>
        ));

        const checkboxes = [...container.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')];
        const selects = [...container.querySelectorAll<HTMLSelectElement>('select')];
        expect(container.textContent).toContain('··········');
        await act(async () => {
            checkboxes[0].click();
        });
        expect(checkboxes.map((checkbox) => checkbox.checked)).toEqual([false, false]);
        expect(selects[2].disabled).toBe(true);
        expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ showPageNumbers: false, rightAlignPageNumbers: false }));

        injector.dispose();
    });
});
