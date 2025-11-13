import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import { userService } from '@services/userService';
import { achievementService } from '@services/achievementService';
import toast from 'react-hot-toast';
import styles from './Profile.module.css';

const Profile = () => {
    const { user, logout, updateUser } = useAuth();
    const [stats, setStats] = useState(null);
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (user?.id) {
            loadProfileData();
        }
    }, [user?.id]);

    const loadProfileData = async () => {
        try {
            setLoading(true);
            const [statsData, achievementsData] = await Promise.all([
                userService.getStats(user.id),
                achievementService.getProgress(),
            ]);
            setStats(statsData);
            setAchievements(achievementsData.achievements?.filter(a => a.isUnlocked) || []);
        } catch (error) {
            console.error('Error al cargar perfil:', error);
            toast.error('Error al cargar datos del perfil');
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error('La imagen no puede superar los 5MB');
            return;
        }

        if (!file.type.startsWith('image/')) {
            toast.error('Solo se permiten imágenes');
            return;
        }

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('avatar', file);

            const updatedUser = await userService.uploadAvatar(user.id, formData);
            
            // ✅ Actualizar solo el avatar, manteniendo todo lo demás
            updateUser({ avatar: updatedUser.avatar });
            
            toast.success('Avatar actualizado correctamente');
        } catch (error) {
            console.error('Error al subir avatar:', error);
            toast.error('Error al subir la imagen');
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteAvatar = async () => {
        if (!window.confirm('¿Eliminar foto de perfil?')) return;

        try {
            await userService.deleteAvatar(user.id);
            
            // ✅ Actualizar solo el avatar a null
            updateUser({ avatar: null });
            
            toast.success('Avatar eliminado');
        } catch (error) {
            console.error('Error al eliminar avatar:', error);
            toast.error('Error al eliminar avatar');
        }
    };

    // ✅ Verificar que user existe antes de renderizar
    if (!user) {
        return (
            <div className={styles.loading}>
                <div className="spinner"></div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className={styles.loading}>
                <div className="spinner"></div>
            </div>
        );
    }

    const unlockedAchievements = achievements.slice(0, 6);

    return (
        <div className={styles.container}>
            {/* Navbar */}
            <nav className={styles.navbar}>
                <div className={styles.navContent}>
                    <Link to="/" className={styles.logoContainer}>
                        <img src="/logo.png" alt="Daily Forge" className={styles.logoImage} />
                    </Link>
                    <div className={styles.navLinks}>
                        <Link to="/" className={styles.navLink}>Inicio</Link>
                        <Link to="/dashboard" className={styles.navLink}>Dashboard</Link>
                        <Link to="/achievements" className={styles.navLink}>Logros</Link>
                        <button onClick={logout} className={styles.logoutBtn}>
                            Salir
                        </button>
                    </div>
                </div>
            </nav>

            <main className={styles.main}>
                {/* Header con avatar */}
                <div className={styles.profileHeader}>
                    <div className={styles.avatarSection}>
                        <div className={styles.avatarWrapper}>
                            {user.avatar ? (
                                <img 
                                    src={`http://localhost:3000${user.avatar}`} 
                                    alt={user.name}
                                    className={styles.avatar}
                                    onError={(e) => {
                                        console.error('Error loading avatar:', user.avatar);
                                        e.target.style.display = 'none';
                                    }}
                                />
                            ) : (
                                <div className={styles.avatarPlaceholder}>
                                    {user.name?.charAt(0).toUpperCase() || '?'}
                                </div>
                            )}
                            <label className={styles.avatarUpload} htmlFor="avatar-input">
                                <input
                                    id="avatar-input"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarUpload}
                                    disabled={uploading}
                                    style={{ display: 'none' }}
                                />
                                {uploading ? '⏳' : '📷'}
                            </label>
                        </div>
                        {user.avatar && (
                            <button 
                                onClick={handleDeleteAvatar} 
                                className={styles.deleteAvatarBtn}
                                disabled={uploading}
                            >
                                Eliminar foto
                            </button>
                        )}
                    </div>

                    <div className={styles.profileInfo}>
                        <h1 className={styles.userName}>{user.name || 'Usuario'}</h1>
                        <p className={styles.userEmail}>{user.email || ''}</p>
                        <div className={styles.levelBadge}>
                            <span className={styles.levelIcon}>⭐</span>
                            <span className={styles.levelText}>Nivel {user.level || 1}</span>
                            <span className={styles.pointsText}>{user.points || 0} pts</span>
                        </div>
                    </div>
                </div>

                {/* Estadísticas */}
                {stats && (
                    <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon}>🎯</div>
                            <div className={styles.statInfo}>
                                <p className={styles.statValue}>{stats.totalHabits || 0}</p>
                                <p className={styles.statLabel}>Hábitos totales</p>
                            </div>
                        </div>

                        <div className={styles.statCard}>
                            <div className={styles.statIcon}>🏆</div>
                            <div className={styles.statInfo}>
                                <p className={styles.statValue}>{stats.totalAchievements || 0}</p>
                                <p className={styles.statLabel}>Logros desbloqueados</p>
                            </div>
                        </div>

                        <div className={styles.statCard}>
                            <div className={styles.statIcon}>📈</div>
                            <div className={styles.statInfo}>
                                <p className={styles.statValue}>{stats.nextLevelPoints || 0} pts</p>
                                <p className={styles.statLabel}>Para siguiente nivel</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Últimos logros */}
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Últimos logros</h2>
                        <Link to="/achievements" className={styles.seeAllLink}>
                            Ver todos →
                        </Link>
                    </div>

                    {unlockedAchievements.length > 0 ? (
                        <div className={styles.achievementsGrid}>
                            {unlockedAchievements.map((achievement) => (
                                <div key={achievement.id} className={styles.achievementCard}>
                                    <span className={styles.achievementIcon}>{achievement.icon}</span>
                                    <h3 className={styles.achievementTitle}>{achievement.title}</h3>
                                    <p className={styles.achievementPoints}>+{achievement.pointsReward} pts</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className={styles.emptyText}>Aún no has desbloqueado logros</p>
                    )}
                </div>

                {/* Información de cuenta */}
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Información de cuenta</h2>
                    <div className={styles.accountInfo}>
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Nombre:</span>
                            <span className={styles.infoValue}>{user.name || 'N/A'}</span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Email:</span>
                            <span className={styles.infoValue}>{user.email || 'N/A'}</span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Miembro desde:</span>
                            <span className={styles.infoValue}>
                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString('es-AR', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                }) : 'N/A'}
                            </span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Profile;