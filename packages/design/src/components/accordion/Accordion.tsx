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
import { DownIcon } from '@univerjs/icons';
import { useContext, useId, useState } from 'react';
import { focusClassName } from '../../helper/class-utilities';
import { clsx } from '../../helper/clsx';
import { ConfigContext } from '../config-provider/ConfigProvider';

interface IAccordionItem {
    id?: string;
    label: ReactNode;
    children: ReactNode;
}

export interface IAccordionProps {
    className?: string;
    items: IAccordionItem[];
    defaultOpenIndex?: number | null;
    openIndex?: number | null;
    onOpenIndexChange?: (openIndex: number | null) => void;
}

export function Accordion(props: IAccordionProps) {
    const { className, defaultOpenIndex = null, items, onOpenIndexChange } = props;
    const { direction } = useContext(ConfigContext);
    const accordionId = useId();
    const [innerOpenIndex, setInnerOpenIndex] = useState<number | null>(defaultOpenIndex);
    const openIndex = props.openIndex !== undefined ? props.openIndex : innerOpenIndex;

    const toggleItem = (index: number) => {
        const nextOpenIndex = openIndex === index ? null : index;
        if (props.openIndex === undefined) {
            setInnerOpenIndex(nextOpenIndex);
        }
        onOpenIndexChange?.(nextOpenIndex);
    };

    const resolvedItems = items.map((item, index) => {
        const itemKey = item.id ?? `item-${index}`;
        return {
            item,
            index,
            itemKey,
            triggerId: `${accordionId}-trigger-${itemKey}`,
            panelId: `${accordionId}-panel-${itemKey}`,
        };
    });

    return (
        <div
            data-u-comp="accordion"
            dir={direction}
            className={clsx(`
              univer-divide-x-0 univer-divide-y univer-divide-solid univer-divide-gray-200
              dark:!univer-divide-gray-600
            `, className)}
        >
            {resolvedItems.map(({ item, index, itemKey, triggerId, panelId }) => {
                const isOpen = openIndex === index;

                return (
                    <div key={itemKey}>
                        <button
                            id={triggerId}
                            className={clsx(focusClassName, `
                              univer-box-border univer-flex univer-w-full univer-cursor-pointer univer-items-center
                              univer-gap-2 univer-rounded univer-border-none univer-bg-transparent univer-px-3
                              univer-py-2.5 univer-text-left univer-text-sm univer-text-gray-700
                              univer-transition-colors univer-duration-200
                              hover:univer-bg-gray-100 hover:univer-text-gray-900
                              motion-reduce:univer-transition-none
                              rtl:univer-text-right
                              dark:!univer-text-gray-200
                              dark:hover:!univer-bg-gray-600 dark:hover:!univer-text-gray-0
                            `)}
                            type="button"
                            aria-expanded={isOpen}
                            aria-controls={panelId}
                            onClick={() => toggleItem(index)}
                        >
                            <DownIcon
                                aria-hidden="true"
                                className={clsx(`
                                  univer-size-2.5 univer-flex-shrink-0 univer-text-gray-500 univer-transition-transform
                                  univer-duration-200
                                  motion-reduce:univer-transition-none
                                  dark:!univer-text-gray-300
                                `, {
                                    '-univer-rotate-90 rtl:univer-rotate-90': !isOpen,
                                    'univer-rotate-0': isOpen,
                                })}
                            />
                            <span className="univer-font-medium">{item.label}</span>
                        </button>
                        <div
                            id={panelId}
                            role="region"
                            aria-labelledby={triggerId}
                            aria-hidden={!isOpen}
                            className={clsx(`
                              univer-overflow-hidden univer-transition-[max-height,opacity] univer-duration-200
                              univer-ease-in-out
                              motion-reduce:univer-transition-none
                            `, {
                                'univer-max-h-screen univer-opacity-100': isOpen,
                                'univer-max-h-0 univer-opacity-0': !isOpen,
                            })}
                        >
                            <div
                                className="
                                  univer-box-border univer-px-3 univer-pb-3 univer-pt-1.5 univer-text-sm
                                  univer-text-gray-900
                                  dark:!univer-text-gray-0
                                "
                            >
                                {item.children}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
