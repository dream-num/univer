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

import type { ITextDecoration } from '@univerjs/core';
import { BooleanNumber, TextDecoration } from '@univerjs/core';
import { CheckMarkIcon } from '@univerjs/icons';
import { BorderLine } from './border-line/BorderLine';

export interface ITextDecorationTypePickerBaseProps {
    value?: ITextDecoration;
    onChange: (value: ITextDecoration | undefined) => void;
}

interface ITextDecorationTypePickerProps extends ITextDecorationTypePickerBaseProps {
    options: { value: TextDecoration }[];
}

export const TextDecorationTypePicker = (props: ITextDecorationTypePickerProps) => {
    const { value, onChange, options } = props;

    return (
        <section className="univer-rounded-lg">
            <ul className="univer-m-0 univer-grid univer-list-none univer-gap-1 univer-p-0">
                {options.map((item) => {
                    return (
                        <li
                            key={item.value}
                            className={`
                              univer-flex univer-cursor-pointer univer-items-center univer-justify-center univer-rounded
                              univer-px-1 univer-py-3
                              hover:univer-bg-gray-100
                              dark:hover:!univer-bg-gray-700
                            `}
                            onClick={() => {
                                onChange({ s: BooleanNumber.TRUE, t: item.value });
                            }}
                        >
                            {value?.t === item.value && (
                                <CheckMarkIcon
                                    className="univer-absolute univer-left-2 univer-text-primary-600"
                                />
                            )}
                            <BorderLine
                                className={`
                                  univer-ml-6 univer-fill-gray-900
                                  dark:!univer-fill-white
                                `}
                                type={item.value}
                            />
                        </li>
                    );
                })}
            </ul>
        </section>
    );
};

const underlineOptions = [ // TODO: add DASH_DOT_DOT_HEAVY, DASH_LONG, DASH_LONG_HEAVY, DOT_DASH, DOT_DOT_DASH, WAVY_HEAVY
    { value: TextDecoration.SINGLE },
    { value: TextDecoration.DOUBLE },
    { value: TextDecoration.DOTTED },
    { value: TextDecoration.DASH },
    { value: TextDecoration.DASHED_HEAVY },
    { value: TextDecoration.DASH_DOT_HEAVY },
    { value: TextDecoration.THICK },
    { value: TextDecoration.WAVE },
    { value: TextDecoration.WAVY_DOUBLE },
];

export const UnderlineTypePicker = (props: ITextDecorationTypePickerBaseProps) => {
    return (
        <TextDecorationTypePicker
            {...props}
            options={underlineOptions}
        />
    );
};
