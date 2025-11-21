// Achievements.jsx
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
    const [filter, setFilter] = useState('all'); // 'all', 'unlocked', 'locked'

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

    const getFilteredAchievements = () => {
        if (filter === 'unlocked') return unlockedAchievements;
        if (filter === 'locked') return lockedAchievements;
        return achievements;
    };

    const filteredAchievements = getFilteredAchievements();

    if (loading) {
        return (
            <div className={styles.loading}>
                <div className={styles.spinner}>
                    <div className={styles.spinnerRing}></div>
                    <span className={styles.spinnerIcon}>🏆</span>
                </div>
                <p className={styles.loadingText}>Cargando logros...</p>
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
                        <Link to="/profile" className={styles.profileButton}>
                                {user?.avatar ? (
                                    <img 
                                        src={`http://localhost:3000${user.avatar}`}
                                        alt={user.name}
                                        className={styles.avatarSmall}
                                    />
                                ) : (
                                    <div className={styles.avatarSmallPlaceholder}>
                                        {user?.name?.charAt(0).toUpperCase() || '?'}
                                    </div>
                                )}
                                <span className={styles.profileName}>{user?.name}</span>
                        </Link>
                        <button onClick={logout} className={styles.logoutBtn}>
                            Salir
                        </button>
                    </div>
                </div>
            </nav>

            <main className={styles.main}>
                {/* Header mejorado */}
                <div className={styles.header}>
                    <div className={styles.titleWrapper}>
                        <span className={styles.titleIcon}>🏆</span>
                        <h1 className={styles.pageTitle}>Mis Logros</h1>
                    </div>
                    
                    {progress && (
                        <div className={styles.progressCard}>
                            <div className={styles.progressHeader}>
                                <div className={styles.progressInfo}>
                                    <span className={styles.progressLabel}>Progreso total</span>
                                    <span className={styles.progressText}>
                                        {progress.unlocked} de {progress.total} desbloqueados
                                    </span>
                                </div>
                                <span className={styles.progressPercent}>
                                    {progress.percentage}%
                                </span>
                            </div>
                            <div className={styles.progressTrack}>
                                <div 
                                    className={styles.progressFill}
                                    style={{ width: `${progress.percentage}%` }}
                                >
                                    <div className={styles.progressShine}></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Filtros */}
                <div className={styles.filters}>
                    <button 
                        className={`${styles.filterBtn} ${filter === 'all' ? styles.filterActive : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        <span className={styles.filterIcon}>📊</span>
                        <span>Todos</span>
                        <span className={styles.filterCount}>{achievements.length}</span>
                    </button>
                    <button 
                        className={`${styles.filterBtn} ${filter === 'unlocked' ? styles.filterActive : ''}`}
                        onClick={() => setFilter('unlocked')}
                    >
                        <span className={styles.filterIcon}>✨</span>
                        <span>Desbloqueados</span>
                        <span className={styles.filterCount}>{unlockedAchievements.length}</span>
                    </button>
                    <button 
                        className={`${styles.filterBtn} ${filter === 'locked' ? styles.filterActive : ''}`}
                        onClick={() => setFilter('locked')}
                    >
                        <span className={styles.filterIcon}>🔒</span>
                        <span>Bloqueados</span>
                        <span className={styles.filterCount}>{lockedAchievements.length}</span>
                    </button>
                </div>

                {/* Grid de logros */}
                {filteredAchievements.length > 0 ? (
                    <div className={styles.achievementsGrid}>
                        {filteredAchievements.map((achievement) => (
                            <div 
                                key={achievement.id} 
                                className={`${styles.achievementCard} ${achievement.isUnlocked ? styles.unlocked : styles.locked}`}
                            >
                                <div className={styles.cardGlow}></div>
                                
                                <div className={styles.achievementIcon}>
                                    {achievement.icon}
                                </div>
                                
                                <div className={styles.achievementContent}>
                                    <div className={styles.achievementHeader}>
                                        <h3 className={styles.achievementTitle}>
                                            {achievement.title}
                                        </h3>
                                        {achievement.isUnlocked ? (
                                            <div className={styles.unlockedBadge}>
                                                <span>✓</span>
                                            </div>
                                        ) : (
                                            <div className={styles.lockedBadge}>🔒</div>
                                        )}
                                    </div>
                                    
                                    <p className={styles.achievementDescription}>
                                        {achievement.description}
                                    </p>
                                    
                                    {/* Progreso para bloqueados */}
                                    {!achievement.isUnlocked && (
                                        <div className={styles.achievementProgress}>
                                            <div className={styles.progressBarSmall}>
                                                <div 
                                                    className={styles.progressBarFill}
                                                    style={{ width: `${achievement.progressPercentage}%` }}
                                                >
                                                    <div className={styles.progressBarShine}></div>
                                                </div>
                                            </div>
                                            <div className={styles.progressStats}>
                                                <span className={styles.progressCurrent}>
                                                    {achievement.currentProgress}/{achievement.requiredCount}
                                                </span>
                                                <span className={styles.progressPercentText}>
                                                    {achievement.progressPercentage}%
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div className={styles.achievementFooter}>
                                        <span className={styles.achievementPoints}>
                                            <span className={styles.pointsPlus}>+</span>
                                            {achievement.pointsReward}
                                            <span className={styles.pointsLabel}>pts</span>
                                        </span>
                                        {achievement.isUnlocked && (
                                            <span className={styles.achievementDate}>
                                                {new Date(achievement.unlockedAt).toLocaleDateString('es-AR')}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>
                            {filter === 'unlocked' ? '🎯' : filter === 'locked' ? '🔓' : '🏆'}
                        </div>
                        <h3 className={styles.emptyTitle}>
                            {filter === 'unlocked' 
                                ? 'Aún no has desbloqueado logros' 
                                : filter === 'locked'
                                ? '¡Felicitaciones! Has desbloqueado todos los logros'
                                : 'No hay logros disponibles'
                            }
                        </h3>
                        <p className={styles.emptyText}>
                            {filter === 'unlocked' 
                                ? 'Comenzá a completar hábitos para desbloquear tus primeros logros' 
                                : filter === 'locked'
                                ? 'Sos un verdadero maestro de los hábitos'
                                : 'Pronto habrá nuevos desafíos disponibles'
                            }
                        </p>
                        {filter !== 'all' && (
                            <button 
                                onClick={() => setFilter('all')} 
                                className={styles.emptyButton}
                            >
                                Ver todos los logros
                            </button>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Achievements;