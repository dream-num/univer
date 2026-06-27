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

import { FEnum } from '@univerjs/core/facade';
import { EmbedHostEntryEnum } from '@univerjs/embed';

export const FEmbedHostSurface = {
    DocBlock: EmbedHostEntryEnum.DocsCustomBlock,
    SheetTab: EmbedHostEntryEnum.SheetsSheetTab,
    SheetFloating: EmbedHostEntryEnum.SheetsFloatingObject,
    BaseTable: EmbedHostEntryEnum.BasesTableListBlock,
    SlidePage: EmbedHostEntryEnum.SlidesPageListBlock,
    SlideFloating: EmbedHostEntryEnum.SlidesFloatingObject,
    BoardFloating: EmbedHostEntryEnum.BoardsFloatingObject,
} as const;

export type FEmbedHostSurface =
    | typeof FEmbedHostSurface[keyof typeof FEmbedHostSurface]
    | (string & {});

export interface IFEmbedEnumMixin {
    get FEmbedHostSurface(): typeof FEmbedHostSurface;
}

export class FEmbedEnumMixin extends FEnum implements IFEmbedEnumMixin {
    override get FEmbedHostSurface(): typeof FEmbedHostSurface {
        return FEmbedHostSurface;
    }
}

FEnum.extend(FEmbedEnumMixin);

declare module '@univerjs/core/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FEnum extends IFEmbedEnumMixin {}
}
