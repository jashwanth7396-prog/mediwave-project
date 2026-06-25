import { useEffect, useState } from 'react';

const CountUp = ({ value = 0, duration = 800, format = false }) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = null;
    const from = 0;
    const to = Number(value) || 0;
    if (!duration || to === from) {
      setDisplay(to);
      return;
    }

    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const current = Math.floor(from + (to - from) * progress);
      setDisplay(current);
      if (progress < 1) requestAnimationFrame(step);
      else setDisplay(to);
    };

    const raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  if (format) {
    return <>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(display)}</>;
  }

  return <>{display}</>;
};

export default CountUp;
