import React, { useState, useEffect, useRef, useContext } from 'react';
import './FoodReels.css';
import { reelsData } from '../../assets/frontend_assets/reelsData';
import { StoreContext } from '../../Context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Volume2, VolumeX, Heart, Share2, Star, ShoppingBag, Plus, Minus, Play, Flame, Film } from 'lucide-react';

export default function FoodReels() {
  const { cartItems, addToCart, removeFromCart, getTotalCartCount, getTotalCartAmount } = useContext(StoreContext);
  const navigate = useNavigate();

  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false); // Default unmuted with user interaction
  const [likedMap, setLikedMap] = useState({});
  const [likeCounts, setLikeCounts] = useState(() => {
    const initialCounts = {};
    reelsData.forEach(r => initialCounts[r.id] = r.likes);
    return initialCounts;
  });
  const [isPlayingMap, setIsPlayingMap] = useState({});
  const [copiedId, setCopiedId] = useState(null);

  const videoRefs = useRef([]);
  const containerRef = useRef(null);

  // Setup Intersection Observer for automatic video playback on scroll
  useEffect(() => {
    const options = {
      root: containerRef.current,
      threshold: 0.7
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const index = Number(entry.target.dataset.index);
        const video = videoRefs.current[index];

        if (entry.isIntersecting) {
          setActiveIndex(index);
          if (video) {
            video.currentTime = 0;
            const playPromise = video.play();
            if (playPromise !== undefined) {
              playPromise
                .then(() => setIsPlayingMap(prev => ({ ...prev, [index]: true })))
                .catch(() => setIsPlayingMap(prev => ({ ...prev, [index]: false })));
            }
          }
        } else {
          if (video) {
            video.pause();
            setIsPlayingMap(prev => ({ ...prev, [index]: false }));
          }
        }
      });
    }, options);

    const videoElements = containerRef.current?.querySelectorAll('.reel-card');
    videoElements?.forEach(el => observer.observe(el));

    return () => {
      videoElements?.forEach(el => observer.unobserve(el));
    };
  }, []);

  // Update volume/muted state across video elements
  useEffect(() => {
    videoRefs.current.forEach(v => {
      if (v) v.muted = isMuted;
    });
  }, [isMuted]);

  // Toggle Video Play/Pause on click
  const togglePlay = (index) => {
    const video = videoRefs.current[index];
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlayingMap(prev => ({ ...prev, [index]: true }));
    } else {
      video.pause();
      setIsPlayingMap(prev => ({ ...prev, [index]: false }));
    }
  };

  // Toggle Like
  const handleLike = (reelId) => {
    setLikedMap(prev => {
      const isLiked = !prev[reelId];
      setLikeCounts(c => ({
        ...c,
        [reelId]: isLiked ? c[reelId] + 1 : c[reelId] - 1
      }));
      return { ...prev, [reelId]: isLiked };
    });
  };

  // Handle Share
  const handleShare = (reelId) => {
    const shareUrl = window.location.origin + `/reels#${reelId}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopiedId(reelId);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div className="reels-page-wrapper">
      {/* Centered Reels Viewer */}
      <div className="reels-feed-container" ref={containerRef}>
        
        {/* Top Floating Bar */}
        <div className="reel-top-bar">
          <button className="reel-back-btn" onClick={() => navigate('/')} title="Back to Home">
            <ArrowLeft size={20} />
          </button>

          <div className="reel-brand-badge">
            <Flame size={16} color="#fff" />
            <span>CraveReels</span>
          </div>

          <button className="reel-mute-top-btn" onClick={() => setIsMuted(!isMuted)} title={isMuted ? "Unmute Audio" : "Mute Audio"}>
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </div>

        {/* Floating Cart Indicator Bar if items exist */}
        {getTotalCartCount() > 0 && (
          <div className="reel-floating-checkout-bar" onClick={() => navigate('/cart')}>
            <span>🛒 {getTotalCartCount()} {getTotalCartCount() === 1 ? 'item' : 'items'} added (₹{getTotalCartAmount()})</span>
            <span>View Cart & Checkout &rarr;</span>
          </div>
        )}

        {/* Video Cards Loop */}
        {reelsData.map((reel, index) => {
          const foodId = reel.foodId;
          const currentQty = cartItems[foodId] || 0;
          const isLiked = likedMap[reel.id] || false;
          const isPlaying = isPlayingMap[index] ?? true;

          return (
            <div key={reel.id} className="reel-card" data-index={index}>
              
              {/* Video Element */}
              <video
                ref={el => videoRefs.current[index] = el}
                src={reel.videoUrl}
                poster={reel.poster}
                className="reel-video"
                loop
                playsInline
                muted={isMuted}
                onClick={() => togglePlay(index)}
              />

              {/* Pause Overlay Indicator */}
              {!isPlaying && (
                <div className="video-pause-indicator">
                  <Play size={36} fill="#fff" />
                </div>
              )}

              {/* Right Action Sidebar */}
              <div className="reel-actions-sidebar">
                {/* Like Button */}
                <div className="action-btn-item">
                  <button 
                    className={`action-circle-btn ${isLiked ? 'liked' : ''}`}
                    onClick={() => handleLike(reel.id)}
                  >
                    <Heart size={22} fill={isLiked ? "#ff4757" : "none"} color={isLiked ? "#ff4757" : "#fff"} />
                  </button>
                  <span>{likeCounts[reel.id]?.toLocaleString()}</span>
                </div>

                {/* Share Button */}
                <div className="action-btn-item">
                  <button className="action-circle-btn" onClick={() => handleShare(reel.id)}>
                    <Share2 size={22} />
                  </button>
                  <span>{copiedId === reel.id ? 'Copied!' : 'Share'}</span>
                </div>

                {/* Mute Toggle Button */}
                <div className="action-btn-item">
                  <button className="action-circle-btn" onClick={() => setIsMuted(!isMuted)}>
                    {isMuted ? <VolumeX size={22} /> : <Volume2 size={22} />}
                  </button>
                  <span>{isMuted ? 'Muted' : 'Sound'}</span>
                </div>
              </div>

              {/* Bottom Information Overlay */}
              <div className="reel-bottom-info">
                
                {/* Restaurant & Rating */}
                <div className="reel-restaurant-row">
                  <span className="restaurant-name">{reel.restaurant}</span>
                  <span className="rating-badge">
                    <Star size={12} fill="#ffa502" /> {reel.rating}
                  </span>
                </div>

                {/* Dish Title */}
                <h3 className="reel-food-title">{reel.title}</h3>

                {/* Description */}
                <p className="reel-food-desc">{reel.description}</p>

                {/* Tags */}
                <div className="reel-tags-row">
                  {reel.tags.map((t, idx) => (
                    <span key={idx} className="tag-pill">#{t}</span>
                  ))}
                </div>

                {/* Direct Add to Cart Action Footer */}
                <div className="reel-cart-action-row">
                  <div className="price-box">
                    <span className="price-label">Special Price</span>
                    <span className="price-amount">₹{reel.price}</span>
                  </div>

                  {currentQty === 0 ? (
                    <button 
                      className="reel-add-cart-btn"
                      onClick={() => addToCart(foodId)}
                    >
                      <ShoppingBag size={18} /> Add to Cart
                    </button>
                  ) : (
                    <div className="reel-qty-selector">
                      <button className="reel-qty-btn" onClick={() => removeFromCart(foodId)}>-</button>
                      <span className="reel-qty-val">{currentQty}</span>
                      <button className="reel-qty-btn" onClick={() => addToCart(foodId)}>+</button>
                    </div>
                  )}
                </div>

              </div>

            </div>
          );
        })}

      </div>
    </div>
  );
}
