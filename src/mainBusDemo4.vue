<template>
  <div>
    <slot></slot> <!-- 使用 slot 来插入子组件 -->
  </div>
</template>


<script>
  import { setMainBusInstance } from './mainBusPluginSystem.js';
  export default  {
    name: 'mainBus',
    props: {
      sharedDataNames: {
        type: Array,
        required: false
      }
    },
    data() {
      return {
        sharedData: {}, // 用于存储共享数据
        updateCallbacks: {}, // 存储子组件的更新回调函数
        sharedBindings: {} // 用于存储数据项到共享数据源的绑定关系
      };
    },
    provide() {
      return {
        // 共享数据对象，包含了所有可以在子组件之间共享的数据。
        registerUpdateCallback: this.registerUpdateCallback,  // 新增
        updateData: this.updateData  // 新增
      }
    },
    methods: {
      registerUpdateCallback(key, callback) {
        if (!callback || typeof callback !== 'function') {
          console.error("Invalid callback function");
          return;
        }

        // 检查是否已经存在对应的回调
        if (this.updateCallbacks[key]) {
          console.error(`Update callback for key '${key}' already registered`);
          return;
        }

        // 注册更新回调
        this.updateCallbacks[key] = callback;

        // 设置监听器来监视共享数据的特定属性
        this.$watch(
          () => this.sharedData[key],
          (newValue) => {
            // 执行回调函数
            callback(newValue);

            // 触发其他已注册的回调（如果需要的话）
            if (this.sharedBindings[key]) {
              Object.keys(this.sharedBindings[key]).forEach(boundKey => {
                if (this.updateCallbacks[boundKey]) {
                  this.updateCallbacks[boundKey](newValue);
                }
              });
            }
          },
          { immediate: false, deep: true }
        );

        // 使用 sharedData 中的初始值初始化（如果存在的话）
        if (this.sharedData.hasOwnProperty(key)) {
          callback(this.sharedData[key]);
        }
      },

      // 更新数据
      updateData(key, newValue) {
        // 更新共享数据源
        if (this.sharedBindings[key]) {
          const sharedKey = this.sharedBindings[key];
          this.sharedData[sharedKey] = newValue;
        } else {
          this.sharedData[key] = newValue;
        }

        // 更新所有绑定的数据项
        Object.keys(this.sharedBindings).forEach(itemKey => {
          if (this.sharedBindings[itemKey] === this.sharedBindings[key]) {
            if (this.updateCallbacks[itemKey]) {
              this.updateCallbacks[itemKey](newValue);
            }
          }
        });
      },
      async loadBindingsFromJSON(jsonURL) {
        try {
          // 发送请求
          const response = await fetch(jsonURL);

          // 检查响应是否成功
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }

          // 检查内容类型是否为 JSON
          const contentType = response.headers.get('Content-Type');
          if (!contentType || !contentType.includes('application/json')) {
            throw new TypeError('Fetched data is not JSON!');
          }

          // 尝试解析 JSON
          const data = await response.json();
          console.log(data.bindings)
          // 处理数据
          data.bindings.forEach(binding => {
            this.bindSharedData(binding.source, binding.target, true);
          });
        } catch (error) {
          // 处理错误
          console.error("Error loading or parsing JSON:", error);
        }
      },
      // 绑定数据到共享数据源
      bindSharedData(dataKey, sharedKey, isTwoWay) {
        // 绑定数据项到共享数据源
        this.sharedBindings[dataKey] = sharedKey;

        // 如果是双向绑定，监听共享数据源的变化
        if (isTwoWay) {
          this.$watch(() => this.sharedData[sharedKey], newValue => {
            Object.keys(this.sharedBindings).forEach(itemKey => {
              if (this.sharedBindings[itemKey] === sharedKey) {
                if (this.updateCallbacks[itemKey]) {
                  this.updateCallbacks[itemKey](newValue);
                }
              }
            });
          });
        }
      }
    },
    created() {
      setMainBusInstance(this);
    },
  };
</script>

<style scoped>

</style>
