import React, { memo, useCallback } from "react";
import styles from "./BoardHeader.module.css";

export interface BoardHeaderProps {
  title: string;
}

export const BoardHeader: React.FC<BoardHeaderProps> = memo(({ title }) => {
  const handleRefreshClick = useCallback(() => {
    console.log("Board refreshed");
  }, []);

  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{title}</h1>
      <button
        type="button"
        className={styles.refreshButton}
        onClick={handleRefreshClick}
        aria-label="Refresh board"
        title="Refresh board"
      >
        <svg
          className={styles.refreshIcon}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="23 4 23 10 17 10" />
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
        </svg>
        <span className={styles.refreshLabel}>Refresh</span>
      </button>
    </header>
  );
});

BoardHeader.displayName = "BoardHeader";