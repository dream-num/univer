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

import type { IStyleData } from '@univerjs/core';
import type { TableMetaType } from '../types/type';
import { TableColumnDataTypeEnum } from '../types/enum';

export class TableColumn {
    dataType: TableColumnDataTypeEnum;
    id: string;
    displayName: string;
    formula: string;
    meta: TableMetaType;
    style: IStyleData;
    constructor(id: string, name: string) {
        this.id = id;
        this.displayName = name;
        this.dataType = TableColumnDataTypeEnum.String;
        this.formula = '';
        this.meta = {};
        this.style = {};
    }

    getMeta() {
        return this.meta;
    }

    setMeta(meta: TableMetaType) {
        this.meta = meta;
    }

    getDisplayName() {
        return this.displayName;
    }

    toJSON() {
        return {
            id: this.id,
            displayName: this.displayName,
            dataType: this.dataType,
            formula: this.formula,
            meta: this.meta,
            style: this.style,
        };
    }

    fromJSON(json: any) {
        this.id = json.id;
        this.displayName = json.displayName;
        this.dataType = json.dataType;
        this.formula = json.formula;
        this.meta = json.meta;
        this.style = json.style;
    }
}
