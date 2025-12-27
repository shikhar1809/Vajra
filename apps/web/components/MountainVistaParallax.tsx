'use client'

import React, { useMemo } from 'react';

// Data Configuration
const layersData = [
  { className: 'layer-6', speed: '120s', size: '222px', zIndex: 1, image: '6' },
  { className: 'layer-5', speed: '95s', size: '311px', zIndex: 1, image: '5' },
  { className: 'layer-4', speed: '75s', size: '468px', zIndex: 1, image: '4' },
  { className: 'bike-1', speed: '10s', size: '75px', zIndex: 2, image: 'bike', animation: 'parallax_bike', bottom: '100px', noRepeat: true },
  { className: 'bike-2', speed: '15s', size: '75px', zIndex: 2, image: 'bike', animation: 'parallax_bike', bottom: '100px', noRepeat: true },
  { className: 'layer-3', speed: '55s', size: '158px', zIndex: 3, image: '3' },
  { className: 'layer-2', speed: '30s', size: '145px', zIndex: 4, image: '2' },
  { className: 'layer-1', speed: '20s', size: '136px', zIndex: 5, image: '1' },
];

interface MountainVistaParallaxProps {
  title?: string;
  subtitle?: string;
}

const MountainVistaParallax: React.FC<MountainVistaParallaxProps> = ({ title = '', subtitle = '' }) => {
  // Generate dynamic CSS for each layer
  const dynamicStyles = useMemo(() => {
    return layersData
      .map(layer => {
        const url = `https://s3-us-west-2.amazonaws.com/s.cdpn.io/24650/${layer.image}.png`;
        return `
          .${layer.className} {
            background-image: url(${url});
            animation-duration: ${layer.speed};
            background-size: auto ${layer.size};
            z-index: ${layer.zIndex};
            ${layer.animation ? `animation-name: ${layer.animation};` : ''}
            ${layer.bottom ? `bottom: ${layer.bottom};` : ''}
            ${layer.noRepeat ? 'background-repeat: no-repeat;' : ''}
          }
        `;
      })
      .join('\n');
  }, []);

  return (
    <section
      className="hero-container"
      aria-label="An animated parallax landscape of mountains and cyclists."
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        zIndex: 0
      }}
    >
      {/* Base styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .parallax-layer {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background-position: bottom center;
          background-repeat: repeat-x;
          animation-name: parallax;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }

        @keyframes parallax {
          from {
            background-position-x: 0;
          }
          to {
            background-position-x: -2000px;
          }
        }

        @keyframes parallax_bike {
          from {
            background-position-x: 0;
          }
          to {
            background-position-x: -2000px;
          }
        }

        .hero-content {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          text-align: center;
          padding: 2rem;
        }

        .hero-title {
          font-size: 4rem;
          font-weight: bold;
          color: white;
          margin-bottom: 1rem;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        }

        .hero-subtitle {
          font-size: 1.5rem;
          color: rgba(255,255,255,0.9);
          text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
        }

        ${dynamicStyles}
      `}} />

      {/* Render each parallax layer */}
      {layersData.map(layer => (
        <div
          key={layer.className}
          className={`parallax-layer ${layer.className}`}
        />
      ))}

      {/* Hero text */}
      {(title || subtitle) && (
        <div className="hero-content">
          {title && <h1 className="hero-title">{title}</h1>}
          {subtitle && <p className="hero-subtitle">{subtitle}</p>}
        </div>
      )}
    </section>
  );
};

export default React.memo(MountainVistaParallax);
