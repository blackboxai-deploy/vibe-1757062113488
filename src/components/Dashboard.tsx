'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CodeAnalysisModule } from '@/components/modules/CodeAnalysisModule';
import { CodeReviewModule } from '@/components/modules/CodeReviewModule';
import { ExamGeneratorModule } from '@/components/modules/ExamGeneratorModule';

const translations = {
  en: {
    title: 'Educational AI Platform',
    subtitle: 'Advanced AI-powered educational tools for professors',
    logout: 'Logout',
    language: 'Language',
    codeAnalysis: 'Code Analysis',
    codeReview: 'Code Review',
    examGenerator: 'Exam Generator',
    codeAnalysisDesc: 'Generate questions from student code and evaluate answers',
    codeReviewDesc: 'Analyze code and provide improvement suggestions',
    examGeneratorDesc: 'Create randomized QCM exams from LaTeX subjects'
  },
  fr: {
    title: 'Plateforme IA Éducative',
    subtitle: 'Outils éducatifs avancés alimentés par IA pour professeurs',
    logout: 'Déconnexion',
    language: 'Langue',
    codeAnalysis: 'Analyse de Code',
    codeReview: 'Révision de Code',
    examGenerator: 'Générateur d\'Examen',
    codeAnalysisDesc: 'Générer des questions depuis le code étudiant et évaluer les réponses',
    codeReviewDesc: 'Analyser le code et fournir des suggestions d\'amélioration',
    examGeneratorDesc: 'Créer des examens QCM aléatoires depuis des sujets LaTeX'
  }
};

export const Dashboard = () => {
  const { logout, language, setLanguage } = useAuth();
  const [activeTab, setActiveTab] = useState('code-analysis');
  
  const t = translations[language];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
              <p className="text-sm text-gray-600">{t.subtitle}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{t.language}:</span>
                <Button
                  variant={language === 'en' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLanguage('en')}
                >
                  EN
                </Button>
                <Button
                  variant={language === 'fr' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLanguage('fr')}
                >
                  FR
                </Button>
              </div>
              <Button onClick={logout} variant="outline">
                {t.logout}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="code-analysis">{t.codeAnalysis}</TabsTrigger>
            <TabsTrigger value="code-review">{t.codeReview}</TabsTrigger>
            <TabsTrigger value="exam-generator">{t.examGenerator}</TabsTrigger>
          </TabsList>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className={`cursor-pointer transition-colors ${activeTab === 'code-analysis' ? 'ring-2 ring-blue-500' : ''}`}
                  onClick={() => setActiveTab('code-analysis')}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>{t.codeAnalysis}</span>
                  <Badge variant="secondary">Module 1</Badge>
                </CardTitle>
                <CardDescription>{t.codeAnalysisDesc}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600">
                  <p>• 10 AI-generated questions</p>
                  <p>• Student evaluation system</p>
                  <p>• Context-aware analysis</p>
                </div>
              </CardContent>
            </Card>

            <Card className={`cursor-pointer transition-colors ${activeTab === 'code-review' ? 'ring-2 ring-blue-500' : ''}`}
                  onClick={() => setActiveTab('code-review')}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>{t.codeReview}</span>
                  <Badge variant="secondary">Module 2</Badge>
                </CardTitle>
                <CardDescription>{t.codeReviewDesc}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600">
                  <p>• Improvement suggestions</p>
                  <p>• External helper questions</p>
                  <p>• Code quality analysis</p>
                </div>
              </CardContent>
            </Card>

            <Card className={`cursor-pointer transition-colors ${activeTab === 'exam-generator' ? 'ring-2 ring-blue-500' : ''}`}
                  onClick={() => setActiveTab('exam-generator')}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>{t.examGenerator}</span>
                  <Badge variant="secondary">Module 3</Badge>
                </CardTitle>
                <CardDescription>{t.examGeneratorDesc}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600">
                  <p>• LaTeX subject processing</p>
                  <p>• Question bank generation</p>
                  <p>• Randomized QCM creation</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Module Content */}
          <TabsContent value="code-analysis">
            <CodeAnalysisModule />
          </TabsContent>

          <TabsContent value="code-review">
            <CodeReviewModule />
          </TabsContent>

          <TabsContent value="exam-generator">
            <ExamGeneratorModule />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};