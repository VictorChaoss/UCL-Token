(() => {
  const canvas = document.getElementById('stadium-canvas');
  const ctx = canvas.getContext('2d');
  const introScreen = document.getElementById('intro-screen');
  const mainSite = document.getElementById('main-site');
  const enterBtn = document.getElementById('enter-btn');
  const replayBtn = document.getElementById('replay-intro-btn');
  const logoStage = document.getElementById('logo-stage');
  const logoSpinner = document.getElementById('logo-spinner');
  const hudTelemetry = document.getElementById('hud-telemetry');
  const hudStatusText = document.getElementById('hud-status-text');
  const spinChips = document.querySelectorAll('.broadcast-chip');

  // Official UEFA Champions League Anthem Audio Element
  const anthemAudio = document.getElementById('ucl-anthem-audio');
  const introAnthemBtn = document.getElementById('intro-anthem-btn');
  const anthemPlayBtn = document.getElementById('anthem-play-btn');
  const anthemStatusLabel = document.getElementById('anthem-status-label');
  const anthemPlayGlyph = document.getElementById('anthem-play-glyph');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  // =========================================================
  // 1. INTRO 3D STARBALL & STADIUM FLOODLIGHT CANVAS
  // =========================================================
  const PARTICLE_COUNT = 210;
  const particles = [];
  let baseSpeed = 1.35;
  let targetSpeed = 1.35;
  let isEntering = false;
  let mouseX = 0;
  let mouseY = 0;

  const UCL_COLORS = ['#ffffff', '#dbeafe', '#60b5ff', '#1e6bff', '#f5c451'];

  function initParticles() {
    particles.length = 0;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const isStarShape = i % 4 === 0;
      particles.push({
        x: (Math.random() - 0.5) * width * 2.1,
        y: (Math.random() - 0.5) * height * 2.1,
        z: Math.random() * width,
        pz: 0,
        isStar: isStarShape,
        angle: Math.random() * Math.PI * 2,
        spinSpeed: (Math.random() - 0.5) * 0.035,
        color:
          Math.random() > 0.86
            ? UCL_COLORS[4]
            : UCL_COLORS[Math.floor(Math.random() * 4)],
        size: isStarShape ? Math.random() * 3.4 + 2.2 : Math.random() * 1.9 + 0.6,
      });
      particles[i].pz = particles[i].z;
    }
  }

  initParticles();

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  window.addEventListener('mousemove', (e) => {
    const normX = (e.clientX / width - 0.5) * 2;
    const normY = (e.clientY / height - 0.5) * 2;
    mouseX = normX * 32;
    mouseY = normY * 32;

    if (!isEntering && logoStage) {
      const tiltX = -normY * 10;
      const tiltY = normX * 10;
      logoStage.style.transform = `rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg)`;
    }
  });

  function drawFivePointStar(cx, cy, outerRadius, rotation, color, alpha) {
    const innerRadius = outerRadius * 0.42;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const outerAngle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
      const innerAngle = outerAngle + Math.PI / 5;
      if (i === 0) {
        ctx.moveTo(Math.cos(outerAngle) * outerRadius, Math.sin(outerAngle) * outerRadius);
      } else {
        ctx.lineTo(Math.cos(outerAngle) * outerRadius, Math.sin(outerAngle) * outerRadius);
      }
      ctx.lineTo(Math.cos(innerAngle) * innerRadius, Math.sin(innerAngle) * innerRadius);
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha;
    ctx.shadowColor = color;
    ctx.shadowBlur = outerRadius * 1.8;
    ctx.fill();
    ctx.restore();
  }

  function animateStadium() {
    baseSpeed += (targetSpeed - baseSpeed) * 0.08;
    ctx.clearRect(0, 0, width, height);

    const cx = width / 2 + mouseX;
    const cy = height / 2 + mouseY;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.pz = p.z;
      p.z -= baseSpeed * 3.8;
      p.angle += p.spinSpeed;

      if (p.z <= 1) {
        p.x = (Math.random() - 0.5) * width * 2.1;
        p.y = (Math.random() - 0.5) * height * 2.1;
        p.z = width;
        p.pz = p.z;
      }

      const sx = (p.x / p.z) * (width * 0.6) + cx;
      const sy = (p.y / p.z) * (height * 0.6) + cy;
      const px = (p.x / p.pz) * (width * 0.6) + cx;
      const py = (p.y / p.pz) * (height * 0.6) + cy;

      const depthRatio = 1 - p.z / width;
      const alpha = Math.min(1, depthRatio * 1.25);
      const radius = Math.max(0.4, depthRatio * p.size * 2.1);

      if (isEntering || baseSpeed > 4.5) {
        ctx.beginPath();
        ctx.strokeStyle = p.color;
        ctx.globalAlpha = alpha * 0.85;
        ctx.lineWidth = Math.max(0.8, radius * 0.9);
        ctx.moveTo(px, py);
        ctx.lineTo(sx, sy);
        ctx.stroke();
      }

      if (p.isStar && !isEntering) {
        drawFivePointStar(sx, sy, radius, p.angle, p.color, alpha);
      } else if (!isEntering) {
        ctx.beginPath();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.arc(sx, sy, radius * 0.65, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.globalAlpha = 1;
    requestAnimationFrame(animateStadium);
  }

  animateStadium();

  // =========================================================
  // 2. OFFICIAL UEFA CHAMPIONS LEAGUE ANTHEM AUDIO CONTROLLER
  // =========================================================
  function updateAnthemButtonsUI() {
    const playing = anthemAudio && !anthemAudio.paused;
    if (introAnthemBtn) {
      introAnthemBtn.textContent = playing
        ? '🔊 UCL ANTHEM PLAYING (PAUSE)'
        : '🎵 PLAY UCL ANTHEM';
    }
    if (anthemStatusLabel) {
      anthemStatusLabel.textContent = playing
        ? 'OFFICIAL ANTHEM PLAYING ●'
        : 'PLAY UCL ANTHEM';
    }
    if (anthemPlayGlyph) {
      anthemPlayGlyph.textContent = playing ? '❚❚' : '▶';
    }
  }

  async function startAnthem() {
    if (!anthemAudio) return;
    try {
      anthemAudio.volume = 0.85;
      await anthemAudio.play();
    } catch {
      // Browser autoplay policy fallback
    }
    updateAnthemButtonsUI();
  }

  function toggleAnthem() {
    if (!anthemAudio) return;
    if (anthemAudio.paused) {
      startAnthem();
    } else {
      anthemAudio.pause();
      updateAnthemButtonsUI();
    }
  }

  if (introAnthemBtn) {
    introAnthemBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleAnthem();
    });
  }

  if (anthemPlayBtn) {
    anthemPlayBtn.addEventListener('click', toggleAnthem);
  }

  if (anthemAudio) {
    anthemAudio.addEventListener('play', updateAnthemButtonsUI);
    anthemAudio.addEventListener('pause', updateAnthemButtonsUI);
  }

  // Live Matchday Clock in Intro
  function updateMatchdayClock() {
    if (!hudTelemetry) return;
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    hudTelemetry.textContent = `${hh}:${mm}:${ss} // KICK-OFF READY`;
  }
  setInterval(updateMatchdayClock, 500);
  updateMatchdayClock();

  spinChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      spinChips.forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');

      const mode = chip.dataset.spin;
      logoSpinner.classList.remove('mode-orbit', 'mode-pulse');
      if (mode === 'orbit') {
        logoSpinner.classList.add('mode-orbit');
        hudStatusText.textContent = 'STARBALL ORBITAL CAMERA : LIVE';
      } else if (mode === 'pulse') {
        logoSpinner.classList.add('mode-pulse');
        hudStatusText.textContent = 'CENTRE CIRCLE TROPHY CAM : LOCKED';
      } else {
        hudStatusText.textContent = 'THE ULTIMATE STAGE : FLOODLIGHTS ON';
      }
    });
  });

  enterBtn.addEventListener('mouseenter', () => {
    if (!isEntering) {
      targetSpeed = 5.2;
      hudStatusText.textContent = 'PLAYERS IN THE TUNNEL // READY FOR KICK-OFF';
    }
  });

  enterBtn.addEventListener('mouseleave', () => {
    if (!isEntering) {
      targetSpeed = 1.35;
      hudStatusText.textContent = 'THE ULTIMATE STAGE : FLOODLIGHTS ON';
    }
  });

  function triggerEnterStadium() {
    if (isEntering) return;
    isEntering = true;
    targetSpeed = 26;

    // Play the official UEFA Champions League Anthem on entering stadium
    startAnthem();

    hudStatusText.textContent = 'KICK-OFF // WELCOME TO EUROPE’S GREATEST STAGE';
    logoSpinner.style.animationDuration = '1.15s';

    setTimeout(() => {
      introScreen.classList.add('warp-exit');
      mainSite.classList.remove('hidden');
      mainSite.setAttribute('aria-hidden', 'false');
    }, 560);
  }

  enterBtn.addEventListener('click', triggerEnterStadium);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !isEntering && !introScreen.classList.contains('warp-exit')) {
      triggerEnterStadium();
    }
  });

  if (replayBtn) {
    replayBtn.addEventListener('click', () => {
      isEntering = false;
      targetSpeed = 1.35;
      logoSpinner.style.animationDuration = '';
      hudStatusText.textContent = 'THE ULTIMATE STAGE : FLOODLIGHTS ON';
      mainSite.classList.add('hidden');
      mainSite.setAttribute('aria-hidden', 'true');
      introScreen.classList.remove('warp-exit');
    });
  }

  // =========================================================
  // 3. 36-CLUB CHAMPIONS LEAGUE STANDINGS & LIVE DATA STORE
  // =========================================================
  const clubsData = [
    { code: 'LIV', name: 'Liverpool', ticker: '$LIV', country: 'ENG', bg: '#C8102E', fg: '#FFFFFF', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/364.png', pl: 8, w: 7, d: 0, l: 1, gf: 17, ga: 5, pts: 21, form: ['W','W','W','W','L'] },
    { code: 'BAR', name: 'Barcelona', ticker: '$BARCA', country: 'ESP', bg: '#A50044', fg: '#EDBB00', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/83.png', pl: 8, w: 6, d: 1, l: 1, gf: 28, ga: 13, pts: 19, form: ['W','W','W','W','D'] },
    { code: 'ARS', name: 'Arsenal', ticker: '$ARS', country: 'ENG', bg: '#EF0107', fg: '#FFFFFF', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/359.png', pl: 8, w: 6, d: 1, l: 1, gf: 16, ga: 3, pts: 19, form: ['D','W','W','W','W'] },
    { code: 'INT', name: 'Inter Milan', ticker: '$INTER', country: 'ITA', bg: '#010E80', fg: '#FFFFFF', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/110.png', pl: 8, w: 6, d: 1, l: 1, gf: 11, ga: 1, pts: 19, form: ['W','W','L','W','W'] },
    { code: 'ATM', name: 'Atlético Madrid', ticker: '$ATLETI', country: 'ESP', bg: '#CB3524', fg: '#FFFFFF', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/1068.png', pl: 8, w: 6, d: 0, l: 2, gf: 20, ga: 12, pts: 18, form: ['W','W','W','W','W'] },
    { code: 'LEV', name: 'Bayer Leverkusen', ticker: '$B04', country: 'GER', bg: '#E32221', fg: '#FFFFFF', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/131.png', pl: 8, w: 5, d: 1, l: 2, gf: 15, ga: 7, pts: 16, form: ['L','W','W','L','W'] },
    { code: 'LIL', name: 'Lille OSC', ticker: '$LILLE', country: 'FRA', bg: '#E01E13', fg: '#FFFFFF', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/166.png', pl: 8, w: 5, d: 1, l: 2, gf: 17, ga: 10, pts: 16, form: ['D','W','W','L','W'] },
    { code: 'AVL', name: 'Aston Villa', ticker: '$VILLA', country: 'ENG', bg: '#670E36', fg: '#95BFE5', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/362.png', pl: 8, w: 5, d: 1, l: 2, gf: 13, ga: 6, pts: 16, form: ['L','D','W','L','W'] },
    { code: 'ATA', name: 'Atalanta', ticker: '$ATA', country: 'ITA', bg: '#1E71B8', fg: '#FFFFFF', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/105.png', pl: 8, w: 4, d: 3, l: 1, gf: 20, ga: 6, pts: 15, form: ['W','W','L','W','D'] },
    { code: 'BVB', name: 'Borussia Dortmund', ticker: '$BVB', country: 'GER', bg: '#FDE100', fg: '#000000', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/124.png', pl: 8, w: 5, d: 0, l: 3, gf: 22, ga: 12, pts: 15, form: ['W','W','L','L','W'] },
    { code: 'RMA', name: 'Real Madrid', ticker: '$REAL', country: 'ESP', bg: '#FEBE10', fg: '#001C58', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/86.png', pl: 8, w: 5, d: 0, l: 3, gf: 20, ga: 12, pts: 15, form: ['L','L','W','W','W'] },
    { code: 'BAY', name: 'Bayern Munich', ticker: '$BAYERN', country: 'GER', bg: '#DC052D', fg: '#FFFFFF', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/132.png', pl: 8, w: 5, d: 0, l: 3, gf: 20, ga: 12, pts: 15, form: ['W','W','W','L','W'] },
    { code: 'MIL', name: 'AC Milan', ticker: '$MILAN', country: 'ITA', bg: '#FB090B', fg: '#000000', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/103.png', pl: 8, w: 5, d: 0, l: 3, gf: 14, ga: 11, pts: 15, form: ['W','W','W','W','L'] },
    { code: 'PSV', name: 'PSV Eindhoven', ticker: '$PSV', country: 'NED', bg: '#ED1C24', fg: '#FFFFFF', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/148.png', pl: 8, w: 4, d: 2, l: 2, gf: 16, ga: 12, pts: 14, form: ['W','W','L','W','W'] },
    { code: 'PSG', name: 'Paris Saint-Germain', ticker: '$PSG', country: 'FRA', bg: '#004170', fg: '#DA291C', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/160.png', pl: 8, w: 4, d: 1, l: 3, gf: 14, ga: 9, pts: 13, form: ['L','L','W','W','W'] },
    { code: 'BEN', name: 'Benfica', ticker: '$SLB', country: 'POR', bg: '#E83030', fg: '#FFFFFF', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/1929.png', pl: 8, w: 4, d: 1, l: 3, gf: 16, ga: 12, pts: 13, form: ['L','W','D','L','W'] },
    { code: 'MON', name: 'AS Monaco', ticker: '$MONACO', country: 'FRA', bg: '#E51B24', fg: '#FFFFFF', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/174.png', pl: 8, w: 4, d: 1, l: 3, gf: 13, ga: 13, pts: 13, form: ['W','L','L','W','L'] },
    { code: 'BRE', name: 'Stade Brestois', ticker: '$BREST', country: 'FRA', bg: '#D71920', fg: '#FFFFFF', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/6997.png', pl: 8, w: 4, d: 1, l: 3, gf: 10, ga: 11, pts: 13, form: ['W','L','W','L','L'] },
    { code: 'FEY', name: 'Feyenoord', ticker: '$FEY', country: 'NED', bg: '#EE2523', fg: '#FFFFFF', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/142.png', pl: 8, w: 4, d: 1, l: 3, gf: 18, ga: 21, pts: 13, form: ['L','D','W','W','L'] },
    { code: 'JUV', name: 'Juventus', ticker: '$JUVE', country: 'ITA', bg: '#111111', fg: '#FFFFFF', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/111.png', pl: 8, w: 3, d: 3, l: 2, gf: 9, ga: 7, pts: 12, form: ['D','D','W','D','L'] },
    { code: 'CEL', name: 'Celtic', ticker: '$CELTIC', country: 'SCO', bg: '#018749', fg: '#FFFFFF', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/256.png', pl: 8, w: 3, d: 3, l: 2, gf: 13, ga: 14, pts: 12, form: ['W','D','D','W','L'] },
    { code: 'MCI', name: 'Manchester City', ticker: '$MCITY', country: 'ENG', bg: '#6CABDD', fg: '#001838', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/382.png', pl: 8, w: 3, d: 2, l: 3, gf: 18, ga: 14, pts: 11, form: ['L','D','L','L','W'] },
    { code: 'SCP', name: 'Sporting CP', ticker: '$SCP', country: 'POR', bg: '#008057', fg: '#FFFFFF', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/2250.png', pl: 8, w: 3, d: 2, l: 3, gf: 13, ga: 12, pts: 11, form: ['W','L','L','L','D'] },
    { code: 'BRU', name: 'Club Brugge', ticker: '$BRUGGE', country: 'BEL', bg: '#0056A4', fg: '#FFFFFF', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/570.png', pl: 8, w: 3, d: 2, l: 3, gf: 7, ga: 11, pts: 11, form: ['W','D','W','D','L'] },
    // ---- CUTOFF: RANKS 25–36 ELIMINATED AFTER 8 MATCHES (NO TOKEN DEPLOYED) ----
    { code: 'DZG', name: 'Dinamo Zagreb', ticker: '$DZG', country: 'CRO', bg: '#004792', fg: '#FFFFFF', logo: '', pl: 8, w: 3, d: 2, l: 3, gf: 12, ga: 19, pts: 11, form: ['W','L','D','L','W'] },
    { code: 'STU', name: 'VfB Stuttgart', ticker: '$VFB', country: 'GER', bg: '#E32219', fg: '#FFFFFF', logo: '', pl: 8, w: 3, d: 1, l: 4, gf: 13, ga: 17, pts: 10, form: ['L','L','W','W','L'] },
    { code: 'SHK', name: 'Shakhtar Donetsk', ticker: '$SHK', country: 'UKR', bg: '#F36C21', fg: '#000000', logo: '', pl: 8, w: 2, d: 1, l: 5, gf: 8, ga: 16, pts: 7, form: ['W','L','L','W','L'] },
    { code: 'BOL', name: 'Bologna', ticker: '$BOL', country: 'ITA', bg: '#1A2F48', fg: '#A21C26', logo: '', pl: 8, w: 1, d: 3, l: 4, gf: 4, ga: 9, pts: 6, form: ['L','L','D','W','D'] },
    { code: 'CZV', name: 'Crvena Zvezda', ticker: '$CZV', country: 'SRB', bg: '#D62027', fg: '#FFFFFF', logo: '', pl: 8, w: 2, d: 0, l: 6, gf: 13, ga: 22, pts: 6, form: ['L','W','L','L','W'] },
    { code: 'STU2', name: 'Sturm Graz', ticker: '$STURM', country: 'AUT', bg: '#222222', fg: '#FFFFFF', logo: '', pl: 8, w: 2, d: 0, l: 6, gf: 5, ga: 14, pts: 6, form: ['L','W','L','L','W'] },
    { code: 'SPA', name: 'Sparta Prague', ticker: '$SPARTA', country: 'CZE', bg: '#A6192E', fg: '#FFFFFF', logo: '', pl: 8, w: 1, d: 1, l: 6, gf: 7, ga: 21, pts: 4, form: ['L','L','L','L','L'] },
    { code: 'RBL', name: 'RB Leipzig', ticker: '$RBL', country: 'GER', bg: '#DD0741', fg: '#FFFFFF', logo: '', pl: 8, w: 1, d: 0, l: 7, gf: 8, ga: 15, pts: 3, form: ['L','L','L','W','L'] },
    { code: 'GIR', name: 'Girona FC', ticker: '$GIRONA', country: 'ESP', bg: '#CE1126', fg: '#FFFFFF', logo: '', pl: 8, w: 1, d: 0, l: 7, gf: 5, ga: 13, pts: 3, form: ['L','L','L','L','L'] },
    { code: 'SAL', name: 'RB Salzburg', ticker: '$RBS', country: 'AUT', bg: '#C8102E', fg: '#FFFFFF', logo: '', pl: 8, w: 1, d: 0, l: 7, gf: 5, ga: 27, pts: 3, form: ['W','L','L','L','L'] },
    { code: 'SLO', name: 'Slovan Bratislava', ticker: '$SLO', country: 'SVK', bg: '#0096D6', fg: '#FFFFFF', logo: '', pl: 8, w: 0, d: 0, l: 8, gf: 7, ga: 27, pts: 0, form: ['L','L','L','L','L'] },
    { code: 'YBO', name: 'Young Boys', ticker: '$YB', country: 'SUI', bg: '#FFD200', fg: '#000000', logo: '', pl: 8, w: 0, d: 0, l: 8, gf: 3, ga: 24, pts: 0, form: ['L','L','L','L','L'] },
  ];

  const matchesData = [
    { id: 'm1', stage: 'UCL LEAGUE PHASE • LIVE', status: 'live', minute: "84'", home: 'RMA', away: 'MCI', homeScore: 3, awayScore: 2, venue: 'Santiago Bernabéu', scorers: '' },
    { id: 'm2', stage: 'UCL LEAGUE PHASE • LIVE', status: 'live', minute: "78'", home: 'BAR', away: 'ATA', homeScore: 2, awayScore: 2, venue: 'Estadi Olímpic', scorers: '' },
    { id: 'm3', stage: 'UCL LEAGUE PHASE • LIVE', status: 'live', minute: "89'", home: 'LIV', away: 'PSV', homeScore: 2, awayScore: 1, venue: 'Anfield', scorers: '' },
    { id: 'm4', stage: 'UCL LEAGUE PHASE • LIVE', status: 'live', minute: "67'", home: 'ARS', away: 'GIR', homeScore: 3, awayScore: 0, venue: 'Emirates Stadium', scorers: '' },
    { id: 'm5', stage: 'UCL LEAGUE PHASE • FT', status: 'ft', minute: 'FT', home: 'INT', away: 'MON', homeScore: 3, awayScore: 0, venue: 'San Siro', scorers: '' },
    { id: 'm6', stage: 'UCL LEAGUE PHASE • FT', status: 'ft', minute: 'FT', home: 'BAY', away: 'SLO', homeScore: 3, awayScore: 1, venue: 'Allianz Arena', scorers: '' },
    { id: 'm7', stage: 'UCL LEAGUE PHASE • FT', status: 'ft', minute: 'FT', home: 'BVB', away: 'SHK', homeScore: 3, awayScore: 1, venue: 'Signal Iduna Park', scorers: '' },
    { id: 'm8', stage: 'UCL LEAGUE PHASE • FT', status: 'ft', minute: 'FT', home: 'STU', away: 'PSG', homeScore: 1, awayScore: 4, venue: 'MHPArena', scorers: '' },
    { id: 'm9', stage: 'UCL LEAGUE PHASE • FT', status: 'ft', minute: 'FT', home: 'JUV', away: 'BEN', homeScore: 0, awayScore: 2, venue: 'Allianz Stadium', scorers: '' },
    { id: 'm10', stage: 'UCL LEAGUE PHASE • FT', status: 'ft', minute: 'FT', home: 'AVL', away: 'CEL', homeScore: 4, awayScore: 2, venue: 'Villa Park', scorers: '' },
    { id: 'm11', stage: 'UPCOMING UCL CLASH', status: 'upcoming', minute: '21:00 CET', home: 'PSG', away: 'MON', homeScore: '-', awayScore: '-', venue: 'Parc des Princes', scorers: '' },
    { id: 'm12', stage: 'UPCOMING UCL CLASH', status: 'upcoming', minute: '21:00 CET', home: 'JUV', away: 'PSV', homeScore: '-', awayScore: '-', venue: 'Allianz Stadium', scorers: '' },
  ];

  const goldenBootData = [
    { rank: 1, player: 'Serhou Guirassy', club: 'BVB', goals: 10, assists: 3 },
    { rank: 2, player: 'Robert Lewandowski', club: 'BAR', goals: 9, assists: 1 },
    { rank: 3, player: 'Raphinha', club: 'BAR', goals: 8, assists: 4 },
    { rank: 4, player: 'Vinícius Júnior', club: 'RMA', goals: 7, assists: 2 },
    { rank: 5, player: 'Erling Haaland', club: 'MCI', goals: 7, assists: 0 },
    { rank: 6, player: 'Harry Kane', club: 'BAY', goals: 7, assists: 1 },
    { rank: 7, player: 'Julian Alvarez', club: 'ATM', goals: 6, assists: 1 },
    { rank: 8, player: 'Viktor Gyökeres', club: 'SCP', goals: 6, assists: 1 },
  ];

  function getClubByCode(code) {
    return (
      clubsData.find((c) => c.code === code) || {
        code,
        name: code,
        ticker: `$${code}`,
        bg: '#1e6bff',
        fg: '#ffffff',
        logo: '',
      }
    );
  }

  function renderClubCrestHtml(club, isJumbo = false) {
    if (club.logo) {
      return `<img src="${club.logo}" alt="${club.name}" class="${isJumbo ? 'jumbo-logo-img' : 'club-logo-img'}" loading="lazy" />`;
    }
    return `
      <div class="${isJumbo ? 'jumbo-crest-badge' : 'mini-club-crest'}" style="--club-bg: ${club.bg || '#1e6bff'}; --club-fg: ${club.fg || '#ffffff'};">
        ${club.code.slice(0, 3)}
      </div>
    `;
  }

  function sortClubs() {
    clubsData.sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      const gdA = a.gf - a.ga;
      const gdB = b.gf - b.ga;
      if (gdB !== gdA) return gdB - gdA;
      return b.gf - a.gf;
    });
  }

  // =========================================================
  // 4. RENDER LIVE MATCHES, 36-TEAM TABLE, SPOTLIGHT & BRACKET
  // =========================================================
  let currentMatchFilter = 'all';
  let currentClubFilter = 'all';

  function renderMatchCard(m) {
    const homeClub = getClubByCode(m.home);
    const awayClub = getClubByCode(m.away);
    const statusClass = m.status === 'live' ? 'live' : m.status === 'ft' ? 'ft' : 'upcoming';
    const cardLiveClass = m.status === 'live' ? 'is-live' : '';

    return `
      <article class="match-card ${cardLiveClass}">
        <div class="match-card-top">
          <span>${m.stage}</span>
          <span class="match-status-pill ${statusClass}">
            ${m.status === 'live' ? `● LIVE ${m.minute}` : m.minute}
          </span>
        </div>

        <div class="match-teams-rows">
          <div class="match-team-row">
            <div class="match-team-left">
              ${renderClubCrestHtml(homeClub, false)}
              <div>
                <div class="match-team-name">${homeClub.name}</div>
                <div class="match-team-ticker">${homeClub.ticker}</div>
              </div>
            </div>
            <div class="match-team-score">${m.homeScore}</div>
          </div>

          <div class="match-team-row">
            <div class="match-team-left">
              ${renderClubCrestHtml(awayClub, false)}
              <div>
                <div class="match-team-name">${awayClub.name}</div>
                <div class="match-team-ticker">${awayClub.ticker}</div>
              </div>
            </div>
            <div class="match-team-score">${m.awayScore}</div>
          </div>
        </div>

        <div class="match-card-foot">
          <span>📍 ${m.venue}</span>
          <span>${m.scorers ? `⚽ ${m.scorers}` : 'LIVE AUTO-SYNC'}</span>
        </div>
      </article>
    `;
  }

  function renderMatches() {
    const homeGrid = document.getElementById('home-matches-grid');
    const tourneyGrid = document.getElementById('tournament-matches-grid');

    const filtered =
      currentMatchFilter === 'all'
        ? matchesData
        : matchesData.filter((m) => m.status === currentMatchFilter);

    if (homeGrid) {
      homeGrid.innerHTML = filtered.map(renderMatchCard).join('');
    }
    if (tourneyGrid) {
      tourneyGrid.innerHTML = matchesData.map(renderMatchCard).join('');
    }

    // Update Featured Jumbotron Match with the top live or latest match
    const featured = matchesData.find((m) => m.status === 'live') || matchesData[0];
    const featuredBox = document.getElementById('featured-match-box');
    if (featured && featuredBox) {
      const hClub = getClubByCode(featured.home);
      const aClub = getClubByCode(featured.away);
      const statusLabel =
        featured.status === 'live'
          ? `● LIVE • ${featured.minute}`
          : featured.status === 'ft'
          ? `FULL TIME • ${featured.venue}`
          : `UPCOMING • ${featured.minute}`;

      featuredBox.innerHTML = `
        <div class="jumbo-team home">
          ${renderClubCrestHtml(hClub, true)}
          <div class="jumbo-team-info">
            <span class="jumbo-club-name">${hClub.name}</span>
            <span class="jumbo-token-tag">${hClub.ticker} • UCL CONTENDER</span>
          </div>
        </div>

        <div class="jumbo-score-center">
          <div class="jumbo-score-pill">
            <span id="jumbo-home-score">${featured.homeScore}</span>
            <span class="score-divider">:</span>
            <span id="jumbo-away-score">${featured.awayScore}</span>
          </div>
          <span class="jumbo-match-clock" id="jumbo-match-status">${statusLabel}</span>
        </div>

        <div class="jumbo-team away">
          <div class="jumbo-team-info right">
            <span class="jumbo-club-name">${aClub.name}</span>
            <span class="jumbo-token-tag">${aClub.ticker} • UCL CONTENDER</span>
          </div>
          ${renderClubCrestHtml(aClub, true)}
        </div>
      `;
    }
  }

  function renderStandingsTable() {
    sortClubs();
    const tbody = document.getElementById('ucl-standings-tbody');
    if (!tbody) return;

    tbody.innerHTML = clubsData
      .slice(0, 36)
      .map((club, index) => {
        const pos = index + 1;
        const gd = club.gf - club.ga;
        const gdStr = gd > 0 ? `+${gd}` : `${gd}`;

        let zoneClass = 'row-elim';
        let statusBadge = `<span class="status-tag elim">✕ ELIMINATED (NO TOKEN)</span>`;
        if (pos <= 8) {
          zoneClass = 'row-top8';
          statusBadge = `<span class="status-tag top8">★ R16 SEED // TOKEN DEPLOYS</span>`;
        } else if (pos <= 24) {
          zoneClass = 'row-playoff';
          statusBadge = `<span class="status-tag playoff">● PLAY-OFF // TOKEN DEPLOYS</span>`;
        }

        const cutoffClass =
          pos === 8 ? 'cutoff-row-8' : pos === 24 ? 'cutoff-row-24' : '';

        const formHtml = (club.form || ['W', 'D', 'W', 'W', 'D'])
          .map((f) => `<span class="form-dot ${f}">${f}</span>`)
          .join('');

        return `
          <tr class="${zoneClass} ${cutoffClass}">
            <td class="col-pos">${pos}</td>
            <td>
              <div class="club-cell">
                ${renderClubCrestHtml(club, false)}
                <span>${club.name}</span>
              </div>
            </td>
            <td><span class="ticker-badge-cell">${club.ticker}</span></td>
            <td class="col-stat">${club.pl}/8</td>
            <td class="col-stat">${club.w}</td>
            <td class="col-stat">${club.d}</td>
            <td class="col-stat">${club.l}</td>
            <td class="col-stat hide-sm">${club.gf}:${club.ga}</td>
            <td class="col-stat">${gdStr}</td>
            <td class="col-pts">${club.pts}</td>
            <td class="hide-md">
              <div class="form-pills">${formHtml}</div>
            </td>
            <td>${statusBadge}</td>
          </tr>
        `;
      })
      .join('');
  }

  function renderSpotlightAndBoot() {
    sortClubs();
    const spotlightStack = document.getElementById('club-spotlight-stack');
    if (spotlightStack && clubsData.length >= 24) {
      const topSeed = clubsData[0];
      const bubbleSeed = clubsData[23];

      spotlightStack.innerHTML = `
        <div class="spotlight-poster-card" style="background: linear-gradient(135deg, ${topSeed.bg || '#1e6bff'}dd 0%, #050f2e 90%);">
          <div class="spotlight-top-row">
            <div>
              <span class="spotlight-tag">▲ #1 OVERALL SEED // FIRST TOKEN DEPLOYED</span>
              <div class="spotlight-club-title">${topSeed.name} (${topSeed.ticker})</div>
            </div>
            ${renderClubCrestHtml(topSeed, true)}
          </div>
          <div class="spotlight-bottom-stats">
            <div>
              <div class="sp-stat-k">RANK</div>
              <div class="sp-stat-v">#1 / 36</div>
            </div>
            <div>
              <div class="sp-stat-k">MATCHES</div>
              <div class="sp-stat-v">${topSeed.pl} / 8</div>
            </div>
            <div>
              <div class="sp-stat-k">POINTS</div>
              <div class="sp-stat-v">${topSeed.pts} PTS</div>
            </div>
            <div>
              <div class="sp-stat-k">PUMP.FUN</div>
              <div class="sp-stat-v" style="color: #6ee7b7;">DEPLOYING ✓</div>
            </div>
          </div>
        </div>

        <div class="spotlight-poster-card" style="background: linear-gradient(135deg, ${bubbleSeed.bg || '#0e2970'}cc 0%, #050f2e 90%);">
          <div class="spotlight-top-row">
            <div>
              <span class="spotlight-tag">⚠ #24 SURVIVAL CUTOFF // FINAL TOKEN SLOT</span>
              <div class="spotlight-club-title">${bubbleSeed.name} (${bubbleSeed.ticker})</div>
            </div>
            ${renderClubCrestHtml(bubbleSeed, true)}
          </div>
          <div class="spotlight-bottom-stats">
            <div>
              <div class="sp-stat-k">RANK</div>
              <div class="sp-stat-v">#24 / 36</div>
            </div>
            <div>
              <div class="sp-stat-k">MATCHES</div>
              <div class="sp-stat-v">${bubbleSeed.pl} / 8</div>
            </div>
            <div>
              <div class="sp-stat-k">POINTS</div>
              <div class="sp-stat-v">${bubbleSeed.pts} PTS</div>
            </div>
            <div>
              <div class="sp-stat-k">STATUS</div>
              <div class="sp-stat-v" style="color: #f5c451;">CUTOFF LINE</div>
            </div>
          </div>
        </div>
      `;
    }

    const bootBoard = document.getElementById('golden-boot-board');
    if (bootBoard) {
      const headerHtml = `
        <div class="boot-row header">
          <span>#</span>
          <span>PLAYER</span>
          <span style="text-align:right;">GOALS ▼</span>
          <span style="text-align:right;">ASSISTS</span>
        </div>
      `;
      const rowsHtml = goldenBootData
        .map((p) => {
          const club = getClubByCode(p.club);
          return `
            <div class="boot-row">
              <span class="boot-rank">${p.rank}</span>
              <div class="boot-player-info">
                ${renderClubCrestHtml(club, false)}
                <span class="boot-player-name">${p.player}</span>
                <span class="boot-player-club">${club.ticker}</span>
              </div>
              <span class="boot-goals">${p.goals}</span>
              <span class="boot-assists">${p.assists}</span>
            </div>
          `;
        })
        .join('');
      bootBoard.innerHTML = headerHtml + rowsHtml;
    }
  }

  function renderClubsDirectory() {
    sortClubs();
    const grid = document.getElementById('clubs-cards-grid');
    if (!grid) return;

    const list = clubsData
      .slice(0, 36)
      .map((c, idx) => ({ ...c, rank: idx + 1 }))
      .filter((c) => {
        if (currentClubFilter === 'deploying') return c.rank <= 24;
        if (currentClubFilter === 'top8') return c.rank <= 8;
        if (currentClubFilter === 'playoff') return c.rank >= 9 && c.rank <= 24;
        if (currentClubFilter === 'eliminated') return c.rank >= 25;
        return true;
      });

    grid.innerHTML = list
      .map((c) => {
        const survives = c.rank <= 24;
        const zoneBadge =
          c.rank <= 8
            ? '<span class="status-tag top8">★ R16 + TOKEN DEPLOY</span>'
            : c.rank <= 24
            ? '<span class="status-tag playoff">● PLAY-OFF + TOKEN DEPLOY</span>'
            : '<span class="status-tag elim">✕ ELIMINATED AT MD8</span>';

        return `
          <div class="club-token-card" style="background: linear-gradient(150deg, ${c.bg || '#1e6bff'}99 0%, #050d2a 82%); opacity: ${survives ? '1' : '0.68'};">
            <div>
              <div class="club-card-head">
                <span class="club-rank-pill">RANK #${c.rank}</span>
                ${zoneBadge}
              </div>
              <div style="display:flex; align-items:center; justify-content:space-between; gap:10px; margin-top:10px;">
                <div>
                  <div class="club-card-title" style="margin-top:0;">${c.name}</div>
                  <span class="club-card-ticker">${c.ticker}</span>
                </div>
                ${renderClubCrestHtml(c, false)}
              </div>
            </div>

            <div class="club-card-foot">
              <span>MATCHES: <strong>${c.pl}/8</strong></span>
              <span>PTS: <strong>${c.pts}</strong></span>
              <span>GD: <strong>${c.gf - c.ga >= 0 ? '+' + (c.gf - c.ga) : c.gf - c.ga}</strong></span>
            </div>
          </div>
        `;
      })
      .join('');
  }

  function renderKnockoutBracket() {
    sortClubs();
    const container = document.getElementById('knockout-bracket-container');
    if (!container || clubsData.length < 24) return;

    const top8 = clubsData.slice(0, 8);
    const playoffs = clubsData.slice(8, 24);

    container.innerHTML = `
      <div class="bracket-columns">
        <div class="bracket-col">
          <div class="bracket-col-title">STAGE 1 // PLAY-OFFS (RANKS 9–24)</div>
          ${playoffs
            .slice(0, 6)
            .map(
              (c, i) => `
              <div class="bracket-tie">
                <span>#${9 + i} ${c.name}</span>
                <strong>${c.ticker}</strong>
              </div>
            `
            )
            .join('')}
          <div class="bracket-tie">
            <span>+ 10 More Deployed Play-Off Tokens</span>
            <strong>LIVE</strong>
          </div>
        </div>

        <div class="bracket-col">
          <div class="bracket-col-title">STAGE 2 // ROUND OF 16 SEEDS (1–8)</div>
          ${top8
            .slice(0, 6)
            .map(
              (c, i) => `
              <div class="bracket-tie">
                <span>#${1 + i} ${c.name}</span>
                <strong>${c.ticker}</strong>
              </div>
            `
            )
            .join('')}
          <div class="bracket-tie">
            <span>#7 ${top8[6].name} / #8 ${top8[7].name}</span>
            <strong>SEEDED</strong>
          </div>
        </div>

        <div class="bracket-col">
          <div class="bracket-col-title">STAGE 3 // QUARTER &amp; SEMI-FINALS</div>
          <div class="bracket-tie"><span>QF Tie 1 (Surviving Token vs Token)</span><strong>QF1</strong></div>
          <div class="bracket-tie"><span>QF Tie 2 (Surviving Token vs Token)</span><strong>QF2</strong></div>
          <div class="bracket-tie"><span>QF Tie 3 (Surviving Token vs Token)</span><strong>QF3</strong></div>
          <div class="bracket-tie"><span>QF Tie 4 (Surviving Token vs Token)</span><strong>QF4</strong></div>
          <div class="bracket-tie"><span>Semi-Final 1 &amp; Semi-Final 2</span><strong>SF</strong></div>
        </div>

        <div class="bracket-col">
          <div class="bracket-col-title">STAGE 4 // THE FINAL (1 CHAMPION)</div>
          <div class="bracket-tie" style="border-color: var(--ucl-gold); padding: 14px;">
            <span>🏆 EUROPEAN CHAMPION TOKEN</span>
            <strong>1 SURVIVOR</strong>
          </div>
          <p style="font-size: 0.76rem; color: var(--ucl-silver-chrome); line-height: 1.5; margin-top: 10px;">
            All 24 club tokens deployed after Matchday 8 compete head-to-head. Eliminated clubs fall away until 1 Champion token lifts the trophy.
          </p>
        </div>
      </div>
    `;
  }

  function renderAll() {
    renderMatches();
    renderStandingsTable();
    renderSpotlightAndBoot();
    renderClubsDirectory();
    renderKnockoutBracket();
  }

  renderAll();

  // =========================================================
  // 5. REAL-TIME LIVE ESPN UEFA CHAMPIONS LEAGUE AUTO-UPDATER
  //    (Syncs both Live Scoreboard AND 36-Club Standings every 20s)
  // =========================================================
  async function syncLiveUefaData() {
    const syncText = document.getElementById('api-sync-text');
    try {
      if (syncText) syncText.textContent = 'SYNCING LIVE UEFA...';

      // 1. Fetch Live 36-Club UEFA Champions League Standings Table
      const standingsRes = await fetch(
        'https://site.api.espn.com/apis/v2/sports/soccer/uefa.champions/standings'
      );
      if (standingsRes.ok) {
        const stData = await standingsRes.json();
        const children = stData.children || [];
        const entries =
          (children[0] &&
            children[0].standings &&
            children[0].standings.entries) ||
          [];

        if (entries.length > 0) {
          const liveClubs = entries.map((entry) => {
            const team = entry.team || {};
            const code = team.abbreviation || team.shortDisplayName || 'UCL';
            const existing = clubsData.find((c) => c.code === code) || {};
            const statsMap = {};
            (entry.stats || []).forEach((s) => {
              statsMap[s.name] = s.value !== undefined ? s.value : s.displayValue;
            });

            const logoHref =
              (team.logos && team.logos[0] && team.logos[0].href) ||
              existing.logo ||
              '';

            return {
              code,
              name: team.displayName || team.name || existing.name || code,
              ticker: existing.ticker || `$${code.toUpperCase()}`,
              country: existing.country || 'EUR',
              bg: existing.bg || '#123596',
              fg: existing.fg || '#ffffff',
              logo: logoHref,
              pl: Number(statsMap.gamesPlayed ?? existing.pl ?? 0),
              w: Number(statsMap.wins ?? existing.w ?? 0),
              d: Number(statsMap.ties ?? existing.d ?? 0),
              l: Number(statsMap.losses ?? existing.l ?? 0),
              gf: Number(statsMap.pointsFor ?? existing.gf ?? 0),
              ga: Number(statsMap.pointsAgainst ?? existing.ga ?? 0),
              pts: Number(statsMap.points ?? existing.pts ?? 0),
              form: existing.form || ['W', 'D', 'W', 'W', 'D'],
            };
          });

          clubsData.length = 0;
          clubsData.push(...liveClubs);

          // Update Matchday Progress Bar based on average matches played out of 8
          const maxPlayed = Math.max(...clubsData.map((c) => c.pl), 1);
          const pct = Math.min(100, Math.round((maxPlayed / 8) * 100));
          const progBar = document.getElementById('matches-progress-bar');
          const progLabel = document.getElementById('matches-progress-label');
          if (progBar) progBar.style.width = `${pct}%`;
          if (progLabel) {
            progLabel.textContent = `MATCHDAY ${maxPlayed} OF 8 LIVE // TOP 24 DEPLOY AS TOKENS AT MD8`;
          }
        }
      }

      // 2. Fetch Live UEFA Champions League Scoreboard (Today's Live Games & Results)
      const scoreRes = await fetch(
        'https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.champions/scoreboard'
      );
      if (scoreRes.ok) {
        const scData = await scoreRes.json();
        const events = scData.events || [];
        if (events.length > 0) {
          const liveEvents = events.map((ev, idx) => {
            const comp = (ev.competitions && ev.competitions[0]) || {};
            const competitors = comp.competitors || [];
            const homeComp =
              competitors.find((c) => c.homeAway === 'home') || competitors[0] || {};
            const awayComp =
              competitors.find((c) => c.homeAway === 'away') || competitors[1] || {};
            const state = ev.status && ev.status.type && ev.status.type.state;
            const detail =
              (ev.status && ev.status.type && ev.status.type.shortDetail) || 'FT';

            const hTeam = homeComp.team || {};
            const aTeam = awayComp.team || {};
            const hCode = hTeam.abbreviation || 'HOME';
            const aCode = aTeam.abbreviation || 'AWAY';

            // Ensure club metadata & official ESPN logo are stored
            [
              { code: hCode, team: hTeam, formStr: homeComp.form },
              { code: aCode, team: aTeam, formStr: awayComp.form },
            ].forEach(({ code, team, formStr }) => {
              let clubObj = clubsData.find((c) => c.code === code);
              const parsedForm = formStr
                ? formStr.split('').slice(0, 5)
                : ['W', 'D', 'W', 'L', 'W'];
              if (!clubObj) {
                clubsData.push({
                  code,
                  name: team.displayName || team.shortDisplayName || code,
                  ticker: `$${code.toUpperCase()}`,
                  country: 'EUR',
                  bg: team.color ? `#${team.color}` : '#1e6bff',
                  fg: '#ffffff',
                  logo: team.logo || '',
                  pl: 2,
                  w: 1,
                  d: 0,
                  l: 1,
                  gf: 3,
                  ga: 2,
                  pts: 3,
                  form: parsedForm,
                });
              } else {
                if (team.logo) clubObj.logo = team.logo;
                if (team.color && clubObj.bg === '#123596') {
                  clubObj.bg = `#${team.color}`;
                }
                if (formStr) clubObj.form = parsedForm;
              }
            });

            // Extract goal scorers from match details
            const goals = (comp.details || [])
              .filter((d) => d.scoringPlay)
              .map((d) => {
                const scorer =
                  d.athletesInvolved &&
                  d.athletesInvolved[0] &&
                  d.athletesInvolved[0].shortName;
                const time = d.clock && d.clock.displayValue;
                return scorer ? `${scorer} ${time || ''}` : '';
              })
              .filter(Boolean)
              .slice(0, 3)
              .join(', ');

            return {
              id: ev.id || `espn-${idx}`,
              stage: 'UEFA CHAMPIONS LEAGUE • LIVE FEED',
              status: state === 'in' ? 'live' : state === 'post' ? 'ft' : 'upcoming',
              minute: detail,
              home: hCode,
              away: aCode,
              homeScore: state === 'pre' ? '-' : homeComp.score ?? '0',
              awayScore: state === 'pre' ? '-' : awayComp.score ?? '0',
              venue: (comp.venue && comp.venue.fullName) || 'European Arena',
              scorers: goals,
            };
          });

          matchesData.length = 0;
          matchesData.push(...liveEvents);
        }
      }

      renderAll();

      const now = new Date();
      const timeStr = now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      if (syncText) syncText.textContent = `LIVE • UPDATED ${timeStr}`;
    } catch {
      if (syncText) syncText.textContent = 'LIVE FEED ACTIVE';
    }
  }

  // Initial sync + auto-poll every 20 seconds for real-time live score & table updates
  syncLiveUefaData();
  setInterval(syncLiveUefaData, 20000);

  const refreshApiBtn = document.getElementById('refresh-live-api-btn');
  if (refreshApiBtn) {
    refreshApiBtn.addEventListener('click', () => {
      syncLiveUefaData();
    });
  }

  // =========================================================
  // 6. INTERACTIVE GOAL SIMULATOR (TEST TABLE & SCORE SHIFTS)
  // =========================================================
  const simulateGoalBtn = document.getElementById('simulate-goal-btn');
  if (simulateGoalBtn) {
    simulateGoalBtn.addEventListener('click', () => {
      const targetPool =
        matchesData.filter((m) => m.status === 'live').length > 0
          ? matchesData.filter((m) => m.status === 'live')
          : matchesData;

      if (targetPool.length > 0) {
        const randomMatch = targetPool[Math.floor(Math.random() * targetPool.length)];
        if (randomMatch.homeScore === '-') randomMatch.homeScore = 0;
        if (randomMatch.awayScore === '-') randomMatch.awayScore = 0;
        randomMatch.status = 'live';

        const scoreHome = Math.random() > 0.45;
        if (scoreHome) {
          randomMatch.homeScore = Number(randomMatch.homeScore) + 1;
          const club = clubsData.find((c) => c.code === randomMatch.home);
          if (club) {
            club.gf += 1;
            club.pts += 1;
          }
        } else {
          randomMatch.awayScore = Number(randomMatch.awayScore) + 1;
          const club = clubsData.find((c) => c.code === randomMatch.away);
          if (club) {
            club.gf += 1;
            club.pts += 1;
          }
        }
        renderAll();
      }
    });
  }

  // =========================================================
  // 7. NAVIGATION TABS, FILTERS & COPY CA
  // =========================================================
  const navTabs = document.querySelectorAll('.nav-tab');
  const tabPanels = {
    home: document.getElementById('panel-home'),
    token: document.getElementById('panel-token'),
    clubs: document.getElementById('panel-clubs'),
    tournament: document.getElementById('panel-tournament'),
  };

  function switchTab(tabKey) {
    navTabs.forEach((t) => t.classList.toggle('active', t.dataset.tab === tabKey));
    Object.entries(tabPanels).forEach(([k, panel]) => {
      if (panel) panel.classList.toggle('active', k === tabKey);
    });
    const scrollArea = document.getElementById('site-scroll-area');
    if (scrollArea) scrollArea.scrollTop = 0;
  }

  navTabs.forEach((tab) => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  document.querySelectorAll('[data-go-tab]').forEach((btn) => {
    btn.addEventListener('click', () => switchTab(btn.dataset.goTab));
  });

  // Match Filter Pills
  document.querySelectorAll('#home-match-filters .filter-pill[data-filter]').forEach((pill) => {
    pill.addEventListener('click', () => {
      document
        .querySelectorAll('#home-match-filters .filter-pill[data-filter]')
        .forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      currentMatchFilter = pill.dataset.filter;
      renderMatches();
    });
  });

  // Club Zone Filter Pills
  document.querySelectorAll('#clubs-zone-filters .filter-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      document
        .querySelectorAll('#clubs-zone-filters .filter-pill')
        .forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      currentClubFilter = pill.dataset.clubFilter;
      renderClubsDirectory();
    });
  });

  // Copy CA Buttons
  function wireCopyButton(btnId, codeId) {
    const btn = document.getElementById(btnId);
    const codeEl = document.getElementById(codeId);
    if (!btn || !codeEl) return;
    btn.addEventListener('click', async () => {
      const orig = btn.textContent;
      try {
        await navigator.clipboard.writeText(codeEl.textContent.trim());
      } catch {
        // ignore
      }
      btn.textContent = 'COPIED ✓';
      setTimeout(() => {
        btn.textContent = orig;
      }, 1800);
    });
  }

  wireCopyButton('intro-copy-ca-btn', 'intro-ca-value');
  wireCopyButton('main-copy-ca-btn', 'main-ca-value');
  wireCopyButton('token-tab-copy-btn', 'token-tab-ca');

  // Interactive Creator Fee & Burn Stage Switcher
  const stageConfigs = {
    '1': {
      activeTokens: '1 ($UCL FLAGSHIP)',
      burnPct: '50% OF FEES',
      deployPct: '50% → MD8 POOL',
      elimCount: '12 AT MATCH 8',
    },
    '2': {
      activeTokens: '1 $UCL + 24 CLUBS',
      burnPct: 'ONGOING BURN',
      deployPct: '100% SEEDS 24 CLUBS',
      elimCount: 'RANKS 25–36 OUT',
    },
    '3': {
      activeTokens: '24 → 16 → 8 → 4 → 2',
      burnPct: '50% TIE BURNS',
      deployPct: '50% WINNER BUYBACK',
      elimCount: '22 KNOCKED OUT',
    },
    '4': {
      activeTokens: '1 $UCL + 1 CHAMPION',
      burnPct: 'FINAL SUPPLY BURN',
      deployPct: 'HOLDER REWARDS ✓',
      elimCount: '35 ELIMINATED TOTAL',
    },
  };

  const stageBtns = document.querySelectorAll('#flywheel-stage-btns .stage-btn');
  const pillars = document.querySelectorAll('.flywheel-pillar');
  stageBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      stageBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const stageId = btn.dataset.stage;
      const cfg = stageConfigs[stageId];
      if (cfg) {
        const elActive = document.getElementById('fw-active-tokens');
        const elBurn = document.getElementById('fw-burn-pct');
        const elDeploy = document.getElementById('fw-deploy-pct');
        const elElim = document.getElementById('fw-elim-count');
        if (elActive) elActive.textContent = cfg.activeTokens;
        if (elBurn) elBurn.textContent = cfg.burnPct;
        if (elDeploy) elDeploy.textContent = cfg.deployPct;
        if (elElim) elElim.textContent = cfg.elimCount;
      }
      pillars.forEach((p, idx) => {
        p.classList.toggle('featured', String(idx + 1) === stageId);
      });
    });
  });
})();
