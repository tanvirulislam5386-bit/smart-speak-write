import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  AI_CONFIG,
  useAICoach,
  useGrammarExercises,
  useMistakeAnalysis,
  useSpeakingEvaluation,
  useStudyPlan,
  useVocabularyGenerator,
  useWritingEvaluation,
  type CoachMessage,
  type Correction,
  type Recommendation,
} from "@/lib/ai";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Practice Studio — Writing, Speaking & Study Plans" },
      {
        name: "description",
        content:
          "Practice studio with AI-ready writing and speaking evaluation, a coach, mistake analysis, study plans, vocabulary and grammar drills.",
      },
      { property: "og:title", content: "AI Practice Studio — Writing, Speaking & Study Plans" },
      {
        property: "og:description",
        content:
          "Score breakdowns, corrections and personalised practice plans, powered by structured AI responses.",
      },
    ],
  }),
  component: Index,
});

type Accent = "violet" | "fuchsia" | "coral" | "amber" | "emerald" | "sky" | "rose";

const accentText: Record<Accent, string> = {
  violet: "text-violet",
  fuchsia: "text-fuchsia",
  coral: "text-coral",
  amber: "text-amber",
  emerald: "text-emerald",
  sky: "text-sky",
  rose: "text-rose",
};

const accentDot: Record<Accent, string> = {
  violet: "bg-violet",
  fuchsia: "bg-fuchsia",
  coral: "bg-coral",
  amber: "bg-amber",
  emerald: "bg-emerald",
  sky: "bg-sky",
  rose: "bg-rose",
};

const accentSoft: Record<Accent, string> = {
  violet: "bg-violet-soft",
  fuchsia: "bg-fuchsia-soft",
  coral: "bg-coral-soft",
  amber: "bg-amber-soft",
  emerald: "bg-emerald-soft",
  sky: "bg-sky-soft",
  rose: "bg-rose-soft",
};

const tabActive: Record<Accent, string> = {
  violet:
    "data-[state=active]:bg-violet data-[state=active]:text-primary-foreground data-[state=active]:shadow-pop",
  fuchsia:
    "data-[state=active]:bg-fuchsia data-[state=active]:text-primary-foreground data-[state=active]:shadow-pop",
  coral:
    "data-[state=active]:bg-coral data-[state=active]:text-primary-foreground data-[state=active]:shadow-pop",
  amber:
    "data-[state=active]:bg-amber data-[state=active]:text-foreground data-[state=active]:shadow-pop",
  emerald:
    "data-[state=active]:bg-emerald data-[state=active]:text-primary-foreground data-[state=active]:shadow-pop",
  sky: "data-[state=active]:bg-sky data-[state=active]:text-primary-foreground data-[state=active]:shadow-pop",
  rose: "data-[state=active]:bg-rose data-[state=active]:text-primary-foreground data-[state=active]:shadow-pop",
};

const bandAccent = (band: number): Accent =>
  band >= 7 ? "emerald" : band >= 6 ? "amber" : "coral";

function ScoreTile({ label, band }: { label: string; band: number }) {
  const accent = bandAccent(band);
  return (
    <div className={`card-lift rounded-xl border-2 p-4 ${accentSoft[accent]}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-1 text-3xl font-bold ${accentText[accent]}`}>{band.toFixed(1)}</p>
      <Progress value={(band / 9) * 100} className="mt-3 h-2" />
    </div>
  );
}

function CorrectionList({ items, accent = "rose" }: { items: Correction[]; accent?: Accent }) {
  return (
    <ul className="space-y-3">
      {items.map((c) => (
        <li key={c.id} className="card-lift rounded-xl border-l-4 border-l-rose border bg-card p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={`${accentSoft[accent]} ${accentText[accent]} border-0`}>
              {c.category}
            </Badge>
            <Badge variant={c.severity === "major" ? "destructive" : "secondary"}>
              {c.severity}
            </Badge>
          </div>
          <p className="mt-2 text-sm text-muted-foreground line-through">{c.original}</p>
          <p className="text-sm font-semibold text-emerald">{c.suggestion}</p>
          <p className="mt-1 text-sm text-muted-foreground">{c.explanation}</p>
        </li>
      ))}
    </ul>
  );
}

