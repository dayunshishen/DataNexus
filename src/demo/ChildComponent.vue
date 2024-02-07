<template>
  <div>
    <input v-model="localData" @input="handleDataChange" />
  </div>
</template>

<script>
  export default {
    name: 'ChildComponent',
    inject: ['updateSharedData', 'subscribeToDataChange', 'getSharedData'],
    data() {
      return {
        localData: ''
      };
    },
    created() {
      // 订阅 sharedData 中 'someData' 的变化
      this.subscribeToDataChange('ChildComponent', 'someData', this.handleSharedDataChange);
    },
    methods: {
      handleDataChange() {
        // 更新 sharedData 中的 'someData'
        this.updateSharedData('ChildComponent', 'someData', this.localData);
      },
      handleSharedDataChange(newData) {
        // 当 'someData' 发生变化时的处理逻辑
        console.log('Received updated data:', newData);
        // 可以在这里根据需要更新组件的内部状态
      }
    }
  };
</script>

<style scoped>
  /* 样式内容 */
</style>
