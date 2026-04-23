import React from 'react';

const TestComponent: React.FC = () => {
  const testVar = "hello";
  console.log(testVar);
  return <div>{testVar}</div>;
};

export default TestComponent;