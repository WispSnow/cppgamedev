import React from 'react';
import Giscus from '@giscus/react';
import { useTheme } from '../context/ThemeContext';
import { giscusConfig } from '../config/giscus';

const GiscusComments: React.FC = () => {
  const { theme } = useTheme();

  // Ensure we have the required IDs before rendering
  if (!giscusConfig.repoId || !giscusConfig.categoryId) {
    return null;
  }

  return (
    <div style={{ marginTop: '4rem', padding: '1rem' }} className="giscus-wrapper">
      <Giscus
        id="comments"
        repo={giscusConfig.repo as any}
        repoId={giscusConfig.repoId}
        category={giscusConfig.category}
        categoryId={giscusConfig.categoryId}
        mapping={giscusConfig.mapping as any}
        strict={giscusConfig.strict as any}
        reactionsEnabled={giscusConfig.reactionsEnabled as any}
        emitMetadata={giscusConfig.emitMetadata as any}
        inputPosition={giscusConfig.inputPosition as any}
        theme={theme === 'dark' ? 'dark' : 'light'}
        lang={giscusConfig.lang}
        loading={giscusConfig.loading as any}
      />
    </div>
  );
};

export default GiscusComments;
