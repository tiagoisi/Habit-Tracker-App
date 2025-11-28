import styles from './HabitListView.module.css';

const ViewToggle = ({ view, onViewChange }) => {
    return (
        <div className={styles.viewToggle}>
            <button 
                className={`${styles.viewButton} ${view === 'grid' ? styles.active : ''}`}
                onClick={() => onViewChange('grid')}
            >
                <span className={styles.viewIcon}>▦</span>
                <span>Cards</span>
            </button>
            <button 
                className={`${styles.viewButton} ${view === 'list' ? styles.active : ''}`}
                onClick={() => onViewChange('list')}
            >
                <span className={styles.viewIcon}>☰</span>
                <span>Lista</span>
            </button>
        </div>
    );
};

export default ViewToggle;