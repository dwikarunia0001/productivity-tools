// src/lib/timerUtils.js

export const saveTimerState = ({ mode, startTime, duration, isRunning }) => {
  try {
    localStorage.setItem('pomodoroState', JSON.stringify({
      mode,
      startTime,
      duration,
      isRunning,
      savedAt: Date.now()
    }));
  } catch (e) {
    console.warn('Gagal menyimpan state ke localStorage');
  }
};

export const loadTimerState = () => {
  try {
    const saved = localStorage.getItem('pomodoroState');
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    return null;
  }
};

export const calculateTimeLeft = (startTime, duration) => {
  const elapsed = Date.now() - startTime;
  return Math.max(0, duration - Math.floor(elapsed / 1000));
};