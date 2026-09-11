import { callAI } from "./client";
import {
  mockCoachReply,
  mockGrammarExercises,
  mockMistakeAnalysis,
  mockSpeakingEvaluation,
  mockStudyPlan,
  mockVocabularySet,
  mockWritingEvaluation,
} from "./mocks";
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

interface CallOptions {
  signal?: AbortSignal;
}

/** Every AI capability the app exposes, one method per feature. */
export interface AIService {
  evaluateWriting(
    req: WritingEvaluationRequest,
    options?: CallOptions,
  ): Promise<AIResponse<WritingEvaluation>>;
  evaluateSpeaking(
    req: SpeakingEvaluationRequest,
    options?: CallOptions,
  ): Promise<AIResponse<SpeakingEvaluation>>;
  askCoach(req: CoachRequest, options?: CallOptions): Promise<AIResponse<CoachReply>>;
  analyzeMistakes(
    req: MistakeAnalysisRequest,
    options?: CallOptions,
  ): Promise<AIResponse<MistakeAnalysis>>;
  generateStudyPlan(req: StudyPlanRequest, options?: CallOptions): Promise<AIResponse<StudyPlan>>;
  generateVocabulary(
    req: VocabularyRequest,
    options?: CallOptions,
  ): Promise<AIResponse<VocabularySet>>;
  generateGrammarExercises(
    req: GrammarExerciseRequest,
    options?: CallOptions,
  ): Promise<AIResponse<GrammarExerciseSet>>;
}

export const aiService: AIService = {
  evaluateWriting: (req, options) =>
    callAI("writingEvaluation", req, mockWritingEvaluation, options),
  evaluateSpeaking: (req, options) =>
    callAI("speakingEvaluation", req, mockSpeakingEvaluation, options),
  askCoach: (req, options) => callAI("coach", req, mockCoachReply, options),
  analyzeMistakes: (req, options) => callAI("mistakeAnalysis", req, mockMistakeAnalysis, options),
  generateStudyPlan: (req, options) => callAI("studyPlan", req, mockStudyPlan, options),
  generateVocabulary: (req, options) => callAI("vocabulary", req, mockVocabularySet, options),
  generateGrammarExercises: (req, options) =>
    callAI("grammarExercises", req, mockGrammarExercises, options),
};
