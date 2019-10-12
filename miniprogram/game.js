import './js/libs/weapp-adapter'
import './js/libs/symbol'

import MainPage from './js/index.js'
import DataBus from './js/databus.js'

let databus = new DataBus();

    databus.mainpage = databus.pool.getItemByClass('mainpage', MainPage)
// new Index()