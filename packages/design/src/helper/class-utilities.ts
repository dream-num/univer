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

export const scrollbarClassName = 'univer-scrollbar-thin univer-scrollbar-track-gray-50 univer-scrollbar-thumb-gray-300 dark:!univer-scrollbar-track-gray-900 dark:!univer-scrollbar-thumb-gray-700';

const borderBasicClassName = 'univer-border-gray-200 dark:!univer-border-gray-600 univer-border-solid';
export const borderClassName = clsx(borderBasicClassName, 'univer-border');
export const borderLeftBottomClassName = clsx(borderBasicClassName, 'univer-border-l univer-border-b univer-border-t-0 univer-border-r-0');
export const borderLeftClassName = clsx(borderBasicClassName, 'univer-border-l univer-border-b-0 univer-border-t-0 univer-border-r-0');
export const borderLeftRTLClassName = clsx(borderBasicClassName, 'univer-border-b-0 univer-border-t-0 rtl:univer-border-l-0 rtl:univer-border-r');
export const borderTopClassName = clsx(borderBasicClassName, 'univer-border-l-0 univer-border-b-0 univer-border-t univer-border-r-0');
export const borderBottomClassName = clsx(borderBasicClassName, 'univer-border-l-0 univer-border-b univer-border-t-0 univer-border-r-0');
export const borderRightClassName = clsx(borderBasicClassName, 'univer-border-l-0 univer-border-b-0 univer-border-t-0 univer-border-r');
export const divideYClassName = 'univer-divide-gray-200 dark:!univer-divide-gray-600 univer-divide-y univer-divide-x-0 univer-divide-solid';
export const divideXClassName = 'univer-divide-gray-200 dark:!univer-divide-gray-600 univer-divide-x univer-divide-y-0 univer-divide-solid';
export const resetButtonClassName = 'univer-m-0 univer-flex univer-appearance-none univer-items-center univer-justify-center univer-border-0 univer-bg-transparent univer-p-0 univer-leading-none univer-outline-none univer-cursor-pointer';

export const focusClassName = 'focus:univer-outline focus:univer-outline-2 focus:univer-outline-offset-2 focus:univer-outline-primary-600 dark:focus:!univer-outline-primary-300';

export const inputStateClassName = `
  focus:!univer-border-primary-600 focus:univer-outline-none focus:univer-ring-2 focus:univer-ring-primary-50
  dark:focus:!univer-border-primary-300 dark:focus:!univer-ring-primary-900
  aria-[invalid=true]:!univer-border-red-600 aria-[invalid=true]:focus:!univer-border-red-600 aria-[invalid=true]:focus:univer-ring-red-50
  dark:aria-[invalid=true]:!univer-border-red-400 dark:aria-[invalid=true]:focus:!univer-border-red-400 dark:aria-[invalid=true]:focus:!univer-ring-red-900
`;

export const notificationClassName = `
  [&_[data-sonner-toast]]:!univer-rounded-lg [&_[data-sonner-toast]]:!univer-border-gray-200
  [&_[data-sonner-toast]]:!univer-bg-gray-0 [&_[data-sonner-toast]]:!univer-shadow-md
  dark:[&_[data-sonner-toast]]:!univer-border-gray-600 dark:[&_[data-sonner-toast]]:!univer-bg-gray-700
  [&_[data-title]]:!univer-text-sm [&_[data-title]]:!univer-text-gray-900
  dark:[&_[data-title]]:!univer-text-gray-0
  [&_[data-description]]:!univer-text-sm [&_[data-description]]:!univer-text-gray-600
  dark:[&_[data-description]]:!univer-text-gray-200
`;
