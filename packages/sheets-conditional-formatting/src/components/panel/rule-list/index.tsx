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

import React, { useEffect, useRef, useState } from 'react';
import { Select, Tooltip } from '@univerjs/design';

import { useDependency } from '@wendellhu/redi/react-bindings';
import { ICommandService, IUniverInstanceService, LocaleService, Rectangle } from '@univerjs/core';
import { SelectionManagerService, SetSelectionsOperation, SetWorksheetActiveOperation } from '@univerjs/sheets';
import { serializeRange } from '@univerjs/engine-formula';
import { DeleteSingle, IncreaseSingle, SequenceSingle } from '@univerjs/icons';
import GridLayout from 'react-grid-layout';
import { debounceTime, Observable } from 'rxjs';
import { AddConditionalRuleMutation } from '../../../commands/mutations/add-conditional-rule.mutation';
import { SetConditionalRuleMutation } from '../../../commands/mutations/set-conditional-rule.mutation';
import { DeleteConditionalRuleMutation } from '../../../commands/mutations/delete-conditional-rule.mutation';
import { MoveConditionalRuleMutation } from '../../../commands/mutations/move-conditional-rule.mutation';
import { ConditionalFormattingRuleModel } from '../../../models/conditional-formatting-rule-model';
import type { IDeleteCfCommandParams } from '../../../commands/commands/delete-cf.command';
import { DeleteCfCommand } from '../../../commands/commands/delete-cf.command';
import type { IMoveCfCommand } from '../../../commands/commands/move-cf.command';
import { moveCfCommand } from '../../../commands/commands/move-cf.command';
import type { IConditionFormattingRule } from '../../../models/type';
import { CFRuleType, CFSubRuleType } from '../../../base/const';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { Preview } from '../../preview';
import { ConditionalFormattingI18nController } from '../../../controllers/cf.i18n.controller';
import { ClearWorksheetCfCommand } from '../../../commands/commands/clear-worksheet-cf.command';

import styles from './index.module.less';

