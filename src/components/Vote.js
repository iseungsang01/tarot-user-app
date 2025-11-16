import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

function Vote({ onBack, customer }) {
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVote, setSelectedVote] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showResults, setShowResults] = useState({});
  const [voteResults, setVoteResults] = useState({});

  useEffect(() => {
    loadVotes();
  }, [customer]);

  const loadVotes = async () => {
    try {
      const { data, error } = await supabase
        .from('votes')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // 각 투표에 대한 사용자 참여 여부 확인
      const votesWithStatus = await Promise.all(
        (data || []).map(async (vote) => {
          const { data: response } = await supabase
            .from('vote_responses')
            .select('*')
            .eq('vote_id', vote.id)
            .eq('customer_id', customer.id)
            .single();

          return {
            ...vote,
            hasVoted: !!response,
            userResponse: response
          };
        })
      );

      setVotes(votesWithStatus);

      // 모든 투표 결과 미리 로드
      const results = {};
      for (const vote of votesWithStatus) {
        const result = await loadVoteResults(vote.id);
        results[vote.id] = result;
      }
      setVoteResults(results);

    } catch (error) {
      console.error('Load votes error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadVoteResults = async (voteId) => {
    try {
      const { data, error } = await supabase
        .from('vote_responses')
        .select('selected_options')
        .eq('vote_id', voteId);

      if (error) throw error;

      // 옵션별 득표수 계산
      const optionCounts = {};
      (data || []).forEach(response => {
        const options = response.selected_options;
        options.forEach(optionId => {
          optionCounts[optionId] = (optionCounts[optionId] || 0) + 1;
        });
      });

      return {
        totalVotes: data.length,
        optionCounts
      };
    } catch (error) {
      console.error('Load vote results error:', error);
      return { totalVotes: 0, optionCounts: {} };
    }
  };

  const handleOptionToggle = (vote, optionId) => {
    if (vote.hasVoted) return;

    if (vote.allow_multiple) {
      setSelectedOptions(prev => {
        if (prev.includes(optionId)) {
          return prev.filter(id => id !== optionId);
        } else if (prev.length < vote.max_selections) {
          return [...prev, optionId];
        }
        return prev;
      });
    } else {
      setSelectedOptions([optionId]);
    }
  };

  const handleSubmitVote = async (vote) => {
    if (selectedOptions.length === 0) {
      setMessage({ text: '투표할 항목을 선택해주세요.', type: 'error' });
      return;
    }

    if (vote.allow_multiple && selectedOptions.length > vote.max_selections) {
      setMessage({ text: `최대 ${vote.max_selections}개까지 선택 가능합니다.`, type: 'error' });
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('vote_responses')
        .insert({
          vote_id: vote.id,
          customer_id: customer.id,
          selected_options: selectedOptions
        });

      if (error) {
        if (error.code === '23505') {
          setMessage({ text: '이미 투표하셨습니다.', type: 'error' });
        } else {
          throw error;
        }
        return;
      }

      setMessage({ text: '✅ 투표가 완료되었습니다!', type: 'success' });
      setSelectedOptions([]);
      setSelectedVote(null);
      
      // 투표 목록 새로고침
      await loadVotes();

      setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 2000);

    } catch (error) {
      console.error('Submit vote error:', error);
      setMessage({ text: '투표 중 오류가 발생했습니다.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleResults = async (voteId) => {
    setShowResults(prev => ({
      ...prev,
      [voteId]: !prev[voteId]
    }));

    if (!showResults[voteId]) {
      const result = await loadVoteResults(voteId);
      setVoteResults(prev => ({
        ...prev,
        [voteId]: result
      }));
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isVoteExpired = (endsAt) => {
    if (!endsAt) return false;
    return new Date(endsAt) < new Date();
  };

  const getVotePercentage = (voteId, optionId) => {
    const result = voteResults[voteId];
    if (!result || result.totalVotes === 0) return 0;
    
    const optionVotes = result.optionCounts[optionId] || 0;
    return Math.round((optionVotes / result.totalVotes) * 100);
  };

  const getOptionVotes = (voteId, optionId) => {
    const result = voteResults[voteId];
    if (!result) return 0;
    return result.optionCounts[optionId] || 0;
  };

  return (
    <div className="vote-view">
      <div className="vote-header">
        <button className="btn-back" onClick={onBack}>
          ← 돌아가기
        </button>
        <h1>🗳️ 투표</h1>
        <p className="subtitle">고객님의 소중한 의견을 들려주세요</p>
      </div>

      {loading ? (
        <div className="loading">로딩 중...</div>
      ) : votes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🗳️</div>
          <h3>진행 중인 투표가 없습니다</h3>
          <p>새로운 투표가 등록되면 알려드릴게요</p>
        </div>
      ) : (
        <div className="vote-list">
          {votes.map((vote) => {
            const expired = isVoteExpired(vote.ends_at);
            const options = vote.options || [];
            const result = voteResults[vote.id] || { totalVotes: 0, optionCounts: {} };

            return (
              <div key={vote.id} className="vote-card">
                <div className="vote-card-header">
                  <div>
                    <h3 className="vote-title">{vote.title}</h3>
                    {vote.description && (
                      <p className="vote-description">{vote.description}</p>
                    )}
                  </div>
                  
                  <div className="vote-badges">
                    {vote.hasVoted && (
                      <span className="vote-badge voted">
                        ✓ 투표 완료
                      </span>
                    )}
                    {expired && (
                      <span className="vote-badge expired">
                        ⏰ 마감
                      </span>
                    )}
                    {vote.allow_multiple && (
                      <span className="vote-badge multiple">
                        복수선택 (최대 {vote.max_selections}개)
                      </span>
                    )}
                  </div>
                </div>

                {vote.ends_at && (
                  <div className="vote-deadline">
                    <span className="deadline-label">마감:</span>
                    <span className={expired ? 'deadline-expired' : 'deadline-active'}>
                      {formatDate(vote.ends_at)}
                    </span>
                  </div>
                )}

                <div className="vote-options">
                  {options.map((option) => {
                    const isSelected = selectedOptions.includes(option.id);
                    const isUserChoice = vote.hasVoted && 
                      vote.userResponse?.selected_options?.includes(option.id);
                    const percentage = getVotePercentage(vote.id, option.id);
                    const optionVotes = getOptionVotes(vote.id, option.id);
                    const showingResults = showResults[vote.id] || vote.hasVoted;

                    return (
                      <div
                        key={option.id}
                        className={`vote-option ${isSelected ? 'selected' : ''} ${
                          vote.hasVoted || expired ? 'disabled' : ''
                        } ${isUserChoice ? 'user-choice' : ''}`}
                        onClick={() => {
                          if (!vote.hasVoted && !expired) {
                            handleOptionToggle(vote, option.id);
                          }
                        }}
                      >
                        <div className="option-content">
                          <div className="option-text">
                            {!vote.hasVoted && !expired && (
                              <input
                                type={vote.allow_multiple ? 'checkbox' : 'radio'}
                                checked={isSelected}
                                onChange={() => {}}
                                disabled={vote.hasVoted || expired}
                              />
                            )}
                            <span>{option.text}</span>
                            {isUserChoice && (
                              <span className="my-vote-badge">내 선택</span>
                            )}
                          </div>

                          {showingResults && (
                            <div className="option-stats">
                              <span className="option-percentage">{percentage}%</span>
                              <span className="option-votes">({optionVotes}표)</span>
                            </div>
                          )}
                        </div>

                        {showingResults && (
                          <div className="vote-progress-bar">
                            <div 
                              className="vote-progress-fill"
                              style={{ 
                                width: `${percentage}%`,
                                background: isUserChoice 
                                  ? 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)'
                                  : 'linear-gradient(135deg, #8a2be2 0%, #9370db 100%)'
                              }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="vote-footer">
                  <div className="vote-info">
                    <span className="vote-total">
                      💬 총 {result.totalVotes}명 참여
                    </span>
                    {!vote.is_anonymous && (
                      <button
                        className="btn-toggle-results"
                        onClick={() => handleToggleResults(vote.id)}
                      >
                        {showResults[vote.id] ? '🙈 결과 숨기기' : '👁️ 결과 보기'}
                      </button>
                    )}
                  </div>

                  {!vote.hasVoted && !expired && selectedOptions.length > 0 && (
                    <button
                      className="btn btn-primary btn-submit-vote"
                      onClick={() => handleSubmitVote(vote)}
                      disabled={submitting}
                    >
                      {submitting ? '투표 중...' : '투표하기'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}
    </div>
  );
}

export default Vote;