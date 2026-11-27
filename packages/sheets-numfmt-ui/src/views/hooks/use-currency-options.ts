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

import { currencySymbols, getCurrencySymbolByLocale, RegionService } from '@univerjs/core';
import { useDependency, useObservable } from '@univerjs/ui';
import { useEffect, useMemo, useState } from 'react';
import { UserHabitController } from '../../controllers/user-habit.controller';

const key = 'numfmtCurrency';
export const useCurrencyOptions = () => {
    const userHabitController = useDependency(UserHabitController);
    const regionService = useDependency(RegionService);
    const region = useObservable(regionService.currentRegion$, regionService.getCurrentRegion());
    const defaults = useMemo(() => [...new Set([getCurrencySymbolByLocale(region), ...currencySymbols])], [region]);
    const [options, setOptions] = useState(defaults);

    useEffect(() => {
        let active = true;
        userHabitController.addHabit(key, []).then(() => userHabitController.getHabit(key, [...defaults])).then((list) => {
            if (active) {
                setOptions(list as string[]);
            }
        });
        return () => {
            active = false;
        };
    }, [defaults, userHabitController]);

    const mark = (v: string) => {
        userHabitController.markHabit(key, v);
    };

    return { userHabitCurrency: options, mark };
};
