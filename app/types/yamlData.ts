export interface Field {
  binding: string;
  name: string;
  description: string;
  min?: number;
  presets: number[];
}

export interface Deposit {
  min: number;
  presets: number[];
}

export interface DeploymentOption {
  deployment: string;
  name: string;
  fields: Field[];
  deposit: Deposit;
}

export interface Gui {
  name: string;
  description: string;
  deploymentOptions: DeploymentOption[];
}

export interface YamlData {
  gui: Gui;
}
