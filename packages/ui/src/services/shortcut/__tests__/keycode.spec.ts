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

import { describe, expect, it } from 'vitest';
import { KeyCode, KeyCodeToChar, MetaKeys } from '../keycode';

describe('keycode mappings', () => {
    it('should map common control keys to labels', () => {
        expect(KeyCodeToChar[KeyCode.BACKSPACE]).toBe('Backspace');
        expect(KeyCodeToChar[KeyCode.ENTER]).toBe('Enter');
        expect(KeyCodeToChar[KeyCode.DELETE]).toBe('Del');
        expect(KeyCodeToChar[KeyCode.ESC]).toBe('Esc');
        expect(KeyCodeToChar[KeyCode.SPACE]).toBe('Space');
    });

    it('should map alphanumeric and function keys', () => {
        expect(KeyCodeToChar[KeyCode.Digit0]).toBe('0');
        expect(KeyCodeToChar[KeyCode.Digit9]).toBe('9');
        expect(KeyCodeToChar[KeyCode.A]).toBe('A');
        expect(KeyCodeToChar[KeyCode.Z]).toBe('Z');
        expect(KeyCodeToChar[KeyCode.F1]).toBe('F1');
        expect(KeyCodeToChar[KeyCode.F12]).toBe('F12');
    });

    it('should map punctuation and arrow keys', () => {
        expect(KeyCodeToChar[KeyCode.MINUS]).toBe('-');
        expect(KeyCodeToChar[KeyCode.EQUAL]).toBe('=');
        expect(KeyCodeToChar[KeyCode.PERIOD]).toBe('.');
        expect(KeyCodeToChar[KeyCode.COMMA]).toBe(',');
        expect(KeyCodeToChar[KeyCode.BACK_SLASH]).toBe('\\');
        expect(KeyCodeToChar[KeyCode.ARROW_LEFT]).toBe('←');
        expect(KeyCodeToChar[KeyCode.ARROW_RIGHT]).toBe('→');
        expect(KeyCodeToChar[KeyCode.ARROW_UP]).toBe('↑');
        expect(KeyCodeToChar[KeyCode.ARROW_DOWN]).toBe('↓');
    });

    it('should return undefined for unknown key code', () => {
        expect(KeyCodeToChar[KeyCode.UNKNOWN]).toBeUndefined();
    });

    it('should define non-overlapping meta key bitmasks', () => {
        expect(MetaKeys.SHIFT & MetaKeys.ALT).toBe(0);
        expect(MetaKeys.ALT & MetaKeys.CTRL_COMMAND).toBe(0);
        expect(MetaKeys.CTRL_COMMAND & MetaKeys.MAC_CTRL).toBe(0);
    });
});
