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

import { MoreLeftSingle, MoreRightSingle } from '@univerjs/icons';
import { useMemo } from 'react';
import { clsx } from '../../helper/clsx';

export interface IPagerProps {
    className?: string;

    text?: string;

    value: number;
    total: number;
    loop?: boolean;

    onChange?(value: number): void;
}

export function Pager(props: IPagerProps) {
    const { className, value: current = 0, total: count = 0, loop, text: propText } = props;

    const text = useMemo(() => propText ?? `${current}/${count}`, [current, count, propText]);
    const hasValue = count > 0;

    const onClickLeftArrow = () => {
        if (current === 1) {
            if (loop) {
                props.onChange?.(count);
            }
        } else {
            props.onChange?.(current - 1);
        }
    };

    const onClickRightArrow = () => {
        if (current === count) {
            if (loop) {
                props.onChange?.(1);
            }
        } else {
            props.onChange?.(current + 1);
        }
    };

    return (
        <div
            data-u-comp="pager"
            className={clsx(`
              univer-flex univer-flex-shrink-0 univer-items-center univer-text-sm univer-text-gray-700
              dark:univer-text-gray-400
            `, className)}
        >
            {hasValue
                ? (
                    <>
                        <div
                            data-u-comp="pager-left-arrow"
                            className={`
                              univer-inline-flex univer-size-4 univer-cursor-pointer univer-items-center univer-rounded
                              dark:hover:univer-bg-gray-600
                              hover:univer-bg-gray-50
                            `}
                            role="button"
                            onClick={onClickLeftArrow}
                        >
                            <MoreLeftSingle />
                        </div>
                        <div className="univer-mx-1">{text}</div>
                        <div
                            data-u-comp="pager-right-arrow"
                            className={`
                              univer-inline-flex univer-size-4 univer-cursor-pointer univer-items-center univer-rounded
                              dark:hover:univer-bg-gray-600
                              hover:univer-bg-gray-50
                            `}
                            role="button"
                            onClick={onClickRightArrow}
                        >
                            <MoreRightSingle />
                        </div>
                    </>
                )
                : <div className="univer-mx-1">{text}</div>}
        </div>
    );
}
