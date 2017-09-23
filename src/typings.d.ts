/* SystemJS module definition */
declare var module: NodeModule;
interface NodeModule {
  id: string;
}


interface Window {
  listenerFn: any;  // required for some shennanigans in src/app/components/login.component.ts
  Dropbox: any;
  DOMParser: any;
  addResizeListener: any;
  removeResizeListener: any;
}

interface String {
  toCamelCase(): string;
  toKebabCase(): string;
}

interface Storage {
  setObject(key: string, value: any): void;
  getObject(key: string): any;
}

interface Number {
  siUnits(): string;
  iecUnits(): string;
}
