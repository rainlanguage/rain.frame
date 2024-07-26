"use client";
import { getRainlangTextFromDotrainText } from "./Utilities/Composers";

export const ComposeButton = () => {
  const handleClick = async () => {
    const dotrainText = `---
        #some-binding 100

        #abcd
        _ _: 1 some-binding,
        _: call<'another-source>();

        #efgh
        _ : sub(1 2);

        #another-source
        _ _: 1 2;

        #third
        _: 10;
        `;
    const rainLangText = await getRainlangTextFromDotrainText(dotrainText);
    console.log(rainLangText);
  };

  return (
    <button onClick={handleClick}>Get Rainlang text from Dotrain text</button>
  );
};
