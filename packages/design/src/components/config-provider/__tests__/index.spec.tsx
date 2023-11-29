import { render } from '@testing-library/react';
import React, { useContext } from 'react';
import { describe, expect, test } from 'vitest';

import type { ILocale } from '../../../locale';
import { enUS, zhCN } from '../../../locale';
import { ConfigContext, ConfigProvider } from '../ConfigProvider';

describe('ConfigProvider', () => {
    test('should render correctly', () => {
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

    test('should render correctly when mountContainer is not document.body', () => {
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

    test('should render correctly when locale is invalid', () => {
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
