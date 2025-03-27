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

import type { IDocumentSkeletonGlyph, IDocumentSkeletonLine } from '../../basics/i-document-skeleton-cached';
import type { IBoundRectNoAngle } from '../../basics/vector2';
import { ComponentExtension } from '../extension';

export enum DOCS_EXTENSION_TYPE {
    SPAN,
    LINE,
}

export class docExtension extends ComponentExtension<
    IDocumentSkeletonGlyph | IDocumentSkeletonLine,
    DOCS_EXTENSION_TYPE,
    IBoundRectNoAngle
> {
    override type = DOCS_EXTENSION_TYPE.SPAN;

    override translateX = 0;

    override translateY = 0;
}
