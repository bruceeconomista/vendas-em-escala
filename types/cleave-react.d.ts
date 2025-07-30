declare module 'cleave.js/react' {
  import * as React from 'react';

  interface CleaveProps extends React.InputHTMLAttributes<HTMLInputElement> {
    options?: any;
    onInit?: (cleave: any) => void;
  }

  export default class Cleave extends React.Component<CleaveProps> {}
}
