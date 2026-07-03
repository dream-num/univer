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
import { BorderStyleTypes, BorderType, Univer } from '@univerjs/core';
import { ConfigProvider } from '@univerjs/design';
import { BorderStyleManagerService, SheetsSelectionsService } from '@univerjs/sheets';
import { IconManager, RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { BorderPanel } from '../BorderPanel';

class TestSheetsSelectionsService {
    getCellStylesProperty() {
        return {
            isAllValuesSame: true,
            value: {
                t: {
                    s: BorderStyleTypes.THIN,
                    cl: { rgb: '#123456' },
                },
            },
        };
    }
}

class TestState {
    static changes: IBorderInfo[] = [];

    static reset(): void {
        this.changes = [];
    }
}

function renderPanel(value: IBorderInfo, direction: 'ltr' | 'rtl' = 'ltr') {
    const univer = new Univer();
    const injector = univer.__getInjector();
    injector.add([BorderStyleManagerService]);
    injector.add([IconManager]);
    injector.add([SheetsSelectionsService, { useClass: TestSheetsSelectionsService as never }]);

    const container = document.createElement('div');
    document.body.appendChild(container);
    const root: Root = createRoot(container);

    act(() => {
        root.render(
            <RediContext.Provider value={{ injector }}>
                <ConfigProvider mountContainer={document.body} direction={direction}>
                    <BorderPanel
                        value={value}
                        onChange={(nextValue) => TestState.changes.push(nextValue)}
                    />
                </ConfigProvider>
            </RediContext.Provider>
        );
    });

    return {
        container,
        dispose: () => {
            act(() => root.unmount());
            container.remove();
            univer.dispose();
        },
    };
}

function hasClassToken(element: HTMLElement, token: string): boolean {
    return element.className.split(/\s+/).includes(token);
}

describe('BorderPanel', () => {
    afterEach(() => {
        TestState.reset();
    });

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

        expect(TestState.changes).toEqual([
            {
                type: BorderType.TOP,
                color: '#123456',
                style: BorderStyleTypes.THIN,
                activeBorderType: true,
            },
        ]);
        rendered.dispose();
    });

    it('keeps color and line dropdown icon order compatible with rtl', () => {
        const rendered = renderPanel({
            type: BorderType.ALL,
            color: '#123456',
            style: BorderStyleTypes.THIN,
            activeBorderType: true,
        }, 'rtl');

        expect(rendered.container.querySelector('section')?.getAttribute('dir')).toBe('rtl');
        const dropdownButtons = rendered.container.querySelectorAll('button');

        expect(dropdownButtons).toHaveLength(2);
        dropdownButtons.forEach((button) => {
            expect(hasClassToken(button, 'rtl:univer-flex-row-reverse')).toBe(false);
        });
        rendered.dispose();
    });
});
