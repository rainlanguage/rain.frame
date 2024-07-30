/** @jsxImportSource frog/jsx */

// import { getRainlangTextFromDotrainText } from "@/app/Utilities/Composers";
import { DeploymentOption, YamlData } from "@/app/types/yamlData";
import { FrameImage } from "@/app/UI/FrameImage";
import { Button, Frog, TextInput } from "frog";
import { devtools } from "frog/dev";
import { handle } from "frog/next";
import { serveStatic } from "frog/serve-static";
import yaml from "js-yaml";

const app = new Frog({
  assetsPath: "/",
  basePath: "/api",
  title: "Rain Frame",
  initialState: {
    currentStep: "start",
    deploymentOption: undefined,
    bindings: {},
    buttonPage: 0,
  },
});

const yamlText = `
gui:
  name: DCA into WFLR
  description: Buy FLARE!
  deploymentOptions:
    -   deployment: usd
        name: DCA into WFLR with USD
        fields:
          - binding: amount
            name: Amount
            description: The amount of USD you want to spend each day.
            min: 0
            presets:
              - 1
              - 5
              - 10
          - binding: frequency
            name: Frequency
            description: Number of days between DCA purchases.
            min: 0
            presets:
              - 1
              - 7
              - 14
              - 28
        deposit:
          min: 20
          presets: 
            - 10
            - 50
            - 100
    -   deployment: weth
        name: DCA into WFLR with WETH
        fields:
          - binding: amount
            name: Amount
            description: The amount of WETH you want to spend each day.
            presets:
              - 0.001
              - 0.002
              - 0.005
        deposit:
          min: 0.01
          presets:
            - 0.01
            - 0.02
            - 0.05
`;

