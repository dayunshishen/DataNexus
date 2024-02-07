<template>
  <div>
    <main-bus>
      <child-component />
    </main-bus>
  </div>
</template>

<script>
  import MainBus from './mainBus'; // 假设 mainBus 组件和 ParentComponent 在同一目录
  import ChildComponent from './ChildComponent';

  export default {
    name: 'ParentComponent',
    components: {
      MainBus,
      ChildComponent
    }
  };
</script>

<style scoped>
  /* 样式内容 */
</style>
