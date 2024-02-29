# DataNexus

DataNexus Vue 组件介绍
DataNexus 是一个 Vue 组件，旨在提供中央状态管理和事件广播功能。它允许在 Vue 应用中的不同组件间共享数据，处理加载状态和错误信息，并支持数据项到共享数据源的动态绑定。

特性
共享数据管理：实现多个组件之间的数据共享。
动态加载状态和错误处理：支持从外部JSON文件动态加载数据绑定配置，并处理加载中的状态和错误。
动态数据键管理：允许动态地管理数据键与共享数据源的绑定。
双向绑定支持：支持双向数据绑定，确保数据在组件间实时同步。
动态数据键管理：开发人员自由动态增删改共享数据。
动态表格管理：可视化配置表接口，表头，表参数，实现动态显示表格的功能  //待开发


安装
将 DataNexus文件夹放置在您的 Vue.js 项目的 components 目录中。

/****快速开始指南*//

引入并注册组件
在您的 Vue 应用中引入并注册 DataNexus 组件。

 ```javascript
import DataNexus from 'path/to/DataNexus.vue';


export default {
  components: {
    DataNexus
  }
  // ...
}
 ```
在父组件中使用
在父组件的模板中，将 DataNexus 组件包裹在需要共享状态的子组件外。

 ```html
<template>
  <data-Nexus >
    <!-- 子组件放置在这里 -->
  </data-Nexus>
</template>
 ```
 
 
在子组件中使用
在子组件中，通过依赖注入使用 DataNexus 提供的方法。

 ```javascript
export default {
  inject: ['subscribeToDataChange', 'updateSharedData'],
  mounted() {
    // 注册数据更新回调
    this.subscribeToDataChange('MyComponent', 'myDataKey', (newValue) => {
      // 处理数据变化逻辑
    });

    // 更新共享数据
    this.updateSharedData('MyComponent', 'myDataKey', 'new value');
  }
}
 ```
 
动态加载数据绑定配置
您可以通过 loadBindingsFromJSON 方法从外部 JSON 文件加载数据绑定配置。

 ```javascript
export default {
  mounted() {
    //这里如果是vue-cli2 默认在static目录下  vue-cli3则是在public目录下
    this.loadBindingsFromJSON('/path/to/config.json');
  }
}
 ```
 
 
 文件格式  components代表组件名称列,bindings代表组件内对应的数据与共享数据的关系绑定
 {
   "components": {
     "card1": {
       "bindings": [
         { "key": "localData", "target": "overData" },
         { "key": "localData2", "target": "demoData" }
       ]
     },
     "card3": {
       "bindings": [
         { "key": "dddData", "target": "overData" },
         { "key": "cccData", "target": "demoData" }
       ]
     },
     "card4": {
       "bindings": [
         { "key": "card4Data", "target": "demoData" }
       ]
     },
     "cardMap": {
       "bindings": [
         { "key": "top5", "target": "overData" }
       ]
     }
   }
 
 
 
API 说明

subscribeToDataChange(componentName, key, callback): 注册一个回调函数以响应指定数据的变化。
```javascript
export default {
  inject: ['subscribeToDataChange'],
  mounted() {
    this.subscribeToDataChange('MyComponent', 'myDataKey', (newValue) => {
      // 处理数据变化逻辑
    });
  }
}
```

updateSharedData(componentName, key, newValue): 更新共享数据并通知所有绑定的组件。
```javascript
export default {
  inject: ['updateSharedData'],
  mounted() {
    this.updateSharedData('MyComponent', 'myDataKey', 'new value');
  }
}
```

loadBindingsFromJSON(jsonURL): 从JSON URL加载数据绑定配置。
 ```html
<template>
  <main-bus ref="DataNexusRef">
    <!-- 子组件放置在这里 -->
  </main-bus>
</template>
 ```

```javascript
export default {
  mounted() {
      this.$refs.DataNexusRef.loadBindingsFromJSON('./DataNexus.json')//这里的json文件名称与路径自定义
  }
}
```

addSharedDataKey(componentName, dataKey, sharedKey, isTwoWay): 将组件的数据项绑定到共享数据源。
```javascript
export default {
  inject: ['addSharedDataKey'],
  mounted() {
     this.addSharedDataKey('MyComponent', 'dataKey', 'sharedKey', true);
  }
}
```

removeSharedDataKey(componentName, dataKey) 删除数据键的方法
```javascript
export default {
  inject: ['removeSharedDataKey'],
  mounted() {
     this.removeSharedDataKey('MyComponent', 'dataKey');
  }
}
```

getSharedData(componentName, dataKey) 获取共享数据键的方法
```javascript
export default {
  inject: ['getSharedData'],
  mounted() {
     this.getSharedData('MyComponent', 'dataKey');
  }
}
```

 registerPlugin 函数
registerPlugin 函数允许您在 DataNexus 组件内注册并安装自定义插件。这使得您可以将额外的功能或逻辑动态地添加到中央事件总线中。

如何使用
要使用 registerPlugin 函数，您需要确保您的插件对象包含一个 install 方法。此方法将在注册插件时被调用，并接收 DataNexus 实例作为参数。

以下是一个插件注册的基本步骤：

创建一个插件对象，确保它有一个 install 方法。
调用 registerPlugin 方法，并传递插件名称和插件对象。
示例
假设我们有一个简单的插件，名为 MyPlugin，它包含一个基本的安装方法。

```javascript
// MyPlugin.js
export default {
  install(mainBus) {
    // 在这里添加你的插件逻辑
    mainBus.myPluginMethod = function() {
      console.log("MyPlugin 方法被调用");
    };
  }
};
```
要在 DataNexus 组件中注册这个插件，请按照以下步骤操作：

```javascript
// 在你的 Vue 组件中
import MyPlugin from './MyPlugin';

export default {
  name: 'YourComponent',
  mounted() {
    this.mainBus.registerPlugin('MyPlugin', MyPlugin);
  }
};
```
这样，MyPlugin 将被安装到 DataNexus 实例中，您可以在任何通过 mainBus 访问到的地方使用 myPluginMethod 方法。




