import {Document} from './Document'
import JSZip from "jszip";

export class Docx {
    async load(buffer: Buffer): Promise<Document> {
        debugger
        const zip = await JSZip.loadAsync(buffer);
        for (const entry of Object.values(zip.files)) {
            console.log(entry)
        }
        return new Document();
    }
}
