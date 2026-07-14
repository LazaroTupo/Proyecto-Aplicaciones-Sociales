import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { usersService, User, UpdateUserPayload, PublicUser } from '../services/users';
import { toast } from 'sonner';

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMe = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await usersService.getMe();
      setUser(data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Error fetching user profile');
      } else {
        setError('Error fetching user profile');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMe();
  }, [fetchMe]);

  const updateProfile = async (payload: UpdateUserPayload) => {
    try {
      const data = await usersService.updateMe(payload);
      setUser(data);
      toast.success('Perfil actualizado correctamente', {
        className: 'bg-green-500/10 border-green-500/20 text-green-400 backdrop-blur-md'
      });
      return true;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || 'Error al actualizar el perfil', {
          className: 'bg-red-500/10 border-red-500/20 text-red-400 backdrop-blur-md'
        });
      } else {
        toast.error('Error al actualizar el perfil', {
          className: 'bg-red-500/10 border-red-500/20 text-red-400 backdrop-blur-md'
        });
      }
      return false;
    }
  };

  return { user, loading, error, updateProfile, refetchUser: fetchMe };
};

export const usePublicProfile = (id: string) => {
  const [profile, setProfile] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [is404, setIs404] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        setIs404(false);
        const data = await usersService.getPublicProfile(id);
        setProfile(data);
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 404) {
            setIs404(true);
          } else {
            setError(err.response?.data?.message || 'Error fetching public profile');
          }
        } else {
          setError('Error fetching public profile');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  return { profile, loading, error, is404 };
};
