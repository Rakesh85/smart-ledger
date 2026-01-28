import React, { createContext, useContext, useState, useEffect } from 'react';

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

    const resetPassword = (newPassword) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                setStoredPassword(newPassword);
                localStorage.setItem('smart_ledger_password', newPassword);
                resolve();
            }, 500);
        });
    };

    const generatePin = () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const pin = Math.floor(1000 + Math.random() * 9000).toString();
                setCurrentPin(pin);
                console.log(`[SIMULATION] Your 4-digit PIN is: ${pin}`);
                resolve(pin);
            }, 500);
        });
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
