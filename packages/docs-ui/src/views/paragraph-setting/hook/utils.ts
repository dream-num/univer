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

import type { DocumentDataModel, IDocumentBody, IDocumentStyle, IParagraph } from '@univerjs/core';
import type { IDocParagraphSettingCommandParams } from '../../../commands/commands/doc-paragraph-setting.command';
import {
    BuildTextUtils,
    DEFAULT_DOCUMENT_PARAGRAPH_LINE_SPACING,
    DEFAULT_DOCUMENT_PARAGRAPH_SPACE_ABOVE,
    DEFAULT_DOCUMENT_PARAGRAPH_SPACE_BELOW,
    DocumentBlockRangeType,
    ICommandService,
    IUniverInstanceService,
    resolveDocumentParagraphStyle,
    SpacingRule,
    UniverInstanceType,
} from '@univerjs/core';
import { DocSelectionManagerService, DocSkeletonManagerService } from '@univerjs/docs';
import { getNumberUnitValue, IRenderManagerService } from '@univerjs/engine-render';
import { useDependency } from '@univerjs/ui';
import { useEffect, useMemo, useState } from 'react';
import { BehaviorSubject } from 'rxjs';
import { bufferTime, filter, map } from 'rxjs/operators';
import { DocParagraphSettingCommand } from '../../../commands/commands/doc-paragraph-setting.command';
import { DocParagraphSettingController } from '../../../controllers/doc-paragraph-setting.controller';
import {
    convertDisplayLineSpacingToStoredValue,
    convertLineSpacingForRuleChange,
    convertStoredLineSpacingToDisplayValue,
    getLineSpacingMetrics,
} from '../line-spacing';

const PARAGRAPH_LAYOUT_BLOCK_TYPES = new Set([
    DocumentBlockRangeType.CALLOUT,
    DocumentBlockRangeType.CODE,
    DocumentBlockRangeType.QUOTE,
]);

export function resolveParagraphsForSettingPanel(
    paragraphs: IParagraph[],
    body: IDocumentBody,
    documentStyle: IDocumentStyle
) {
    return paragraphs.map((paragraph) => {
        const hasLayoutBlockRange = body.blockRanges?.some((range) =>
            PARAGRAPH_LAYOUT_BLOCK_TYPES.has(range.blockType) &&
            paragraph.startIndex > range.startIndex &&
            paragraph.startIndex < range.endIndex
        ) ?? false;

        return {
            ...paragraph,
            paragraphStyle: resolveDocumentParagraphStyle(documentStyle, paragraph.paragraphStyle, {
                excludeDocumentOuterSpacing: hasLayoutBlockRange,
            }),
        };
    });
}

const useDocRanges = () => {
    const docSelectionManagerService = useDependency(DocSelectionManagerService);
    const docParagraphSettingController = useDependency(DocParagraphSettingController);

    // The `getDocRanges` function internally needs to use `range.position` to obtain the offset.
    // However, when the form control changes and triggers the `getDocRanges` function, the `Skeleton` has already been updated.
    // The information of `range.position` in the docSelectionManagerService does not match the `Skeleton`, causing errors in value retrieval.
    // To address this issue, adding useMemo here to only retrieve the range information for the first time to avoid mismatches between the `Skeleton` and `position`.
    // TODO@GGGPOUND, the business side should not be aware of the timing issue with getDocRanges.
    const docRanges = useMemo(() => docSelectionManagerService.getDocRanges(), []);

    useEffect(() => {
        if (!docRanges.length) {
            docParagraphSettingController.closePanel();
        }
    }, [docRanges]);

    return docRanges;
};

export const useCurrentParagraph = () => {
    const univerInstanceService = useDependency(IUniverInstanceService);
    const docDataModel = univerInstanceService.getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
    const docRanges = useDocRanges();

    if (!docDataModel || docRanges.length === 0) {
        return [];
    }

    const segmentId = docRanges[0].segmentId;

    const segment = docDataModel.getSelfOrHeaderFooterModel(segmentId);
    const body = segment?.getBody();
    const paragraphs = body?.paragraphs ?? [];
    const dataStream = body?.dataStream ?? '';
    const currentParagraphs = BuildTextUtils.range.getParagraphsInRanges(docRanges, paragraphs, dataStream) ?? [];

    return body == null
        ? currentParagraphs
        : resolveParagraphsForSettingPanel(currentParagraphs, body, docDataModel.getDocumentStyle());
};

