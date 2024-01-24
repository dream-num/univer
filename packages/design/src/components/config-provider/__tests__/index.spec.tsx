/**
 * Copyright 2023-present DreamNum Inc.
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

import type { ILocale } from '../../../locale';
import { enUS, zhCN } from '../../../locale';
import { ConfigContext, ConfigProvider } from '../ConfigProvider';

describe('ConfigProvider', () => {
    it('should render correctly', () => {
        let _mountContainer: HTMLElement | null = null;
        let _locale: ILocale | null = null;

        function Empty() {
            const { locale, mountContainer } = useContext(ConfigContext);

            _locale = locale;
            _mountContainer = mountContainer;

            return <></>;
        }

        const root = render(
            <ConfigProvider locale={zhCN} mountContainer={document.body}>
                <Empty />
            </ConfigProvider>
        );

        expect(_locale).equals(zhCN);
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

            return <></>;
        }

        const root = render(
            <ConfigProvider locale={zhCN} mountContainer={mountContainer}>
                <Empty />
            </ConfigProvider>
        );

        expect(_mountContainer).equals(mountContainer);

        root.unmount();
    });

    it('should render correctly when locale is invalid', () => {
        const mountContainer = document.createElement('div');
        document.body.appendChild(mountContainer);

        let _locale: ILocale | null = null;

        function Empty() {
            const { locale } = useContext(ConfigContext);

            _locale = locale;

            return <></>;
        }

        const root = render(
            <ConfigProvider locale={{} as any} mountContainer={mountContainer}>
                <Empty />
            </ConfigProvider>
        );

        expect(_locale).equals(enUS);

        root.unmount();
    });
});
