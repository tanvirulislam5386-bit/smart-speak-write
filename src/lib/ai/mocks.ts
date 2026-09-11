import type {
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

/**
 * Deterministic mock generators. They mirror the exact JSON the FastAPI layer
 * will return, so swapping the transport requires no UI changes.
 */

const id = (prefix: string, n: number) => `${prefix}-${n}`;

const clampBand = (value: number) => Math.min(9, Math.max(4, Math.round(value * 2) / 2));

export function mockWritingEvaluation(req: WritingEvaluationRequest): WritingEvaluation {
  const words = req.essay.trim() ? req.essay.trim().split(/\s+/).length : 0;
  const base = clampBand(5.5 + Math.min(1.5, words / 260));

  return {
    taskResponse: clampBand(base),
    coherence: clampBand(base - 0.5),
    lexicalResource: clampBand(base + 0.5),
    grammar: clampBand(base - 0.5),
    overall: clampBand(base),
    wordCount: words,
    estimatedCEFR: base >= 7 ? "C1" : base >= 6 ? "B2" : "B1",
    strengths: [
      "Clear position stated in the introduction and maintained throughout.",
      "Good use of topic-specific vocabulary with mostly natural collocations.",
      "Paragraphs each carry one central idea.",
    ],
    weaknesses: [
      "Body paragraphs rely on general claims rather than concrete examples.",
      "Repetitive linking words ('moreover', 'in addition') reduce cohesion variety.",
      "Article and preposition slips appear in longer sentences.",
    ],
    corrections: [
      {
        id: id("wc", 1),
        original: "In nowadays, many people prefers online learning.",
        suggestion: "Nowadays, many people prefer online learning.",
        explanation: "'Nowadays' needs no preposition, and the plural subject takes 'prefer'.",
        category: "grammar",
        severity: "moderate",
      },
      {
        id: id("wc", 2),
        original: "a very big amount of students",
        suggestion: "a large number of students",
        explanation: "'Amount' is for uncountable nouns; use 'number' with countable nouns.",
        category: "vocabulary",
        severity: "minor",
      },
      {
        id: id("wc", 3),
        original: "Moreover, moreover, the government should act.",
        suggestion: "Furthermore, the government should act.",
        explanation: "Vary cohesive devices to avoid mechanical repetition.",
        category: "cohesion",
        severity: "minor",
      },
    ],
    recommendations: [
      {
        id: id("wr", 1),
        title: "Add one concrete example per body paragraph",
        detail: "Support each claim with a specific study, statistic, or personal case in two sentences.",
        skill: "writing",
        priority: "high",
      },
      {
        id: id("wr", 2),
        title: "Build a linking-word bank",
        detail: "Collect ten alternatives for addition, contrast, and result, then rotate them across essays.",
        skill: "writing",
        priority: "medium",
      },
      {
        id: id("wr", 3),
        title: "Proofread for articles",
        detail: "Spend the final three minutes checking a/an/the before every countable noun.",
        skill: "grammar",
        priority: "medium",
      },
    ],
  };
}

export function mockSpeakingEvaluation(req: SpeakingEvaluationRequest): SpeakingEvaluation {
  const transcript =
    req.transcript?.trim() ||
    "Well, I think, um, the place I like most is the small library near my home. It is quiet and, you know, I can read there for hours without anyone disturbing me.";
  const words = transcript.trim().split(/\s+/).length;
  const seconds = req.durationSeconds && req.durationSeconds > 0 ? req.durationSeconds : 60;

  return {
    fluency: 6.5,
    lexicalResource: 6.5,
    grammar: 6,
    pronunciation: 7,
    overall: 6.5,
    transcript,
    wordsPerMinute: Math.round((words / seconds) * 60),
    fillerWordCount: (transcript.match(/\b(um|uh|you know|like)\b/gi) ?? []).length,
    corrections: [
      {
        id: id("sc", 1),
        original: "It is quiet and I can read there since hours.",
        suggestion: "It is quiet and I can read there for hours.",
        explanation: "Use 'for' with a duration; 'since' marks a starting point.",
        category: "grammar",
        severity: "moderate",
      },
      {
        id: id("sc", 2),
        original: "um, you know, like",
        suggestion: "Pause silently instead of using fillers.",
        explanation: "Frequent fillers lower the fluency score more than short silences.",
        category: "pronunciation",
        severity: "minor",
      },
    ],
    recommendations: [
      {
        id: id("sr", 1),
        title: "Practise 2-minute monologues",
        detail: "Record a Part 2 answer daily and count fillers; aim to halve them in two weeks.",
        skill: "speaking",
        priority: "high",
      },
      {
        id: id("sr", 2),
        title: "Stress key content words",
        detail: "Mark the stressed word in each sentence before reading it aloud.",
        skill: "speaking",
        priority: "medium",
      },
    ],
  };
}

export function mockCoachReply(req: CoachRequest): CoachReply {
  const focus = req.focusSkill ?? "writing";
  return {
    message: {
      id: id("coach", (req.history?.length ?? 0) + 1),
      role: "coach",
      content: `Good question. For ${focus}, start with the structure: state your position, give one reason, support it with a specific example, then close the idea. Try rewriting your last answer using exactly that four-step shape and I will review it.`,
      createdAt: new Date().toISOString(),
    },
    suggestedFollowUps: [
      "Show me a model answer for this task",
      "What band am I likely at right now?",
      "Give me a 20-minute drill for today",
    ],
    referencedSkills: [focus, "grammar"],
  };
}

export function mockMistakeAnalysis(_req: MistakeAnalysisRequest): MistakeAnalysis {
  return {
    totalMistakes: 47,
    weakestSkill: "grammar",
    improvingSkill: "vocabulary",
    patterns: [
      {
        id: id("mp", 1),
        label: "Subject-verb agreement in long sentences",
        skill: "grammar",
        occurrences: 14,
        severity: "major",
        example: "The range of options that students has is wide.",
        fix: "Find the real subject ('range'), then match the verb: 'has' stays singular only for 'range'.",
      },
      {
        id: id("mp", 2),
        label: "Missing articles before countable nouns",
        skill: "grammar",
        occurrences: 11,
        severity: "moderate",
        example: "Government should build library in every district.",
        fix: "Add 'the' or 'a' before singular countable nouns.",
      },
      {
        id: id("mp", 3),
        label: "Repeated linking words",
        skill: "writing",
        occurrences: 9,
        severity: "moderate",
        example: "Moreover ... Moreover ... Moreover",
        fix: "Rotate through a bank of ten cohesive devices.",
      },
      {
        id: id("mp", 4),
        label: "Filler words while speaking",
        skill: "speaking",
        occurrences: 13,
        severity: "minor",
        example: "um, you know, like",
        fix: "Replace fillers with a one-second silent pause.",
      },
    ],
    recommendations: [
      {
        id: id("mr", 1),
        title: "Ten-minute agreement drill",
        detail: "Do twenty subject-verb items daily for one week; log every miss.",
        skill: "grammar",
        priority: "high",
      },
      {
        id: id("mr", 2),
        title: "Article checklist pass",
        detail: "Re-read old essays looking only for missing articles.",
        skill: "grammar",
        priority: "medium",
      },
    ],
  };
}

export function mockStudyPlan(req: StudyPlanRequest): StudyPlan {
  const perDay = Math.max(20, req.minutesPerDay);
  const themes = [
    { theme: "Foundations", goal: "Fix recurring grammar slips and set a daily rhythm." },
    { theme: "Task mastery", goal: "Write and speak to structure without notes." },
    { theme: "Range", goal: "Raise vocabulary and sentence variety." },
    { theme: "Exam simulation", goal: "Full timed mocks under exam conditions." },
  ];

  return {
    summary: `A four-week plan moving you from band ${req.currentBand} to ${req.targetBand} at ${perDay} minutes per day.`,
    currentBand: req.currentBand,
    targetBand: req.targetBand,
    totalMinutesPerWeek: perDay * 6,
    weeks: themes.map((t, wi) => ({
      week: wi + 1,
      theme: t.theme,
      goal: t.goal,
      days: Array.from({ length: 6 }, (_, di) => ({
        day: di + 1,
        label: (["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][di] ?? `Day ${di + 1}`),
        tasks: [
          {
            id: id(`sp-${wi + 1}-${di + 1}`, 1),
            title: di % 2 === 0 ? "Writing task practice" : "Speaking recording",
            skill: di % 2 === 0 ? "writing" : "speaking",
            minutes: Math.round(perDay * 0.6),
            description:
              di % 2 === 0
                ? "Write one timed response, then review the AI corrections line by line."
                : "Record a two-minute answer and compare it against the model transcript.",
          },
          {
            id: id(`sp-${wi + 1}-${di + 1}`, 2),
            title: di % 3 === 0 ? "Grammar drill" : "Vocabulary review",
            skill: di % 3 === 0 ? "grammar" : "vocabulary",
            minutes: Math.round(perDay * 0.4),
            description:
              di % 3 === 0
                ? "Ten items on your weakest pattern from mistake analysis."
                : "Review twenty saved words and use five in fresh sentences.",
          },
        ],
      })),
    })),
    recommendations: [
      {
        id: id("spr", 1),
        title: "Protect one full mock per week",
        detail: "Sit a complete timed test every Saturday and log the band breakdown.",
        skill: "writing",
        priority: "high",
      },
      {
        id: id("spr", 2),
        title: "Review before you add",
        detail: "Spend the first five minutes of each session on yesterday's corrections.",
        skill: "grammar",
        priority: "medium",
      },
    ],
  };
}

export function mockVocabularySet(req: VocabularyRequest): VocabularySet {
  const level = req.level ?? "B2";
  const seeds = [
    {
      word: "mitigate",
      partOfSpeech: "verb",
      definition: "to make something bad less severe or harmful",
      example: "Planting trees can mitigate the effects of urban heat.",
      collocations: ["mitigate the impact", "mitigate risk"],
      synonyms: ["alleviate", "reduce"],
    },
    {
      word: "prevalent",
      partOfSpeech: "adjective",
      definition: "widespread in a particular area or at a particular time",
      example: "Remote work is now prevalent among software teams.",
      collocations: ["increasingly prevalent", "widely prevalent"],
      synonyms: ["widespread", "common"],
    },
    {
      word: "incentive",
      partOfSpeech: "noun",
      definition: "something that motivates someone to act",
      example: "Tax breaks act as an incentive to buy electric cars.",
      collocations: ["strong incentive", "financial incentive"],
      synonyms: ["motivation", "inducement"],
    },
    {
      word: "sustainable",
      partOfSpeech: "adjective",
      definition: "able to continue over a long period without damaging resources",
      example: "Cities need sustainable transport networks.",
      collocations: ["sustainable growth", "environmentally sustainable"],
      synonyms: ["viable", "enduring"],
    },
    {
      word: "disparity",
      partOfSpeech: "noun",
      definition: "a clear difference between two or more things",
      example: "There is a wide disparity in income between regions.",
      collocations: ["wide disparity", "income disparity"],
      synonyms: ["gap", "inequality"],
    },
    {
      word: "advocate",
      partOfSpeech: "verb",
      definition: "to publicly support a particular policy or idea",
      example: "Many researchers advocate smaller class sizes.",
      collocations: ["strongly advocate", "advocate for change"],
      synonyms: ["champion", "endorse"],
    },
  ];

  const count = Math.min(req.count ?? 6, seeds.length);
  return {
    topic: req.topic,
    level,
    items: seeds.slice(0, count).map((s, i) => ({ id: id("vocab", i + 1), level, ...s })),
  };
}

export function mockGrammarExercises(req: GrammarExerciseRequest): GrammarExerciseSet {
  const level = req.level ?? "B2";
  const format = req.format ?? "multipleChoice";
  const seeds = [
    {
      prompt: "The number of applicants ____ risen sharply this year.",
      options: ["have", "has", "having", "is have"],
      answer: "has",
      explanation: "'The number of' is singular, so it takes 'has'.",
    },
    {
      prompt: "If governments ____ earlier, the crisis would have been smaller.",
      options: ["act", "acted", "had acted", "would act"],
      answer: "had acted",
      explanation: "Third conditional: 'if + had + past participle' with 'would have'.",
    },
    {
      prompt: "She has lived in Dhaka ____ 2019.",
      options: ["for", "since", "from", "during"],
      answer: "since",
      explanation: "'Since' marks a starting point; 'for' marks a duration.",
    },
    {
      prompt: "Neither the teacher nor the students ____ ready for the test.",
      options: ["was", "were", "is", "has been"],
      answer: "were",
      explanation: "With 'neither ... nor', the verb agrees with the nearer subject ('students').",
    },
    {
      prompt: "This is the report ____ conclusions surprised the committee.",
      options: ["which", "whose", "who", "that"],
      answer: "whose",
      explanation: "'Whose' shows possession, including for things.",
    },
  ];

  const count = Math.min(req.count ?? 5, seeds.length);
  return {
    topic: req.topic,
    level,
    questions: seeds.slice(0, count).map((s, i) => ({
      id: id("gq", i + 1),
      format,
      prompt: s.prompt,
      ...(format === "multipleChoice" ? { options: s.options } : {}),
      answer: s.answer,
      explanation: s.explanation,
    })),
  };
}
