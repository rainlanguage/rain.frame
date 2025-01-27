/** @jsxImportSource frog/jsx */

// import { getRainlangTextFromDotrainText } from "@/app/Utilities/Composers";
import { DeploymentOption, YamlData } from "@/app/types/yamlData";
import { FrameImage } from "@/app/UI/FrameImage";
import { Button, Frog, TextInput } from "frog";
import { devtools } from "frog/dev";
import { handle } from "frog/next";
import { serveStatic } from "frog/serve-static";
import yaml from "js-yaml";
import fs from "fs";

const yamlText = fs
  .readFileSync("streaming-gui-example.rain", "utf8")
  .split("---")[0];
const yamlData = yaml.load(yamlText) as YamlData;

const app = new Frog({
  assetsPath: "/",
  basePath: "/api",
  title: "Rain Frame",
  initialState: {
    strategyName: yamlData.gui.name,
    currentStep: "start",
    deploymentOption: undefined,
    bindings: {},
    deposit: undefined,
    buttonPage: 0,
    showTextInput: false,
    error: undefined,
  },
});

app.frame("/", async (c) => {
  const { buttonValue, inputText, deriveState } = c;

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
        const deploymentOptions = Object.values(yamlData.gui.deployments);
        if (deploymentOptions.length === 1) {
          // Deployment step can be skipped if there is only one deployment
          previousState.deployment = deploymentOptions[0].deployment;
          previousState.currentStep = "fields";
        } else {
          previousState.currentStep = "deployment";
        }
        break;
      case "deployment":
        if (buttonValue) {
          previousState.deploymentOption = JSON.parse(buttonValue);
          previousState.currentStep = "fields";
        }
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
            previousState.error = undefined;
          } else {
            previousState.error = `Value must be at least ${fields[currentBindingsCount].min}`;
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
            previousState.error = undefined;
          } else {
            previousState.error = `Value must be at least ${previousState.deploymentOption.deposit.min}`;
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
          previousState.deposit = undefined;
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
      const allButtons = yamlData.gui.deployments.map(
        (deploymentOption: DeploymentOption) => (
          <Button value={JSON.stringify(deploymentOption)}>
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
    image: `${c.req.url}/frameImage?currentState=${encodeURIComponent(
      JSON.stringify(currentState)
    )}`,
    intents,
  });
});

app.image("/frameImage", async (c) => {
  const currentState = JSON.parse(c.req.query("currentState") as string);
  currentState.strategyName = yamlData.gui.name;
  return c.res({
    image: <FrameImage currentState={currentState} />,
    headers: {
      "cache-control": "max-age=0",
    },
  });
});

devtools(app, { serveStatic });

export const GET = handle(app);
export const POST = handle(app);
