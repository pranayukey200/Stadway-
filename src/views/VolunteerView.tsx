import React, { useState, useEffect } from 'react';
import { db } from '../utils/firebase';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { type VolunteerTask } from '../context/useStore';
import { CheckCircle, ShieldAlert, User, RefreshCw, Languages, Navigation } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Volunteer {
  id: string;
  name: string;
  languages: string[];
  skills: string[];
  currentZone: string;
  available: boolean;
}

export const VolunteerView: React.FC = () => {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [selectedVol, setSelectedVol] = useState<Volunteer | null>(null);
  const [tasks, setTasks] = useState<VolunteerTask[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Load volunteers
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'volunteers'), (snapshot) => {
      const list: Volunteer[] = [];
      snapshot.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() } as Volunteer);
      });
      setVolunteers(list);
      if (list.length > 0 && !selectedVol) {
        setSelectedVol(list[1]); // Default to Priya Patel
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Listen to tasks
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'volunteerTasks'), (snapshot) => {
      const list: VolunteerTask[] = [];
      snapshot.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() } as VolunteerTask);
      });
      // Sort tasks by date (newest first)
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setTasks(list);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="glass-panel p-8 rounded-2xl flex flex-col items-center justify-center text-gray-400 max-w-lg mx-auto my-8">
        <RefreshCw className="animate-spin text-accent-purple mb-2" />
        <p>Connecting to operations center...</p>
      </div>
    );
  }

  // Handle Accept
  const acceptTask = async (taskId: string) => {
    if (!selectedVol) return;
    try {
      await updateDoc(doc(db, 'volunteerTasks', taskId), {
        status: 'accepted',
        matchedVolunteerId: selectedVol.id
      });
      confetti({
        particleCount: 40,
        spread: 40,
        origin: { y: 0.6 }
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Complete
  const completeTask = async (taskId: string) => {
    try {
      await updateDoc(doc(db, 'volunteerTasks', taskId), {
        status: 'completed'
      });
      confetti({
        particleCount: 60,
        spread: 60,
        colors: ['#06b6d4', '#10b981']
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Filter tasks based on selected volunteer language and skills
  const matchedTasks = tasks.filter(t => {
    if (!selectedVol) return false;
    
    // Status filters
    if (t.status === 'completed') return false;
    
    // If accepted by someone else, don't show
    if (t.status === 'accepted' && t.matchedVolunteerId !== selectedVol.id) return false;
    
    // Check language match
    const langMatch = selectedVol.languages.includes(t.requestedLanguage) || t.requestedLanguage === 'English';
    return langMatch;
  });

  return (
    <div className="max-w-4xl mx-auto my-6 grid grid-cols-1 md:grid-cols-3 gap-6">
      
      {/* VOLUNTEER IDENTITY PANEL */}
      <div className="md:col-span-1 space-y-6">
        <div className="glass-panel p-5 rounded-2xl border border-purple-500/10 text-left space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="text-accent-cyan" />
            <h3 className="font-display font-semibold text-white">Active Responder</h3>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1.5">Select Profile</label>
            <select
              value={selectedVol?.id || ''}
              onChange={(e) => {
                const vol = volunteers.find(v => v.id === e.target.value);
                if (vol) setSelectedVol(vol);
              }}
              className="w-full bg-navy-950/60 border border-navy-700/60 p-2 rounded-xl text-xs text-white"
            >
              {volunteers.map(v => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>

          {selectedVol && (
            <div className="space-y-3.5 pt-2 text-xs">
              <div className="bg-navy-950/40 border border-navy-800/80 p-2.5 rounded-xl">
                <span className="block text-[10px] text-gray-500 font-semibold mb-1 uppercase">Languages Spoken</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedVol.languages.map(lang => (
                    <span key={lang} className="text-[10px] bg-cyan-950/40 text-cyan-400 border border-cyan-500/25 px-2 py-0.5 rounded-lg flex items-center gap-1 font-semibold">
                      <Languages size={10} /> {lang}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-navy-950/40 border border-navy-800/80 p-2.5 rounded-xl">
                <span className="block text-[10px] text-gray-500 font-semibold mb-1 uppercase">Skills & Roles</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedVol.skills.map(skill => (
                    <span key={skill} className="text-[10px] bg-purple-950/40 text-accent-light border border-purple-500/25 px-2 py-0.5 rounded-lg font-semibold">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center text-xs px-1">
                <span className="text-gray-400">Current Station:</span>
                <span className="font-semibold text-white flex items-center gap-1">
                  <Navigation size={12} className="text-accent-pink" />
                  {selectedVol.currentZone.replace('_', ' ')}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* DISPATCH QUEUE */}
      <div className="md:col-span-2 space-y-4 text-left">
        <div className="flex justify-between items-center px-1">
          <div className="flex items-center gap-2">
            <ShieldAlert className="text-rose-500" size={20} />
            <h3 className="font-display font-semibold text-white text-lg">Smart Dispatch Queue</h3>
          </div>
          <span className="text-xs bg-navy-800 border border-navy-700/60 px-2.5 py-1 rounded-full text-gray-400 font-semibold">
            {matchedTasks.length} Live Tasks
          </span>
        </div>

        {matchedTasks.length === 0 ? (
          <div className="glass-panel p-10 rounded-2xl border border-navy-800 flex flex-col items-center justify-center text-center space-y-3">
            <CheckCircle className="text-accent-emerald animate-pulse" size={32} />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-white">Queue Clear</p>
              <p className="text-xs text-gray-500">No active incidents require language matches or waypoint dispatch.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {matchedTasks.map(task => {
              const isAccepted = task.status === 'accepted';
              return (
                <div 
                  key={task.id} 
                  className={`glass-panel p-5 rounded-2xl border transition-all duration-300 ${
                    isAccepted 
                      ? 'border-cyan-500/30 shadow-lg shadow-cyan-500/5' 
                      : 'border-rose-500/20 hover:border-rose-500/30'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex flex-wrap gap-2">
                      <span className="text-[10px] uppercase font-bold bg-rose-950 text-rose-400 border border-rose-800 px-2 py-0.5 rounded">
                        {task.requiredSkill}
                      </span>
                      <span className="text-[10px] uppercase font-bold bg-cyan-950 text-cyan-400 border border-cyan-800 px-2 py-0.5 rounded">
                        Language: {task.requestedLanguage}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono">
                      {new Date(task.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-sm text-gray-100 font-medium mb-4">
                    {task.description}
                  </p>

                  <div className="flex items-center justify-between border-t border-navy-800 pt-3.5">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Navigation size={12} className="text-accent-pink animate-pulse" />
                      Dispatch target: <span className="font-semibold text-white">{task.location}</span>
                    </div>

                    <div className="flex gap-2">
                      {isAccepted ? (
                        <button
                          onClick={() => completeTask(task.id)}
                          className="px-4 py-2 bg-gradient-to-r from-accent-emerald to-cyan-500 hover:from-accent-emerald hover:to-cyan-600 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                        >
                          Mark Completed
                        </button>
                      ) : (
                        <button
                          onClick={() => acceptTask(task.id)}
                          className="px-4 py-2 bg-gradient-to-r from-accent-purple to-accent-pink hover:from-accent-violet hover:to-accent-pink text-white text-xs font-bold rounded-xl transition cursor-pointer"
                        >
                          Accept Dispatch
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
