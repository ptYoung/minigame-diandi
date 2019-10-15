import './js/libs/weapp-adapter'
import './js/libs/symbol'

import MainPage from './js/index.js'
import DataBus from './js/databus.js'

let databus = new DataBus();

/**
 *  在调用云开发各 API 前，需先调用初始化方法 init 一次（全局只需一次，多次调用时只有第一次生效）
 *  传入字符串形式的环境 ID
 */
wx.cloud.init({
    env: 'diandi-minigame-cloud',
    traceUser: true,
})

databus.mainpage = databus.pool.getItemByClass('mainpage', MainPage)