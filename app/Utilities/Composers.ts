"use server";

import { RainLanguageServices, MetaStore, TextDocumentItem } from "@rainlanguage/dotrain";

export const getRainlangTextFromDotrainText = async (dotrainText: string) => {
    const metaStore = new MetaStore();
    const langServices = new RainLanguageServices(metaStore);
    const textDocument = TextDocumentItem.create(
      "file:///file-name.rain",
      "rainlang",
      0,
      dotrainText
    );
    const rainDocument = await langServices.newRainDocument(textDocument);
    const rainlangText = await rainDocument.compose(["abcd" , "efgh"]);
    return rainlangText;
}