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

import type { IDisposable } from '@univerjs/core';
import type { IMessageProps } from '@univerjs/design';
import type { ReactElement } from 'react';
import { ConfigService, IConfigService, Injector, LocaleService } from '@univerjs/core';
import { FUNCTION_NAMES_MATH, FUNCTION_NAMES_STATISTICAL } from '@univerjs/engine-formula';
import { IClipboardInterfaceService, IMessageService, RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { SHEETS_UI_PLUGIN_CONFIG_KEY } from '../../../config/config';
import { IStatusBarService, StatusBarService } from '../../../services/status-bar.service';
import { CopyableStatisticItem } from '../CopyableStatisticItem';
import { StatusBar } from '../StatusBar';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

class TestLocaleService {
    t(key: string): string {
        return key;
    }
}

class TestClipboardService {
    readonly supportClipboard = true;

    async writeText(text: string): Promise<void> {
        TestState.copiedText = text;
    }

    async write(text: string): Promise<void> {
        TestState.copiedText = text;
    }

    async readText(): Promise<string> {
        return TestState.copiedText;
    }

    async read(): Promise<ClipboardItem[]> {
        return [];
    }
}

class TestMessageService {
    show(options: IMessageProps): IDisposable {
        TestState.messages.push(String(options.content));
        return { dispose(): void {} };
    }

    remove(): void {}

    removeAll(): void {}
}

class TestState {
    static copiedText = '';
    static messages: string[] = [];

    static reset(): void {
        this.copiedText = '';
        this.messages = [];
    }
}

function setViewportWidth(width: number) {
    Object.defineProperty(window, 'innerWidth', {
        configurable: true,
        writable: true,
        value: width,
    });
}

function createStatusBarInjector() {
    const injector = new Injector();
    injector.add([IConfigService, { useClass: ConfigService }]);
    injector.add([LocaleService, { useClass: TestLocaleService as never }]);
    injector.add([IStatusBarService, { useClass: StatusBarService }]);
    injector.add([IClipboardInterfaceService, { useClass: TestClipboardService as never }]);
    injector.add([IMessageService, { useClass: TestMessageService as never }]);

    injector.get(IConfigService).setConfig(SHEETS_UI_PLUGIN_CONFIG_KEY, { statusBarStatistic: true });

    return injector;
}

function renderWithDependencies(element: ReactElement) {
    const injector = createStatusBarInjector();
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
        root.render(
            <RediContext.Provider value={{ injector }}>
                {element}
            </RediContext.Provider>
        );
    });

    return {
        container,
        injector,
        unmount: () => {
            act(() => root.unmount());
            container.remove();
        },
    };
}

function queryByText(container: HTMLElement, text: string): HTMLElement | null {
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
        if (node.textContent === text) {
            return node.parentElement;
        }
        node = walker.nextNode();
    }

    return null;
}

function getByText(container: HTMLElement, text: string): HTMLElement {
    const element = queryByText(container, text);
    if (!element) {
        throw new Error(`Text not found: ${text}`);
    }

    return element;
}

function publishStatistics(injector: Injector) {
    act(() => {
        injector.get(IStatusBarService).setState({
            pattern: '0.00',
            values: [
                { func: FUNCTION_NAMES_STATISTICAL.MAX, value: 12.5 },
                { func: FUNCTION_NAMES_STATISTICAL.MIN, value: 3 },
                { func: FUNCTION_NAMES_MATH.SUM, value: 15.5 },
                { func: FUNCTION_NAMES_STATISTICAL.COUNTA, value: 3 },
                { func: FUNCTION_NAMES_STATISTICAL.COUNT, value: 2 },
                { func: FUNCTION_NAMES_STATISTICAL.AVERAGE, value: 7.75 },
            ],
        });
    });
}

describe('StatusBar', () => {
    const disposals: Array<() => void> = [];

    afterEach(() => {
        disposals.splice(0).forEach((dispose) => dispose());
        TestState.reset();
        setViewportWidth(1024);
    });

    it('renders filtered statistics from service state with number formatting', () => {
        setViewportWidth(1024);
        const { container, injector, unmount } = renderWithDependencies(<StatusBar />);
        disposals.push(unmount);

        publishStatistics(injector);

        expect(getByText(container, 'sheets-ui.statusbar.max: 12.50')).toBeTruthy();
        expect(getByText(container, 'sheets-ui.statusbar.min: 3.00')).toBeTruthy();
        expect(getByText(container, 'sheets-ui.statusbar.sum: 15.50')).toBeTruthy();
        expect(getByText(container, 'sheets-ui.statusbar.countA: 3')).toBeTruthy();
        expect(getByText(container, 'sheets-ui.statusbar.count: 2')).toBeTruthy();
        expect(getByText(container, 'sheets-ui.statusbar.average: 7.75')).toBeTruthy();
    });

    it('keeps only the first available statistic in narrow viewports', () => {
        setViewportWidth(640);
        const { container, injector, unmount } = renderWithDependencies(<StatusBar />);
        disposals.push(unmount);

        publishStatistics(injector);

        expect(getByText(container, 'sheets-ui.statusbar.max: 12.50')).toBeTruthy();
        expect(queryByText(container, 'sheets-ui.statusbar.min: 3.00')).toBeNull();
        expect(queryByText(container, 'sheets-ui.statusbar.sum: 15.50')).toBeNull();
    });
});

describe('CopyableStatisticItem', () => {
    const disposals: Array<() => void> = [];

    afterEach(() => {
        disposals.splice(0).forEach((dispose) => dispose());
        TestState.reset();
    });

    it('copies the raw statistic value and reports a success message', async () => {
        const { container, unmount } = renderWithDependencies(
            <CopyableStatisticItem
                name={FUNCTION_NAMES_MATH.SUM}
                value={1234.5}
                show
                disable={false}
                pattern="0.00"
            />
        );
        disposals.push(unmount);

        await act(async () => {
            getByText(container, 'sheets-ui.statusbar.sum: 1234.50').dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await Promise.resolve();
        });

        expect(TestState.copiedText).toBe('1234.5');
        expect(TestState.messages).toEqual(['sheets-ui.statusbar.copied']);
    });
});
