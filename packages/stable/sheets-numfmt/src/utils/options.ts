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

import { currencySymbols } from '../base/const/currency-symbols';
import { CURRENCYFORMAT, DATEFMTLISG, NUMBERFORMAT } from '../base/const/formatdetail';

export const getCurrencyOptions = () => currencySymbols.map((item) => ({ label: item, value: item }));

export const getCurrencyFormatOptions = (suffix: string) =>
    CURRENCYFORMAT.map((item) => ({
        label: item.label(suffix),
        value: item.suffix(suffix),
        color: item.color,
    }));

export const getDateFormatOptions = () => DATEFMTLISG.map((item) => ({ label: item.label, value: item.suffix }));

export const getNumberFormatOptions = () =>
    NUMBERFORMAT.map((item) => ({ label: item.label, value: item.suffix, color: item.color }));
