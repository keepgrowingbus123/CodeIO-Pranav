import { useCallback } from 'react'
import Particles from 'react-tsparticles'
import { loadFull } from 'tsparticles'

export default function ParticleBackground({ isDarkMode }) {
  const initializeParticles = useCallback(async (engine) => {
    await loadFull(engine)
  }, [])

  const options = {
    background: {
      color: {
        value: isDarkMode ? '#0b1020' : '#f8fafc',
      },
      opacity: isDarkMode ? 0.06 : 0.35,
    },
    fullScreen: {
      enable: false,
    },
    detectRetina: true,
    fpsLimit: 60,
    interactivity: {
      detectsOn: 'window',
      events: {
        onHover: {
          enable: true,
          mode: 'grab',
        },
        onClick: {
          enable: true,
          mode: 'repulse',
        },
        resize: {
          enable: true,
        },
      },
      modes: {
        grab: {
          distance: 140,
          links: {
            opacity: 0.45,
          },
        },
        repulse: {
          distance: 180,
          duration: 0.4,
        },
      },
    },
    particles: {
      color: {
        value: isDarkMode ? '#06b6d4' : '#334155',
      },
      links: {
        color: isDarkMode ? '#ffffff' : '#334155',
        distance: 150,
        enable: true,
        opacity: 0.22,
        width: 1,
      },
      move: {
        enable: true,
        speed: 0.6,
        outModes: {
          default: 'bounce',
        },
      },
      number: {
        density: {
          enable: true,
          area: 900,
        },
        value: 55,
      },
      opacity: {
        value: 0.45,
      },
      shape: {
        type: 'circle',
      },
      size: {
        value: {
          min: 1,
          max: 2,
        },
      },
    },
    pauseOnBlur: true,
    pauseOnOutsideViewport: true,
  }

  return (
    <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden="true">
      <Particles
        id="particle-background"
        className="h-full w-full"
        canvasClassName="pointer-events-none"
        init={initializeParticles}
        options={options}
        style={{ position: 'absolute', inset: 0 }}
      />
    </div>
  )
}