function RecommendationList({
  items,
  accent = "sky",
}: {
  items: Recommendation[];
  accent?: Accent;
}) {
  return (
    <ul className="space-y-2">
      {items.map((r) => (
        <li
          key={r.id}
          className={`card-lift rounded-xl border-l-4 p-4 ${
            accent === "sky" ? "border-l-sky" : "border-l-violet"
          } bg-card`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold">{r.title}</p>
            <Badge className={`${accentSoft[accent]} ${accentText[accent]} border-0`}>
              {r.priority}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{r.detail}</p>
        </li>
      ))}
    </ul>
  );
}

function Pending({ label, accent = "violet" }: { label: string; accent?: Accent }) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border border-dashed p-6 text-sm text-muted-foreground ${accentSoft[accent]}`}
    >
      <span className={`size-2.5 animate-pulse rounded-full ${accentDot[accent]}`} />
      {label}
    </div>
  );
}

function PanelHeading({
  title,
  subtitle,
  accent,
}: {
  title: string;
  subtitle: string;
  accent: Accent;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className={`mt-1.5 size-3 rounded-full shadow-pop ${accentDot[accent]}`} />
      <div>
        <h2 className="text-xl font-bold tracking-tight">{title}</h2>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

const ctaClass = "gradient-fill border-0 text-primary-foreground shadow-pop hover:opacity-90";

function WritingPanel() {
  const [prompt, setPrompt] = useState(
    "Some people believe universities should focus on practical skills rather than academic theory. Discuss both views.",
  );
  const [essay, setEssay] = useState(
    "Nowadays, many people prefers online learning because it is flexible. In my opinion, universities should balance practical training with academic theory, since graduates need both to succeed at work.",
  );
  const evaluation = useWritingEvaluation();
  const result = evaluation.data?.data;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
      <Card className="card-lift rounded-2xl border-2">
        <CardHeader>
          <CardTitle>
            <PanelHeading title="Your essay" subtitle="Paste a Task 2 answer" accent="violet" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="w-prompt">Task prompt</Label>
            <Textarea id="w-prompt" rows={3} value={prompt} onChange={(e) => setPrompt(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="w-essay">Answer</Label>
            <Textarea id="w-essay" rows={10} value={essay} onChange={(e) => setEssay(e.target.value)} />
          </div>
          <Button
            className={ctaClass}
            onClick={() => evaluation.mutate({ taskType: "task2", prompt, essay, targetBand: 7 })}
            disabled={evaluation.isPending || essay.trim().length === 0}
          >
            {evaluation.isPending ? "Evaluating…" : "Evaluate writing"}
          </Button>
          {evaluation.isError && (
            <p className="text-sm text-destructive">{evaluation.error.message}</p>
          )}
        </CardContent>
      </Card>

      <Card className="card-lift rounded-2xl border-2">
        <CardHeader>
          <CardTitle>
            <PanelHeading title="Evaluation" subtitle="Band scores and feedback" accent="fuchsia" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!result && !evaluation.isPending && (
            <Pending label="Submit an answer to see the band breakdown." accent="fuchsia" />
          )}
          {evaluation.isPending && <Pending label="Scoring your response…" accent="fuchsia" />}
          {result && (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <ScoreTile label="Task response" band={result.taskResponse} />
                <ScoreTile label="Coherence" band={result.coherence} />
                <ScoreTile label="Lexical resource" band={result.lexicalResource} />
                <ScoreTile label="Grammar" band={result.grammar} />
                <ScoreTile label="Overall" band={result.overall} />
                <div className="card-lift rounded-xl border-2 bg-sky-soft p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Words
                  </p>
                  <p className="mt-1 text-3xl font-bold text-sky">{result.wordCount}</p>
                  <p className="mt-3 text-xs font-medium text-muted-foreground">
                    Level {result.estimatedCEFR}
                  </p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-emerald-soft p-4">
                  <h3 className="text-sm font-bold text-emerald">Strengths</h3>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    {result.strengths.map((s) => (
                      <li key={s}>• {s}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl bg-coral-soft p-4">
                  <h3 className="text-sm font-bold text-coral">Weaknesses</h3>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    {result.weaknesses.map((s) => (
                      <li key={s}>• {s}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <Separator />
              <div>
                <h3 className="mb-3 text-sm font-bold">Corrections</h3>
                <CorrectionList items={result.corrections} />
              </div>
              <div>
                <h3 className="mb-3 text-sm font-bold">Recommendations</h3>
                <RecommendationList items={result.recommendations} />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SpeakingPanel() {
  const [question, setQuestion] = useState("Describe a place you like to visit. Why do you like it?");
  const [transcript, setTranscript] = useState("");
  const evaluation = useSpeakingEvaluation();
  const result = evaluation.data?.data;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
      <Card className="card-lift rounded-2xl border-2">
        <CardHeader>
          <CardTitle>
            <PanelHeading title="Your answer" subtitle="Speaking part 2" accent="fuchsia" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="s-question">Question</Label>
            <Textarea id="s-question" rows={3} value={question} onChange={(e) => setQuestion(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="s-transcript">Transcript (optional)</Label>
            <Textarea
              id="s-transcript"
              rows={8}
              placeholder="Paste or type what you said. Leave blank to use a sample answer."
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
            />
          </div>
          <Button
            className={ctaClass}
            onClick={() =>
              evaluation.mutate({ part: 2, question, transcript, durationSeconds: 95 })
            }
            disabled={evaluation.isPending}
          >
            {evaluation.isPending ? "Evaluating…" : "Evaluate speaking"}
          </Button>
          {evaluation.isError && <p className="text-sm text-destructive">{evaluation.error.message}</p>}
        </CardContent>
      </Card>

      <Card className="card-lift rounded-2xl border-2">
        <CardHeader>
          <CardTitle>
            <PanelHeading title="Evaluation" subtitle="Fluency and pronunciation" accent="coral" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!result && !evaluation.isPending && (
            <Pending label="Submit an answer to see the band breakdown." accent="coral" />
          )}
          {evaluation.isPending && <Pending label="Listening to your answer…" accent="coral" />}
          {result && (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <ScoreTile label="Fluency" band={result.fluency} />
                <ScoreTile label="Lexical resource" band={result.lexicalResource} />
                <ScoreTile label="Grammar" band={result.grammar} />
                <ScoreTile label="Pronunciation" band={result.pronunciation} />
                <ScoreTile label="Overall" band={result.overall} />
                <div className="card-lift rounded-xl border-2 bg-violet-soft p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Pace
                  </p>
                  <p className="mt-1 text-3xl font-bold text-violet">{result.wordsPerMinute}</p>
                  <p className="mt-3 text-xs font-medium text-muted-foreground">
                    words/min · {result.fillerWordCount} fillers
                  </p>
                </div>
              </div>
              <div>
                <h3 className="mb-2 text-sm font-bold">Transcript</h3>
                <p className="rounded-xl border-2 bg-fuchsia-soft p-4 text-sm text-muted-foreground">
                  {result.transcript}
                </p>
              </div>
              <div>
                <h3 className="mb-3 text-sm font-bold">Corrections</h3>
                <CorrectionList items={result.corrections} />
              </div>
              <div>
                <h3 className="mb-3 text-sm font-bold">Recommendations</h3>
                <RecommendationList items={result.recommendations} />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CoachPanel() {
  const [history, setHistory] = useState<CoachMessage[]>([]);
  const [draft, setDraft] = useState("");
  const coach = useAICoach();
  const followUps = coach.data?.data.suggestedFollowUps ?? [];

  const send = (text: string) => {
    const message = text.trim();
    if (!message) return;
    const userMessage: CoachMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: message,
      createdAt: new Date().toISOString(),
    };
    const nextHistory = [...history, userMessage];
    setHistory(nextHistory);
    setDraft("");
    coach.mutate(
      { message, history: nextHistory, focusSkill: "writing" },
      { onSuccess: (res) => setHistory((prev) => [...prev, res.data.message]) },
    );
  };

  return (
    <Card className="card-lift rounded-2xl border-2">
      <CardHeader>
        <CardTitle>
          <PanelHeading title="AI Coach" subtitle="Ask anything about your practice" accent="coral" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="min-h-48 space-y-3 rounded-xl border-2 border-dashed bg-amber-soft/60 p-4">
          {history.length === 0 && <Pending label="Ask anything about your practice." accent="amber" />}
          {history.map((m) => (
            <div
              key={m.id}
              className={`max-w-[85%] animate-scale-in rounded-2xl p-3 text-sm shadow-sm ${
                m.role === "user"
                  ? "gradient-fill ml-auto text-primary-foreground"
                  : "border-2 bg-card"
              }`}
            >
              {m.content}
            </div>
          ))}
          {coach.isPending && <Pending label="Coach is typing…" accent="amber" />}
        </div>
        {followUps.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {followUps.map((f) => (
              <Button
                key={f}
                variant="outline"
                size="sm"
                className="border-amber text-amber hover:bg-amber-soft"
                onClick={() => send(f)}
              >
                {f}
              </Button>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <Input
            value={draft}
            placeholder="How do I structure a Task 2 essay?"
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") send(draft);
            }}
          />
          <Button className={ctaClass} onClick={() => send(draft)} disabled={coach.isPending}>
            Send
          </Button>
        </div>
        {coach.isError && <p className="text-sm text-destructive">{coach.error.message}</p>}
      </CardContent>
    </Card>
  );
}

function MistakesPanel() {
  const analysis = useMistakeAnalysis();
  const result = analysis.data?.data;

  return (
    <Card className="card-lift rounded-2xl border-2">
      <CardHeader>
        <CardTitle>
          <PanelHeading
            title="Mistake analysis"
            subtitle="Patterns across your recent practice"
            accent="amber"
          />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <Button
          className={ctaClass}
          onClick={() => analysis.mutate({ window: "last30days" })}
          disabled={analysis.isPending}
        >
          {analysis.isPending ? "Analysing…" : "Analyse last 30 days"}
        </Button>
        {!result && !analysis.isPending && (
          <Pending label="Run an analysis to see repeated mistakes." accent="amber" />
        )}
        {result && (
          <>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="card-lift rounded-xl border-2 bg-coral-soft p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Total mistakes
                </p>
                <p className="mt-1 text-3xl font-bold text-coral">{result.totalMistakes}</p>
              </div>
              <div className="card-lift rounded-xl border-2 bg-amber-soft p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Weakest area
                </p>
                <p className="mt-1 text-3xl font-bold capitalize text-amber">{result.weakestSkill}</p>
              </div>
              <div className="card-lift rounded-xl border-2 bg-emerald-soft p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Improving
                </p>
                <p className="mt-1 text-3xl font-bold capitalize text-emerald">
                  {result.improvingSkill}
                </p>
              </div>
            </div>
            <ul className="space-y-3">
              {result.patterns.map((p) => (
                <li
                  key={p.id}
                  className="card-lift rounded-xl border-l-4 border-l-amber border bg-card p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold">{p.label}</p>
                    <div className="flex gap-2">
                      <Badge className="border-0 bg-sky-soft text-sky">{p.skill}</Badge>
                      <Badge variant={p.severity === "major" ? "destructive" : "secondary"}>
                        {p.occurrences}×
                      </Badge>
                    </div>
                  </div>
                  <p className="mt-2 text-sm italic text-muted-foreground">“{p.example}”</p>
                  <p className="mt-1 text-sm font-medium text-emerald">{p.fix}</p>
                </li>
              ))}
            </ul>
            <RecommendationList items={result.recommendations} />
          </>
        )}
        {analysis.isError && <p className="text-sm text-destructive">{analysis.error.message}</p>}
      </CardContent>
    </Card>
  );
}

function StudyPlanPanel() {
  const [current, setCurrent] = useState(6);
  const [target, setTarget] = useState(7.5);
  const [minutes, setMinutes] = useState(60);
  const plan = useStudyPlan();
  const result = plan.data?.data;

  const weekAccents: Accent[] = ["violet", "sky", "emerald", "coral"];

  return (
    <Card className="card-lift rounded-2xl border-2">
      <CardHeader>
        <CardTitle>
          <PanelHeading
            title="Personalised study plan"
            subtitle="Four weeks, tailored to your bands"
            accent="emerald"
          />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="p-current">Current band</Label>
            <Input
              id="p-current"
              type="number"
              step="0.5"
              value={current}
              onChange={(e) => setCurrent(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-target">Target band</Label>
            <Input
              id="p-target"
              type="number"
              step="0.5"
              value={target}
              onChange={(e) => setTarget(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-minutes">Minutes per day</Label>
            <Input
              id="p-minutes"
              type="number"
              step="10"
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
            />
          </div>
        </div>
        <Button
          className={ctaClass}
          onClick={() =>
            plan.mutate({ currentBand: current, targetBand: target, minutesPerDay: minutes })
          }
          disabled={plan.isPending}
        >
          {plan.isPending ? "Building plan…" : "Generate plan"}
        </Button>
        {!result && !plan.isPending && (
          <Pending label="Set your bands to generate a four-week plan." accent="emerald" />
        )}
        {result && (
          <>
            <p className="rounded-xl bg-emerald-soft p-4 text-sm font-medium text-emerald">
              {result.summary}
            </p>
            <div className="space-y-4">
              {result.weeks.map((w, wi) => {
                const accent = weekAccents[wi % weekAccents.length];
                return (
                  <div
                    key={w.week}
                    className={`card-lift rounded-xl border-2 p-4 ${accentSoft[accent]}`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className={`text-sm font-bold ${accentText[accent]}`}>
                        Week {w.week} · {w.theme}
                      </p>
                      <Badge className={`border-0 bg-card ${accentText[accent]}`}>
                        {result.totalMinutesPerWeek} min/week
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{w.goal}</p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {w.days.map((d) => (
                        <div key={d.day} className="rounded-lg border-2 bg-card p-3">
                          <p className={`text-xs font-bold uppercase tracking-wide ${accentText[accent]}`}>
                            {d.label}
                          </p>
                          <ul className="mt-2 space-y-1 text-sm">
                            {d.tasks.map((t) => (
                              <li key={t.id}>
                                {t.title} · {t.minutes} min
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <RecommendationList items={result.recommendations} accent="violet" />
          </>
        )}
        {plan.isError && <p className="text-sm text-destructive">{plan.error.message}</p>}
      </CardContent>
    </Card>
  );
}

function VocabularyPanel() {
  const [topic, setTopic] = useState("Environment");
  const vocab = useVocabularyGenerator();
  const result = vocab.data?.data;

  const cardAccents: Accent[] = ["violet", "fuchsia", "sky", "emerald", "coral", "amber"];

  return (
    <Card className="card-lift rounded-2xl border-2">
      <CardHeader>
        <CardTitle>
          <PanelHeading title="Vocabulary generator" subtitle="Topic word sets" accent="sky" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex flex-wrap gap-2">
          <Input
            className="max-w-xs"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Topic, e.g. Technology"
          />
          <Button
            className={ctaClass}
            onClick={() => vocab.mutate({ topic, level: "B2", count: 6 })}
            disabled={vocab.isPending || !topic.trim()}
          >
            {vocab.isPending ? "Generating…" : "Generate words"}
          </Button>
        </div>
        {!result && !vocab.isPending && (
          <Pending label="Pick a topic to build a word set." accent="sky" />
        )}
        {result && (
          <div className="grid gap-3 sm:grid-cols-2">
            {result.items.map((item, i) => {
              const accent = cardAccents[i % cardAccents.length];
              return (
                <div
                  key={item.id}
                  className={`card-lift rounded-xl border-t-4 bg-card p-4 ${
                    accent === "violet"
                      ? "border-t-violet"
                      : accent === "fuchsia"
                        ? "border-t-fuchsia"
                        : accent === "sky"
                          ? "border-t-sky"
                          : accent === "emerald"
                            ? "border-t-emerald"
                            : accent === "coral"
                              ? "border-t-coral"
                              : "border-t-amber"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-base font-bold ${accentText[accent]}`}>{item.word}</p>
                    <Badge className={`border-0 ${accentSoft[accent]} ${accentText[accent]}`}>
                      {item.level}
                    </Badge>
                  </div>
                  <p className="text-xs italic text-muted-foreground">{item.partOfSpeech}</p>
                  <p className="mt-2 text-sm font-medium">{item.definition}</p>
                  <p className="mt-1 text-sm text-muted-foreground">“{item.example}”</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Collocations: {item.collocations.join(", ")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Synonyms: {item.synonyms.join(", ")}
                  </p>
                </div>
              );
            })}
          </div>
        )}
        {vocab.isError && <p className="text-sm text-destructive">{vocab.error.message}</p>}
      </CardContent>
    </Card>
  );
}

function GrammarPanel() {
  const [topic, setTopic] = useState("Conditionals and agreement");
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const exercises = useGrammarExercises();
  const result = exercises.data?.data;

  return (
    <Card className="card-lift rounded-2xl border-2">
      <CardHeader>
        <CardTitle>
          <PanelHeading title="Grammar exercises" subtitle="Targeted drills" accent="rose" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex flex-wrap gap-2">
          <Input
            className="max-w-sm"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Grammar topic"
          />
          <Button
            className={ctaClass}
            onClick={() => {
              setRevealed({});
              exercises.mutate({ topic, level: "B2", count: 5, format: "multipleChoice" });
            }}
            disabled={exercises.isPending || !topic.trim()}
          >
            {exercises.isPending ? "Generating…" : "Generate exercises"}
          </Button>
        </div>
        {!result && !exercises.isPending && (
          <Pending label="Choose a topic to get practice questions." accent="rose" />
        )}
        {result && (
          <ul className="space-y-3">
            {result.questions.map((q, i) => (
              <li key={q.id} className="card-lift rounded-xl border-2 bg-card p-4">
                <p className="text-sm font-semibold">
                  <span className="mr-2 inline-flex size-6 items-center justify-center rounded-full bg-rose-soft text-xs font-bold text-rose">
                    {i + 1}
                  </span>
                  {q.prompt}
                </p>
                {q.options && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {q.options.map((o) => (
                      <Badge
                        key={o}
                        variant="outline"
                        className="border-sky text-sky hover:bg-sky-soft"
                      >
                        {o}
                      </Badge>
                    ))}
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 px-0 text-rose hover:text-rose"
                  onClick={() => setRevealed((prev) => ({ ...prev, [q.id]: !prev[q.id] }))}
                >
                  {revealed[q.id] ? "Hide answer" : "Show answer"}
                </Button>
                {revealed[q.id] && (
                  <p className="mt-1 animate-fade-in rounded-lg bg-emerald-soft p-3 text-sm text-muted-foreground">
                    <span className="font-bold text-emerald">{q.answer}</span> — {q.explanation}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
        {exercises.isError && <p className="text-sm text-destructive">{exercises.error.message}</p>}
      </CardContent>
    </Card>
  );
}

const tabs: { value: string; label: string; accent: Accent }[] = [
  { value: "writing", label: "Writing", accent: "violet" },
  { value: "speaking", label: "Speaking", accent: "fuchsia" },
  { value: "coach", label: "Coach", accent: "coral" },
  { value: "mistakes", label: "Mistakes", accent: "amber" },
  { value: "plan", label: "Study plan", accent: "emerald" },
  { value: "vocabulary", label: "Vocabulary", accent: "sky" },
  { value: "grammar", label: "Grammar", accent: "rose" },
];

function Index() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <header className="mb-10 animate-fade-in">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="gradient-text text-4xl font-extrabold tracking-tight sm:text-5xl">
              AI Practice Studio
            </h1>
            <Badge className="gradient-fill border-0 text-primary-foreground shadow-pop">
              {AI_CONFIG.useMocks ? "Sample results" : "Live results"}
            </Badge>
          </div>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground">
            Every feature below runs through one shared evaluation layer, so the same screens work
            unchanged once the real evaluation service is connected.
          </p>
        </header>

        <Tabs defaultValue="writing">
          <TabsList className="flex h-auto flex-wrap justify-start gap-1 rounded-2xl border-2 bg-card/70 p-1.5 backdrop-blur">
            {tabs.map((t) => (
              <TabsTrigger
                key={t.value}
                value={t.value}
                className={`rounded-xl px-4 py-2 font-semibold transition-all ${tabActive[t.accent]}`}
              >
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="mt-6 animate-fade-in">
            <TabsContent value="writing">
              <WritingPanel />
            </TabsContent>
            <TabsContent value="speaking">
              <SpeakingPanel />
            </TabsContent>
            <TabsContent value="coach">
              <CoachPanel />
            </TabsContent>
            <TabsContent value="mistakes">
              <MistakesPanel />
            </TabsContent>
            <TabsContent value="plan">
              <StudyPlanPanel />
            </TabsContent>
            <TabsContent value="vocabulary">
              <VocabularyPanel />
            </TabsContent>
            <TabsContent value="grammar">
              <GrammarPanel />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </main>
  );
}
