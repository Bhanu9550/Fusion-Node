import { useState } from 'react';
import { Link } from 'react-router-dom';
import './ForgotPassword.css';
import api from '../../../Configure/axiosConfigure.jsx';
import ErrorModal from '../../../Components/ErrorModel/ErrorModel.jsx';

const ForgotPassword = () => {
    const [step, setStep] = useState(1);

    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // --- NEW STATES FOR VISIBILITY ---
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const closeErrorModal = () => setError('');

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setError('');
        if (!email) {
            setError('Please enter your email address.');
            return;
        }
        setIsLoading(true);
        try {
            await api.post('/forgot-password/send-otp', { email });
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP. Try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await api.post('/verify-otp', { email, otp });
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setError('');
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        setIsLoading(true);
        try {
            await api.post('/reset-password', { email, newPassword });
            setStep(4);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to change password. Try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <ErrorModal
                isOpen={!!error}
                errorMessage={error}
                onClose={closeErrorModal}
            />

            <div className="forgot-password-container">
                <div className="forgot-password-card">

                    <div className="forgot-password-header">
                        <h2>
                            {step === 1 && 'Forgot Password'}
                            {step === 2 && 'Enter OTP'}
                            {step === 3 && 'Reset Password'}
                            {step === 4 && 'Success!'}
                        </h2>
                        <p>
                            {step === 1 && "Enter your email address to receive an OTP."}
                            {step === 2 && `We've sent a code to ${email}`}
                            {step === 3 && "Create a new strong password."}
                            {step === 4 && "Your password has been successfully updated."}
                        </p>
                    </div>

                    {step === 1 && (
                        <form onSubmit={handleSendOTP} className="forgot-password-form">
                            <div className="input-group">
                                <label htmlFor="email">Email Address</label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@gmail.com"
                                    required
                                />
                            </div>
                            <button type="submit" className="submit-btn" disabled={isLoading}>
                                {isLoading ? 'Sending OTP...' : 'Send OTP'}
                            </button>
                        </form>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleVerifyOTP} className="forgot-password-form">
                            <div className="input-group">
                                <label htmlFor="otp">One-Time Password (OTP)</label>
                                <input
                                    type="text"
                                    id="otp"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    placeholder="Enter 6-digit code"
                                    maxLength={6}
                                    required
                                    className="otp-input"
                                />
                            </div>
                            <button
                                type="submit"
                                className="submit-btn"
                                disabled={isLoading || otp.length < 4}
                            >
                                {isLoading ? 'Verifying...' : 'Continue'}
                            </button>
                            <button type="button" className="text-btn" onClick={() => setStep(1)} disabled={isLoading}>
                                Change Email
                            </button>
                        </form>
                    )}

                    {/* STEP 3: UPDATED WITH TOGGLE BUTTONS */}
                    {step === 3 && (
                        <form onSubmit={handleChangePassword} className="forgot-password-form">
                            
                            {/* New Password Field */}
                            <div className="input-group">
                                <label htmlFor="newPassword">New Password</label>
                                <div className="password-input-wrapper">
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        id="newPassword"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Enter new password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="toggle-password-forgot"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                    >
                                        {!showNewPassword ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="rgba(236, 236, 236, 0.421)" viewBox="0 0 640 640"><path d="M73 39.1C63.6 29.7 48.4 29.7 39.1 39.1C29.8 48.5 29.7 63.7 39 73.1L567 601.1C576.4 610.5 591.6 610.5 600.9 601.1C610.2 591.7 610.3 576.5 600.9 567.2L504.5 470.8C507.2 468.4 509.9 466 512.5 463.6C559.3 420.1 590.6 368.2 605.5 332.5C608.8 324.6 608.8 315.8 605.5 307.9C590.6 272.2 559.3 220.2 512.5 176.8C465.4 133.1 400.7 96.2 319.9 96.2C263.1 96.2 214.3 114.4 173.9 140.4L73 39.1zM236.5 202.7C260 185.9 288.9 176 320 176C399.5 176 464 240.5 464 320C464 351.1 454.1 379.9 437.3 403.5L402.6 368.8C415.3 347.4 419.6 321.1 412.7 295.1C399 243.9 346.3 213.5 295.1 227.2C286.5 229.5 278.4 232.9 271.1 237.2L236.4 202.5zM357.3 459.1C345.4 462.3 332.9 464 320 464C240.5 464 176 399.5 176 320C176 307.1 177.7 294.6 180.9 282.7L101.4 203.2C68.8 240 46.4 279 34.5 307.7C31.2 315.6 31.2 324.4 34.5 332.3C49.4 368 80.7 420 127.5 463.4C174.6 507.1 239.3 544 320.1 544C357.4 544 391.3 536.1 421.6 523.4L357.4 459.2z" /></svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="rgba(78, 195, 20, 1)" viewBox="0 0 640 640"><path d="M320 96C239.2 96 174.5 132.8 127.4 176.6C80.6 220.1 49.3 272 34.4 307.7C31.1 315.6 31.1 324.4 34.4 332.3C49.3 368 80.6 420 127.4 463.4C174.5 507.1 239.2 544 320 544C400.8 544 465.5 507.2 512.6 463.4C559.4 419.9 590.7 368 605.6 332.3C608.9 324.4 608.9 315.6 605.6 307.7C590.7 272 559.4 220 512.6 176.6C465.5 132.9 400.8 96 320 96zM176 320C176 240.5 240.5 176 320 176C399.5 176 464 240.5 464 320C464 399.5 399.5 464 320 464C240.5 464 176 399.5 176 320zM320 256C320 291.3 291.3 320 256 320C244.5 320 233.7 317 224.3 311.6C223.3 322.5 224.2 333.7 227.2 344.8C240.9 396 293.6 426.4 344.8 412.7C396 399 426.4 346.3 412.7 295.1C400.5 249.4 357.2 220.3 311.6 224.3C316.9 233.6 320 244.4 320 256z" /></svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password Field */}
                            <div className="input-group">
                                <label htmlFor="confirmPassword">Confirm Password</label>
                                <div className="password-input-wrapper">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        id="confirmPassword"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm new password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="toggle-password-forgot"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {!showConfirmPassword ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="rgba(236, 236, 236, 0.421)" viewBox="0 0 640 640"><path d="M73 39.1C63.6 29.7 48.4 29.7 39.1 39.1C29.8 48.5 29.7 63.7 39 73.1L567 601.1C576.4 610.5 591.6 610.5 600.9 601.1C610.2 591.7 610.3 576.5 600.9 567.2L504.5 470.8C507.2 468.4 509.9 466 512.5 463.6C559.3 420.1 590.6 368.2 605.5 332.5C608.8 324.6 608.8 315.8 605.5 307.9C590.6 272.2 559.3 220.2 512.5 176.8C465.4 133.1 400.7 96.2 319.9 96.2C263.1 96.2 214.3 114.4 173.9 140.4L73 39.1zM236.5 202.7C260 185.9 288.9 176 320 176C399.5 176 464 240.5 464 320C464 351.1 454.1 379.9 437.3 403.5L402.6 368.8C415.3 347.4 419.6 321.1 412.7 295.1C399 243.9 346.3 213.5 295.1 227.2C286.5 229.5 278.4 232.9 271.1 237.2L236.4 202.5zM357.3 459.1C345.4 462.3 332.9 464 320 464C240.5 464 176 399.5 176 320C176 307.1 177.7 294.6 180.9 282.7L101.4 203.2C68.8 240 46.4 279 34.5 307.7C31.2 315.6 31.2 324.4 34.5 332.3C49.4 368 80.7 420 127.5 463.4C174.6 507.1 239.3 544 320.1 544C357.4 544 391.3 536.1 421.6 523.4L357.4 459.2z" /></svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="rgba(78, 195, 20, 1)" viewBox="0 0 640 640"><path d="M320 96C239.2 96 174.5 132.8 127.4 176.6C80.6 220.1 49.3 272 34.4 307.7C31.1 315.6 31.1 324.4 34.4 332.3C49.3 368 80.6 420 127.4 463.4C174.5 507.1 239.2 544 320 544C400.8 544 465.5 507.2 512.6 463.4C559.4 419.9 590.7 368 605.6 332.3C608.9 324.4 608.9 315.6 605.6 307.7C590.7 272 559.4 220 512.6 176.6C465.5 132.9 400.8 96 320 96zM176 320C176 240.5 240.5 176 320 176C399.5 176 464 240.5 464 320C464 399.5 399.5 464 320 464C240.5 464 176 399.5 176 320zM320 256C320 291.3 291.3 320 256 320C244.5 320 233.7 317 224.3 311.6C223.3 322.5 224.2 333.7 227.2 344.8C240.9 396 293.6 426.4 344.8 412.7C396 399 426.4 346.3 412.7 295.1C400.5 249.4 357.2 220.3 311.6 224.3C316.9 233.6 320 244.4 320 256z" /></svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="submit-btn"
                                disabled={isLoading || !newPassword || !confirmPassword}
                            >
                                {isLoading ? 'Updating...' : 'Change Password'}
                            </button>
                        </form>
                    )}

                    {step === 4 && (
                        <div className="success-state">
                            <Link to="/signIn" className="submit-btn success-btn">
                                Go to Login
                            </Link>
                        </div>
                    )}

                    {step !== 4 && (
                        <div className="back-to-login">
                            <p>Remember your password? <Link to="/signIn">Back to Login</Link></p>
                        </div>
                    )}

                </div>
            </div>
        </>
    );
};

export default ForgotPassword;