import React, { useState, useEffect } from 'react';
import { supabase, AdminPassWord } from '../supabaseClient';

function CouponView({ customer, onBack, onCouponUsed }) {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [password, setPassword] = useState('');
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    loadCoupons();
  }, [customer.id]);

  const loadCoupons = async () => {
    try {
      const { data, error } = await supabase
        .from('coupon_history')
        .select('*')
        .eq('customer_id', customer.id)
        .order('issued_at', { ascending: false });

      if (error) throw error;
      setCoupons(data || []);
    } catch (error) {
      console.error('Load coupons error:', error);
    } finally {
      setLoading(false);
    }
  };

  // 쿠폰 타입 구분 함수
  const getCouponType = (couponCode) => {
    if (couponCode.startsWith('COUPON') || couponCode.startsWith('STAMP')) return 'stamp';
    if (couponCode.startsWith('BIRTHDAY') || couponCode.startsWith('BIRTH')) return 'birthday';
    return 'unknown';
  };

  // 쿠폰 타입별 필터링
  const stampCoupons = coupons.filter(c => getCouponType(c.coupon_code) === 'stamp');
  const birthdayCoupons = coupons.filter(c => getCouponType(c.coupon_code) === 'birthday');

  const handleSelectCoupon = (coupon) => {
    if (selectedCoupon?.id === coupon.id) {
      setSelectedCoupon(null);
    } else {
      setSelectedCoupon(coupon);
    }
    setMessage({ text: '', type: '' });
    setPassword('');
  };

  const handleUseCoupon = async () => {
    if (!selectedCoupon) {
      setMessage({ text: '사용할 쿠폰을 선택해주세요.', type: 'error' });
      return;
    }

    if (password !== AdminPassWord) {
      setMessage({ text: '비밀번호가 올바르지 않습니다.', type: 'error' });
      return;
    }

    const couponType = getCouponType(selectedCoupon.coupon_code);
    const couponTypeName = couponType === 'birthday' ? '생일 쿠폰' : '스탬프 쿠폰';
    
    let confirmMessage = `${couponTypeName}을 사용하시겠습니까?\n\n쿠폰 번호: ${selectedCoupon.coupon_code}\n발급일: ${formatDate(selectedCoupon.issued_at)}`;
    
    if (selectedCoupon.valid_until) {
      confirmMessage += `\n만료일: ${formatDate(selectedCoupon.valid_until)}`;
    } else {
      confirmMessage += `\n만료일: 무제한`;
    }
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setProcessing(true);

    try {
      const { error: deleteError } = await supabase
        .from('coupon_history')
        .delete()
        .eq('id', selectedCoupon.id);

      if (deleteError) throw deleteError;

      await loadCoupons();

      const { count: couponCount } = await supabase
        .from('coupon_history')
        .select('id', { count: 'exact', head: true })
        .eq('customer_id', customer.id);

      const { error: updateError } = await supabase
        .from('customers')
        .update({ coupons: couponCount || 0 })
        .eq('id', customer.id);

      if (updateError) throw updateError;

      setMessage({ text: `✅ ${couponTypeName}이 사용되었습니다!`, type: 'success' });
      setPassword('');
      setSelectedCoupon(null);
      
      if (onCouponUsed) {
        onCouponUsed();
      }

      setTimeout(() => {
        onBack();
      }, 1500);

    } catch (error) {
      console.error('Use coupon error:', error);
      setMessage({ text: '쿠폰 사용 중 오류가 발생했습니다.', type: 'error' });
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // 쿠폰 사용 폼 렌더링
  const renderCouponUseForm = () => {
    if (!selectedCoupon) return null;

    return (
      <div className="coupon-use-form" style={{ marginTop: '20px', marginBottom: '20px' }}>
        <h3>🔐 쿠폰 사용 확인</h3>
        <p className="form-description">
          선택한 쿠폰: <strong>{selectedCoupon.coupon_code}</strong>
          <br />
          종류: <strong>
            {getCouponType(selectedCoupon.coupon_code) === 'birthday' 
              ? '🎂 생일 쿠폰' 
              : '⭐ 스탬프 쿠폰'}
          </strong>
          <br />
          관리자 비밀번호를 입력해주세요
        </p>

        <div className="input-group">
          <label>비밀번호</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="관리자 비밀번호 입력"
            disabled={processing}
            onKeyPress={(e) => e.key === 'Enter' && handleUseCoupon()}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="btn btn-primary"
            onClick={handleUseCoupon}
            disabled={processing}
            style={{ flex: 1 }}
          >
            {processing ? '처리 중...' : '사용하기'}
          </button>
          <button 
            className="btn-back"
            onClick={() => {
              setSelectedCoupon(null);
              setPassword('');
              setMessage({ text: '', type: '' });
            }}
            disabled={processing}
            style={{ flex: 1 }}
          >
            취소
          </button>
        </div>

        {message.text && (
          <div className={`message ${message.type}`} style={{ marginTop: '15px' }}>
            {message.text}
          </div>
        )}
      </div>
    );
  };

  // 쿠폰 안내 렌더링
  const renderCouponInfo = (type) => {
    const isStamp = type === 'stamp';
    
    return (
      <div className="coupon-info-section" style={{ marginTop: '20px' }}>
        <h3>📋 {isStamp ? '스탬프' : '생일'} 쿠폰 안내</h3>
        <div className="info-card">
          {isStamp ? (
            <>
              <div className="info-item">
                <span className="info-icon">✨</span>
                <div>
                  <div className="info-title">쿠폰 획득</div>
                  <div className="info-desc">스탬프 10개 적립 시 자동 발급</div>
                </div>
              </div>
              <div className="info-item">
                <span className="info-icon">🎯</span>
                <div>
                  <div className="info-title">사용 방법</div>
                  <div className="info-desc">쿠폰 선택 후 관리자에게 제시</div>
                </div>
              </div>
              <div className="info-item">
                <span className="info-icon">⏰</span>
                <div>
                  <div className="info-title">유효기간</div>
                  <div className="info-desc">제한 없음 (누적 보관 가능)</div>
                </div>
              </div>
              <div className="info-item">
                <span className="info-icon">🎁</span>
                <div>
                  <div className="info-title">혜택</div>
                  <div className="info-desc">글라스 와인 1회 무료 이용</div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="info-item">
                <span className="info-icon">🎂</span>
                <div>
                  <div className="info-title">쿠폰 발급</div>
                  <div className="info-desc">생일 기념 특별 발급</div>
                </div>
              </div>
              <div className="info-item">
                <span className="info-icon">🎯</span>
                <div>
                  <div className="info-title">사용 방법</div>
                  <div className="info-desc">쿠폰 선택 후 관리자에게 제시</div>
                </div>
              </div>
              <div className="info-item">
                <span className="info-icon">⏰</span>
                <div>
                  <div className="info-title">유효기간</div>
                  <div className="info-desc">생일 일주일 전 ~ 일주일 후 (15일 간)</div>
                </div>
              </div>
              <div className="info-item">
                <span className="info-icon">🎁</span>
                <div>
                  <div className="info-title">혜택</div>
                  <div className="info-desc">10% 할인 제공 (연 1회)</div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  const renderCouponSection = (couponList, title, icon, description, color, type) => {
    const hasSelectedCoupon = selectedCoupon && getCouponType(selectedCoupon.coupon_code) === type;

    return (
      <div className="coupon-type-section" style={{ 
        background: 'var(--gradient-purple)',
        border: `3px solid ${color}`,
        borderRadius: '20px',
        padding: '25px',
        marginBottom: '20px',
        boxShadow: `0 10px 30px ${color}33`
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px',
          marginBottom: '15px'
        }}>
          <span style={{ fontSize: '32px' }}>{icon}</span>
          <div>
            <h3 style={{ 
              color: color, 
              fontSize: '22px', 
              margin: 0,
              textShadow: `0 0 10px ${color}80`
            }}>
              {title}
            </h3>
            <p style={{ 
              color: 'var(--lavender)', 
              fontSize: '13px', 
              margin: '5px 0 0 0',
              opacity: 0.9
            }}>
              {description}
            </p>
          </div>
        </div>

        <div className="coupon-count-badge" style={{
          background: `${color}22`,
          border: `2px solid ${color}`,
          borderRadius: '15px',
          padding: '15px',
          textAlign: 'center',
          marginBottom: '20px'
        }}>
          <div style={{ 
            fontSize: '36px', 
            fontWeight: '700', 
            color: color,
            textShadow: `0 0 10px ${color}80`
          }}>
            {couponList.length}
          </div>
          <div style={{ 
            fontSize: '14px', 
            color: 'var(--lavender)',
            marginTop: '5px'
          }}>
            보유 개수
          </div>
        </div>

        {couponList.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '30px',
            background: 'rgba(138, 43, 226, 0.1)',
            borderRadius: '15px',
            border: '2px dashed var(--purple-light)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '10px', opacity: 0.5 }}>
              {icon}
            </div>
            <div style={{ color: 'var(--lavender)', fontSize: '15px' }}>
              보유한 {title}이 없습니다
            </div>
          </div>
        ) : (
          <div className="coupon-list">
            {couponList.map((coupon) => (
              <div
                key={coupon.id}
                className={`coupon-item ${selectedCoupon?.id === coupon.id ? 'selected' : ''}`}
                onClick={() => handleSelectCoupon(coupon)}
                style={{
                  background: selectedCoupon?.id === coupon.id 
                    ? `${color}22` 
                    : 'rgba(138, 43, 226, 0.2)',
                  border: selectedCoupon?.id === coupon.id 
                    ? `3px solid ${color}` 
                    : '3px solid var(--purple-light)',
                  borderRadius: '15px',
                  padding: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  marginBottom: '15px'
                }}
              >
                <div className="coupon-item-header">
                  <div className="coupon-code-display">
                    <span className="coupon-code-label">쿠폰 번호</span>
                    <span className="coupon-code-value" style={{ color: color }}>
                      {coupon.coupon_code}
                    </span>
                  </div>
                  {selectedCoupon?.id === coupon.id && (
                    <span className="selected-badge" style={{ 
                      background: color,
                      color: 'var(--purple-dark)'
                    }}>
                      ✓ 선택됨
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '10px' }}>
                  <div style={{ 
                    color: 'var(--lavender)',
                    fontSize: '14px',
                    opacity: 0.9
                  }}>
                    발급일: {formatDate(coupon.issued_at)}
                  </div>
                  {coupon.valid_until && (
                    <div style={{ 
                      color: new Date(coupon.valid_until) < new Date() ? '#ff6b6b' : '#e0b0ff',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}>
                      만료일: {formatDate(coupon.valid_until)}
                      {new Date(coupon.valid_until) < new Date() && ' (만료됨)'}
                    </div>
                  )}
                  {!coupon.valid_until && type === 'stamp' && (
                    <div style={{ 
                      color: '#4caf50',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}>
                      ⏰ 무제한 사용 가능
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 스탬프 쿠폰이 선택되었을 때만 여기에 사용 폼 표시 */}
        {hasSelectedCoupon && renderCouponUseForm()}

        {/* 쿠폰 안내 */}
        {renderCouponInfo(type)}
      </div>
    );
  };

  return (
    <div className="coupon-view">
      <div className="coupon-header">
        <button className="btn-back" onClick={onBack}>
          ← 돌아가기
        </button>
        <h1>🎟️ 내 쿠폰</h1>
        <p className="subtitle">{customer.nickname}님의 쿠폰 현황</p>
      </div>

      {/* 전체 쿠폰 요약 카드 */}
      <div className="coupon-card-main">
        <div className="coupon-count">{coupons.length}</div>
        <div className="coupon-label">총 보유 쿠폰</div>
        
        <div style={{ 
          display: 'flex', 
          gap: '15px', 
          justifyContent: 'center',
          marginTop: '20px',
          flexWrap: 'wrap'
        }}>
          <div style={{
            background: 'rgba(255, 215, 0, 0.15)',
            border: '2px solid var(--gold)',
            borderRadius: '10px',
            padding: '10px 20px'
          }}>
            <span style={{ fontSize: '18px', marginRight: '5px' }}>⭐</span>
            <span style={{ color: 'var(--gold)', fontWeight: '700' }}>
              스탬프 {stampCoupons.length}개
            </span>
          </div>
          <div style={{
            background: 'rgba(255, 182, 193, 0.15)',
            border: '2px solid #ffb6c1',
            borderRadius: '10px',
            padding: '10px 20px'
          }}>
            <span style={{ fontSize: '18px', marginRight: '5px' }}>🎂</span>
            <span style={{ color: '#ffb6c1', fontWeight: '700' }}>
              생일 {birthdayCoupons.length}개
            </span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading">로딩 중...</div>
      ) : coupons.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎫</div>
          <h3>보유한 쿠폰이 없습니다</h3>
          <p>스탬프 10개를 모아서 쿠폰을 받아보세요!</p>
        </div>
      ) : (
        <>
          {/* 스탬프 쿠폰 섹션 (사용 폼 포함) */}
          {renderCouponSection(
            stampCoupons,
            '스탬프 쿠폰',
            '⭐',
            '스탬프 10개 적립 시 자동 발급',
            'var(--gold)',
            'stamp'
          )}

          {/* 생일 쿠폰 섹션 (사용 폼 포함) */}
          {renderCouponSection(
            birthdayCoupons,
            '생일 쿠폰',
            '🎂',
            '생일 기념 특별 발급',
            '#ffb6c1',
            'birthday'
          )}
        </>
      )}
    </div>
  );
}

export default CouponView;