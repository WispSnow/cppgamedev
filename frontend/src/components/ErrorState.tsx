import React from 'react';
import styled from 'styled-components';

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2.5rem 2rem;
  border-radius: 12px;
  background-color: rgba(229, 57, 53, 0.08);
  color: #c62828;
  gap: 1rem;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 1.25rem;
`;

const Message = styled.p`
  margin: 0;
  color: rgba(198, 40, 40, 0.85);
`;

const RetryButton = styled.button`
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  border: none;
  background-color: #c62828;
  color: #ffffff;
  cursor: pointer;
  font-size: 0.95rem;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.9;
  }
`;

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ title = '哎呀，出了点问题', message, onRetry }) => (
  <ErrorContainer role="alert">
    <Title>{title}</Title>
    <Message>{message}</Message>
    {onRetry && <RetryButton onClick={onRetry}>重试</RetryButton>}
  </ErrorContainer>
);

export default ErrorState;
