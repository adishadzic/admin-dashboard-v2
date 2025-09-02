'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { addStudent } from '@/lib/studentsRepo';
import type { StudentYear } from '@/types/student';

type Props = { open: boolean; onOpenChange: (v: boolean) => void; };
const YEARS: StudentYear[] = [1, 2, 3, 4, 5];

export default function AddStudentDialog({ open, onOpenChange }: Props) {
  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [jmbag, setJmbag] = React.useState('');             // ⬅️ NOVO
  const [year, setYear] = React.useState<StudentYear>(1);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');

  function isValidEmail(v: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  function isValidJmbag(v: string) {
    return /^[0-9]{10}$/.test(v); // točno 10 znamenki
  }

  async function handleSave() {
    setError('');
    if (!fullName.trim()) return setError('Unesi ime i prezime.');
    if (!isValidEmail(email)) return setError('Unesi ispravan email.');
    if (!isValidJmbag(jmbag)) return setError('Unesi ispravan JMBAG (samo znamenke).');

    setSaving(true);
    try {
      await addStudent({
        fullName: fullName.trim(),
        email: email.trim(),
        jmbag: jmbag.trim(),       // ⬅️ NOVO
        year,
      });
      // reset + close
      setFullName('');
      setEmail('');
      setJmbag('');               // ⬅️ NOVO
      setYear(1);
      onOpenChange(false);
    } catch {
      setError('Greška pri spremanju. Pokušaj ponovno.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Dodaj studenta</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Ime i prezime</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Npr. Nikola Tanković"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="ime.prezime@unipu.hr"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">JMBAG</label>
            <input
              type="text"
              inputMode="numeric"
              value={jmbag}
              onChange={(e) => setJmbag(e.target.value.replace(/\D/g, ''))}
              className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="npr. 0012345678"
              maxLength={10}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Godina studija</label>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value) as StudentYear)}
              className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}. godina
                </option>
              ))}
            </select>
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Odustani
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Spremam…' : 'Spremi'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
