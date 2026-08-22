import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import FusionTitle from '../../../assets/FusionNode_Title.png';
import './SignUp.css'
import FullPageShimmer from '../../../Components/FullPageShimmer/FullPageShimmer.jsx';
import api from '../../../Configure/axiosConfigure.jsx';
import ErrorModal from "../../../Components/ErrorModel/ErrorModel.jsx";

const SignUp = () => {
    const [shimmerUi, setShimmerUi] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    
    // Form Data
    const [userDetails, setUserDetails] = useState({
        fullname: "",
        username: "",
        email: "",
        password: "",
        otp: ""
    });

    // UI States
    const [otpSent, setOtpSent] = useState(false);
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [showErrorModal, setShowErrorModal] = useState(false);

    const navigate = useNavigate();

    function handleInput(e) {
        setUserDetails({ ...userDetails, [e.target.name]: e.target.value });
        setErrorMessage("");
    }

    const isFormValid = () => {
        const basicChecks = 
            userDetails.fullname.trim().length > 0 &&
            userDetails.username.trim().length >= 6 &&
            userDetails.email.includes('@') &&
            userDetails.password.length >= 6;

        if (!basicChecks) return false;
        if (!otpSent) return false;
        if (userDetails.otp.length !== 6) return false;

        return true;
    };

    async function sendOTP() {
        if (!userDetails.email || !userDetails.email.includes('@')) {
            setErrorMessage("Please enter a valid email address first.");
            setShowErrorModal(true);
            return;
        }

        setIsSendingOtp(true);
        try {
            await api.post('/send-otp', { email: userDetails.email });
            setOtpSent(true); 
            setErrorMessage("");
        } catch (err) {
            let msg = "Failed to send OTP.";
            if (err.response?.data?.error) msg = err.response.data.error;
            else if (err.response?.status === 503) msg = "OTP service temporarily unavailable.";
            
            setErrorMessage(msg);
            setShowErrorModal(true);
        } finally {
            setIsSendingOtp(false);
        }
    }

    async function submitUser(e) {
        e.preventDefault();
        
        if (!isFormValid()) {
            setErrorMessage("Please complete the verification step.");
            setShowErrorModal(true);
            return;
        }

        try {
            setShimmerUi(true);
            const res = await api.post('/signup', userDetails);
            
            if (res.status === 201) {
                navigate('/SignIn');
            }
        } catch (err) {
            let errorMsg = "Registration failed. Please try again.";
            
            if (err.response) {
                if (err.response.data.error) {
                    errorMsg = err.response.data.error;
                } else if (err.response.data.response) {
                     errorMsg = err.response.data.response; 
                }
            } else if (err.request?.status === 0) {
                errorMsg = "Server is Down or Network Issue.";
            }

            setErrorMessage(errorMsg);
            setShowErrorModal(true);
        } finally {
            setShimmerUi(false);
        }
    }

    async function handleUsername(e) {
        const val = e.target.value;
        if (val.length >= 6) {
            try {
                await api.post(`/userCheck`, { username: val });
                setErrorMessage("");
            } catch (err) {
                if (err.response?.data?.error) {
                    setErrorMessage(err.response.data.error);
                    setShowErrorModal(true);
                }
            }
        } else if (val.length >= 1 && val.length < 6) {
            setErrorMessage("Username must be at least 6 characters long");
            setShowErrorModal(true);
        }
    }

    return (
        <>
            {shimmerUi && <FullPageShimmer />}

            {/* 2. Replace the old modal logic with the new component */}
            <ErrorModal 
                isOpen={showErrorModal} 
                errorMessage={errorMessage} 
                onClose={() => setShowErrorModal(false)} 
            />

            <div className="signup-wrapper">
                {/* ... rest of your JSX remains exactly the same ... */}
                <div className="signup-card">
                    <div className="signup-left">
                        <div className="signup-image-container">
                            <img src="/signup-svg.svg" alt="signup illustration" className="signup-image" />
                        </div>
                        <div className='left-bottom'>
                            <div className="nav-title">
                                <img src={FusionTitle} alt="FusionNode" />
                            </div>
                            <div className="signup-left-content">
                                <h2 className="signup-left-title">Join Us Today</h2>
                                <p className="signup-left-subtitle">
                                    Create your account and start your journey
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="signup-right">
                        <div className="nav-title title-atForm">
                            <img src={FusionTitle} alt="FusionNode" />
                        </div>
                        
                        <div className="signup-header">
                            <h1 className="signup-title">Sign-Up</h1>
                        </div>

                        <form className="signup-form" onSubmit={submitUser}>
                            <div className="signup-field">
                                <span className="signup-field-mono">Full Name</span>
                                <input
                                    type="text"
                                    value={userDetails.fullname}
                                    name="fullname"
                                    placeholder="full name"
                                    className="signup-input"
                                    autoComplete="off"
                                    onChange={handleInput}
                                    required
                                />
                            </div>

                            <div className="signup-field">
                                <span className="signup-field-mono">User Name</span>
                                <input
                                    type="text"
                                    value={userDetails.username}
                                    name="username"
                                    placeholder="user name"
                                    className="signup-input"
                                    onBlur={handleUsername}
                                    onChange={handleInput}
                                    required
                                    autoComplete="off"
                                />
                            </div>

                            <div className="signup-field">
                                <span className="signup-field-mono">Email</span>
                                <div className="email-row">
                                    <input
                                        type="email"
                                        value={userDetails.email}
                                        name="email"
                                        placeholder="email@example.com"
                                        className="signup-input"
                                        autoComplete="off"
                                        onChange={handleInput}
                                        required
                                    />
                                    
                                    <button 
                                        type="button" 
                                        className={`send-otp-btn ${!userDetails.email ? 'disabled-btn' : ''}`}
                                        onClick={sendOTP}
                                        disabled={isSendingOtp || otpSent || !userDetails.email.includes('@')}
                                    >
                                        {isSendingOtp ? 'Sending...' : (otpSent ? 'Sent ✅' : 'Send OTP')}
                                    </button>
                                </div>
                            </div>

                            {otpSent && (
                                <div className="signup-field">
                                    <span className="signup-field-mono">Verification Code</span>
                                    <input
                                        type="text"
                                        maxLength="6"
                                        value={userDetails.otp}
                                        name="otp"
                                        placeholder="Enter 6-digit code"
                                        className="signup-input"
                                        onChange={handleInput}
                                        autoComplete="one-time-code"
                                    />
                                    <p className="hint-text">
                                        {userDetails.otp.length === 6 ? '✅ Ready to sign up' : `Enter 6 digits (${userDetails.otp.length}/6)`}
                                    </p>
                                </div>
                            )}

                            <div className="signup-field">
                                <span className="signup-field-mono">Password</span>
                                <div className="signup-input-wrapper">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={userDetails.password}
                                        name="password"
                                        placeholder="password"
                                        className="signup-input"
                                        onChange={handleInput}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="toggle-password"
                                        onClick={() => setShowPassword(prev => !prev)}
                                    >
                                        {!showPassword ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="rgba(236, 236, 236, 0.421)" viewBox="0 0 640 640"><path d="M73 39.1C63.6 29.7 48.4 29.7 39.1 39.1C29.8 48.5 29.7 63.7 39 73.1L567 601.1C576.4 610.5 591.6 610.5 600.9 601.1C610.2 591.7 610.3 576.5 600.9 567.2L504.5 470.8C507.2 468.4 509.9 466 512.5 463.6C559.3 420.1 590.6 368.2 605.5 332.5C608.8 324.6 608.8 315.8 605.5 307.9C590.6 272.2 559.3 220.2 512.5 176.8C465.4 133.1 400.7 96.2 319.9 96.2C263.1 96.2 214.3 114.4 173.9 140.4L73 39.1zM236.5 202.7C260 185.9 288.9 176 320 176C399.5 176 464 240.5 464 320C464 351.1 454.1 379.9 437.3 403.5L402.6 368.8C415.3 347.4 419.6 321.1 412.7 295.1C399 243.9 346.3 213.5 295.1 227.2C286.5 229.5 278.4 232.9 271.1 237.2L236.4 202.5zM357.3 459.1C345.4 462.3 332.9 464 320 464C240.5 464 176 399.5 176 320C176 307.1 177.7 294.6 180.9 282.7L101.4 203.2C68.8 240 46.4 279 34.5 307.7C31.2 315.6 31.2 324.4 34.5 332.3C49.4 368 80.7 420 127.5 463.4C174.6 507.1 239.3 544 320.1 544C357.4 544 391.3 536.1 421.6 523.4L357.4 459.2z" /></svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="rgba(78, 195, 20, 1)" viewBox="0 0 640 640"><path d="M320 96C239.2 96 174.5 132.8 127.4 176.6C80.6 220.1 49.3 272 34.4 307.7C31.1 315.6 31.1 324.4 34.4 332.3C49.3 368 80.6 420 127.4 463.4C174.5 507.1 239.2 544 320 544C400.8 544 465.5 507.2 512.6 463.4C559.4 419.9 590.7 368 605.6 332.3C608.9 324.4 608.9 315.6 605.6 307.7C590.7 272 559.4 220 512.6 176.6C465.5 132.9 400.8 96 320 96zM176 320C176 240.5 240.5 176 320 176C399.5 176 464 240.5 464 320C464 399.5 399.5 464 320 464C240.5 464 176 399.5 176 320zM320 256C320 291.3 291.3 320 256 320C244.5 320 233.7 317 224.3 311.6C223.3 322.5 224.2 333.7 227.2 344.8C240.9 396 293.6 426.4 344.8 412.7C396 399 426.4 346.3 412.7 295.1C400.5 249.4 357.2 220.3 311.6 224.3C316.9 233.6 320 244.4 320 256z" /></svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                className={`signup-btn ${!isFormValid() ? 'signup-btn-disabled' : ''}`}
                                disabled={!isFormValid()}
                            >
                                {otpSent && userDetails.otp.length !== 6 ? "Enter Code to Continue" : "Create Account"}
                            </button>
                        </form>

                        <div className="signup-footer">
                            <span className="signup-footer-text">
                                Already have an account?{' '}
                                <Link className="signin-link" to="/SignIn">
                                    Sign In
                                </Link>
                            </span>
                            <Link className="signup-back" to="/">
                                ← Go Back
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default SignUp;