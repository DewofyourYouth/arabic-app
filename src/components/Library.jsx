import React, { useState, useMemo } from 'react';
import { useAudio } from '../hooks/useAudio';
import { useSettings } from '../contexts/SettingsContext';
import { useData } from '../contexts/DataContext';
import { CITIES } from '../data/artifacts';

const Library = ({ cards: rawCards }) => {
  // Deduplicate cards to ensure unique entries in the library
  const cards = useMemo(() => {
    const seen = new Set();
    return rawCards.filter(c => {
      if (seen.has(c.id)) return false;
      seen.add(c.id);
      return true;
    });
  }, [rawCards]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('mastery'); // 'mastery', 'alphabetical', 'recent'
  const { playPronunciation } = useAudio();
  const { settings } = useSettings();
  const { userData } = useData();

  // Calculate statistics
  const stats = useMemo(() => {
    const learned = cards.filter(c => c.srs.repetition > 0);
    const beginner = cards.filter(c => c.srs.repetition >= 1 && c.srs.repetition <= 2);
    const intermediate = cards.filter(c => c.srs.repetition >= 3 && c.srs.repetition <= 5);
    const advanced = cards.filter(c => c.srs.repetition >= 6 && c.srs.repetition <= 8);
    const master = cards.filter(c => c.srs.repetition >= 9);

    const categories = {};
    cards.forEach(card => {
      const cat = card.category || card.type || 'general';
      if (!categories[cat]) categories[cat] = { total: 0, learned: 0 };
      categories[cat].total++;
      if (card.srs.repetition > 0) categories[cat].learned++;
    });

    return {
      total: cards.length,
      learned: learned.length,
      beginner: beginner.length,
      intermediate: intermediate.length,
      advanced: advanced.length,
      master: master.length,
      categories
    };
  }, [cards]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set();
    cards.forEach(card => cats.add(card.category || card.type || 'general'));
    return Array.from(cats).sort();
  }, [cards]);

  // Filter and search
  const filteredCards = useMemo(() => {
    let filtered = [...cards];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(card =>
        card.arabic?.toLowerCase().includes(query) ||
        card.english?.toLowerCase().includes(query) ||
        card.hebrew?.includes(query) ||
        card.transliteration?.toLowerCase().includes(query)
      );
    }

    // Mastery level filter
    if (filterLevel !== 'all') {
      if (filterLevel === 'new') {
        filtered = filtered.filter(c => c.srs.repetition === 0);
      } else if (filterLevel === 'beginner') {
        filtered = filtered.filter(c => c.srs.repetition >= 1 && c.srs.repetition <= 2);
      } else if (filterLevel === 'intermediate') {
        filtered = filtered.filter(c => c.srs.repetition >= 3 && c.srs.repetition <= 5);
      } else if (filterLevel === 'advanced') {
        filtered = filtered.filter(c => c.srs.repetition >= 6 && c.srs.repetition <= 8);
      } else if (filterLevel === 'master') {
        filtered = filtered.filter(c => c.srs.repetition >= 9);
      }
    }

    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(c => (c.category || c.type || 'general') === filterCategory);
    }

    // Sort
    if (sortBy === 'alphabetical') {
      filtered.sort((a, b) => (a.english || '').localeCompare(b.english || ''));
    } else if (sortBy === 'mastery') {
      filtered.sort((a, b) => b.srs.repetition - a.srs.repetition);
    }

    return filtered;
  }, [cards, searchQuery, filterLevel, filterCategory, sortBy]);

  const getMasteryBadge = (repetition) => {
    if (repetition === 0) return { label: 'New', color: '#9E9E9E', bg: '#F5F5F5' };
    if (repetition <= 2) return { label: 'Beginner', color: '#FF9800', bg: '#FFF3E0' };
    if (repetition <= 5) return { label: 'Intermediate', color: '#2196F3', bg: '#E3F2FD' };
    if (repetition <= 8) return { label: 'Advanced', color: '#9C27B0', bg: '#F3E5F5' };
    return { label: 'Master', color: '#4CAF50', bg: '#E8F5E9' };
  };

  const getAchievements = () => {
    const achievements = [];
    if (stats.learned >= 10) achievements.push({ icon: '🌱', label: 'First Steps', desc: '10 words learned' });
    if (stats.learned >= 50) achievements.push({ icon: '🌿', label: 'Growing', desc: '50 words learned' });
    if (stats.learned >= 100) achievements.push({ icon: '🌳', label: 'Flourishing', desc: '100 words learned' });
    if (stats.master >= 10) achievements.push({ icon: '⭐', label: 'Master', desc: '10 mastered words' });
    if (stats.master >= 25) achievements.push({ icon: '💎', label: 'Diamond', desc: '25 mastered words' });
    return achievements;
  };

  const achievements = getAchievements();

  return (
    <div style={{ padding: 'var(--spacing-4)', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <h2 style={{
        color: 'var(--color-primary)',
        marginBottom: 'var(--spacing-4)',
        fontSize: 'var(--font-size-2xl)',
        fontWeight: '800'
      }}>
        📚 Your Library
      </h2>

      {/* Stats Overview */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 'var(--spacing-3)',
        marginBottom: 'var(--spacing-4)'
      }}>
        <StatCard label="Total Words" value={stats.total} color="#E07A5F" />
        <StatCard label="Learned" value={stats.learned} color="#4CAF50" />
        <StatCard label="Beginner" value={stats.beginner} color="#FF9800" />
        <StatCard label="Intermediate" value={stats.intermediate} color="#2196F3" />
        <StatCard label="Advanced" value={stats.advanced} color="#9C27B0" />
        <StatCard label="Master" value={stats.master} color="#FFD700" />
      </div>

      {/* Achievements */}
      {achievements.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: 'var(--spacing-4)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: 'var(--spacing-4)',
          boxShadow: 'var(--shadow-card)',
          color: 'white'
        }}>
          <h3 style={{ margin: '0 0 var(--spacing-3) 0', fontSize: 'var(--font-size-lg)', fontWeight: 'bold' }}>
            🏆 Achievements
          </h3>
          <div style={{ display: 'flex', gap: 'var(--spacing-2)', flexWrap: 'wrap' }}>
            {achievements.map((ach, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                padding: 'var(--spacing-2) var(--spacing-3)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                border: '1px solid rgba(255,255,255,0.3)'
              }}>
                <span style={{ fontSize: '1.5rem' }}>{ach.icon}</span>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{ach.label}</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>{ach.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search and Filters */}

      {/* Artifacts Collection */}
      <div style={{
        background: 'linear-gradient(135deg, #FF9966 0%, #FF5E62 100%)',
        padding: 'var(--spacing-4)',
        borderRadius: 'var(--radius-lg)',
        marginBottom: 'var(--spacing-4)',
        boxShadow: 'var(--shadow-card)',
        color: 'white'
      }}>
        <h3 style={{ margin: '0 0 var(--spacing-3) 0', fontSize: 'var(--font-size-lg)', fontWeight: 'bold' }}>
          🏺 My Artifacts
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
          gap: 'var(--spacing-3)'
        }}>
          {CITIES.map((city) => {
            const isUnlocked = userData?.artifacts?.includes(city.id);

            return (
              <div key={city.id}
                title={isUnlocked ? `${city.artifact.name}: ${city.artifact.description}` : 'Unknown Artifact'}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(5px)',
                  padding: 'var(--spacing-2)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  border: isUnlocked ? '1px solid rgba(255,255,255,0.5)' : '1px solid rgba(255,255,255,0.1)',
                  opacity: isUnlocked ? 1 : 0.5,
                  filter: isUnlocked ? 'none' : 'grayscale(1) brightness(0.7)',
                  transition: 'all 0.3s ease',
                  cursor: 'help'
                }}
                onMouseEnter={(e) => {
                  if (isUnlocked) {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                }}
              >
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: '#fff',
                  padding: '2px', // Border inside
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px'
                }}>
                  {isUnlocked ? (
                    <img src={city.artifact.image} alt={city.artifact.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                  ) : (
                    <span>🔒</span>
                  )}
                </div>
                <div style={{
                  fontSize: '0.7rem',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  width: '100%'
                }}>
                  {isUnlocked ? city.artifact.name : '???'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Search and Filters */}
      <div style={{
        background: 'white',
        padding: 'var(--spacing-4)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: 'var(--spacing-4)'
      }}>
        {/* Search Bar */}
        <input
          type="text"
          placeholder="🔍 Search words..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: 'var(--spacing-3)',
            border: '2px solid #E0E0E0',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--font-size-md)',
            marginBottom: 'var(--spacing-3)',
            outline: 'none',
            transition: 'border-color 0.2s'
          }}
          onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
          onBlur={(e) => e.target.style.borderColor = '#E0E0E0'}
        />

        {/* Filters */}
        <div style={{ display: 'flex', gap: 'var(--spacing-2)', flexWrap: 'wrap' }}>
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            style={filterSelectStyle}
          >
            <option value="all">All Levels</option>
            <option value="new">New</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="master">Master</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            style={filterSelectStyle}
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={filterSelectStyle}
          >
            <option value="mastery">Sort by Mastery</option>
            <option value="alphabetical">Sort Alphabetically</option>
          </select>
        </div>
      </div>

      {/* Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 'var(--spacing-3)'
      }}>
        {filteredCards.map((card) => {
          const badge = getMasteryBadge(card.srs.repetition);
          return (
            <div
              key={card.id}
              style={{
                backgroundColor: 'white',
                padding: 'var(--spacing-4)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.3s',
                cursor: 'pointer',
                border: '2px solid transparent',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-card)';
                e.currentTarget.style.borderColor = badge.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                e.currentTarget.style.borderColor = 'transparent';
              }}
            >
              {/* Mastery Badge */}
              <div style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: badge.bg,
                color: badge.color,
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                border: `1px solid ${badge.color}`
              }}>
                {badge.label}
              </div>

              {/* Category Tag */}
              <div style={{
                display: 'inline-block',
                background: '#F5F5F5',
                color: '#666',
                padding: '2px 8px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.7rem',
                marginBottom: 'var(--spacing-2)',
                textTransform: 'capitalize'
              }}>
                {card.category || card.type || 'general'}
              </div>

              {/* Arabic */}
              {settings.showArabicScript && (
                <div style={{
                  fontSize: 'var(--font-size-2xl)',
                  fontFamily: 'Amiri, serif',
                  fontWeight: 'bold',
                  color: 'var(--color-primary)',
                  marginBottom: 'var(--spacing-2)',
                  textAlign: 'right',
                  direction: 'rtl'
                }}>
                  {card.arabic}
                </div>
              )}

              {/* Transliteration */}
              {card.transliteration && (
                <div style={{
                  fontSize: '0.9rem',
                  color: '#888',
                  fontStyle: 'italic',
                  marginBottom: 'var(--spacing-1)'
                }}>
                  {card.transliteration}
                </div>
              )}

              {/* English/Hebrew */}
              <div style={{
                fontSize: 'var(--font-size-lg)',
                color: 'var(--color-text)',
                fontWeight: '600',
                marginBottom: 'var(--spacing-3)',
                direction: settings.nativeLanguage === 'hebrew' ? 'rtl' : 'ltr'
              }}>
                {settings.nativeLanguage === 'hebrew' ? (card.hebrew || card.english) : card.english}
              </div>

              {/* Audio Button & Progress */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  onClick={() => playPronunciation(card.arabic, card)}
                  style={{
                    background: 'var(--color-primary)',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  🔊 Play
                </button>

                <div style={{
                  fontSize: '0.8rem',
                  color: '#888',
                  fontWeight: '600'
                }}>
                  Level {card.srs.repetition}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredCards.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: 'var(--spacing-8)',
          color: '#888'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-2)' }}>📭</div>
          <p style={{ fontSize: 'var(--font-size-lg)', fontWeight: '600' }}>
            {searchQuery || filterLevel !== 'all' || filterCategory !== 'all'
              ? 'No words match your filters'
              : 'No words yet. Start practicing!'}
          </p>
        </div>
      )}
    </div>
  );
};

// Stat Card Component
const StatCard = ({ label, value, color }) => (
  <div style={{
    background: 'white',
    padding: 'var(--spacing-3)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-sm)',
    textAlign: 'center',
    border: `3px solid ${color}20`,
    transition: 'transform 0.2s'
  }}
    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
  >
    <div style={{
      fontSize: 'var(--font-size-2xl)',
      fontWeight: 'bold',
      color: color,
      marginBottom: '4px'
    }}>
      {value}
    </div>
    <div style={{
      fontSize: '0.85rem',
      color: '#666',
      fontWeight: '600'
    }}>
      {label}
    </div>
  </div>
);

const filterSelectStyle = {
  padding: '8px 12px',
  border: '2px solid #E0E0E0',
  borderRadius: 'var(--radius-md)',
  fontSize: '0.9rem',
  cursor: 'pointer',
  background: 'white',
  outline: 'none',
  transition: 'border-color 0.2s'
};

export default Library;
