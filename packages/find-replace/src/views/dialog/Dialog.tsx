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
import { Button, Input, InputWithSlot, Pager, Select, useObservable, FormLayout } from '@univerjs/design';
import { useDependency } from '@wendellhu/redi/react-bindings';
import React, { Fragment, useCallback, useState } from 'react';

import { IFindReplaceService } from '../../services/find-replace.service';
import styles from './Dialog.module.less';
import { map } from 'rxjs';

const FIND_THROTTLE_TIME = 500;

export function FindReplaceDialog() {
    const findReplaceService = useDependency(IFindReplaceService);
    const localeService = useDependency(LocaleService);

    const [findString, setFindString] = useState<string>('');
    const [replaceString, setReplaceString] = useState<string>('');

    const replaceRevealed = useObservable(findReplaceService.state$.pipe(map((s) => s.replaceRevealed)), false);
    const revealReplace = useCallback(() => findReplaceService.revealReplace(), [findReplaceService]);

    const updateFindString = useCallback(
        throttle((findString: string) => findReplaceService.changeFindString(findString), FIND_THROTTLE_TIME),
        [findReplaceService]
    );

    const onFindInputChange = useCallback(
        (findString: string) => {
            setFindString(findString);
            updateFindString(findString);
        },
        [findReplaceService]
    );

    const onReplaceInputChange = useCallback(
        (replaceString: string) => {
            setReplaceString(replaceString);
        },
        [findReplaceService]
    );

    function renderFindDialog() {
        return (
            <Fragment>
                <InputWithSlot
                    placeholder={'univer.find-replace.find-placeholder'}
                    slot={<Pager value={1} total={10} />}
                    value={findString}
                    onChange={(value) => onFindInputChange(value)}
                />

                <div className={styles.findReplaceExpandContainer}>
                    <Button type={'text'} size="small" onClick={revealReplace}>
                        {localeService.t('univer.find-replace.dialog.advanced-finding')}
                    </Button>
                </div>
            </Fragment>
        );
    }

    function renderReplaceDialog() {
        {
            /*
             * TODO@wzhudev: this form should be configure by business (maybe with a schema?) Here we just
             * simply hard coded them here for a quick implementation.
             */
        }

        return (
            <Fragment>
                <FormLayout label={localeService.t('univer.find-replace.dialog.find-placeholder')}>
                    <Input value={findString} onChange={(value) => onReplaceInputChange(value)} />
                </FormLayout>
                <FormLayout label={localeService.t('univer.find-replace.dialog.replace-placeholder')}>
                    <Input value={replaceString} onChange={(value) => onReplaceInputChange(value)} />
                </FormLayout>
                <FormLayout label={localeService.t('univer.find-replace.dialog.search-range')}>
                    <Select value={'123'} onChange={() => {}} />
                </FormLayout>
                <Button type="primary">{localeService.t('univer.find-replace.dialog.find')}</Button>
                <Button>{localeService.t('univer.find-replace.dialog.replace')}</Button>
                <Button>{localeService.t('univer.find-replace.dialog.replaceAll')}</Button>
            </Fragment>
        );
    }

    return (
        <div className={styles.findReplaceDialogContainer}>
            {!replaceRevealed ? renderFindDialog() : renderReplaceDialog()}
        </div>
    );
}
