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
import { BuildTextUtils, getPlainText, ICommandService, IUniverInstanceService, NamedStyleType, UniverInstanceType } from '@univerjs/core';
import { SideMenu } from '@univerjs/design';
import { RichTextEditingMutation } from '@univerjs/docs';
import { useDependency, useObservable } from '@univerjs/ui';
import { useEffect, useMemo, useState } from 'react';

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

export function DocSideMenu() {
    const commandService = useDependency(ICommandService);
    const instanceService = useDependency(IUniverInstanceService);
    const currentDoc = useObservable(useMemo(() => instanceService.getCurrentTypeOfUnit$<DocumentDataModel>(UniverInstanceType.UNIVER_DOC), []));
    const paragraphs = currentDoc?.getBody()?.paragraphs;
    const fullDataStream = currentDoc?.getBody()?.dataStream ?? '';
    const [_updateKey, setUpdateKey] = useState(0);
    let minLevel = Infinity;
    const menus = BuildTextUtils.paragraph.util.transform(paragraphs ?? []).filter((p) => p.paragraphStyle?.namedStyleType !== undefined && p.paragraphStyle!.namedStyleType !== NamedStyleType.SUBTITLE).map((p) => {
        const level = transformNamedStyleTypeToLevel(p.paragraphStyle!.namedStyleType!);
        minLevel = Math.min(minLevel, level);

        return {
            id: p.paragraphStyle!.headingId!,
            text: getPlainText(fullDataStream.slice(p.paragraphStart, p.paragraphEnd)),
            level,
        };
    });
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const sub = commandService.onCommandExecuted((commandInfo) => {
            if (commandInfo.id === RichTextEditingMutation.id) {
                const params = commandInfo.params as IRichTextEditingMutationParams;
                if (params.unitId === currentDoc?.getUnitId()) {
                    setUpdateKey((prev) => prev + 1);
                }
            }
        });
        return () => {
            sub.dispose();
        };
    }, [commandService, currentDoc]);

    if (!currentDoc || !menus.length) {
        return null;
    }

    return (
        <div
            className={`
              univer-absolute univer-bottom-0 univer-left-0 univer-top-0 univer-z-[100] univer-w-[0px] univer-pb-12
            `}
        >
            <SideMenu menus={menus} open={open} onOpenChange={setOpen} mode="side-bar" />
        </div>
    );
}
