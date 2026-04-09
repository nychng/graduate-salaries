import { useState, useEffect, useCallback } from 'react';

const DEFAULT_STATE = {
  universities: [],
  schools: [],
  degrees: [],
  metric: 'gross_monthly_median',
};

function parseHash() {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  const hash = window.location.hash.slice(1);
  const params = new URLSearchParams(hash);
  return {
    universities: params.get('u') ? params.get('u').split('|') : [],
    schools: params.get('s') ? params.get('s').split('|') : [],
    degrees: params.get('d') ? params.get('d').split('|') : [],
    metric: params.get('m') || 'gross_monthly_median',
  };
}

function toHash(state) {
  const params = new URLSearchParams();
  if (state.universities.length) params.set('u', state.universities.join('|'));
  if (state.schools.length) params.set('s', state.schools.join('|'));
  if (state.degrees.length) params.set('d', state.degrees.join('|'));
  if (state.metric !== 'gross_monthly_median') params.set('m', state.metric);
  return params.toString();
}

export function useUrlState() {
  const [state, setState] = useState(DEFAULT_STATE);

  // Parse hash on client mount
  useEffect(() => {
    setState(parseHash());
    const handler = () => setState(parseHash());
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  const update = useCallback((partial) => {
    setState((prev) => {
      const next = { ...prev, ...partial };
      window.location.hash = toHash(next);
      return next;
    });
  }, []);

  return [state, update];
}
