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

import { borderRightClassName, clsx, Dropdown } from '@univerjs/design';
import { IDefinedNamesService } from '@univerjs/engine-formula';
import { MoreDownSingle } from '@univerjs/icons';
import { useDependency } from '@univerjs/ui';
import { useEffect, useState } from 'react';
import { DefinedNameOverlay } from './DefinedNameOverlay';

export function DefinedName({ disable }: { disable: boolean }) {
    const [rangeString, setRangeString] = useState('');
    const definedNamesService = useDependency(IDefinedNamesService);

    useEffect(() => {
        const subscription = definedNamesService.currentRange$.subscribe(() => {
            setRangeString(definedNamesService.getCurrentRangeForString());
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []); // Empty dependency array means this effect runs once on mount and clean up on unmount

    // TODO: @DR-Univer: Should be implemented
    function handleChangeSelection() {

    }

    return (
        <div
            data-u-comp="defined-name"
            className={`
              univer-relative univer-box-border univer-flex univer-h-full univer-w-24 univer-border-r-gray-200
              univer-py-1.5 univer-transition-all
            `}
        >
            <input
                className={clsx(`
                  univer-box-border univer-h-full univer-w-full univer-appearance-none univer-px-1.5
                  univer-text-gray-900
                  dark:univer-border-r-gray-700 dark:univer-bg-gray-900 dark:univer-text-white
                  focus:univer-outline-none
                `, borderRightClassName, {
                    'univer-cursor-not-allowed': disable,
                })}
                type="text"
                value={rangeString}
                onChange={handleChangeSelection}
            />

            <Dropdown
                overlay={(
                    <div className="univer-z-[1001]">
                        <DefinedNameOverlay />
                    </div>
                )}
                disabled={disable}
            >
                <a
                    className={clsx(`
                      univer-absolute univer-right-0 univer-top-0 univer-flex univer-h-full univer-cursor-pointer
                      univer-items-center univer-justify-center univer-px-1 univer-transition-colors univer-duration-200
                      dark:univer-text-white dark:hover:univer-bg-gray-800
                      hover:univer-bg-gray-100
                    `, {
                        'univer-cursor-not-allowed univer-text-gray-300 dark:univer-text-gray-700 hover:univer-bg-transparent': disable,
                    })}
                >
                    <MoreDownSingle />
                </a>
            </Dropdown>
        </div>
    );
}
