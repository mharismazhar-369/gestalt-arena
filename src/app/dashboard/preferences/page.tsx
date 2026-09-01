"use client";

import React, { useState } from "react";
import { Save, AlertCircle } from "lucide-react";
import type { InvestorPreferences } from "@/types/schema";

export default function InvestorPreferencesPage() {
  // Mock data for initial UI
  const [preferences, setPreferences] = useState<Partial<InvestorPreferences>>({
    min_ticket: 50000,
    max_ticket: 500000,
    preferred_stages: ["Seed", "Series A"],
    industries: ["HealthTech", "AI", "Climate Tech"],
    geographies: ["North America", "Europe"],
    lead_investment: true,
    follow_on: true,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate save
    alert("Preferences saved successfully!");
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Investor Preferences</h1>
        <p className="text-muted-foreground">Customize your deal flow. We use these preferences to match you with highly relevant startup fundraising opportunities.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        <div className="bg-card border rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-6 border-b pb-4">Ticket Size</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Minimum Ticket Size ($)</label>
              <input 
                type="number" 
                value={preferences.min_ticket} 
                onChange={e => setPreferences({...preferences, min_ticket: Number(e.target.value)})}
                className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary/50 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Maximum Ticket Size ($)</label>
              <input 
                type="number" 
                value={preferences.max_ticket} 
                onChange={e => setPreferences({...preferences, max_ticket: Number(e.target.value)})}
                className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary/50 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-6 border-b pb-4">Target Criteria</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Preferred Stages</label>
              <div className="flex flex-wrap gap-3">
                {["Pre-Seed", "Seed", "Series A", "Series B", "Growth"].map(stage => (
                  <label key={stage} className="flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={preferences.preferred_stages?.includes(stage)}
                      onChange={(e) => {
                        const newStages = e.target.checked 
                          ? [...(preferences.preferred_stages || []), stage]
                          : preferences.preferred_stages?.filter(s => s !== stage);
                        setPreferences({...preferences, preferred_stages: newStages});
                      }}
                      className="rounded text-primary focus:ring-primary"
                    />
                    <span className="text-sm font-medium">{stage}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Industries (Comma separated for now)</label>
              <input 
                type="text" 
                value={preferences.industries?.join(", ")} 
                onChange={e => setPreferences({...preferences, industries: e.target.value.split(",").map(i => i.trim())})}
                className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary/50 outline-none"
                placeholder="e.g. AI, HealthTech, FinTech"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Geographies (Comma separated for now)</label>
              <input 
                type="text" 
                value={preferences.geographies?.join(", ")} 
                onChange={e => setPreferences({...preferences, geographies: e.target.value.split(",").map(i => i.trim())})}
                className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary/50 outline-none"
                placeholder="e.g. North America, Europe, Asia"
              />
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-6 border-b pb-4">Investment Behavior</h2>
          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="mt-0.5">
                <input 
                  type="checkbox" 
                  checked={preferences.lead_investment}
                  onChange={e => setPreferences({...preferences, lead_investment: e.target.checked})}
                  className="rounded text-primary focus:ring-primary w-4 h-4"
                />
              </div>
              <div>
                <span className="block font-medium">Willing to Lead</span>
                <span className="text-sm text-muted-foreground">You are comfortable pricing the round and issuing the term sheet.</span>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="mt-0.5">
                <input 
                  type="checkbox" 
                  checked={preferences.follow_on}
                  onChange={e => setPreferences({...preferences, follow_on: e.target.checked})}
                  className="rounded text-primary focus:ring-primary w-4 h-4"
                />
              </div>
              <div>
                <span className="block font-medium">Follow-on Capital</span>
                <span className="text-sm text-muted-foreground">You reserve capital for follow-on investments in subsequent rounds.</span>
              </div>
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button 
            type="submit"
            className="flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-all shadow-sm"
          >
            <Save className="w-5 h-5" /> Save Preferences
          </button>
        </div>
      </form>
    </div>
  );
}
