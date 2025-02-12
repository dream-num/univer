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

import type { IDocumentBody, ITextStyle } from '@univerjs/core';

export interface IStyleRule {
    filter: string | string[] | ((node: HTMLElement) => boolean);
    getStyle(node: HTMLElement): ITextStyle;
}

export interface IAfterProcessRule {
    filter: string | string[] | ((node: HTMLElement) => boolean);
    handler(doc: IDocumentBody, node: HTMLElement): void;
}

export interface IPastePlugin {
    name: string;
    checkPasteType(html: string): boolean;
    stylesRules: IStyleRule[];
    afterProcessRules: IAfterProcessRule[];
}
