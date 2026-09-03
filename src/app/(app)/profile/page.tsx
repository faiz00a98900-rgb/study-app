"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile, Subject } from "@/types";
import { User, BookOpen, Clock, Plus, Trash2, Save, Loader2 } from "lucide-react";

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [newExamDate, setNewExamDate] = useState("");
  const [saved, setSaved] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const [profileRes, subsRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("subjects").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      ]);
      if (profileRes.data) setProfile(profileRes.data);
      if (subsRes.data) setSubjects(subsRes.data);
      setLoading(false);
    }
    loadData();
  }, [supabase]);

  async function saveProfile() {
    if (!profile) return;
    setSaving(true);
    await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        academic_level: profile.academic_level,
        course: profile.course,
        study_hours_per_day: profile.study_hours_per_day,
        preferred_times: profile.preferred_times,
      })
      .eq("id", profile.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function addSubject() {
    if (!newSubject.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase
      .from("subjects")
      .insert({ user_id: user.id, name: newSubject.trim(), exam_date: newExamDate || null })
      .select()
      .single();
    if (data && !error) {
      setSubjects([data, ...subjects]);
      setNewSubject("");
      setNewExamDate("");
    }
  }

  async function deleteSubject(id: string) {
    await supabase.from("subjects").delete().eq("id", id);
    setSubjects(subjects.filter((s) => s.id !== id));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>
        <p className="text-muted mt-1">Manage your account and study preferences</p>
      </div>

      {/* Profile Info */}
      <div className="bg-card border border-card-border rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
            <User className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">{profile?.full_name}</h2>
            <p className="text-muted text-sm">Student Profile</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
            <input
              type="text"
              value={profile?.full_name || ""}
              onChange={(e) => setProfile(profile ? { ...profile, full_name: e.target.value } : null)}
              className="w-full px-4 py-3 bg-surface border border-card-border rounded-xl text-foreground focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Academic Level</label>
            <select
              value={profile?.academic_level || ""}
              onChange={(e) => setProfile(profile ? { ...profile, academic_level: e.target.value } : null)}
              className="w-full px-4 py-3 bg-surface border border-card-border rounded-xl text-foreground focus:outline-none focus:border-primary"
            >
              <option value="">Select level</option>
              <option value="high_school">High School</option>
              <option value="undergraduate">Undergraduate</option>
              <option value="graduate">Graduate</option>
              <option value="professional">Professional</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Course / Major</label>
            <input
              type="text"
              value={profile?.course || ""}
              onChange={(e) => setProfile(profile ? { ...profile, course: e.target.value } : null)}
              placeholder="e.g. Computer Science"
              className="w-full px-4 py-3 bg-surface border border-card-border rounded-xl text-foreground placeholder:text-muted/60 focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Study Hours / Day</label>
            <input
              type="number"
              min={1}
              max={16}
              value={profile?.study_hours_per_day || 2}
              onChange={(e) => setProfile(profile ? { ...profile, study_hours_per_day: parseInt(e.target.value) } : null)}
              className="w-full px-4 py-3 bg-surface border border-card-border rounded-xl text-foreground focus:outline-none focus:border-primary"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-2">Preferred Study Time</label>
            <select
              value={profile?.preferred_times || "morning"}
              onChange={(e) => setProfile(profile ? { ...profile, preferred_times: e.target.value } : null)}
              className="w-full px-4 py-3 bg-surface border border-card-border rounded-xl text-foreground focus:outline-none focus:border-primary"
            >
              <option value="morning">Morning (6 AM - 12 PM)</option>
              <option value="afternoon">Afternoon (12 PM - 5 PM)</option>
              <option value="evening">Evening (5 PM - 9 PM)</option>
              <option value="night">Night (9 PM - 12 AM)</option>
            </select>
          </div>
        </div>

        <button
          onClick={saveProfile}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-medium px-6 py-3 rounded-xl transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      {/* Subjects */}
      <div className="bg-card border border-card-border rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          Subjects
        </h2>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            placeholder="Subject name"
            className="flex-1 px-4 py-3 bg-surface border border-card-border rounded-xl text-foreground placeholder:text-muted/60 focus:outline-none focus:border-primary"
            onKeyDown={(e) => e.key === "Enter" && addSubject()}
          />
          <input
            type="date"
            value={newExamDate}
            onChange={(e) => setNewExamDate(e.target.value)}
            className="px-4 py-3 bg-surface border border-card-border rounded-xl text-foreground focus:outline-none focus:border-primary"
          />
          <button
            onClick={addSubject}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-medium px-5 py-3 rounded-xl transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>

        {subjects.length === 0 ? (
          <p className="text-muted text-sm text-center py-4">No subjects added yet.</p>
        ) : (
          <div className="space-y-3">
            {subjects.map((sub) => (
              <div key={sub.id} className="flex items-center justify-between bg-surface rounded-xl p-4 border border-card-border">
                <div>
                  <h3 className="font-medium text-foreground">{sub.name}</h3>
                  {sub.exam_date && (
                    <p className="text-xs text-muted flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" />
                      Exam: {new Date(sub.exam_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => deleteSubject(sub.id)}
                  className="text-muted hover:text-danger transition-colors p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
