import React, { useState } from 'react';
import { useMidnight } from '../contexts/MidnightContext';
import { ShieldAlert, Award, Send, User, Mail, Calendar, Key } from 'lucide-react';

export const IssuerDashboard: React.FC = () => {
  const { issueNewCredential, isLoading } = useMidnight();
  const [formData, setFormData] = useState({
    id: '',
    type: 'Academic Degree',
    ownerName: '',
    studentID: '',
    employeeID: '',
    email: '',
    dateOfBirth: '',
    documentMetadata: 'Midnight Certified Graduate',
    secretVerificationData: 'secret-hash-key'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id || !formData.ownerName || !formData.email) {
      alert('Please fill out the required fields: Credential ID, Owner Name, and Email.');
      return;
    }

    try {
      const witness = {
        ownerName: formData.ownerName,
        studentID: formData.studentID || 'N/A',
        employeeID: formData.employeeID || 'N/A',
        email: formData.email,
        dateOfBirth: formData.dateOfBirth || 'N/A',
        documentMetadata: formData.documentMetadata || 'N/A',
        secretVerificationData: formData.secretVerificationData || 'N/A'
      };

      await issueNewCredential(formData.id, formData.type, witness);
      
      // Reset form
      setFormData({
        id: '',
        type: 'Academic Degree',
        ownerName: '',
        studentID: '',
        employeeID: '',
        email: '',
        dateOfBirth: '',
        documentMetadata: 'Midnight Certified Graduate',
        secretVerificationData: 'secret-hash-key'
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fade-in space-y-8 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-white">Issuer Portal</h2>
        <p className="text-sm text-slate-400">Issue new privacy-preserving credentials to students, employees, or members.</p>
      </div>

      <form onSubmit={handleSubmit} className="card bg-glass space-y-6">
        <div className="flex items-center gap-3 border-b border-white-5 pb-4">
          <Award className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-bold text-white">Issue Privacy-First Credential</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Public Metadata */}
          <div className="space-y-4">
            <h4 className="font-bold text-indigo-300 text-xs uppercase tracking-wider">Public Metadata (On-Chain)</h4>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5 font-medium">Credential Unique ID (Numeric) *</label>
                <input
                  type="number"
                  name="id"
                  value={formData.id}
                  onChange={handleChange}
                  placeholder="e.g. 1042"
                  className="input-field font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1.5 font-medium">Credential Type / Classification *</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="Academic Degree">Academic Degree</option>
                  <option value="Professional Certification">Professional Certification</option>
                  <option value="Employment Contract">Employment Contract</option>
                  <option value="Security Clearance">Security Clearance</option>
                  <option value="Government ID">Government ID</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1.5 font-medium">Public Description / Metadata</label>
                <input
                  type="text"
                  name="documentMetadata"
                  value={formData.documentMetadata}
                  onChange={handleChange}
                  placeholder="e.g. Magna Cum Laude Honours"
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Private Witness Fields */}
          <div className="space-y-4">
            <h4 className="font-bold text-violet-400 text-xs uppercase tracking-wider">Private Witness (Kept Local)</h4>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5 font-medium">Credential Owner Full Name *</label>
                <div className="relative">
                  <input
                    type="text"
                    name="ownerName"
                    value={formData.ownerName}
                    onChange={handleChange}
                    placeholder="e.g. Alice Vance"
                    className="input-field pl-9"
                    required
                  />
                  <User className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1.5 font-medium">Contact Email Address *</label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g. alice@university.edu"
                    className="input-field pl-9"
                    required
                  />
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-medium">Student ID</label>
                  <input
                    type="text"
                    name="studentID"
                    value={formData.studentID}
                    onChange={handleChange}
                    placeholder="e.g. STU-204"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-medium">Employee ID</label>
                  <input
                    type="text"
                    name="employeeID"
                    value={formData.employeeID}
                    onChange={handleChange}
                    placeholder="e.g. EMP-991"
                    className="input-field"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-medium">Date of Birth</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      placeholder="YYYY-MM-DD"
                      className="input-field pl-9"
                    />
                    <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-medium">Verification Key (Secret)</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="secretVerificationData"
                      value={formData.secretVerificationData}
                      onChange={handleChange}
                      placeholder="e.g. secret-key"
                      className="input-field pl-9"
                    />
                    <Key className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Warning Callout */}
        <div className="p-4 rounded-2xl bg-amber-500-5 border border-amber-500-10 flex gap-3 text-xs text-amber-300">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
          <p className="leading-relaxed">
            <strong>Warning:</strong> Upon submission, the platform client will derive a cryptographic zero-knowledge proof commitment hash of all the <em>Private Witness</em> fields. Only the hash and public metadata are stored on the ledger. The witness fields are compiled locally into the holder's browser vault cache.
          </p>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-white-5 flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>{isLoading ? 'Issuing Transaction...' : 'Issue Credential to Ledger'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
