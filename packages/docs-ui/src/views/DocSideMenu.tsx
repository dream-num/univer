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

import type { DocumentDataModel, IParagraph } from '@univerjs/core';
import {
    DocumentFlavor,
    fromEventSubject,
    getParagraphContentStartOffsets,
    getPlainText,
    isInternalEditorID,
    IUniverInstanceService,
    LocaleService,
    NamedStyleType,
    UniverInstanceType,
} from '@univerjs/core';
import {
    Documents,
    getDocsTableRenderViewport,
    getTableIdAndSliceIndex,
    IRenderManagerService,
} from '@univerjs/engine-render';
import { IWorkbenchService, useConfigValue, useDependency, useEvent, useObservable } from '@univerjs/ui';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { auditTime, debounceTime, distinctUntilChanged, map, merge, startWith, throttleTime } from 'rxjs';
import type { IUniverDocsUIConfig } from '../config/config';
import type { LocaleKey } from '../locale/types';
import type { IMutiPageParagraphBound } from '../services/doc-event-manager.service';
import type { ISideMenuItem } from './SideMenu';
import { VIEWPORT_KEY } from '../basics/docs-view-key';
import { DOCS_UI_PLUGIN_CONFIG_KEY } from '../config/config';
import { DocEventManagerService } from '../services/doc-event-manager.service';
import { isDocSideMenuTableOverlapping } from './doc-side-menu-layout';
import { SideMenu } from './SideMenu';

const transformNamedStyleTypeToLevel = (type: NamedStyleType) => {
    switch (type) {
        case NamedStyleType.HEADING_1:
            return 1;
        case NamedStyleType.HEADING_2:
            return 2;
        case NamedStyleType.HEADING_3:
            return 3;
        case NamedStyleType.HEADING_4:
            return 4;
        case NamedStyleType.HEADING_5:
            return 5;
        case NamedStyleType.TITLE:
            return 1;
        default:
            return 1;
    }
};

function findActiveHeading(boundMap: Map<number, IMutiPageParagraphBound> | undefined, paragraphMap: Map<number, IParagraph>, scrollTop: number, bottom: number) {
    if (!boundMap) {
        return undefined;
    }
    const paragraphBounds = Array.from(boundMap.values());
    const paragraphIndex = paragraphBounds.findIndex((p) => p.paragraphStart !== p.paragraphEnd && p.rect.top < bottom && p.rect.bottom > scrollTop);
    if (paragraphIndex === -1) return undefined;
    const lastParagraphIndex = paragraphBounds?.findLastIndex((p) => p.paragraphStart !== p.paragraphEnd && p.rect.top < bottom && p.rect.bottom > scrollTop);
    for (let i = paragraphIndex; i <= lastParagraphIndex; i++) {
        const bound = paragraphBounds[i];
        const paragraph = paragraphMap.get(bound.startIndex);
        if (paragraph?.paragraphStyle?.headingId) {
            return paragraph.paragraphStyle.headingId;
        }
    }

    for (let i = paragraphIndex; i >= 0; i--) {
        const bound = paragraphBounds[i];
        const paragraph = paragraphMap.get(bound.startIndex);
        if (paragraph?.paragraphStyle?.headingId) {
            return paragraph.paragraphStyle.headingId;
        }
    }

    return undefined;
}

const TITLE_ID = '__title';

export function DocSideMenu() {
    const config = useConfigValue<IUniverDocsUIConfig>(DOCS_UI_PLUGIN_CONFIG_KEY);
    const workbenchService = useDependency(IWorkbenchService);
    const rootUnitType = useObservable(workbenchService.rootUnitType$, null, true);

    if (rootUnitType === UniverInstanceType.UNIVER_DOC && config?.toc !== false) {
        return <DocSideMenuContent toc={config?.toc} />;
    }

    return null;
}

