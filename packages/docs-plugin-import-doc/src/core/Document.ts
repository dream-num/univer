import {Docx} from "./Docx";

const docx = new Docx();

export class Document {
    public static async parse(file: Buffer): Promise<Document> {
        return docx.load(file);
    }

    public constructor() {

    }
}
