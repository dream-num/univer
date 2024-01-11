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

import { LocaleService, throttle } from '@univerjs/core';
import { Button, Input, InputWithSlot, Pager, Select, useObservable } from '@univerjs/design';
import { Quantity } from '@wendellhu/redi';
import { useDependency } from '@wendellhu/redi/react-bindings';
import React, { Fragment, useCallback, useState } from 'react';

import type { IFindQuery } from '../../services/find-replace.service';
import { IFindReplaceService } from '../../services/find-replace.service';
import { FindReplaceState, IFindReplaceDialogService } from '../../services/find-replace-dialog.service';
import styles from './Dialog.module.less';

const FIND_THROTTLE_TIME = 500;

export function FindReplaceDialog() {
    const findReplaceService = useDependency(IFindReplaceService, Quantity.OPTIONAL);
    const findReplaceDialogService = useDependency(IFindReplaceDialogService);
    const localeService = useDependency(LocaleService);

    const [findString, setFindString] = useState<string>('');
    const [replaceString, setReplaceString] = useState<string>('');

    const findReplaceState = useObservable(findReplaceDialogService.state$, findReplaceDialogService.state);
    const onExpand = useCallback(() => findReplaceDialogService.toggleReplace(), [findReplaceDialogService]);

    const throttledFind = useCallback(
        throttle((query: IFindQuery) => {
            findReplaceService?.find(query);
        }, FIND_THROTTLE_TIME),
        []
    );

    const onFindInputChange = useCallback(
        (findString: string) => {
            if (findReplaceState === FindReplaceState.FIND) {
                throttledFind({ text: findString });
            }

            setFindString(findString);
        },
        [findReplaceState, findReplaceService]
    );

    const onReplaceInputChange = useCallback(
        (replaceString: string) => {
            setReplaceString(replaceString);
        },
        [findReplaceService]
    );

    return (
        <div className={styles.findReplaceDialogContainer}>
            {/* Disable the toggle in find state. */}
            {findReplaceState === FindReplaceState.FIND && (
                <Fragment>
                    <InputWithSlot
                        placeholder={'univer.find-replace.search-placeholder'}
                        slot={<Pager value={1} total={10} />}
                        value={findString}
                        onChange={(value) => onFindInputChange(value)}
                    />

                    <div className={styles.findReplaceExpandContainer}>
                        <Button type={'text'} size="small" onClick={onExpand}>
                            {localeService.t('findreplace.advanced-searching')}
                        </Button>
                    </div>
                </Fragment>
            )}

            {/*
             * TODO@wzhudev: this form should be configure by business (maybe with a schema?) Here we just
             * simply hard coded them here for a quick implementation.
             */}

            {findReplaceState === FindReplaceState.REPLACE && (
                <Fragment>
                    {localeService.t('univer.find-replace.replace-to')}
                    <Input
                        placeholder={localeService.t('univer.find-replace.replace-placeholder')}
                        value={replaceString}
                        onChange={(value) => onReplaceInputChange(value)}
                    />
                    {localeService.t('univer.find-replace.search-range')}
                    <Select value={'123'} onChange={() => {}} />
                    <Button type="primary">{localeService.t('univer.find-replace.find')}</Button>
                    <Button>{localeService.t('univer.find-replace.replace')}</Button>
                    <Button>{localeService.t('univer.find-replace.replaceAll')}</Button>
                </Fragment>
            )}
        </div>
    );
}
