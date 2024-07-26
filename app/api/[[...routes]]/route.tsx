/** @jsxImportSource frog/jsx */

// import { getRainlangTextFromDotrainText } from "@/app/Utilities/Composers";
import { Button, Frog } from "frog";
import { devtools } from "frog/dev";
import { handle } from "frog/next";
import { serveStatic } from "frog/serve-static";
import yaml from "js-yaml";

const app = new Frog({
  assetsPath: "/",
  basePath: "/api",
  title: "Rain Frame",
});

// Uncomment to use Edge Runtime
// export const runtime = 'edge'

const yamlText = `
# This strategy will buy WFLR based on the price of the FTSO pair FLR/USD
#
# This strategy is a streaming strategy, meaning it has a fixed budget over time,
# vs a cooldown with set amounts per trade.

networks:
  flare-dca:
    rpc: https://rpc.ankr.com/flare
    chain-id: 14
    network-id: 14
    currency: FLR

subgraphs:
  flare-dca: https://api.goldsky.com/api/public/project_clv14x04y9kzi01saerx7bxpg/subgraphs/ob-flare-0xb06202aA/1.0.0/gn
  
metaboards:
  flare-dca: http://subgraphs.h20liquidity.tech/subgraphs/name/flare-mb-0x59401C93

orderbooks:
  flare-dca:
    address: 0xb06202aA3Fe7d85171fB7aA5f17011d17E63f382

deployers:
  flare-dca:
    address: 0xd58583e0C5C00C6DCF0137809EA58E9d55A72d66
    network: flare-dca

tokens:
  eusdt:
    network: flare-dca
    address: 0x96B41289D90444B8adD57e6F265DB5aE8651DF29
    decimals: 6
  weth:
    network: flare-dca
    address: 0x96B41289D90444B8adD57e6F265DB5aE8651DF29
    decimals: 6
  wflr:
    network: flare-dca
    address: 0x1D80c49BbBCd1C0911346656B529DF9E5c2F783d
    decimals: 18

orders:
  buy-wflr-w-usd:
    orderbook: flare-dca
    inputs:
      - token: wflr
        vault-id: 0xee4c4284a414696a5d768fb71329ffbb961a7184079aa0f25390deb29193b4f1
    outputs:
      - token: usdt
        vault-id: 0xee4c4284a414696a5d768fb71329ffbb961a7184079aa0f25390deb29193b4f1
      - token: usdc
        vault-id: 0xee4c4284a414696a5d768fb71329ffbb961a7184079aa0f25390deb29193b4f1
  buy-wflr-w-weth:
    orderbook: flare-dca
    inputs:
      - token: wflr
        vault-id: 0xee4c4284a414696a5d768fb71329ffbb961a7184079aa0f25390deb29193b4f1
    outputs:
      - token: weth
        vault-id: 0xee4c4284a414696a5d768fb71329ffbb961a7184079aa0f25390deb29193b4f1

scenarios:
  default:
    deployer: flare-dca
    runs: 1
    bindings:
      start-time: 123456
  other:
    deployer: flare-dca
    runs: 1
    bindings:

deployments:
  usd:
    scenario: default
    order: buy-wflr-w-usd
  weth:
    scenario: other
    order: buy-wflr-w-weth

gui:
  name: DCA into WFLR
  description: Buy FLARE!
  usd-option:
    deployment: usd
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
    deposit:
      min: 20
      presets: 
        - 10
        - 50
        - 100
  weth:
    deployment: weth
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
      

charts:
  DCA Strategy:
    scenario: default
    metrics:
      - label: Time elapsed
        description: (in seconds)
        value: 0.3
      - label: Budget to date
        unit-prefix: $
        value: 0.4
      - label: FLR-USD
        unit-prefix: $
        value: 0.7
      - label: USD-FLR
        value: 0.8
        unit-suffix: " FLR"
      - label: Final USD-FLR
        value: 0.10
        unit-suffix: " FLR"
`;

app.frame("/", async (c) => {
  const { buttonValue, status } = c;
  // // Proof of concept for Dotrain composition
  // if (buttonValue === "compose") {
  //   const dotrainText = `---
  //     #some-binding 100

  //     #abcd
  //     _ _: 1 some-binding,
  //     _: call<'another-source>();

  //     #efgh
  //     _ : sub(1 2);

  //     #another-source
  //     _ _: 1 2;

  //     #third
  //     _: 10;
  //   `;
  //   const rainlangText = await getRainlangTextFromDotrainText(dotrainText);
  //   console.log(rainlangText);
  // }
  const yamlData = yaml.load(yamlText);
  // console.log(yamlData);

  return c.res({
    image: (
      <div
        style={{
          alignItems: "center",
          background:
            status === "response"
              ? "linear-gradient(to right, #432889, #17101F)"
              : "black",
          backgroundSize: "100% 100%",
          display: "flex",
          flexDirection: "column",
          flexWrap: "nowrap",
          height: "100%",
          justifyContent: "center",
          textAlign: "center",
          width: "100%",
        }}
      >
        <div
          style={{
            color: "white",
            fontSize: 60,
            fontStyle: "normal",
            letterSpacing: "-0.025em",
            lineHeight: 1.4,
            marginTop: 30,
            padding: "0 120px",
            whiteSpace: "pre-wrap",
          }}
        >
          Ape into wFLR with 1 eUSDT per day
        </div>
      </div>
    ),
    intents: [
      <Button value="compose">Compose</Button>,
      !buttonValue && (
        <Button.Link href="http://localhost:3000/">Ape</Button.Link>
      ),
    ],
  });
});

devtools(app, { serveStatic });

export const GET = handle(app);
export const POST = handle(app);
