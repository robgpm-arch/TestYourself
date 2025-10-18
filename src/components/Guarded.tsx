import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { guardApp } from '../routes/guards';

interface GuardedProps {
  element: React.ReactElement;
}

export default function Guarded({ element }: GuardedProps) {
  const navigate = useNavigate();

  useEffect(() => {
    guardApp(navigate);
  }, [navigate]);

  return element;
}