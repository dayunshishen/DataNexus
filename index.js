import mainBus from "./src/mainBus.vue"
let obj = {
  mainBus,
}
export {
  mainBus,
}
export default {
  install(vue){
    Object.keys(obj).forEach(key=>{
      vue.component(key,obj[key])
    })
  }
}
