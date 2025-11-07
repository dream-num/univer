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

import type { Workbook } from '@univerjs/core';
import type { FUniver } from '@univerjs/core/facade';
import type { RangeProtectionPermissionEditPoint, RangeProtectionPermissionViewPoint } from '@univerjs/sheets';
import { ILogService, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { Button } from '@univerjs/design';
import { useDependency, useObservable } from '@univerjs/ui';
import React, { useEffect, useMemo, useState } from 'react';

interface IProtectedRangeShadowDemoProps {
    univerAPI: ReturnType<typeof FUniver.newAPI>;
}

export const ProtectedRangeShadowDemo: React.FC<IProtectedRangeShadowDemoProps> = ({ univerAPI }) => {
    const logService = useDependency(ILogService);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const workbook = useObservable(
        useMemo(() => univerInstanceService.getCurrentTypeOfUnit$<Workbook>(UniverInstanceType.UNIVER_SHEET), [univerInstanceService])
    );
    const worksheet = useObservable(useMemo(() => workbook?.activeSheet$, [workbook]));

    const [currentStrategy, setCurrentStrategy] = useState<'always' | 'non-editable' | 'non-viewable' | 'none'>(() => {
        return univerAPI.getProtectedRangeShadowStrategy();
    });
    const [setupStatus, setSetupStatus] = useState<string>('Not initialized');

    // Subscribe to strategy changes
    useEffect(() => {
        const subscription = univerAPI.getProtectedRangeShadowStrategy$().subscribe((strategy) => {
            setCurrentStrategy(strategy);
            logService.log('[ProtectedRangeShadow] Strategy changed to:', strategy);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [univerAPI, logService]);

    // Setup protected ranges with different permissions
    const setupProtectedRanges = async () => {
        if (!workbook || !worksheet) {
            logService.error('[ProtectedRangeShadow] No active workbook or worksheet');
            setSetupStatus('Error: No active workbook or worksheet');
            return;
        }

        const unitId = workbook.getUnitId();
        const subUnitId = worksheet.getSheetId();

        try {
            logService.log('[ProtectedRangeShadow] Setting up protected ranges...');
            setSetupStatus('Setting up...');

            const fWorkbook = univerAPI.getActiveWorkbook();
            if (!fWorkbook) {
                throw new Error('No active workbook facade');
            }
            const fWorksheet = fWorkbook.getActiveSheet();
            if (!fWorksheet) {
                throw new Error('No active worksheet facade');
            }
            const permission = fWorkbook.getPermission();

            // 1. Setup Editable Range (A1:C3) - 可编辑的保护区域
            logService.log('[ProtectedRangeShadow] Creating editable range A1:C3');
            const editableRange = fWorksheet.getRange('A1:C3');
            const editableRes = await permission.addRangeBaseProtection(unitId, subUnitId, [editableRange]);

            if (editableRes) {
                const { permissionId: editablePermissionId, ruleId: editableRuleId } = editableRes;
                logService.log('[ProtectedRangeShadow] Editable range created:', { editablePermissionId, editableRuleId });

                // Set as editable (Edit: true, View: true)
                permission.setRangeProtectionPermissionPoint(
                    unitId,
                    subUnitId,
                    editablePermissionId,
                    permission.permissionPointsDefinition.RangeProtectionPermissionEditPoint as typeof RangeProtectionPermissionEditPoint,
                    true
                );
                permission.setRangeProtectionPermissionPoint(
                    unitId,
                    subUnitId,
                    editablePermissionId,
                    permission.permissionPointsDefinition.RangeProtectionPermissionViewPoint as typeof RangeProtectionPermissionViewPoint,
                    true
                );
                logService.log('[ProtectedRangeShadow] Editable range permissions set');
            }

            // 2. Setup Non-Editable Range (E1:G3) - 不可编辑但可查看的保护区域
            logService.log('[ProtectedRangeShadow] Creating non-editable range E1:G3');
            const nonEditableRange = fWorksheet.getRange('E1:G3');
            const nonEditableRes = await permission.addRangeBaseProtection(unitId, subUnitId, [nonEditableRange]);

            if (nonEditableRes) {
                const { permissionId: nonEditablePermissionId, ruleId: nonEditableRuleId } = nonEditableRes;
                logService.log('[ProtectedRangeShadow] Non-editable range created:', { nonEditablePermissionId, nonEditableRuleId });

                // Set as non-editable (Edit: false, View: true)
                permission.setRangeProtectionPermissionPoint(
                    unitId,
                    subUnitId,
                    nonEditablePermissionId,
                    permission.permissionPointsDefinition.RangeProtectionPermissionEditPoint as typeof RangeProtectionPermissionEditPoint,
                    false
                );
                permission.setRangeProtectionPermissionPoint(
                    unitId,
                    subUnitId,
                    nonEditablePermissionId,
                    permission.permissionPointsDefinition.RangeProtectionPermissionViewPoint as typeof RangeProtectionPermissionViewPoint,
                    true
                );
                logService.log('[ProtectedRangeShadow] Non-editable range permissions set');
            }

            // 3. Setup Non-Viewable Range (A5:C7) - 不可查看的保护区域
            logService.log('[ProtectedRangeShadow] Creating non-viewable range A5:C7');
            const nonViewableRange = fWorksheet.getRange('A5:C7');
            const nonViewableRes = await permission.addRangeBaseProtection(unitId, subUnitId, [nonViewableRange]);

            if (nonViewableRes) {
                const { permissionId: nonViewablePermissionId, ruleId: nonViewableRuleId } = nonViewableRes;
                logService.log('[ProtectedRangeShadow] Non-viewable range created:', { nonViewablePermissionId, nonViewableRuleId });

                // Set as non-viewable (Edit: false, View: false)
                permission.setRangeProtectionPermissionPoint(
                    unitId,
                    subUnitId,
                    nonViewablePermissionId,
                    permission.permissionPointsDefinition.RangeProtectionPermissionEditPoint as typeof RangeProtectionPermissionEditPoint,
                    false
                );
                permission.setRangeProtectionPermissionPoint(
                    unitId,
                    subUnitId,
                    nonViewablePermissionId,
                    permission.permissionPointsDefinition.RangeProtectionPermissionViewPoint as typeof RangeProtectionPermissionViewPoint,
                    false
                );
                logService.log('[ProtectedRangeShadow] Non-viewable range permissions set');
            }

            // Add some sample data to the ranges
            editableRange.setValue('Editable\nA1:C3\nCan Edit');
            nonEditableRange.setValue('Non-Editable\nE1:G3\nCannot Edit');
            nonViewableRange.setValue('Non-Viewable\nA5:C7\nCannot View');

            setSetupStatus('✅ Setup complete! Three protected ranges created.');
            logService.log('[ProtectedRangeShadow] Setup complete!');
        } catch (error) {
            logService.error('[ProtectedRangeShadow] Setup error:', error);
            setSetupStatus(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
        }
    };

    // Test get permission info for a specific cell
    const testGetPermissionInfo = () => {
        if (!workbook || !worksheet) {
            logService.error('[ProtectedRangeShadow] No active workbook or worksheet');
            return;
        }

        const fWorkbook = univerAPI.getActiveWorkbook();
        if (!fWorkbook) {
            logService.error('[ProtectedRangeShadow] No active workbook facade');
            return;
        }
        const permission = fWorkbook.getPermission();

        const unitId = workbook.getUnitId();
        const subUnitId = worksheet.getSheetId();

        // Test cells from different ranges
        const testCells = [
            { row: 0, col: 0, label: 'A1 (Editable)' },
            { row: 0, col: 4, label: 'E1 (Non-Editable)' },
            { row: 4, col: 0, label: 'A5 (Non-Viewable)' },
            { row: 10, col: 10, label: 'K11 (No Protection)' },
        ];

        testCells.forEach(({ row, col, label }) => {
            const info = permission.getPermissionInfoWithCell(unitId, subUnitId, row, col);
            if (info) {
                logService.log(`[ProtectedRangeShadow] ${label} - Permission ID: ${info.permissionId}, Rule ID: ${info.ruleId}`);
            } else {
                logService.log(`[ProtectedRangeShadow] ${label} - No protection found`);
            }
        });
    };

    // Strategy switch buttons
    const strategies: Array<'always' | 'non-editable' | 'non-viewable' | 'none'> = ['always', 'non-editable', 'non-viewable', 'none'];

    return (
        <div
            style={{
                position: 'fixed',
                top: '80px',
                right: '20px',
                zIndex: 1000,
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                minWidth: '320px',
            }}
        >
            <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px' }}>Protected Range Shadow Demo</h3>

            <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '14px', marginBottom: '8px', color: '#666' }}>
                    Current Strategy:
                    {' '}
                    <strong style={{ color: '#1890ff' }}>{currentStrategy}</strong>
                </div>
                <div style={{ fontSize: '12px', color: '#999' }}>
                    {setupStatus}
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                <Button
                    onClick={setupProtectedRanges}
                    style={{ width: '100%', backgroundColor: '#1890ff', color: 'white', border: 'none' }}
                >
                    🛡️ Setup Protected Ranges
                </Button>

                <Button
                    onClick={testGetPermissionInfo}
                    style={{ width: '100%' }}
                >
                    🔍 Test Get Permission Info
                </Button>
            </div>

            <div style={{ borderTop: '1px solid #e8e8e8', paddingTop: '16px' }}>
                <div style={{ fontSize: '14px', marginBottom: '8px', fontWeight: 500 }}>
                    Switch Shadow Strategy:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {strategies.map((strategy) => (
                        <Button
                            key={strategy}
                            onClick={() => {
                                univerAPI.setProtectedRangeShadowStrategy(strategy);
                                logService.log('[ProtectedRangeShadow] Switched to:', strategy);
                            }}
                            style={{
                                fontSize: '12px',
                                backgroundColor: currentStrategy === strategy ? '#1890ff' : undefined,
                                color: currentStrategy === strategy ? 'white' : undefined,
                                border: currentStrategy === strategy ? 'none' : undefined,
                            }}
                        >
                            {strategy}
                        </Button>
                    ))}
                </div>
            </div>

            <div style={{ marginTop: '16px', fontSize: '12px', color: '#666', borderTop: '1px solid #e8e8e8', paddingTop: '16px' }}>
                <div style={{ fontWeight: 500, marginBottom: '8px' }}>Legend:</div>
                <div style={{ lineHeight: '1.6' }}>
                    •
                    {' '}
                    <strong>A1:C3</strong>
                    {' '}
                    - Editable (can edit & view)
                    <br />
                    •
                    {' '}
                    <strong>E1:G3</strong>
                    {' '}
                    - Non-Editable (can view only)
                    <br />
                    •
                    {' '}
                    <strong>A5:C7</strong>
                    {' '}
                    - Non-Viewable (no access)
                    <br />
                    <br />
                    <div style={{ fontSize: '11px', color: '#999' }}>
                        Try different strategies to see how shadows change!
                    </div>
                </div>
            </div>
        </div>
    );
};
