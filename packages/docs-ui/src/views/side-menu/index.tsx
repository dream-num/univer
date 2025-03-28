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

import type { DocumentDataModel } from '@univerjs/core';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import type { IParagraphBound } from '../../services/doc-event-manager.service';
import { debounce, fromEventSubject, getPlainText, ICommandService, isInternalEditorID, IUniverInstanceService, NamedStyleType, UniverInstanceType } from '@univerjs/core';
import { SideMenu } from '@univerjs/design';
import { RichTextEditingMutation } from '@univerjs/docs';
import { IRenderManagerService } from '@univerjs/engine-render';
import { useDependency, useObservable } from '@univerjs/ui';
import { useEffect, useMemo, useState } from 'react';
import { of } from 'rxjs';
import { VIEWPORT_KEY } from '../../basics/docs-view-key';
import { DocEventManagerService } from '../../services/doc-event-manager.service';

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
        case NamedStyleType.HEADING_6:
            return 6;
        case NamedStyleType.TITLE:
            return 1;
        default:
            return 1;
    }
};

function findActiveHeading(paragraphBounds: IParagraphBound[], scrollTop: number, bottom: number) {
    const paragraphIndex = paragraphBounds?.findIndex((p) => p.paragraph.paragraphStart !== p.paragraph.paragraphEnd && p.rect.top < bottom && p.rect.bottom > scrollTop);
    if (paragraphIndex === -1) return undefined;
    for (let i = paragraphIndex; i >= 0; i--) {
        const paragraph = paragraphBounds?.[i];
        if (paragraph.paragraph.paragraphStyle?.headingId) {
            return paragraph.paragraph.paragraphStyle.headingId;
        }
    }

    return undefined;
}

export function DocSideMenu() {
    const commandService = useDependency(ICommandService);
    const instanceService = useDependency(IUniverInstanceService);
    const currentDoc = useObservable(useMemo(() => instanceService.getCurrentTypeOfUnit$<DocumentDataModel>(UniverInstanceType.UNIVER_DOC), []));
    const renderManagerService = useDependency(IRenderManagerService);
    const fullDataStream = currentDoc?.getBody()?.dataStream ?? '';
    const [_updateKey, setUpdateKey] = useState(0);
    const unitId = currentDoc?.getUnitId() ?? '';
    const renderer = renderManagerService.getRenderById(unitId);
    const docEventManagerService = renderer?.with(DocEventManagerService);
    const paragraphBounds = docEventManagerService?.paragraphBounds;
    const left = renderer?.mainComponent?.left ?? 0;
    const [scrollTop, setScrollTop] = useState(0);
    const canvasHeight = renderer?.engine.height ?? 0;
    const scaleY = renderer?.scene.scaleY ?? 1;
    const bottom = scrollTop + (canvasHeight / scaleY);
    useObservable(useMemo(() => (renderer?.engine.onTransformChange$ ? fromEventSubject(renderer?.engine.onTransformChange$) : of(null)), [renderer?.engine.onTransformChange$]));
    const mode = left < 180 ? 'float' : 'side-bar';
    let minLevel = Infinity;
    const menus = paragraphBounds?.filter(({ paragraph: p }) => p.paragraphStyle?.namedStyleType !== undefined && p.paragraphStyle!.namedStyleType !== NamedStyleType.SUBTITLE).map(({ paragraph: p }) => {
        const level = transformNamedStyleTypeToLevel(p.paragraphStyle!.namedStyleType!);
        minLevel = Math.min(minLevel, level);

        return {
            id: p.paragraphStyle!.headingId!,
            text: getPlainText(fullDataStream.slice(p.paragraphStart, p.paragraphEnd)),
            level,
            isTitle: p.paragraphStyle?.namedStyleType === NamedStyleType.TITLE,
        };
    });

    const [open, setOpen] = useState(false);
    const activeId = findActiveHeading(paragraphBounds ?? [], scrollTop, bottom);

    useEffect(() => {
        const debounceUpdater = debounce(setUpdateKey, 100);

        const sub = commandService.onCommandExecuted((commandInfo) => {
            if (commandInfo.id === RichTextEditingMutation.id) {
                const params = commandInfo.params as IRichTextEditingMutationParams;
                if (params.unitId === currentDoc?.getUnitId()) {
                    debounceUpdater((prev) => prev + 1);
                }
            }
        });
        return () => {
            sub.dispose();
        };
    }, [commandService, currentDoc]);
    useEffect(() => {
        const viewport = renderer?.scene.getViewport(VIEWPORT_KEY.VIEW_MAIN);
        if (!viewport) {
            return;
        }

        const sub = fromEventSubject(viewport.onScrollAfter$).subscribe((params) => {
            setScrollTop(params.viewportScrollY);
        });
        return () => {
            sub.unsubscribe();
        };
    }, [renderer]);

    if (!currentDoc || isInternalEditorID(unitId) || !menus?.length) {
        return null;
    }

    return (
        <div className="univer-absolute univer-bottom-0 univer-left-0 univer-top-0 univer-z-[100] univer-w-[0px]">
            <SideMenu
                menus={menus}
                open={open}
                onOpenChange={setOpen}
                mode={mode}
                maxWidth={mode === 'float' ? undefined : Math.floor(left)}
                wrapperClass="univer-mt-12"
                activeId={activeId}
            />
        </div>
    );
}
