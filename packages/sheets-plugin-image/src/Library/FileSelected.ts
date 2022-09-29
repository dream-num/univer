export class FileSelected {
    static ACCEPT = {
        XLSX: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        CVS: '.csv',
        TXT: 'text/plain',
        IMAGE: 'image/*',
    };

    static async chooseImage(): Promise<File> {
        return (await new FileSelected(false, FileSelected.ACCEPT.IMAGE).choose()) as File;
    }

    static async chooseXlsx(): Promise<File> {
        return (await new FileSelected(false, FileSelected.ACCEPT.IMAGE).choose()) as File;
    }

    private _element: HTMLInputElement;

    private _accept: string;

    private _multiple: boolean;

    constructor(multiple: boolean, accept: string) {
        this._multiple = multiple;
        this._accept = accept;
        this._element = document.createElement('input');
        this._element.setAttribute('type', 'file');
        this._element.setAttribute('accept', accept);
        if (multiple) {
            this._element.setAttribute('multiple', 'multiple');
        }
    }

    async choose(): Promise<File | FileList | null> {
        let callback: (event: Event) => void;
        return new Promise((resolve) => {
            this._element.value = '';
            this._element.addEventListener(
                'change',
                (callback = () => {
                    const files = this._element.files;
                    if (files && files.length) {
                        if (this._multiple) {
                            resolve(files);
                        } else {
                            resolve(files[0]);
                        }
                    } else {
                        resolve(null);
                    }
                    this._element.removeEventListener('change', callback);
                })
            );
            const event = new MouseEvent('click', {
                bubbles: true,
                detail: 0,
                cancelable: false,
            });
            this._element.dispatchEvent(event);
        });
    }
}
