/**
 * Copyright 2023-present DreamNum Inc.
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
import { ICommandService, IUniverInstanceService, UniverInstanceType, useDependency } from '@univerjs/core';
import { getParagraphsInRanges, TextSelectionManagerService } from '@univerjs/docs';
import { useState } from 'react';
import { getNumberUnitValue } from '@univerjs/engine-render';
import type { IDocParagraphSettingCommandParams } from '../../../commands/commands/doc-paragraph-setting.command';
import { DocParagraphSettingCommand } from '../../../commands/commands/doc-paragraph-setting.command';

export const useCurrentParagraph = () => {
    const textSelectionManagerService = useDependency(TextSelectionManagerService);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const docDataModel = univerInstanceService.getCurrentUnitForType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
    const docRanges = textSelectionManagerService.getDocRanges();

    if (!docDataModel || docRanges.length === 0) {
        return [];
    }

    const segmentId = docRanges[0].segmentId;

    const paragraphs = docDataModel.getSelfOrHeaderFooterModel(segmentId).getBody()?.paragraphs ?? [];
    const currentParagraphs = getParagraphsInRanges(docRanges, paragraphs) ?? [];

    return currentParagraphs;
};

export const useFirstParagraphHorizontalAlign = (paragraph: IParagraph[], defaultValue: string) => {
    const commandService = useDependency(ICommandService);

    const [horizontalAlign, _horizontalAlignSet] = useState(() => {
        const firstParagraph = paragraph[0];
        if (!firstParagraph) {
            return defaultValue;
        }
        return String(firstParagraph.paragraphStyle?.horizontalAlign ?? defaultValue);
    });
    const horizontalAlignSet = (v: string) => {
        _horizontalAlignSet(v);
        return commandService.executeCommand(DocParagraphSettingCommand.id, {
            horizontalAlign: Number(v),
        } as IDocParagraphSettingCommandParams);
    };
    return [horizontalAlign, horizontalAlignSet] as const;
};

export const useFirstParagraphIndentStart = (paragraph: IParagraph[]) => {
    const commandService = useDependency(ICommandService);

    const [indentStart, _indentStartSet] = useState(() => {
        const firstParagraph = paragraph[0];
        if (!firstParagraph) {
            return 0;
        }
        return getNumberUnitValue(firstParagraph.paragraphStyle?.indentStart, 0);
    });
    const indentStartSet = (v: number) => {
        _indentStartSet(v);
        return commandService.executeCommand(DocParagraphSettingCommand.id, {
            indentStart: { v },
        } as IDocParagraphSettingCommandParams);
    };
    return [indentStart, indentStartSet] as const;
};

export const useFirstParagraphIndentEnd = (paragraph: IParagraph[]) => {
    const commandService = useDependency(ICommandService);

    const [indentEnd, _indentEndSet] = useState(() => {
        const firstParagraph = paragraph[0];
        if (!firstParagraph) {
            return 0;
        }
        return getNumberUnitValue(firstParagraph.paragraphStyle?.indentEnd, 0);
    });
    const indentEndSet = (v: number) => {
        _indentEndSet(v);
        return commandService.executeCommand(DocParagraphSettingCommand.id, {
            indentEnd: { v },
        } as IDocParagraphSettingCommandParams);
    };
    return [indentEnd, indentEndSet] as const;
};

export const useFirstParagraphIndentFirstLine = (paragraph: IParagraph[]) => {
    const commandService = useDependency(ICommandService);

    const [indentFirstLine, _indentFirstLineSet] = useState(() => {
        const firstParagraph = paragraph[0];
        if (!firstParagraph) {
            return 0;
        }
        return getNumberUnitValue(firstParagraph.paragraphStyle?.indentFirstLine, 0);
    });
    const indentFirstLineSet = (v: number) => {
        _indentFirstLineSet(v);
        return commandService.executeCommand(DocParagraphSettingCommand.id, {
            indentFirstLine: { v },
        } as IDocParagraphSettingCommandParams);
    };
    return [indentFirstLine, indentFirstLineSet] as const;
};

export const useFirstParagraphIndentHanging = (paragraph: IParagraph[]) => {
    const commandService = useDependency(ICommandService);

    const [hanging, _hangingSet] = useState(() => {
        const firstParagraph = paragraph[0];
        if (!firstParagraph) {
            return 0;
        }
        return getNumberUnitValue(firstParagraph.paragraphStyle?.hanging, 0);
    });
    const hangingSet = (v: number) => {
        _hangingSet(v);
        return commandService.executeCommand(DocParagraphSettingCommand.id, {
            hanging: { v },
        } as IDocParagraphSettingCommandParams);
    };
    return [hanging, hangingSet] as const;
};

export const useFirstParagraphIndentSpaceAbove = (paragraph: IParagraph[]) => {
    const commandService = useDependency(ICommandService);

    const [spaceAbove, _spaceAboveSet] = useState(() => {
        const firstParagraph = paragraph[0];
        if (!firstParagraph) {
            return 0;
        }
        return getNumberUnitValue(firstParagraph.paragraphStyle?.spaceAbove, 0);
    });
    const spaceAboveSet = (v: number) => {
        _spaceAboveSet(v);
        return commandService.executeCommand(DocParagraphSettingCommand.id, {
            spaceAbove: { v },
        } as IDocParagraphSettingCommandParams);
    };
    return [spaceAbove, spaceAboveSet] as const;
};

export const useFirstParagraphSpaceBelow = (paragraph: IParagraph[]) => {
    const commandService = useDependency(ICommandService);

    const [spaceBelow, _spaceBelowSet] = useState(() => {
        const firstParagraph = paragraph[0];
        if (!firstParagraph) {
            return 0;
        }
        return getNumberUnitValue(firstParagraph.paragraphStyle?.spaceBelow, 0);
    });
    const spaceBelowSet = (v: number) => {
        _spaceBelowSet(v);
        return commandService.executeCommand(DocParagraphSettingCommand.id, {
            spaceBelow: { v },
        } as IDocParagraphSettingCommandParams);
    };
    return [spaceBelow, spaceBelowSet] as const;
};

export const useFirstParagraphLineSpacing = (paragraph: IParagraph[]) => {
    const commandService = useDependency(ICommandService);

    const [lineSpacing, _lineSpacingSet] = useState(() => {
        const firstParagraph = paragraph[0];
        if (!firstParagraph) {
            return 1;
        }
        return firstParagraph.paragraphStyle?.lineSpacing ?? 1;
    });
    const lineSpacingSet = (v: number) => {
        _lineSpacingSet(v);
        return commandService.executeCommand(DocParagraphSettingCommand.id, {
            lineSpacing: v,
        } as IDocParagraphSettingCommandParams);
    };
    return [lineSpacing, lineSpacingSet] as const;
};
