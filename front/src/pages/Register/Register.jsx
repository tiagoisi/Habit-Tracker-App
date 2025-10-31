import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import styles from './Register.module.css';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [touched, setTouched] = useState({
        name: false,
        email: false,
        password: false,
        confirmPassword: false
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { register } = useAuth();
    const navigate = useNavigate();

    const validateName = (name) => {
        if (!name) {
            return 'El nombre es requerido';
        }
        if (name.length < 3) {
            return 'El nombre debe tener al menos 3 caracteres';
        }
        if (name.length > 50) {
            return 'El nombre no puede exceder 50 caracteres';
        }
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(name)) {
            return "El nombre no puede contener números o caracteres especiales";
        }
        return '';
    };

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
        if (!/(?=.*[a-z])/.test(password)) {
            return 'Debe tener al menos una minúscula';
        }
        if (!/(?=.*[A-Z])/.test(password)) {
            return 'Debe tener al menos una mayúscula';
        }
        if (!/(?=.*\d)/.test(password)) {
            return 'Debe tener al menos un número';
        }
        if (!/(?=.*[@$!%*?&#])/.test(password)) {
            return 'Debe tener al menos un símbolo especial';
        }
        return '';
    };

    const validateConfirmPassword = (confirmPassword, password) => {
        if (!confirmPassword) {
            return 'Debes confirmar la contraseña';
        }
        if (confirmPassword !== password) {
            return 'Las contraseñas no coinciden';
        }
        return '';
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Validar en tiempo real solo si el campo ya fue tocado
        if (touched[name]) {
            let error = '';
            if (name === 'name') {
                error = validateName(value);
            } else if (name === 'email') {
                error = validateEmail(value);
            } else if (name === 'password') {
                error = validatePassword(value);
                // También revalidar confirmPassword si ya fue tocado
                if (touched.confirmPassword) {
                    setErrors(prev => ({
                        ...prev,
                        confirmPassword: validateConfirmPassword(formData.confirmPassword, value)
                    }));
                }
            } else if (name === 'confirmPassword') {
                error = validateConfirmPassword(value, formData.password);
            }
            setErrors({ ...errors, [name]: error });
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouched({ ...touched, [name]: true });

        // Validar al salir del campo
        let error = '';
        if (name === 'name') {
            error = validateName(value);
        } else if (name === 'email') {
            error = validateEmail(value);
        } else if (name === 'password') {
            error = validatePassword(value);
        } else if (name === 'confirmPassword') {
            error = validateConfirmPassword(value, formData.password);
        }
        setErrors({ ...errors, [name]: error });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validar todos los campos
        const nameError = validateName(formData.name);
        const emailError = validateEmail(formData.email);
        const passwordError = validatePassword(formData.password);
        const confirmPasswordError = validateConfirmPassword(formData.confirmPassword, formData.password);

        setErrors({
            name: nameError,
            email: emailError,
            password: passwordError,
            confirmPassword: confirmPasswordError
        });

        setTouched({
            name: true,
            email: true,
            password: true,
            confirmPassword: true
        });

        if (nameError || emailError || passwordError || confirmPasswordError) {
            return;
        }

        setLoading(true);

        try {
            await register(formData.name, formData.email, formData.password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Error al registrarse');
        } finally {
            setLoading(false);
        }
    };

    const hasErrors = errors.name || errors.email || errors.password || errors.confirmPassword;

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Crear Cuenta</h1>
                    <p className={styles.subtitle}>Comenzá tu viaje de hábitos</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {error && (
                        <div className={styles.errorAlert}>
                            {error}
                        </div>
                    )}

                    <div className={styles.inputGroup}>
                        <label htmlFor="name" className={styles.label}>
                            Nombre
                        </label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={touched.name && errors.name ? styles.inputError : styles.input}
                            placeholder="Juan Pérez"
                        />
                        {touched.name && errors.name && (
                            <p className={styles.errorText}>{errors.name}</p>
                        )}
                    </div>

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

                    <div className={styles.inputGroup}>
                        <label htmlFor="confirmPassword" className={styles.label}>
                            Confirmar Contraseña
                        </label>
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={touched.confirmPassword && errors.confirmPassword ? styles.inputError : styles.input}
                            placeholder="••••••••"
                        />
                        {touched.confirmPassword && errors.confirmPassword && (
                            <p className={styles.errorText}>{errors.confirmPassword}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        className={styles.button}
                        disabled={loading || hasErrors}
                    >
                        {loading ? 'Creando cuenta...' : 'Registrarme'}
                    </button>
                </form>

                <p className={styles.footer}>
                    ¿Ya tenés cuenta?{' '}
                    <Link to="/login" className={styles.link}>
                        Iniciá sesión
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;