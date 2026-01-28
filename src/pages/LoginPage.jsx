import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotFlow, setForgotFlow] = useState(null); // 'email', 'pin', 'question', 'reset', 'success'
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [simulatedPin, setSimulatedPin] = useState(null);

  const { login, resetPassword, generatePin, verifyPin, verifySecurityQuestion, securityQuestions } = useAuth();

  useEffect(() => {
    if (forgotFlow === 'question') {
      const randomQ = securityQuestions[Math.floor(Math.random() * securityQuestions.length)];
      setSelectedQuestion(randomQ);
    }
  }, [forgotFlow, securityQuestions]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailStep = async (e) => {
    e.preventDefault();
    if (email.toLowerCase() !== 'rakeshprajapati85@gmail.com') {
      setError('Email not found in our records');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const pinCode = await generatePin();
      setSimulatedPin(pinCode);
      setForgotFlow('pin');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePinStep = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await verifyPin(pin);
      setForgotFlow('question');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSecurityStep = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await verifySecurityQuestion(selectedQuestion.id, securityAnswer);
      setForgotFlow('reset');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetStep = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await resetPassword(newPassword);
      setForgotFlow('success');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setForgotFlow(null);
    setEmail('');
    setPin('');
    setSecurityAnswer('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setLoading(false);
    setSimulatedPin(null);
  };

  const renderForgotFlow = () => {
    switch (forgotFlow) {
      case 'email':
        return (
          <div className="login-card">
            <h1 className="login-title">Forgot Password</h1>
            <p className="login-subtitle">Enter your registered email ID</p>
            <form onSubmit={handleEmailStep} className="login-form">
              {error && <div className="error-message">{error}</div>}
              <div className="form-group">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                />
              </div>
              <button type="submit" className="login-button" disabled={loading}>
                {loading ? 'Sending PIN...' : 'Send 4-digit PIN'}
              </button>
              <button type="button" onClick={resetState} className="back-button">Back to Login</button>
            </form>
          </div>
        );
      case 'pin':
        return (
          <div className="login-card">
            <h1 className="login-title">Verify PIN</h1>
            <p className="login-subtitle">Enter the 4-digit PIN sent to your email</p>

            {/* Simulation Notice */}
            <div style={{
              backgroundColor: '#FEF3C7',
              border: '1px solid #F59E0B',
              borderRadius: '4px',
              padding: '0.75rem',
              marginBottom: '1.5rem',
              fontSize: '0.875rem',
              color: '#92400E'
            }}>
              <strong>Simulation Mode:</strong> Since real emails cannot be sent, your PIN is: <code style={{ fontSize: '1.1rem', fontWeight: 700 }}>{simulatedPin}</code>
            </div>

            <form onSubmit={handlePinStep} className="login-form">
              {error && <div className="error-message">{error}</div>}
              <div className="form-group">
                <input
                  type="text"
                  maxLength="4"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="0 0 0 0"
                  style={{ textAlign: 'center', letterSpacing: '0.5rem', fontWeight: 700 }}
                  required
                />
              </div>
              <button type="submit" className="login-button" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify PIN'}
              </button>
              <button type="button" onClick={resetState} className="back-button">Cancel</button>
            </form>
          </div>
        );
      case 'question':
        return (
          <div className="login-card">
            <h1 className="login-title">Security Check</h1>
            <p className="login-subtitle">Please answer the following question:</p>
            <form onSubmit={handleSecurityStep} className="login-form">
              {error && <div className="error-message">{error}</div>}
              <div className="form-group">
                <label>{selectedQuestion?.question}</label>
                <input
                  type="text"
                  value={securityAnswer}
                  onChange={(e) => setSecurityAnswer(e.target.value)}
                  placeholder="Your answer"
                  required
                />
              </div>
              <button type="submit" className="login-button" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify Answer'}
              </button>
              <button type="button" onClick={resetState} className="back-button">Cancel</button>
            </form>
          </div>
        );
      case 'reset':
        return (
          <div className="login-card">
            <h1 className="login-title">New Password</h1>
            <p className="login-subtitle">Update and confirm your new password</p>
            <form onSubmit={handleResetStep} className="login-form">
              {error && <div className="error-message">{error}</div>}
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="login-button" disabled={loading}>
                {loading ? 'Resetting...' : 'Update Password'}
              </button>
              <button type="button" onClick={resetState} className="back-button">Cancel</button>
            </form>
          </div>
        );
      case 'success':
        return (
          <div className="login-card">
            <h1 className="login-title">Reset Successful</h1>
            <p className="forgot-message">
              Your password has been changed successfully.<br /><br />
              An automated email has been sent to <strong>{email}</strong> containing your new password for your records.
            </p>
            <button onClick={resetState} className="login-button">Proceed to Login</button>
          </div>
        );
      default:
        return (
          <div className="login-card">
            <div className="login-header">
              <h1 className="login-title">Smart Ledger</h1>
              <p className="login-subtitle">Welcome back! Please login to your account.</p>
            </div>
            <form onSubmit={handleLogin} className="login-form">
              {error && <div className="error-message">{error}</div>}
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>
              <div className="forgot-link-container">
                <a href="#" onClick={(e) => { e.preventDefault(); setForgotFlow('email'); }} className="forgot-link">
                  Forgot password?
                </a>
              </div>
              <button type="submit" className="login-button" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </div>
        );
    }
  };

  return (
    <div className="login-container">
      {renderForgotFlow()}
      <style>{loginStyles}</style>
    </div>
  );
};

const loginStyles = `
  .login-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    padding: 1rem;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }

  .login-card {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 2rem;
    width: 100%;
    max-width: 400px;
    box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
    animation: fadeIn 0.6s ease-out;
  }

  .login-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .login-title {
    color: white;
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    text-align: center;
  }

  .login-subtitle {
    color: #64748B;
    font-size: 0.875rem;
    text-align: center;
    margin-bottom: 1.5rem;
  }

  .login-form {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .form-group label {
    color: white;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .form-group input {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    padding: 0.75rem;
    color: white;
    font-size: 1rem;
    transition: all 0.2s;
  }

  .form-group input:focus {
    outline: none;
    border-color: #3B82F6;
    background: rgba(255, 255, 255, 0.08);
  }

  .forgot-link-container {
    display: flex;
    justify-content: flex-end;
  }

  .forgot-link {
    color: #3B82F6;
    font-size: 0.875rem;
    text-decoration: none;
  }

  .forgot-link:hover {
    text-decoration: underline;
  }

  .login-button {
    background: #3B82F6;
    color: white;
    padding: 0.75rem;
    border: none;
    border-radius: 4px;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .login-button:hover:not(:disabled) {
    background: #2563EB;
transform: translateY(-1px);
  }

  .login-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .back-button {
    background: none;
    border: none;
    color: #64748B;
    font-size: 0.875rem;
    cursor: pointer;
    padding: 0.5rem;
    transition: color 0.2s;
    text-align: center;
  }

  .back-button:hover {
    color: white;
  }

  .error-message {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.2);
    color: #f87171;
    padding: 0.75rem;
    border-radius: 4px;
    font-size: 0.875rem;
    animation: shake 0.4s ease-in-out;
  }

  .forgot-message {
    color: white;
    font-size: 1rem;
    line-height: 1.6;
    margin-bottom: 2rem;
    text-align: center;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }
`;

export default LoginPage;
