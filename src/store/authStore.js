import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('alert_user') || 'null'),
  playerId: localStorage.getItem('alert_player_id') || null,

  setUser: (user) => {
    localStorage.setItem('alert_user', JSON.stringify(user));
    set({ user });
  },

  setPlayerId: (playerId) => {
    localStorage.setItem('alert_player_id', playerId);
    set({ playerId });
  },

  logout: () => {
    localStorage.removeItem('alert_user');
    localStorage.removeItem('alert_player_id');
    set({ user: null, playerId: null });
  }
}));

export default useAuthStore;
