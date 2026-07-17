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

export interface IPdfAssetRef {
    assetId: string;
    kind: string;
    fileId: string;
    mimeType: string;
    size: number;
}

export interface IPdfMeta {
    unitID: string;
    rev: number;
    creator: string;
    name: string;
    sourcePdfFileId?: string | undefined;
    modelJsonFileId?: string | undefined;
    decodeManifestFileId?: string | undefined;
    pdfModelSchema?: string | undefined;
    pdfModelSchemaVersion?: number | undefined;
    decoderKind?: string | undefined;
    decoderVersion?: string | undefined;
    assets?: IPdfAssetRef[] | undefined;
    editorStateJsonFileId?: string | undefined;
    exportPatchJsonFileId?: string | undefined;
    originalMeta: Uint8Array;
}