interface IRuleListProps {
    onClick: (rule: IConditionFormattingRule) => void;
    onCreate: () => void;
};
const getRuleDescribe = (rule: IConditionFormattingRule, localeService: LocaleService) => {
    const ruleConfig = rule.rule;
    switch (ruleConfig.type) {
        case CFRuleType.colorScale:{
            return localeService.t('sheet.cf.ruleType.colorScale');
        }
        case CFRuleType.dataBar:{
            return localeService.t('sheet.cf.ruleType.dataBar');
        }
        case CFRuleType.iconSet:{
            return localeService.t('sheet.cf.ruleType.iconSet');
        }
        case CFRuleType.highlightCell:{
            switch (ruleConfig.subType) {
                case CFSubRuleType.average:{
                    const operator = ruleConfig.operator;
                    return localeService.t(`sheet.cf.preview.describe.${operator}`, localeService.t('sheet.cf.subRuleType.average'));
                }
                case CFSubRuleType.duplicateValues:{
                    return localeService.t('sheet.cf.subRuleType.duplicateValues');
                }
                case CFSubRuleType.uniqueValues:{
                    return localeService.t('sheet.cf.subRuleType.uniqueValues');
                }
                case CFSubRuleType.number:{
                    const operator = ruleConfig.operator;
                    return localeService.t(`sheet.cf.preview.describe.${operator}`, ...Array.isArray(ruleConfig.value) ? (ruleConfig.value.map((e) => String(e))) : [String(ruleConfig.value || '')]);
                }
                case CFSubRuleType.text:{
                    const operator = ruleConfig.operator;
                    return localeService.t(`sheet.cf.preview.describe.${operator}`, ruleConfig.value || '');
                }

                case CFSubRuleType.timePeriod:{
                    const operator = ruleConfig.operator;
                    return localeService.t(`sheet.cf.preview.describe.${operator}`);
                }
                case CFSubRuleType.rank:{
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
                case CFSubRuleType.formula:{
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
    const selectionManagerService = useDependency(SelectionManagerService);
    const commandService = useDependency(ICommandService);
    const localeService = useDependency(LocaleService);
    const conditionalFormattingI18nController = useDependency(ConditionalFormattingI18nController);

    const workbook = univerInstanceService.getCurrentUniverSheetInstance();
    const unitId = workbook.getUnitId();
    const worksheet = workbook.getActiveSheet();
    const subUnitId = worksheet.getSheetId();
    const [selectValue, selectValueSet] = useState('2');
    const [fetchRuleListId, fetchRuleListIdSet] = useState(0);
    const [draggingId, draggingIdSet] = useState<number>(-1);
    const [layoutWidth, layoutWidthSet] = useState(defaultWidth);
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
            const selection = selectionManagerService.getLast();
            if (!selection) {
                return [];
            }
            const range = selection.range;
            const _ruleList = ruleList.filter((rule) => {
                return rule.ranges.some((ruleRange) => Rectangle.intersects(ruleRange, range));
            });
            return _ruleList;
        } else if (selectValue === '2') {
            return ruleList;
        }
        return [];
    };
    const [ruleList, ruleListSet] = useState(getRuleList);

    useEffect(() => {
        const disposable = commandService.onCommandExecuted((commandInfo) => {
            if (commandInfo.id === SetWorksheetActiveOperation.id) {
                fetchRuleListIdSet(Math.random());
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
                    const unitId = univerInstanceService.getCurrentUniverSheetInstance().getUnitId();
                    if (commandList.includes(id) && (params as { unitId: string }).unitId === unitId) {
                        commandSubscribe.next(null);
                    }
                });
                return () => disposable.dispose();
            }).pipe(debounceTime(16))
                .subscribe(() => {
                    ruleListSet(getRuleList);
                });
        return () => {
            subscription.unsubscribe();
        };
    }, [univerInstanceService, selectValue, unitId, subUnitId]);

    useEffect(() => {
        const dispose = conditionalFormattingRuleModel.$ruleChange.subscribe(() => {
            fetchRuleListIdSet(Math.random());
        });
        return () => dispose.unsubscribe();
    }, [conditionalFormattingRuleModel]);

    useEffect(() => {
        // Because univer-sidebar contains animations, accurate width values can not be obtained in real time。
        // Also set a global width as the default width to avoid a gap before the first calculation.
        const getWidth = () => {
            // 8 is padding-left
            const width = Math.max(0, (layoutContainerRef.current?.getBoundingClientRect().width || 0) - 8);
            defaultWidth = width;
            return width;
        };
        const observer = new Observable((subscribe) => {
            const targetElement = document.querySelector('.univer-sidebar');
            if (targetElement) {
                let time = setTimeout(() => {
                    subscribe.next();
                }, 150);
                const clearTime = () => {
                    time && clearTimeout(time);
                    time = null as any;
                };
                const handle: any = (e: TransitionEvent) => {
                    if (e.propertyName === 'width') {
                        clearTime();
                        subscribe.next();
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
            layoutWidthSet(getWidth());
        });
        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const handleDelete = (rule: IConditionFormattingRule) => {
        const unitId = univerInstanceService.getCurrentUniverSheetInstance().getUnitId();
        const subUnitId = univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet().getSheetId();
        commandService.executeCommand(DeleteCfCommand.id, { unitId, subUnitId, cfId: rule.cfId } as IDeleteCfCommandParams);
    };

    const handleDragStart = (_layout: unknown, from: { y: number }) => {
        draggingIdSet(from.y);
    };

    const handleDragStop = (_layout: unknown, from: { y: number }, to: { y: number }) => {
        draggingIdSet(-1);
        const unitId = univerInstanceService.getCurrentUniverSheetInstance().getUnitId();
        const subUnitId = univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet().getSheetId();
        const getSaveIndex = (index: number) => {
            const length = ruleList.length;
            return Math.min(length - 1, Math.max(0, index));
        };
        const cfId = ruleList[getSaveIndex(from.y)].cfId;
        const targetCfId = ruleList[getSaveIndex(to.y)].cfId;
        commandService.executeCommand(moveCfCommand.id, { unitId, subUnitId, cfId, targetCfId } as IMoveCfCommand);
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

    const layout = ruleList.map((rule, index) => ({ i: rule.cfId, x: 0, w: 12, y: index, h: 1, isResizable: false }));

    return (
        <div className={styles.cfRuleList}>
            <div className={styles.ruleSelector}>
                <div>
                    {conditionalFormattingI18nController.tWithReactNode('sheet.cf.panel.managerRuleSelect',
                        <Select className={styles.select} options={selectOption} value={selectValue} onChange={(v) => { selectValueSet(v); }} />
                    )
                        .map((ele, index) => <span key={index}>{ele}</span>)}
                </div>
                <div className={styles.btnList}>
                    <Tooltip title={localeService.t('sheet.cf.panel.createRule')} placement="bottom">
                        <div className={`${styles.icon}`} onClick={handleCreate}>
                            <IncreaseSingle />
                        </div>
                    </Tooltip>
                    {ruleList.length
                        ? (
                            <Tooltip title={localeService.t('sheet.cf.panel.clear')} placement="bottom">
                                <div className={`${styles.gap} ${styles.icon}`} onClick={handleClear}>
                                    <DeleteSingle />
                                </div>
                            </Tooltip>
                        )
                        : (
                            <div className={`${styles.gap}  ${styles.disabled}`}>
                                <DeleteSingle />
                            </div>
                        )}

                </div>

            </div>
            <div ref={layoutContainerRef} className={styles.gridLayoutWrap}>
                { layoutWidth
                    ? (
                        <GridLayout
                            onDragStop={handleDragStop}
                            onDragStart={handleDragStart}
                            layout={layout}
                            cols={12}
                            rowHeight={60}
                            width={layoutWidth}
                            margin={[0, 10]}
                            draggableHandle=".draggableHandle"
                        >
                            { ruleList.map((rule, index) => {
                                return (
                                    <div key={`${rule.cfId}`}>
                                        <div className={`${styles.ruleItem} ${draggingId === index ? styles.active : ''}`} onClick={() => onClick(rule)}>
                                            <div
                                                className={`${styles.draggableHandle} draggableHandle`}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <SequenceSingle />
                                            </div>
                                            <div className={styles.ruleDescribe}>
                                                <div className={styles.ruleType}>{getRuleDescribe(rule, localeService)}</div>
                                                <div className={styles.ruleRange}>{rule.ranges.map((range) => serializeRange(range)).join(',')}</div>
                                            </div>
                                            <div className={styles.preview}><Preview rule={rule.rule} /></div>
                                            <div
                                                className={`${styles.deleteItem} ${draggingId === index ? styles.active : ''}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(rule);
                                                }}
                                            >
                                                <DeleteSingle />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </GridLayout>
                    )
                    : null}

            </div>
        </div>
    );
};
