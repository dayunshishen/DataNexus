// mainBusPluginSystem.js
let mainBusInstance = null;

export function setMainBusInstance(instance) {
  mainBusInstance = instance;
}
export function registerPlugin(pluginName, plugin) {
  if (!mainBusInstance) {
    console.error('MainBus instance has not been created yet.');
    return;
  }

  if (!mainBusInstance.sharedData) {
    mainBusInstance.sharedData = {}; // 确保 sharedData 对象存在
  }

  if (plugin.install && typeof plugin.install === 'function') {
    plugin.install(mainBusInstance);
    console.log(`插件 ${pluginName} 安装成功`);
  } else {
    console.error(`Plugin "${pluginName}" must include an 'install' method.`);
  }
}
