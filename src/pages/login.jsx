import { useState } from 'react';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: '',
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.role) {
      newErrors.role = 'Please select a role';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsLoading(true);
    
    // MOCK LOGIN
    setTimeout(() => {
      localStorage.setItem('token', 'mock-token-123');
      localStorage.setItem('userRole', formData.role);
      setIsLoading(false);
      onLogin?.({ email: formData.email, role: formData.role });
    }, 1000);
  };

  return (
    <div className="flex min-h-screen w-full font-[Inter,sans-serif] overflow-hidden">
      {/* LEFT SIDE - IMAGE */}
      <div className="flex-1 min-h-screen overflow-hidden bg-black hidden lg:flex">
        <img 
          src="/images/healthcare-team.png"
          alt="Healthcare professionals" 
          className="w-full h-screen object-cover object-center block"
        />
      </div>
      
      {/* RIGHT SIDE - FORM */}
      <div className="flex-1 flex items-center justify-center min-h-screen bg-white p-6 sm:p-10 lg:p-0">
        <div className="w-full max-w-xl lg:max-w-md xl:max-w-lg text-left">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-[#1a1a1a] mb-2 tracking-tight leading-tight">
            Login
          </h1>
          <p className="text-base sm:text-lg text-[#666] mb-12 sm:mb-16">
            Let's Login into Smart Health Care first
          </p>
          
          <form onSubmit={handleSubmit} className="w-full" noValidate>
            {/* Email */}
            <div className="mb-6 sm:mb-8">
              <label htmlFor="email" className="block text-base sm:text-lg font-semibold text-[#1a1a1a] mb-2 sm:mb-3">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className={`w-full px-5 py-4 sm:px-6 sm:py-5 border-2 rounded-xl text-base sm:text-lg bg-white text-[#1a1a1a] font-[Inter,sans-serif] transition-all duration-200 focus:outline-none focus:border-black focus:ring-4 focus:ring-black/5 ${
                  errors.email ? 'border-red-500' : 'border-[#e0e0e0]'
                }`}
              />
              {errors.email && (
                <span className="block text-sm text-red-500 mt-2">{errors.email}</span>
              )}
            </div>

            {/* Password */}
            <div className="mb-6 sm:mb-8">
              <label htmlFor="password" className="block text-base sm:text-lg font-semibold text-[#1a1a1a] mb-2 sm:mb-3">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={`w-full px-5 py-4 sm:px-6 sm:py-5 pr-14 border-2 rounded-xl text-base sm:text-lg bg-white text-[#1a1a1a] font-[Inter,sans-serif] transition-all duration-200 focus:outline-none focus:border-black focus:ring-4 focus:ring-black/5 ${
                    errors.password ? 'border-red-500' : 'border-[#e0e0e0]'
                  }`}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 sm:right-5 top-1/2 -translate-y-1/2 bg-none border-none cursor-pointer text-xl opacity-50 hover:opacity-80 transition-opacity p-0"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && (
                <span className="block text-sm text-red-500 mt-2">{errors.password}</span>
              )}
            </div>

            {/* Role */}
            <div className="mb-6 sm:mb-8">
              <label htmlFor="role" className="block text-base sm:text-lg font-semibold text-[#1a1a1a] mb-2 sm:mb-3">
                Role
              </label>
              <div className="relative">
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className={`w-full px-5 py-4 sm:px-6 sm:py-5 border-2 rounded-xl text-base sm:text-lg bg-white text-[#1a1a1a] font-[Inter,sans-serif] appearance-none cursor-pointer transition-all duration-200 focus:outline-none focus:border-black focus:ring-4 focus:ring-black/5 pr-14 ${
                    errors.role ? 'border-red-500' : 'border-[#e0e0e0]'
                  } ${!formData.role ? 'text-[#aaa]' : ''}`}
                >
                  <option value="" disabled>Select Role</option>
                  <option value="Doctor">Doctor</option>
                  <option value="Nurse">Nurse</option>
                  <option value="Staff">Staff</option>
                  <option value="Pharmacist">Pharmacist</option>
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
                    <path d="M6 8L1 3h10z" fill="#666"/>
                  </svg>
                </div>
              </div>
              {errors.role && (
                <span className="block text-sm text-red-500 mt-2">{errors.role}</span>
              )}
            </div>

            {/* Error Banner */}
            {errors.submit && (
              <div className="bg-[#f8d7da] text-[#721c24] px-5 py-4 rounded-xl mb-6 text-base">
                {errors.submit}
              </div>
            )}

            {/* Login Button */}
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-5 sm:py-6 bg-black text-white border-none rounded-xl text-lg sm:text-xl font-semibold cursor-pointer transition-all duration-200 mt-5 hover:bg-[#333] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>

            {/* Register Link */}
            <p className="text-center mt-8 text-base text-[#666]">
              Don't have an account?{' '}
              <a href="/register" className="text-[#4a90e2] no-underline font-medium hover:underline">
                Register Here
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;