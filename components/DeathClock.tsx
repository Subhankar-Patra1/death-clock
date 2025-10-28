
// FIX: Import React to use JSX and React hooks.
import React from 'react';
import * as d3 from 'd3';
import useLocalStorage from '../hooks/useLocalStorage';

interface Particle {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  alpha: number;
  life: number;
  maxLife: number;
  color?: string;
  trail?: { x: number; y: number; alpha: number }[];
}

interface Theme {
  name: string;
  colors: {
    Years: string;
    Months: string;
    Days: string;
    Hours: string;
    Minutes: string;
    Seconds: string;
  };
  background: string;
  particles: {
    color: string;
    count: number;
    speed: number;
    size: number;
  };
  effects: {
    glow: boolean;
    pulse: boolean;
    trails: boolean;
    breathing: boolean;
  };
  typography: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

interface DeathClockProps {
  soundEnabled: boolean;
  dob: string;
  expectedEndDate: string | null;
}

const THEMES: Theme[] = [
  {
    name: 'Cosmic',
    colors: {
      Years: '#FF6B6B',
      Months: '#4ECDC4', 
      Days: '#45B7D1',
      Hours: '#96CEB4',
      Minutes: '#FFEAA7',
      Seconds: '#DDA0DD'
    },
    background: 'radial-gradient(circle at center, #0a0a1a 0%, #000000 100%)',
    particles: {
      color: '#ffffff',
      count: 150,
      speed: 0.5,
      size: 2
    },
    effects: {
      glow: true,
      pulse: true,
      trails: true,
      breathing: true
    },
    typography: {
      primary: '#ffffff',
      secondary: '#cccccc',
      accent: '#4ECDC4'
    }
  },
  {
    name: 'Organic',
    colors: {
      Years: '#8B4513',
      Months: '#228B22',
      Days: '#32CD32', 
      Hours: '#9ACD32',
      Minutes: '#FFD700',
      Seconds: '#FF6347'
    },
    background: 'radial-gradient(circle at center, #0d1b0d 0%, #000000 100%)',
    particles: {
      color: '#90EE90',
      count: 80,
      speed: 0.3,
      size: 1.5
    },
    effects: {
      glow: true,
      pulse: false,
      trails: false,
      breathing: true
    },
    typography: {
      primary: '#F5F5DC',
      secondary: '#DEB887',
      accent: '#32CD32'
    }
  },
  {
    name: 'Elegant',
    colors: {
      Years: '#2C3E50',
      Months: '#34495E',
      Days: '#5D6D7E',
      Hours: '#85929E',
      Minutes: '#AEB6BF',
      Seconds: '#D5DBDB'
    },
    background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)',
    particles: {
      color: '#BDC3C7',
      count: 60,
      speed: 0.2,
      size: 1
    },
    effects: {
      glow: false,
      pulse: false,
      trails: false,
      breathing: false
    },
    typography: {
      primary: '#ECF0F1',
      secondary: '#BDC3C7',
      accent: '#3498DB'
    }
  },
  {
    name: 'Neon',
    colors: {
      Years: '#FF0080',
      Months: '#00FF80',
      Days: '#8000FF',
      Hours: '#FF8000',
      Minutes: '#0080FF',
      Seconds: '#80FF00'
    },
    background: 'radial-gradient(circle at center, #0a0a0a 0%, #000000 100%)',
    particles: {
      color: '#00FFFF',
      count: 200,
      speed: 0.8,
      size: 1.5
    },
    effects: {
      glow: true,
      pulse: true,
      trails: true,
      breathing: false
    },
    typography: {
      primary: '#FFFFFF',
      secondary: '#00FFFF',
      accent: '#FF0080'
    }
  }
];

