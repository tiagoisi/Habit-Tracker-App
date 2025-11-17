import { Link } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import { useState, useEffect } from 'react';
import styles from './Landing.module.css';

const Landing = () => {
    const { isAuthenticated } = useAuth();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className={styles.container}>
            {/* Navbar */}
            <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
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
                {/* Animated gradient background */}
                <div className={styles.gradientOrb1}></div>
                <div className={styles.gradientOrb2}></div>
                <div className={styles.gradientOrb3}></div>
                
                {/* Floating particles */}
                <div className={styles.particles}>
                    {[...Array(15)].map((_, i) => (
                        <div 
                            key={i} 
                            className={styles.particle}
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 5}s`,
                                animationDuration: `${10 + Math.random() * 10}s`
                            }}
                        />
                    ))}
                </div>

                <div className={styles.heroContent}>
                    <h1 className={styles.heroTitle}>
                        Construí tu mejor versión,
                        <span className={styles.heroAccent}> un hábito a la vez</span>
                    </h1>
                    <p className={styles.heroSubtitle}>
                        Pequeños hábitos, grandes cambios.
                    </p>
                    <div className={styles.heroButtons}>
                        {isAuthenticated ? (
                            <Link to="/dashboard" className={styles.btnHero}>
                                <span>Ir al Dashboard</span>
                                <span className={styles.btnArrow}>→</span>
                            </Link>
                        ) : (
                            <>
                                <Link to="/register" className={styles.btnHero}>
                                    <span>Comenzar Ahora</span>
                                    <span className={styles.btnArrow}>→</span>
                                </Link>
                                <Link to="/login" className={styles.btnSecondary}>
                                    Ya tengo cuenta
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                {/* Floating icons */}
                <div className={styles.floatingIcons}>
                    <div className={styles.icon} style={{top: '15%', left: '8%'}}>
                       <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-brain"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M15.5 13a3.5 3.5 0 0 0 -3.5 3.5v1a3.5 3.5 0 0 0 7 0v-1.8" /><path d="M8.5 13a3.5 3.5 0 0 1 3.5 3.5v1a3.5 3.5 0 0 1 -7 0v-1.8" /><path d="M17.5 16a3.5 3.5 0 0 0 0 -7h-.5" /><path d="M19 9.3v-2.8a3.5 3.5 0 0 0 -7 0" /><path d="M6.5 16a3.5 3.5 0 0 1 0 -7h.5" /><path d="M5 9.3v-2.8a3.5 3.5 0 0 1 7 0v10" /></svg>
                    </div>
                    <div className={styles.icon} style={{top: '25%', right: '12%'}}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                            <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                    </div>
                    <div className={styles.icon} style={{bottom: '30%', left: '10%'}}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                            <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="currentColor"/>
                        </svg>
                    </div>
                    <div className={styles.icon} style={{bottom: '20%', right: '8%'}}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor"/>
                            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2"/>
                            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                    </div>
                    <div className={styles.icon} style={{top: '50%', left: '5%'}}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                            <path d="M9 11L12 14L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M21 12V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                    </div>
                    <div className={styles.icon} style={{top: '60%', right: '5%'}}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                            <path d="M3 13H7L10 20L14 4L17 13H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
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