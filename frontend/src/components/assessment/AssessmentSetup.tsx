import { useState } from "react";

import {
  Clock,
  Hash,
  AlertCircle,
} from "lucide-react";

import { useUserStore } from "../../store/useUserStore";

const cn = (...classes: string[]) =>
  classes.filter(Boolean).join(" ");

interface AssessmentForm {
  company: string;

  role_name: string;

  topics: string;

  difficulty: string;

  noOfQuestions: number;

  totalTime: number;
}

interface DifficultyLevel {
  id: string;

  label: string;
}

interface AssessmentSetupProps {
  onStart: (form: AssessmentForm) => void;

  loading: boolean;
}

const AssessmentSetup = ({
  onStart,
  loading,
}: AssessmentSetupProps) => {
  const theme = useUserStore(
    (state) => state.theme
  );

  const isDark = theme === "dark";

  const [form, setForm] =
    useState<AssessmentForm>({
      company: "",

      role_name: "",

      topics: "",

      difficulty: "moderate",

      noOfQuestions: 5,

      totalTime: 300,
    });

  const update = (
    key: keyof AssessmentForm,
    value: string | number
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    onStart(form);
  };

  const difficultyLevels: DifficultyLevel[] = [
    {
      id: "easy",
      label: "Easy",
    },
    {
      id: "moderate",
      label: "Moderate",
    },
    {
      id: "hard",
      label: "Hard",
    },
  ];

  return (
    <div>
      {/* YOUR FULL JSX SAME */}
    </div>
  );
};

export default AssessmentSetup;