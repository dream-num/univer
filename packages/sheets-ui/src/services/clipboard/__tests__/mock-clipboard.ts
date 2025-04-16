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

export interface IClipboardItem {
    presentationStyle: PresentationStyle;
    readonly types: readonly string[];
    getType(type: string): Promise<Blob>;
}

export class MockClipboardItem implements IClipboardItem {
    presentationStyle: PresentationStyle;
    private readonly itemTypes: readonly string[];
    constructor(private props: IMockClipboardProps) {
        this.itemTypes = Object.keys(props);
    }

    get types(): readonly string[] {
        return this.itemTypes;
    }

    getType(type: string): Promise<Blob> {
        // Here the corresponding mock Blob object is returned according to the type
        if (this.itemTypes.includes(type)) {
            // Mock returns a fake HTML/Text/Image content
            const blob = new Blob([this.props[type as keyof IMockClipboardProps] || ''], { type });
            return Promise.resolve(blob);
        }

        // Can return an false Promise if the types do not match
        return Promise.reject(new Error('Unsupported type'));
    }
}

interface IMockClipboardProps {
    'text/plain'?: string;
    'text/html'?: string;
    'image/png'?: string;
}

export class MockClipboard {
    constructor(private props: IMockClipboardProps) {
        // empty
    }

    read(): Promise<IClipboardItem[]> {
        // Here you can return the simulated IClipboardItem array
        const clipboardItems: IClipboardItem[] = [new MockClipboardItem(this.props)];
        return Promise.resolve(clipboardItems);
    }
}
