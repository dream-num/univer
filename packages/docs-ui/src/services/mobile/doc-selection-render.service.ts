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

import type { DocumentDataModel } from '@univerjs/core';
import type { IMouseEvent, IPointerEvent, IRenderContext } from '@univerjs/engine-render';
import type { MobileTextRangeHandleType } from './mobile-text-selection-visuals';
import {
    DisposableCollection,
    IContextService,
    ILogService,
    Inject,
    isInternalEditorID,
    IUniverInstanceService,
    Optional,
} from '@univerjs/core';
import { DocSelectionManagerService, DocSkeletonManagerService } from '@univerjs/docs';
import { getSystemHighlightColor, ScrollTimer } from '@univerjs/engine-render';
import { ILayoutService } from '@univerjs/ui';
import { BehaviorSubject, distinctUntilChanged, map } from 'rxjs';
import { neoGetDocObject } from '../../basics/component-tools';
import { IDocEmbedInteractionBoundaryService, IDocEmbedRuntimeFocusCoordinator } from '../doc-embed-integration.service';
import { DocSelectionRenderService } from '../selection/doc-selection-render.service';
import { MobileTextSelectionVisuals } from './mobile-text-selection-visuals';

const MOBILE_KEYBOARD_THRESHOLD = 80;
const MOBILE_INPUT_VIEWPORT_INSET = 1;

export class MobileDocSelectionRenderService extends DocSelectionRenderService {
    private readonly _handleDragDisposables = new DisposableCollection();
    private readonly _selectionVisuals: MobileTextSelectionVisuals;
    private readonly _keyboardState$ = new BehaviorSubject({ visible: false, inset: 0 });
    private readonly _editMode$ = new BehaviorSubject(false);
    private _viewportBaselineHeight = 0;
    private _viewportBaselineBottom = 0;
    private _viewportBaselineWidth = 0;
    private _pendingBlurEvent: Event | null = null;
    readonly mobileKeyboardState$ = this._keyboardState$.asObservable();
    readonly mobileKeyboardVisible$ = this.mobileKeyboardState$.pipe(
        map(({ visible }) => visible),
        distinctUntilChanged()
    );

    readonly mobileEditMode$ = this._editMode$.asObservable();

    get isMobileEditMode() {
        return this._editMode$.value;
    }

    constructor(
        context: IRenderContext<DocumentDataModel>,
        @ILayoutService layoutService: ILayoutService,
        @ILogService logService: ILogService,
        @IContextService contextService: IContextService,
        @IUniverInstanceService univerInstanceService: IUniverInstanceService,
        @Inject(DocSkeletonManagerService) private readonly _mobileDocSkeletonManagerService: DocSkeletonManagerService,
        @Inject(DocSelectionManagerService) docSelectionManagerService: DocSelectionManagerService,
        @Optional(IDocEmbedInteractionBoundaryService) embedInteractionBoundaryService?: IDocEmbedInteractionBoundaryService,
        @Optional(IDocEmbedRuntimeFocusCoordinator) embedRuntimeFocusCoordinator?: IDocEmbedRuntimeFocusCoordinator
    ) {
        super(
            context,
            layoutService,
            logService,
            contextService,
            univerInstanceService,
            _mobileDocSkeletonManagerService,
            docSelectionManagerService,
            embedInteractionBoundaryService,
            embedRuntimeFocusCoordinator
        );

        this._selectionVisuals = new MobileTextSelectionVisuals(this._context.scene);
        this.disposeWithMe(this.textSelectionInner$.subscribe(() => this._syncMobileSelectionVisuals()));
        this._initMobileKeyboardViewport();
    }

    override cancelPointerSelection(): void {
        this._handleDragDisposables.dispose();
        super.cancelPointerSelection();
    }

    enterMobileEditMode(shouldFocusInput = false): boolean {
        this._editMode$.next(true);
        return shouldFocusInput ? this.enterEditing() : true;
    }

    suspendMobileEditingInput(): void {
        this.blur();
    }

