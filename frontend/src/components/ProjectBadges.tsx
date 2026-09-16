import React from 'react';
import styled from 'styled-components';
import {
  Project,
  ProjectStatus,
  projectKindLabels,
  projectStatusLabels,
} from '../data/projectsData';

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
`;

const Badge = styled.span`
  padding: 0.15rem 0.6rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1.6;
`;

const StatusBadge = styled(Badge)<{ $status: ProjectStatus }>`
  background-color: ${props =>
    props.$status === 'playable' ? 'var(--success-bg, rgba(76, 175, 80, 0.12))' : 'var(--subtle-button-bg, #f0f0f0)'};
  color: ${props =>
    props.$status === 'playable' ? 'var(--success-color, #2e7d32)' : 'var(--secondary-text-color, #666)'};
`;

const KindBadge = styled(Badge)`
  border: 1px solid var(--border-color, #eaeaea);
  color: var(--secondary-text-color, #666);
`;

interface ProjectBadgesProps {
  project: Project;
}

const ProjectBadges: React.FC<ProjectBadgesProps> = ({ project }) => (
  <Row>
    <StatusBadge $status={project.status}>{projectStatusLabels[project.status]}</StatusBadge>
    <KindBadge>{projectKindLabels[project.kind]}</KindBadge>
  </Row>
);

export default ProjectBadges;
