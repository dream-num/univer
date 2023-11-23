import type { Meta } from '@storybook/react';
import React, { useState } from 'react';

import { enUS, type ILocale, zhCN } from '../../locale';
import { Button } from '../button/Button';
import { Confirm } from '../confirm/Confirm';
import { ConfigProvider } from './ConfigProvider';

const meta: Meta<typeof ConfigProvider> = {
    title: 'Components / ConfigProvider',
    component: ConfigProvider,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;

export const Playground = {
    render() {
        const [visible, setVisible] = useState(false);
        const [locale, setLocale] = useState(enUS);

        function handleChangeLocale(locale: ILocale) {
            setLocale(locale);
            setVisible(true);
        }

        return (
            <>
                <Button onClick={() => handleChangeLocale(enUS)}>enUS</Button>
                <Button onClick={() => handleChangeLocale(zhCN)}>zhCN</Button>
                <ConfigProvider locale={locale} mountContainer={document.body}>
                    <Confirm visible={visible} onClose={() => setVisible(false)}>
                        xx
                    </Confirm>
                </ConfigProvider>
            </>
        );
    },
};
