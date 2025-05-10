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

import type { IBusinessComponentProps } from './interface';
import { ILocalStorageService, LocaleService } from '@univerjs/core';
import { borderClassName, clsx, Input } from '@univerjs/design';
import { CheckMarkSingle } from '@univerjs/icons';
import { CURRENCYFORMAT, DATEFMTLISG, NUMBERFORMAT } from '@univerjs/sheets-numfmt';
import { useDependency } from '@univerjs/ui';
import React, { useEffect, useState } from 'react';
import { UserHabitController } from '../../controllers/user-habit.controller';

const key = 'customFormat';
const historyPatternKey = 'numfmt_custom_pattern';

export function CustomFormat(props: IBusinessComponentProps) {
    const { defaultPattern, action, onChange } = props;
    const userHabitController = useDependency(UserHabitController);
    const localStorageService = useDependency(ILocalStorageService);
    const localeService = useDependency(LocaleService);

    const [pattern, patternSet] = useState(defaultPattern);
    action.current = () => {
        userHabitController.markHabit(key, pattern);
        localStorageService.getItem<string[]>(historyPatternKey).then((list = []) => {
            const _list = [...new Set([pattern, ...(list || [])])].splice(0, 10).filter((e) => !!e);
            localStorageService.setItem(historyPatternKey, _list);
        });
        return pattern;
    };
    const [options, optionsSet] = useState<(string | number)[]>([]);

    useEffect(() => {
        localStorageService.getItem<string[]>(historyPatternKey).then((historyList) => {
            const list = [
                ...CURRENCYFORMAT.map((item) => item.suffix('$')),
                ...DATEFMTLISG.map((item) => item.suffix),
                ...NUMBERFORMAT.map((item) => item.suffix),
            ];
            list.push(...(historyList || []));
            userHabitController.addHabit(key, []).finally(() => {
                userHabitController.getHabit(key, list).then((list) => {
                    optionsSet([...new Set(list)]);
                });
            });
        });
    }, []);

    const handleClick = (p: string) => {
        patternSet(p);
        onChange(p);
    };

    const handleBlur = () => {
        onChange(pattern);
    };

    return (
        <div>
            <div className="univer-mt-4 univer-text-sm univer-text-gray-400">{localeService.t('sheet.numfmt.customFormat')}</div>
            <Input
                placeholder={localeService.t('sheet.numfmt.customFormat')}
                onBlur={handleBlur}
                value={pattern}
                onChange={patternSet}
                className="univer-mt-2 univer-w-full"
            />
            <div
                className={clsx('univer-mt-2 univer-max-h-[400px] univer-overflow-auto univer-rounded-lg univer-p-2', borderClassName)}
            >
                {options.map((p) => (
                    <div
                        key={p}
                        onClick={() => handleClick(p as string)}
                        className={`
                          univer-flex univer-cursor-pointer univer-items-center univer-gap-1.5 univer-py-1.5
                          univer-text-sm
                        `}
                    >
                        <div className="univer-flex univer-w-4 univer-items-center univer-text-primary-600">
                            {pattern === p && <CheckMarkSingle />}
                        </div>
                        <div>
                            {p}
                        </div>
                    </div>
                ))}
            </div>
            <div
                className={`
                  univer-mt-3 univer-text-sm univer-text-gray-600
                  dark:univer-text-gray-200
                `}
            >
                {localeService.t('sheet.numfmt.customFormatDes')}
            </div>
        </div>
    );
}
