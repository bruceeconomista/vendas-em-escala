declare module 'react-plotly.js' {
  import * as React from 'react';
  import { Layout, Data, Config, PlotlyHTMLElement } from 'plotly.js';

  interface PlotParams {
    data: Data[];
    layout?: Partial<Layout>;
    config?: Partial<Config>;
    style?: React.CSSProperties;
    className?: string;
    onInitialized?: (figure: { data: Data[]; layout: Partial<Layout>; frames: any }) => void;
    onUpdate?: (figure: { data: Data[]; layout: Partial<Layout>; frames: any }) => void;
    onRelayout?: (layout: Partial<Layout>) => void;
    useResizeHandler?: boolean;
    divId?: string;
    debug?: boolean;
    revision?: number;
    plotly?: any;
  }

  export default class Plot extends React.Component<PlotParams> {}
}
