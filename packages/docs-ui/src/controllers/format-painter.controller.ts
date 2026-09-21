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
import {
    Disposable,
    FOCUSING_SHAPE_TEXT_EDITOR,
    ICommandService,
    IContextService,
    Inject,
    IPermissionService,
    IUniverInstanceService,
    UniverInstanceType,
} from '@univerjs/core';
import { canEditDocumentTargets, DocSelectionManagerService } from '@univerjs/docs';
import { FormatPainterSessionService } from '@univerjs/ui';
import { merge } from 'rxjs';
import { ApplyTextFormatPainterCommand, captureTextFormat } from '../commands/commands/format-painter.command';
import { DocMenuStyleService } from '../services/doc-menu-style.service';
import { IEditorService } from '../services/editor/editor-manager.service';

export class DocFormatPainterController extends Disposable {
    constructor(
        @Inject(FormatPainterSessionService) session: FormatPainterSessionService,
        @Inject(DocSelectionManagerService) selections: DocSelectionManagerService,
        @Inject(DocMenuStyleService) styles: DocMenuStyleService,
        @IUniverInstanceService instances: IUniverInstanceService,
        @IContextService context: IContextService,
        @IPermissionService permissions: IPermissionService,
        @IEditorService editors: IEditorService,
        @ICommandService commands: ICommandService
    ) {
        super();
        this.disposeWithMe(commands.registerCommand(ApplyTextFormatPainterCommand));
        const model = () => instances.getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
        const isActive = () => !!model() && (
            context.getContextValue(FOCUSING_SHAPE_TEXT_EDITOR) ||
            (instances.getFocusedUnit()?.getUnitId() === model()?.getUnitId() && !editors.isEditor(model()!.getUnitId()))
        );
        const canStart = () => {
            const doc = model();
            return !!doc && !!selections.getActiveTextRange() && canEditDocumentTargets(permissions, doc.getUnitId(), []);
        };
        this.disposeWithMe(session.register({
            id: 'doc-text',
            priority: 10,
            changes$: merge(selections.textSelection$, instances.focused$, permissions.permissionPointUpdate$),
            isActive,
            canStart,
            clear: () => {
                const doc = model();
                if (!doc) {
                    return false;
                }
                const format = captureTextFormat({ dataStream: '' }, { startOffset: 0, endOffset: 0 }, styles.getDefaultStyle());
                return commands.executeCommand(ApplyTextFormatPainterCommand.id, {
                    unitId: doc.getUnitId(),
                    ranges: selections.getDocRanges(),
                    format: { ...format, paragraphStyle: {} },
                });
            },
            capture: () => {
                const doc = model();
                const range = selections.getActiveTextRange();
                const body = doc?.getSelfOrHeaderFooterModel(range?.segmentId)?.getBody();
                if (!doc || !body || !range) {
                    return null;
                }
                const format = captureTextFormat(body, range, styles.getDefaultStyle(), doc.getSnapshot().lists, doc.getSnapshot());
                return {
                    unitId: instances.getFocusedUnit()?.getUnitId() ?? doc.getUnitId(),
                    apply: (target) => commands.executeCommand(ApplyTextFormatPainterCommand.id, {
                        unitId: target.subUnitId ?? target.unitId,
                        ranges: selections.getDocRanges(),
                        format,
                    }),
                };
            },
        }));
    }
}
