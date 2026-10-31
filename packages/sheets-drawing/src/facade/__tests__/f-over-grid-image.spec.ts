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

import type { IDrawingSearch, Injector, IWorkbookData, Univer } from '@univerjs/core';
import {
    DrawingTypeEnum,
    ICommandService,
    ImageSourceType,
    IUndoRedoService,
    LocaleService,
    LocaleType,
    RedoCommand,
    Tools,
    UndoCommand,
} from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import { IDrawingManagerService } from '@univerjs/drawing';
import { SheetSkeletonService } from '@univerjs/sheets';
import enUS from '@univerjs/sheets/locale/en-US';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ISheetImage } from '../../services/sheet-drawing.service';
import { createSheetsDrawingTestBed } from '../../__tests__/create-sheets-drawing-test-bed';
import { InsertSheetDrawingCommand } from '../../commands/commands/insert-sheet-drawing.command';
import { SetSheetDrawingCommand } from '../../commands/commands/set-sheet-drawing.command';
import { ISheetDrawingService, SheetDrawingAnchorType } from '../../services/sheet-drawing.service';
import { FOverGridImage } from '../f-over-grid-image';
import '@univerjs/sheets/facade';
import '../f-event';
import '../f-univer';
import '../f-worksheet';

describe('FOverGridImage', () => {
    let univer: Univer;
    let injector: Injector;

    beforeEach(() => {
        const testBed = createSheetsDrawingTestBed();
        univer = testBed.univer;
        injector = testBed.injector;
    });

    afterEach(() => {
        univer.dispose();
    });

    it('creates a builder from the image unit and sheet ids', () => {
        const image: ISheetImage = {
            unitId: 'test',
            subUnitId: 'sheet1',
            drawingId: 'drawing-1',
            drawingType: DrawingTypeEnum.DRAWING_IMAGE,
            imageSourceType: ImageSourceType.URL,
            source: 'https://example.com/drawing-1.png',
            sheetTransform: {
                from: {
                    row: 1,
                    rowOffset: 0,
                    column: 1,
                    columnOffset: 0,
                },
                to: {
                    row: 4,
                    rowOffset: 0,
                    column: 3,
                    columnOffset: 0,
                },
            },
            axisAlignSheetTransform: {
                from: {
                    row: 1,
                    rowOffset: 0,
                    column: 1,
                    columnOffset: 0,
                },
                to: {
                    row: 4,
                    rowOffset: 0,
                    column: 3,
                    columnOffset: 0,
                },
            },
        };

        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        injector.get(SheetSkeletonService).ensureSkeleton('test', 'sheet1');

        const builder = injector.createInstance(FOverGridImage, image).toBuilder();

        expect(builder.getSource()).toBe('https://example.com/drawing-1.png');
        expect(builder.getSourceType()).toBe(ImageSourceType.URL);
        expect(builder.getOpacity()).toBe(1);
        expect(builder.setOpacity(0.4)).toBe(builder);
        expect(builder.getOpacity()).toBe(0.4);
        expect(() => builder.setOpacity(Number.NaN)).toThrow(RangeError);
        expect(() => builder.setOpacity(1.01)).toThrow(RangeError);
        expect(warnSpy).not.toHaveBeenCalledWith(expect.stringContaining('FOverGridImageBuilder but get 0'));

        warnSpy.mockRestore();
    });

    it('updates image data and removes the image through facade methods', async () => {
        const image = createImage();
        const commandService = injector.get(ICommandService);
        const sheetDrawingService = injector.get(ISheetDrawingService);
        expect(commandService.syncExecuteCommand(InsertSheetDrawingCommand.id, { unitId: 'test', drawings: [image] })).toBe(true);

        const fImage = injector.createInstance(FOverGridImage, image);

        expect(fImage.getOpacity()).toBe(1);
        expect(fImage.setOpacity(0)).toBe(true);
        expect(fImage.getOpacity()).toBe(0);
        expect(fImage.setOpacity(1)).toBe(true);
        expect(getStoredImage('drawing-1').opacity).toBe(1);
        expect(() => fImage.setOpacity(Number.POSITIVE_INFINITY)).toThrow(RangeError);
        expect(() => fImage.setOpacity(-0.01)).toThrow(RangeError);

        expect(fImage.setSource('https://example.com/updated.png', ImageSourceType.URL)).toBe(true);
        expect(getStoredImage('drawing-1').source).toBe('https://example.com/updated.png');

        expect(await fImage.setPositionAsync(4, 5, 6, 7)).toBe(true);
        expect(getStoredImage('drawing-1').sheetTransform.from).toEqual(expect.objectContaining({
            row: 4,
            column: 5,
            rowOffset: 6,
            columnOffset: 7,
        }));

        expect(await fImage.setSizeAsync(160, 90)).toBe(true);
        expect(getStoredImage('drawing-1').transform).toEqual(expect.objectContaining({
            width: 160,
            height: 90,
        }));

        expect(fImage.setCrop(1, 2, 3, 4)).toBe(true);
        expect(getStoredImage('drawing-1').srcRect).toEqual({ top: 1, left: 2, bottom: 3, right: 4 });

        expect(fImage.setRotate(30)).toBe(true);
        expect(getStoredImage('drawing-1').sheetTransform.angle).toBe(30);

        expect(fImage.setForward()).toBe(true);
        expect(fImage.setBackward()).toBe(true);
        expect(fImage.setFront()).toBe(true);
        expect(fImage.setBack()).toBe(true);

        expect(fImage.remove()).toBe(true);
        expect(sheetDrawingService.getDrawingByParam({ unitId: 'test', subUnitId: 'sheet1', drawingId: 'drawing-1' })).toBeUndefined();
    });

    it('updates stored image sources with notifications, reversible history, and snapshot round trips', () => {
        const localeService = injector.get(LocaleService);
        localeService.load({ [LocaleType.EN_US]: enUS });
        localeService.setLocale(LocaleType.EN_US);
        localeService.setDirection('ltr');
        const api = FUniver.newAPI(injector);
        const workbook = api.getWorkbook('test')!;
        const worksheet = workbook.getSheetBySheetId('sheet1')!;
        const secondSheet = workbook.getSheetBySheetId('sheet2')!;
        const commandService = injector.get(ICommandService);
        const drawingService = injector.get(ISheetDrawingService);
        const drawingManager = injector.get(IDrawingManagerService);
        const history = injector.get(IUndoRedoService);
        const search = { unitId: 'test', subUnitId: 'sheet1', drawingId: 'drawing-1' };
        const updates: { objects: IDrawingSearch[]; image: ISheetImage }[] = [];
        const subscription = drawingService.update$.subscribe((objects) => {
            updates.push({ objects, image: Tools.deepClone(getStoredImage('drawing-1')) });
        });

        try {
            worksheet.insertImages([createImage()]);
            const secondImage = { ...createImage(), source: 'https://example.com/second-sheet.png' };
            secondSheet.insertImages([secondImage]);
            const secondWorkbook = api.createWorkbook({
                id: 'image-w2',
                locale: LocaleType.EN_US,
                sheetOrder: ['sheet1'],
                sheets: { sheet1: { id: 'sheet1', name: 'Sheet1', rowCount: 20, columnCount: 20, cellData: {} } },
            }, { makeCurrent: false });
            const secondWorksheet = secondWorkbook.getSheetBySheetId('sheet1')!;
            secondWorksheet.insertImages([{ ...createImage(), source: 'https://example.com/second-workbook.png' }]);
            const secondRange = secondWorksheet.getRange('A1');
            secondRange.setValue(11);
            secondRange.setValue(22);
            secondWorkbook.undo();
            expect(secondRange.getValue()).toBe(11);
            const secondSnapshot = JSON.parse(JSON.stringify(secondWorkbook.save())) as IWorkbookData;
            const secondHistory = history.getUndoRedoStatus('image-w2');
            expect(secondHistory).toEqual({ undos: 2, redos: 1 });
            const original = Tools.deepClone(getStoredImage('drawing-1'));
            const other = Tools.deepClone(drawingService.getDrawingByParam({ ...search, subUnitId: 'sheet2' }));
            const image = worksheet.getImageById('drawing-1')!;
            history.clearUndoRedo('test');

            const accepted = { ...original, source: 'data:image/png;base64,Ymx1ZQ==', imageSourceType: ImageSourceType.BASE64 };
            expect(image.setSource(accepted.source, ImageSourceType.BASE64)).toBe(true);
            expect(updates).toEqual([{ objects: [search], image: accepted }]);
            expect(getStoredImage('drawing-1')).toEqual(accepted);
            expect(drawingManager.getDrawingByParam(search)).toEqual(accepted);
            expect(history.getUndoRedoStatus('test')).toEqual({ undos: 1, redos: 0 });
            expect(image.toBuilder().getSource()).toBe(accepted.source);
            expect(image.toBuilder().getSourceType()).toBe(ImageSourceType.BASE64);

            workbook.undo();
            expect(getStoredImage('drawing-1')).toEqual(original);
            expect(drawingManager.getDrawingByParam(search)).toEqual(original);
            expect(image.toBuilder().getSource()).toBe(original.source);
            expect(image.toBuilder().getSourceType()).toBe(ImageSourceType.URL);
            expect(history.getUndoRedoStatus('test')).toEqual({ undos: 0, redos: 1 });
            workbook.redo();
            expect(getStoredImage('drawing-1')).toEqual(accepted);
            expect(updates).toEqual([
                { objects: [search], image: accepted },
                { objects: [search], image: original },
                { objects: [search], image: accepted },
            ]);

            const geometry = {
                ...accepted,
                opacity: 0.4,
                transform: { left: 77, top: 88, width: 160, height: 90 },
                sheetTransform: {
                    from: { row: 4, column: 5, rowOffset: 6, columnOffset: 7 },
                    to: { row: 8, column: 9, rowOffset: 10, columnOffset: 11 },
                },
                axisAlignSheetTransform: {
                    from: { row: 4, column: 5, rowOffset: 6, columnOffset: 7 },
                    to: { row: 8, column: 9, rowOffset: 10, columnOffset: 11 },
                },
            };
            expect(commandService.syncExecuteCommand(SetSheetDrawingCommand.id, {
                unitId: 'test',
                drawings: [{
                    ...search,
                    transform: geometry.transform,
                    sheetTransform: geometry.sheetTransform,
                    axisAlignSheetTransform: geometry.axisAlignSheetTransform,
                    opacity: geometry.opacity,
                }],
            })).toBe(true);
            const latest = { ...geometry, source: 'https://example.com/latest.png', imageSourceType: ImageSourceType.URL };
            expect(image.setSource(latest.source)).toBe(true);
            expect(getStoredImage('drawing-1')).toEqual(latest);
            expect(drawingManager.getDrawingByParam(search)).toEqual(latest);
            expect(updates[updates.length - 1]).toEqual({ objects: [search], image: latest });
            expect(history.getUndoRedoStatus('test')).toEqual({ undos: 3, redos: 0 });
            expect(image.toBuilder().getOpacity()).toBe(0.4);
            workbook.undo();
            expect(getStoredImage('drawing-1')).toEqual(geometry);
            expect(image.toBuilder().getSource()).toBe(accepted.source);
            workbook.undo();
            expect(getStoredImage('drawing-1')).toEqual(accepted);
            expect(image.toBuilder().getOpacity()).toBe(1);
            workbook.redo();
            workbook.redo();
            expect(getStoredImage('drawing-1')).toEqual(latest);
            expect(drawingService.getDrawingByParam({ ...search, subUnitId: 'sheet2' })).toEqual(other);
            expect(JSON.parse(JSON.stringify(secondWorkbook.save()))).toEqual(secondSnapshot);
            expect(history.getUndoRedoStatus('image-w2')).toEqual(secondHistory);

            const snapshot = JSON.parse(JSON.stringify(workbook.save())) as IWorkbookData;
            const reopened = createSheetsDrawingTestBed(snapshot);
            const reopenedLocale = reopened.injector.get(LocaleService);
            reopenedLocale.load({ [LocaleType.EN_US]: enUS });
            reopenedLocale.setLocale(LocaleType.EN_US);
            reopenedLocale.setDirection('ltr');
            const reopenedAPI = FUniver.newAPI(reopened.injector);
            try {
                const reopenedDrawings = reopened.injector.get(ISheetDrawingService);
                const reopenedManager = reopened.injector.get(IDrawingManagerService);
                const reopenedHistory = reopened.injector.get(IUndoRedoService);
                const reopenedCommands = reopened.injector.get(ICommandService);
                const reopenedImage = reopenedAPI.getWorkbook('test')!.getSheetBySheetId('sheet1')!.getImageById('drawing-1')!;
                expect(reopenedDrawings.getDrawingByParam(search)).toEqual(latest);
                expect(reopenedHistory.getUndoRedoStatus('test')).toEqual({ undos: 0, redos: 0 });
                expect(reopenedImage.toBuilder().getSource()).toBe(latest.source);
                const finalImage = { ...latest, source: 'data:image/png;base64,ZmluYWw=', imageSourceType: ImageSourceType.BASE64 };
                expect(reopenedImage.setSource(finalImage.source, ImageSourceType.BASE64)).toBe(true);
                expect(reopenedDrawings.getDrawingByParam(search)).toEqual(finalImage);
                expect(reopenedManager.getDrawingByParam(search)).toEqual(finalImage);
                expect(reopenedHistory.getUndoRedoStatus('test')).toEqual({ undos: 1, redos: 0 });
                expect(reopenedCommands.syncExecuteCommand(UndoCommand.id)).toBe(true);
                expect(reopenedDrawings.getDrawingByParam(search)).toEqual(latest);
                expect(reopenedCommands.syncExecuteCommand(RedoCommand.id)).toBe(true);
                expect(reopenedDrawings.getDrawingByParam(search)).toEqual(finalImage);
                expect(reopenedDrawings.getDrawingByParam({ ...search, subUnitId: 'sheet2' })).toEqual(other);
                expect(getStoredImage('drawing-1')).toEqual(latest);
                expect(JSON.parse(JSON.stringify(workbook.save()))).toEqual(snapshot);
                expect(history.getUndoRedoStatus('test')).toEqual({ undos: 3, redos: 0 });
                expect(JSON.parse(JSON.stringify(secondWorkbook.save()))).toEqual(secondSnapshot);
                expect(history.getUndoRedoStatus('image-w2')).toEqual(secondHistory);
                secondWorkbook.redo();
                expect(secondRange.getValue()).toBe(22);
                secondWorkbook.undo();
                expect(secondRange.getValue()).toBe(11);
                expect(JSON.parse(JSON.stringify(secondWorkbook.save()))).toEqual(secondSnapshot);
                expect(history.getUndoRedoStatus('image-w2')).toEqual(secondHistory);
            } finally {
                reopenedAPI.dispose();
                reopened.univer.dispose();
            }
        } finally {
            subscription.unsubscribe();
            api.dispose();
        }
    });

    it('leaves stored sources unchanged when a public before-change listener rejects the update', () => {
        const localeService = injector.get(LocaleService);
        localeService.load({ [LocaleType.EN_US]: enUS });
        localeService.setLocale(LocaleType.EN_US);
        localeService.setDirection('ltr');
        const api = FUniver.newAPI(injector);
        const worksheet = api.getWorkbook('test')!.getSheetBySheetId('sheet1')!;
        const history = injector.get(IUndoRedoService);
        const updates: IDrawingSearch[][] = [];
        const changedSources: string[] = [];
        const subscription = injector.get(ISheetDrawingService).update$.subscribe((objects) => updates.push(objects));
        const changed = api.addEvent(api.Event.OverGridImageChanged, (event) => {
            changedSources.push(event.images[0].toBuilder().getSource());
        });
        const refused = api.addEvent(api.Event.BeforeOverGridImageChange, (event) => {
            event.cancel = true;
        });

        try {
            worksheet.insertImages([createImage()]);
            const original = Tools.deepClone(getStoredImage('drawing-1'));
            const image = worksheet.getImageById('drawing-1')!;
            history.clearUndoRedo('test');
            expect(image.setSource('data:image/png;base64,cmVmdXNlZA==', ImageSourceType.BASE64)).toBe(false);
            expect(getStoredImage('drawing-1')).toEqual(original);
            expect(image.toBuilder().getSource()).toBe(original.source);
            expect(history.getUndoRedoStatus('test')).toEqual({ undos: 0, redos: 0 });
            expect(updates).toEqual([]);
            expect(changedSources).toEqual([]);

            const draft = worksheet.newOverGridImage();
            expect(draft.setSource('https://example.com/draft.png')).toBe(draft);
            expect(draft.getSource()).toBe('https://example.com/draft.png');
            expect(draft.getSourceType()).toBe(ImageSourceType.URL);
            expect(worksheet.getImages()).toHaveLength(1);
            expect(getStoredImage('drawing-1')).toEqual(original);
            expect(history.getUndoRedoStatus('test')).toEqual({ undos: 0, redos: 0 });
        } finally {
            refused.dispose();
            changed.dispose();
            subscription.unsubscribe();
            api.dispose();
        }
    });

    it('preserves the latest source and geometry through subsequent crop and rotation edits', () => {
        const localeService = injector.get(LocaleService);
        localeService.load({ [LocaleType.EN_US]: enUS });
        localeService.setLocale(LocaleType.EN_US);
        localeService.setDirection('ltr');
        const api = FUniver.newAPI(injector);
        const worksheet = api.getWorkbook('test')!.getSheetBySheetId('sheet1')!;
        const commandService = injector.get(ICommandService);
        const history = injector.get(IUndoRedoService);
        const original = { ...createImage(), srcRect: { top: 1, left: 2, bottom: 3, right: 4 } };

        try {
            worksheet.insertImages([original]);
            const image = worksheet.getImages()[0];
            history.clearUndoRedo('test');
            const source = 'data:image/png;base64,Ymx1ZQ==';
            expect(image.setSource(source, ImageSourceType.BASE64)).toBe(true);
            expect(image.setPlacement({
                kind: SheetDrawingAnchorType.None,
                left: 120,
                top: 80,
                width: 160,
                height: 90,
            })).toBe(true);
            const resized = Tools.deepClone(getStoredImage('drawing-1'));
            expect(resized).toEqual(expect.objectContaining({
                source,
                imageSourceType: ImageSourceType.BASE64,
                anchorType: SheetDrawingAnchorType.None,
                transform: expect.objectContaining({ left: 120, top: 80, width: 160, height: 90 }),
            }));
            const cropped = { ...resized, srcRect: { top: 5, left: 7, bottom: 3, right: 4 } };
            expect(image.setCrop(5, 7)).toBe(true);
            expect(getStoredImage('drawing-1')).toEqual(cropped);
            expect(history.getUndoRedoStatus('test')).toEqual({ undos: 3, redos: 0 });
            expect(commandService.syncExecuteCommand(UndoCommand.id)).toBe(true);
            expect(getStoredImage('drawing-1')).toEqual(resized);
            expect(commandService.syncExecuteCommand(RedoCommand.id)).toBe(true);
            expect(getStoredImage('drawing-1')).toEqual(cropped);

            expect(image.setRotate(30)).toBe(true);
            const rotated = Tools.deepClone(getStoredImage('drawing-1'));
            expect(rotated).toEqual({
                ...cropped,
                transform: { ...cropped.transform, angle: 30 },
                sheetTransform: { ...cropped.sheetTransform, angle: 30 },
                axisAlignSheetTransform: expect.any(Object),
            });
            expect(history.getUndoRedoStatus('test')).toEqual({ undos: 4, redos: 0 });
            expect(commandService.syncExecuteCommand(UndoCommand.id)).toBe(true);
            expect(getStoredImage('drawing-1')).toEqual(cropped);
            expect(commandService.syncExecuteCommand(RedoCommand.id)).toBe(true);
            expect(getStoredImage('drawing-1')).toEqual(rotated);
            expect(commandService.syncExecuteCommand(UndoCommand.id)).toBe(true);
            expect(commandService.syncExecuteCommand(UndoCommand.id)).toBe(true);
            expect(getStoredImage('drawing-1')).toEqual(resized);
        } finally {
            api.dispose();
        }
    });

    it('resizes Absolute images without changing canvas position or other metadata', async () => {
        const localeService = injector.get(LocaleService);
        localeService.load({ [LocaleType.EN_US]: enUS });
        localeService.setLocale(LocaleType.EN_US);
        localeService.setDirection('ltr');
        const api = FUniver.newAPI(injector);
        const worksheet = api.getWorkbook('test')!.getSheetBySheetId('sheet1')!;
        const commandService = injector.get(ICommandService);
        const history = injector.get(IUndoRedoService);

        try {
            worksheet.insertImages([{ ...createImage(), opacity: 0.4, srcRect: { top: 1, left: 2, bottom: 3, right: 4 } }]);
            const image = worksheet.getImageById('drawing-1')!;
            expect(image.setPlacement({
                kind: SheetDrawingAnchorType.None,
                left: 120,
                top: 80,
                width: 100,
                height: 60,
            })).toBe(true);
            const placed = Tools.deepClone(getStoredImage('drawing-1'));
            history.clearUndoRedo('test');
            const expected = {
                ...placed,
                transform: { ...placed.transform, width: 160, height: 90 },
                sheetTransform: {
                    ...placed.sheetTransform,
                    to: { row: 0, column: 0, rowOffset: 170, columnOffset: 280 },
                },
                axisAlignSheetTransform: {
                    ...placed.axisAlignSheetTransform,
                    to: { row: 0, column: 0, rowOffset: 170, columnOffset: 280 },
                },
            };
            expect(await image.setSizeAsync(160, 90)).toBe(true);
            expect(getStoredImage('drawing-1')).toEqual(expected);
            expect(image.getPlacement()).toEqual({
                kind: SheetDrawingAnchorType.None,
                left: 120,
                top: 80,
                width: 160,
                height: 90,
            });
            expect(history.getUndoRedoStatus('test')).toEqual({ undos: 1, redos: 0 });
            expect(commandService.syncExecuteCommand(UndoCommand.id)).toBe(true);
            expect(getStoredImage('drawing-1')).toEqual(placed);
            expect(commandService.syncExecuteCommand(RedoCommand.id)).toBe(true);
            expect(getStoredImage('drawing-1')).toEqual(expected);
        } finally {
            api.dispose();
        }
    });

    it('infers zero Absolute dimensions while preserving current metadata and rejecting stale image loads', async () => {
        const localeService = injector.get(LocaleService);
        localeService.load({ [LocaleType.EN_US]: enUS });
        localeService.setLocale(LocaleType.EN_US);
        localeService.setDirection('ltr');
        const api = FUniver.newAPI(injector);
        const worksheet = api.getWorkbook('test')!.getSheetBySheetId('sheet1')!;
        const commandService = injector.get(ICommandService);
        const history = injector.get(IUndoRedoService);
        vi.stubGlobal('Image', class {
            width = 320;
            height = 180;
            onload: (() => void) | null = null;
            private _source = '';

            get src(): string {
                return this._source;
            }

            set src(source: string) {
                this._source = source;
                setTimeout(() => this.onload?.(), 0);
            }
        });

        try {
            worksheet.insertImages([{ ...createImage(), srcRect: { top: 1, left: 2, bottom: 3, right: 4 } }]);
            const image = worksheet.getImageById('drawing-1')!;
            expect(image.setPlacement({
                kind: SheetDrawingAnchorType.None,
                left: 20,
                top: 30,
                width: 100,
                height: 60,
            })).toBe(true);
            history.clearUndoRedo('test');
            const pendingWidth = image.setSizeAsync(0, 90);
            expect(image.setPlacement({
                kind: SheetDrawingAnchorType.None,
                left: 120,
                top: 80,
                width: 100,
                height: 60,
            })).toBe(true);
            expect(image.setOpacity(0.6)).toBe(true);
            const original = Tools.deepClone(getStoredImage('drawing-1'));
            const inferredWidth = {
                ...original,
                transform: { ...original.transform, width: 320, height: 90 },
                sheetTransform: {
                    ...original.sheetTransform,
                    to: { row: 0, column: 0, rowOffset: 170, columnOffset: 440 },
                },
                axisAlignSheetTransform: {
                    ...original.axisAlignSheetTransform,
                    to: { row: 0, column: 0, rowOffset: 170, columnOffset: 440 },
                },
            };
            await expect(pendingWidth).resolves.toBe(true);
            expect(getStoredImage('drawing-1')).toEqual(inferredWidth);
            expect(history.getUndoRedoStatus('test')).toEqual({ undos: 3, redos: 0 });
            expect(commandService.syncExecuteCommand(UndoCommand.id)).toBe(true);
            expect(getStoredImage('drawing-1')).toEqual(original);
            expect(commandService.syncExecuteCommand(RedoCommand.id)).toBe(true);
            expect(getStoredImage('drawing-1')).toEqual(inferredWidth);

            const inferredHeight = {
                ...inferredWidth,
                transform: { ...inferredWidth.transform, width: 160, height: 180 },
                sheetTransform: {
                    ...inferredWidth.sheetTransform,
                    to: { row: 0, column: 0, rowOffset: 260, columnOffset: 280 },
                },
                axisAlignSheetTransform: {
                    ...inferredWidth.axisAlignSheetTransform,
                    to: { row: 0, column: 0, rowOffset: 260, columnOffset: 280 },
                },
            };
            expect(await image.setSizeAsync(160, 0)).toBe(true);
            expect(getStoredImage('drawing-1')).toEqual(inferredHeight);
            expect(image.getPlacement()).toEqual({
                kind: SheetDrawingAnchorType.None,
                left: 120,
                top: 80,
                width: 160,
                height: 180,
            });
            expect(history.getUndoRedoStatus('test')).toEqual({ undos: 4, redos: 0 });
            expect(commandService.syncExecuteCommand(UndoCommand.id)).toBe(true);
            expect(getStoredImage('drawing-1')).toEqual(inferredWidth);
            expect(commandService.syncExecuteCommand(RedoCommand.id)).toBe(true);
            expect(getStoredImage('drawing-1')).toEqual(inferredHeight);

            const pendingSource = image.setSizeAsync(0, 90);
            const changedSource = { ...inferredHeight, source: 'data:image/png;base64,Ymx1ZQ==', imageSourceType: ImageSourceType.BASE64 };
            expect(image.setSource(changedSource.source, ImageSourceType.BASE64)).toBe(true);
            const sourceHistory = history.getUndoRedoStatus('test');
            expect(await pendingSource).toBe(false);
            expect(getStoredImage('drawing-1')).toEqual(changedSource);
            expect(history.getUndoRedoStatus('test')).toEqual(sourceHistory);

            const pendingRemoval = image.setSizeAsync(160, 0);
            expect(image.remove()).toBe(true);
            const removalHistory = history.getUndoRedoStatus('test');
            expect(await pendingRemoval).toBe(false);
            expect(worksheet.getImageById('drawing-1')).toBeNull();
            expect(history.getUndoRedoStatus('test')).toEqual(removalHistory);
        } finally {
            vi.unstubAllGlobals();
            api.dispose();
        }
    });

    function getStoredImage(drawingId: string): ISheetImage {
        const image = injector.get(ISheetDrawingService).getDrawingByParam({
            unitId: 'test',
            subUnitId: 'sheet1',
            drawingId,
        }) as ISheetImage | undefined;

        if (!image) {
            throw new Error(`Image ${drawingId} was not stored`);
        }

        return image;
    }
});

function createImage(): ISheetImage {
    return {
        unitId: 'test',
        subUnitId: 'sheet1',
        drawingId: 'drawing-1',
        drawingType: DrawingTypeEnum.DRAWING_IMAGE,
        imageSourceType: ImageSourceType.URL,
        source: 'https://example.com/drawing-1.png',
        transform: {
            left: 20,
            top: 30,
            width: 100,
            height: 60,
        },
        sheetTransform: {
            from: {
                row: 1,
                rowOffset: 0,
                column: 1,
                columnOffset: 0,
            },
            to: {
                row: 4,
                rowOffset: 0,
                column: 3,
                columnOffset: 0,
            },
        },
        axisAlignSheetTransform: {
            from: {
                row: 1,
                rowOffset: 0,
                column: 1,
                columnOffset: 0,
            },
            to: {
                row: 4,
                rowOffset: 0,
                column: 3,
                columnOffset: 0,
            },
        },
    };
}
