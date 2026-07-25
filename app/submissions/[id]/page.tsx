'use client'

import { useState } from 'react'
import Link from 'next/link'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Badge } from '@/components/badge'
import { ChevronLeft } from 'lucide-react'

const mockSubmission = {
  id: '1',
  student: 'Alex Chen',
  email: 'alex@example.com',
  class: 'Programming Fundamentals',
  module: 'Loops',
  problem: 'Fibonacci',
  submissionTime: '2024-01-15 14:30:45',
  flowchartUrl: '/flowchart-placeholder.png',
  automaticStatus: 'Completed',
  verdict: 'Correct',
  domjudgeId: 'submission-12345',
  generatedCode: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    
    if (n >= 1) cout << 0;
    if (n >= 2) cout << " 1";
    
    if (n > 2) {
        int a = 0, b = 1;
        for (int i = 2; i < n; i++) {
            int c = a + b;
            cout << " " << c;
            a = b;
            b = c;
        }
    }
    
    cout << endl;
    return 0;
}`,
  language: 'C++',
}

export default function SubmissionDetailPage() {
  const [verdict, setVerdict] = useState('Correct')
  const [feedback, setFeedback] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate save
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
  }

  return (
    <DashboardLayout
      title="Submission Review"
      subtitle="Review student flowchart and provide feedback"
    >
      <div className="space-y-6">
        {/* Back button */}
        <Link href="/review-requests">
          <button className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
            <ChevronLeft size={20} />
            <span>Back to Review Requests</span>
          </button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Student Information */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Student Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Name</p>
                  <p className="font-medium text-foreground">{mockSubmission.student}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Email</p>
                  <p className="font-medium text-foreground">{mockSubmission.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Class</p>
                  <p className="font-medium text-foreground">{mockSubmission.class}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Submission Time</p>
                  <p className="font-medium text-foreground">{mockSubmission.submissionTime}</p>
                </div>
              </div>
            </div>

            {/* Flowchart Section */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Flowchart Submission</h3>
              <div className="bg-secondary rounded-lg p-8 text-center">
                <div className="flex flex-col items-center justify-center gap-4">
                  <div className="w-48 h-48 bg-muted rounded-lg flex items-center justify-center text-muted-foreground text-sm">
                    [Flowchart Image Preview]
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90">
                      Zoom In
                    </button>
                    <button className="px-4 py-2 border border-border text-foreground rounded-lg text-sm font-medium hover:bg-secondary">
                      Full Screen
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Automatic Evaluation */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Automatic Evaluation</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant="success">{mockSubmission.automaticStatus}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Verdict</span>
                  <Badge variant="success">{mockSubmission.verdict}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">DOMjudge ID</span>
                  <span className="text-foreground font-mono text-sm">{mockSubmission.domjudgeId}</span>
                </div>
              </div>
            </div>

            {/* Generated Code */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Generated Code</h3>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Language</span>
                <span className="text-foreground font-medium">{mockSubmission.language}</span>
              </div>
              <pre className="bg-secondary p-4 rounded-lg overflow-x-auto text-xs text-foreground font-mono border border-border">
                {mockSubmission.generatedCode}
              </pre>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Teacher Review */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Teacher Review</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Verdict</label>
                  <select
                    value={verdict}
                    onChange={(e) => setVerdict(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="Correct">Correct</option>
                    <option value="Partially Correct">Partially Correct</option>
                    <option value="Needs Improvement">Needs Improvement</option>
                    <option value="Wrong">Wrong</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Feedback</label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Write feedback for the student..."
                    rows={6}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full px-4 py-2 bg-muted text-foreground rounded-lg text-sm font-medium hover:bg-secondary transition-colors disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'Save Draft'}
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {isSaving ? 'Publishing...' : 'Publish Review'}
                  </button>
                </div>
              </div>
            </div>

            {/* Problem Details */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Problem Details</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Module</p>
                  <p className="text-sm font-medium text-foreground">{mockSubmission.module}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Problem</p>
                  <p className="text-sm font-medium text-foreground">{mockSubmission.problem}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
