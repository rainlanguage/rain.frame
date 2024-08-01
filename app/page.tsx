import { getFrameMetadata } from "frog/next";
import type { Metadata } from "next";
import styles from "./page.module.css";
import DeployStratButton from "./deployStratButton";
import WithdrawButton from "./withdraw";
import { ComposeButton } from "./ComposeButton";

export async function generateMetadata(): Promise<Metadata> {
  const frameTags = await getFrameMetadata(
    `${process.env.VERCEL_URL || "http://localhost:3000"}/api`
  );
  return {
    other: frameTags,
  };
}

export default async function Home() {
  const currentState = {
    currentStep: "start",
    deploymentOption: undefined,
    bindings: {},
    deposit: undefined,
    buttonPage: 0,
    showTextInput: false,
    error: undefined,
  };
  return (
    <main className={styles.main}>
      <div>
        <DeployStratButton />
        <WithdrawButton />
        <ComposeButton />
      </div>
      <div>
        <img
          src={`http://localhost:3000/api/frameImage?currentState=${encodeURIComponent(
            JSON.stringify(currentState)
          )}`}
        />
      </div>
    </main>
  );
}
