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

import { useDependency } from '@univerjs/core';

import { DropdownOverlay, DropdownProvider, DropdownTrigger, Input } from '@univerjs/design';
import { IDefinedNamesService } from '@univerjs/engine-formula';
import { MoreDownSingle } from '@univerjs/icons';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import { DefinedNameOverlay } from './DefinedNameOverlay';
import styles from './index.module.less';

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty dependency array means this effect runs once on mount and clean up on unmount

    return (
        <div className={styles.definedName}>
            <Input
                className={clsx({ [styles.defineNameInputDisable]: disable })}
                value={rangeString}
                type="text"
                size="small"
                affixWrapperStyle={{ border: 'none', paddingLeft: '6px', paddingRight: '6px', height: '100%' }}
            />

            <DropdownProvider>
                <DropdownTrigger>
                    <a
                        className={clsx(`
                          univer-flex univer-items-center univer-justify-center univer-px-1 univer-cursor-pointer
                          univer-absolute univer-right-0 univer-h-full univer-transition-colors univer-duration-200
                          hover:univer-bg-gray-100
                        `,
                        {
                            'univer-text-gray-300 univer-cursor-not-allowed hover:univer-bg-transparent': disable,
                        })}
                    >
                        <MoreDownSingle />
                    </a>
                </DropdownTrigger>

                <DropdownOverlay className="univer-z-[1001]" offset={{ x: -75, y: 2 }}>
                    <DefinedNameOverlay />
                </DropdownOverlay>
            </DropdownProvider>
        </div>
    );
}
