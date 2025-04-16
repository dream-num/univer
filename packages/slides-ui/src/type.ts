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

export interface ISlideRichTextProps {
    /**
     * top offset value of PPT card area(px).
     */
    top: number;
    /**
     * left offset value of PPT card area(px).
     */
    left: number;
    width: number;
    height: number;
    scaleX: number;
    scaleY: number;
    text: string;
    fs: number;
  //... align margin...
};

export enum CursorChange {
    InitialState,
    StartEditor,
    CursorChange,
}

export type PageID = string;
