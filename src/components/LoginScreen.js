import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

function LoginScreen({ onLogin }) {
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    // 저장된 전화번호 불러오기
    const savedPhone = localStorage.getItem('saved_phone');
    const savedRemember = localStorage.getItem('remember_me');
    
    if (savedRemember === 'true' && savedPhone) {
      setPhone(savedPhone);
      setRememberMe(true);
    }
  }, []);

  const formatPhone = (value) => {
    const numbers = value.replace(/[^0-9]/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (e) => {
    setPhone(formatPhone(e.target.value));
  };

  const handleLogin = async () => {
    if (!phone.match(/^010-\d{4}-\d{4}$/)) {
      setMessage({ text: '올바른 전화번호를 입력해주세요.', type: 'error' });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('phone_number', phone)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (!data) {
        setMessage({ text: '등록되지 않은 전화번호입니다. 매장에 문의해주세요.', type: 'error' });
        setLoading(false);
        return;
      }

      // 로그인 정보 저장
      if (rememberMe) {
        localStorage.setItem('saved_phone', phone);
        localStorage.setItem('remember_me', 'true');
      } else {
        localStorage.removeItem('saved_phone');
        localStorage.removeItem('remember_me');
      }

      onLogin(data);
    } catch (error) {
      console.error('Login error:', error);
      setMessage({ text: '로그인 중 오류가 발생했습니다.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="logo">🔮</div>
        <h1>타로 카드 선택</h1>
        <p className="subtitle">방문 기록과 나만의 카드를 확인하세요</p>

        <div className="input-group">
          <label>전화번호</label>
          <input
            type="tel"
            value={phone}
            onChange={handlePhoneChange}
            placeholder="010-1234-5678"
            maxLength="13"
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            disabled={loading}
          />
        </div>

        <div className="checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <span>로그인 정보 저장</span>
          </label>
        </div>

        <button 
          className="btn btn-primary" 
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? '로그인 중...' : '로그인'}
        </button>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <p className="help-text">
          * 매장 방문 시 등록한 전화번호를 입력해주세요
        </p>
      </div>
    </div>
  );
}

export default LoginScreen;