import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import styles from './Login.module.css';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({ email: '', password: '' });
    const [touched, setTouched] = useState({ email: false, password: false });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { login } = useAuth();
    const navigate = useNavigate();

    const validateEmail = (email) => {
        if (!email) {
            return 'El email es requerido';
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return 'El email no es válido';
        }
        return '';
    };

    const validatePassword = (password) => {
        if (!password) {
            return 'La contraseña es requerida';
        }
        if (password.length < 8) {
            return 'La contraseña debe tener al menos 8 caracteres';
        }
        return '';
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Validar en tiempo real solo si el campo ya fue tocado
        if (touched[name]) {
            if (name === 'email') {
                setErrors({ ...errors, email: validateEmail(value) });
            } else if (name === 'password') {
                setErrors({ ...errors, password: validatePassword(value) });
            }
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouched({ ...touched, [name]: true });

        // Validar al salir del campo
        if (name === 'email') {
            setErrors({ ...errors, email: validateEmail(value) });
        } else if (name === 'password') {
            setErrors({ ...errors, password: validatePassword(value) });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validar todos los campos
        const emailError = validateEmail(formData.email);
        const passwordError = validatePassword(formData.password);

        setErrors({ email: emailError, password: passwordError });
        setTouched({ email: true, password: true });

        if (emailError || passwordError) {
            return;
        }

        setLoading(true);

        try {
            await login(formData.email, formData.password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Daily Forge</h1>
                    <p className={styles.subtitle}>Bienvenido de vuelta</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {error && (
                        <div className={styles.errorAlert}>
                            {error}
                        </div>
                    )}

                    <div className={styles.inputGroup}>
                        <label htmlFor="email" className={styles.label}>
                            Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={touched.email && errors.email ? styles.inputError : styles.input}
                            placeholder="tu@email.com"
                        />
                        {touched.email && errors.email && (
                            <p className={styles.errorText}>{errors.email}</p>
                        )}
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="password" className={styles.label}>
                            Contraseña
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={touched.password && errors.password ? styles.inputError : styles.input}
                            placeholder="••••••••"
                        />
                        {touched.password && errors.password && (
                            <p className={styles.errorText}>{errors.password}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        className={styles.button}
                        disabled={loading || errors.email || errors.password}
                    >
                        {loading ? 'Iniciando...' : 'Iniciar Sesión'}
                    </button>
                </form>

                <p className={styles.footer}>
                    ¿No tenés cuenta?{' '}
                    <Link to="/register" className={styles.link}>
                        Registrate
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;