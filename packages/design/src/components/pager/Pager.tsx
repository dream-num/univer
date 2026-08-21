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

import { MoreLeftIcon, MoreRightIcon } from '@univerjs/icons';
import { useContext } from 'react';

import { clsx } from '../../helper/clsx';
import { ConfigContext } from '../config-provider/ConfigProvider';

export interface IPagerProps {
    className?: string;
    text?: string;
    value: number;
    total: number;
    loop?: boolean;
    previousButtonAriaLabel?: string;
    nextButtonAriaLabel?: string;
    onChange?(value: number): void;
}

export function Pager(props: IPagerProps) {
    const {
        className,
        value: current = 0,
        total: count = 0,
        loop,
        text: propText,
        previousButtonAriaLabel,
        nextButtonAriaLabel,
        onChange,
    } = props;
    const { locale } = useContext(ConfigContext);

    const text = propText ?? `${current}/${count}`;
    const hasValue = count > 0;
    const previousButtonDisabled = !loop && current <= 1;
    const nextButtonDisabled = !loop && current >= count;

    const onClickLeftArrow = () => {
        if (current === 1) {
            if (loop) {
                onChange?.(count);
            }
        } else {
            onChange?.(current - 1);
        }
    };

    const onClickRightArrow = () => {
        if (current === count) {
            if (loop) {
                onChange?.(1);
            }
        } else {
            onChange?.(current + 1);
        }
    };

    return (
        <div
            data-u-comp="pager"
            className={clsx(`
              univer-flex univer-flex-shrink-0 univer-items-center univer-text-sm univer-text-gray-700
              dark:!univer-text-gray-400
            `, className)}
        >
            {hasValue
                ? (
                    <>
                        <button
                            data-u-comp="pager-left-arrow"
                            className={`
                              univer-inline-flex univer-size-6 univer-cursor-pointer univer-items-center univer-rounded
                              univer-border-none univer-bg-transparent univer-p-0 univer-text-current
                              hover:univer-bg-gray-50
                              focus-visible:univer-outline-none focus-visible:univer-ring-2
                              focus-visible:univer-ring-primary-500
                              disabled:univer-cursor-default disabled:univer-opacity-40
                              dark:hover:!univer-bg-gray-600
                            `}
                            type="button"
                            aria-label={previousButtonAriaLabel ?? locale?.Accessibility.previous ?? 'Previous'}
                            disabled={previousButtonDisabled}
                            onClick={onClickLeftArrow}
                        >
                            <MoreLeftIcon className="rtl:univer-rotate-180" aria-hidden="true" />
                        </button>
                        <span className="univer-mx-1" aria-live="polite" aria-atomic="true">{text}</span>
                        <button
                            data-u-comp="pager-right-arrow"
                            className={`
                              univer-inline-flex univer-size-6 univer-cursor-pointer univer-items-center univer-rounded
                              univer-border-none univer-bg-transparent univer-p-0 univer-text-current
                              hover:univer-bg-gray-50
                              focus-visible:univer-outline-none focus-visible:univer-ring-2
                              focus-visible:univer-ring-primary-500
                              disabled:univer-cursor-default disabled:univer-opacity-40
                              dark:hover:!univer-bg-gray-600
                            `}
                            type="button"
                            aria-label={nextButtonAriaLabel ?? locale?.Accessibility.next ?? 'Next'}
                            disabled={nextButtonDisabled}
                            onClick={onClickRightArrow}
                        >
                            <MoreRightIcon className="rtl:univer-rotate-180" aria-hidden="true" />
                        </button>
                    </>
                )
                : <div className="univer-mx-1">{text}</div>}
        </div>
    );
}
