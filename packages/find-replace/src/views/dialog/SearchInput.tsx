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

import type { LocaleService } from '@univerjs/core';
import type { IInputProps } from '@univerjs/design';
import type { IFindReplaceService } from '../../services/find-replace.service';
import { Input, Pager } from '@univerjs/design';
import { useState } from 'react';

export interface ISearchInputProps extends Pick<IInputProps, 'onFocus' | 'onBlur' | 'className' | 'onChange'> {
    findCompleted: boolean;
    localeService: LocaleService;
    findReplaceService: IFindReplaceService;
    matchesPosition: number;
    matchesCount: number;
    initialFindString: string;
}

export function SearchInput(props: ISearchInputProps) {
    const {
        findCompleted: findComplete,
        localeService,
        matchesCount,
        matchesPosition,
        initialFindString,
        findReplaceService,
        onChange,
        ...rest
    } = props;

    const [value, setValue] = useState(initialFindString);
    const noResult = findComplete && matchesCount === 0;
    const text = noResult
        ? localeService.t('find-replace.dialog.no-result')
        : matchesCount === 0
            ? ' '
            : undefined;

    function handleChangePosition(newIndex: number) {
        if (matchesPosition === matchesCount && newIndex === 1) {
            findReplaceService.moveToNextMatch();
        } else if (matchesPosition === 1 && newIndex === matchesCount) {
            findReplaceService.moveToPreviousMatch();
        } else if (newIndex < matchesPosition) {
            findReplaceService.moveToPreviousMatch();
        } else {
            findReplaceService.moveToNextMatch();
        }
    }

    return (
        <div className="univer-relative univer-flex univer-items-center univer-gap-2" onDrag={(e) => e.stopPropagation()}>
            <Input
                data-u-comp="search-input"
                autoFocus
                placeholder={localeService.t('find-replace.dialog.find-placeholder')}
                value={value}
                onChange={(value) => {
                    setValue(value);
                    onChange?.(value);
                }}
                slot={(
                    <Pager
                        loop
                        text={text}
                        value={matchesPosition}
                        total={matchesCount}
                        onChange={handleChangePosition}
                    />
                )}
                {...rest}
            />
        </div>
    );
}
