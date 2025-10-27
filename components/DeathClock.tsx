
// FIX: Import React to use JSX and React hooks.
import React from 'react';
import * as d3 from 'd3';

interface Particle {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  alpha: number;
  life: number;
  maxLife: number;
}

interface DeathClockProps {
  soundEnabled: boolean;
  dob: string;
  expectedEndDate: string | null;
}

const DeathClock: React.FC<DeathClockProps> = ({ soundEnabled, dob, expectedEndDate }) => {
  const svgRef = React.useRef<SVGSVGElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const animationFrameId = React.useRef<number | null>(null);
  const [now, setNow] = React.useState(new Date());
  const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });
  const audioContextRef = React.useRef<AudioContext | null>(null);
  const [titleText, setTitleText] = React.useState('');
  const [subtitleText, setSubtitleText] = React.useState('');

  const d3Container = React.useRef<{
    svg?: any;
    g?: any;
    arcGenerators?: { [key:string]: any };
    tooltipGroup?: any;
    tooltipText?: any;
    lastSecond?: number | null;
    lastMinute?: number | null;
  }>({ lastSecond: null, lastMinute: null });

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
      { name: 'Years', total: Math.floor(lifeExpectancyYears), color: '#00ffff', radiusMultiplier: 1.0, sizeMultiplier: 0.06 },
      { name: 'Months', total: 12, color: '#00ddff', radiusMultiplier: 0.85, sizeMultiplier: 0.07 },
      { name: 'Days', total: daysInCurrentMonth, color: '#00bbff', radiusMultiplier: 0.7, sizeMultiplier: 0.06 },
      { name: 'Hours', total: 24, color: '#0099ff', radiusMultiplier: 0.55, sizeMultiplier: 0.05 },
      { name: 'Minutes', total: 60, color: '#0077ff', radiusMultiplier: 0.4, sizeMultiplier: 0.035 },
      { name: 'Seconds', total: 60, color: '#0055ff', radiusMultiplier: 0.25, sizeMultiplier: 0.025 },
    ];
    
    if (isDeathClockMode) {
      return fullConfig;
    }
    // Normal clock mode: remove the 'Years' ring
    return fullConfig.slice(1);

  }, [isDeathClockMode, lifeExpectancyYears, now.getFullYear(), now.getMonth()]);


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
    const particleCount = 100;

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
        const life = Math.random() * 200 + 100;
        return {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 1.5 + 0.5,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            alpha: 0,
            life: life,
            maxLife: life,
        };
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life--;

        if (p.life > p.maxLife / 2) {
            p.alpha = 1 - (p.life - p.maxLife / 2) / (p.maxLife / 2);
        } else {
            p.alpha = p.life / (p.maxLife / 2);
        }
        
        if (p.x < 0 || p.x > canvas.width || p.y < 0 || p.y > canvas.height || p.life <= 0) {
          particles[i] = createParticle();
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 225, 255, ${p.alpha * 0.3})`;
        ctx.fill();
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

    // Add glow filter definition
    const defs = svg.append('defs');
    const filter = defs.append('filter').attr('id', 'glow');
    filter.append('feGaussianBlur').attr('stdDeviation', '3.5').attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    const g = svg.append("g").attr("class", "main-container");
    const arcGenerators: { [key:string]: any } = {};

    SECTIONS_CONFIG.forEach(section => {
      arcGenerators[section.name] = d3.arc();
      g.append("g").attr("class", `arc-group-${section.name}`);
    });

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
      
      g.select(`.arc-group-${section.name}`)
        .selectAll("path")
        .data(d3.range(section.total))
        .join("path")
        .attr("class", `arc-path-${section.name}`)
        .attr("d", (d: any, i: number) => arcGenerators[section.name]({
            startAngle: i * angleStep,
            endAngle: (i + 1) * angleStep - (section.total > 100 ? 0.01 : 0.05)
        }))
        .on('mouseover', function() {
            if (tooltipGroup && tooltipText) {
                tooltipGroup.style('display', 'block');
                tooltipText.text(section.name);
            }
            d3.select(this.parentNode).selectAll('path')
                .style('filter', 'url(#glow)');
        })
        .on('mouseout', function() {
            if (tooltipGroup) {
                tooltipGroup.style('display', 'none');
            }
            d3.select(this.parentNode).selectAll('path')
                .style('filter', null);
        });
    });
  }, [dimensions, SECTIONS_CONFIG]);

  // D3 animation effect (runs every second)
  React.useEffect(() => {
    if (!d3Container.current.g || dimensions.width === 0) return;
    const { g } = d3Container.current;

    // Reset all transforms and interrupted animations
    g.selectAll('path').interrupt().attr('transform', 'scale(1)');

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
              .duration(250)
              .attr("fill", (d: any, i: number) => (i < current) ? section.color : "#222")
              .style("opacity", (d: any, i: number) => (i < current) ? 0.9 : 0.3);
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
              .duration(250)
              .attr("fill", (d: any, i: number) => (i < current) ? section.color : "#222")
              .style("opacity", (d: any, i: number) => (i < current) ? 0.9 : 0.3);
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
    <div className="w-full h-full flex flex-col items-center justify-center">
        <div className="w-full flex-1 relative">
            <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full z-0"></canvas>
            <svg ref={svgRef} className="w-full h-full relative z-10"></svg>
        </div>
        <div className="flex-shrink-0 py-2 text-center">
            <p className="text-white font-bold text-base md:text-lg whitespace-nowrap">{titleText}</p>
            <p className="text-gray-300 text-sm whitespace-nowrap">{subtitleText}</p>
        </div>
    </div>
  );
};

export default DeathClock;