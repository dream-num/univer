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

import type { IDisposable } from '@univerjs/core';
import type { IBoundRectNoAngle, IMouseEvent, IPointerEvent } from '@univerjs/engine-render';
import type { IMobileDocElementMenuProps } from '../views/mobile-element-menu/MobileDocElementMenu';
import { Disposable, Inject, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { MOBILE_DOC_ELEMENT_MENU } from '../views/mobile-element-menu/MobileDocElementMenu';
import { DocCanvasPopManagerService } from './doc-popup-manager.service';

export interface IDocMobileElementTarget extends IMobileDocElementMenuProps {
    unitId: string;
    rect: IBoundRectNoAngle;
    onTap?: (offset: { offsetX: number; offsetY: number }) => void;
    onDrag?: (event: IPointerEvent | IMouseEvent) => void;
}

/** Element hit testing stays in its plugin; the document owns tap-versus-scroll recognition. */
export class DocMobileElementMenuService extends Disposable {
    private _pending: IDocMobileElementTarget | null = null;
    private _editingBounds: { unitId: string; rect: IBoundRectNoAngle } | null = null;
    private _popup: IDisposable | null = null;
    private _unitId: string | null = null;

    constructor(
        @Inject(DocCanvasPopManagerService) private readonly _popupService: DocCanvasPopManagerService,
        @IUniverInstanceService instanceService: IUniverInstanceService
    ) {
        super();
        this.disposeWithMe(instanceService.getTypeOfUnitDisposed$(UniverInstanceType.UNIVER_DOC).subscribe((unit) => {
            if (this._unitId === unit.getUnitId()) {
                this.close();
            }
            if (this._pending?.unitId === unit.getUnitId()) {
                this._pending = null;
            }
            if (this._editingBounds?.unitId === unit.getUnitId()) {
                this._editingBounds = null;
            }
        }));
    }

    capture(target: IDocMobileElementTarget): boolean {
        this._pending = target;
        // A hit not consumed by the document gesture must not leak into the next touch.
        queueMicrotask(() => {
            if (this._pending === target) {
                this._pending = null;
            }
        });
        return true;
    }

    takeTarget(unitId: string): IDocMobileElementTarget | null {
        const target = this._pending;
        this._pending = null;
        const current = target?.unitId === unitId ? target : null;
        this._editingBounds = current;
        return current;
    }

    setEditingBounds(unitId: string, rect: IBoundRectNoAngle): void {
        this._editingBounds = { unitId, rect };
    }

    getEditingBounds(unitId: string): IBoundRectNoAngle | null {
        return this._editingBounds?.unitId === unitId ? this._editingBounds.rect : null;
    }

    show(target: IDocMobileElementTarget): void {
        this.close();
        this.setEditingBounds(target.unitId, target.rect);
        this._unitId = target.unitId;
        this._popup = this._popupService.attachPopupToRect(target.rect, {
            componentKey: MOBILE_DOC_ELEMENT_MENU,
            direction: 'top-center',
            onClickOutside: () => this.close(),
            extraProps: {
                onEdit: () => {
                    this.close();
                    return target.onEdit();
                },
                onDelete: () => {
                    this.close();
                    return target.onDelete();
                },
            },
        }, target.unitId);
    }

    close(): void {
        this._popup?.dispose();
        this._popup = null;
        this._unitId = null;
    }

    override dispose(): void {
        this._pending = null;
        this._editingBounds = null;
        this.close();
        super.dispose();
    }
}
