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

import { currencySymbols } from '@univerjs/sheets-numfmt';
import { useDependency } from '@univerjs/ui';
import { useEffect, useState } from 'react';
import { UserHabitController } from '../../controllers/user-habit.controller';

const key = 'numfmtCurrency';
export const useCurrencyOptions = (onOptionChange?: (options: string[]) => void) => {
    const userHabitController = useDependency(UserHabitController);
    const [options, optionsSet] = useState(currencySymbols);

    useEffect(() => {
        userHabitController.addHabit('numfmtCurrency', []).then(() => {
            userHabitController.getHabit(key, [...currencySymbols]).then((list) => {
                optionsSet(list as string[]);
                onOptionChange && onOptionChange(list as string[]);
            });
        });
    }, []);

    const mark = (v: string) => {
        userHabitController.markHabit(key, v);
    };
    return { userHabitCurrency: options, mark };
};
