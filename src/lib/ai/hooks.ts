import { useMutation } from "@tanstack/react-query";
import { AIError } from "./client";
import { aiService } from "./services";
import type {
  AIResponse,
  CoachReply,
  CoachRequest,
  GrammarExerciseRequest,
  GrammarExerciseSet,
  MistakeAnalysis,
  MistakeAnalysisRequest,
  SpeakingEvaluation,
  SpeakingEvaluationRequest,
  StudyPlan,
  StudyPlanRequest,
  VocabularyRequest,
  VocabularySet,
  WritingEvaluation,
  WritingEvaluationRequest,
} from "./types";

const retry = (failureCount: number, error: AIError) =>
  error instanceof AIError && error.retryable && failureCount < 2;

export const useWritingEvaluation = () =>
  useMutation<AIResponse<WritingEvaluation>, AIError, WritingEvaluationRequest>({
    mutationKey: ["ai", "writing"],
    mutationFn: (req) => aiService.evaluateWriting(req),
    retry,
  });

export const useSpeakingEvaluation = () =>
  useMutation<AIResponse<SpeakingEvaluation>, AIError, SpeakingEvaluationRequest>({
    mutationKey: ["ai", "speaking"],
    mutationFn: (req) => aiService.evaluateSpeaking(req),
    retry,
  });

export const useAICoach = () =>
  useMutation<AIResponse<CoachReply>, AIError, CoachRequest>({
    mutationKey: ["ai", "coach"],
    mutationFn: (req) => aiService.askCoach(req),
    retry,
  });

export const useMistakeAnalysis = () =>
  useMutation<AIResponse<MistakeAnalysis>, AIError, MistakeAnalysisRequest>({
    mutationKey: ["ai", "mistakes"],
    mutationFn: (req) => aiService.analyzeMistakes(req),
    retry,
  });

export const useStudyPlan = () =>
  useMutation<AIResponse<StudyPlan>, AIError, StudyPlanRequest>({
    mutationKey: ["ai", "study-plan"],
    mutationFn: (req) => aiService.generateStudyPlan(req),
    retry,
  });

export const useVocabularyGenerator = () =>
  useMutation<AIResponse<VocabularySet>, AIError, VocabularyRequest>({
    mutationKey: ["ai", "vocabulary"],
    mutationFn: (req) => aiService.generateVocabulary(req),
    retry,
  });

export const useGrammarExercises = () =>
  useMutation<AIResponse<GrammarExerciseSet>, AIError, GrammarExerciseRequest>({
    mutationKey: ["ai", "grammar"],
    mutationFn: (req) => aiService.generateGrammarExercises(req),
    retry,
  });
