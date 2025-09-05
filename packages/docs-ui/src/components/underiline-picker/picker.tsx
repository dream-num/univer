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
import { clsx } from '@univerjs/design';
import { CheckMarkIcon } from '@univerjs/icons';

export interface ITextDecorationTypePickerBaseProps {
    value?: ITextDecoration;
    onChange: (value: ITextDecoration | undefined) => void;
}

interface ITextDecorationTypePickerProps extends ITextDecorationTypePickerBaseProps {
    options: { value: TextDecoration; img: string }[];
}

export const TextDecorationTypePicker = (props: ITextDecorationTypePickerProps) => {
    const { value, onChange, options } = props;

    return (
        <div className="univer-grid univer-gap-2">
            {options.map((item) => {
                return (
                    <div className="univer-grid" key={item.value}>
                        { value?.t === item.value && (
                            <CheckMarkIcon
                                className="univer-absolute univer-mt-0.5 univer-text-primary-600"
                            />
                        ) }
                        <a
                            className={clsx(`
                              univer-ml-5 univer-block univer-h-5 univer-w-[72px] univer-cursor-pointer
                              univer-overflow-hidden univer-rounded univer-transition-all
                              hover:univer-bg-gray-100
                            `)}
                            onClick={() => {
                                onChange({ s: BooleanNumber.TRUE, t: item.value });
                            }}
                        >
                            <img
                                className="univer-size-full"
                                src={item.img}
                                draggable={false}
                            />
                        </a>
                    </div>
                );
            })}
        </div>
    );
};

const underlineOptions = [ // TODO: add DASH_DOT_DOT_HEAVY, DASH_DOT_HEAVY, DASHED_HEAVY, DASH_LONG, DASH_LONG_HEAVY, DOT_DASH, DOT_DOT_DASH, WAVY_HEAVY
    {
        value: TextDecoration.SINGLE,
        img: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzIiIGhlaWdodD0iMTIiIHZpZXdCb3g9IjAgMCA3MiAxMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8bGluZSB4MT0iMCIgeTE9IjYiIHgyPSI3MiIgeTI9IjYiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIyIiAvPgo8L3N2Zz4=',
    },
    {
        value: TextDecoration.DOUBLE,
        img: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzIiIGhlaWdodD0iMTIiIHZpZXdCb3g9IjAgMCA3MiAxMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8bGluZSB4MT0iMCIgeTE9IjQiIHgyPSI3MiIgeTI9IjQiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIxLjUiIC8+CiAgPGxpbmUgeDE9IjAiIHkxPSI4IiB4Mj0iNzIiIHkyPSI4IiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMS41IiAvPgo8L3N2Zz4=',
    },
    {
        value: TextDecoration.DOTTED,
        img: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzIiIGhlaWdodD0iMTIiIHZpZXdCb3g9IjAgMCA3MiAxMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8bGluZSB4MT0iMCIgeTE9IjYiIHgyPSI3MiIgeTI9IjYiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1kYXNoYXJyYXk9IjEsNSIgLz4KPC9zdmc+',
    },
    {
        value: TextDecoration.DASH,
        img: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzIiIGhlaWdodD0iMTIiIHZpZXdCb3g9IjAgMCA3MiAxMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8bGluZSB4MT0iMCIgeTE9IjYiIHgyPSI3MiIgeTI9IjYiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtZGFzaGFycmF5PSI2LDQiIC8+Cjwvc3ZnPg==',
    },
    {
        value: TextDecoration.THICK,
        img: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzIiIGhlaWdodD0iMTIiIHZpZXdCb3g9IjAgMCA3MiAxMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48bGluZSB4MT0iMCIgeTE9IjYiIHgyPSI3MiIgeTI9IjYiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSI0Ii8+PC9zdmc+',
    },
    {
        value: TextDecoration.WAVE,
        img: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzIiIGhlaWdodD0iMTIiIHZpZXdCb3g9IjAgMCA3MiAxMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cGF0aCBkPSJNMCw2IFE2LDIgMTIsNiBUMjQsNiBUMzYsNiBU NDgsNiBU NjAsNiBU NzIsNiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjIiLz4KPC9zdmc+',
    },
    {
        value: TextDecoration.WAVY_DOUBLE,
        img: 'data:image/svg+xml,%3Csvg width=\'72\' height=\'12\' viewBox=\'0 0 72 12\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0,3 C2,1 4,1 6,3 C8,5 10,5 12,3 C14,1 16,1 18,3 C20,5 22,5 24,3 C26,1 28,1 30,3 C32,5 34,5 36,3 C38,1 40,1 42,3 C44,5 46,5 48,3 C50,1 52,1 54,3 C56,5 58,5 60,3 C62,1 64,1 66,3 C68,5 70,5 72,3\' fill=\'none\' stroke=\'%23000\' stroke-width=\'1\'/%3E%3Cpath d=\'M0,9 C2,7 4,7 6,9 C8,11 10,11 12,9 C14,7 16,7 18,9 C20,11 22,11 24,9 C26,7 28,7 30,9 C32,11 34,11 36,9 C38,7 40,7 42,9 C44,11 46,11 48,9 C50,7 52,7 54,9 C56,11 58,11 60,9 C62,7 64,7 66,9 C68,11 70,11 72,9\' fill=\'none\' stroke=\'%23000\' stroke-width=\'1\'/%3E%3C/svg%3E',
    },
];

export const UnderlineTypePicker = (props: ITextDecorationTypePickerBaseProps) => {
    return (
        <TextDecorationTypePicker
            {...props}
            options={underlineOptions}
        />
    );
};
