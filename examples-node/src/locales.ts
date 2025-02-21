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

import { Tools } from '@univerjs/core';

import sheetsformulaenUS from '@univerjs/sheets-formula/locale/en-US';
import sheetsformulafaIR from '@univerjs/sheets-formula/locale/fa-IR';
import sheetsformulafrFR from '@univerjs/sheets-formula/locale/fr-FR';
import sheetsformularuRU from '@univerjs/sheets-formula/locale/ru-RU';
import sheetsformulaviVN from '@univerjs/sheets-formula/locale/vi-VN';
import sheetsformulazhCN from '@univerjs/sheets-formula/locale/zh-CN';
import sheetsformulazhTW from '@univerjs/sheets-formula/locale/zh-TW';
import sheetssortenUS from '@univerjs/sheets-sort/locale/en-US';
import sheetssortfaIR from '@univerjs/sheets-sort/locale/fa-IR';
import sheetssortfrFR from '@univerjs/sheets-sort/locale/fr-FR';
import sheetssortruRU from '@univerjs/sheets-sort/locale/ru-RU';
import sheetssortviVN from '@univerjs/sheets-sort/locale/vi-VN';
import sheetssortzhCN from '@univerjs/sheets-sort/locale/zh-CN';
import sheetssortzhTW from '@univerjs/sheets-sort/locale/zh-TW';
import sheetsenUS from '@univerjs/sheets/locale/en-US';
import sheetsfaIR from '@univerjs/sheets/locale/fa-IR';
import sheetsfrFR from '@univerjs/sheets/locale/fr-FR';
import sheetsruRU from '@univerjs/sheets/locale/ru-RU';
import sheetsviVN from '@univerjs/sheets/locale/vi-VN';
import sheetszhCN from '@univerjs/sheets/locale/zh-CN';
import sheetszhTW from '@univerjs/sheets/locale/zh-TW';

export const enUS = Tools.deepMerge(
    {},
    sheetsenUS,
    sheetsformulaenUS,
    sheetssortenUS
);
export const frFR = Tools.deepMerge(
    {},
    sheetsfrFR,
    sheetsformulafrFR,
    sheetssortfrFR
);
export const ruRU = Tools.deepMerge(
    {},
    sheetsruRU,
    sheetsformularuRU,
    sheetssortruRU
);
export const zhCN = Tools.deepMerge(
    {},
    sheetszhCN,
    sheetsformulazhCN,
    sheetssortzhCN
);
export const zhTW = Tools.deepMerge(
    {},
    sheetszhTW,
    sheetsformulazhTW,
    sheetssortzhTW
);
export const viVN = Tools.deepMerge(
    {},
    sheetsviVN,
    sheetsformulaviVN,
    sheetssortviVN
);
export const faIR = Tools.deepMerge(
    {},
    sheetsfaIR,
    sheetsformulafaIR,
    sheetssortfaIR
);
