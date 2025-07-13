import React from 'react';
import { App as AntdApp } from 'antd';
import Container from './components/layout/container';

function App() {
  return (
    <AntdApp>
      <div className="App" style={{ height: '100vh', width: '100vw' }}>
        <Container />
      </div>
    </AntdApp>
  );
}

export default App; 