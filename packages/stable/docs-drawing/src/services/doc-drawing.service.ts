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

import type { IDocDrawingBase } from '@univerjs/core';
import type { IDocFloatDomData, IImageData, IUnitDrawingService } from '@univerjs/drawing';
import { createIdentifier } from '@univerjs/core';
import { UnitDrawingService } from '@univerjs/drawing';

export interface IDocImage extends IImageData, IDocDrawingBase { }

/**
 * test type
 */
export interface IDocShape extends IDocDrawingBase { }

export interface IDocFloatDom extends IDocFloatDomData, IDocDrawingBase {}

export type IDocDrawing = IDocImage | IDocFloatDom | IDocShape;

type OptionalField<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type IDocUpdateDrawing = OptionalField<IDocDrawing, 'drawingType' | 'layoutType' | 'docTransform' | 'description' | 'title'>;

export class DocDrawingService extends UnitDrawingService<IDocDrawing> { }

export interface IDocDrawingService extends IUnitDrawingService<IDocDrawing> { }

export const IDocDrawingService = createIdentifier<IDocDrawingService>('univer.doc.plugin.doc-drawing.service');
