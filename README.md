# dataCom

MainBus Vue 组件
介绍
mainBus 是一个 Vue 组件，旨在提供中央状态管理和事件广播功能。它允许在 Vue 应用中的不同组件间共享数据，处理加载状态和错误信息，并支持数据项到共享数据源的动态绑定。

特性
共享数据管理：实现多个组件之间的数据共享。
动态加载状态和错误处理：支持从外部JSON文件动态加载数据绑定配置，并处理加载中的状态和错误。
动态数据键管理：允许动态地管理数据键与共享数据源的绑定。
双向绑定支持：支持双向数据绑定，确保数据在组件间实时同步。
动态数据键管理：开发人员自由动态增删改共享数据。
动态表格管理：可视化配置表接口，表头，表参数，实现动态显示表格的功能  //待开发


安装
将 mainBus.vue 文件放置在您的 Vue.js 项目的 components 目录中。

/****快速开始指南*//

引入并注册组件
在您的 Vue 应用中引入并注册 mainBus 组件。

 ```javascript
import MainBus from 'path/to/mainBus.vue';


export default {
  components: {
    MainBus
  }
  // ...
}
 ```
在父组件中使用
在父组件的模板中，将 MainBus 组件包裹在需要共享状态的子组件外。

 ```html
<template>
  <main-bus>
    <!-- 子组件放置在这里 -->
  </main-bus>
</template>
 ```
 
 
在子组件中使用
在子组件中，通过依赖注入使用 mainBus 提供的方法。

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
  <main-bus ref="mainBusRef">
    <!-- 子组件放置在这里 -->
  </main-bus>
</template>
 ```

```javascript
export default {
  mounted() {
      this.$refs.mainBusRef.loadBindingsFromJSON('./mainBus.json')
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


 


