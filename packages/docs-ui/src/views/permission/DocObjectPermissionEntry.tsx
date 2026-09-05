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
import type { LocaleKey } from '../../locale/types';
import { IUniverInstanceService, LocaleService, ObjectPermissionService } from '@univerjs/core';
import { Button, Separator } from '@univerjs/design';
import {
    getDocumentParagraphPermissionObjectId,
    getDocumentSectionPermissionObjectId,
    SetDocumentPermissionCommand,
} from '@univerjs/docs';
import { UnitObject } from '@univerjs/protocol';
import { openObjectPermissionDialog, useDependency, useInjector, useObservable } from '@univerjs/ui';

interface IDocObjectPermissionEntryProps {
    unitId?: string;
    id?: string;
    objectType: UnitObject.DocumentParagraph | UnitObject.DocumentSection;
    segmentId?: string;
}

export function DocObjectPermissionEntry({ unitId, id, objectType, segmentId = '' }: IDocObjectPermissionEntryProps) {
    const injector = useInjector();
    const instances = useDependency(IUniverInstanceService);
    const permissions = useDependency(ObjectPermissionService);
    const localeService = useDependency(LocaleService);
    useObservable(permissions.changed$, 0);
    useObservable(localeService.currentLocale$);
    if (!unitId || !id) {
        return null;
    }
    const isParagraph = objectType === UnitObject.DocumentParagraph;
    const target = {
        unitId,
        objectId: isParagraph
            ? getDocumentParagraphPermissionObjectId(segmentId, id)
            : getDocumentSectionPermissionObjectId(segmentId, id),
        objectType,
    };
    const exists = () => {
        const body = instances.getUnit<DocumentDataModel>(unitId)?.getSelfOrHeaderFooterModel(segmentId)?.getBody();
        return isParagraph
            ? body?.paragraphs?.some((paragraph) => paragraph.paragraphId === id) === true
            : body?.sectionBreaks?.some((section) => section.sectionId === id) === true;
    };
    if (!permissions.supports(target) || !exists()) {
        return null;
    }
    return (
        <div className="univer-mt-5">
            <Separator className="univer-mb-3" />
            <Button
                type="button"
                variant="text"
                className="univer-w-full univer-justify-start"
                onClick={() => openObjectPermissionDialog(injector, {
                    target,
                    name: localeService.t<LocaleKey>(isParagraph ? 'docs-ui.objectPermission.paragraph' : 'docs-ui.objectPermission.section'),
                    commandId: SetDocumentPermissionCommand.id,
                    exists,
                })}
            >
                {localeService.t<LocaleKey>('docs-ui.objectPermission.title')}
            </Button>
        </div>
    );
}
