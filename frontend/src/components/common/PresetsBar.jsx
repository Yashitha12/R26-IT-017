import React from 'react';
import { useApp } from '../../context/AppContext';

export const PresetsBar = () => {
  const { activePreset, applyPreset } = useApp();

  const presets = [
    { id: 'user-prototype-001', label: '1. Aravinda Kumara (Gampaha Farmer)' },
    { id: 'user-prototype-002', label: '2. Nimali Perera (Kandy Tea Worker)' },
    { id: 'user-prototype-003', label: '3. Kasun Jayawardena (Matara Fisherman)' },
    { id: 'user-prototype-004', label: '4. Chamari Silva (Kurunegala Artisan)' },
    { id: 'custom', label: '✨ Enter Custom / Real Citizen Details' },
  ];

  return (
    <div className="presets-ribbon-container">
      <div className="presets-ribbon">
        <div className="ribbon-label">
          <span className="ribbon-badge">Registration Mode</span>
          <span className="ribbon-desc">Fill with Preset or Type Real Data:</span>
        </div>

        <div className="ribbon-controls">
          <select
            className="preset-select"
            value={activePreset}
            onChange={(e) => applyPreset(e.target.value)}
          >
            {presets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="btn-apply-preset"
            onClick={() => applyPreset(activePreset)}
          >
            📥 Apply Preset
          </button>

          <button
            type="button"
            className="btn-clear-preset"
            onClick={() => applyPreset('custom')}
          >
            Clear / New
          </button>
        </div>
      </div>
    </div>
  );
};
