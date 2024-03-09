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

import { LocaleService } from '@univerjs/core';
import { Button, FormLayout, Input, InputWithSlot, Pager, Select } from '@univerjs/design';
import { ILayoutService, useObservable } from '@univerjs/ui';
import type { IDisposable } from '@wendellhu/redi';
import { useDependency } from '@wendellhu/redi/react-bindings';
import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react';

import { IFindReplaceService } from '../../services/find-replace.service';
import styles from './Dialog.module.less';

const FIND_THROTTLE_TIME = 500;

export function FindReplaceDialog() {
    const findReplaceService = useDependency(IFindReplaceService);
    const localeService = useDependency(LocaleService);
    const layoutService = useDependency(ILayoutService);

    const [findString, setFindString] = useState<string>('');
    const [replaceString, setReplaceString] = useState<string>('');

    const dialogContainerRef = useRef<HTMLDivElement>(null);

    const state = useObservable(findReplaceService.state$, undefined, true);
    const { matchesCount, matchesPosition } = state;
    const revealReplace = useCallback(() => findReplaceService.revealReplace(), [findReplaceService]);

    const updateFindString = useCallback(
        (findString: string) => findReplaceService.changeFindString(findString),
        // FIXME@wzhudev: this throttle function has no leading and taling config hence has some problems
        // throttle((findString: string) => findReplaceService.changeFindString(findString), FIND_THROTTLE_TIME),
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

    useEffect(() => {
        let disposable: IDisposable | undefined;
        if (dialogContainerRef.current) {
            disposable = layoutService.registerContainerElement(dialogContainerRef.current);
        }

        return () => disposable?.dispose();
    }, [dialogContainerRef.current]);

    function renderFindDialog() {
        return (
            <Fragment>
                <InputWithSlot
                    autoFocus={true}
                    placeholder={localeService.t('univer.find-replace.dialog.find-placeholder')}
                    slot={(
                        <Pager
                            loop={true}
                            value={matchesPosition}
                            total={matchesCount}
                            onChange={(newIndex) => {
                                if (matchesPosition === matchesCount && newIndex === 1) {
                                    findReplaceService.moveToNextMatch();
                                } else if (matchesPosition === 1 && newIndex === matchesCount) {
                                    findReplaceService.moveToPreviousMatch();
                                } else if (newIndex < matchesPosition) {
                                    findReplaceService.moveToPreviousMatch();
                                } else {
                                    findReplaceService.moveToNextMatch();
                                }
                            }}
                        />
                    )}
                    value={findString}
                    onChange={(value) => onFindInputChange(value)}
                />

                <div className={styles.findReplaceExpandContainer}>
                    <Button type="text" size="small" onClick={revealReplace}>
                        {localeService.t('univer.find-replace.dialog.advanced-finding')}
                    </Button>
                </div>
            </Fragment>
        );
    }

    function renderReplaceDialog() {
        /*
         * TODO@wzhudev: this form should be configure by business (maybe with a schema?) Here we just
         * simply hard coded them here for a quick implementation.
         */

        return (
            <Fragment>
                <FormLayout label={localeService.t('univer.find-replace.dialog.find')}>
                    <Input
                        placeholder={localeService.t('univer.find-replace.dialog.find-placeholder')}
                        autoFocus={true}
                        value={findString}
                        onChange={(value) => onReplaceInputChange(value)}
                    />
                </FormLayout>
                <FormLayout label={localeService.t('univer.find-replace.dialog.replace')}>
                    <Input
                        placeholder={localeService.t('univer.find-replace.dialog.replace-placeholder')}
                        value={replaceString}
                        onChange={(value) => onReplaceInputChange(value)}
                    />
                </FormLayout>
                <FormLayout label={localeService.t('univer.find-replace.dialog.find-range')}>
                    <Select value="123" onChange={() => {}} />
                </FormLayout>
                <Button type="primary">{localeService.t('univer.find-replace.dialog.find')}</Button>
                <Button>{localeService.t('univer.find-replace.dialog.replace')}</Button>
                <Button>{localeService.t('univer.find-replace.dialog.replace-all')}</Button>
            </Fragment>
        );
    }

    return (
        <div className={styles.findReplaceDialogContainer} ref={dialogContainerRef}>
            {!state.replaceRevealed ? renderFindDialog() : renderReplaceDialog()}
        </div>
    );
}
