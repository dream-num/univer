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

export { UniverSheetsDrawingPlugin } from './plugin';
export { ISheetDrawingService, SheetDrawingAnchorType } from './services/sheet-drawing.service';
export { SHEET_DRAWING_PLUGIN } from './controllers/sheet-drawing.controller';
export type { IFloatDomData, ISheetDrawing, ISheetDrawingPosition, ISheetFloatDom, ISheetImage } from './services/sheet-drawing.service';

// #region - all commands
export { DrawingApplyType, type ISetDrawingApplyMutationParams, SetDrawingApplyMutation } from './commands/mutations/set-drawing-apply.mutation';
// #endregion