    exitMobileEditMode(): void {
        this._editMode$.next(false);
        this.exitEditing();
    }

    override refreshRanges(): void {
        super.refreshRanges();
        this._syncMobileSelectionVisuals();
    }

    protected override _positionInput(_x: number, _y: number) {
        // Keep the hidden editor inside the Portal subtree when possible to avoid focus-trap loops,
        // then compensate coordinates if a transformed ancestor changes the fixed containing block.
        this._ensureHostContainer();
        this._container.style.position = 'fixed';
        const visualViewport = typeof window === 'undefined' ? null : window.visualViewport;
        let left = MOBILE_INPUT_VIEWPORT_INSET;
        let top = MOBILE_INPUT_VIEWPORT_INSET;
        const fixedContainer = this._container.offsetParent;
        if (fixedContainer) {
            const rect = fixedContainer.getBoundingClientRect();
            left -= rect.left;
            top -= rect.top;
        } else {
            left += visualViewport?.offsetLeft ?? 0;
            top += visualViewport?.offsetTop ?? 0;
        }

        this._container.style.left = `${left}px`;
        this._container.style.top = `${top}px`;
        this._container.style.zIndex = '1000';
    }

    private _syncMobileSelectionVisuals(): void {
        const activeRange = this._getActiveRangeInstance();
        this._selectionVisuals.hide();
        for (const range of this._rangeList) {
            const caret = range.getAnchor();
            if (this.isEditing && range === activeRange) {
                caret?.show();
            } else {
                caret?.hide();
            }
        }

        if (!activeRange || activeRange.collapsed || this.isEditing) {
            return;
        }

        const { document } = neoGetDocObject(this._context);
        if (!document) {
            return;
        }

        const { r, g, b } = getSystemHighlightColor();
        this._selectionVisuals.show(
            activeRange,
            document,
            this._mobileDocSkeletonManagerService.getSkeleton(),
            `rgb(${r}, ${g}, ${b})`,
            (handle, event) => this._startSelectionHandleDrag(handle, event)
        );
    }

    private _initMobileKeyboardViewport(): void {
        if (
            typeof window === 'undefined' ||
            !window.visualViewport
        ) {
            return;
        }

        const visualViewport = window.visualViewport;
        this._viewportBaselineHeight = visualViewport.height;
        this._viewportBaselineBottom = visualViewport.offsetTop + visualViewport.height;
        this._viewportBaselineWidth = visualViewport.width;
        const update = () => this._updateMobileKeyboardState(visualViewport);
        visualViewport.addEventListener('resize', update);
        visualViewport.addEventListener('scroll', update);
        this.disposeWithMe({
            dispose: () => {
                visualViewport.removeEventListener('resize', update);
                visualViewport.removeEventListener('scroll', update);
            },
        });
    }

    protected override _updateInputPosition({ forceFocus = false, preserveFocus = false } = {}): void {
        if (!forceFocus && !isInternalEditorID(this._context.unitId)) {
            // Formatting may refresh selection without reopening the software keyboard.
            this._positionInput(0, 0);
            return;
        }
        super._updateInputPosition({ forceFocus, preserveFocus });
    }

    protected override _handleInputBlur(event: Event): void {
        if (this.isEditing) {
            this._pendingBlurEvent = event;
            return;
        }
        super._handleInputBlur(event);
    }

    protected override _handleInputFocus(event: Event): void {
        this._pendingBlurEvent = null;
        super._handleInputFocus(event);
    }

    protected override _setEditing(isEditing: boolean): void {
        if (!isEditing) {
            this._setMobileKeyboardState(false, 0);
            this._pendingBlurEvent = null;
        }
        super._setEditing(isEditing);
    }

