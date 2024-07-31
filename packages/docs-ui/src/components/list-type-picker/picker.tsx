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

import { PresetListType } from '@univerjs/core';
import React from 'react';
import styles from './index.module.less';

export interface IListTypePickerBaseProps {
    value?: PresetListType;
    onChange: (value: PresetListType | undefined) => void;
}

interface IListTypePickerProps extends IListTypePickerBaseProps {
    options: { value: PresetListType; img: string }[];
}

export const ListTypePicker = (props: IListTypePickerProps) => {
    const { value, onChange, options } = props;

    return (
        <div className={styles.docListTypePicker}>
            {options.map((item) => {
                return (
                    <img
                        key={item.value}
                        className={styles.docListTypePickerItem + (value === item.value ? ` ${styles.docListTypePickerItemActive}` : '')}
                        onClick={() => {
                            onChange(item.value);
                        }}
                        src={item.img}
                    />
                );
            })}
        </div>
    );
};

const orderListOptions = [
    {
        value: PresetListType.ORDER_LIST_1ai,
        img: 'URL_ADDRESS',
    },
    {
        value: PresetListType.ORDER_LIST_1ai_qutoa,
        img: 'URL_ADDRESS',
    },
    {
        value: PresetListType.ORDER_LIST,
        img: 'URL_ADDRESS',
    },
    {
        value: PresetListType.ORDER_LIST_Aai,
        img: 'URL_ADDRESS',
    },
    {
        value: PresetListType.ORDER_LIST_IA1,
        img: 'URL_ADDRESS',
    },
    {
        value: PresetListType.ORDER_LIST_01ai,
        img: 'URL_ADDRESS',
    },
];

export const OrderListTypePicker = (props: IListTypePickerBaseProps) => {
    return (
        <ListTypePicker
            {...props}
            options={orderListOptions}
        />
    );
};

const bulletOptions = [
    {
        value: PresetListType.BULLET_LIST,
        img: 'URL_ADDRESS',
    },
    {
        value: PresetListType.BULLET_LIST_1,
        img: 'URL_ADDRESS',
    },
    {
        value: PresetListType.BULLET_LIST_2,
        img: 'URL_ADDRESS',
    },
    {
        value: PresetListType.BULLET_LIST_3,
        img: 'URL_ADDRESS',
    },
    {
        value: PresetListType.BULLET_LIST_4,
        img: 'URL_ADDRESS',
    },
    {
        value: PresetListType.BULLET_LIST_5,
        img: 'URL_ADDRESS',
    },
];

export const BulletListTypePicker = (props: IListTypePickerBaseProps) => {
    return (
        <ListTypePicker
            {...props}
            options={bulletOptions}
        />
    );
};
