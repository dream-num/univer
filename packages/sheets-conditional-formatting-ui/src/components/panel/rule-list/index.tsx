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

import type { IRange, Workbook } from '@univerjs/core';
import type { IConditionFormattingRule, IDeleteCfCommandParams, IMoveCfCommandParams } from '@univerjs/sheets-conditional-formatting';
import { ICommandService, Injector, IUniverInstanceService, LocaleService, Rectangle, UniverInstanceType } from '@univerjs/core';
import { clsx, ReactGridLayout, Select, Tooltip } from '@univerjs/design';
import { serializeRange } from '@univerjs/engine-formula';
import { DeleteSingle, IncreaseSingle, SequenceSingle } from '@univerjs/icons';
import { checkRangesEditablePermission, SetSelectionsOperation, SetWorksheetActiveOperation, SheetsSelectionsService } from '@univerjs/sheets';
import {
    AddConditionalRuleMutation,
    CFRuleType,
    CFSubRuleType,
    ClearWorksheetCfCommand,
    ConditionalFormattingRuleModel,
    DeleteCfCommand,
    DeleteConditionalRuleMutation,
    MoveCfCommand,
    MoveConditionalRuleMutation,
    SetConditionalRuleMutation,
} from '@univerjs/sheets-conditional-formatting';
import { useHighlightRange } from '@univerjs/sheets-ui';
import { ISidebarService, useDependency, useObservable } from '@univerjs/ui';
import { useEffect, useMemo, useRef, useState } from 'react';
import { debounceTime, Observable } from 'rxjs';
import { ConditionalFormattingI18nController } from '../../../controllers/cf.i18n.controller';
import { Preview } from '../../preview';

interface IRuleListProps {
    onClick: (rule: IConditionFormattingRule) => void;
    onCreate: () => void;
};
const getRuleDescribe = (rule: IConditionFormattingRule, localeService: LocaleService) => {
    const ruleConfig = rule.rule;
    switch (ruleConfig.type) {
        case CFRuleType.colorScale: {
            return localeService.t('sheet.cf.ruleType.colorScale');
        }
        case CFRuleType.dataBar: {
            return localeService.t('sheet.cf.ruleType.dataBar');
        }
        case CFRuleType.iconSet: {
            return localeService.t('sheet.cf.ruleType.iconSet');
        }
        case CFRuleType.highlightCell: {
            switch (ruleConfig.subType) {
                case CFSubRuleType.average: {
                    const operator = ruleConfig.operator;
                    return localeService.t(`sheet.cf.preview.describe.${operator}`, localeService.t('sheet.cf.subRuleType.average'));
                }
                case CFSubRuleType.duplicateValues: {
                    return localeService.t('sheet.cf.subRuleType.duplicateValues');
                }
                case CFSubRuleType.uniqueValues: {
                    return localeService.t('sheet.cf.subRuleType.uniqueValues');
                }
                case CFSubRuleType.number: {
                    const operator = ruleConfig.operator;
                    return localeService.t(`sheet.cf.preview.describe.${operator}`, ...Array.isArray(ruleConfig.value) ? (ruleConfig.value.map((e) => String(e))) : [String(ruleConfig.value || '')]);
                }
                case CFSubRuleType.text: {
                    const operator = ruleConfig.operator;
                    return localeService.t(`sheet.cf.preview.describe.${operator}`, ruleConfig.value || '');
                }

                case CFSubRuleType.timePeriod: {
                    const operator = ruleConfig.operator;
                    return localeService.t(`sheet.cf.preview.describe.${operator}`);
                }
                case CFSubRuleType.rank: {
                    if (ruleConfig.isPercent) {
                        if (ruleConfig.isBottom) {
                            return localeService.t('sheet.cf.preview.describe.bottomNPercent', String(ruleConfig.value));
                        } else {
                            return localeService.t('sheet.cf.preview.describe.topNPercent', String(ruleConfig.value));
                        }
                    } else {
                        if (ruleConfig.isBottom) {
                            return localeService.t('sheet.cf.preview.describe.bottomN', String(ruleConfig.value));
                        } else {
                            return localeService.t('sheet.cf.preview.describe.topN', String(ruleConfig.value));
                        }
                    }
                }
                case CFSubRuleType.formula: {
                    return localeService.t('sheet.cf.ruleType.formula');
                }
            }
        }
    }
};

