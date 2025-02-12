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

import type { Nullable } from '@univerjs/core';

/**
 * Alias type for number that are floats
 */
export type float = number;

/**
 * Alias type for number that are doubles.
 */
export type double = number;

/* *
 * Alias type for number that are integer
 */
export type int = number;

/**
 * Alias type for number array or Float32Array
 */
export type FloatArray = number[] | Float32Array;

/**
 * Alias type for number array or Float32Array or Int32 Array or Uint32Array or Uint16Array
 */
export type IndicesArray = number[] | Int32Array | Uint32Array | Uint16Array;

/**
 * Alias for types that can be used by a Buffer or  VertexBuffer.
 */
export type DataArray = number[] | ArrayBuffer | ArrayBufferView;

/**
 * Alias type for primitive types
 */
type Primitive = undefined | null | boolean | string | number | Function;

/**
 * Type modifier to make all the properties of an object Readonly
 */
export type Immutable<T> = T extends Primitive
    ? T
    : T extends Array<infer U>
        ? readonly U[]
        : DeepImmutable<T>; /* T extends Map<infer K, infer V> ? ReadonlyMap<K, V> : // es2015+ only */

/**
 * Type modifier to make all the properties of an object Readonly recursively
 */
export type DeepImmutable<T> = T extends Primitive
    ? T
    : T extends Array<infer U>
        ? IDeepImmutableArray<U>
        : /* T extends Map<infer K, infer V> ? DeepImmutableMap<K, V> : // es2015+ only */
        DeepImmutableObject<T>;

/**
 * Type modifier to make object properties readonly.
 */
export type DeepImmutableObject<T> = {
    readonly [K in keyof T]: DeepImmutable<T[K]>;
};

/** @hidden */
interface IDeepImmutableArray<T> extends ReadonlyArray<DeepImmutable<T>> {}
/** @hidden */
/* interface DeepImmutableMap<K, V> extends ReadonlyMap<DeepImmutable<K>,  DeepImmutable<V>> {} // es2015+ only */

/**
 * Event Types
 */
export enum DeviceInputEventType {
    // Pointers
    /** PointerMove */
    PointerMove,
    /** PointerDown */
    PointerDown,
    /** PointerUp */
    PointerUp,

    Dblclick,

    Keyboard,
}

/**
 *  Native friendly interface for Event Obj ect
 */
export interface IEvent extends Event {
    // Methods
    /**
     * Device type
     */
    deviceType: DeviceType;
    /**
     * Device slot
     */
    inputIndex: number;
    /**
     * Previous state of given input, for what???, nobody read this value.
     */
    previousState: Nullable<number>;
    /**
     * Current state of given input
     */
    currentState: Nullable<number>;
}

// TODO@wzhudev: this interface maybe not necessary

/**
 * Native friendly interface for UIEvent Object
 */
export interface IUIEvent extends IEvent, UIEvent {
    // TODO@wzhudev: should add a stack to mark RenderObjects that the event targets to
}

/**
 * Native friendly interface for KeyboardEvent Object
 */
export interface IKeyboardEvent extends IUIEvent {
    // Properties
    /**
     * Status of Alt key being pressed
     */
    altKey: boolean;

    /**
     * Unicode value of character pressed
     * @deprecated
     */
    charCode?: number;

    /**
     * Code for key based on layout
     */
    code: string;

    /**
     * Status of Ctrl key being pressed
     */
    ctrlKey: boolean;

    /**
     * String representation of key
     */
    key: string;
    /* *
     * ASCII value of key
     * @deprecated
     */
    keyCode: number;

    /**
     * Status of Meta key (eg. Windows key) being pressed
     */
    metaKey: boolean;

    /**
     * Status of Shift key being pressed
     */
    shiftKey: boolean;
}

/**
 * Native friendly interface for MouseEvent Object
 */
export interface IMouseEvent extends IUIEvent, MouseEvent {
    // Properties
    /**
     * Status of Alt key being pressed
     */
    altKey: boolean;

    /**
     * Value of single mouse button pressed
     */
    button: number;

