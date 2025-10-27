import { useAuth } from '@contexts/AuthContext';
import styles from './Dashboard.module.css';

const Dashboard = () => {
    const { user, logout } = useAuth();

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <h1 className={styles.logo}>DailyForge</h1>
                    <div className={styles.userMenu}>
                        <div className={styles.userInfo}>
                            <span className={styles.userName}>{user?.name}</span>
                            <span className={styles.userPoints}>
                                ⭐ {user?.points || 0} pts
                            </span>
                        </div>
                        <button onClick={logout} className={styles.logoutBtn}>
                            Salir
                        </button>
                    </div>
                </div>
            </header>

            <main className={styles.main}>
                <div className={styles.welcome}>
                    <h2 className={styles.welcomeTitle}>
                        ¡Hola, {user?.name}! 👋
                    </h2>
                    <p className={styles.welcomeText}>
                        Estás en nivel {user?.level || 1}
                    </p>
                </div>

                <div className={styles.stats}>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>🎯</div>
                        <div className={styles.statInfo}>
                            <p className={styles.statValue}>0</p>
                            <p className={styles.statLabel}>Hábitos activos</p>
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>🔥</div>
                        <div className={styles.statInfo}>
                            <p className={styles.statValue}>0</p>
                            <p className={styles.statLabel}>Días de racha</p>
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>🏆</div>
                        <div className={styles.statInfo}>
                            <p className={styles.statValue}>0</p>
                            <p className={styles.statLabel}>Logros</p>
                        </div>
                    </div>
                </div>

                <div className={styles.habitsSection}>
                    <div className={styles.sectionHeader}>
                        <h3 className={styles.sectionTitle}>Mis Hábitos</h3>
                        <button className={styles.addButton}>
                            + Nuevo Hábito
                        </button>
                    </div>

                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>📝</div>
                        <h4 className={styles.emptyTitle}>
                            No tenés hábitos todavía
                        </h4>
                        <p className={styles.emptyText}>
                            Creá tu primer hábito y comenzá a construir tu mejor versión
                        </p>
                        <button className={styles.emptyButton}>
                            Crear mi primer hábito
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;