/**
 * Copyright 2023-present DreamNum Inc.
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

/* eslint-disable react-refresh/only-export-components */

import { connectInjector, Disposable, Inject, Injector, useDependency, useObservable } from '@univerjs/core';

import React, { useCallback, useEffect, useRef } from 'react';
import { Subject } from 'rxjs';
import { BuiltInUIPart, IUIPartsService } from '../parts/parts.service';
import { ILocalFileService } from './file-opener.service';
import type { IOpenFileOptions } from './file-opener.service';

interface IOpenFileRequest extends IOpenFileOptions {
    onFileSelected: (files: File[]) => void;
}

export class DesktopLocalFileService extends Disposable implements ILocalFileService {
    private readonly _fileOpenRequest$ = new Subject<IOpenFileRequest | null>();
    readonly fileOpenRequest$ = this._fileOpenRequest$.asObservable();

    constructor(
        @Inject(Injector) injector: Injector,
        @IUIPartsService private readonly _uiPartsService: IUIPartsService
    ) {
        super();

        this.disposeWithMe(this._uiPartsService.registerComponent(
            BuiltInUIPart.GLOBAL, () => connectInjector(DesktopFileOpenerWrapper, injector)));
    }

    openFile(options?: IOpenFileOptions): Promise<File[]> {
        // eslint-disable-next-line ts/no-this-alias
        const service = this;

        return new Promise((resolve) => {
            const request: IOpenFileRequest = {
                ...options,
                onFileSelected(files) {
                    resolve(files);
                    service._fileOpenRequest$.next(null);
                },
            };

            this._fileOpenRequest$.next(request);
        });
    }

    downloadFile(data: Blob, fileName: string): void {
        const a = document.createElement('a');
        a.download = fileName;
        a.href = window.URL.createObjectURL(data);
        a.click();
    }
}

function DesktopFileOpener(props: { request: IOpenFileRequest }) {
    const { request } = props;
    const { accept, onFileSelected, multiple } = request;
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const fileList = event.target.files;
        onFileSelected(fileList ? Array.from(fileList) : []);

        if (fileInputRef.current) fileInputRef.current.value = '';
    }, [onFileSelected]);

    useEffect(() => {
        if (fileInputRef.current) fileInputRef.current.click();
    }, []);

    return (
        <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept={accept}
            multiple={multiple}
        />
    );
}

function DesktopFileOpenerWrapper() {
    const DesktopLocalFileService = useDependency(ILocalFileService) as DesktopLocalFileService;
    const request = useObservable(DesktopLocalFileService.fileOpenRequest$, null);

    if (!request) return null;
    return <DesktopFileOpener request={request} />;
}

