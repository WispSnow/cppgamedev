import React, { useState } from 'react';
import styled from 'styled-components';

const CopyButtonContainer = styled.button`
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: #f0f0f0;
  border: none;
  border-radius: 3px;
  padding: 4px 8px;
  font-size: 12px;
  cursor: pointer;
  opacity: 0.8;
  transition: all 0.2s;
  z-index: 10;
  
  &:hover {
    opacity: 1;
    background-color: #e0e0e0;
  }
`;

interface CopyButtonProps {
  code: string;
}

const CopyButton: React.FC<CopyButtonProps> = ({ code }) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(code)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('复制失败:', err);
      });
  };
  
  return (
    <CopyButtonContainer onClick={handleCopy}>
      {copied ? '已复制!' : '复制'}
    </CopyButtonContainer>
  );
};

export default CopyButton; 