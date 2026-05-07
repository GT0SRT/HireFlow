

interface Metrics {
  technicalKnowledge: number;
  accuracy: number;
}

interface QuestionAnalysis {
  question: string;
  candidateAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  solution: string;
  topic: string;
}

interface AssessmentResult {
  role_name: string;
  company: string;
  difficulty: string;

  overallScore: number;

  correctAnswers: number;

  totalQuestions: number;

  metrics: Metrics;

  topicsCovered: string[];

  strengths: string[];

  weaknesses?: string;

  feedback: string;

  questionsAnalysis: QuestionAnalysis[];
}

interface AssessmentResultsProps {
  result: AssessmentResult | null;

  onRestart: () => void;

  loading?: boolean;
}

const AssessmentResults = ({
  result,
  onRestart: _onRestart,
  loading = false,
}: AssessmentResultsProps) => {

  if (loading || !result) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {/* YOUR FULL JSX */}
    </div>
  );
};

export default AssessmentResults;