app.frame("/", async (c) => {
  const { buttonValue, inputText, deriveState } = c;
  const yamlData = yaml.load(yamlText) as YamlData;

  // Derive the new state based on the current state and the button value
  const currentState: any = deriveState((previousState: any) => {
    // Handle page navigation
    if (buttonValue === "backToButtons") {
      previousState.showTextInput = false;
      return;
    } else if (buttonValue === "previousButtonPage") {
      previousState.buttonPage--;
      return;
    } else if (buttonValue === "nextButtonPage") {
      previousState.buttonPage++;
      return;
    } else if (buttonValue === "showTextInput") {
      previousState.showTextInput = true;
      return;
    }

    // Handle state transitions
    switch (previousState.currentStep) {
      case "start":
        const deploymentOptions = Object.values(yamlData.gui.deploymentOptions);
        if (deploymentOptions.length === 1) {
          // Deployment step can be skipped if there is only one deployment
          previousState.deployment = deploymentOptions[0].deployment;
          previousState.currentStep = "fields";
        } else {
          previousState.currentStep = "deployment";
        }
        break;
      case "deployment":
        previousState.deploymentOption = yamlData.gui.deploymentOptions.find(
          (deploymentOption: DeploymentOption) =>
            deploymentOption.deployment === buttonValue
        );
        previousState.currentStep = "fields";
        break;
      case "fields":
        let currentBindingsCount = Object.keys(previousState.bindings).length;
        const fields = previousState.deploymentOption.fields;

        if (buttonValue === "submit") {
          if (inputText && inputText >= fields[currentBindingsCount].min) {
            const currentField = fields[currentBindingsCount];
            previousState.bindings[currentField.binding] = inputText;
            previousState.showTextInput = false;
            currentBindingsCount++;
            previousState.buttonPage = 0;
          }
        } else if (buttonValue === "back") {
          if (currentBindingsCount === 0) {
            previousState.currentStep = "deployment";
          } else {
            const currentField = fields[currentBindingsCount - 1];
            delete previousState.bindings[currentField.binding];
          }
        } else {
          const currentField = fields[currentBindingsCount];
          previousState.bindings[currentField.binding] = buttonValue;
          currentBindingsCount++;
          previousState.buttonPage = 0;
        }
        // If all bindings are filled, we can move to the next step
        if (currentBindingsCount >= fields.length) {
          previousState.currentStep = "deposit";
        }
        break;
      case "deposit":
        if (buttonValue === "submit") {
          if (
            inputText &&
            inputText >= previousState.deploymentOption.deposit.min
          ) {
            previousState.deposit = inputText;
            previousState.showTextInput = false;
          }
        } else if (buttonValue === "back") {
          const currentField =
            previousState.deploymentOption.fields[
              Object.keys(previousState.bindings).length - 1
            ];
          delete previousState.bindings[currentField.binding];
          previousState.currentStep = "fields";
        } else {
          previousState.deposit = buttonValue;
        }
        if (previousState.deposit > 0) {
          previousState.currentStep = "review";
          previousState.buttonPage = 0;
        }
        break;
      case "review":
        if (buttonValue === "back") {
          previousState.currentStep = "deposit";
        } else if (buttonValue === "submit") {
          previousState.currentStep = "done";
        }
        break;
      case "done":
        previousState.currentStep = "start";
        previousState.deploymentOption = undefined;
        previousState.bindings = {};
        break;
    }
  });

  // Helper functions to get intents
  const getPaginatedIntents = (allButtons: any[]): any[] => {
    const buttonPageOffset = currentState.buttonPage * 3;
    let buttonEndIndex = buttonPageOffset + 4;
    const includeMoreButton = buttonEndIndex < allButtons.length;
    if (includeMoreButton) {
      buttonEndIndex--;
    }
    return [
      ...(allButtons.length <= 3
        ? allButtons
        : [
            currentState.buttonPage > 0 && (
              <Button value="previousButtonPage">{"<"}</Button>
            ),
            ...allButtons.slice(buttonPageOffset, buttonEndIndex),
            includeMoreButton && (
              <Button value="nextButtonPage">{"More"}</Button>
            ),
          ]),
    ];
  };
  const getTextInputIntents = (minimum: number): any[] => {
    return [
      <TextInput placeholder={`Enter value greater than ${minimum}`} />,
      <Button value="backToButtons">{"<"}</Button>,
      <Button value="submit">Submit</Button>,
    ];
  };

  // Define intents based on the current state
  let intents: any[] = [];
  switch (currentState.currentStep) {
    case "start":
      intents = [<Button value="start">Start</Button>];
      break;
    case "deployment":
      const allButtons = yamlData.gui.deploymentOptions.map(
        (deploymentOption: DeploymentOption) => (
          <Button value={deploymentOption.deployment}>
            {deploymentOption.name}
          </Button>
        )
      );
      intents = getPaginatedIntents(allButtons);
      break;
    case "fields":
      const field =
        currentState.deploymentOption.fields[
          Object.keys(currentState.bindings).length
        ];
      if (currentState.showTextInput) {
        intents = getTextInputIntents(field.min);
      } else {
        const allButtons = [
          <Button value="back">{"<"}</Button>,
          ...field.presets.map((preset: number) => (
            <Button value={`${preset}`}>{String(preset)}</Button>
          )),
          field.min !== undefined && (
            <Button value="showTextInput">Custom</Button>
          ),
        ];
        intents = getPaginatedIntents(allButtons);
      }
      break;
    case "deposit":
      const deposit = currentState.deploymentOption.deposit;
      if (currentState.showTextInput) {
        intents = getTextInputIntents(deposit.min);
      } else {
        const allButtons = [
          <Button value="back">{"<"}</Button>,
          ...deposit.presets.map((preset: number) => (
            <Button value={`${preset}`}>{String(preset)}</Button>
          )),
          deposit.min !== undefined && (
            <Button value="showTextInput">Custom</Button>
          ),
        ];
        intents = getPaginatedIntents(allButtons);
      }
      break;
    case "review":
      intents = [
        <Button value="back">{"<"}</Button>,
        <Button value="submit">Submit</Button>,
      ];
      break;
    case "done":
      intents = [<Button value="restart">Start over</Button>];
      break;
  }

  return c.res({
    image: <FrameImage guiOptions={yamlData.gui} currentState={currentState} />,
    intents: intents,
  });
});

devtools(app, { serveStatic });

export const GET = handle(app);
export const POST = handle(app);
