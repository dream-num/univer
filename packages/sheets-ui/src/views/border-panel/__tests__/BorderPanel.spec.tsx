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

import type { IBorderInfo } from '@univerjs/sheets';
import type { Root } from 'react-dom/client';
import { BorderStyleTypes, BorderType, LocaleService, LocaleType, Univer } from '@univerjs/core';
import { ConfigProvider } from '@univerjs/design';
import * as icons from '@univerjs/icons';
import { SheetsSelectionsService } from '@univerjs/sheets';
import { IconManager, RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it, onTestFinished } from 'vitest';
import arSA from '../../../locale/ar-SA';
import enUS from '../../../locale/en-US';
import { BorderPanel } from '../BorderPanel';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function renderPanel(value: IBorderInfo, direction: 'ltr' | 'rtl' = 'ltr', locale = LocaleType.EN_US) {
    const univer = new Univer();
    const injector = univer.__getInjector();
    injector.add([IconManager]);
    injector.add([SheetsSelectionsService]);
    injector.get(IconManager).register(icons);
    const localeService = injector.get(LocaleService);
    localeService.load({ [LocaleType.EN_US]: enUS, [LocaleType.AR_SA]: arSA });
    localeService.setLocale(locale);
    localeService.setDirection(direction);

    const container = document.createElement('div');
    document.body.appendChild(container);
    const root: Root = createRoot(container);
    const changes: IBorderInfo[] = [];

    function render(value: IBorderInfo) {
        root.render(
            <RediContext.Provider value={{ injector }}>
                <ConfigProvider mountContainer={document.body} direction={direction}>
                    <BorderPanel
                        value={value}
                        onChange={(nextValue) => {
                            changes.push(nextValue);
                            render(nextValue);
                        }}
                    />
                </ConfigProvider>
            </RediContext.Provider>
        );
    }

    act(() => render(value));
    onTestFinished(() => {
        act(() => root.unmount());
        container.remove();
        univer.dispose();
    });

    return { container, changes };
}

describe('BorderPanel', () => {
    it('keeps the current border color and style when selecting a new border type', () => {
        const rendered = renderPanel({
            type: BorderType.ALL,
            color: '#123456',
            style: BorderStyleTypes.THIN,
            activeBorderType: true,
        });

        const borderTypeItems = rendered.container.querySelectorAll('a');
        act(() => {
            (borderTypeItems[0] as HTMLElement).click();
        });

        expect(rendered.changes).toEqual([
            {
                type: BorderType.TOP,
                color: '#123456',
                style: BorderStyleTypes.THIN,
                activeBorderType: true,
            },
        ]);
    });

    it.each([
        { direction: 'ltr', locale: LocaleType.EN_US },
        { direction: 'rtl', locale: LocaleType.AR_SA },
    ] as const)('keeps the selected border style and preview in sync in $direction', async ({ direction, locale }) => {
        const rendered = renderPanel({
            type: BorderType.ALL,
            color: '#123456',
            style: BorderStyleTypes.DOTTED,
            activeBorderType: true,
        }, direction, locale);

        expect(rendered.container.querySelector('section')?.getAttribute('dir')).toBe(direction);
        const trigger = rendered.container.querySelectorAll('button')[1];
        await act(async () => trigger.click());

        const options = document.body.querySelectorAll('li');
        const dottedPreview = options[2].querySelector('svg')!;
        expect(trigger.querySelector('svg')?.innerHTML).toBe(dottedPreview.innerHTML);
        expect(options[2].querySelector('button')?.getAttribute('aria-pressed')).toBe('true');

        const dashedPreview = options[3].querySelector('svg')!;
        await act(async () => {
            dashedPreview.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });

        expect(rendered.changes).toEqual([{
            type: BorderType.ALL,
            color: '#123456',
            style: BorderStyleTypes.DASHED,
            activeBorderType: true,
        }]);
        expect(trigger.querySelector('svg')?.innerHTML).toBe(dashedPreview.innerHTML);
        expect(options[3].querySelector('button')?.getAttribute('aria-pressed')).toBe('true');
        expect(options[2].querySelector('button')?.getAttribute('aria-pressed')).toBe('false');
    });
});
