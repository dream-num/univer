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

import type { SlideDataModel } from '@univerjs/core';
import { ICommandService, IUniverInstanceService, LocaleService, UniverInstanceType } from '@univerjs/core';
import { borderClassName, clsx, scrollbarClassName } from '@univerjs/design';
import { IRenderManagerService } from '@univerjs/engine-render';
import { IncreaseSingle } from '@univerjs/icons';
import { ActivateSlidePageOperation, AppendSlideOperation, SetSlidePageThumbOperation } from '@univerjs/slides-ui';
import { useDependency, useObservable } from '@univerjs/ui';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/**
 * This components works as the root component of the left Sidebar of Slide.
 */

export function UniSlideSideBar() {
    const univerInstanceService = useDependency(IUniverInstanceService);
    const commandService = useDependency(ICommandService);
    const renderManagerService = useDependency(IRenderManagerService);
    const localeService = useDependency(LocaleService);

    const slideBarRef = useRef<HTMLDivElement>(null);
    const currentSlide = useObservable(
        () => univerInstanceService.getCurrentTypeOfUnit$<SlideDataModel>(UniverInstanceType.UNIVER_SLIDE),
        undefined,
        undefined,
        []
    );
    const pages = currentSlide?.getPages();
    const pageOrder = currentSlide?.getPageOrder();

    if (!pages || !pageOrder) {
        return null;
    }

    const slideList = pageOrder.map((id) => pages[id]);

    const [activatePageId, setActivatePageId] = useState<string | null>(pageOrder[0]);
    const [barHeight, setBarHeight] = useState(0);

    const divRefs = useMemo(() => slideList.map(() => React.createRef<HTMLDivElement>()), [slideList]);

    useEffect(() => {
        const subscriber = currentSlide?.activePage$.subscribe((page) => {
            const id = page?.id ?? null;

            id && setActivatePageId(id);
        });

        return () => {
            subscriber?.unsubscribe();
        };
    }, []);

    useEffect(() => {
        divRefs.forEach((ref, index) => {
            if (ref.current) {
                const slide = slideList[index];
                renderManagerService.getRenderById(slide.id)?.engine.setContainer(ref.current);
            }
        });

        if (divRefs.length > 0) {
            commandService.syncExecuteCommand(SetSlidePageThumbOperation.id, {
                unitId: currentSlide?.getUnitId(),
            });
        }
    }, [divRefs, commandService, renderManagerService, slideList, currentSlide]); // 依赖于divRefs数组的变化

    useEffect(() => {
        const slideBar = slideBarRef.current;
        if (slideBar) {
            setBarHeight(slideBar.clientHeight - 38);
        }
    }, []);

    const activatePage = useCallback((page: string) => {
        commandService.syncExecuteCommand(ActivateSlidePageOperation.id, { id: page, unitId: currentSlide?.getUnitId() });
    }, [commandService, currentSlide]);

    const handleAppendSlide = useCallback(() => {
        commandService.syncExecuteCommand(AppendSlideOperation.id, { unitId: currentSlide?.getUnitId() });
    }, [commandService, currentSlide]);

    return (
        <div className="univer-flex univer-h-full univer-select-none univer-flex-col" ref={slideBarRef}>
            <div
                className={clsx('univer-overflow-y-auto', scrollbarClassName)}
                style={{ height: `${barHeight}px` }}
            >
                {slideList.map((item, index) => (
                    <div
                        key={item.id}
                        className={clsx(`
                          univer-relative univer-my-4 univer-box-border univer-flex univer-w-[160px]
                          univer-overflow-hidden univer-rounded-lg
                          hover:univer-border-primary-600
                        `, borderClassName, item.id === activatePageId && 'univer-border-primary-600')}
                        onClick={() => activatePage(item.id)}
                    >
                        <span
                            className={`
                              univer-absolute univer-bottom-1 univer-left-1 univer-z-10 univer-inline-flex univer-size-5
                              univer-items-center univer-justify-center univer-overflow-hidden univer-rounded
                              univer-text-xs univer-text-white
                            `}
                        >
                            {index + 1}
                        </span>
                        <div ref={divRefs[index]} className="univer-relative univer-h-[90px] univer-w-[160px]" />
                    </div>
                ))}
            </div>
            <button
                type="button"
                className={`
                  univer-relative univer-mt-4 univer-flex univer-h-8 univer-cursor-pointer univer-items-center
                  univer-justify-center univer-rounded-lg univer-border-0 univer-bg-transparent univer-px-1
                  univer-text-primary-500
                  before:absolute before:left-0 before:top-0 before:h-px before:content-[''] before:univer-bg-gray-200
                  hover:univer-bg-gray-100
                `}
                onClick={handleAppendSlide}
            >
                <IncreaseSingle className="univer-mr-1 univer-size-4" />
                <span>{localeService.t('slide.append')}</span>
            </button>
        </div>
    );
}
