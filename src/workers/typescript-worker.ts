/**
 * TypeScript Worker 基础框架
 * 
 * 安装依赖后使用完整版本：
 * npm install @valtown/codemirror-ts @typescript/vfs typescript comlink @typescript/ata
 */

// 基础的TypeScript Worker实现
class TypeScriptWorker {
  private files: Map<string, string> = new Map();
  private config: any = {
    strict: true,
    jsx: 'react-jsx',
    target: 'es2022'
  };

  // 添加文件到虚拟文件系统
  async addFile(path: string, content: string): Promise<void> {
    this.files.set(path, content);
    console.log(`Added file: ${path}`);
  }

  // 批量添加文件
  async addFiles(files: Record<string, string>): Promise<void> {
    for (const [path, content] of Object.entries(files)) {
      await this.addFile(path, content);
    }
  }

  // 获取文件内容
  async getFile(path: string): Promise<string | undefined> {
    return this.files.get(path);
  }

  // 获取所有文件
  async getAllFiles(): Promise<Record<string, string>> {
    const result: Record<string, string> = {};
    const entries = Array.from(this.files.entries());
    for (const [path, content] of entries) {
      result[path] = content;
    }
    return result;
  }

  // 设置项目配置
  async setProjectConfig(config: {
    strict?: boolean;
    jsx?: 'react' | 'react-jsx' | 'preserve';
    target?: 'es5' | 'es2015' | 'es2017' | 'es2018' | 'es2019' | 'es2020' | 'es2021' | 'es2022';
  }): Promise<void> {
    this.config = { ...this.config, ...config };
    console.log('Updated TypeScript config:', this.config);
  }

  // 添加React类型支持
  async addReactTypes(): Promise<boolean> {
    const reactTypes = `
declare namespace React {
  interface Component<P = {}, S = {}> {
    props: P;
    state: S;
    setState(state: Partial<S>): void;
    render(): JSX.Element | null;
  }
  
  interface FunctionComponent<P = {}> {
    (props: P): JSX.Element | null;
  }
  
  type FC<P = {}> = FunctionComponent<P>;
  
  function useState<T>(initialState: T): [T, (value: T | ((prev: T) => T)) => void];
  function useEffect(effect: () => void | (() => void), deps?: any[]): void;
  function useContext<T>(context: React.Context<T>): T;
  function useCallback<T extends (...args: any[]) => any>(
    callback: T,
    deps: any[]
  ): T;
  function useMemo<T>(factory: () => T, deps: any[]): T;
  function useRef<T>(initialValue: T): React.MutableRefObject<T>;
  function useRef<T = undefined>(): React.MutableRefObject<T | undefined>;
}

declare namespace JSX {
  interface Element {}
  interface IntrinsicElements {
    div: any;
    span: any;
    p: any;
    h1: any;
    h2: any;
    h3: any;
    button: any;
    input: any;
    form: any;
    img: any;
    a: any;
  }
}
`;

    await this.addFile('/types/react.d.ts', reactTypes);
    return true;
  }

  // 添加Vue类型支持
  async addVueTypes(): Promise<boolean> {
    const vueTypes = `
declare module 'vue' {
  export function defineComponent<T>(options: T): T;
  export function ref<T>(value: T): { value: T };
  export function reactive<T>(obj: T): T;
  export function computed<T>(fn: () => T): { value: T };
  export function watch<T>(source: T, callback: (newVal: T, oldVal: T) => void): void;
  export function onMounted(fn: () => void): void;
  export function onUnmounted(fn: () => void): void;
  export function nextTick(fn?: () => void): Promise<void>;
  
  interface SetupContext {
    attrs: Record<string, any>;
    slots: Record<string, any>;
    emit: (event: string, ...args: any[]) => void;
  }
}
`;

    await this.addFile('/types/vue.d.ts', vueTypes);
    return true;
  }

  // 预加载常用类型
  async preloadCommonTypes(): Promise<boolean> {
    const commonTypes = `
// 扩展的Console接口
interface Console {
  table(data: any): void;
  group(label?: string): void;
  groupEnd(): void;
  time(label?: string): void;
  timeEnd(label?: string): void;
}

// Storage接口
interface Storage {
  readonly length: number;
  clear(): void;
  getItem(key: string): string | null;
  key(index: number): string | null;
  removeItem(key: string): void;
  setItem(key: string, value: string): void;
}

declare var localStorage: Storage;
declare var sessionStorage: Storage;

// 常用的全局类型
declare function setTimeout(callback: () => void, ms: number): number;
declare function clearTimeout(id: number): void;
declare function setInterval(callback: () => void, ms: number): number;
declare function clearInterval(id: number): void;

// Fetch API
declare function fetch(url: string, init?: RequestInit): Promise<Response>;

interface RequestInit {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
}

interface Response {
  ok: boolean;
  status: number;
  json(): Promise<any>;
  text(): Promise<string>;
}
`;

    await this.addFile('/types/common.d.ts', commonTypes);
    return true;
  }

  // 初始化worker（模拟）
  async initialize(): Promise<void> {
    console.log('TypeScript Worker initialized (basic version)');
    console.log('To use full TypeScript Language Server, install:');
    console.log('npm install @valtown/codemirror-ts @typescript/vfs typescript comlink @typescript/ata');
    
    // 预加载基础类型
    await this.preloadCommonTypes();
  }
}

// 创建worker实例
const worker = new TypeScriptWorker();

// 导出worker接口（模拟Comlink）
const workerInterface = {
  initialize: () => worker.initialize(),
  addFile: (path: string, content: string) => worker.addFile(path, content),
  addFiles: (files: Record<string, string>) => worker.addFiles(files),
  getFile: (path: string) => worker.getFile(path),
  getAllFiles: () => worker.getAllFiles(),
  setProjectConfig: (config: any) => worker.setProjectConfig(config),
  addReactTypes: () => worker.addReactTypes(),
  addVueTypes: () => worker.addVueTypes(),
  preloadCommonTypes: () => worker.preloadCommonTypes()
};

// 在真实环境中，这里会使用 Comlink.expose(workerInterface);
// 现在只是导出类型
export type TypeScriptWorkerInterface = typeof workerInterface;
export default workerInterface;