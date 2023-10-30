import type { Meta } from '@storybook/react';
import { useState } from 'react';

import { enUS, type ILocale, zhCN } from '../../locale';
import { Button } from '../button/Button';
import { ColorPicker } from '../color-picker/ColorPicker';
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
        const [locale, setLocale] = useState(enUS);

        function handleChangeLocale(locale: ILocale) {
            setLocale(locale);
        }

        return (
            <>
                <Button onClick={() => handleChangeLocale(enUS)}>enUS</Button>
                <Button onClick={() => handleChangeLocale(zhCN)}>zhCN</Button>
                <ConfigProvider locale={locale}>
                    <ColorPicker />
                </ConfigProvider>
            </>
        );
    },
};
