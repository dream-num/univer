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

import { clsx } from './clsx';

export const scrollbarClassName = 'univer-scrollbar-thin univer-scrollbar-track-gray-50 univer-scrollbar-thumb-gray-300 dark:univer-scrollbar-track-gray-900 dark:univer-scrollbar-thumb-gray-700';

const borderBasicClassName = 'univer-border-gray-200 dark:univer-border-gray-600 univer-border-solid';
export const borderClassName = clsx(borderBasicClassName, 'univer-border');
export const borderLeftBottomClassName = clsx(borderBasicClassName, 'univer-border-l univer-border-b univer-border-0');
export const borderLeftClassName = clsx(borderBasicClassName, 'univer-border-l univer-border-0');
export const borderTopClassName = clsx(borderBasicClassName, 'univer-border-t univer-border-0');
export const borderBottomClassName = clsx(borderBasicClassName, 'univer-border-b univer-border-0');
export const borderRightClassName = clsx(borderBasicClassName, 'univer-border-r univer-border-0');
export const divideYClassName = 'univer-divide-gray-200 dark:univer-divide-gray-600 univer-divide-y univer-divide-x-0 univer-divide-solid';
