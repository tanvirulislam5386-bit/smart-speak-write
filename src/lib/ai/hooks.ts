import { useMutation, type UseMutationResult } from "@tanstack/react-query";
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

const retry = (failureCount: number, error: unknown) =>
  error instanceof AIError && error.retryable && failureCount < 2;

type AIMutation<TReq, TRes> = UseMutationResult<AIResponse<TRes>, AIError, TReq>;

export const useWritingEvaluation = (): AIMutation<WritingEvaluationRequest, WritingEvaluation> =>
  useMutation({ mutationKey: ["ai", "writing"], mutationFn: (req) => aiService.evaluateWriting(req), retry });

export const useSpeakingEvaluation = (): AIMutation<SpeakingEvaluationRequest, SpeakingEvaluation> =>
  useMutation({ mutationKey: ["ai", "speaking"], mutationFn: (req) => aiService.evaluateSpeaking(req), retry });

export const useAICoach = (): AIMutation<CoachRequest, CoachReply> =>
  useMutation({ mutationKey: ["ai", "coach"], mutationFn: (req) => aiService.askCoach(req), retry });

export const useMistakeAnalysis = (): AIMutation<MistakeAnalysisRequest, MistakeAnalysis> =>
  useMutation({ mutationKey: ["ai", "mistakes"], mutationFn: (req) => aiService.analyzeMistakes(req), retry });

export const useStudyPlan = (): AIMutation<StudyPlanRequest, StudyPlan> =>
  useMutation({ mutationKey: ["ai", "study-plan"], mutationFn: (req) => aiService.generateStudyPlan(req), retry });

export const useVocabularyGenerator = (): AIMutation<VocabularyRequest, VocabularySet> =>
  useMutation({ mutationKey: ["ai", "vocabulary"], mutationFn: (req) => aiService.generateVocabulary(req), retry });

export const useGrammarExercises = (): AIMutation<GrammarExerciseRequest, GrammarExerciseSet> =>
  useMutation({
    mutationKey: ["ai", "grammar"],
    mutationFn: (req) => aiService.generateGrammarExercises(req),
    retry,
  });
