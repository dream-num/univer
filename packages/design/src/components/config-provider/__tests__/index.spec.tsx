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

import { render } from '@testing-library/react';
import React, { useContext } from 'react';
import { describe, expect, it } from 'vitest';

import zhCN from '../../../locale/zh-CN';
import type { ILocale } from '../../../locale/interface';
import { ConfigContext, ConfigProvider } from '../ConfigProvider';

describe('ConfigProvider', () => {
    it('should render correctly', () => {
        let _mountContainer: HTMLElement | null = null;
        let _locale: ILocale['design'] | undefined;

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
});