    /**
     * Value of all mouse buttons pressed
     */
    buttons: number;

    /**
     * Current X coordinate
     */
    clientX: number;

    /**
     * Current Y coordinate
     */
    clientY: number;

    /**
     * Status of Ctrl key being pressed
     */
    ctrlKey: boolean;

    /**
     * Status of Meta key (eg. Windows key) being pressed
     */
    metaKey: boolean;

    /**
     * Delta of movement on X axis
     */
    movementX: number;

    /**
     * Delta of movement on Y axis
     */
    movementY: number;

    /**
     * Delta of movement on X axis
     */
    mozMovementX?: number;

    /**
     * Delta of movement on Y axis
     */
    mozMovementY?: number;

    /**
     * Delta of movement on X axis
     */
    msMovementX?: any;

    /**
     * Delta of movement on Y axi s
     */
    msMovementY?: any;

    /**
     * Current coordinate of X within container
     */
    offsetX: number;

    /**
     * Current coordinate of Y within container
     */
    offsetY: number;

    /**
     * Status of Shift key being pressed
     */
    shiftKey: boolean;

    /**
     * Delta of movement on X axis
     */
    webkitMovementX?: any;

    /**
     * Delta of movement on Y axis
     */
    webkitMovementY?: any;

    /**
     * Alias of clientX
     */
    x: number;

    /**
     * Alias of clientY
     */
    y: number;
}

/**
 * Native friendly interface for PointerEvent Object
 */
export interface IPointerEvent extends IMouseEvent {
    // Properties
    /**
     * Pointer Event ID
     */
    pointerId: number;

    /**
     * Type of pointer
     */
    pointerType: string;
}

/**
 * Native friendly interface for DragEvent Object
 */
export interface IDragEvent extends IMouseEvent {
    // Properties
    /**
     * Holds the drag operation's data
     */
    dataTransfer: DataTransfer;
}

/**
 * Native friendly interface for WheelEvent Object
 */
export interface IWheelEvent extends IMouseEvent {
    // Properties
    /**
     * Units for delta value
     */
    deltaMode: number;

    /**
     * Horizontal scroll delta
     */
    deltaX: number;

    /* *
     * Vertical scroll delta
     */
    deltaY: number;

    /**
     * Z-Axis scroll delta
     */
    deltaZ: number;

    /**
     * WheelDelta (From MouseWheel Event)
     */
    wheelDelta?: number;
}

/**
 * Constants used for Events
 */
export class EventConstants {
    /**
     * Pixel delta for Wheel Events (Default)
     */
    static DOM_DELTA_PIXEL = 0x00;

    /**
     * Line delta for Wheel Events
     */
    static DOM_DELTA_LINE = 0x01;

    /**
     * Page delta for Wheel Events
     */
    static DOM_DELTA_PAGE = 0x02;
}

/**
 * Enum for Device Types
 */
export enum DeviceType {
    /** Generic */
    Generic = 0,
    /** Keyboard */
    Keyboard,
    /** Mouse */
    Mouse,
    /** Touch Pointers */
    Touch,
}

// Device Enums
/**
 * Enum for All Pointers (Touch/Mouse)
 */
export enum PointerInput {
    /** Horizontal Axis */
    Horizontal = 0,
    /** Vertical Axis */
    Vertical = 1,
    /** Left Click or Touch */
    LeftClick = 2,
    /** Middle Click */
    MiddleClick = 3,
    /** Right Click */
    RightClick = 4,
    /** Browser Back */
    BrowserBack = 5,
    /** Browser Forward */
    BrowserForward = 6,
    /** Mouse Wheel X */
    MouseWheelX = 7,
    /** Mouse Wheel Y */
    MouseWheelY = 8,
    /** Mouse Wheel Z */
    MouseWheelZ = 9,
    /** Delta X */
    DeltaHorizontal = 10,
    /** Delta Y */
    DeltaVertical = 11,
    /** MoveBeing Hijack for simultaneous buttons pressed for instance */
    FakeMove = 12,
}
