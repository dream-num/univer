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

export enum CellType {
    UNDEFINED = 0,
    TEXT = 1,
    URL = 2,
    IMAGE = 3,
    UNRECOGNIZED = -1,
}

export interface IInitialSheet {
    sheetName: string;
    columnName: string[];
    rows: IRow[];
    /** If true, do not apply filter plugin */
    disableFilter?: boolean | undefined;
}

export interface IRowCell {
    type: CellType;
    text: string;
    url: string;
    /** Optional style information */
    style?: IStyle | undefined;
}

interface IStyle {
    /** Background color */
    bg: string;
    /** Text color */
    cl: string;
}

export interface IRow {
    cells: IRowCell[];
}
