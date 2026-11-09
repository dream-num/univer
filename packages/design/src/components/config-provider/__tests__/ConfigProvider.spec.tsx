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

import { cleanup, fireEvent, render } from '@testing-library/react';
import { useContext } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import type enUS from '../../../locale/en-US';
import zhCN from '../../../locale/zh-CN';
import { InputNumber } from '../../input-number/InputNumber';
import { ConfigContext, ConfigProvider } from '../ConfigProvider';

afterEach(cleanup);

describe('ConfigProvider', () => {
    it('should render correctly', () => {
        let _mountContainer: HTMLElement | null = null;
        let _locale: typeof enUS['design'] | undefined;

        function Empty() {
            const { locale, mountContainer } = useContext(ConfigContext);

            _locale = locale;
            _mountContainer = mountContainer;

            return null;
        }

        const root = render(
            <ConfigProvider locale={zhCN?.design} mountContainer={document.body}>
                <Empty />
            </ConfigProvider>
        );

        expect(_locale).equals(zhCN.design);
        expect(_mountContainer).equals(document.body);

        root.unmount();
    });

    it('should render correctly when mountContainer is not document.body', () => {
        const mountContainer = document.createElement('div');
        document.body.appendChild(mountContainer);

        let _mountContainer: HTMLElement | null = null;

        function Empty() {
            const { mountContainer } = useContext(ConfigContext);

            _mountContainer = mountContainer;

            return null;
        }

        const root = render(
            <ConfigProvider locale={zhCN?.design} mountContainer={mountContainer}>
                <Empty />
            </ConfigProvider>
        );

        expect(_mountContainer).equals(mountContainer);

        root.unmount();
    });

    it('inherits touch density through nested providers and preserves explicit compact controls', () => {
        const { getByRole, queryByRole, rerender } = render(
            <ConfigProvider density="touch" mountContainer={document.body}>
                <ConfigProvider locale={zhCN.design} mountContainer={document.body}>
                    <InputNumber aria-label="Paragraph spacing" min={0} defaultValue={12} />
                </ConfigProvider>
            </ConfigProvider>
        );
        expect(queryByRole('button', { name: zhCN.design.Accessibility.increment })).toBeNull();
        const input = getByRole('textbox', { name: 'Paragraph spacing' }) as HTMLInputElement;
        fireEvent.change(input, { target: { value: '18' } });
        fireEvent.keyDown(input, { key: 'ArrowUp' });
        expect(input.value).toBe('19');
        expect(input.inputMode).toBe('decimal');

        rerender(
            <ConfigProvider density="touch" locale={zhCN.design} mountContainer={document.body}>
                <InputNumber size="mini" defaultValue={12} />
            </ConfigProvider>
        );
        expect(getByRole('button', { name: zhCN.design.Accessibility.increment })).toBeTruthy();

        rerender(
            <ConfigProvider density="touch" mountContainer={document.body}>
                <ConfigProvider density="default" locale={zhCN.design} mountContainer={document.body}>
                    <InputNumber defaultValue={12} />
                </ConfigProvider>
            </ConfigProvider>
        );
        expect(getByRole('button', { name: zhCN.design.Accessibility.increment })).toBeTruthy();
    });
});
