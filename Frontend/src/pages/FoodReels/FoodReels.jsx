import React, { useState, useEffect, useRef, useContext } from 'react';
import './FoodReels.css';
import { reelsData } from '../../assets/frontend_assets/reelsData';
import { StoreContext } from '../../Context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Volume2, VolumeX, Heart, Share2, Star, ShoppingBag, Plus, Minus, Play, Pause, Flame, RefreshCw } from 'lucide-react';

// Live Animated Food Canvas Component (Guarantees 60FPS motion even if video stream lags)
function LiveFoodCanvas({ poster, isPlaying }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let particles = Array.from({ length: 25 }, () => ({
      x: Math.random() * canvas.width,
      y: canvas.height + Math.random() * 50,
      radius: Math.random() * 4 + 1,
      speedY: Math.random() * 1.5 + 0.5,
      speedX: (Math.random() - 0.5) * 0.8,
      alpha: Math.random() * 0.6 + 0.2
    }));

    const render = () => {
      canvas.width = canvas.clientWidth || 300;
      canvas.height = canvas.clientHeight || 500;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (isPlaying) {
        particles.forEach((p) => {
          p.y -= p.speedY;
          p.x += p.speedX;
          p.alpha -= 0.003;

          if (p.y < 0 || p.alpha <= 0) {
            p.y = canvas.height + 10;
            p.x = Math.random() * canvas.width;
            p.alpha = Math.random() * 0.6 + 0.2;
          }

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 165, 2, ${p.alpha})`;
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#ff4757';
          ctx.fill();
        });
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying]);

  return <canvas ref={canvasRef} className="live-food-canvas" />;
}

export default function FoodReels() {
  const { cartItems, addToCart, removeFromCart, getTotalCartCount, getTotalCartAmount } = useContext(StoreContext);
  const navigate = useNavigate();

  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true); // Default muted for browser autoplay policy compliance
  const [likedMap, setLikedMap] = useState({});
  const [likeCounts, setLikeCounts] = useState(() => {
    const initialCounts = {};
    reelsData.forEach(r => initialCounts[r.id] = r.likes);
    return initialCounts;
  });
  const [isPlayingMap, setIsPlayingMap] = useState({});
  const [copiedId, setCopiedId] = useState(null);
  const [videoErrorMap, setVideoErrorMap] = useState({});

  const videoRefs = useRef([]);
  const containerRef = useRef(null);

  // Safely play video with fallback
  const safePlayVideo = (index) => {
    const video = videoRefs.current[index];
    if (!video) return;

    video.muted = isMuted;
    video.playsInline = true;

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlayingMap(prev => ({ ...prev, [index]: true }));
        })
        .catch(err => {
          console.warn(`Autoplay retry for index ${index}:`, err.message);
          video.muted = true;
          video.play()
            .then(() => setIsPlayingMap(prev => ({ ...prev, [index]: true })))
            .catch(() => setIsPlayingMap(prev => ({ ...prev, [index]: false })));
        });
    }
  };

  // Initial mount auto-play for first video
  useEffect(() => {
    const timer = setTimeout(() => {
      safePlayVideo(0);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  // Intersection Observer for smooth scrolling auto-play
  useEffect(() => {
    const options = {
      root: containerRef.current,
      threshold: 0.25 // Responsive threshold trigger
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const index = Number(entry.target.dataset.index);
        const video = videoRefs.current[index];

        if (entry.isIntersecting) {
          setActiveIndex(index);
          if (video) {
            safePlayVideo(index);
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
  }, [isMuted]);

  // Sync mute state
  useEffect(() => {
    videoRefs.current.forEach(v => {
      if (v) v.muted = isMuted;
    });
  }, [isMuted]);

  // Toggle Video Play/Pause
  const togglePlay = (index) => {
    const video = videoRefs.current[index];
    if (!video) return;

    if (video.paused) {
      safePlayVideo(index);
    } else {
      video.pause();
      setIsPlayingMap(prev => ({ ...prev, [index]: false }));
    }
  };

  // Toggle Mute
  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    const currentVideo = videoRefs.current[activeIndex];
    if (currentVideo) {
      currentVideo.muted = nextMute;
      if (currentVideo.paused) {
        currentVideo.play().catch(() => {});
      }
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

  // Backup video sources if main URL fails
  const getBackupUrl = (index) => {
    const backupList = [
      "https://vjs.zencdn.net/v/oceans.mp4",
      "https://media.w3.org/2010/05/sintel/trailer_hd.mp4",
      "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
      "https://archive.org/download/BigBuckBunny_124/Content/big_buck_bunny_720p_surround.mp4",
      "https://res.cloudinary.com/demo/video/upload/elephants.mp4"
    ];
    return backupList[index % backupList.length];
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

          <button className="reel-mute-top-btn" onClick={toggleMute} title={isMuted ? "Unmute Audio" : "Mute Audio"}>
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </div>

        {/* Floating Cart Indicator Bar */}
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
          const videoSrc = videoErrorMap[index] ? getBackupUrl(index) : reel.videoUrl;

          return (
            <div key={reel.id} className="reel-card" data-index={index} onClick={() => togglePlay(index)}>
              
              {/* HTML5 Video Element */}
              <video
                ref={el => videoRefs.current[index] = el}
                src={videoSrc}
                poster={reel.poster}
                className={`reel-video ${isPlaying ? 'playing-video-zoom' : ''}`}
                autoPlay
                loop
                muted={isMuted}
                playsInline
                onError={() => {
                  console.warn(`Video load notice for reel ${reel.id}, using fallback stream`);
                  setVideoErrorMap(prev => ({ ...prev, [index]: true }));
                }}
              />

              {/* Dynamic Live Food Canvas Motion Overlay */}
              <LiveFoodCanvas poster={reel.poster} isPlaying={isPlaying} />

              {/* Mute / Tap to Play Indicator Banner */}
              {isMuted && isPlaying && (
                <div 
                  onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                  style={{
                    position: 'absolute',
                    top: '70px',
                    right: '20px',
                    background: 'rgba(0,0,0,0.75)',
                    color: 'white',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    zIndex: 25,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    backdropFilter: 'blur(6px)',
                    border: '1px solid rgba(255,255,255,0.25)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                  }}
                >
                  <VolumeX size={14} /> Tap for Sound 🔊
                </div>
              )}

              {/* Play/Pause Overlay Indicator */}
              {!isPlaying && (
                <div className="video-pause-indicator">
                  <Play size={40} fill="#fff" color="#fff" />
                </div>
              )}

              {/* Right Action Sidebar */}
              <div className="reel-actions-sidebar" onClick={(e) => e.stopPropagation()}>
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
                  <button className="action-circle-btn" onClick={toggleMute}>
                    {isMuted ? <VolumeX size={22} /> : <Volume2 size={22} />}
                  </button>
                  <span>{isMuted ? 'Muted' : 'Sound'}</span>
                </div>
              </div>

              {/* Bottom Information Overlay */}
              <div className="reel-bottom-info" onClick={(e) => e.stopPropagation()}>
                
                {/* Restaurant & Rating */}
                <div className="reel-restaurant-row">
                  <span className="restaurant-name">{reel.restaurant}</span>
                  <span className="rating-badge">
                    <Star size={12} fill="#ffa502" color="#ffa502" /> {reel.rating}
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
