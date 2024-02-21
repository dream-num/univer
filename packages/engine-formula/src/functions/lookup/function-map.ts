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

import { Address } from './address';
import { Column } from './column';
import { Columns } from './columns';
import { FUNCTION_NAMES_LOOKUP } from './function-names';
import { Hlookup } from './hlookup';
import { Indirect } from './indirect';
import { Lookup } from './lookup';
import { Match } from './match';
import { Offset } from './offset';
import { Row } from './row';
import { Rows } from './rows';
import { Vlookup } from './vlookup';
import { Xlookup } from './xlookup';
import { Xmatch } from './xmatch';
import { Index } from './index';

export const functionLookup = [
    [Address, FUNCTION_NAMES_LOOKUP.ADDRESS],
    [Column, FUNCTION_NAMES_LOOKUP.COLUMN],
    [Columns, FUNCTION_NAMES_LOOKUP.COLUMNS],
    [Index, FUNCTION_NAMES_LOOKUP.INDEX],
    [Indirect, FUNCTION_NAMES_LOOKUP.INDIRECT],
    [Offset, FUNCTION_NAMES_LOOKUP.OFFSET],
    [Row, FUNCTION_NAMES_LOOKUP.ROW],
    [Rows, FUNCTION_NAMES_LOOKUP.ROWS],
    [Vlookup, FUNCTION_NAMES_LOOKUP.VLOOKUP],
    [Lookup, FUNCTION_NAMES_LOOKUP.LOOKUP],
    [Match, FUNCTION_NAMES_LOOKUP.MATCH],
    [Hlookup, FUNCTION_NAMES_LOOKUP.HLOOKUP],
    [Xlookup, FUNCTION_NAMES_LOOKUP.XLOOKUP],
    [Xmatch, FUNCTION_NAMES_LOOKUP.XMATCH],
];
