import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import { achievementService } from '@services/achievementService';
import styles from './Achievements.module.css';

const Achievements = () => {
    const { user, logout } = useAuth();
    const [achievements, setAchievements] = useState([]);
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAchievements();
    }, []);

    const loadAchievements = async () => {
        try {
            setLoading(true);
            const progressData = await achievementService.getProgress();
            setAchievements(progressData.achievements || []);
            setProgress(progressData);
        } catch (error) {
            console.error('Error al cargar logros:', error);
        } finally {
            setLoading(false);
        }
    };

    const unlockedAchievements = achievements.filter(a => a.isUnlocked);
    const lockedAchievements = achievements.filter(a => !a.isUnlocked);

    if (loading) {
        return (
            <div className={styles.loading}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Navbar */}
            <nav className={styles.navbar}>
                <div className={styles.navContent}>
                    <Link to="/" className={styles.logoContainer}>
                        <img 
                            src="/logo.png" 
                            alt="Daily Forge" 
                            className={styles.logoImage}
                        />
                    </Link>
                    <div className={styles.navLinks}>
                        <Link to="/" className={styles.navLink}>Inicio</Link>
                        <Link to="/dashboard" className={styles.navLink}>Dashboard</Link>
                        <div className={styles.userMenu}>
                            <div className={styles.userInfo}>
                                <span className={styles.userName}>{user?.name}</span>
                                <span className={styles.userPoints}>
                                    ⭐ {user?.points || 0} pts · Nivel {user?.level || 1}
                                </span>
                            </div>
                            <button onClick={logout} className={styles.logoutBtn}>
                                Salir
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className={styles.main}>
                <div className={styles.header}>
                    <h1 className={styles.pageTitle}>🏆 Mis Logros</h1>
                    {progress && (
                        <div className={styles.progressBar}>
                            <div className={styles.progressInfo}>
                                <span className={styles.progressText}>
                                    {progress.unlocked} de {progress.total} desbloqueados
                                </span>
                                <span className={styles.progressPercent}>
                                    {progress.percentage}%
                                </span>
                            </div>
                            <div className={styles.progressTrack}>
                                <div 
                                    className={styles.progressFill}
                                    style={{ width: `${progress.percentage}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Logros desbloqueados */}
                {unlockedAchievements.length > 0 && (
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>✨ Desbloqueados</h2>
                        <div className={styles.achievementsGrid}>
                            {unlockedAchievements.map((achievement) => (
                                <div key={achievement.id} className={styles.achievementCard}>
                                    <div className={styles.achievementIcon}>
                                        {achievement.icon}
                                    </div>
                                    <div className={styles.achievementInfo}>
                                        <h3 className={styles.achievementTitle}>
                                            {achievement.title}
                                        </h3>
                                        <p className={styles.achievementDescription}>
                                            {achievement.description}
                                        </p>
                                        <div className={styles.achievementFooter}>
                                            <span className={styles.achievementPoints}>
                                                +{achievement.pointsReward} pts
                                            </span>
                                            <span className={styles.achievementDate}>
                                                {new Date(achievement.unlockedAt).toLocaleDateString('es-AR')}
                                            </span>
                                        </div>
                                    </div>
                                    <div className={styles.unlockedBadge}>✓</div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* ✅ Logros bloqueados CON PROGRESO */}
                {lockedAchievements.length > 0 && (
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>🔒 Por desbloquear</h2>
                        <div className={styles.achievementsGrid}>
                            {lockedAchievements.map((achievement) => (
                                <div 
                                    key={achievement.id} 
                                    className={`${styles.achievementCard} ${styles.locked}`}
                                >
                                    <div className={styles.achievementIcon}>
                                        {achievement.icon}
                                    </div>
                                    <div className={styles.achievementInfo}>
                                        <h3 className={styles.achievementTitle}>
                                            {achievement.title}
                                        </h3>
                                        <p className={styles.achievementDescription}>
                                            {achievement.description}
                                        </p>
                                        
                                        {/* ✅ BARRA DE PROGRESO */}
                                        <div className={styles.achievementProgress}>
                                            <div className={styles.progressBarSmall}>
                                                <div 
                                                    className={styles.progressBarFill}
                                                    style={{ width: `${achievement.progressPercentage}%` }}
                                                />
                                            </div>
                                            <span className={styles.progressText}>
                                                {achievement.currentProgress}/{achievement.requiredCount}
                                            </span>
                                        </div>

                                        <div className={styles.achievementFooter}>
                                            <span className={styles.achievementPoints}>
                                                +{achievement.pointsReward} pts
                                            </span>
                                            <span className={styles.achievementRequirement}>
                                                {achievement.progressPercentage}% completado
                                            </span>
                                        </div>
                                    </div>
                                    <div className={styles.lockedBadge}>🔒</div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {achievements.length === 0 && (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>🏆</div>
                        <h3 className={styles.emptyTitle}>
                            No hay logros disponibles
                        </h3>
                        <p className={styles.emptyText}>
                            Comenzá a completar hábitos para desbloquear logros
                        </p>
                        <Link to="/dashboard" className={styles.emptyButton}>
                            Ir al Dashboard
                        </Link>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Achievements;