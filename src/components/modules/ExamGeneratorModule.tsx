'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  competency: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface QuestionBank {
  subject: string;
  questions: Question[];
  totalQuestions: number;
}

interface QCM {
  id: string;
  subject: string;
  questions: Question[];
  createdAt: Date;
}

interface StudentAnswer {
  questionId: string;
  selectedAnswer: number | null;
}

interface ExamResult {
  score: number;
  totalQuestions: number;
  answers: StudentAnswer[];
  feedback: string[];
}

const translations = {
  en: {
    title: 'AI Exam Generator (QCM)',
    description: 'Generate randomized QCM exams from LaTeX subjects',
    latexInput: 'LaTeX Subject Input',
    latexPlaceholder: 'Paste your LaTeX subject content here...',
    generateBank: 'Generate Question Bank',
    questionBank: 'Question Bank',
    createQCM: 'Create QCM',
    qcmSettings: 'QCM Settings',
    numQuestions: 'Number of Questions',
    includeAll: 'Include All Difficulties',
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
    generateQCM: 'Generate Random QCM',
    takeExam: 'Take Exam',
    submitExam: 'Submit Exam',
    results: 'Exam Results',
    score: 'Score',
    loading: 'Processing...',
    error: 'Error occurred',
    competency: 'Competency',
    difficulty: 'Difficulty',
    skipReport: 'Skip/Report Question',
    question: 'Question',
    finalScore: 'Final Score'
  },
  fr: {
    title: 'Générateur d\'Examen IA (QCM)',
    description: 'Générer des examens QCM aléatoires depuis des sujets LaTeX',
    latexInput: 'Saisie du Sujet LaTeX',
    latexPlaceholder: 'Collez le contenu de votre sujet LaTeX ici...',
    generateBank: 'Générer la Banque de Questions',
    questionBank: 'Banque de Questions',
    createQCM: 'Créer un QCM',
    qcmSettings: 'Paramètres du QCM',
    numQuestions: 'Nombre de Questions',
    includeAll: 'Inclure Toutes les Difficultés',
    easy: 'Facile',
    medium: 'Moyen',
    hard: 'Difficile',
    generateQCM: 'Générer un QCM Aléatoire',
    takeExam: 'Passer l\'Examen',
    submitExam: 'Soumettre l\'Examen',
    results: 'Résultats de l\'Examen',
    score: 'Score',
    loading: 'Traitement...',
    error: 'Erreur survenue',
    competency: 'Compétence',
    difficulty: 'Difficulté',
    skipReport: 'Ignorer/Signaler la Question',
    question: 'Question',
    finalScore: 'Score Final'
  }
};

