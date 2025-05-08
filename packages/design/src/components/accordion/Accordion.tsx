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

import type { ReactNode } from 'react';
import { DownSingle } from '@univerjs/icons';
import { useState } from 'react';
import { clsx } from '../../helper/clsx';

interface IAccordionItem {
    label: ReactNode;
    children: ReactNode;
}

export interface IAccordionProps {
    className?: string;
    items: IAccordionItem[];
}

export function Accordion(props: IAccordionProps) {
    const { className, items } = props;
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleItem = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div
            data-u-comp="accordion"
            className={clsx(`
              univer-divide-x-0 univer-divide-y univer-divide-solid univer-divide-gray-200
              dark:univer-divide-gray-600
            `, className)}
        >
            {items.map((item, index) => (
                <div key={index}>
                    <button
                        className={`
                          univer-box-border univer-flex univer-w-full univer-cursor-pointer univer-items-center
                          univer-gap-1.5 univer-border-none univer-bg-transparent univer-p-4 univer-text-left
                          univer-text-gray-700
                          dark:univer-text-gray-200 dark:hover:univer-text-white
                          focus:univer-outline-none
                          hover:univer-text-gray-900
                        `}
                        type="button"
                        onClick={() => toggleItem(index)}
                    >
                        <DownSingle
                            className={clsx('univer-size-2.5 univer-flex-shrink-0 univer-transition-transform', {
                                '-univer-rotate-90': openIndex !== index,
                                'univer-rotate-0': openIndex === index,
                            })}
                        />
                        <span className="univer-font-medium">{item.label}</span>
                    </button>
                    <div
                        className={clsx(
                            `
                              univer-overflow-hidden univer-transition-[max-height,opacity] univer-duration-500
                              univer-ease-in-out
                            `,
                            openIndex === index
                                ? 'univer-max-h-screen'
                                : 'univer-max-h-0'
                        )}
                    >
                        <div className="univer-box-border univer-px-4 univer-py-1.5">{item.children}</div>
                    </div>
                </div>
            ))}
        </div>
    );
}
