'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface Question {
  id: number;
  question: string;
  difficulty: 'easy' | 'medium' | 'hard';
  expectedAnswer?: string;
  studentAnswer?: string;
}

interface EvaluationResult {
  question: string;
  studentAnswer: string;
  score: number;
  feedback: string;
}

const translations = {
  en: {
    title: 'Code Analysis & Question Generation',
    description: 'Analyze student code and generate evaluation questions',
    codeInput: 'Student Code Input',
    codePlaceholder: 'Paste the student code here...',
    generateQuestions: 'Generate Questions',
    answersTitle: 'Student Answers',
    answerPlaceholder: 'Student answer here...',
    evaluateAnswers: 'Evaluate Answers',
    results: 'Evaluation Results',
    score: 'Score',
    feedback: 'Feedback',
    difficulty: 'Difficulty',
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
    loading: 'Processing...',
    error: 'Error occurred',
    finalScore: 'Final Score'
  },
  fr: {
    title: 'Analyse de Code et Génération de Questions',
    description: 'Analyser le code étudiant et générer des questions d\'évaluation',
    codeInput: 'Saisie du Code Étudiant',
    codePlaceholder: 'Collez le code étudiant ici...',
    generateQuestions: 'Générer les Questions',
    answersTitle: 'Réponses de l\'Étudiant',
    answerPlaceholder: 'Réponse de l\'étudiant ici...',
    evaluateAnswers: 'Évaluer les Réponses',
    results: 'Résultats de l\'Évaluation',
    score: 'Score',
    feedback: 'Commentaire',
    difficulty: 'Difficulté',
    easy: 'Facile',
    medium: 'Moyen',
    hard: 'Difficile',
    loading: 'Traitement...',
    error: 'Erreur survenue',
    finalScore: 'Score Final'
  }
};

export const CodeAnalysisModule = () => {
  const { language } = useAuth();
  const [code, setCode] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [evaluationResults, setEvaluationResults] = useState<EvaluationResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState('');
  
  const t = translations[language];

  const generateQuestions = async () => {
    if (!code.trim()) return;
    
    setIsGenerating(true);
    setError('');

    try {
      const response = await fetch('/api/code-analysis/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          language: language
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setQuestions(data.questions);
      } else {
        setError(data.error || 'Failed to generate questions');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const evaluateAnswers = async () => {
    const answeredQuestions = questions.filter(q => q.studentAnswer?.trim());
    if (answeredQuestions.length === 0) return;

    setIsEvaluating(true);
    setError('');

    try {
      const response = await fetch('/api/code-analysis/evaluate-answers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          questions: answeredQuestions,
          language: language
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setEvaluationResults(data.results);
      } else {
        setError(data.error || 'Failed to evaluate answers');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setIsEvaluating(false);
    }
  };

  const updateStudentAnswer = (questionId: number, answer: string) => {
    setQuestions(prev => 
      prev.map(q => 
        q.id === questionId ? { ...q, studentAnswer: answer } : q
      )
    );
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateFinalScore = () => {
    if (evaluationResults.length === 0) return 0;
    const totalScore = evaluationResults.reduce((sum, result) => sum + result.score, 0);
    return Math.round((totalScore / evaluationResults.length) * 10) / 10;
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
          
          <Button 
            onClick={generateQuestions} 
            disabled={!code.trim() || isGenerating}
            className="w-full"
          >
            {isGenerating ? t.loading : t.generateQuestions}
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Generated Questions */}
      {questions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t.answersTitle}</CardTitle>
            <CardDescription>
              {questions.length} questions generated
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {questions.map((question, index) => (
              <div key={question.id} className="space-y-2">
                <div className="flex items-start justify-between">
                  <h4 className="font-medium">
                    Question {index + 1}
                  </h4>
                  <Badge className={getDifficultyColor(question.difficulty)}>
                    {t[question.difficulty as keyof typeof t] || question.difficulty}
                  </Badge>
                </div>
                <p className="text-sm text-gray-700">{question.question}</p>
                <Textarea
                  placeholder={t.answerPlaceholder}
                  value={question.studentAnswer || ''}
                  onChange={(e) => updateStudentAnswer(question.id, e.target.value)}
                  className="min-h-[80px]"
                />
                {index < questions.length - 1 && <Separator className="my-4" />}
              </div>
            ))}
            
            <Button 
              onClick={evaluateAnswers}
              disabled={isEvaluating || !questions.some(q => q.studentAnswer?.trim())}
              className="w-full mt-4"
            >
              {isEvaluating ? t.loading : t.evaluateAnswers}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Evaluation Results */}
      {evaluationResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {t.results}
              <Badge variant="outline" className="text-lg px-3 py-1">
                {t.finalScore}: {calculateFinalScore()}/10
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {evaluationResults.map((result, index) => (
              <div key={index} className="space-y-2 p-4 border rounded-lg">
                <h4 className="font-medium">Question {index + 1}</h4>
                <p className="text-sm text-gray-600">{result.question}</p>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm"><strong>Answer:</strong> {result.studentAnswer}</p>
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant={result.score >= 7 ? 'default' : result.score >= 4 ? 'secondary' : 'destructive'}>
                    {t.score}: {result.score}/10
                  </Badge>
                </div>
                <div className="text-sm text-gray-700">
                  <strong>{t.feedback}:</strong> {result.feedback}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};