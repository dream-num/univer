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

import { Address } from './address';
import { Areas } from './areas';
import { Choose } from './choose';
import { Choosecols } from './choosecols';
import { Chooserows } from './chooserows';
import { Column } from './column';
import { Columns } from './columns';
import { Drop } from './drop';
import { Expand } from './expand';
import { Filter } from './filter';
import { Formulatext } from './formulatext';
import { FUNCTION_NAMES_LOOKUP } from './function-names';
import { Hlookup } from './hlookup';
import { Hstack } from './hstack';
import { Index } from './index';
import { Indirect } from './indirect';
import { Lookup } from './lookup';
import { Match } from './match';
import { Offset } from './offset';
import { Row } from './row';
import { Rows } from './rows';
import { Sort } from './sort';
import { Sortby } from './sortby';
import { Take } from './take';
import { Tocol } from './tocol';
import { Torow } from './torow';
import { Transpose } from './transpose';
import { Unique } from './unique';
import { Vlookup } from './vlookup';
import { Vstack } from './vstack';
import { Wrapcols } from './wrapcols';
import { Wraprows } from './wraprows';
import { Xlookup } from './xlookup';
import { Xmatch } from './xmatch';

export const functionLookup = [
    [Address, FUNCTION_NAMES_LOOKUP.ADDRESS],
    [Areas, FUNCTION_NAMES_LOOKUP.AREAS],
    [Choose, FUNCTION_NAMES_LOOKUP.CHOOSE],
    [Choosecols, FUNCTION_NAMES_LOOKUP.CHOOSECOLS],
    [Chooserows, FUNCTION_NAMES_LOOKUP.CHOOSEROWS],
    [Column, FUNCTION_NAMES_LOOKUP.COLUMN],
    [Columns, FUNCTION_NAMES_LOOKUP.COLUMNS],
    [Drop, FUNCTION_NAMES_LOOKUP.DROP],
    [Expand, FUNCTION_NAMES_LOOKUP.EXPAND],
    [Filter, FUNCTION_NAMES_LOOKUP.FILTER],
    [Formulatext, FUNCTION_NAMES_LOOKUP.FORMULATEXT],
    [Hlookup, FUNCTION_NAMES_LOOKUP.HLOOKUP],
    [Hstack, FUNCTION_NAMES_LOOKUP.HSTACK],
    [Index, FUNCTION_NAMES_LOOKUP.INDEX],
    [Indirect, FUNCTION_NAMES_LOOKUP.INDIRECT],
    [Lookup, FUNCTION_NAMES_LOOKUP.LOOKUP],
    [Match, FUNCTION_NAMES_LOOKUP.MATCH],
    [Offset, FUNCTION_NAMES_LOOKUP.OFFSET],
    [Row, FUNCTION_NAMES_LOOKUP.ROW],
    [Rows, FUNCTION_NAMES_LOOKUP.ROWS],
    [Sort, FUNCTION_NAMES_LOOKUP.SORT],
    [Sortby, FUNCTION_NAMES_LOOKUP.SORTBY],
    [Take, FUNCTION_NAMES_LOOKUP.TAKE],
    [Tocol, FUNCTION_NAMES_LOOKUP.TOCOL],
    [Torow, FUNCTION_NAMES_LOOKUP.TOROW],
    [Transpose, FUNCTION_NAMES_LOOKUP.TRANSPOSE],
    [Unique, FUNCTION_NAMES_LOOKUP.UNIQUE],
    [Vlookup, FUNCTION_NAMES_LOOKUP.VLOOKUP],
    [Vstack, FUNCTION_NAMES_LOOKUP.VSTACK],
    [Wrapcols, FUNCTION_NAMES_LOOKUP.WRAPCOLS],
    [Wraprows, FUNCTION_NAMES_LOOKUP.WRAPROWS],
    [Xlookup, FUNCTION_NAMES_LOOKUP.XLOOKUP],
    [Xmatch, FUNCTION_NAMES_LOOKUP.XMATCH],
];
