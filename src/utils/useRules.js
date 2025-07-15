import { useEffect, useState } from 'react';

export default function useRules() {
  const [rules, setRules] = useState([]);
  useEffect(() => {
    fetch('/config/rules.json')
      .then(res => res.json())
      .then(setRules)
      .catch(() => setRules([]));
  }, []);
  return rules;
} 