let defaultWidth = 0;
export const RuleList = (props: IRuleListProps) => {
    const { onClick } = props;
    const conditionalFormattingRuleModel = useDependency(ConditionalFormattingRuleModel);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const selectionManagerService = useDependency(SheetsSelectionsService);
    const commandService = useDependency(ICommandService);
    const localeService = useDependency(LocaleService);
    const injector = useDependency(Injector);
    const sidebarService = useDependency(ISidebarService);

    const conditionalFormattingI18nController = useDependency(ConditionalFormattingI18nController);

    const workbook = useObservable(() => univerInstanceService.getCurrentTypeOfUnit$<Workbook>(UniverInstanceType.UNIVER_SHEET), undefined, undefined, [])!;
    const unitId = workbook.getUnitId();
    const worksheet = workbook.getActiveSheet();
    if (!worksheet) {
        throw new Error('No active sheet found');
    }

    const subUnitId = worksheet.getSheetId();

    const [currentRuleRanges, currentRuleRangesSet] = useState<IRange[]>([]);
    const [selectValue, setSelectValue] = useState('2');
    const [fetchRuleListId, setFetchRuleListId] = useState(0);
    const [draggingId, setDraggingId] = useState<number>(-1);
    const [layoutWidth, setLayoutWidth] = useState(defaultWidth);
    const layoutContainerRef = useRef<HTMLDivElement>(null);

    const selectOption = [
        { label: localeService.t('sheet.cf.panel.workSheet'), value: '2' },
        { label: localeService.t('sheet.cf.panel.selectedRange'), value: '1' },
    ];

    const getRuleList = () => {
        const ruleList = conditionalFormattingRuleModel.getSubunitRules(unitId, subUnitId);
        if (!ruleList || !ruleList.length) {
            return [];
        }
        if (selectValue === '1') {
            const selection = selectionManagerService.getCurrentLastSelection();
            if (!selection) {
                return [];
            }
            const range = selection.range;
            const _ruleList = ruleList.filter((rule) => {
                return rule.ranges.some((ruleRange) => Rectangle.intersects(ruleRange, range));
            });
            return _ruleList;
        } else if (selectValue === '2') {
            return [...ruleList];
        }
        return [];
    };

    const [ruleList, ruleListSet] = useState(getRuleList);

    useHighlightRange(currentRuleRanges);

    useEffect(() => {
        const disposable = commandService.onCommandExecuted((commandInfo) => {
            if (commandInfo.id === SetWorksheetActiveOperation.id) {
                setFetchRuleListId(Math.random());
            }
        });
        return () => disposable.dispose();
    });

    useEffect(() => {
        ruleListSet(getRuleList);
    }, [selectValue, fetchRuleListId, unitId, subUnitId]);

    useEffect(() => {
        if (selectValue === '2') {
            return;
        }
        const subscription =
            new Observable<null>((commandSubscribe) => {
                const commandList = [SetSelectionsOperation.id, AddConditionalRuleMutation.id, SetConditionalRuleMutation.id, DeleteConditionalRuleMutation.id, MoveConditionalRuleMutation.id];
                const disposable = commandService.onCommandExecuted((commandInfo) => {
                    const { id, params } = commandInfo;
                    const unitId = univerInstanceService.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getUnitId();
                    if (commandList.includes(id) && (params as { unitId: string }).unitId === unitId) {
                        commandSubscribe.next(null);
                    }
                });
                return () => disposable.dispose();
            }).pipe(debounceTime(16)).subscribe(() => {
                ruleListSet(getRuleList);
            });
        return () => {
            subscription.unsubscribe();
        };
    }, [univerInstanceService, selectValue, unitId, subUnitId]);

    useEffect(() => {
        const dispose = conditionalFormattingRuleModel.$ruleChange.subscribe(() => {
            setFetchRuleListId(Math.random());
        });
        return () => dispose.unsubscribe();
    }, [conditionalFormattingRuleModel]);

    useEffect(() => {
        // Because univer-sidebar contains animations, accurate width values can not be obtained in real time。
        // Also set a global width as the default width to avoid a gap before the first calculation.
        const getWidth = () => {
            // 8 is padding-left
            const width = Math.max(0, (layoutContainerRef.current?.getBoundingClientRect().width ?? 0) - 8);
            defaultWidth = width;
            return width;
        };
        const observer = new Observable((subscribe) => {
            const targetElement = sidebarService.getContainer();
            if (targetElement) {
                let time = setTimeout(() => {
                    subscribe.next(undefined);
                }, 150);
                const clearTime = () => {
                    time && clearTimeout(time);
                    time = null as any;
                };
                const handle: any = (e: TransitionEvent) => {
                    if (e.propertyName === 'width') {
                        clearTime();
                        subscribe.next(undefined);
                    }
                };
                targetElement.addEventListener('transitionend', handle);
                return () => {
                    clearTime();
                    targetElement.removeEventListener('transitionend', handle);
                };
            }
        });
        const subscription = observer.pipe(debounceTime(16)).subscribe(() => {
            setLayoutWidth(getWidth());
        });
        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const handleDelete = (rule: IConditionFormattingRule) => {
        const unitId = univerInstanceService.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getUnitId();
        const subUnitId = univerInstanceService.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getActiveSheet()?.getSheetId();
        if (!unitId || !subUnitId) {
            throw new Error('No active sheet found');
        }
        commandService.executeCommand(DeleteCfCommand.id, { unitId, subUnitId, cfId: rule.cfId } as IDeleteCfCommandParams);
    };

    const handleDragStart = (_layout: unknown, from: { y: number }) => {
        setDraggingId(from.y);
    };

    const handleDragStop = (_layout: unknown, from: { y: number }, to: { y: number }) => {
        setDraggingId(-1);
        const unitId = univerInstanceService.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getUnitId();
        const subUnitId = univerInstanceService.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getActiveSheet()?.getSheetId();
        if (!unitId || !subUnitId) {
            throw new Error('No active sheet found');
        }

        const getSaveIndex = (index: number) => {
            const length = ruleList.length;
            return Math.min(length - 1, Math.max(0, index));
        };
        const cfId = ruleList[getSaveIndex(from.y)].cfId;
        const targetCfId = ruleList[getSaveIndex(to.y)].cfId;
        if (cfId !== targetCfId) {
            commandService.executeCommand(MoveCfCommand.id, { unitId, subUnitId, start: { id: cfId, type: 'self' }, end: { id: targetCfId, type: to.y > from.y ? 'after' : 'before' } } as IMoveCfCommandParams);
        }
    };

    const handleCreate = () => {
        props.onCreate();
    };

    const handleClear = () => {
        if (selectValue === '2') {
            commandService.executeCommand(ClearWorksheetCfCommand.id);
        } else if (selectValue === '1') {
            const list = ruleList.map((rule) => ({ unitId, subUnitId, cfId: rule.cfId }));
            list.forEach((config) => {
                commandService.executeCommand(DeleteCfCommand.id, config);
            });
        }
    };
    const ruleListByPermissionCheck = useMemo(() => {
        const workbook = univerInstanceService.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        const worksheet = workbook.getActiveSheet();
        return ruleList.filter((rule) => {
            const ranges = rule.ranges;
            const hasPermission = checkRangesEditablePermission(injector, workbook.getUnitId(), worksheet.getSheetId(), ranges);
            return hasPermission;
        });
    }, [ruleList]);

    const layout = ruleListByPermissionCheck.map((rule, index) => ({ i: rule.cfId, x: 0, w: 12, y: index, h: 1, isResizable: false }));

    const isHasAllRuleEditPermission = useMemo(() => {
        const workbook = univerInstanceService.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        const worksheet = workbook.getActiveSheet();
        return ruleList.every((rule) => {
            const ranges = rule.ranges;
            const hasPermission = checkRangesEditablePermission(injector, workbook.getUnitId(), worksheet.getSheetId(), ranges);
            return hasPermission;
        });
    }, [ruleList]);

    return (
        <div>
            <div className="univer-flex univer-items-center univer-justify-between univer-gap-2 univer-text-sm">
                <div className="univer-flex univer-items-center univer-gap-2">
                    {conditionalFormattingI18nController.tWithReactNode(
                        'sheet.cf.panel.managerRuleSelect',
                        <Select
                            className="univer-w-36"
                            options={selectOption}
                            value={selectValue}
                            onChange={(v) => { setSelectValue(v); }}
                        />
                    ).map((ele, index) => <span key={index}>{ele}</span>)}
                </div>
                <div className="univer-flex univer-justify-end">
                    <Tooltip title={localeService.t('sheet.cf.panel.createRule')} placement="bottom">
                        <a
                            className="univer-size-5 univer-cursor-pointer"
                            onClick={handleCreate}
                        >
                            <IncreaseSingle />
                        </a>
                    </Tooltip>
                    {(ruleList.length && isHasAllRuleEditPermission)
                        ? (
                            <Tooltip title={localeService.t('sheet.cf.panel.clear')} placement="bottom">
                                <a
                                    className="univer-size-5 univer-cursor-pointer"
                                    onClick={handleClear}
                                >
                                    <DeleteSingle className="univer-text-red-500" />
                                </a>
                            </Tooltip>
                        )
                        : (
                            <div>
                                <DeleteSingle className="univer-text-gray-300" />
                            </div>
                        )}

                </div>

            </div>

            <div ref={layoutContainerRef}>
                {layoutWidth > 0 && (
                    <ReactGridLayout
                        className={`
                          [&_.react-grid-item]:univer-transition-none
                          [&_.react-grid-placeholder]:univer-rounded [&_.react-grid-placeholder]:!univer-bg-gray-200
                        `}
                        draggableHandle=".draggableHandle"
                        layout={layout}
                        cols={12}
                        rowHeight={60}
                        width={layoutWidth}
                        margin={[0, 10]}
                        onDragStop={handleDragStop}
                        onDragStart={handleDragStart}
                    >
                        {ruleListByPermissionCheck?.map((rule, index) => {
                            return (
                                <div key={`${rule.cfId}`}>
                                    <div
                                        className={clsx(`
                                          univer-group univer-relative univer-flex univer-items-center
                                          univer-justify-between univer-rounded univer-py-2 univer-pl-5 univer-pr-8
                                          hover:univer-bg-gray-100
                                        `, {
                                            'univer-bg-gray-100': draggingId === index,
                                        })}
                                        onMouseMove={() => {
                                            rule.ranges !== currentRuleRanges && currentRuleRangesSet(rule.ranges);
                                        }}
                                        onMouseLeave={() => currentRuleRangesSet([])}
                                        onClick={() => {
                                            onClick(rule);
                                        }}
                                    >
                                        <div
                                            className={clsx(`
                                              univer-absolute univer-left-0 univer-hidden univer-size-5
                                              univer-cursor-grab univer-items-center univer-justify-center
                                              univer-rounded
                                              group-hover:univer-flex
                                            `, 'draggableHandle')}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <SequenceSingle />
                                        </div>
                                        <div
                                            className={`
                                              univer-min-w-0 univer-max-w-full univer-flex-shrink univer-overflow-hidden
                                            `}
                                        >
                                            <div
                                                className={`
                                                  univer-text-sm univer-text-gray-900
                                                  dark:univer-text-white
                                                `}
                                            >
                                                {getRuleDescribe(rule, localeService)}
                                            </div>
                                            <div className="univer-text-xs univer-text-gray-400">
                                                {rule.ranges.map((range) => serializeRange(range)).join(',')}
                                            </div>
                                        </div>
                                        <div>
                                            <Preview rule={rule.rule} />
                                        </div>
                                        <div
                                            className={clsx(`
                                              univer-absolute univer-right-1 univer-hidden univer-size-6
                                              univer-cursor-pointer univer-items-center univer-justify-center
                                              univer-rounded
                                              group-hover:univer-flex
                                              hover:univer-bg-gray-200
                                            `, {
                                                'univer-flex univer-items-center univer-justify-center': draggingId === index,
                                            })}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(rule);
                                                currentRuleRangesSet([]);
                                            }}
                                        >
                                            <DeleteSingle />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </ReactGridLayout>
                ) }
            </div>
        </div>
    );
};