export const ExamGeneratorModule = () => {
  const { language } = useAuth();
  const [latexContent, setLatexContent] = useState('');
  const [questionBank, setQuestionBank] = useState<QuestionBank | null>(null);
  const [currentQCM, setCurrentQCM] = useState<QCM | null>(null);
  const [studentAnswers, setStudentAnswers] = useState<StudentAnswer[]>([]);
  const [examResult, setExamResult] = useState<ExamResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreatingQCM, setIsCreatingQCM] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // QCM Settings
  const [numQuestions, setNumQuestions] = useState(10);
  const [includeDifficulties, setIncludeDifficulties] = useState({
    easy: true,
    medium: true,
    hard: true
  });
  
  const t = translations[language];

  const generateQuestionBank = async () => {
    if (!latexContent.trim()) return;
    
    setIsGenerating(true);
    setError('');

    try {
      const response = await fetch('/api/exam-generator/generate-bank', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latexContent,
          language: language
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setQuestionBank(data.questionBank);
      } else {
        setError(data.error || 'Failed to generate question bank');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const createRandomQCM = async () => {
    if (!questionBank) return;

    setIsCreatingQCM(true);
    setError('');

    try {
      const response = await fetch('/api/exam-generator/create-qcm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionBank,
          numQuestions,
          includeDifficulties,
          language: language
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setCurrentQCM(data.qcm);
        setStudentAnswers(data.qcm.questions.map((q: Question) => ({
          questionId: q.id,
          selectedAnswer: null
        })));
        setExamResult(null);
      } else {
        setError(data.error || 'Failed to create QCM');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setIsCreatingQCM(false);
    }
  };

  const submitExam = async () => {
    if (!currentQCM) return;

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/exam-generator/submit-exam', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          qcm: currentQCM,
          answers: studentAnswers,
          language: language
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setExamResult(data.result);
      } else {
        setError(data.error || 'Failed to submit exam');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateAnswer = (questionId: string, selectedAnswer: number) => {
    setStudentAnswers(prev => 
      prev.map(answer => 
        answer.questionId === questionId 
          ? { ...answer, selectedAnswer }
          : answer
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

  return (
    <div className="space-y-6">
      {/* LaTeX Input */}
      <Card>
        <CardHeader>
          <CardTitle>{t.title}</CardTitle>
          <CardDescription>{t.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="latex-input">{t.latexInput}</Label>
            <Textarea
              id="latex-input"
              placeholder={t.latexPlaceholder}
              value={latexContent}
              onChange={(e) => setLatexContent(e.target.value)}
              className="min-h-[200px] font-mono"
            />
          </div>
          
          <Button 
            onClick={generateQuestionBank} 
            disabled={!latexContent.trim() || isGenerating}
            className="w-full"
          >
            {isGenerating ? t.loading : t.generateBank}
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Question Bank Management */}
      {questionBank && (
        <Card>
          <CardHeader>
            <CardTitle>{t.questionBank}</CardTitle>
            <CardDescription>
              {questionBank.totalQuestions} questions generated for "{questionBank.subject}"
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="create-qcm" className="space-y-4">
              <TabsList>
                <TabsTrigger value="create-qcm">{t.createQCM}</TabsTrigger>
                <TabsTrigger value="view-bank">View Bank</TabsTrigger>
              </TabsList>

              <TabsContent value="create-qcm" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="num-questions">{t.numQuestions}</Label>
                    <Input
                      id="num-questions"
                      type="number"
                      min="1"
                      max={questionBank.totalQuestions}
                      value={numQuestions}
                      onChange={(e) => setNumQuestions(Number(e.target.value))}
                    />
                  </div>
                  
                  <div>
                    <Label>{t.includeAll}</Label>
                    <div className="flex items-center space-x-4 mt-2">
                      {(['easy', 'medium', 'hard'] as const).map(difficulty => (
                        <div key={difficulty} className="flex items-center space-x-2">
                          <Checkbox
                            id={difficulty}
                            checked={includeDifficulties[difficulty]}
                            onCheckedChange={(checked) =>
                              setIncludeDifficulties(prev => ({
                                ...prev,
                                [difficulty]: checked === true
                              }))
                            }
                          />
                          <Label htmlFor={difficulty} className="text-sm">
                            {t[difficulty]}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={createRandomQCM}
                  disabled={isCreatingQCM || !Object.values(includeDifficulties).some(Boolean)}
                  className="w-full"
                >
                  {isCreatingQCM ? t.loading : t.generateQCM}
                </Button>
              </TabsContent>

              <TabsContent value="view-bank">
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {questionBank.questions.map((question, index) => (
                    <div key={question.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Q{index + 1}</span>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{question.competency}</Badge>
                          <Badge className={getDifficultyColor(question.difficulty)}>
                            {t[question.difficulty]}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{question.question}</p>
                      <div className="text-xs text-gray-500">
                        {question.options.length} options • Correct: {question.options[question.correctAnswer]}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* QCM Exam Interface */}
      {currentQCM && !examResult && (
        <Card>
          <CardHeader>
            <CardTitle>{t.takeExam}</CardTitle>
            <CardDescription>
              {currentQCM.questions.length} questions • Subject: {currentQCM.subject}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentQCM.questions.map((question, index) => {
              const currentAnswer = studentAnswers.find(a => a.questionId === question.id);
              
              return (
                <div key={question.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">{t.question} {index + 1}</h4>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{question.competency}</Badge>
                      <Badge className={getDifficultyColor(question.difficulty)}>
                        {t[question.difficulty]}
                      </Badge>
                      <Button variant="outline" size="sm">
                        {t.skipReport}
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-4">{question.question}</p>
                  
                  <div className="space-y-2">
                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center space-x-3">
                        <input
                          type="radio"
                          id={`${question.id}-${optionIndex}`}
                          name={question.id}
                          checked={currentAnswer?.selectedAnswer === optionIndex}
                          onChange={() => updateAnswer(question.id, optionIndex)}
                          className="w-4 h-4"
                        />
                        <Label 
                          htmlFor={`${question.id}-${optionIndex}`}
                          className="flex-1 cursor-pointer"
                        >
                          {option}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            
            <Button 
              onClick={submitExam}
              disabled={isSubmitting || studentAnswers.some(a => a.selectedAnswer === null)}
              className="w-full"
            >
              {isSubmitting ? t.loading : t.submitExam}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Exam Results */}
      {examResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {t.results}
              <Badge variant="outline" className="text-lg px-3 py-1">
                {t.finalScore}: {examResult.score}/100
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="text-4xl font-bold mb-2">
                {examResult.score}/100
              </div>
              <p className="text-gray-600">
                {examResult.score >= 80 ? 'Excellent!' : 
                 examResult.score >= 60 ? 'Good job!' : 
                 examResult.score >= 40 ? 'Needs improvement' : 'Study more'}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Detailed Feedback</h4>
              {examResult.feedback.map((feedback, index) => (
                <p key={index} className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
                  {feedback}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};