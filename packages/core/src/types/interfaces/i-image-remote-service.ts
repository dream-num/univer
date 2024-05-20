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

import { createIdentifier } from '@wendellhu/redi';
import type { Observable } from 'rxjs';
import type { Nullable } from '../../shared';

export enum ImageSourceType {
    URL = 'URL',
    UUID = 'UUID',
    BASE64 = 'BASE64',
}

export interface IImageRemoteServiceParam {
    imageId: string;
    imageSourceType: ImageSourceType;
    source: string;
}

export interface IImageRemoteService {
    change$: Observable<number>;
    setWaitCount(count: number): void;
    getWaitCount(): number;
    decreaseWaiting(): void;

    getImage(imageId: string): Promise<string>;

    saveImage(imageFile: File): Promise<Nullable<IImageRemoteServiceParam>>;

    applyFilter(imageId: string): Promise<string>;

    applyAI(imageId: string, operatorType: string): Promise<string>;
}

export const IImageRemoteService = createIdentifier<IImageRemoteService>('univer.plugin.image-remote.service');
