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

import type { SlideDataModel } from '@univerjs/slides';
import type { LocaleKey } from '../../locale/types';
import { ICommandService, IUniverInstanceService, LocaleService, UniverInstanceType } from '@univerjs/core';
import { borderClassName, clsx, scrollbarClassName } from '@univerjs/design';
import { IRenderManagerService } from '@univerjs/engine-render';
import { useDependency } from '@univerjs/ui';
import { createRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivateSlidePageOperation } from '../../commands/operations/activate.operation';
import { AppendSlideOperation } from '../../commands/operations/append-slide.operation';
import { SetSlidePageThumbOperation } from '../../commands/operations/set-thumb.operation';

/**
 * This components works as the root component of the left Sidebar of Slide.
 */

export function SlideSideBar() {
    const univerInstanceService = useDependency(IUniverInstanceService);
    const commandService = useDependency(ICommandService);
    const renderManagerService = useDependency(IRenderManagerService);
    const localeService = useDependency(LocaleService);

    const slideBarRef = useRef<HTMLDivElement>(null);
    const currentSlide = univerInstanceService.getCurrentUnitOfType<SlideDataModel>(UniverInstanceType.UNIVER_SLIDE);

    // const currentSlide = useObservable(
    //     () => univerInstanceService.getCurrentTypeOfUnit$<SlideDataModel>(UniverInstanceType.UNIVER_SLIDE),
    //     undefined,
    //     undefined,
    //     []
    // );
    const pages = currentSlide?.getPages();
    const pageOrder = currentSlide?.getPageOrder();
    const slideList = useMemo(() => pages && pageOrder ? pageOrder.map((id) => pages[id]) : [], [pageOrder, pages]);

    const [activatePageId, setActivatePageId] = useState<string | null>(currentSlide?.getActivePage()?.id ?? null);

    const divRefs = useMemo(() => slideList.map(() => createRef<HTMLDivElement>()), [slideList]);

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
            commandService.syncExecuteCommand(SetSlidePageThumbOperation.id, { unitId: currentSlide?.getUnitId() });
        }
    }, [divRefs, slideList, renderManagerService, commandService, currentSlide]); // Depends on changes in divRefs array

    const activatePage = useCallback((page: string) => {
        commandService.syncExecuteCommand(ActivateSlidePageOperation.id, { id: page, unitId: currentSlide?.getUnitId() });
    }, [commandService, currentSlide]);

    const handleAppendSlide = useCallback(() => {
        commandService.syncExecuteCommand(AppendSlideOperation.id, { unitId: currentSlide?.getUnitId() });
    }, [commandService, currentSlide]);

    if (!pages || !pageOrder) {
        return null;
    }

    return (
        <aside
            ref={slideBarRef}
            className={clsx(`
              univer-flex univer-h-full univer-w-64 univer-flex-col univer-overflow-y-auto univer-overflow-x-hidden
            `, scrollbarClassName)}
        >
            <div className="univer-px-4">
                <header className="univer-flex univer-justify-center univer-pt-4">
                    <a
                        className={clsx(`
                          univer-box-border univer-block univer-h-8 univer-w-full univer-cursor-pointer
                          univer-rounded-md univer-bg-white univer-text-center univer-text-sm univer-transition-colors
                        `, borderClassName)}
                        onClick={handleAppendSlide}
                    >
                        {localeService.t<LocaleKey>('slides-ui.append')}
                    </a>
                </header>

                {slideList.map((item, index) => (
                    <div
                        key={item.id}
                        className={clsx('univer-my-4 univer-flex univer-gap-2', {
                            '[&>div]:univer-border-primary-600 [&>span]:univer-text-primary-600': item.id === activatePageId,
                        })}
                        onClick={() => activatePage(item.id)}
                    >
                        <span>{index + 1}</span>
                        <div
                            ref={divRefs[index]}
                            className={clsx(`
                              univer-relative univer-box-border univer-h-32 univer-w-52 univer-bg-white
                              hover:univer-border-primary-600
                            `, borderClassName)}
                        />
                    </div>
                ))}
            </div>
        </aside>
    );
}
