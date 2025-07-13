import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// 添加 antd React 19 兼容模式
import { ConfigProvider } from 'antd';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ConfigProvider
      theme={{
        token: {
          // 可以在这里自定义主题
        },
      }}
      // 添加 React 19 兼容模式
      legacyLocale={false}
      componentSize="middle"
    >
      <App />
    </ConfigProvider>
  </React.StrictMode>,
)