function DocSideMenuContent({ toc }: { toc?: boolean }) {
    const instanceService = useDependency(IUniverInstanceService);
    const localeService = useDependency(LocaleService);
    const currentDoc = useObservable(
        () => instanceService.getCurrentTypeOfUnit$<DocumentDataModel>(UniverInstanceType.UNIVER_DOC),
        undefined,
        false,
        [instanceService]
    );
    const enabled = toc ?? (currentDoc?.getSnapshot().documentStyle?.documentFlavor === DocumentFlavor.MODERN);
    const renderManagerService = useDependency(IRenderManagerService);
    const documentData = useObservable(
        currentDoc
            ? () => currentDoc.change$.pipe(
                debounceTime(100),
                map(() => currentDoc.getSnapshot())
            )
            : null,
        currentDoc?.getSnapshot(),
        false,
        [currentDoc]
    );
    const fullDataStream = documentData?.body?.dataStream ?? '';
    const [activeId, setActiveId] = useState<string | undefined>(undefined);
    const [outlineHeight, setOutlineHeight] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const unitId = currentDoc?.getUnitId() ?? '';
    const renderer = renderManagerService.getRenderUnitById(unitId);
    const title = documentData?.title;
    const docEventManagerService = renderer?.with(DocEventManagerService);
    const viewport = renderer?.scene.getViewport(VIEWPORT_KEY.VIEW_MAIN);
    const readLayout = () => {
        const scaleX = renderer?.scene.scaleX ?? 1;
        const scaleY = renderer?.scene.scaleY ?? 1;
        const scrollX = viewport?.viewportScrollX ?? 0;
        const scrollY = viewport?.viewportScrollY ?? 0;
        const canvasHeight = renderer?.engine.height ?? 0;
        const left = ((renderer?.mainComponent?.left ?? 0) - scrollX) * scaleX;
        const outlineRect = {
            left: scrollX + 16 / scaleX,
            right: scrollX + 272 / scaleX,
            top: scrollY + 16 / scaleY,
            bottom: scrollY + Math.min(canvasHeight - 16, 16 + outlineHeight) / scaleY,
        };
        const overlapsTable = left >= 288 && outlineHeight > 0 && Array.from(docEventManagerService?.tableBounds.values() ?? []).some(({ tableId, rect }) =>
            isDocSideMenuTableOverlapping(
                outlineRect,
                rect,
                getDocsTableRenderViewport(unitId, getTableIdAndSliceIndex(tableId).tableId)
            )
        );

        return { left, canvasHeight, canvasWidth: renderer?.engine.width ?? 0, scaleY, overlapsTable };
    };
    const layout = useObservable(
        renderer?.engine.onTransformChange$
            ? () => merge(
                fromEventSubject(renderer.engine.onTransformChange$),
                fromEventSubject(renderer.scene.onTransformChange$),
                ...(renderer.mainComponent instanceof Documents ? [renderer.mainComponent.pageRender$] : []),
                ...(viewport ? [fromEventSubject(viewport.onScrollAfter$)] : []),
                ...(renderer.mainComponent ? [fromEventSubject(renderer.mainComponent.onTransformChange$)] : [])
            ).pipe(
                auditTime(33),
                map(readLayout),
                startWith(readLayout()),
                distinctUntilChanged((previous, current) => previous.left === current.left &&
                    previous.canvasHeight === current.canvasHeight && previous.canvasWidth === current.canvasWidth &&
                    previous.scaleY === current.scaleY && previous.overlapsTable === current.overlapsTable)
            )
            : null,
        readLayout(),
        false,
        [renderer, viewport, outlineHeight]
    );
    const { left, canvasHeight, canvasWidth, scaleY } = layout;

    const paragraphs = useMemo(() => documentData?.body?.paragraphs ?? [], [documentData?.body?.paragraphs]);
    const paragraphStarts = useMemo(() => getParagraphContentStartOffsets({ dataStream: fullDataStream, paragraphs }), [fullDataStream, paragraphs]);
    const paragraphMap = useMemo(() => {
        const map = new Map<number, IParagraph>();
        paragraphs.forEach((p) => {
            map.set(p.startIndex, p);
        });
        return map;
    }, [paragraphs]);
    const mode = left < 288 || layout.overlapsTable ? 'float' : 'side-bar';
    const paragraphMenus = paragraphs
        ?.filter((p) =>
            p.paragraphStyle?.namedStyleType !== undefined &&
            p.paragraphStyle!.namedStyleType !== NamedStyleType.SUBTITLE &&
            p.paragraphStyle.namedStyleType !== NamedStyleType.NORMAL_TEXT
        )
        .map((p) => {
            const level = transformNamedStyleTypeToLevel(p.paragraphStyle!.namedStyleType!);
            return {
                id: p.paragraphStyle!.headingId!,
                text: getPlainText(fullDataStream.slice(paragraphStarts.get(p.startIndex)!, p.startIndex)),
                level,
                isTitle: p.paragraphStyle?.namedStyleType === NamedStyleType.TITLE,
            };
        })
        .filter((item) => item?.text) as ISideMenuItem[];

    const handleScroll = useEvent((params) => {
        const scrollTop = params.viewportScrollY;
        const bottom = scrollTop + (canvasHeight / scaleY);
        const activeId = findActiveHeading(docEventManagerService?.paragraphBounds, paragraphMap, scrollTop, bottom);
        if (activeId) {
            setActiveId(activeId);
        }
    });

    const menus = paragraphMenus?.find((p) => p.isTitle)
        ? paragraphMenus
        : [
            ...(title
                ? [{
                    id: TITLE_ID,
                    text: title,
                    level: 1,
                    isTitle: true,
                }]
                : []),
            ...(paragraphMenus ?? []),
        ].filter(Boolean) as ISideMenuItem[];

    const outlineTitle = menus.find((menu) => menu.isTitle)?.text;
    useLayoutEffect(() => {
        setOutlineHeight(0);
    }, [unitId, menus.length, outlineTitle]);

    useLayoutEffect(() => {
        const container = containerRef.current;
        const menu = container?.firstElementChild;
        if (!container || !menu) {
            return;
        }

        const measureOutline = () => {
            const height = container.querySelector('nav')?.getBoundingClientRect().height;
            // Retain the expanded height so scrolling can reopen a collapsed outline safely.
            if (height) {
                setOutlineHeight(height);
            }
        };
        const observer = new ResizeObserver(measureOutline);
        observer.observe(menu);
        return () => observer.disconnect();
    }, [mode, unitId, menus.length, enabled]);

    useEffect(() => {
        const viewport = renderer?.scene.getViewport(VIEWPORT_KEY.VIEW_MAIN);
        if (!viewport) {
            return;
        }

        const sub = fromEventSubject(viewport.onScrollAfter$).pipe(throttleTime(33)).subscribe(handleScroll);

        return () => {
            sub.unsubscribe();
        };
    }, [handleScroll, renderer]);

    const handleClick = useEvent((menu: ISideMenuItem) => {
        const viewport = renderer?.scene.getViewport(VIEWPORT_KEY.VIEW_MAIN);
        if (!viewport) {
            return;
        }

        if (menu.id === TITLE_ID) {
            viewport.scrollToViewportPos({ viewportScrollY: 0 });
            setActiveId(menu.id);
            return;
        }
        const paragraph = paragraphs.find((p) => p.paragraphStyle?.headingId === menu.id);
        if (!paragraph) {
            return;
        }
        const bound = docEventManagerService?.paragraphBounds.get(paragraph.startIndex);
        if (!bound) {
            return;
        }

        viewport.scrollToViewportPos({ viewportScrollY: bound.rect.top });
        setActiveId(menu.id);
    });

    if (!enabled || !currentDoc || isInternalEditorID(unitId) || !menus?.length) {
        return null;
    }

    return (
        <div
            ref={containerRef}
            className="univer-absolute univer-bottom-0 univer-left-0 univer-top-0 univer-z-[100] univer-w-[0px]"
        >
            <SideMenu
                key={mode}
                label={localeService.t<LocaleKey>('docs-ui.outline.title')}
                menus={menus}
                mode={mode}
                maxWidth={Math.max(0, Math.floor(mode === 'float' ? canvasWidth : left) - 24)}
                wrapperClass="univer-mt-4"
                activeId={activeId}
                onClick={handleClick}
                maxHeight={Math.max(0, canvasHeight - 32)}
            />
        </div>
    );
}
