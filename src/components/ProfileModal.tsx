import React, { useState } from 'react';
import { UserProfile, ClassLevel } from '../types';
import { X, Camera, Check, Target, Award, School } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSave: (updated: UserProfile) => void;
  isFirstTime?: boolean;
}

const PRESET_AVATARS = [
  'https://api.dicebear.com/7.x/bottts/svg?seed=Shivam10&backgroundColor=b6e3f4',
  'https://api.dicebear.com/7.x/bottts/svg?seed=TopperBoy&backgroundColor=c0aede',
  'https://api.dicebear.com/7.x/bottts/svg?seed=ScholarGirl&backgroundColor=d1d4f9',
  'https://api.dicebear.com/7.x/bottts/svg?seed=ExamAce&backgroundColor=ffd5dc',
  'https://api.dicebear.com/7.x/bottts/svg?seed=RankOne&backgroundColor=ffdfbf',
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave,
  isFirstTime = false,
}) => {
  const [name, setName] = useState(profile.name || 'Shivam Kumar');
  const [classLevel, setClassLevel] = useState<ClassLevel>(profile.classLevel || '10');
  const [targetYear, setTargetYear] = useState(profile.targetYear || '2026');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl || PRESET_AVATARS[0]);
  const [goalDescription, setGoalDescription] = useState(
    profile.goalDescription || 'To score 95%+ and secure District/State Topper rank in UP Board Exams.'
  );
  const [schoolName, setSchoolName] = useState(profile.schoolName || 'Government Inter College');
  const [targetScorePercent, setTargetScorePercent] = useState<number>(profile.targetScorePercent || 95);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setAvatarUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: name.trim() || 'UP Board Aspirant',
      classLevel,
      targetYear,
      avatarUrl,
      goalDescription: goalDescription.trim(),
      schoolName: schoolName.trim(),
      targetScorePercent,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {isFirstTime ? 'Set Up Candidate Profile' : 'Candidate Profile'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Practice official UP Board handwritten examination series
              </p>
            </div>
          </div>
          {!isFirstTime && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Avatar Section */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Candidate Photo / Avatar
            </label>
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-orange-500 shadow-xs bg-slate-100 dark:bg-slate-800 shrink-0">
                <img
                  src={avatarUrl}
                  alt={name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                    <Camera className="w-3.5 h-3.5 text-orange-500" />
                    <span>Upload Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[11px] text-slate-400">or choose avatar below</span>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto py-1">
                  {PRESET_AVATARS.map((av, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatarUrl(av)}
                      className={`w-8 h-8 rounded-full overflow-hidden border transition-all shrink-0 ${
                        avatarUrl === av
                          ? 'border-orange-500 ring-2 ring-orange-500/30'
                          : 'border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={av} alt="preset" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Full Candidate Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Shivam Kumar"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>

          {/* Class Level & Target Year */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Target Class
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setClassLevel('10')}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition-all ${
                    classLevel === '10'
                      ? 'bg-orange-500 text-white border-orange-500 shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  Class 10th
                </button>
                <button
                  type="button"
                  onClick={() => setClassLevel('12')}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition-all ${
                    classLevel === '12'
                      ? 'bg-orange-500 text-white border-orange-500 shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  Class 12th
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Target Exam Year
              </label>
              <select
                value={targetYear}
                onChange={(e) => setTargetYear(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-orange-500"
              >
                <option value="2026">2026 Board</option>
                <option value="2027">2027 Board</option>
              </select>
            </div>
          </div>

          {/* School / College Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              School / College Name
            </label>
            <div className="relative">
              <School className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="e.g. Government Inter College, Prayagraj"
                className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>
          </div>

          {/* Target Score Percentage */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-orange-500" />
                <span>Target Board Score</span>
              </label>
              <span className="text-xs font-mono font-bold text-orange-600 dark:text-orange-400">
                {targetScorePercent}%
              </span>
            </div>
            <input
              type="range"
              min="75"
              max="99"
              value={targetScorePercent}
              onChange={(e) => setTargetScorePercent(Number(e.target.value))}
              className="w-full accent-orange-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>75% (1st Div)</span>
              <span>85% (Distinction)</span>
              <span>95%+ (State Topper)</span>
            </div>
          </div>

          {/* Goal & Motivation Description ("Tum kyon is website per Aaye Ho") */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Why did you come to ShiTest? (Goal & Commitment)
            </label>
            <textarea
              rows={3}
              value={goalDescription}
              onChange={(e) => setGoalDescription(e.target.value)}
              placeholder="e.g. To write in my actual physical copy within 3 hours 15 minutes, get accurate AI grading, and score 95%+ in UP Board 2026."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 leading-relaxed resize-none"
            />
          </div>

          {/* Submit Actions */}
          <div className="pt-2 flex items-center gap-3">
            {!isFirstTime && (
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-md shadow-orange-600/20 active:scale-98 transition-all flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{isFirstTime ? 'Save & Start Practice' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
