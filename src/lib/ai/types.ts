/**
 * Structured AI response contracts.
 *
 * Future runtime path:
 *   Frontend -> FastAPI -> AI service -> AI model -> structured JSON -> Frontend
 *
 * These types are the single source of truth for that JSON payload shape.
 * The frontend only ever talks to its own backend, so no API keys live here.
 */

/** Band score on the IELTS-style 0-9 scale, in 0.5 steps. */
export type BandScore = number;

export type CEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type Severity = "minor" | "moderate" | "major";

export type SkillArea = "writing" | "speaking" | "reading" | "listening" | "grammar" | "vocabulary";

/** A single correction: what was written/said, what it should be, and why. */
export interface Correction {
  id: string;
  original: string;
  suggestion: string;
  explanation: string;
  category: "grammar" | "vocabulary" | "spelling" | "punctuation" | "cohesion" | "pronunciation";
  severity: Severity;
}

export interface Recommendation {
  id: string;
  title: string;
  detail: string;
  skill: SkillArea;
  priority: "low" | "medium" | "high";
}

/** Envelope every AI call resolves to, so UI can show source/latency/model info. */
export interface AIResponse<T> {
  data: T;
  meta: {
    requestId: string;
    model: string;
    source: "mock" | "api";
    createdAt: string;
    latencyMs: number;
  };
}

export interface AIErrorShape {
  status: number;
  code: "bad_request" | "unauthorized" | "payment_required" | "forbidden" | "rate_limited" | "server_error" | "network_error";
  message: string;
  retryable: boolean;
}

/* ------------------------------------------------------------------ */
/* Writing evaluation                                                  */
/* ------------------------------------------------------------------ */

export interface WritingEvaluationRequest {
  taskType: "task1" | "task2";
  prompt: string;
  essay: string;
  targetBand?: BandScore;
}

export interface WritingEvaluation {
  taskResponse: BandScore;
  coherence: BandScore;
  lexicalResource: BandScore;
  grammar: BandScore;
  overall: BandScore;
  strengths: string[];
  weaknesses: string[];
  corrections: Correction[];
  recommendations: Recommendation[];
  wordCount: number;
  estimatedCEFR: CEFRLevel;
}

/* ------------------------------------------------------------------ */
/* Speaking evaluation                                                 */
/* ------------------------------------------------------------------ */

export interface SpeakingEvaluationRequest {
  part: 1 | 2 | 3;
  question: string;
  /** Reference to uploaded audio (never raw bytes in app state). */
  audioRef?: string;
  /** Optional client-side transcript when audio is unavailable. */
  transcript?: string;
  durationSeconds?: number;
}

export interface SpeakingEvaluation {
  fluency: BandScore;
  lexicalResource: BandScore;
  grammar: BandScore;
  pronunciation: BandScore;
  overall: BandScore;
  transcript: string;
  corrections: Correction[];
  recommendations: Recommendation[];
  wordsPerMinute: number;
  fillerWordCount: number;
}

/* ------------------------------------------------------------------ */
/* AI Coach                                                            */
/* ------------------------------------------------------------------ */

export interface CoachMessage {
  id: string;
  role: "user" | "coach";
  content: string;
  createdAt: string;
}

export interface CoachRequest {
  message: string;
  history?: CoachMessage[];
  focusSkill?: SkillArea;
}

export interface CoachReply {
  message: CoachMessage;
  suggestedFollowUps: string[];
  referencedSkills: SkillArea[];
}

/* ------------------------------------------------------------------ */
/* Mistake analysis                                                    */
/* ------------------------------------------------------------------ */

export interface MistakeAnalysisRequest {
  /** Attempt ids or free-text samples the learner produced. */
  attemptIds?: string[];
  samples?: string[];
  window?: "last7days" | "last30days" | "allTime";
}

export interface MistakePattern {
  id: string;
  label: string;
  skill: SkillArea;
  occurrences: number;
  severity: Severity;
  example: string;
  fix: string;
}

export interface MistakeAnalysis {
  totalMistakes: number;
  patterns: MistakePattern[];
  weakestSkill: SkillArea;
  improvingSkill: SkillArea;
  recommendations: Recommendation[];
}

/* ------------------------------------------------------------------ */
/* Personalized study plan                                             */
/* ------------------------------------------------------------------ */

export interface StudyPlanRequest {
  currentBand: BandScore;
  targetBand: BandScore;
  examDate?: string;
  minutesPerDay: number;
  focusSkills?: SkillArea[];
}

export interface StudyTask {
  id: string;
  title: string;
  skill: SkillArea;
  minutes: number;
  description: string;
}

export interface StudyPlanDay {
  day: number;
  label: string;
  tasks: StudyTask[];
}

export interface StudyPlanWeek {
  week: number;
  theme: string;
  goal: string;
  days: StudyPlanDay[];
}

export interface StudyPlan {
  summary: string;
  currentBand: BandScore;
  targetBand: BandScore;
  weeks: StudyPlanWeek[];
  totalMinutesPerWeek: number;
  recommendations: Recommendation[];
}

/* ------------------------------------------------------------------ */
/* Vocabulary generation                                               */
/* ------------------------------------------------------------------ */

export interface VocabularyRequest {
  topic: string;
  level?: CEFRLevel;
  count?: number;
}

export interface VocabularyItem {
  id: string;
  word: string;
  partOfSpeech: string;
  definition: string;
  example: string;
  collocations: string[];
  synonyms: string[];
  level: CEFRLevel;
}

export interface VocabularySet {
  topic: string;
  level: CEFRLevel;
  items: VocabularyItem[];
}

/* ------------------------------------------------------------------ */
/* Grammar exercise generation                                         */
/* ------------------------------------------------------------------ */

export type ExerciseFormat = "multipleChoice" | "fillBlank" | "errorCorrection" | "reorder";

export interface GrammarExerciseRequest {
  topic: string;
  level?: CEFRLevel;
  count?: number;
  format?: ExerciseFormat;
}

export interface GrammarQuestion {
  id: string;
  format: ExerciseFormat;
  prompt: string;
  options?: string[];
  answer: string;
  explanation: string;
}

export interface GrammarExerciseSet {
  topic: string;
  level: CEFRLevel;
  questions: GrammarQuestion[];
}
