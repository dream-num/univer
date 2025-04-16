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

import type { Meta } from '@storybook/react';
import type { ILocale } from '../../locale/interface';

import { useState } from 'react';
import enUS from '../../locale/en-US';
import zhCN from '../../locale/zh-CN';
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
                <ConfigProvider locale={locale?.design} mountContainer={document.body}>
                    <Confirm visible={visible} onClose={() => setVisible(false)}>
                        xx
                    </Confirm>
                </ConfigProvider>
            </>
        );
    },
};
