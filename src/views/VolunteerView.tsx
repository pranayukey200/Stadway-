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
      <div className="glass-panel p-8 rounded-3xl border-4 border-[#0E7C3A] bg-[#FAF7F0] shadow-[6px_6px_0px_0px_#0B1120] flex flex-col items-center justify-center text-[#0B1120] max-w-lg mx-auto my-8">
        <RefreshCw className="animate-spin text-[#16A34A] mb-2" />
        <p className="font-bold uppercase tracking-wider text-xs">Connecting to operations center...</p>
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
        colors: ['#16A34A', '#0EA5E9']
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
    <div className="max-w-4xl mx-auto my-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-left font-sans">
      
      {/* VOLUNTEER IDENTITY PANEL */}
      <div className="md:col-span-1 space-y-6">
        <div className="glass-panel p-5 rounded-3xl border-4 border-[#0E7C3A] bg-[#FAF7F0] shadow-[6px_6px_0px_0px_#0B1120] text-left space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="text-[#16A34A]" />
            <h3 className="font-display font-black text-[#0B1120] uppercase text-base">Active Responder</h3>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-black text-[#0B1120]/70 mb-1.5">Select Profile</label>
            <select
              value={selectedVol?.id || ''}
              onChange={(e) => {
                const vol = volunteers.find(v => v.id === e.target.value);
                if (vol) setSelectedVol(vol);
              }}
              className="w-full bg-white border-4 border-[#0B1120] p-2 rounded-xl text-xs text-[#0B1120] font-bold focus:outline-none focus:border-[#16A34A]"
            >
              {volunteers.map(v => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>

          {selectedVol && (
            <div className="space-y-3.5 pt-2 text-xs">
              <div className="bg-white border-4 border-[#0B1120] p-2.5 rounded-xl shadow-[2px_2px_0px_0px_#0B1120]">
                <span className="block text-[10px] text-[#0B1120]/70 font-black mb-1 uppercase">Languages Spoken</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedVol.languages.map(lang => (
                    <span key={lang} className="text-[10px] bg-[#EAF3EC] text-[#16A34A] border-2 border-[#0B1120] px-2 py-0.5 rounded-lg flex items-center gap-1 font-black">
                      <Languages size={10} /> {lang}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-white border-4 border-[#0B1120] p-2.5 rounded-xl shadow-[2px_2px_0px_0px_#0B1120]">
                <span className="block text-[10px] text-[#0B1120]/70 font-black mb-1 uppercase">Skills & Roles</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedVol.skills.map(skill => (
                    <span key={skill} className="text-[10px] bg-[#FAF7F0] text-[#D4A017] border-2 border-[#0B1120] px-2 py-0.5 rounded-lg font-black">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center text-xs px-1 pt-1.5 border-t-2 border-[#0B1120]">
                <span className="text-[#0B1120]/70 font-black uppercase">Current Station:</span>
                <span className="font-bold text-[#0B1120] flex items-center gap-1">
                  <Navigation size={12} className="text-[#D4A017]" />
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
            <ShieldAlert className="text-[#E5399A]" size={20} />
            <h3 className="font-display font-black text-[#0B1120] text-lg uppercase leading-none">Smart Dispatch Queue</h3>
          </div>
          <span className="text-xs bg-[#EAF3EC] border-4 border-[#0E7C3A] px-3 py-1 rounded-full text-[#0B1120] font-black uppercase">
            {matchedTasks.length} Live Tasks
          </span>
        </div>

        {matchedTasks.length === 0 ? (
          <div className="glass-panel p-10 rounded-3xl border-4 border-[#0E7C3A] bg-[#FAF7F0] shadow-[6px_6px_0px_0px_#0B1120] flex flex-col items-center justify-center text-center space-y-3">
            <CheckCircle className="text-[#16A34A] animate-pulse" size={32} />
            <div className="space-y-1">
              <p className="text-sm font-display font-black text-[#0B1120] uppercase">Queue Clear</p>
              <p className="text-xs text-[#0B1120]/60 font-semibold">No active incidents require language matches or waypoint dispatch.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {matchedTasks.map(task => {
              const isAccepted = task.status === 'accepted';
              return (
                <div 
                  key={task.id} 
                  className={`glass-panel p-5 rounded-3xl border-4 transition-all duration-300 ${
                    isAccepted 
                      ? 'border-[#16A34A] bg-[#EAF3EC] shadow-[6px_6px_0px_0px_#0B1120]' 
                      : 'border-[#0B1120] bg-white shadow-[6px_6px_0px_0px_#E5399A]'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex flex-wrap gap-2">
                      <span className="text-[10px] uppercase font-black bg-[#EAF3EC] text-[#E5399A] border-2 border-[#0B1120] px-2 py-0.5 rounded-full">
                        {task.requiredSkill}
                      </span>
                      <span className="text-[10px] uppercase font-black bg-[#EAF3EC] text-[#16A34A] border-2 border-[#0B1120] px-2 py-0.5 rounded-full">
                        Language: {task.requestedLanguage}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#0B1120]/60 font-mono font-bold">
                      {new Date(task.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-sm text-[#0B1120] font-bold mb-4 leading-snug">
                    {task.description}
                  </p>

                  <div className="flex items-center justify-between border-t-2 border-[#0B1120] pt-3.5">
                    <div className="flex items-center gap-1 text-xs text-[#0B1120]/70 font-black uppercase">
                      <Navigation size={12} className="text-[#D4A017] animate-pulse" />
                      Dispatch target: <span className="font-bold text-[#0B1120]">{task.location}</span>
                    </div>

                    <div className="flex gap-2">
                      {isAccepted ? (
                        <button
                          onClick={() => completeTask(task.id)}
                          className="px-4 py-2 bg-[#16A34A] text-white border-4 border-[#0B1120] text-xs font-black rounded-full shadow-[2px_2px_0px_0px_#0B1120] hover:translate-y-[-1px] transition cursor-pointer uppercase tracking-wider"
                        >
                          Mark Completed
                        </button>
                      ) : (
                        <button
                          onClick={() => acceptTask(task.id)}
                          className="px-4 py-2 bg-[#D4A017] text-white border-4 border-[#0B1120] text-xs font-black rounded-full shadow-[2px_2px_0px_0px_#0B1120] hover:translate-y-[-1px] transition cursor-pointer uppercase tracking-wider"
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
