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

import type { LocaleService } from '@univerjs/core';
import type { IInputWithSlotProps } from '@univerjs/design';
import { InputWithSlot, Pager } from '@univerjs/design';
import React from 'react';
import type { IFindReplaceService } from '../../services/find-replace.service';

export interface ISearchInputProps extends Pick<IInputWithSlotProps, 'onFocus' | 'onBlur' | 'className' | 'onChange'> {
    findCompleted: boolean;
    localeService: LocaleService;
    findReplaceService: IFindReplaceService;
    matchesPosition: number;
    matchesCount: number;
    findString: string;
}

export function SearchInput(props: ISearchInputProps) {
    const { findCompleted: findComplete, localeService, matchesCount, matchesPosition, findString, findReplaceService, onChange, ...rest } = props;
    const noResult = findComplete && matchesCount === 0;
    const text = noResult
        ? localeService.t('find-replace.dialog.no-result')
        : matchesCount === 0
            ? ' '
            : undefined;

    return (
        <InputWithSlot
            autoFocus={true}
            placeholder={localeService.t('find-replace.dialog.find-placeholder')}
            slot={(
                <Pager
                    loop={true}
                    text={text}
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
            onChange={(value) => onChange?.(value)}
            {...rest}
        />
    );
}
