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

import { BooleanNumber, LocaleService, LocaleType } from '@univerjs/core';
import { afterEach, describe, expect, it } from 'vitest';
import type { HeaderUnhideShape } from '../../../views/header-unhide-shape';
import { HeaderUnhideRangeAxis, HeaderUnhideRangeService } from '../../../services/header-unhide-range.service';
import { HeaderUnhideRenderController } from '../header-unhide.render-controller';
import { createRenderTestBed } from './render-test-bed';

describe('HeaderUnhideRenderController', () => {
    const cleanups: Array<() => void> = [];
    afterEach(() => {
        for (const cleanup of cleanups.splice(0).reverse()) {
            cleanup();
        }
    });

    it('filters hidden row ranges and keeps hidden column icons at the bottom of expanded column headers', () => {
        const testBed = createRenderTestBed();
        cleanups.push(() => testBed.univer.dispose());
        testBed.get(LocaleService).setDirection('ltr');
        testBed.get(LocaleService).setLocale(LocaleType.EN_US);
        const { context, injector, sheet, sheetSkeletonManagerService, skeleton } = testBed;
        const worksheet = sheet.getActiveSheet()!;

        skeleton.columnHeaderHeight = 60;
        for (let row = 5; row <= 5; row++) {
            worksheet.getRowManager().getRowOrCreate(row).hd = BooleanNumber.TRUE;
        }
        for (let row = 8; row <= 8; row++) {
            worksheet.getRowManager().getRowOrCreate(row).hd = BooleanNumber.TRUE;
        }
        worksheet.getColumnManager().getColumnOrCreate(6).hd = BooleanNumber.TRUE;

        const createController = () => injector.createInstance(HeaderUnhideRenderController, context);
        injector.add([HeaderUnhideRenderController, { useFactory: createController }]);
        const controller = injector.get(HeaderUnhideRenderController);
        cleanups.push(() => controller.dispose());
        controller.interceptor.intercept(controller.interceptor.getInterceptPoints().HEADER_UNHIDE_RANGE_VISIBLE_CHECK, {
            handler: (_visible, range) => range.axis !== HeaderUnhideRangeAxis.ROW || range.range.startRow !== 5,
        });

        sheetSkeletonManagerService.emitCurrentSkeleton({
            unitId: sheet.getUnitId(),
            sheetId: worksheet.getSheetId(),
        });

        const shapes = (controller as unknown as { _shapes: { rows: HeaderUnhideShape[]; cols: HeaderUnhideShape[] } })._shapes;
        expect(shapes.rows).toHaveLength(1);
        expect(shapes.cols).toHaveLength(1);
        expect(shapes.cols[0].top).toBe(60 - 12);
    });

    it('keeps hidden column icons at the bottom of column headers when outline adds top padding', () => {
        const testBed = createRenderTestBed();
        cleanups.push(() => testBed.univer.dispose());
        testBed.get(LocaleService).setDirection('ltr');
        testBed.get(LocaleService).setLocale(LocaleType.EN_US);
        const { context, injector, sheet, sheetSkeletonManagerService, skeleton } = testBed;
        const worksheet = sheet.getActiveSheet()!;

        skeleton.columnHeaderHeight = 20;
        skeleton.columnHeaderHeightAndMarginTop = 60;

        worksheet.getColumnManager().getColumnOrCreate(6).hd = BooleanNumber.TRUE;

        const createController = () => injector.createInstance(HeaderUnhideRenderController, context);
        injector.add([HeaderUnhideRenderController, { useFactory: createController }]);
        const controller = injector.get(HeaderUnhideRenderController);
        cleanups.push(() => controller.dispose());

        sheetSkeletonManagerService.emitCurrentSkeleton({
            unitId: sheet.getUnitId(),
            sheetId: worksheet.getSheetId(),
        });

        const shapes = (controller as unknown as { _shapes: { rows: HeaderUnhideShape[]; cols: HeaderUnhideShape[] } })._shapes;
        expect(shapes.cols).toHaveLength(1);
        expect(shapes.cols[0].top).toBe(60 - 12);
    });

    it('filters hidden row ranges through the shared unhide range service', () => {
        const testBed = createRenderTestBed();
        cleanups.push(() => testBed.univer.dispose());
        testBed.get(LocaleService).setDirection('ltr');
        testBed.get(LocaleService).setLocale(LocaleType.EN_US);
        const { context, injector, sheet, sheetSkeletonManagerService, skeleton } = testBed;
        const worksheet = sheet.getActiveSheet()!;

        skeleton.columnHeaderHeight = 60;
        for (let row = 13; row <= 21; row++) {
            worksheet.getRowManager().getRowOrCreate(row).hd = BooleanNumber.TRUE;
        }
        for (let row = 30; row <= 31; row++) {
            worksheet.getRowManager().getRowOrCreate(row).hd = BooleanNumber.TRUE;
        }

        const registration = injector.get(HeaderUnhideRangeService).registerRangeVisibleHandler((visible, payload) => (
            visible && !(payload.axis === HeaderUnhideRangeAxis.ROW && payload.range.startRow === 13 && payload.range.endRow === 21)
        ));
        cleanups.push(() => registration.dispose());

        const createController = () => injector.createInstance(HeaderUnhideRenderController, context);
        injector.add([HeaderUnhideRenderController, { useFactory: createController }]);
        const controller = injector.get(HeaderUnhideRenderController);
        cleanups.push(() => controller.dispose());

        sheetSkeletonManagerService.emitCurrentSkeleton({
            unitId: sheet.getUnitId(),
            sheetId: worksheet.getSheetId(),
        });

        const shapes = (controller as unknown as { _shapes: { rows: HeaderUnhideShape[]; cols: HeaderUnhideShape[] } })._shapes;
        expect(shapes.rows).toHaveLength(1);
        expect(shapes.rows[0].top).toBe(30 * 20 - 12);
    });

    it('renders one button for adjacent hidden and zero-width columns, including sheet boundaries', () => {
        const testBed = createRenderTestBed();
        cleanups.push(() => testBed.univer.dispose());
        const { injector, context, sheet, sheetSkeletonManagerService } = testBed;
        testBed.get(LocaleService).setDirection('ltr');
        const worksheet = sheet.getActiveSheet()!;
        const manager = worksheet.getColumnManager();
        manager.setColumnWidth(0, 0);
        manager.getColumnOrCreate(1).hd = BooleanNumber.TRUE;
        manager.setColumnWidth(2, 0);
        manager.setColumnWidth(4, 1.5);
        manager.setColumnWidth(worksheet.getColumnCount() - 1, 0);
        const createController = () => injector.createInstance(HeaderUnhideRenderController, context);
        injector.add([HeaderUnhideRenderController, { useFactory: createController }]);
        const controller = injector.get(HeaderUnhideRenderController);
        cleanups.push(() => controller.dispose());
        sheetSkeletonManagerService.emitCurrentSkeleton({ unitId: sheet.getUnitId(), sheetId: worksheet.getSheetId() });
        const shapes = (controller as unknown as { _shapes: { cols: HeaderUnhideShape[] } })._shapes;
        expect(shapes.cols).toHaveLength(2);
        expect(shapes.cols[0].left).toBe(0);
        manager.setColumnWidth(0, worksheet.getConfig().defaultColumnWidth);
        manager.getColumnOrCreate(1).hd = BooleanNumber.FALSE;
        manager.setColumnWidth(2, worksheet.getConfig().defaultColumnWidth);
        manager.setColumnWidth(worksheet.getColumnCount() - 1, worksheet.getConfig().defaultColumnWidth);
        sheetSkeletonManagerService.emitCurrentSkeleton({ unitId: sheet.getUnitId(), sheetId: worksheet.getSheetId() });
        expect((controller as unknown as { _shapes: { cols: HeaderUnhideShape[] } })._shapes.cols).toHaveLength(0);
    });

    it('renders one button for adjacent hidden and zero-height rows and skips positive and filtered heights', () => {
        const testBed = createRenderTestBed();
        cleanups.push(() => testBed.univer.dispose());
        const { injector, context, sheet, sheetSkeletonManagerService } = testBed;
        testBed.get(LocaleService).setDirection('ltr');
        testBed.get(LocaleService).setLocale(LocaleType.EN_US);
        const worksheet = sheet.getActiveSheet()!;
        const manager = worksheet.getRowManager();
        manager.setRowHeight(0, 0);
        manager.getRowOrCreate(1).hd = BooleanNumber.TRUE;
        manager.setRowHeight(2, 0);
        manager.setRowHeight(4, 1.5);
        manager.setRowHeight(5, 0);
        manager.getRowOrCreate(5).ah = 40;
        manager.setRowHeight(6, 0);
        manager.setRowHeight(worksheet.getRowCount() - 1, 0);
        worksheet.__interceptViewModel((viewModel) => {
            const registration = viewModel.registerRowFilteredInterceptor({ getRowFiltered: (row) => row === 6 });
            cleanups.push(() => registration.dispose());
        });
        expect(worksheet.getRowVisible(6)).toBe(false);
        const createController = () => injector.createInstance(HeaderUnhideRenderController, context);
        injector.add([HeaderUnhideRenderController, { useFactory: createController }]);
        const controller = injector.get(HeaderUnhideRenderController);
        cleanups.push(() => controller.dispose());
        sheetSkeletonManagerService.emitCurrentSkeleton({ unitId: sheet.getUnitId(), sheetId: worksheet.getSheetId() });
        const shapes = (controller as unknown as { _shapes: { rows: HeaderUnhideShape[] } })._shapes;
        expect(shapes.rows).toHaveLength(2);
        expect(shapes.rows[0].top).toBe(0);
        manager.setRowHeight(0, worksheet.getConfig().defaultRowHeight);
        manager.getRowOrCreate(1).hd = BooleanNumber.FALSE;
        manager.setRowHeight(2, worksheet.getConfig().defaultRowHeight);
        manager.setRowHeight(worksheet.getRowCount() - 1, worksheet.getConfig().defaultRowHeight);
        sheetSkeletonManagerService.emitCurrentSkeleton({ unitId: sheet.getUnitId(), sheetId: worksheet.getSheetId() });
        expect((controller as unknown as { _shapes: { rows: HeaderUnhideShape[] } })._shapes.rows).toHaveLength(0);
    });

    it('applies both existing visibility filters to zero-height row buttons', () => {
        const testBed = createRenderTestBed();
        cleanups.push(() => testBed.univer.dispose());
        const { injector, context, sheet, sheetSkeletonManagerService } = testBed;
        testBed.get(LocaleService).setDirection('ltr');
        testBed.get(LocaleService).setLocale(LocaleType.EN_US);
        const worksheet = sheet.getActiveSheet()!;
        worksheet.getRowManager().setRowHeight(0, 0);
        worksheet.getRowManager().setRowHeight(3, 0);
        const registration = injector.get(HeaderUnhideRangeService).registerRangeVisibleHandler((visible, payload) => (
            visible && !(payload.axis === HeaderUnhideRangeAxis.ROW && payload.range.startRow === 3)
        ));
        cleanups.push(() => registration.dispose());
        const createController = () => injector.createInstance(HeaderUnhideRenderController, context);
        injector.add([HeaderUnhideRenderController, { useFactory: createController }]);
        const controller = injector.get(HeaderUnhideRenderController);
        cleanups.push(() => controller.dispose());
        controller.interceptor.intercept(controller.interceptor.getInterceptPoints().HEADER_UNHIDE_RANGE_VISIBLE_CHECK, {
            handler: (visible, payload) => visible && !(payload.axis === HeaderUnhideRangeAxis.ROW && payload.range.startRow === 0),
        });
        sheetSkeletonManagerService.emitCurrentSkeleton({ unitId: sheet.getUnitId(), sheetId: worksheet.getSheetId() });
        expect((controller as unknown as { _shapes: { rows: HeaderUnhideShape[] } })._shapes.rows).toHaveLength(0);
    });

    it('applies the existing visibility filter to zero-width column buttons', () => {
        const testBed = createRenderTestBed();
        cleanups.push(() => testBed.univer.dispose());
        const { injector, context, sheet } = testBed;
        testBed.get(LocaleService).setDirection('ltr');
        const worksheet = sheet.getActiveSheet()!;
        worksheet.getColumnManager().setColumnWidth(0, 0);
        const registration = injector.get(HeaderUnhideRangeService).registerRangeVisibleHandler((visible, payload) => (
            visible && payload.axis !== HeaderUnhideRangeAxis.COLUMN
        ));
        cleanups.push(() => registration.dispose());
        const createController = () => injector.createInstance(HeaderUnhideRenderController, context);
        injector.add([HeaderUnhideRenderController, { useFactory: createController }]);
        const controller = injector.get(HeaderUnhideRenderController);
        cleanups.push(() => controller.dispose());
        expect((controller as unknown as { _shapes: { cols: HeaderUnhideShape[] } })._shapes.cols).toHaveLength(0);
    });
});
