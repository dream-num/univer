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

import type { IShapeProps, UniverRenderingContext } from '@univerjs/engine-render';
import { Rect, RegularPolygon, Shape } from '@univerjs/engine-render';

import { HEADER_MENU_BACKGROUND_COLOR, HEADER_MENU_SHAPE_TRIANGLE_FILL } from './header-menu-shape';

export enum HeaderUnhideShapeType {
    ROW,
    COLUMN,
}

export interface IHeaderUnhideShapeProps extends IShapeProps {
    /** On row headers or on column headers. */
    type: HeaderUnhideShapeType;
    /** If the shape is hovered. If it's hovered it should have a border. */
    hovered: boolean;
    /** This hidden position has previous rows/cols. */
    hasPrevious: boolean;
    /** This hidden position has succeeding rows/cols. */
    hasNext: boolean;
}

export const UNHIDE_ICON_SIZE = 12;
const UNHIDE_ARROW_RATIO = 0.4;

export class HeaderUnhideShape<T extends IHeaderUnhideShapeProps = IHeaderUnhideShapeProps> extends Shape<T> {
    private _size = UNHIDE_ICON_SIZE;
    private _iconRatio = UNHIDE_ARROW_RATIO;
    private _hovered = true;
    private _hasPrevious = true;
    private _hasNext = true;
    private _unhideType!: HeaderUnhideShapeType;

    constructor(key?: string, props?: T, onClick?: () => void) {
        super(key, props);
        if (props) {
            this.setShapeProps(props);
        }

        this.onPointerEnter$.subscribeEvent(() => this.setShapeProps({ hovered: true }));
        this.onPointerLeave$.subscribeEvent(() => this.setShapeProps({ hovered: false }));
        this.onPointerDown$.subscribeEvent(() => onClick?.());
    }

    setShapeProps(props: Partial<IHeaderUnhideShapeProps>): void {
        if (props.type !== undefined) {
            this._unhideType = props.type;
        }
        if (props.hovered !== undefined) {
            this._hovered = props.hovered;
        }
        if (props.hasPrevious !== undefined) {
            this._hasPrevious = props.hasPrevious;
        }
        if (props.hasNext !== undefined) {
            this._hasNext = props.hasNext;
        }

        this.transformByState({
            width: this._size * (this._unhideType === HeaderUnhideShapeType.COLUMN ? 2 : 1),
            height: this._size * (this._unhideType === HeaderUnhideShapeType.ROW ? 2 : 1),
        });
    }

    protected override _draw(ctx: UniverRenderingContext): void {
        if (this._unhideType === HeaderUnhideShapeType.ROW) {
            this._drawOnRow(ctx);
        } else {
            this._drawOnCol(ctx);
        }
    }

    private _drawOnRow(ctx: UniverRenderingContext): void {
        if (this._hovered) {
            if (!this._hasNext || !this._hasPrevious) {
                Rect.drawWith(ctx, {
                    width: this._size,
                    height: this._size,
                    stroke: HEADER_MENU_SHAPE_TRIANGLE_FILL,
                    fill: HEADER_MENU_BACKGROUND_COLOR,
                });
            } else {
                Rect.drawWith(ctx, {
                    width: this._size,
                    height: 2 * this._size,
                    stroke: HEADER_MENU_SHAPE_TRIANGLE_FILL,
                    fill: HEADER_MENU_BACKGROUND_COLOR,
                });
            }
        }

        const iconSize = this._size * 0.5 * this._iconRatio;
        const sixtyDegree = Math.PI / 3;
        const top = iconSize * Math.cos(sixtyDegree);
        const left = iconSize * Math.sin(sixtyDegree);

        if (this._hasPrevious) {
            RegularPolygon.drawWith(ctx, {
                pointsGroup: [
                    [
                        { x: this._size / 2, y: this._size / 2 - left },
                        { x: this._size / 2 - left, y: this._size / 2 + top },
                        { x: this._size / 2 + left, y: this._size / 2 + top },
                    ],
                ],
                fill: HEADER_MENU_SHAPE_TRIANGLE_FILL,
            });
        }

        if (this._hasNext) {
            const offset = this._hasPrevious ? 3 : 1;
            RegularPolygon.drawWith(ctx, {
                pointsGroup: [
                    [
                        { x: this._size / 2, y: (this._size * offset) / 2 + left },
                        { x: this._size / 2 - left, y: (this._size * offset) / 2 - top },
                        { x: this._size / 2 + left, y: (this._size * offset) / 2 - top },
                    ],
                ],
                fill: HEADER_MENU_SHAPE_TRIANGLE_FILL,
            });
        }
    }

    /**
     *
     * @param ctx
     */
    private _drawOnCol(ctx: UniverRenderingContext): void {
        if (this._hovered) {
            if (!this._hasNext || !this._hasPrevious) {
                Rect.drawWith(ctx, {
                    width: this._size,
                    height: this._size,
                    stroke: HEADER_MENU_SHAPE_TRIANGLE_FILL,
                    fill: HEADER_MENU_BACKGROUND_COLOR,
                });
            } else {
                Rect.drawWith(ctx, {
                    width: 2 * this._size,
                    height: this._size,
                    stroke: HEADER_MENU_SHAPE_TRIANGLE_FILL,
                    fill: HEADER_MENU_BACKGROUND_COLOR,
                });
            }
        }

        const iconSize = this._size * 0.5 * this._iconRatio;
        const sixtyDegree = Math.PI / 3;
        const top = iconSize * Math.cos(sixtyDegree);
        const left = iconSize * Math.sin(sixtyDegree);

        if (this._hasPrevious) {
            RegularPolygon.drawWith(ctx, {
                pointsGroup: [
                    [
                        { x: -top + this._size / 2, y: this._size / 2 },
                        { x: this._size / 2 + left, y: this._size / 2 - left },
                        { x: this._size / 2 + left, y: this._size / 2 + left },
                    ],
                ],
                fill: HEADER_MENU_SHAPE_TRIANGLE_FILL,
            });
        }

        if (this._hasNext) {
            const offset = this._hasPrevious ? 3 : 1;
            RegularPolygon.drawWith(ctx, {
                pointsGroup: [
                    [
                        { x: top + (this._size * offset) / 2, y: this._size / 2 },
                        { x: -left + (this._size * offset) / 2, y: this._size / 2 - left },
                        { x: -left + (this._size * offset) / 2, y: this._size / 2 + left },
                    ],
                ],
                fill: HEADER_MENU_SHAPE_TRIANGLE_FILL,
            });
        }
    }
}
