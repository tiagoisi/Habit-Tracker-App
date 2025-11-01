import { Link } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import styles from './Landing.module.css';

const Landing = () => {
    const { isAuthenticated } = useAuth();

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
                        <a href="#features" className={styles.navLink}>Características</a>
                        <a href="#how-it-works" className={styles.navLink}>Cómo funciona</a>
                        {isAuthenticated ? (
                            <Link to="/dashboard" className={styles.btnPrimary}>
                                Ir al Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link to="/login" className={styles.navLink}>Iniciar Sesión</Link>
                                <Link to="/register" className={styles.btnPrimary}>
                                    Comenzar Gratis
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1 className={styles.heroTitle}>
                        Construí tu mejor versión,
                        <span className={styles.heroAccent}> un hábito a la vez</span>
                    </h1>
                    <p className={styles.heroSubtitle}>
                        Transformá tu vida con Daily Forge. Seguí tus hábitos, mantené rachas y desbloqueá logros
                        mientras construís la persona que querés ser.
                    </p>
                    <div className={styles.heroButtons}>
                        {isAuthenticated ? (
                            <Link to="/dashboard" className={styles.btnHero}>
                                Ir al Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link to="/register" className={styles.btnHero}>
                                    Comenzar Ahora
                                </Link>
                                <Link to="/login" className={styles.btnSecondary}>
                                    Ya tengo cuenta
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className={styles.features}>
                <h2 className={styles.sectionTitle}>¿Por qué Daily Forge?</h2>
                <div className={styles.featuresGrid}>
                    <div className={styles.featureCard}>
                        <div className={styles.featureIcon}>📊</div>
                        <h3 className={styles.featureTitle}>Seguimiento Visual</h3>
                        <p className={styles.featureText}>
                            Visualizá tu progreso con estadísticas claras y gráficos intuitivos.
                        </p>
                    </div>

                    <div className={styles.featureCard}>
                        <div className={styles.featureIcon}>🔥</div>
                        <h3 className={styles.featureTitle}>Rachas Motivadoras</h3>
                        <p className={styles.featureText}>
                            Mantené rachas diarias y semanales que te impulsen a seguir adelante.
                        </p>
                    </div>

                    <div className={styles.featureCard}>
                        <div className={styles.featureIcon}>🏆</div>
                        <h3 className={styles.featureTitle}>Sistema de Logros</h3>
                        <p className={styles.featureText}>
                            Desbloqueá logros y sube de nivel mientras completás tus hábitos.
                        </p>
                    </div>

                    <div className={styles.featureCard}>
                        <div className={styles.featureIcon}>🎯</div>
                        <h3 className={styles.featureTitle}>Personalizable</h3>
                        <p className={styles.featureText}>
                            Creá hábitos únicos con iconos, colores y frecuencias personalizadas.
                        </p>
                    </div>

                    <div className={styles.featureCard}>
                        <div className={styles.featureIcon}>📱</div>
                        <h3 className={styles.featureTitle}>Simple e Intuitivo</h3>
                        <p className={styles.featureText}>
                            Diseño limpio y fácil de usar. Enfocate en tus hábitos, no en la app.
                        </p>
                    </div>

                    <div className={styles.featureCard}>
                        <div className={styles.featureIcon}>⚡</div>
                        <h3 className={styles.featureTitle}>Rápido y Confiable</h3>
                        <p className={styles.featureText}>
                            Marca tus hábitos en segundos. Tus datos siempre seguros.
                        </p>
                    </div>
                </div>
            </section>

            {/* How it Works */}
            <section id="how-it-works" className={styles.howItWorks}>
                <h2 className={styles.sectionTitle}>¿Cómo funciona?</h2>
                <div className={styles.stepsGrid}>
                    <div className={styles.step}>
                        <div className={styles.stepNumber}>1</div>
                        <h3 className={styles.stepTitle}>Creá tus hábitos</h3>
                        <p className={styles.stepText}>
                            Define los hábitos que querés construir. Elegí iconos y colores que te motiven.
                        </p>
                    </div>

                    <div className={styles.step}>
                        <div className={styles.stepNumber}>2</div>
                        <h3 className={styles.stepTitle}>Marcá tu progreso</h3>
                        <p className={styles.stepText}>
                            Cada día, marcá tus hábitos como completados. Simple y rápido.
                        </p>
                    </div>

                    <div className={styles.step}>
                        <div className={styles.stepNumber}>3</div>
                        <h3 className={styles.stepTitle}>Construí rachas</h3>
                        <p className={styles.stepText}>
                            Mantené la consistencia y observá cómo tus rachas crecen día a día.
                        </p>
                    </div>

                    <div className={styles.step}>
                        <div className={styles.stepNumber}>4</div>
                        <h3 className={styles.stepTitle}>Desbloqueá logros</h3>
                        <p className={styles.stepText}>
                            Ganá puntos, sube de nivel y desbloqueá logros mientras progresás.
                        </p>
                    </div>
                </div>
            </section>

            {/* CTA Final */}
            <section className={styles.cta}>
                <h2 className={styles.ctaTitle}>¿Listo para transformar tu vida?</h2>
                <p className={styles.ctaText}>
                    Unite a miles de personas que ya están construyendo mejores hábitos.
                </p>
                {isAuthenticated ? (
                    <Link to="/dashboard" className={styles.btnCta}>
                        Ir al Dashboard
                    </Link>
                ) : (
                    <Link to="/register" className={styles.btnCta}>
                        Comenzar Gratis
                    </Link>
                )}
            </section>

            {/* Footer */}
            <footer className={styles.footer}>
                <p className={styles.footerText}>
                    © 2025 Daily Forge. Construí tu mejor versión.
                </p>
            </footer>
        </div>
    );
};

export default Landing;