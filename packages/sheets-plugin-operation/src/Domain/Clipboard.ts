import { Nullable } from '@univerjs/core';
import { PasteType } from './Paste';

export type ClipboardType = {
    type?: 'text/html' | 'text/plain' | 'image/png';
    data: string;
};

export class Clipboard {
    static clipboard = window.navigator.clipboard;

    static textArea: HTMLTextAreaElement;

    static localData: Nullable<string>;

    static async writeText(text: string, e?: ClipboardEvent) {
        if (Clipboard.clipboard) {
            return Clipboard.clipboard.writeText(text).then(
                () => true,
                (err) => console.dir(err)
            );
        }

        e?.clipboardData?.setData('text/html', text);
        e?.preventDefault();
    }

    static async write(data: ClipboardType, e?: ClipboardEvent) {
        if (Clipboard.clipboard) {
            const blob = new Blob([data.data], { type: data.type ?? 'text/html' });
            const clipboardData = [new ClipboardItem({ 'text/html': blob })];

            // return Paste.clipboard.write(clipboardData).then(
            //     () => true,
            //     () => false
            // );
            Clipboard.clipboard.write(clipboardData);
        }
        e?.clipboardData?.setData(data.type ?? 'text/html', data.data);
        e?.preventDefault();
        Clipboard.localData = data.data;
    }

    static async readText() {
        if (Clipboard.clipboard) {
            return Clipboard.clipboard.readText().then(
                (text) => text,
                () => null
            );
        }
        if (!Clipboard.textArea) return null;
        return new Promise((resolve, reject) => {
            resolve(Clipboard.textArea.value);
        })
            .then((text) => text)
            .then(() => null);
    }

    static async read(e?: ClipboardEvent): Promise<Array<PasteType | null> | null | string> {
        if (e) {
            const result = [];
            const clipboardData = e?.clipboardData;
            const types = clipboardData?.types;
            if (!types) return null;
            for (let i = 0; i < types.length; i++) {
                result.push({
                    type: types[i],
                    result: clipboardData.getData(types[i]),
                });
            }
            return result;
        }

        if (Clipboard.clipboard) {
            const clipboardItems = await Clipboard.clipboard.read();
            const Promises: Array<Promise<PasteType | null>> = [];
            for (const clipboardItem of clipboardItems) {
                for (const type of clipboardItem.types) {
                    const blob = await clipboardItem.getType(type);
                    const reader = new FileReader();
                    if (type === 'image/png') {
                        reader.readAsDataURL(blob);
                    } else {
                        reader.readAsText(blob);
                    }
                    const promise: Promise<PasteType | null> = new Promise((resolve: (value: PasteType) => void, reject) => {
                        reader.onload = (e) => {
                            const item: PasteType = { type, result: reader.result };
                            resolve(item);
                        };
                    }).then(
                        (res) => res,
                        () => null
                    );
                    Promises.push(promise);
                }
            }
            return Promise.all(Promises);
        }

        const result = Clipboard.localData ?? null;
        Clipboard.localData = null;

        return result;
    }
}
