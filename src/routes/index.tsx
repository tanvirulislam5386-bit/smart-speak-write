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

const bandTone = (band: number) =>
  band >= 7 ? "text-primary" : band >= 6 ? "text-foreground" : "text-destructive";

function ScoreTile({ label, band }: { label: string; band: number }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${bandTone(band)}`}>{band.toFixed(1)}</p>
      <Progress value={(band / 9) * 100} className="mt-3 h-1.5" />
    </div>
  );
}

function CorrectionList({ items }: { items: Correction[] }) {
  return (
    <ul className="space-y-3">
      {items.map((c) => (
        <li key={c.id} className="rounded-lg border bg-card p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{c.category}</Badge>
            <Badge variant={c.severity === "major" ? "destructive" : "secondary"}>{c.severity}</Badge>
          </div>
          <p className="mt-2 text-sm text-muted-foreground line-through">{c.original}</p>
          <p className="text-sm font-medium text-foreground">{c.suggestion}</p>
          <p className="mt-1 text-sm text-muted-foreground">{c.explanation}</p>
        </li>
      ))}
    </ul>
  );
}

function RecommendationList({ items }: { items: Recommendation[] }) {
  return (
    <ul className="space-y-2">
      {items.map((r) => (
        <li key={r.id} className="rounded-lg border bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium">{r.title}</p>
            <Badge variant="secondary">{r.priority}</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{r.detail}</p>
        </li>
      ))}
    </ul>
  );
}

function Pending({ label }: { label: string }) {
  return <p className="text-sm text-muted-foreground">{label}</p>;
}

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
      <Card>
        <CardHeader>
          <CardTitle>Your essay</CardTitle>
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

      <Card>
        <CardHeader>
          <CardTitle>Evaluation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!result && !evaluation.isPending && <Pending label="Submit an answer to see the band breakdown." />}
          {evaluation.isPending && <Pending label="Scoring your response…" />}
          {result && (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <ScoreTile label="Task response" band={result.taskResponse} />
                <ScoreTile label="Coherence" band={result.coherence} />
                <ScoreTile label="Lexical resource" band={result.lexicalResource} />
                <ScoreTile label="Grammar" band={result.grammar} />
                <ScoreTile label="Overall" band={result.overall} />
                <div className="rounded-lg border bg-card p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Words</p>
                  <p className="mt-1 text-2xl font-semibold">{result.wordCount}</p>
                  <p className="mt-3 text-xs text-muted-foreground">Level {result.estimatedCEFR}</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <h3 className="text-sm font-semibold">Strengths</h3>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    {result.strengths.map((s) => (
                      <li key={s}>• {s}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Weaknesses</h3>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    {result.weaknesses.map((s) => (
                      <li key={s}>• {s}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <Separator />
              <div>
                <h3 className="mb-3 text-sm font-semibold">Corrections</h3>
                <CorrectionList items={result.corrections} />
              </div>
              <div>
                <h3 className="mb-3 text-sm font-semibold">Recommendations</h3>
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
      <Card>
        <CardHeader>
          <CardTitle>Your answer</CardTitle>
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

      <Card>
        <CardHeader>
          <CardTitle>Evaluation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!result && !evaluation.isPending && <Pending label="Submit an answer to see the band breakdown." />}
          {evaluation.isPending && <Pending label="Listening to your answer…" />}
          {result && (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <ScoreTile label="Fluency" band={result.fluency} />
                <ScoreTile label="Lexical resource" band={result.lexicalResource} />
                <ScoreTile label="Grammar" band={result.grammar} />
                <ScoreTile label="Pronunciation" band={result.pronunciation} />
                <ScoreTile label="Overall" band={result.overall} />
                <div className="rounded-lg border bg-card p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Pace</p>
                  <p className="mt-1 text-2xl font-semibold">{result.wordsPerMinute}</p>
                  <p className="mt-3 text-xs text-muted-foreground">
                    words/min · {result.fillerWordCount} fillers
                  </p>
                </div>
              </div>
              <div>
                <h3 className="mb-2 text-sm font-semibold">Transcript</h3>
                <p className="rounded-lg border bg-muted p-4 text-sm text-muted-foreground">
                  {result.transcript}
                </p>
              </div>
              <div>
                <h3 className="mb-3 text-sm font-semibold">Corrections</h3>
                <CorrectionList items={result.corrections} />
              </div>
              <div>
                <h3 className="mb-3 text-sm font-semibold">Recommendations</h3>
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
    <Card>
      <CardHeader>
        <CardTitle>AI Coach</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="min-h-48 space-y-3 rounded-lg border bg-muted/40 p-4">
          {history.length === 0 && <Pending label="Ask anything about your practice." />}
          {history.map((m) => (
            <div
              key={m.id}
              className={`max-w-[85%] rounded-lg border p-3 text-sm ${
                m.role === "user" ? "ml-auto bg-primary/10" : "bg-card"
              }`}
            >
              {m.content}
            </div>
          ))}
          {coach.isPending && <Pending label="Coach is typing…" />}
        </div>
        {followUps.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {followUps.map((f) => (
              <Button key={f} variant="outline" size="sm" onClick={() => send(f)}>
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
          <Button onClick={() => send(draft)} disabled={coach.isPending}>
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
    <Card>
      <CardHeader>
        <CardTitle>Mistake analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <Button onClick={() => analysis.mutate({ window: "last30days" })} disabled={analysis.isPending}>
          {analysis.isPending ? "Analysing…" : "Analyse last 30 days"}
        </Button>
        {!result && !analysis.isPending && <Pending label="Run an analysis to see repeated mistakes." />}
        {result && (
          <>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border bg-card p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Total mistakes</p>
                <p className="mt-1 text-2xl font-semibold">{result.totalMistakes}</p>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Weakest area</p>
                <p className="mt-1 text-2xl font-semibold capitalize">{result.weakestSkill}</p>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Improving</p>
                <p className="mt-1 text-2xl font-semibold capitalize">{result.improvingSkill}</p>
              </div>
            </div>
            <ul className="space-y-3">
              {result.patterns.map((p) => (
                <li key={p.id} className="rounded-lg border bg-card p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium">{p.label}</p>
                    <div className="flex gap-2">
                      <Badge variant="outline">{p.skill}</Badge>
                      <Badge variant={p.severity === "major" ? "destructive" : "secondary"}>
                        {p.occurrences}×
                      </Badge>
                    </div>
                  </div>
                  <p className="mt-2 text-sm italic text-muted-foreground">“{p.example}”</p>
                  <p className="mt-1 text-sm">{p.fix}</p>
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personalised study plan</CardTitle>
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
          onClick={() =>
            plan.mutate({ currentBand: current, targetBand: target, minutesPerDay: minutes })
          }
          disabled={plan.isPending}
        >
          {plan.isPending ? "Building plan…" : "Generate plan"}
        </Button>
        {!result && !plan.isPending && <Pending label="Set your bands to generate a four-week plan." />}
        {result && (
          <>
            <p className="text-sm text-muted-foreground">{result.summary}</p>
            <div className="space-y-4">
              {result.weeks.map((w) => (
                <div key={w.week} className="rounded-lg border bg-card p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold">
                      Week {w.week} · {w.theme}
                    </p>
                    <Badge variant="secondary">{result.totalMinutesPerWeek} min/week</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{w.goal}</p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {w.days.map((d) => (
                      <div key={d.day} className="rounded-md border bg-background p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
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
              ))}
            </div>
            <RecommendationList items={result.recommendations} />
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vocabulary generator</CardTitle>
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
            onClick={() => vocab.mutate({ topic, level: "B2", count: 6 })}
            disabled={vocab.isPending || !topic.trim()}
          >
            {vocab.isPending ? "Generating…" : "Generate words"}
          </Button>
        </div>
        {!result && !vocab.isPending && <Pending label="Pick a topic to build a word set." />}
        {result && (
          <div className="grid gap-3 sm:grid-cols-2">
            {result.items.map((item) => (
              <div key={item.id} className="rounded-lg border bg-card p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">{item.word}</p>
                  <Badge variant="outline">{item.level}</Badge>
                </div>
                <p className="text-xs italic text-muted-foreground">{item.partOfSpeech}</p>
                <p className="mt-2 text-sm">{item.definition}</p>
                <p className="mt-1 text-sm text-muted-foreground">“{item.example}”</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Collocations: {item.collocations.join(", ")}
                </p>
                <p className="text-xs text-muted-foreground">Synonyms: {item.synonyms.join(", ")}</p>
              </div>
            ))}
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
    <Card>
      <CardHeader>
        <CardTitle>Grammar exercises</CardTitle>
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
            onClick={() => {
              setRevealed({});
              exercises.mutate({ topic, level: "B2", count: 5, format: "multipleChoice" });
            }}
            disabled={exercises.isPending || !topic.trim()}
          >
            {exercises.isPending ? "Generating…" : "Generate exercises"}
          </Button>
        </div>
        {!result && !exercises.isPending && <Pending label="Choose a topic to get practice questions." />}
        {result && (
          <ul className="space-y-3">
            {result.questions.map((q, i) => (
              <li key={q.id} className="rounded-lg border bg-card p-4">
                <p className="text-sm font-medium">
                  {i + 1}. {q.prompt}
                </p>
                {q.options && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {q.options.map((o) => (
                      <Badge key={o} variant="outline">
                        {o}
                      </Badge>
                    ))}
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 px-0"
                  onClick={() => setRevealed((prev) => ({ ...prev, [q.id]: !prev[q.id] }))}
                >
                  {revealed[q.id] ? "Hide answer" : "Show answer"}
                </Button>
                {revealed[q.id] && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{q.answer}</span> — {q.explanation}
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

function Index() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight">AI Practice Studio</h1>
            <Badge variant="secondary">
              {AI_CONFIG.source === undefined ? "" : ""}
              {AI_CONFIG.useMocks ? "Sample results" : "Live results"}
            </Badge>
          </div>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Every feature below runs through one shared evaluation layer, so the same screens work
            unchanged once the real evaluation service is connected.
          </p>
        </header>

        <Tabs defaultValue="writing">
          <TabsList className="flex h-auto flex-wrap justify-start">
            <TabsTrigger value="writing">Writing</TabsTrigger>
            <TabsTrigger value="speaking">Speaking</TabsTrigger>
            <TabsTrigger value="coach">Coach</TabsTrigger>
            <TabsTrigger value="mistakes">Mistakes</TabsTrigger>
            <TabsTrigger value="plan">Study plan</TabsTrigger>
            <TabsTrigger value="vocabulary">Vocabulary</TabsTrigger>
            <TabsTrigger value="grammar">Grammar</TabsTrigger>
          </TabsList>
          <div className="mt-6">
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
