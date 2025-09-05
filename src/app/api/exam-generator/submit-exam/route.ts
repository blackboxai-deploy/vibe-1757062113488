import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { qcm, answers, language } = await request.json();

    if (!qcm?.questions || !Array.isArray(qcm.questions)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Valid QCM is required' 
      });
    }

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Answers are required' 
      });
    }

    // Calculate score
    let correctAnswers = 0;
    const feedback: string[] = [];

    const results = qcm.questions.map((question: any, index: number) => {
      const studentAnswer = answers.find((a: any) => a.questionId === question.id);
      const isCorrect = studentAnswer?.selectedAnswer === question.correctAnswer;
      
      if (isCorrect) {
        correctAnswers++;
      }

      // Generate feedback based on language
      const feedbackText = language === 'fr' 
        ? isCorrect 
          ? `Question ${index + 1}: Correct! Vous maîtrisez la compétence "${question.competency}".`
          : `Question ${index + 1}: Incorrect. La bonne réponse était "${question.options[question.correctAnswer]}". Réviser: ${question.competency}.`
        : isCorrect
          ? `Question ${index + 1}: Correct! You understand "${question.competency}" well.`
          : `Question ${index + 1}: Incorrect. The right answer was "${question.options[question.correctAnswer]}". Review: ${question.competency}.`;
      
      feedback.push(feedbackText);

      return {
        questionId: question.id,
        question: question.question,
        studentAnswer: studentAnswer?.selectedAnswer ?? -1,
        correctAnswer: question.correctAnswer,
        isCorrect,
        competency: question.competency
      };
    });

    // Calculate final score out of 100
    const score = Math.round((correctAnswers / qcm.questions.length) * 100);

    // Generate overall feedback
    const overallFeedback = language === 'fr'
      ? score >= 80 
        ? "Excellente performance! Vous maîtrisez bien les compétences du sujet."
        : score >= 60
        ? "Bonne performance, mais quelques points à améliorer."
        : score >= 40
        ? "Performance moyenne. Il est recommandé de réviser certaines compétences."
        : "Performance faible. Une révision approfondie est nécessaire."
      : score >= 80
        ? "Excellent performance! You have mastered the subject competencies well."
        : score >= 60
        ? "Good performance, but some areas need improvement."
        : score >= 40
        ? "Average performance. It's recommended to review some competencies."
        : "Poor performance. Thorough review is needed.";

    feedback.unshift(overallFeedback);

    const examResult = {
      score,
      totalQuestions: qcm.questions.length,
      correctAnswers,
      incorrectAnswers: qcm.questions.length - correctAnswers,
      answers: results,
      feedback,
      completedAt: new Date(),
      qcmId: qcm.id
    };

    return NextResponse.json({
      success: true,
      result: examResult
    });

  } catch (error) {
    console.error('Error submitting exam:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}