const ThemeSelector = ({ currentTheme, onThemeChange }: { currentTheme: string, onThemeChange: (theme: string) => void }) => (
  <div className="absolute top-4 right-4 flex gap-2 z-10">
    {THEMES.map(theme => (
      <button
        key={theme.name}
        onClick={() => onThemeChange(theme.name)}
        className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
          currentTheme === theme.name 
            ? 'bg-white text-black shadow-lg' 
            : 'bg-black/50 text-white/70 hover:bg-white/20'
        }`}
        title={`Switch to ${theme.name} theme`}
      >
        {theme.name}
      </button>
    ))}
  </div>
);

const DeathClock: React.FC<DeathClockProps> = ({ soundEnabled, dob, expectedEndDate }) => {
  const svgRef = React.useRef<SVGSVGElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const animationFrameId = React.useRef<number | null>(null);
  const [now, setNow] = React.useState(new Date());
  const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });
  const audioContextRef = React.useRef<AudioContext | null>(null);
  const [titleText, setTitleText] = React.useState('');
  const [subtitleText, setSubtitleText] = React.useState('');
  const [currentThemeName, setCurrentThemeName] = useLocalStorage<string>('death-clock-theme', 'Cosmic');
  const [breathingScale, setBreathingScale] = React.useState(1);

  const d3Container = React.useRef<{
    svg?: any;
    g?: any;
    arcGenerators?: { [key:string]: any };
    tooltipGroup?: any;
    tooltipText?: any;
    lastSecond?: number | null;
    lastMinute?: number | null;
  }>({ lastSecond: null, lastMinute: null });

  const currentTheme = React.useMemo(() => 
    THEMES.find(t => t.name === currentThemeName) || THEMES[0], 
    [currentThemeName]
  );

  const isDeathClockMode = React.useMemo(() => !!expectedEndDate, [expectedEndDate]);
  const birthDate = React.useMemo(() => new Date(dob), [dob]);

  const lifeExpectancyYears = React.useMemo(() => {
    if (isDeathClockMode) {
      try {
        const end = new Date(expectedEndDate!); // Safe due to isDeathClockMode check
        const diffMs = end.getTime() - birthDate.getTime();
        return diffMs / (1000 * 60 * 60 * 24 * 365.25);
      } catch (e) {
        console.error("Invalid date for life expectancy calculation", e);
      }
    }
    return 80; // Default for age display
  }, [birthDate, expectedEndDate, isDeathClockMode]);


  const SECTIONS_CONFIG = React.useMemo(() => {
    const daysInCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    
    const fullConfig = [
      { name: 'Years', total: Math.floor(lifeExpectancyYears), color: currentTheme.colors.Years, radiusMultiplier: 1.0, sizeMultiplier: 0.08 },
      { name: 'Months', total: 12, color: currentTheme.colors.Months, radiusMultiplier: 0.85, sizeMultiplier: 0.09 },
      { name: 'Days', total: daysInCurrentMonth, color: currentTheme.colors.Days, radiusMultiplier: 0.7, sizeMultiplier: 0.08 },
      { name: 'Hours', total: 24, color: currentTheme.colors.Hours, radiusMultiplier: 0.55, sizeMultiplier: 0.07 },
      { name: 'Minutes', total: 60, color: currentTheme.colors.Minutes, radiusMultiplier: 0.4, sizeMultiplier: 0.06 },
      { name: 'Seconds', total: 60, color: currentTheme.colors.Seconds, radiusMultiplier: 0.25, sizeMultiplier: 0.05 },
    ];
    
    if (isDeathClockMode) {
      return fullConfig;
    }
    // Normal clock mode: remove the 'Years' ring
    return fullConfig.slice(1);

  }, [isDeathClockMode, lifeExpectancyYears, now.getFullYear(), now.getMonth(), currentTheme]);


  // Initialize AudioContext and set up the main timer
  React.useEffect(() => {
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.error("Web Audio API is not supported in this browser.", e);
    }
    
    const timer = setInterval(() => setNow(new Date()), 1000);

    return () => {
      clearInterval(timer);
      audioContextRef.current?.close().catch(console.error);
    }
  }, []);

  // Breathing animation effect
  React.useEffect(() => {
    if (!currentTheme.effects.breathing) return;
    
    const breathingInterval = setInterval(() => {
      setBreathingScale(prev => prev === 1 ? 1.02 : 1);
    }, 3000);

    return () => clearInterval(breathingInterval);
  }, [currentTheme.effects.breathing]);
  
  // Resync clock when tab becomes visible
  React.useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Force update to the current time to resync the clock
        // after the tab has been in the background.
        setNow(new Date());
        
        // Reset D3 animation state
        if (d3Container.current.g) {
          const { g } = d3Container.current;
          // Clear all ongoing transitions
          g.selectAll('path').interrupt();
          // Reset lastSecond and lastMinute to force a full refresh
          d3Container.current.lastSecond = null;
          d3Container.current.lastMinute = null;
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);


  const playTick = () => {
    const audioContext = audioContextRef.current;
    if (!audioContext) return;
    
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.08);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.08);
  };

  // Background canvas animation effect
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Particle[] = [];
    const particleCount = currentTheme.particles.count;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      createParticles();
    };

    const createParticles = () => {
        particles = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push(createParticle());
        }
    }

    const createParticle = (): Particle => {
        const life = Math.random() * 300 + 150;
        const particle: Particle = {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * currentTheme.particles.size + 0.5,
            vx: (Math.random() - 0.5) * currentTheme.particles.speed,
            vy: (Math.random() - 0.5) * currentTheme.particles.speed,
            alpha: 0,
            life: life,
            maxLife: life,
            color: currentTheme.particles.color,
            trail: currentTheme.effects.trails ? [] : undefined
        };
        return particle;
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, i) => {
        // Update trail
        if (p.trail) {
          p.trail.push({ x: p.x, y: p.y, alpha: p.alpha });
          if (p.trail.length > 10) p.trail.shift();
        }

        p.x += p.vx;
        p.y += p.vy;
        p.life--;

        // Enhanced alpha calculation for smoother fading
        const lifeRatio = p.life / p.maxLife;
        p.alpha = Math.sin(lifeRatio * Math.PI) * 0.8;
        
        if (p.x < 0 || p.x > canvas.width || p.y < 0 || p.y > canvas.height || p.life <= 0) {
          particles[i] = createParticle();
        }

        // Draw trail
        if (p.trail && p.trail.length > 1) {
          ctx.strokeStyle = p.color || currentTheme.particles.color;
          ctx.lineWidth = 1;
          ctx.globalAlpha = p.alpha * 0.3;
          ctx.beginPath();
          ctx.moveTo(p.trail[0].x, p.trail[0].y);
          for (let j = 1; j < p.trail.length; j++) {
            ctx.lineTo(p.trail[j].x, p.trail[j].y);
          }
          ctx.stroke();
          ctx.globalAlpha = 1;
        }

        // Draw particle with glow effect
        if (currentTheme.effects.glow) {
          ctx.shadowColor = p.color || currentTheme.particles.color;
          ctx.shadowBlur = 10;
        }
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        const color = p.color || currentTheme.particles.color;
        const rgb = d3.color(color)?.rgb();
        if (rgb) {
          ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${p.alpha * 0.6})`;
        } else {
          ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * 0.3})`;
        }
        ctx.fill();
        
        if (currentTheme.effects.glow) {
          ctx.shadowBlur = 0;
        }
      });

      animationFrameId.current = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  // Effect to handle SVG resizing
  React.useEffect(() => {
    const handleResize = () => {
      if (svgRef.current) {
        setDimensions({
          width: svgRef.current.clientWidth,
          height: svgRef.current.clientHeight,
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  // D3 one-time setup effect
  React.useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); 

    // Add enhanced filter definitions
    const defs = svg.append('defs');
    
    // Glow filter
    const glowFilter = defs.append('filter').attr('id', 'glow');
    glowFilter.append('feGaussianBlur').attr('stdDeviation', '4').attr('result', 'coloredBlur');
    const glowMerge = glowFilter.append('feMerge');
    glowMerge.append('feMergeNode').attr('in', 'coloredBlur');
    glowMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Pulse filter
    const pulseFilter = defs.append('filter').attr('id', 'pulse');
    pulseFilter.append('feGaussianBlur').attr('stdDeviation', '2').attr('result', 'blur');
    pulseFilter.append('feColorMatrix')
      .attr('in', 'blur')
      .attr('type', 'matrix')
      .attr('values', '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1.5 0');

    // Gradient definitions for each theme color
    SECTIONS_CONFIG.forEach((section, index) => {
      const gradient = defs.append('radialGradient')
        .attr('id', `gradient-${section.name}`)
        .attr('cx', '50%')
        .attr('cy', '50%')
        .attr('r', '50%');
      
      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', d3.color(section.color)?.brighter(0.5)?.toString() || section.color)
        .attr('stop-opacity', 0.8);
      
      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', section.color)
        .attr('stop-opacity', 1);
    });

    const g = svg.append("g").attr("class", "main-container");
    const arcGenerators: { [key:string]: any } = {};

    SECTIONS_CONFIG.forEach(section => {
      arcGenerators[section.name] = d3.arc();
      g.append("g").attr("class", `arc-group-${section.name}`);
    });

    // Create analog clock in center
    const clockGroup = g.append("g").attr("class", "analog-clock");
    
    // Clock face background
    clockGroup.append("circle")
      .attr("class", "clock-face")
      .attr("r", 60)
      .attr("fill", currentTheme.name === 'Elegant' ? '#2C3E50' : 'rgba(0,0,0,0.8)')
      .attr("stroke", currentTheme.typography.accent)
      .attr("stroke-width", 2)
      .style("filter", currentTheme.effects.glow ? "url(#glow)" : null);

    // Hour markers
    for (let i = 0; i < 12; i++) {
      const angle = (i * 30 - 90) * (Math.PI / 180);
      const x1 = Math.cos(angle) * 45;
      const y1 = Math.sin(angle) * 45;
      const x2 = Math.cos(angle) * 50;
      const y2 = Math.sin(angle) * 50;
      
      clockGroup.append("line")
        .attr("class", "hour-marker")
        .attr("x1", x1)
        .attr("y1", y1)
        .attr("x2", x2)
        .attr("y2", y2)
        .attr("stroke", currentTheme.typography.primary)
        .attr("stroke-width", i % 3 === 0 ? 3 : 1)
        .attr("opacity", 0.8);
    }

    // Hour numbers
    for (let i = 1; i <= 12; i++) {
      const angle = (i * 30 - 90) * (Math.PI / 180);
      const x = Math.cos(angle) * 35;
      const y = Math.sin(angle) * 35;
      
      clockGroup.append("text")
        .attr("class", "hour-number")
        .attr("x", x)
        .attr("y", y)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr("fill", currentTheme.typography.primary)
        .attr("font-size", "12px")
        .attr("font-weight", "bold")
        .text(i);
    }

    // Clock hands (will be updated in animation)
    clockGroup.append("line")
      .attr("class", "hour-hand")
      .attr("stroke", currentTheme.colors.Hours)
      .attr("stroke-width", 4)
      .attr("stroke-linecap", "round")
      .style("filter", currentTheme.effects.glow ? "url(#glow)" : null);

    clockGroup.append("line")
      .attr("class", "minute-hand")
      .attr("stroke", currentTheme.colors.Minutes)
      .attr("stroke-width", 3)
      .attr("stroke-linecap", "round")
      .style("filter", currentTheme.effects.glow ? "url(#glow)" : null);

    clockGroup.append("line")
      .attr("class", "second-hand")
      .attr("stroke", currentTheme.colors.Seconds)
      .attr("stroke-width", 1)
      .attr("stroke-linecap", "round")
      .style("filter", currentTheme.effects.glow ? "url(#glow)" : null);

    // Center dot
    clockGroup.append("circle")
      .attr("class", "center-dot")
      .attr("r", 4)
      .attr("fill", currentTheme.typography.accent)
      .style("filter", currentTheme.effects.glow ? "url(#glow)" : null);

    const tooltipGroup = g.append('g')
      .attr('class', 'tooltip')
      .style('display', 'none')
      .attr('pointer-events', 'none');

    tooltipGroup.append('text')
      .attr('class', 'tooltip-text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .style('fill', '#e0e0e0')
      .style('font-size', '2rem')
      .style('font-weight', 'bold')
      .style('text-transform', 'capitalize');

    d3Container.current = { ...d3Container.current, svg, g, arcGenerators, tooltipGroup, tooltipText: tooltipGroup.select('text') };
  }, [SECTIONS_CONFIG]); // Re-run if SECTIONS_CONFIG changes

  // D3 data-join and resize effect
  React.useEffect(() => {
    if (!d3Container.current.g || !d3Container.current.arcGenerators || dimensions.width === 0) return;
    const { g, arcGenerators, tooltipGroup, tooltipText } = d3Container.current;
    const { width, height } = dimensions;

    const radius = Math.min(width, height) / 2 - 40;
    g.attr("transform", `translate(${width / 2},${height / 2})`);

    SECTIONS_CONFIG.forEach(section => {
      const sectionRadius = radius * section.radiusMultiplier;
      const sectionSize = radius * section.sizeMultiplier;

      arcGenerators[section.name]
        .innerRadius(sectionRadius - sectionSize)
        .outerRadius(sectionRadius);

      const angleStep = (2 * Math.PI) / section.total;
      
      const arcGroup = g.select(`.arc-group-${section.name}`)
        .selectAll("path")
        .data(d3.range(section.total))
        .join("path")
        .attr("class", `arc-path-${section.name}`)
        .attr("d", (d: any, i: number) => {
          // Create more organic shapes for organic theme
          if (currentTheme.name === 'Organic') {
            const baseAngle = i * angleStep;
            const endAngle = (i + 1) * angleStep - 0.02;
            const variation = Math.sin(i * 0.5) * 0.01; // Slight organic variation
            return arcGenerators[section.name]({
              startAngle: baseAngle + variation,
              endAngle: endAngle + variation
            });
          }
          return arcGenerators[section.name]({
            startAngle: i * angleStep,
            endAngle: (i + 1) * angleStep - (section.total > 100 ? 0.01 : 0.03)
          });
        })
        .attr("fill", `url(#gradient-${section.name})`)
        .attr("stroke", currentTheme.effects.glow ? section.color : 'none')
        .attr("stroke-width", currentTheme.effects.glow ? 0.5 : 0)
        .style("filter", currentTheme.effects.glow ? "url(#glow)" : null)
        .on('mouseover', function(event, d) {
            if (tooltipGroup && tooltipText) {
                tooltipGroup.style('display', 'block');
                tooltipText.text(`${section.name}: ${d + 1}/${section.total}`);
            }
            d3.select(this)
                .transition()
                .duration(200)
                .attr('transform', 'scale(1.05)')
                .style('filter', currentTheme.effects.glow ? 'url(#pulse)' : 'url(#glow)');
        })
        .on('mouseout', function() {
            if (tooltipGroup) {
                tooltipGroup.style('display', 'none');
            }
            d3.select(this)
                .transition()
                .duration(200)
                .attr('transform', 'scale(1)')
                .style('filter', currentTheme.effects.glow ? 'url(#glow)' : null);
        });
    });
  }, [dimensions, SECTIONS_CONFIG]);

  // D3 animation effect (runs every second)
  React.useEffect(() => {
    if (!d3Container.current.g || dimensions.width === 0) return;
    const { g } = d3Container.current;

    // Reset all transforms and interrupted animations
    g.selectAll('path').interrupt().attr('transform', 'scale(1)');

    // Update analog clock hands
    const updateClockHands = () => {
      const hours = now.getHours() % 12;
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();

      // Calculate angles (12 o'clock is -90 degrees)
      const hourAngle = (hours * 30 + minutes * 0.5 - 90) * (Math.PI / 180);
      const minuteAngle = (minutes * 6 - 90) * (Math.PI / 180);
      const secondAngle = (seconds * 6 - 90) * (Math.PI / 180);

      // Update hour hand
      g.select('.hour-hand')
        .transition()
        .duration(500)
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', Math.cos(hourAngle) * 25)
        .attr('y2', Math.sin(hourAngle) * 25);

      // Update minute hand
      g.select('.minute-hand')
        .transition()
        .duration(500)
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', Math.cos(minuteAngle) * 35)
        .attr('y2', Math.sin(minuteAngle) * 35);

      // Update second hand with smooth animation
      g.select('.second-hand')
        .transition()
        .duration(currentTheme.effects.pulse ? 100 : 500)
        .ease(d3.easeElastic.amplitude(1).period(0.3))
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', Math.cos(secondAngle) * 40)
        .attr('y2', Math.sin(secondAngle) * 40);
    };

    updateClockHands();

    const ageInMilliseconds = now.getTime() - birthDate.getTime();
    
    const month = now.getMonth();
    const day = now.getDate();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const second = now.getSeconds();

    if (soundEnabled && d3Container.current.lastSecond !== second) {
      playTick();
    }

    if (isDeathClockMode) {
      const ageInYears = ageInMilliseconds / (1000 * 60 * 60 * 24 * 365.25);
      const totalDaysLived = Math.floor(ageInMilliseconds / (1000 * 60 * 60 * 24));
      const totalDaysExpected = Math.floor(lifeExpectancyYears * 365.25);
      const percentageLived = (totalDaysLived / totalDaysExpected) * 100;
      
      const timeData = {
          Years: Math.floor(ageInYears),
          Months: month,
          Days: day - 1,
          Hours: hour,
          Minutes: minute,
          Seconds: second,
      };

      setTitleText(`Day ${totalDaysLived.toLocaleString()} of ${totalDaysExpected.toLocaleString()}`);
      setSubtitleText(`${percentageLived.toFixed(4)}% Complete`);

      SECTIONS_CONFIG.forEach(section => {
          const current = timeData[section.name as keyof typeof timeData];
          g.selectAll(`.arc-path-${section.name}`)
              .interrupt()
              .transition()
              .duration(500)
              .ease(d3.easeElasticOut.amplitude(1).period(0.3))
              .attr("fill", (d: any, i: number) => 
                i < current ? `url(#gradient-${section.name})` : 
                currentTheme.name === 'Elegant' ? '#1a1a1a' : '#111'
              )
              .style("opacity", (d: any, i: number) => (i < current) ? 1 : 0.2)
              .attr("transform", `scale(${breathingScale})`);
      });

    } else {
      let years = now.getFullYear() - birthDate.getFullYear();
      let months = now.getMonth() - birthDate.getMonth();
      let days = now.getDate() - birthDate.getDate();

      if (days < 0) {
        months--;
        const lastDayOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
        days += lastDayOfPrevMonth;
      }

      if (months < 0) {
        years--;
        months += 12;
      }
      
      const ageParts = [];
      if (years > 0) ageParts.push(`${years} year${years !== 1 ? 's' : ''}`);
      if (months > 0) ageParts.push(`${months} month${months !== 1 ? 's' : ''}`);
      if (days > 0) ageParts.push(`${days} day${days !== 1 ? 's' : ''}`);

      setTitleText(`Age: ${ageParts.join(', ')}`);
      setSubtitleText(now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
      
      const timeData = {
          Months: month,
          Days: day - 1,
          Hours: hour,
          Minutes: minute,
          Seconds: second,
      };
      
      SECTIONS_CONFIG.forEach(section => {
          const current = timeData[section.name as keyof typeof timeData];
          g.selectAll(`.arc-path-${section.name}`)
              .interrupt()
              .transition()
              .duration(500)
              .ease(d3.easeElasticOut.amplitude(1).period(0.3))
              .attr("fill", (d: any, i: number) => 
                i < current ? `url(#gradient-${section.name})` : 
                currentTheme.name === 'Elegant' ? '#1a1a1a' : '#111'
              )
              .style("opacity", (d: any, i: number) => (i < current) ? 1 : 0.2)
              .attr("transform", `scale(${breathingScale})`);
      });
    }
    
    const secondsColor = SECTIONS_CONFIG.find(s => s.name === 'Seconds')?.color || '#0055ff';
    const secondsPulseColor = d3.color(secondsColor)?.brighter(1.5)?.toString() || secondsColor;

    if (d3Container.current.lastSecond !== null) {
      g.selectAll('.arc-path-Seconds')
        .filter((d: any, i: number) => i === d3Container.current.lastSecond)
        .transition()
        .duration(500)
        .attr('transform', 'scale(1)');
    }

    g.selectAll(`.arc-path-Seconds`)
        .filter((d: any, i: number) => i === second)
        .interrupt()
        .attr('fill', secondsPulseColor)
        .style('opacity', 1)
        .attr('transform', 'scale(1.1)')
        .transition()
        .duration(800)
        .attr('fill', secondsColor)
        .style('opacity', 0.9)
        .attr('transform', 'scale(1)');

    d3Container.current.lastSecond = second;

    if (d3Container.current.lastMinute !== minute) {
        const minutesColor = SECTIONS_CONFIG.find(s => s.name === 'Minutes')?.color || '#0077ff';
        const minutesPulseColor = d3.color(minutesColor)?.brighter(1.5)?.toString() || minutesColor;

        g.selectAll('.arc-path-Minutes')
            .filter((d: any, i: number) => i === minute)
            .interrupt()
            .attr('fill', minutesPulseColor)
            .style('opacity', 1)
            .attr('transform', 'scale(1.08)')
            .transition()
            .duration(1200)
            .attr('fill', minutesColor)
            .style('opacity', 0.9)
            .attr('transform', 'scale(1)');
        
        d3Container.current.lastMinute = minute;
    }

  }, [now, dimensions, soundEnabled, birthDate, lifeExpectancyYears, SECTIONS_CONFIG, isDeathClockMode]);


  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative">
        <ThemeSelector 
          currentTheme={currentThemeName} 
          onThemeChange={setCurrentThemeName} 
        />
        
        <div 
          className="w-full flex-1 relative rounded-lg overflow-hidden"
          style={{ 
            background: currentTheme.background,
            transform: `scale(${breathingScale})`,
            transition: 'transform 3s ease-in-out'
          }}
        >
            <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full z-0"></canvas>
            <svg ref={svgRef} className="w-full h-full relative z-10"></svg>
        </div>
        
        <div className="flex-shrink-0 py-4 text-center">
            <p 
              className="font-bold text-lg md:text-xl whitespace-nowrap mb-1"
              style={{ 
                color: currentTheme.typography.primary,
                textShadow: currentTheme.effects.glow ? `0 0 10px ${currentTheme.typography.accent}` : 'none'
              }}
            >
              {titleText}
            </p>
            <p 
              className="text-sm md:text-base whitespace-nowrap"
              style={{ color: currentTheme.typography.secondary }}
            >
              {subtitleText}
            </p>
        </div>
    </div>
  );
};

export default DeathClock;