'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Improvement {
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  suggestion: string;
  codeExample?: string;
}

interface HelperQuestion {
  question: string;
  purpose: string;
  category: string;
}

interface ReviewResult {
  improvements: Improvement[];
  helperQuestions: HelperQuestion[];
  overallScore: number;
  summary: string;
}

const translations = {
  en: {
    title: 'Code Review & Improvement Suggestions',
    description: 'Analyze code quality and provide improvement recommendations',
    codeInput: 'Student Code Input',
    codePlaceholder: 'Paste the student code here...',
    specifications: 'Project Specifications (Optional)',
    specPlaceholder: 'Enter project requirements, coding standards, or norms...',
    analyzeCode: 'Analyze Code',
    improvements: 'Improvements',
    helperQuestions: 'Helper Questions',
    summary: 'Summary',
    loading: 'Analyzing...',
    error: 'Error occurred',
    severity: 'Severity',
    category: 'Category',
    suggestion: 'Suggestion',
    codeExample: 'Code Example',
    purpose: 'Purpose',
    overallScore: 'Overall Code Quality',
    critical: 'Critical',
    high: 'High',
    medium: 'Medium',
    low: 'Low'
  },
  fr: {
    title: 'Révision de Code et Suggestions d\'Amélioration',
    description: 'Analyser la qualité du code et fournir des recommandations d\'amélioration',
    codeInput: 'Saisie du Code Étudiant',
    codePlaceholder: 'Collez le code étudiant ici...',
    specifications: 'Spécifications du Projet (Optionnel)',
    specPlaceholder: 'Entrez les exigences du projet, normes de codage, ou standards...',
    analyzeCode: 'Analyser le Code',
    improvements: 'Améliorations',
    helperQuestions: 'Questions d\'Aide',
    summary: 'Résumé',
    loading: 'Analyse...',
    error: 'Erreur survenue',
    severity: 'Sévérité',
    category: 'Catégorie',
    suggestion: 'Suggestion',
    codeExample: 'Exemple de Code',
    purpose: 'Objectif',
    overallScore: 'Qualité Globale du Code',
    critical: 'Critique',
    high: 'Élevé',
    medium: 'Moyen',
    low: 'Faible'
  }
};

export const CodeReviewModule = () => {
  const { language } = useAuth();
  const [code, setCode] = useState('');
  const [specifications, setSpecifications] = useState('');
  const [reviewResult, setReviewResult] = useState<ReviewResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  
  const t = translations[language];

  const analyzeCode = async () => {
    if (!code.trim()) return;
    
    setIsAnalyzing(true);
    setError('');
    setReviewResult(null);

    try {
      const response = await fetch('/api/code-review/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          specifications: specifications.trim() || null,
          language: language
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setReviewResult(data.result);
      } else {
        setError(data.error || 'Failed to analyze code');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    if (score >= 4) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t.title}</CardTitle>
          <CardDescription>{t.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="code-input">{t.codeInput}</Label>
            <Textarea
              id="code-input"
              placeholder={t.codePlaceholder}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="min-h-[200px] font-mono"
            />
          </div>
          
          <div>
            <Label htmlFor="spec-input">{t.specifications}</Label>
            <Textarea
              id="spec-input"
              placeholder={t.specPlaceholder}
              value={specifications}
              onChange={(e) => setSpecifications(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          
          <Button 
            onClick={analyzeCode} 
            disabled={!code.trim() || isAnalyzing}
            className="w-full"
          >
            {isAnalyzing ? t.loading : t.analyzeCode}
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Review Results */}
      {reviewResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Code Review Results
              <Badge variant="outline" className={`text-lg px-3 py-1 ${getScoreColor(reviewResult.overallScore)}`}>
                {t.overallScore}: {reviewResult.overallScore}/10
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="improvements" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="improvements">{t.improvements}</TabsTrigger>
                <TabsTrigger value="helper-questions">{t.helperQuestions}</TabsTrigger>
                <TabsTrigger value="summary">{t.summary}</TabsTrigger>
              </TabsList>

              <TabsContent value="improvements" className="space-y-4">
                {reviewResult.improvements.length > 0 ? (
                  reviewResult.improvements.map((improvement, index) => (
                    <div key={index} className={`p-4 border rounded-lg ${getSeverityColor(improvement.severity)}`}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{improvement.category}</h4>
                        <Badge className={getSeverityColor(improvement.severity)}>
                          {t[improvement.severity as keyof typeof t] || improvement.severity}
                        </Badge>
                      </div>
                      <p className="text-sm mb-2">{improvement.description}</p>
                      <div className="bg-white bg-opacity-50 p-3 rounded mb-2">
                        <strong className="text-sm">{t.suggestion}:</strong>
                        <p className="text-sm mt-1">{improvement.suggestion}</p>
                      </div>
                      {improvement.codeExample && (
                        <div className="bg-gray-900 text-gray-100 p-3 rounded font-mono text-sm">
                          <strong className="text-gray-300">{t.codeExample}:</strong>
                          <pre className="mt-1 whitespace-pre-wrap">{improvement.codeExample}</pre>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 text-center py-8">No improvements needed - excellent code quality!</p>
                )}
              </TabsContent>

              <TabsContent value="helper-questions" className="space-y-4">
                {reviewResult.helperQuestions.length > 0 ? (
                  reviewResult.helperQuestions.map((question, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">{question.category}</Badge>
                      </div>
                      <h4 className="font-medium mb-2">{question.question}</h4>
                      <div className="text-sm text-gray-600">
                        <strong>{t.purpose}:</strong> {question.purpose}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 text-center py-8">No helper questions generated</p>
                )}
              </TabsContent>

              <TabsContent value="summary" className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Analysis Summary</h4>
                  <p className="text-sm leading-relaxed">{reviewResult.summary}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg text-center">
                    <h5 className="font-medium mb-1">Improvements Found</h5>
                    <p className="text-2xl font-bold">{reviewResult.improvements.length}</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <h5 className="font-medium mb-1">Helper Questions</h5>
                    <p className="text-2xl font-bold">{reviewResult.helperQuestions.length}</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};