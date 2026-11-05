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

import { IPermissionService } from '@univerjs/core';
import { WorksheetEditPermission } from '@univerjs/sheets';
import { describe, expect, it } from 'vitest';
import { createChartDrawingTestBed } from '../../__tests__/chart-drawing-test-bed';
import { ImageMenuFactory, UploadCellImageMenuFactory, UploadFloatImageMenuFactory } from '../image.menu';

describe('Chart image menu permission consumers', () => {
    it('enables only floating insertion on CHART and reacts to canonical worksheet permission', () => {
        const bed = createChartDrawingTestBed();
        const states: boolean[] = [];
        const subscriptions = [ImageMenuFactory, UploadFloatImageMenuFactory, UploadCellImageMenuFactory].map((factory, index) => factory(bed.injector).disabled$?.subscribe((value) => {
            states[index] = value;
        }));
        expect(states).toEqual([false, false, true]);
        bed.get(IPermissionService).updatePermissionPoint(new WorksheetEditPermission('test', 'chart').id, false);
        expect(states).toEqual([true, true, true]);
        bed.get(IPermissionService).updatePermissionPoint(new WorksheetEditPermission('test', 'chart').id, true);
        expect(states).toEqual([false, false, true]);
        subscriptions.forEach((subscription) => subscription?.unsubscribe());
    });
    it('disables floating image menus when the canonical worksheet edit point is missing', () => {
        const bed = createChartDrawingTestBed();
        bed.get(IPermissionService).deletePermissionPoint(new WorksheetEditPermission('test', 'chart').id);
        const values: boolean[] = [];
        const errors: unknown[] = [];
        const subscription = ImageMenuFactory(bed.injector).disabled$!.subscribe({ next: (value) => values.push(value), error: (error: unknown) => errors.push(error) });
        expect(errors).toEqual([]);
        expect(values).toEqual([true]);
        const point = new WorksheetEditPermission('test', 'chart');
        point.value = false;
        expect(bed.get(IPermissionService).addPermissionPoint(point)).toBe(true);
        expect(values[values.length - 1]).toBe(true);
        bed.get(IPermissionService).updatePermissionPoint(point.id, true);
        expect(values[values.length - 1]).toBe(false);
        bed.get(IPermissionService).updatePermissionPoint(point.id, false);
        expect(values[values.length - 1]).toBe(true);
        subscription.unsubscribe();
    });
});
