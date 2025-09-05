import { NextResponse } from 'next/server';

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export async function POST(request: Request) {
  try {
    const { questionBank, numQuestions, includeDifficulties } = await request.json();

    if (!questionBank?.questions || !Array.isArray(questionBank.questions)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Valid question bank is required' 
      });
    }

    if (!numQuestions || numQuestions < 1) {
      return NextResponse.json({ 
        success: false, 
        error: 'Valid number of questions is required' 
      });
    }

    // Filter questions by difficulty preferences
    const filteredQuestions = questionBank.questions.filter((q: any) => 
      includeDifficulties[q.difficulty as keyof typeof includeDifficulties]
    );

    if (filteredQuestions.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'No questions match the selected difficulty criteria' 
      });
    }

    // Randomly select questions
    const shuffledQuestions = shuffleArray(filteredQuestions);
    const selectedQuestions = shuffledQuestions.slice(0, Math.min(numQuestions, filteredQuestions.length));

    // Shuffle answer options for each question while preserving correct answer index
    const qcmQuestions = selectedQuestions.map((question: any) => {
      const originalOptions = [...question.options];
      const correctAnswer = question.correctAnswer;
      const correctOption = originalOptions[correctAnswer];
      
      // Shuffle options
      const shuffledOptions = shuffleArray(originalOptions);
      
      // Find new index of correct answer
      const newCorrectAnswer = shuffledOptions.indexOf(correctOption);
      
      return {
        ...question,
        options: shuffledOptions,
        correctAnswer: newCorrectAnswer
      };
    });

    // Create QCM
    const qcm = {
      id: `qcm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      subject: questionBank.subject,
      questions: qcmQuestions,
      createdAt: new Date()
    };

    return NextResponse.json({
      success: true,
      qcm
    });

  } catch (error) {
    console.error('Error creating QCM:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}