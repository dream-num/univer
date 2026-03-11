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

import type { LocaleService } from '@univerjs/core';
import type { DataValidatorRegistryService } from '@univerjs/data-validation';
import type { SheetInterceptorService } from '@univerjs/sheets';
import type { SheetDataValidationModel, SheetsDataValidationValidatorService } from '@univerjs/sheets-data-validation';
import type { IDialogService } from '@univerjs/ui';
import { DataValidationErrorStyle, DataValidationStatus } from '@univerjs/core';
import { VALIDATE_CELL } from '@univerjs/sheets';
import { describe, expect, it, vi } from 'vitest';
import { DataValidationRejectInputController } from '../dv-reject-input.controller';

interface IInterceptContext {
    row: number;
    col: number;
    unitId: string;
    subUnitId: string;
}

describe('DataValidationRejectInputController', () => {
    it('intercepts invalid STOP rules and opens a reject dialog, while allowing valid cases through', async () => {
        let interceptedHandler:
            | ((lastResult: Promise<boolean>, context: IInterceptContext, next: (value: Promise<boolean>) => Promise<boolean>) => Promise<boolean>)
            | undefined;
        const open = vi.fn();
        const close = vi.fn();
        const getRuleById = vi.fn(() => ({ type: 'list', errorStyle: DataValidationErrorStyle.STOP }));
        const model = {
            getRuleIdByLocation: vi.fn(() => 'rule-1'),
            getRuleById,
        };
        const validator = { getRuleFinalError: vi.fn(() => 'Invalid value') };
        const controller = new DataValidationRejectInputController(
            {
                writeCellInterceptor: {
                    intercept: vi.fn((name, config) => {
                        expect(name).toBe(VALIDATE_CELL);
                        interceptedHandler = config.handler;
                        return { dispose: vi.fn() };
                    }),
                },
            } as unknown as SheetInterceptorService,
            model as unknown as SheetDataValidationModel,
            { getValidatorItem: vi.fn(() => validator) } as unknown as DataValidatorRegistryService,
            { open, close } as unknown as IDialogService,
            { t: (key: string) => key } as LocaleService,
            {
                validatorCell: vi.fn()
                    .mockResolvedValueOnce(DataValidationStatus.INVALID)
                    .mockResolvedValueOnce(DataValidationStatus.VALID),
            } as unknown as SheetsDataValidationValidatorService
        );

        expect(controller).toBeTruthy();
        expect(interceptedHandler).toBeDefined();

        const next = (value: Promise<boolean>) => value;
        const context: IInterceptContext = { row: 1, col: 2, unitId: 'book-1', subUnitId: 'sheet-1' };

        await expect(interceptedHandler!(Promise.resolve(false), context, next)).resolves.toBe(false);
        expect(open).not.toHaveBeenCalled();

        await expect(interceptedHandler!(Promise.resolve(true), context, next)).resolves.toBe(false);
        expect(open).toHaveBeenCalledWith(expect.objectContaining({
            id: 'reject-input-dialog',
            children: { title: 'Invalid value' },
        }));

        await expect(interceptedHandler!(Promise.resolve(true), context, next)).resolves.toBe(true);

        getRuleById.mockReturnValue({ type: 'list', errorStyle: DataValidationErrorStyle.WARNING });
        await expect(interceptedHandler!(Promise.resolve(true), context, next)).resolves.toBe(true);

        controller.showReject('Bad input');
        expect(open).toHaveBeenLastCalledWith(expect.objectContaining({
            children: { title: 'Bad input' },
        }));
    });
});
