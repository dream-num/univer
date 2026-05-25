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

import type enUS from './en-US';

import array from './function-list/array/fa-IR';
import compatibility from './function-list/compatibility/fa-IR';
import cube from './function-list/cube/fa-IR';
import database from './function-list/database/fa-IR';
import date from './function-list/date/fa-IR';
import engineering from './function-list/engineering/fa-IR';
import financial from './function-list/financial/fa-IR';
import information from './function-list/information/fa-IR';
import logical from './function-list/logical/fa-IR';
import lookup from './function-list/lookup/fa-IR';
import math from './function-list/math/fa-IR';
import statistical from './function-list/statistical/fa-IR';
import text from './function-list/text/fa-IR';
import univer from './function-list/univer/fa-IR';
import web from './function-list/web/fa-IR';

const locale: typeof enUS = {
    'sheets-formula': {
        functionList: {
            ...array,
            ...compatibility,
            ...cube,
            ...database,
            ...date,
            ...engineering,
            ...financial,
            ...information,
            ...logical,
            ...lookup,
            ...math,
            ...statistical,
            ...text,
            ...univer,
            ...web,
        },
    },
};

export default locale;
