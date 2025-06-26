/**
 * TypeScript集成服务
 * 提供TypeScript、React、Vue的代码补全支持
 */

// TypeScript支持配置
export interface TypeScriptConfig {
  enableReactSupport?: boolean;
  enableVueSupport?: boolean;
  strictMode?: boolean;
  jsxMode?: 'react' | 'react-jsx' | 'preserve';
}

// TypeScript服务类
export class TypeScriptService {
  private config: TypeScriptConfig;
  private isInitialized = false;

  constructor(config: TypeScriptConfig = {}) {
    this.config = {
      enableReactSupport: false,
      enableVueSupport: false,
      strictMode: true,
      jsxMode: 'react-jsx',
      ...config
    };
  }

  // 初始化TypeScript服务
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('Initializing TypeScript Service...');
      console.log('Config:', this.config);
      
      this.isInitialized = true;
      console.log('TypeScript Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize TypeScript Service:', error);
    }
  }

  // 获取TypeScript代码片段
  getTypeScriptSnippets(): Array<{label: string, template: string, description: string}> {
    const snippets = [
      // TypeScript基础
      {
        label: 'interface',
        template: 'interface ${1:Name} {\n\t${2:property}: ${3:type};\n}',
        description: 'TypeScript接口定义'
      },
      {
        label: 'type',
        template: 'type ${1:Name} = ${2:type};',
        description: 'TypeScript类型别名'
      },
      {
        label: 'enum',
        template: 'enum ${1:Name} {\n\t${2:Value1},\n\t${3:Value2}\n}',
        description: 'TypeScript枚举'
      },
      {
        label: 'class',
        template: 'class ${1:Name} {\n\tconstructor(${2:params}) {\n\t\t${3}\n\t}\n\n\t${4:method}(): ${5:returnType} {\n\t\t${6}\n\t}\n}',
        description: 'TypeScript类定义'
      }
    ];

    // React相关片段
    if (this.config.enableReactSupport) {
      snippets.push(
        {
          label: 'useState',
          template: 'const [${1:state}, set${1/(.*)/${1:/capitalize}/}] = useState<${2:type}>(${3:initialValue});',
          description: 'React useState Hook'
        },
        {
          label: 'useEffect',
          template: 'useEffect(() => {\n\t${1}\n}, [${2:dependencies}]);',
          description: 'React useEffect Hook'
        },
        {
          label: 'useContext',
          template: 'const ${1:value} = useContext(${2:Context});',
          description: 'React useContext Hook'
        },
        {
          label: 'React.FC',
          template: 'const ${1:ComponentName}: React.FC<${2:Props}> = (${3:props}) => {\n\treturn (\n\t\t${4:<div></div>}\n\t);\n};',
          description: 'React函数组件'
        }
      );
    }

    // Vue相关片段
    if (this.config.enableVueSupport) {
      snippets.push(
        {
          label: 'ref',
          template: 'const ${1:value} = ref<${2:type}>(${3:initialValue});',
          description: 'Vue ref响应式数据'
        },
        {
          label: 'reactive',
          template: 'const ${1:state} = reactive<${2:type}>(${3:initialState});',
          description: 'Vue reactive响应式对象'
        },
        {
          label: 'computed',
          template: 'const ${1:computed} = computed(() => ${2:expression});',
          description: 'Vue computed计算属性'
        },
        {
          label: 'defineComponent',
          template: 'export default defineComponent({\n\tsetup() {\n\t\t${1}\n\t\treturn {\n\t\t\t${2}\n\t\t};\n\t}\n});',
          description: 'Vue组件定义'
        }
      );
    }

    return snippets;
  }

  // 获取TypeScript类型建议
  getTypeScriptTypes(): Array<{label: string, description: string}> {
    return [
      { label: 'string', description: '字符串类型' },
      { label: 'number', description: '数字类型' },
      { label: 'boolean', description: '布尔类型' },
      { label: 'object', description: '对象类型' },
      { label: 'any', description: '任意类型' },
      { label: 'unknown', description: '未知类型' },
      { label: 'void', description: '空类型' },
      { label: 'null', description: 'null类型' },
      { label: 'undefined', description: 'undefined类型' },
      { label: 'never', description: 'never类型' },
      { label: 'Array<T>', description: '数组类型' },
      { label: 'Record<K, V>', description: '记录类型' },
      { label: 'Partial<T>', description: '部分类型' },
      { label: 'Required<T>', description: '必需类型' },
      { label: 'Readonly<T>', description: '只读类型' },
      { label: 'Pick<T, K>', description: '提取类型' },
      { label: 'Omit<T, K>', description: '忽略类型' }
    ];
  }

  // 获取配置信息
  getConfig(): TypeScriptConfig {
    return { ...this.config };
  }

  // 更新配置
  updateConfig(newConfig: Partial<TypeScriptConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('TypeScript service config updated:', this.config);
  }

  // 清理资源
  dispose(): void {
    this.isInitialized = false;
    console.log('TypeScript service disposed');
  }
}

// 创建TypeScript服务实例的便捷函数
export function createTypeScriptService(config?: TypeScriptConfig): TypeScriptService {
  const service = new TypeScriptService(config);
  
  // 异步初始化
  service.initialize().catch(error => {
    console.error('TypeScript service initialization failed:', error);
  });

  return service;
}

// 导出默认配置
export const defaultTypeScriptConfig: TypeScriptConfig = {
  enableReactSupport: false,
  enableVueSupport: false,
  strictMode: true,
  jsxMode: 'react-jsx'
};

// 导出服务实例（单例模式）
export const typeScriptService = createTypeScriptService(defaultTypeScriptConfig);