    private _startSelectionHandleDrag(
        handle: MobileTextRangeHandleType,
        event: IPointerEvent | IMouseEvent
    ): void {
        this._handleDragDisposables.dispose();
        const activeRange = this._getActiveRangeInstance();
        const anchor = handle === 'start' ? activeRange?.endNodePosition : activeRange?.startNodePosition;
        if (!activeRange || activeRange.collapsed || !anchor) {
            return;
        }

        const { scene } = this._context;
        const scrollTimer = ScrollTimer.create(scene);
        let moved = false;
        let previousX = event.offsetX;
        let previousY = event.offsetY;

        this._anchorNodePosition = { ...anchor };
        this._focusNodePosition = null;
        this._removeAllCacheRanges();
        this._selectionVisuals.hide();
        scene.disableObjectsEvent();
        this._onPointerEvent = true;
        scrollTimer.startScroll(event.offsetX, event.offsetY);
        this._handleDragDisposables.add(() => {
            scrollTimer.dispose();
            this._onPointerEvent = false;
            scene.enableObjectsEvent();
        });

        this._handleDragDisposables.add(scene.onPointerMove$.subscribeEvent((moveEvent: IPointerEvent | IMouseEvent) => {
            const distance = Math.hypot(moveEvent.offsetX - previousX, moveEvent.offsetY - previousY);
            if (distance < 2) {
                return;
            }

            moved = true;
            this._tryMoving(moveEvent.offsetX, moveEvent.offsetY);
            scrollTimer.scrolling(moveEvent.offsetX, moveEvent.offsetY, () => {
                this._tryMoving(moveEvent.offsetX, moveEvent.offsetY);
            });
            previousX = moveEvent.offsetX;
            previousY = moveEvent.offsetY;
        }));
        const finishDrag = () => {
            this._handleDragDisposables.dispose();

            if (moved && (this._rangeListCache.length || this._rectRangeListCache.length)) {
                for (const textRange of this._rangeListCache) {
                    this._addTextRange(textRange);
                }
                this._addRectRanges(this._rectRangeListCache);
                this._rangeListCache = [];
                this._rectRangeListCache = [];
            } else {
                this._removeAllCacheRanges();
            }

            this._anchorNodePosition = null;
            this._focusNodePosition = null;
            this._emitCurrentSelection(false);
        };
        this._handleDragDisposables.add(scene.onPointerUp$.subscribeEvent(finishDrag));
        this._handleDragDisposables.add(scene.onPointerCancel$.subscribeEvent(finishDrag));
    }

    private _updateMobileKeyboardState(visualViewport: VisualViewport): void {
        const visibleBottom = visualViewport.offsetTop + visualViewport.height;
        if (Math.abs(this._viewportBaselineWidth - visualViewport.width) > 1) {
            this._viewportBaselineHeight = visualViewport.height;
            this._viewportBaselineBottom = visibleBottom;
            this._viewportBaselineWidth = visualViewport.width;
        }

        const keyboardVisible = this._viewportBaselineHeight - visualViewport.height >= MOBILE_KEYBOARD_THRESHOLD;
        if (!keyboardVisible) {
            this._viewportBaselineHeight = Math.max(this._viewportBaselineHeight, visualViewport.height);
            this._viewportBaselineBottom = Math.max(this._viewportBaselineBottom, visibleBottom);
        }

        if (!this.isMobileEditMode) {
            this._setMobileKeyboardState(false, 0);
            return;
        }

        if (keyboardVisible) {
            this._setMobileKeyboardState(
                true,
                Math.max(0, Math.round(this._viewportBaselineBottom - visibleBottom))
            );
            return;
        }

        if (!this._keyboardState$.value.visible) {
            return;
        }

        this._setMobileKeyboardState(false, 0);
        const blurEvent = this._pendingBlurEvent;
        this._pendingBlurEvent = null;
        if (blurEvent) {
            this._emitInputBlur(blurEvent);
        }
    }

    private _setMobileKeyboardState(visible: boolean, inset: number): void {
        const current = this._keyboardState$.value;
        if (current.visible === visible && current.inset === inset) {
            return;
        }

        this._keyboardState$.next({ visible, inset });
    }

    override dispose(): void {
        this._handleDragDisposables.dispose();
        this._selectionVisuals.dispose();
        this._keyboardState$.complete();
        this._editMode$.complete();
        super.dispose();
    }
}
