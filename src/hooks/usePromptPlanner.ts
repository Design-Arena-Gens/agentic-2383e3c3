"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { PromptBlueprint, PromptQuestion } from "@/lib/promptBlueprints";

type TimelineItem = {
  id: string;
  label: string;
  answer: string;
  timestamp: string;
  insight?: string | null;
};

type ChecklistItem = {
  label: string;
  done: boolean;
};

type UsePromptPlannerOptions = {
  blueprint: PromptBlueprint;
};

const timeFormatter = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit"
});

const languages = {
  Português: "Portuguese",
  Inglês: "English",
  Espanhol: "Spanish",
  Francês: "French"
} as const;

const tones = {
  Neutro: "Neutral",
  Consultivo: "Consultative",
  Criativo: "Creative",
  Técnico: "Technical",
  Didático: "Educational"
} as const;

export function usePromptPlanner({ blueprint }: UsePromptPlannerOptions) {
  const [questionList, setQuestionList] = useState<PromptQuestion[]>(blueprint.questions);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [position, setPosition] = useState(0);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [tone, setTone] = useState<keyof typeof tones>("Consultivo");
  const [language, setLanguage] = useState<keyof typeof languages>("Português");
  const [creativity, setCreativity] = useState(45);
  const [includeMeta, setIncludeMeta] = useState(true);
  const [exploratoryMode, setExploratoryMode] = useState(false);

  useEffect(() => {
    setQuestionList(blueprint.questions);
    setAnswers({});
    setPosition(0);
    setTimeline([]);
  }, [blueprint]);

  const safePosition = Math.min(position, Math.max(questionList.length - 1, 0));
  const currentQuestion = questionList[safePosition];

  const updateAnswer = useCallback((id: string, value: string) => {
    setAnswers((current) => ({ ...current, [id]: value }));
  }, []);

  const skip = useCallback(() => {
    if (!currentQuestion) return;
    setAnswers((current) => {
      const next = { ...current };
      delete next[currentQuestion.id];
      return next;
    });
    setPosition((prev) => Math.min(prev + 1, Math.max(questionList.length - 1, 0)));
  }, [currentQuestion, questionList.length]);

  const commit = useCallback(() => {
    if (!currentQuestion) return;
    const answer = (answers[currentQuestion.id] ?? "").trim();
    if (!answer) return;

    const timestamp = timeFormatter.format(new Date());
    setTimeline((current) => {
      const existingIndex = current.findIndex((item) => item.id === currentQuestion.id);
      const payload: TimelineItem = {
        id: currentQuestion.id,
        label: currentQuestion.title,
        answer,
        timestamp,
        insight: currentQuestion.insight?.(answer, answers)
      };
      if (existingIndex >= 0) {
        const clone = [...current];
        clone[existingIndex] = payload;
        return clone;
      }
      return [...current, payload];
    });

    let insertedFollowUp = false;

    setPosition((prev) => Math.min(prev + 1, Math.max(questionList.length - 1, 0)));

    if (
      exploratoryMode &&
      !currentQuestion.optional &&
      answer.length < 90 &&
      !questionList.some((question) => question.id === `${currentQuestion.id}-deepening`)
    ) {
      const followUp: PromptQuestion = {
        id: `${currentQuestion.id}-deepening`,
        title: `Quais nuances adicionais sobre "${currentQuestion.title.toLowerCase()}" devemos mapear?`,
        helper:
          "Descreva exceções, cenários extremos ou requisitos ocultos para minimizar ambiguidades.",
        placeholder:
          "Ex: Devemos evitar jargões legais, considerar métricas específicas ou acomodar múltiplos stakeholders.",
        suggestions: [
          "Restrições internas de aprovação e fluxo de stakeholders.",
          "Informações confidenciais que não podem ser utilizadas.",
          "Dependências externas ou integrações obrigatórias."
        ],
        multiline: true,
        insight: (value) =>
          value
            ? "Excelente! Nuances adicionais ajudam o modelo a antecipar armadilhas."
            : null
      };

      setQuestionList((current) => {
        const clone = [...current];
        clone.splice(safePosition + 1, 0, followUp);
        return clone;
      });
      insertedFollowUp = true;
    }

    if (insertedFollowUp) {
      setPosition(safePosition + 1);
    }
  }, [
    answers,
    currentQuestion,
    exploratoryMode,
    questionList,
    safePosition
  ]);

  const reset = useCallback(() => {
    setAnswers({});
    setTimeline([]);
    setQuestionList(blueprint.questions);
    setPosition(0);
    setTone("Consultivo");
    setLanguage("Português");
    setCreativity(45);
    setIncludeMeta(true);
    setExploratoryMode(false);
  }, [blueprint.questions]);

  const hasAnswer = Boolean(
    currentQuestion ? (answers[currentQuestion.id] ?? "").trim().length : false
  );

  const progress = useMemo(
    () => ({
      total: questionList.length,
      completed: Object.values(answers).filter((value) => value.trim().length > 0).length
    }),
    [answers, questionList.length]
  );

  const checklist: ChecklistItem[] = useMemo(
    () => [
      {
        label: "Objetivo principal definido com clareza",
        done: Boolean(answers.mission?.trim())
      },
      {
        label: "Público e contexto considerados",
        done: Boolean(answers.audience?.trim() && answers.context?.trim())
      },
      {
        label: "Formato de entrega estruturado",
        done: Boolean(answers.deliverable?.trim())
      },
      {
        label: "Riscos e critérios de validação mapeados",
        done: Boolean(answers.risks?.trim() || answers.validation?.trim())
      },
      {
        label: "Referências ou recursos adicionados",
        done: Boolean(answers.resources?.trim())
      }
    ],
    [answers]
  );

  return {
    answers,
    updateAnswer,
    currentQuestion,
    hasAnswer,
    commit,
    skip,
    reset,
    progress,
    timeline,
    tone,
    setTone,
    language,
    setLanguage,
    creativity,
    setCreativity,
    includeMeta,
    setIncludeMeta,
    exploratoryMode,
    setExploratoryMode,
    checklist,
    questionList,
    toneLabel: tones[tone],
    languageLabel: languages[language]
  };
}