export const useFirstParagraphHorizontalAlign = (paragraph: IParagraph[], defaultValue: string) => {
    const commandService = useDependency(ICommandService);

    const [horizontalAlign, setHorizontalAlignSetInternal] = useState(() => {
        const firstParagraph = paragraph[0];
        if (!firstParagraph) {
            return defaultValue;
        }
        return String(firstParagraph.paragraphStyle?.horizontalAlign ?? defaultValue);
    });
    const sethorizontalAlign = (v: string) => {
        setHorizontalAlignSetInternal(v);
        return commandService.executeCommand(DocParagraphSettingCommand.id, {
            paragraph: { horizontalAlign: Number(v) },
        } as IDocParagraphSettingCommandParams);
    };
    return [horizontalAlign, sethorizontalAlign] as const;
};

export const useFirstParagraphIndentStart = (paragraph: IParagraph[]) => {
    const commandService = useDependency(ICommandService);

    const [indentStart, setIndentStartInternal] = useState(() => {
        const firstParagraph = paragraph[0];
        if (!firstParagraph) {
            return 0;
        }
        return getNumberUnitValue(firstParagraph.paragraphStyle?.indentStart, 0);
    });
    const setIndentStart = (v: number) => {
        setIndentStartInternal(v);
        return commandService.executeCommand(DocParagraphSettingCommand.id, {
            paragraph: { indentStart: { v } },
        } as IDocParagraphSettingCommandParams);
    };
    return [indentStart, setIndentStart] as const;
};

export const useFirstParagraphIndentEnd = (paragraph: IParagraph[]) => {
    const commandService = useDependency(ICommandService);

    const [indentEnd, setIndentEndInternal] = useState(() => {
        const firstParagraph = paragraph[0];
        if (!firstParagraph) {
            return 0;
        }
        return getNumberUnitValue(firstParagraph.paragraphStyle?.indentEnd, 0);
    });
    const setIndentEnd = (v: number) => {
        setIndentEndInternal(v);
        return commandService.executeCommand(DocParagraphSettingCommand.id, {
            paragraph: { indentEnd: { v } },
        } as IDocParagraphSettingCommandParams);
    };
    return [indentEnd, setIndentEnd] as const;
};

export const useFirstParagraphIndentFirstLine = (paragraph: IParagraph[]) => {
    const commandService = useDependency(ICommandService);

    const [indentFirstLine, setIndentFirstLineInternal] = useState(() => {
        const firstParagraph = paragraph[0];
        if (!firstParagraph) {
            return 0;
        }
        return getNumberUnitValue(firstParagraph.paragraphStyle?.indentFirstLine, 0);
    });
    const setIndentFirstLine = (v: number) => {
        setIndentFirstLineInternal(v);
        return commandService.executeCommand(DocParagraphSettingCommand.id, {
            paragraph: { indentFirstLine: { v } },
        } as IDocParagraphSettingCommandParams);
    };
    return [indentFirstLine, setIndentFirstLine] as const;
};

export const useFirstParagraphIndentHanging = (paragraph: IParagraph[]) => {
    const commandService = useDependency(ICommandService);

    const [hanging, setHangingInternal] = useState(() => {
        const firstParagraph = paragraph[0];
        if (!firstParagraph) {
            return 0;
        }
        return getNumberUnitValue(firstParagraph.paragraphStyle?.hanging, 0);
    });
    const setHanging = (v: number) => {
        setHangingInternal(v);
        return commandService.executeCommand(DocParagraphSettingCommand.id, {
            paragraph: { hanging: { v } },
        } as IDocParagraphSettingCommandParams);
    };
    return [hanging, setHanging] as const;
};

export const useFirstParagraphIndentSpaceAbove = (paragraph: IParagraph[]) => {
    const commandService = useDependency(ICommandService);

    const [spaceAbove, setSpaceAboveInternal] = useState(() => {
        const firstParagraph = paragraph[0];
        if (!firstParagraph) {
            return 0;
        }
        return getNumberUnitValue(firstParagraph.paragraphStyle?.spaceAbove, DEFAULT_DOCUMENT_PARAGRAPH_SPACE_ABOVE);
    });
    const setSpaceAbove = (v: number) => {
        setSpaceAboveInternal(v);
        return commandService.executeCommand(DocParagraphSettingCommand.id, {
            paragraph: { spaceAbove: { v } },
        } as IDocParagraphSettingCommandParams);
    };
    return [spaceAbove, setSpaceAbove] as const;
};

