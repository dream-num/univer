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

import type { DocumentDataModel, IParagraph, ISectionBreak } from '@univerjs/core';
import type { IDocParagraphSettingCommandParams } from '../../../commands/commands/doc-paragraph-setting.command';
import { BuildTextUtils, ICommandService, IUniverInstanceService, SpacingRule, UniverInstanceType } from '@univerjs/core';
import { DocSelectionManagerService, DocSkeletonManagerService } from '@univerjs/docs';
import { getNumberUnitValue, IRenderManagerService } from '@univerjs/engine-render';
import { useDependency } from '@univerjs/ui';
import { useEffect, useMemo, useRef, useState } from 'react';
import { BehaviorSubject } from 'rxjs';
import { bufferTime, filter, map } from 'rxjs/operators';
import { DocParagraphSettingCommand } from '../../../commands/commands/doc-paragraph-setting.command';
import { findNearestSectionBreak } from '../../../commands/commands/list.command';
import { DocParagraphSettingController } from '../../../controllers/doc-paragraph-setting.controller';

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
    const docDataModel = univerInstanceService.getCurrentUnitForType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
    const docRanges = useDocRanges();

    if (!docDataModel || docRanges.length === 0) {
        return [];
    }

    const segmentId = docRanges[0].segmentId;

    const segment = docDataModel.getSelfOrHeaderFooterModel(segmentId);
    const paragraphs = segment.getBody()?.paragraphs ?? [];
    const dataStream = segment.getBody()?.dataStream ?? '';
    const currentParagraphs = BuildTextUtils.range.getParagraphsInRanges(docRanges, paragraphs, dataStream) ?? [];

    return currentParagraphs;
};

export const useCurrentSections = (currentParagraphs: IParagraph[]) => {
    const univerInstanceService = useDependency(IUniverInstanceService);
    const docDataModel = univerInstanceService.getCurrentUnitForType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
    const docRanges = useDocRanges();

    if (!docDataModel || docRanges.length === 0) {
        return [];
    }

    const segmentId = docRanges[0].segmentId;

    const sectionBreaks = docDataModel.getSelfOrHeaderFooterModel(segmentId).getBody()?.sectionBreaks ?? [];
    const currentSectionBreaks = currentParagraphs
        .map((item) => findNearestSectionBreak(item.startIndex, sectionBreaks))
        .reduce((a, b, index, list) => {
            const isEnd = list.length - 1 === index;
            if (b) {
                a.map[b.startIndex] = b;
            }
            if (isEnd) {
                for (const key in a.map) {
                    const v = a.map[key];
                    a.result.push(v);
                }
            }
            return a;
        }, { map: {}, result: [] } as { map: Record<string, ISectionBreak>; result: ISectionBreak[] })
        .result;
    return currentSectionBreaks;
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
            paragraph: { horizontalAlign: Number(v) },
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
            paragraph: { indentStart: { v } },
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
            paragraph: { indentEnd: { v } },
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
            paragraph: { indentFirstLine: { v } },
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
            paragraph: { hanging: { v } },
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
            paragraph: { spaceAbove: { v } },
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
            paragraph: { spaceBelow: { v } },
        } as IDocParagraphSettingCommandParams);
    };
    return [spaceBelow, spaceBelowSet] as const;
};

// eslint-disable-next-line max-lines-per-function
export const useFirstParagraphLineSpacing = (paragraph: IParagraph[]) => {
    const commandService = useDependency(ICommandService);
    const renderManagerService = useDependency(IRenderManagerService);
    const univerInstanceService = useDependency(IUniverInstanceService);

    const skeleton = useMemo(() => {
        const docDataModel = univerInstanceService.getCurrentUnitForType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
        if (!docDataModel) {
            return undefined;
        }
        return renderManagerService.getRenderById(docDataModel?.getUnitId())?.with(DocSkeletonManagerService).getSkeleton();
    }, []);

    const stateChange$ = useMemo(() => new BehaviorSubject<{ spacingRule?: SpacingRule; lineSpacing?: number }>({}), []);

    const [lineSpacing, _lineSpacingSet] = useState(() => {
        const firstParagraph = paragraph[0];
        if (!firstParagraph) {
            return 1;
        }
        return firstParagraph.paragraphStyle?.lineSpacing ?? 1;
    });

    const lineSpacingCache = useRef<number>(lineSpacing);

    const [spacingRule, _spacingRuleSet] = useState<SpacingRule>(() => {
        const firstParagraph = paragraph[0];
        if (!firstParagraph) {
            return SpacingRule.AUTO;
        }
        return firstParagraph.paragraphStyle?.spacingRule ?? SpacingRule.AUTO;
    });

    const lineSpacingSet = async (v: number) => {
        _lineSpacingSet(v);
        stateChange$.next({ lineSpacing: v, spacingRule });
    };

    const spacingRuleSet = async (v: SpacingRule) => {
        if (v !== spacingRule) {
            let cache = lineSpacingCache.current;
            if (v === SpacingRule.AT_LEAST) {
                const glyphNode = skeleton?.findNodeByCharIndex(paragraph[0].startIndex);
                const divideNode = glyphNode?.parent;
                const lineNode = divideNode?.parent;
                if (lineNode?.contentHeight !== undefined) {
                    cache = Math.max(lineNode.contentHeight, cache);
                }
            } else {
                // If the paragraph is set to fixed-spacing by default,
                // the first time you enter the panel,
                // you will set the fixed-spacing value to the initial value of multiple-spacing
                if (cache > 5) {
                    cache = 2;
                }
            }
            lineSpacingCache.current = lineSpacing;
            lineSpacingSet(cache);
            _spacingRuleSet(v);
            stateChange$.next({ spacingRule: v });
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
        lineSpacing: [lineSpacing, lineSpacingSet] as const,
        spacingRule: [spacingRule, spacingRuleSet] as const,

    };
};
