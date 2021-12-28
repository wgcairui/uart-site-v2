import React from 'react'
import ReactDOM from 'react-dom'

import { BrowserRouter } from "react-router-dom"
import { Provider } from 'react-redux';
import store from "./store"
import { App } from './App';

import { ConfigProvider } from 'antd'
import Zh from "antd/es/locale/zh_CN"

ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter>
      <ConfigProvider locale={Zh}>
        <App />
      </ConfigProvider>
    </BrowserRouter>
  </Provider>,
  document.getElementById('root')
)
