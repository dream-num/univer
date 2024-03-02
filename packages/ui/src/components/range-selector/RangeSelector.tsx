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
import { Button, Dialog, FormLayout, Input, Tooltip } from '@univerjs/design';
import { CloseSingle, SelectRangeSingle } from '@univerjs/icons';
import { useDependency } from '@wendellhu/redi/react-bindings';
import React, { useEffect, useRef, useState } from 'react';

import { TextEditor } from '../editor/TextEditor';
import styles from './index.module.less';

export interface IRangeSelectorProps {
    id: string;
    value?: string;
    onChange?: (range: string) => void;
}

export function RangeSelector(props: IRangeSelectorProps) {
    const { onChange, id, value = '' } = props;

    const [selectorVisible, setSelectorVisible] = useState(false);
    const localeService = useDependency(LocaleService);

    const [active, setActive] = useState(false);

    const [valid, setValid] = useState(true);

    function handleToggleVisible() {
        setSelectorVisible(!selectorVisible);
    }

    function handleClick() {
        setSelectorVisible(true);
    }

    function onFocus(state: boolean) {
        setActive(state);
    }

    function onValid(state: boolean) {
        setValid(state);
    }

    function handleConform() {
        console.warn('save');
        handleToggleVisible();
    }

    let sClassName = styles.rangeSelector;
    if (!valid) {
        sClassName = `${styles.rangeSelector} ${styles.rangeSelectorError}`;
    } else if (active) {
        sClassName = `${styles.rangeSelector} ${styles.rangeSelectorActive}`;
    }

    return (
        <>
            <div className={sClassName}>
                <TextEditor onValid={onValid} onFocus={onFocus} id={id} onlyInputRange={true} canvasStyle={{ fontSize: 10 }} className={styles.rangeSelectorEditor} />
                <Tooltip title={localeService.t('rangeSelector.buttonTooltip')} placement="bottom">
                    <button className={styles.rangeSelectorIcon} onClick={handleClick}>
                        <SelectRangeSingle />
                    </button>
                </Tooltip>
            </div>

            <Dialog
                width="360px"
                visible={selectorVisible}
                title={localeService.t('rangeSelector.title')}
                draggable
                closeIcon={<CloseSingle />}
                footer={(
                    <footer>
                        <Button onClick={handleToggleVisible}>{localeService.t('rangeSelector.cancel')}</Button>
&nbsp;&nbsp;
                        <Button onClick={handleConform} type="primary">{localeService.t('rangeSelector.confirm')}</Button>
                    </footer>
                )}
                onClose={handleToggleVisible}
            >
                <FormLayout>
                    <Input />
                </FormLayout>
                <FormLayout>
                    <Button onClick={handleToggleVisible}>{localeService.t('rangeSelector.addAnotherRange')}</Button>
                </FormLayout>
            </Dialog>
        </>
    );
}
