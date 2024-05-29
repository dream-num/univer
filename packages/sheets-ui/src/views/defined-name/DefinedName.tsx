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

import React, { useEffect } from 'react';

import { Dropdown, Input } from '@univerjs/design';
import { MoreDownSingle } from '@univerjs/icons';
import { useDependency } from '@wendellhu/redi/react-bindings';
import { IDefinedNamesService } from '@univerjs/engine-formula';
import clsx from 'clsx';
import styles from './index.module.less';
import { DefinedNameOverlay } from './DefinedNameOverlay';

export function DefinedName({ disable }: { disable: boolean }) {
    const [rangeString, setRangeString] = React.useState('');
    const definedNamesService = useDependency(IDefinedNamesService);

    useEffect(() => {
        const subscription = definedNamesService.currentRange$.subscribe(() => {
            setRangeString(definedNamesService.getCurrentRangeForString());
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []); // Empty dependency array means this effect runs once on mount and clean up on unmount

    return (
        <div className={styles.definedName}>
            <Input className={clsx({ [styles.defineNameInputDisable]: disable })} value={rangeString} type="text" size="small" affixWrapperStyle={{ border: 'none', paddingLeft: '6px', paddingRight: '6px', height: '100%' }} />

            <Dropdown overlay={<DefinedNameOverlay />}>
                <div className={clsx(styles.definedNameDropDown, { [styles.definedNameDropDownDisable]: disable })}>
                    <MoreDownSingle />
                </div>
            </Dropdown>
        </div>
    );
}
