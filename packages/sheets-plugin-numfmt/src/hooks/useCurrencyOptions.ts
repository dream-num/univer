import { useDependency } from '@wendellhu/redi/react-bindings';
import { useEffect, useState } from 'react';

import { currencySymbols } from '../base/const/CURRENCY-SYMBOLS';
import { UserHabitController } from '../controllers/user-habit.controller';

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
