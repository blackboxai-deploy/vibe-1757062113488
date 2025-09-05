'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const LoginForm = () => {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (login(passcode)) {
      // Successfully logged in
    } else {
      setError('Invalid passcode. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Educational AI Platform
          </CardTitle>
          <CardDescription className="text-center">
            Enter your professor passcode to access the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="passcode" className="text-sm font-medium">
                Passcode
              </label>
              <Input
                id="passcode"
                type="password"
                placeholder="Enter passcode"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                required
              />
            </div>
            
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <Button type="submit" className="w-full">
              Access Platform
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <div className="text-sm text-gray-600">
              <p className="mb-2">Platform Features:</p>
              <ul className="text-xs space-y-1">
                <li>• Code Analysis & Question Generation</li>
                <li>• Code Review & Improvements</li>
                <li>• AI Exam Generator (QCM)</li>
                <li>• Multi-language Support</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};