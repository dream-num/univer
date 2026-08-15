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

import type { LocaleService } from '@univerjs/core';
import { clsx } from '@univerjs/design';

export interface IWorkbenchSkeletonProps {
    darkMode: boolean;
    direction: ReturnType<LocaleService['getDirection']>;
    overlay?: boolean;
}

export function WorkbenchSkeleton({ darkMode, direction, overlay = false }: IWorkbenchSkeletonProps) {
    const shimmerClassName = `
      univer-animate-pulse univer-bg-gray-100 motion-reduce:univer-animate-none
      dark:!univer-bg-gray-700
    `;
    const shimmerStyle = { animationDuration: '1.2s' };

    return (
        <div
            aria-busy="true"
            className={clsx(`
              univer-flex univer-h-full univer-min-h-0 univer-flex-col univer-overflow-hidden univer-bg-gray-50
              dark:!univer-bg-gray-900
            `, {
                'univer-absolute univer-inset-0 univer-z-50': overlay,
                'univer-dark': darkMode,
            })}
            dir={direction}
        >
            <header
                data-u-comp="workbench-skeleton-toolbar"
                className="
                  univer-flex univer-h-11 univer-shrink-0 univer-items-center univer-gap-2 univer-border-0
                  univer-border-b univer-border-solid univer-border-gray-200 univer-bg-gray-0 univer-px-4
                  dark:!univer-border-gray-700 dark:!univer-bg-gray-800
                "
            >
                <div
                    data-u-comp="workbench-skeleton-shimmer"
                    className={clsx(shimmerClassName, 'univer-h-4 univer-w-24 univer-rounded')}
                    style={shimmerStyle}
                />
                <div
                    data-u-comp="workbench-skeleton-shimmer"
                    className={clsx(shimmerClassName, 'univer-ml-2 univer-size-6 univer-rounded')}
                    style={shimmerStyle}
                />
                <div
                    data-u-comp="workbench-skeleton-shimmer"
                    className={clsx(shimmerClassName, 'univer-size-6 univer-rounded')}
                    style={shimmerStyle}
                />
            </header>

            <main
                data-u-comp="workbench-skeleton-content"
                className="
                  univer-flex univer-min-h-0 univer-min-w-0 univer-flex-1 univer-flex-col univer-gap-4 univer-p-4
                "
            >
                <div
                    data-u-comp="workbench-skeleton-shimmer"
                    className={clsx(shimmerClassName, 'univer-h-4 univer-w-1/3 univer-rounded')}
                    style={shimmerStyle}
                />
                <div
                    data-u-comp="workbench-skeleton-shimmer"
                    className={clsx(shimmerClassName, 'univer-flex-1 univer-rounded-md')}
                    style={shimmerStyle}
                />
            </main>

            <footer
                data-u-comp="workbench-skeleton-footer"
                className="
                  univer-flex univer-h-10 univer-shrink-0 univer-items-center univer-justify-between univer-border-0
                  univer-border-t univer-border-solid univer-border-gray-200 univer-bg-gray-0 univer-px-4
                  dark:!univer-border-gray-700 dark:!univer-bg-gray-800
                "
            >
                <div className="univer-flex univer-items-center univer-gap-2">
                    <div
                        data-u-comp="workbench-skeleton-shimmer"
                        className={clsx(shimmerClassName, 'univer-size-5 univer-rounded')}
                        style={shimmerStyle}
                    />
                    <div
                        data-u-comp="workbench-skeleton-shimmer"
                        className={clsx(shimmerClassName, 'univer-h-5 univer-w-14 univer-rounded')}
                        style={shimmerStyle}
                    />
                </div>
                <div className="univer-flex univer-items-center univer-gap-2">
                    <div
                        data-u-comp="workbench-skeleton-shimmer"
                        className={clsx(shimmerClassName, 'univer-size-5 univer-rounded')}
                        style={shimmerStyle}
                    />
                    <div
                        data-u-comp="workbench-skeleton-shimmer"
                        className={clsx(shimmerClassName, 'univer-h-2 univer-w-24 univer-rounded-full')}
                        style={shimmerStyle}
                    />
                    <div
                        data-u-comp="workbench-skeleton-shimmer"
                        className={clsx(shimmerClassName, 'univer-size-5 univer-rounded')}
                        style={shimmerStyle}
                    />
                </div>
            </footer>
        </div>
    );
}
