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
import type { IUniverDocsUIConfig } from '../config/config';
import type { IMutiPageParagraphBound } from '../services/doc-event-manager.service';
import type { ISideMenuItem } from './SideMenu';
import {
    fromEventSubject,
    getPlainText,
    isInternalEditorID,
    IUniverInstanceService,
    NamedStyleType,
    UniverInstanceType,
} from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { IWorkbenchService, useConfigValue, useDependency, useEvent, useObservable } from '@univerjs/ui';
import { useEffect, useMemo, useState } from 'react';
import { debounceTime, map, startWith, throttleTime } from 'rxjs';
import { VIEWPORT_KEY } from '../basics/docs-view-key';
import { DOCS_UI_PLUGIN_CONFIG_KEY } from '../config/config';
import { DocEventManagerService } from '../services/doc-event-manager.service';
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

    if (rootUnitType === UniverInstanceType.UNIVER_DOC && config?.toc) {
        return <DocSideMenuContent />;
    }

    return null;
}

function DocSideMenuContent() {
    const instanceService = useDependency(IUniverInstanceService);
    const currentDoc = useObservable(
        () => instanceService.getCurrentTypeOfUnit$<DocumentDataModel>(UniverInstanceType.UNIVER_DOC),
        undefined,
        false,
        [instanceService]
    );
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
    const unitId = currentDoc?.getUnitId() ?? '';
    const renderer = renderManagerService.getRenderUnitById(unitId);
    const title = documentData?.title;
    const docEventManagerService = renderer?.with(DocEventManagerService);
    const paragraphBounds = docEventManagerService?.paragraphBounds;
    const readLayout = () => ({
        left: renderer?.mainComponent?.left ?? 0,
        canvasHeight: renderer?.engine.height ?? 0,
        scaleY: renderer?.scene.scaleY ?? 1,
    });
    const layout = useObservable(
        renderer?.engine.onTransformChange$
            ? () => fromEventSubject(renderer.engine.onTransformChange$).pipe(
                throttleTime(33),
                map(readLayout),
                startWith(readLayout())
            )
            : null,
        readLayout(),
        false,
        [renderer]
    );
    const { left, canvasHeight, scaleY } = layout;

    const paragraphs = useMemo(() => documentData?.body?.paragraphs ?? [], [documentData?.body?.paragraphs]);
    const paragraphMap = useMemo(() => {
        const map = new Map<number, IParagraph>();
        paragraphs.forEach((p) => {
            map.set(p.startIndex, p);
        });
        return map;
    }, [paragraphs]);
    const mode = left < 180 ? 'float' : 'side-bar';
    const paragraphMenus = paragraphs
        ?.filter((p) =>
            p.paragraphStyle?.namedStyleType !== undefined &&
            p.paragraphStyle!.namedStyleType !== NamedStyleType.SUBTITLE &&
            p.paragraphStyle.namedStyleType !== NamedStyleType.NORMAL_TEXT
        )
        .map((p) => {
            const level = transformNamedStyleTypeToLevel(p.paragraphStyle!.namedStyleType!);
            const bound = paragraphBounds?.get(p.startIndex);
            if (!bound) return null;
            const { paragraphStart, paragraphEnd } = bound;

            return {
                id: p.paragraphStyle!.headingId!,
                text: getPlainText(fullDataStream.slice(paragraphStart, paragraphEnd)),
                level,
                isTitle: p.paragraphStyle?.namedStyleType === NamedStyleType.TITLE,
            };
        })
        .filter((item) => item?.text) as ISideMenuItem[];

    const handleScroll = useEvent((params) => {
        const scrollTop = params.viewportScrollY;
        const bottom = scrollTop + (canvasHeight / scaleY);
        const activeId = findActiveHeading(paragraphBounds, paragraphMap, scrollTop, bottom);
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

    const [open, setOpen] = useState(true);

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
            return;
        }
        const paragraph = paragraphs.find((p) => p.paragraphStyle?.headingId === menu.id);
        if (!paragraph) {
            return;
        }
        const bound = paragraphBounds?.get(paragraph.startIndex);
        if (!bound) {
            return;
        }

        viewport.scrollToViewportPos({ viewportScrollY: bound.rect.top });
        setActiveId(menu.id);
    });

    if (!currentDoc || isInternalEditorID(unitId) || !menus?.length) {
        return null;
    }

    return (
        <div
            className="univer-absolute univer-bottom-0 univer-left-0 univer-top-0 univer-z-[100] univer-w-[0px]"
        >
            <SideMenu
                menus={menus}
                open={open}
                onOpenChange={setOpen}
                mode={mode}
                maxWidth={mode === 'float' ? undefined : Math.floor(left) - 10}
                wrapperClass="univer-mt-12"
                activeId={activeId}
                onClick={handleClick}
                maxHeight={canvasHeight - 48}
            />
        </div>
    );
}
