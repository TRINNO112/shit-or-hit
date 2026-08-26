import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, X, Check } from 'lucide-react';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TimeClock } from '@mui/x-date-pickers/TimeClock';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Custom Streetwear Theme for MUI TimeClock
const muiClockTheme = createTheme({
  palette: {
    primary: {
      main: '#00E599', // Emerald accent
      contrastText: '#000000'
    },
    text: {
      primary: '#000000',
      secondary: '#4A5568'
    }
  },
  typography: {
    fontFamily: '"JetBrains Mono", "Plus Jakarta Sans", monospace'
  },
  components: {
    MuiTimeClock: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          border: '2.5px solid #000000',
          boxShadow: '3px 3px 0px #000000',
          padding: '8px',
          width: '280px',
          height: '280px'
        }
      }
    },
    MuiClockPointer: {
      styleOverrides: {
        root: {
          backgroundColor: '#000000',
          width: '3px'
        },
        thumb: {
          backgroundColor: '#00E599',
          border: '2.5px solid #000000',
          boxShadow: '1.5px 1.5px 0px #000000'
        }
      }
    },
    MuiClock: {
      styleOverrides: {
        pin: {
          backgroundColor: '#000000',
          width: '8px',
          height: '8px'
        }
      }
    },
    MuiClockNumber: {
      styleOverrides: {
        root: {
          fontFamily: '"JetBrains Mono", monospace',
          fontWeight: 900,
          color: '#000000',
          '&.Mui-selected': {
            backgroundColor: '#00E599 !important',
            color: '#000000 !important',
            fontWeight: 900,
            border: '2px solid #000000',
            boxShadow: '1px 1px 0px #000000'
          }
        }
      }
    }
  }
});

export default function RadialClockPicker({
  isOpen,
  onClose,
  initialTime = '21:00',
  onSave
}) {
  const [clockValue, setClockValue] = useState(() => {
    const [h, m] = (initialTime || '21:00').split(':');
    return dayjs().hour(Number(h) || 21).minute(Number(m) || 0).second(0);
  });

  if (!isOpen) return null;

  const handleConfirm = () => {
    const h = String(clockValue.hour()).padStart(2, '0');
    const m = String(clockValue.minute()).padStart(2, '0');
    onSave(`${h}:${m}`);
    onClose();
  };

  const handlePreset = (h, m = 0) => {
    setClockValue(dayjs().hour(h).minute(m).second(0));
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.92, y: 15 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.92, y: 15 }}
          className="w-full max-w-sm bg-[#FFFDF5] rounded-3xl border-3 border-black p-5 shadow-[8px_8px_0px_#000000] space-y-4 text-center select-none"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-black/10 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#FDC800] border-2 border-black flex items-center justify-center shadow-[1.5px_1.5px_0px_#000000]">
                <Clock className="w-4 h-4 text-black stroke-[2.5]" />
              </div>
              <h3 className="font-display font-black text-base uppercase text-black">
                Reminder Time
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white hover:bg-neutral-200 border-2 border-black cursor-pointer shadow-[1px_1px_0px_#000000] transition-all"
            >
              <X className="w-4 h-4 text-black stroke-[2.5]" />
            </button>
          </div>

          {/* Digital Time Display */}
          <div className="bg-neutral-100 border-2 border-black p-2.5 rounded-2xl flex items-center justify-center gap-3">
            <span className="font-mono text-xs font-black text-neutral-500 uppercase">SELECTED:</span>
            <span className="font-display font-black text-2xl text-black">
              {clockValue.format('hh:mm A')}
            </span>
          </div>

          {/* MUI TimeClock Provider */}
          <div className="flex items-center justify-center py-1">
            <ThemeProvider theme={muiClockTheme}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <TimeClock
                  value={clockValue}
                  onChange={(newVal) => setClockValue(newVal)}
                  showViewSwitcher
                />
              </LocalizationProvider>
            </ThemeProvider>
          </div>

          {/* Quick Presets */}
          <div className="grid grid-cols-4 gap-1.5 pt-1">
            {[
              { label: '8:00 PM', h: 20 },
              { label: '9:00 PM', h: 21 },
              { label: '10:00 PM', h: 22 },
              { label: '11:00 PM', h: 23 }
            ].map(item => (
              <button
                key={item.label}
                type="button"
                onClick={() => handlePreset(item.h, 0)}
                className={`py-1.5 rounded-xl border border-black font-mono text-[10px] font-black cursor-pointer transition-all ${
                  clockValue.hour() === item.h && clockValue.minute() === 0
                    ? 'bg-[#FDC800] text-black border-2 border-black shadow-[1.5px_1.5px_0px_#000000]'
                    : 'bg-white hover:bg-neutral-100 text-neutral-700'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Action Footer */}
          <div className="flex items-center gap-2.5 pt-2 border-t-2 border-black/10">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-black font-mono text-xs font-black rounded-xl border-2 border-black shadow-[1.5px_1.5px_0px_#000000] cursor-pointer"
            >
              CANCEL
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 py-2.5 bg-[#00E599] hover:bg-emerald-400 text-black font-display font-black text-xs uppercase rounded-xl border-3 border-black shadow-[2.5px_2.5px_0px_#000000] cursor-pointer"
            >
              SET TIME
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
