  <template>
    <div>
      <slot></slot> <!-- 使用 slot 来插入子组件 -->
    </div>
  </template>


  <script>
    import { setMainBusInstance } from './mainBusPluginSystem.js';
    export default  {
      name: 'mainBus',
      data() {
        return {
          sharedData: {}, // 用于存储共享数据
          updateCallbacks: {}, // 存储子组件的更新回调函数
          sharedBindings: {}, // 用于存储数据项到共享数据源的绑定关系
          plugins: {} // 定义 plugins 对象
        };
      },
      provide() {
        return {
          mainBus: this,
          getComponentName: () => this.$options.name,
          // 共享数据对象，包含了所有可以在子组件之间共享的数据。
          subscribeToDataChange: this.subscribeToDataChange,  //订阅
          updateSharedData: this.updateSharedData, // 新增
          emitGlobalEvent: this.emitGlobalEvent, // 新增全局事件广播
          addSharedDataKey: this.bindSharedData,
          removeSharedDataKey: this.removeSharedDataKey,
          getSharedData: this.getSharedData
        }
      },
      methods: {
        /**
         * 注册一个回调函数以响应指定数据的变化。
         * @param {String} componentName - 调用组件的名称。
         * @param {String} key - 监听的数据键。
         * @param {Function} callback - 当数据变化时将被调用的函数。
         */
        subscribeToDataChange(componentName, key, callback) {
          // 确保提供了组件名称
          if (!componentName) {
            console.error("Error: componentName must be provided for subscribeToDataChange.");
            return;
          }

          // 确保提供的回调函数是有效的
          if (!callback || typeof callback !== 'function') {
            console.error("Invalid callback function");
            return;
          }

          // 创建一个基于组件名称和键的唯一标识符
          const uniqueKey = `${componentName}_${key}`;

          // 防止对同一键重复注册回调
          if (this.updateCallbacks[uniqueKey]) {
            console.error(`Update callback for key '${uniqueKey}' already registered`);
            return;
          }

          // 注册回调并设置数据监听器
          this.updateCallbacks[uniqueKey] = callback;
          this.$watch(
            () => this.sharedData[this.sharedBindings[uniqueKey] || key],
            (newValue) => {
              callback(newValue);
            },
            { immediate: false, deep: true }
          );

          // 如果共享数据中已经有初始值，则立即用它来初始化
          if (this.sharedData.hasOwnProperty(key)) {
            callback(this.sharedData[key]);
          }
        },

        /**
         * 更新共享数据并通知所有绑定的组件。
         * @param {String} componentName - 更新数据的组件名称。
         * @param {String} key - 更新的数据键。
         * @param {any} newValue - 新的数据值。
         */
        updateSharedData(componentName, key, newValue) {
          // 创建基于组件名称和键的唯一标识符
          const uniqueKey = `${componentName}_${key}`;

          // 定义共享键，并根据 uniqueKey 更新共享数据
          let sharedKey;
          if (this.sharedBindings[uniqueKey]) {
            sharedKey = this.sharedBindings[uniqueKey];
            this.sharedData[sharedKey] = newValue;
          } else {
            sharedKey = key;
            this.sharedData[key] = newValue;
          }

          // 遍历所有绑定项，更新绑定到此共享数据的组件
          Object.keys(this.sharedBindings).forEach(itemKey => {
            if (this.sharedBindings[itemKey] === sharedKey) {
              if (this.updateCallbacks[itemKey]) {
                this.updateCallbacks[itemKey](newValue);
              }
            }
          });
        },
        /**
         * 从JSON URL加载数据绑定配置。
         * @param {String} jsonURL - 配置文件的URL地址。
         */
        async loadBindingsFromJSON(jsonURL) {

          try {
            // 发送HTTP请求以获取JSON数据
            const response = await fetch(jsonURL);
            console.log(response)
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }

            // 检查响应的内容类型是否为JSON
            const contentType = response.headers.get('Content-Type');
            if (!contentType || !contentType.includes('application/json')) {
              throw new TypeError('Fetched data is not JSON!');
            }

            // 解析JSON数据
            const data = await response.json();

            // 处理每个组件的绑定配置
            Object.keys(data.components).forEach(componentName => {
              data.components[componentName].bindings.forEach(binding => {
                this.bindSharedData(componentName, binding.key, binding.target);
              });
            });
          } catch (error) {
            // 处理加载或解析JSON时的错误
            console.error("Error loading or parsing JSON:", error);
          }
        },

        /**
         * 将组件的数据项绑定到共享数据源。      动态添加数据键的方法
         * @param {String} componentName - 组件名称。
         * @param {String} dataKey - 组件内部的数据键。
         * @param {String} sharedKey - 共享数据源的键。
         * @param {Boolean} isTwoWay - 是否为双向绑定。
         */
        bindSharedData(componentName, dataKey, sharedKey, isTwoWay) {
          const uniqueKey = `${componentName}_${dataKey}`;
          this.sharedBindings[uniqueKey] = sharedKey;
          console.log(componentName, dataKey, sharedKey,)
          if (isTwoWay) {
            // 监听共享数据变化，并更新绑定到这个共享数据的所有组件内部数据
            this.$watch(() => this.sharedData[sharedKey], newValue => {
              Object.keys(this.sharedBindings).forEach(itemKey => {
                if (this.sharedBindings[itemKey] === sharedKey) {
                  const [bindingComponent, bindingKey] = itemKey.split('_');
                  if (this.updateCallbacks[itemKey]) {
                    this.updateCallbacks[itemKey](newValue);
                  } else {
                    // 如果没有注册回调，则直接更新组件内部数据
                    const componentInstances = this.$root.$children.filter(c => c.$options.name === bindingComponent);
                    componentInstances.forEach(instance => {
                      instance[bindingKey] = newValue;
                    });
                  }
                }
              });
            }, { immediate: true, deep: true });
          }

          // // 初始化组件内部数据
          // if (this.sharedData.hasOwnProperty(sharedKey)) {
          //   this.$set(this.sharedData, uniqueKey, this.sharedData[sharedKey]);
          // }
        },
        // 删除数据键的方法
        removeSharedDataKey(componentName, dataKey) {
          // 构建唯一标识符
          const uniqueKey = `${componentName}_${dataKey}`;

          // 检查是否有这个绑定存在
          if (this.sharedBindings[uniqueKey]) {
            // 获取共享数据键
            const sharedKey = this.sharedBindings[uniqueKey];

            // 移除绑定关系
            delete this.sharedBindings[uniqueKey];

            // 如果没有其他组件绑定到这个共享数据键，则可以考虑从共享数据中移除它
            const isSharedKeyUsed = Object.values(this.sharedBindings).includes(sharedKey);
            if (!isSharedKeyUsed) {
              this.$delete(this.sharedData, sharedKey);
            }
          }

          // 如果有注册的回调，也需要移除
          if (this.updateCallbacks[uniqueKey]) {
            delete this.updateCallbacks[uniqueKey];
          }
        },

        // 获取共享数据键的方法
        getSharedData(componentName, dataKey) {
          // 构建唯一标识符来识别绑定的共享数据
          const uniqueKey = `${componentName}_${dataKey}`;

          // 检查这个键是否有对应的共享数据绑定
          if (this.sharedBindings[uniqueKey]) {
            // 获取共享数据键
            const sharedKey = this.sharedBindings[uniqueKey];

            // 返回共享数据的值
            return this.sharedData[sharedKey];
          }

          // 如果没有找到绑定的共享数据，返回 undefined 或其他默认值
          return undefined;
        },
      },
      created() {
        setMainBusInstance(this);
      },
    };
  </script>

  <style scoped>

  </style>
