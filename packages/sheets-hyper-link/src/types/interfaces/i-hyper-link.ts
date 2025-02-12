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

export interface ICellLinkContent {
    /**
     * #gid=sheet1&range=A1
     * sub sheet: #gid=sheet1
     * namedRange: #rangeid=123
     * http: https://baidu.com
     * file: file://a.xlsx
     */
    payload: string;
    /**
     * only for notify, if you wan't to read the display of text, use cell-value of cell-matrix instead
     */
    display?: string;
}

export interface ISheetHyperLink extends ICellLinkContent {
    /**
     * unique id
     */
    id: string;
    /**
     * row of link
     */
    row: number;
    /**
     * col of link
     */
    column: number;
}
