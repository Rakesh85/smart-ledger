import React, { createContext, useContext, useState, useEffect } from 'react';
import emailjs from 'emailjs-com';

const AuthContext = createContext();

const INITIAL_CREDENTIALS = {
    username: 'superAdmin',
    password: 'Pundit!23',
    email: 'rakeshprajapati85@gmail.com'
};

const SECURITY_QUESTIONS = [
    { id: 1, question: 'Your School name', answer: 'sanskar' },
    { id: 2, question: 'Your native place', answer: 'lunawa' },
    { id: 3, question: 'First company name', answer: 'cp' }
];

// EmailJS Configuration from .env
const EMAILJS_CONFIG = {
    serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID?.trim(),
    templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID?.trim(),
    publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY?.trim()
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentPin, setCurrentPin] = useState(null);
    const [storedPassword, setStoredPassword] = useState(() => {
        return localStorage.getItem('smart_ledger_password') || INITIAL_CREDENTIALS.password;
    });

    useEffect(() => {
        const savedUser = localStorage.getItem('smart_ledger_user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const login = (username, password) => {
        return new Promise((resolve, reject) => {
            // Simulate API call
            setTimeout(() => {
                if (username === INITIAL_CREDENTIALS.username && password === storedPassword) {
                    const userData = { username: INITIAL_CREDENTIALS.username, email: INITIAL_CREDENTIALS.email };
                    setUser(userData);
                    localStorage.setItem('smart_ledger_user', JSON.stringify(userData));
                    resolve(userData);
                } else {
                    reject(new Error('Invalid username or password'));
                }
            }, 500);
        });
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('smart_ledger_user');
    };

    const changePassword = (currentPassword, newPassword) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (currentPassword === storedPassword) {
                    setStoredPassword(newPassword);
                    localStorage.setItem('smart_ledger_password', newPassword);
                    resolve();
                } else {
                    reject(new Error('Current password is incorrect'));
                }
            }, 500);
        });
    };

    const sendEmail = async (templateParams) => {
        // Only attempt to send if config is present and not default placeholder
        const { serviceId, templateId, publicKey } = EMAILJS_CONFIG;
        const isConfigured = !!(serviceId && serviceId !== 'your_service_id' &&
            templateId && templateId !== 'your_template_id' &&
            publicKey && publicKey !== 'your_public_key');

        if (!isConfigured) {
            console.warn('[EMAILJS] Simulation Mode: Missing valid credentials in .env');
            console.log('[DEBUG] Config Details (Masked):', {
                hasService: !!serviceId,
                hasTemplate: !!templateId,
                hasKey: !!publicKey,
                serviceStart: serviceId ? serviceId.substring(0, 4) + '...' : 'none',
                templateStart: templateId ? templateId.substring(0, 4) + '...' : 'none'
            });
            return false;
        }

        try {
            // Explicitly initialize with public key
            emailjs.init(publicKey);

            const response = await emailjs.send(serviceId, templateId, templateParams);
            console.log('[EMAILJS] Email sent successfully:', response.status, response.text);
            return true;
        } catch (error) {
            console.error('[EMAILJS] Detailed Error:', error);
            // EmailJS errors often have a 'text' or 'message' property
            const errorMsg = error.text || error.message || JSON.stringify(error);
            throw new Error(`Email failed: ${errorMsg}`);
        }
    };

    const generatePin = async () => {
        const pin = Math.floor(1000 + Math.random() * 9000).toString();
        setCurrentPin(pin);
        console.log(`[SIMULATION] Your 4-digit PIN is: ${pin}`);

        try {
            // Get current time + 15 minutes for the template
            const expiryTime = new Date(Date.now() + 15 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            await sendEmail({
                to_email: INITIAL_CREDENTIALS.email,
                to_name: INITIAL_CREDENTIALS.username,
                message_type: 'PIN Verification',
                passcode: pin, // Matching user's template {{passcode}}
                time: expiryTime, // Matching user's template {{time}}
                subject: 'Security PIN for Smart Ledger'
            });
        } catch (err) {
            // We still resolve so the user can use simulation if real fails
            console.warn('Real email failed, falling back to simulation UI');
        }
        return pin;
    };

    const resetPassword = async (newPassword) => {
        setStoredPassword(newPassword);
        localStorage.setItem('smart_ledger_password', newPassword);

        try {
            await sendEmail({
                to_email: INITIAL_CREDENTIALS.email,
                to_name: INITIAL_CREDENTIALS.username,
                message_type: 'Password Reset Success',
                password: newPassword,
                subject: 'Your Password has been Reset - Smart Ledger'
            });
        } catch (err) {
            console.warn('Real email failed, change was successful locally though');
        }
    };

    const verifyPin = (pin) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (pin === currentPin) {
                    resolve();
                } else {
                    reject(new Error('Invalid PIN code'));
                }
            }, 500);
        });
    };

    const verifySecurityQuestion = (questionId, userAnswer) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const question = SECURITY_QUESTIONS.find(q => q.id === questionId);
                if (question && question.answer.toLowerCase() === userAnswer.toLowerCase()) {
                    resolve();
                } else {
                    reject(new Error('Incorrect answer to security question'));
                }
            }, 500);
        });
    };

    const isEmailConfigured = !!(EMAILJS_CONFIG.serviceId && EMAILJS_CONFIG.serviceId !== 'your_service_id' &&
        EMAILJS_CONFIG.templateId && EMAILJS_CONFIG.templateId !== 'your_template_id' &&
        EMAILJS_CONFIG.publicKey && EMAILJS_CONFIG.publicKey !== 'your_public_key');

    return (
        <AuthContext.Provider value={{
            user,
            login,
            logout,
            changePassword,
            resetPassword,
            generatePin,
            verifyPin,
            verifySecurityQuestion,
            securityQuestions: SECURITY_QUESTIONS,
            isEmailConfigured,
            loading
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
