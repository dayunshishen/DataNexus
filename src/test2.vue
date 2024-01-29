<template>
  <div>
    <slot></slot> <!-- 使用 slot 来插入子组件 -->
  </div>
</template>


<script>
  import { setMainBusInstance } from './mainBusPluginSystem.js';
  export default  {
    name: 'mainBusDemo',
    props: {
      sharedDataNames: {
        type: Array,
        required: true
      }
    },
    data() {
      return {
        subscribers: {}, // 存储数据变化的订阅者
        dependencies: {}, // 用于存储依赖关系
        sharedData: {}, // 存储共享数据
        isLoading: {}, // 动态处理数据加载状态
        error: {}, // 动态处理错误信息
        registeredComponents: [], // 跟踪注册的子组件
        plugins: {}, // 初始化插件存储对象
        snapshots: [], // 存储状态快照
        // 存储描述性注释
        sharedDataAnnotations: {},
        // 存储订阅者的回调函数
        subscribers: {}
      };
    },
    provide() {
      return {
        // 共享数据对象，包含了所有可以在子组件之间共享的数据。
        sharedData: this.sharedData,

        // isLoading 对象，用于跟踪每个共享数据是否处于加载状态。
        isLoading: this.isLoading,

        // error 对象，用于存储与每个共享数据相关的错误信息。
        error: this.error,

        // 依赖关系对象。
        dependencies:this.dependencies,

        /**
         * 更新共享数据的方法。
         * 可以由子组件调用来更新 `MainBus` 中的共享数据。
         */
        updateSharedData: this.updateSharedData,


        bindSharedData:this.bindSharedData,


        /**
         * 订阅数据变化的方法。
         * 子组件可以使用此方法来订阅特定数据的变化。
         */
        subscribeToData: this.subscribeToData,
        //
        // /** 简化：注册依赖关系。*/
        // registerDependency:this.registerDependency,

        /**
         * 根据特定条件更新共享数据的方法。
         * 只有当给定条件函数返回 true 时，才会更新数据。
         * 这个方法可以优化性能，避免在不必要的情况下更新数据。
         */
        conditionalUpdateSharedData:this.conditionalUpdateSharedData,

        /**
         获取插件的特定方法。
         */
        getPluginMethod: this.getPluginMethod,

        /**
         * 触发全局事件的方法。
         * 子组件可以调用此方法来触发全局事件。
         */
        emitGlobalEvent: this.emitGlobalEvent,

        /**
         * 动态添加共享数据键的方法。
         * 允许动态地在 `MainBus` 中添加新的共享数据键。
         */
        addSharedDataKey: this.addSharedDataKey,

        /**
         * 动态移除共享数据键的方法。
         * 允许从 `MainBus` 中移除已有的共享数据键。
         */
        removeSharedDataKey: this.removeSharedDataKey,

        /**
         * 捕获当前共享数据状态的快照。
         * 用于记录 `MainBus` 当前状态，以便将来恢复。
         */
        takeSnapshot: this.takeSnapshot,

        /**
         * 恢复到之前的快照状态。
         * 根据提供的索引，将 `MainBus` 的状态恢复到之前的某个快照。
         */
        restoreSnapshot: this.restoreSnapshot
      };
    },
    methods: {
      // /**
      //  * 订阅数据变化。
      //  * @param {String} key - 要订阅的数据键。
      //  * @param {Function} callback - 数据变化时调用的回调函数。
      //  */
      // subscribeToData(key, callback) {
      //   if (!this.subscribers[key]) {
      //     this.subscribers[key] = [];
      //   }
      //   this.subscribers[key].push(callback);
      // },
      /**
       * 订阅数据变化。
       * @param {String} key - 要订阅的数据键。
       * @param {Function} callback - 数据变化时调用的回调函数。
       */
      subscribeToData(localDataKey, description, callback) {
        // 存储描述性注释
        this.sharedDataAnnotations[localDataKey] = description;
        // 注册订阅者的回调
        if (!this.subscribers[localDataKey]) {
          this.subscribers[localDataKey] = [];
        }
        this.subscribers[localDataKey].push(callback);
      },
      // 绑定共享数据
      bindSharedData(localDataKey, sharedDataKey) {
        if (!this.sharedData.hasOwnProperty(sharedDataKey)) {
          this.sharedData[sharedDataKey] = null; // 初始化共享数据
        }
        // 当共享数据更新时，通知所有订阅了localDataKey的组件
        this.$watch(
          () => this.sharedData[sharedDataKey],
          (newValue) => {
            if (this.subscribers[localDataKey]) {
              this.subscribers[localDataKey].forEach(callback => {
                // 更新订阅者组件的内部数据
                callback(newValue);
              });
            }
          }
        );
      },

      // /** /**
      //  * 简化：注册依赖关系。
      //  * @param {String} dependentKey - 依赖项的键名。
      //  * @param {Array} sourceKeys - 被依赖项的键名数组。
      //  * @param {Function} computeFn - 依赖计算函数。
      //  */
      //   registerDependency(dependentKey, sourceKeys, computeFn) {
      //     this.dependencies[dependentKey] = { sourceKeys, computeFn };
      //   },
      /**
       * 当数据更新时，通知所有订阅者。
       * @param {String} key - 更新的数据键。
       */
      notifySubscribers(key) {
        if (this.subscribers[key]) {
          this.subscribers[key].forEach(callback => callback({
            value: this.sharedData[key],
            isLoading: this.isLoading[key],
            error: this.error[key]
          }));
        }
      },
      /**
       * 更新共享数据的值。
       * @param {String} name - 共享数据的键名。
       * @param {any} value - 要设置的新值。
       * @param {Boolean} [isLoading=false] - 表示数据是否正在加载。
       * @param {any} [error=null] - 表示与数据相关的错误信息。
       */
      updateSharedData(name, value, isLoading = false, error = null) {
        if (this.sharedDataNames.includes(name)) {
          this.$set(this.sharedData, name, value); // 更新共享数据
          this.$set(this.isLoading, name, isLoading); // 更新加载状态
          this.$set(this.error, name, error); // 更新错误信息
          // 通知所有订阅了该数据的组件
          this.notifySubscribers(name, {
            value: this.sharedData[name],
            isLoading: this.isLoading[name],
            error: this.error[name]
          });
          this.updateDependencies(name);
        }
      },
      //
      // /**
      //  * 根据条件更新共享数据。
      //  * @param {String} name - 共享数据的键名。
      //  * @param {any} value - 要设置的新值。
      //  * @param {Function} condition - 决定是否更新数据的条件函数。
      //  */
      //   conditionalUpdateSharedData(name, value, condition) {
      //   if (this.sharedDataNames.includes(name) && condition(this.sharedData[name], value)) {
      //     this.updateSharedData(name, value);
      //     this.updateDependencies(name)
      //   }
      // },
      // /**
      //  * 更新依赖项。
      //  * @param {String} sourceKey - 被更新的数据键名。
      //  */
      // updateDependencies(sourceKey) {
      //   Object.entries(this.dependencies).forEach(([dependentKey, { sourceKeys, computeFn }]) => {
      //     if (sourceKeys.includes(sourceKey)) {
      //       const newDependentValue = computeFn(this.sharedData);
      //       this.updateSharedData(dependentKey, newDependentValue);
      //     }
      //   });
      // },
      /**
       //  * 注册插件。
       //  * @param {String} pluginName - 插件的名称。
       //  * @param {Object} plugin - 插件实例，必须包含一个 'install' 方法。
       //  */
      // registerPlugin(pluginName, plugin) {
      //   if (plugin && typeof plugin.install === 'function') {
      //     this.plugins[pluginName] = plugin;
      //   } else {
      //     console.error(`插件 "${pluginName}" 必须包含 'install' 方法。`);
      //   }
      // },
      /**
       * 获取插件的特定方法。
       * @param {String} pluginName - 插件的名称。
       * @param {String} methodName - 需要获取的插件方法的名称。
       * @returns {Function|undefined} 返回插件方法，如果该方法不存在则返回 undefined。
       */
      getPluginMethod(pluginName, methodName) {
        if (typeof this[methodName] === 'function') {
          // 返回一个绑定了mainBus实例的函数
          return this[methodName].bind(this);
        } else {
          console.error(`方法 ${methodName} 不存在`);
          return undefined;
        }
      },

      /**
       * 安装所有已注册的插件。
       * 遍历 plugins 对象中的每个插件，并调用它们的 install 方法。
       */
      installPlugins(){
        Object.values(this.plugins).forEach(plugin => {
          if (typeof plugin.install === 'function') {
            plugin.install(this);
            console.log(`插件 ${plugin.name} 安装成功`);
            console.log(plugin,'123123');
          }
        });
      },
      /**
       * 触发一个全局事件。
       * @param {String} eventName - 事件名称。
       * @param {any} payload - 事件携带的数据。
       */
      emitGlobalEvent(eventName, payload) {
        this.$emit(eventName, payload);
      },

      /**
       * 动态添加一个新的共享数据键。
       * @param {String} key - 要添加的数据键。
       * @param {any} [initialValue=null] - 数据键的初始值。
       */
      addSharedDataKey(key, initialValue = null) {
        this.$set(this.sharedData, key, initialValue);
        this.$set(this.isLoading, key, false);
        this.$set(this.error, key, null);
      },

      /**
       * 动态移除一个共享数据键。
       * @param {String} key - 要移除的数据键。
       */
      removeSharedDataKey(key) {
        this.$delete(this.sharedData, key);
        this.$delete(this.isLoading, key);
        this.$delete(this.error, key);
      },

      /**
       * 捕获并存储当前共享数据的快照。
       */
      takeSnapshot() {
        this.snapshots.push(JSON.parse(JSON.stringify(this.sharedData)));
      },

      /**
       * 恢复到指定的快照状态。
       * @param {Number} index - 要恢复的快照索引。
       */
      restoreSnapshot(index) {
        if (index >= 0 && index < this.snapshots.length) {
          this.sharedData = this.snapshots[index];
        }
      }
    },
    created() {
      setMainBusInstance(this);
      this.installPlugins(); // 在组件创建时安装所有插件
    },
  };
  // // 静态方法：注册插件
  // MainBus.registerPlugin = function(pluginName, plugin) {
  //   console.log(this.plugins)
  //   if (!this.plugins) {
  //     this.plugins = {};
  //   }
  //
  //   if (plugin.install && typeof plugin.install === 'function') {
  //     this.plugins[pluginName] = plugin;
  //   } else {
  //     console.error(`插件 "${pluginName}" 必须包含 'install' 方法。`);
  //   }
  // };
  //
  // export default MainBus;
</script>

<style scoped>

</style>