export const useFirstParagraphSpaceBelow = (paragraph: IParagraph[]) => {
    const commandService = useDependency(ICommandService);

    const [spaceBelow, setSpaceBelowInternal] = useState(() => {
        const firstParagraph = paragraph[0];
        if (!firstParagraph) {
            return 0;
        }
        return getNumberUnitValue(firstParagraph.paragraphStyle?.spaceBelow, DEFAULT_DOCUMENT_PARAGRAPH_SPACE_BELOW);
    });
    const setSpaceBelow = (v: number) => {
        setSpaceBelowInternal(v);
        return commandService.executeCommand(DocParagraphSettingCommand.id, {
            paragraph: { spaceBelow: { v } },
        } as IDocParagraphSettingCommandParams);
    };
    return [spaceBelow, setSpaceBelow] as const;
};

// eslint-disable-next-line max-lines-per-function
export const useFirstParagraphLineSpacing = (paragraph: IParagraph[]) => {
    const commandService = useDependency(ICommandService);
    const renderManagerService = useDependency(IRenderManagerService);
    const univerInstanceService = useDependency(IUniverInstanceService);

    const skeleton = useMemo(() => {
        const docDataModel = univerInstanceService.getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
        if (!docDataModel) {
            return undefined;
        }
        return renderManagerService.getRenderById(docDataModel?.getUnitId())?.with(DocSkeletonManagerService).getSkeleton();
    }, []);

    const stateChange$ = useMemo(() => new BehaviorSubject<{ spacingRule?: SpacingRule; lineSpacing?: number }>({}), []);

    const [spacingRule, setSpacingRuleInternal] = useState<SpacingRule>(() => {
        const firstParagraph = paragraph[0];
        if (!firstParagraph) {
            return SpacingRule.AUTO;
        }
        return firstParagraph.paragraphStyle?.spacingRule ?? SpacingRule.AUTO;
    });

    const [lineSpacing, setLineSpacingInternal] = useState(() => {
        const firstParagraph = paragraph[0];
        if (!firstParagraph) {
            return DEFAULT_DOCUMENT_PARAGRAPH_LINE_SPACING;
        }
        const currentSpacingRule = firstParagraph.paragraphStyle?.spacingRule ?? SpacingRule.AUTO;
        const storedLineSpacing = firstParagraph.paragraphStyle?.lineSpacing ?? DEFAULT_DOCUMENT_PARAGRAPH_LINE_SPACING;

        return convertStoredLineSpacingToDisplayValue(storedLineSpacing, currentSpacingRule);
    });

    const setLineSpacing = async (v: number) => {
        setLineSpacingInternal(v);
        stateChange$.next({
            lineSpacing: convertDisplayLineSpacingToStoredValue(v, spacingRule),
            spacingRule,
        });
    };

    const setSpacingRule = async (v: SpacingRule) => {
        if (v !== spacingRule) {
            const glyphNode = skeleton?.findNodeByCharIndex(paragraph[0].startIndex);
            const divideNode = glyphNode?.parent;
            const lineNode = divideNode?.parent;
            const metrics = getLineSpacingMetrics(lineNode);
            const nextStoredLineSpacing = convertLineSpacingForRuleChange(
                convertDisplayLineSpacingToStoredValue(lineSpacing, spacingRule),
                spacingRule,
                v,
                metrics
            );
            const nextDisplayLineSpacing = convertStoredLineSpacingToDisplayValue(nextStoredLineSpacing, v);

            setLineSpacingInternal(nextDisplayLineSpacing);
            setSpacingRuleInternal(v);
            stateChange$.next({
                spacingRule: v,
                lineSpacing: nextStoredLineSpacing,
            });
        }
    };

    useEffect(() => {
        const dispose = stateChange$.pipe(
            filter((obj) => !!Object.keys(obj).length),
            bufferTime(16),
            filter((list) => !!list.length),
            map((list) => {
                return list.reduce((a, b) => {
                    Object.keys(b).forEach((key) => {
                        a[key as 'spacingRule'] = b[key as 'spacingRule'];
                    });
                    return a;
                }, {} as { spacingRule?: SpacingRule; lineSpacing?: number });
            })
        ).subscribe((v) => {
            return commandService.executeCommand(DocParagraphSettingCommand.id, {
                paragraph: { ...v },
            } as IDocParagraphSettingCommandParams);
        });
        return () => dispose.unsubscribe();
    }, []);

    return {
        lineSpacing: [lineSpacing, setLineSpacing] as const,
        spacingRule: [spacingRule, setSpacingRule] as const,
    };
};
