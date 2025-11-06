"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  SparklesIcon,
  ArrowPathIcon,
  ClipboardIcon,
  CheckIcon,
  ChatBubbleBottomCenterTextIcon,
  FunnelIcon
} from "@heroicons/react/24/outline";
import { Switch } from "@headlessui/react";
import clsx from "clsx";
import { promptBlueprints } from "@/lib/promptBlueprints";
import { buildPromptFromSegments } from "@/lib/promptComposer";
import { usePromptPlanner } from "@/hooks/usePromptPlanner";

const layoutVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 }
};

const toneOptions = ["Neutro", "Consultivo", "Criativo", "Técnico", "Didático"] as const;
const languageOptions = ["Português", "Inglês", "Espanhol", "Francês"] as const;

export function PromptStudio() {
  const [copied, setCopied] = useState(false);
  const [selectedBlueprint, setSelectedBlueprint] = useState(promptBlueprints[0]);
  const planner = usePromptPlanner({
    blueprint: selectedBlueprint
  });

  const composedPrompt = useMemo(
    () =>
      buildPromptFromSegments({
        blueprint: selectedBlueprint,
        answers: planner.answers,
        tone: planner.toneLabel,
        creativity: planner.creativity,
        language: planner.languageLabel,
        includeMeta: planner.includeMeta
      }),
    [
      planner.answers,
      planner.creativity,
      planner.includeMeta,
      planner.languageLabel,
      planner.toneLabel,
      selectedBlueprint
    ]
  );

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-6 py-10 sm:px-10 lg:flex-row lg:py-16">
        <aside className="w-full max-w-xs shrink-0 space-y-6 rounded-3xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur sm:max-w-sm lg:sticky lg:top-10 lg:h-fit">
          <header className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-500/10 px-3 py-1 text-xs font-medium text-primary-300 ring-1 ring-primary-500/40">
              <SparklesIcon className="h-4 w-4" />
              Assistente de Prompts
            </div>
            <h1 className="text-2xl font-semibold leading-tight text-slate-50">
              Construa prompts excepcionais com orientação inteligente.
            </h1>
            <p className="text-sm text-slate-400">
              O estúdio faz perguntas essenciais, coleta contexto crítico e
              gera prompts consistentes para qualquer cenário.
            </p>
          </header>

          <section className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Framework
            </h2>
            <div className="space-y-3">
              {promptBlueprints.map((blueprint) => {
                const isActive = blueprint.id === selectedBlueprint.id;
                return (
                  <button
                    key={blueprint.id}
                    onClick={() => setSelectedBlueprint(blueprint)}
                    className={clsx(
                      "w-full rounded-2xl border px-4 py-3 text-left transition",
                      isActive
                        ? "border-primary-500 bg-primary-500/10 text-primary-100 shadow-soft"
                        : "border-slate-800 bg-slate-900/40 text-slate-300 hover:border-primary-500/40 hover:bg-slate-900/60"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold">{blueprint.label}</span>
                      <span className="text-xs uppercase text-slate-400">
                        {blueprint.segments.length} blocos
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">{blueprint.summary}</p>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Tom e linguagem
            </h2>
            <div className="grid grid-cols-1 gap-3">
              <SelectorControl
                label="Tom desejado"
                value={planner.tone}
                onChange={planner.setTone}
                options={toneOptions}
              />
              <SelectorControl
                label="Idioma do prompt"
                value={planner.language}
                onChange={planner.setLanguage}
                options={languageOptions}
              />
              <SliderControl
                label="Liberdade criativa"
                value={planner.creativity}
                onChange={planner.setCreativity}
              />
            </div>
          </section>

          <section className="space-y-3">
            <ToggleControl
              label="Incluir metadados e instruções operacionais"
              description="Adiciona contexto adicional e verificações de saída ao prompt final."
              enabled={planner.includeMeta}
              onChange={planner.setIncludeMeta}
            />
            <ToggleControl
              label="Ativar modo exploratório"
              description="O assistente amplia perguntas para capturar nuances e riscos."
              enabled={planner.exploratoryMode}
              onChange={planner.setExploratoryMode}
            />
          </section>
        </aside>

        <main className="flex-1 space-y-6">
          <section className="rounded-3xl border border-slate-800 bg-slate-900/30 p-6 shadow-2xl shadow-slate-950/40">
            <header className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-100">
                  Fluxo de descobertas
                </h2>
                <p className="text-sm text-slate-400">
                  Responda às perguntas do assistente para construir um prompt sob medida.
                </p>
              </div>
              <button
                className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/60 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-primary-500/60 hover:bg-primary-500/15"
                onClick={planner.reset}
              >
                <ArrowPathIcon className="h-4 w-4" />
                Reiniciar sessão
              </button>
            </header>

            <div className="grid gap-6 lg:grid-cols-[1fr_auto]">
              <section className="space-y-5">
                <AnimatePresence initial={false} mode="wait">
                  <motion.div
                    key={planner.currentQuestion.id}
                    variants={layoutVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.24, ease: "easeOut" }}
                    className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5"
                  >
                    <div className="mb-4 flex items-start gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500/15 text-primary-300 ring-1 ring-primary-500/40">
                        <ChatBubbleBottomCenterTextIcon className="h-5 w-5" />
                      </span>
                      <div className="space-y-1">
                        <h3 className="text-base font-semibold text-slate-100">
                          {planner.currentQuestion.title}
                        </h3>
                        <p className="text-sm text-slate-400">
                          {planner.currentQuestion.helper}
                        </p>
                      </div>
                    </div>

                    <textarea
                      autoFocus
                      className="w-full rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-500/40"
                      rows={planner.currentQuestion.multiline ? 5 : 3}
                      placeholder={planner.currentQuestion.placeholder}
                      value={planner.answers[planner.currentQuestion.id] ?? ""}
                      onChange={(event) =>
                        planner.updateAnswer(planner.currentQuestion.id, event.target.value)
                      }
                    />

                    {planner.currentQuestion.suggestions.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <p className="text-xs uppercase tracking-wide text-slate-500">
                          Sugestões rápidas
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {planner.currentQuestion.suggestions.map((suggestion) => (
                            <button
                              key={suggestion}
                              onClick={() =>
                                planner.updateAnswer(planner.currentQuestion.id, suggestion)
                              }
                              className="rounded-full border border-slate-700/80 bg-slate-900/70 px-3 py-1.5 text-xs text-slate-300 transition hover:border-primary-400/60 hover:text-primary-200"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <FunnelIcon className="h-4 w-4" />
                        <span>
                          {planner.progress.completed}/{planner.progress.total} respondidas
                        </span>
                      </div>
                      <div className="flex gap-3">
                        {planner.currentQuestion.optional && !planner.hasAnswer && (
                          <button
                            onClick={planner.skip}
                            className="rounded-full border border-slate-700/80 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:border-slate-500 hover:text-slate-100"
                          >
                            Pular
                          </button>
                        )}
                        <button
                          onClick={planner.commit}
                          className={clsx(
                            "rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition",
                            planner.hasAnswer
                              ? "bg-primary-500 text-slate-50 shadow-soft hover:bg-primary-400"
                              : "bg-slate-800/60 text-slate-400"
                          )}
                          disabled={!planner.hasAnswer}
                        >
                          Registrar resposta
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                <div className="space-y-3">
                  <h4 className="text-sm font-semibold uppercase tracking-widest text-slate-400">
                    Histórico de descobertas
                  </h4>
                  <div className="space-y-3">
                    {planner.timeline.length === 0 && (
                      <p className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 text-sm text-slate-500">
                        Comece respondendo às perguntas: as respostas aparecem aqui com
                        insights do assistente.
                      </p>
                    )}
                    {planner.timeline.map((item) => (
                      <motion.article
                        key={item.id}
                        layout
                        className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4"
                      >
                        <div className="flex items-center justify-between">
                          <h5 className="text-sm font-semibold text-slate-200">
                            {item.label}
                          </h5>
                          <span className="text-xs text-slate-500">{item.timestamp}</span>
                        </div>
                        <p className="mt-2 text-sm text-slate-300">{item.answer}</p>
                        {item.insight && (
                          <p className="mt-3 text-xs text-primary-200/90">
                            Insight: {item.insight}
                          </p>
                        )}
                      </motion.article>
                    ))}
                  </div>
                </div>
              </section>

              <section className="flex h-fit w-full max-w-lg flex-col gap-5 rounded-3xl border border-primary-500/30 bg-slate-900/40 p-5 shadow-soft lg:sticky lg:top-10">
                <header className="space-y-2">
                  <h3 className="text-base font-semibold text-slate-100">
                    Prompt consolidado
                  </h3>
                  <p className="text-xs text-slate-400">
                    Visualize em tempo real o resultado gerado a partir das respostas.
                  </p>
                </header>

                <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                  <pre className="max-h-[420px] overflow-auto text-xs text-slate-200">
                    <code>{composedPrompt}</code>
                  </pre>
                </div>

                <button
                  className={clsx(
                    "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition",
                    copied
                      ? "bg-emerald-500/90 text-emerald-950"
                      : "bg-primary-500 text-white hover:bg-primary-400"
                  )}
                  onClick={async () => {
                    await navigator.clipboard.writeText(composedPrompt);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                >
                  {copied ? (
                    <>
                      <CheckIcon className="h-4 w-4" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <ClipboardIcon className="h-4 w-4" />
                      Copiar prompt
                    </>
                  )}
                </button>

                <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                  <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                    Checklist rápido
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {planner.checklist.map((item) => (
                      <li key={item.label} className="flex items-center gap-2">
                        <span
                          className={clsx(
                            "flex h-4 w-4 items-center justify-center rounded",
                            item.done ? "bg-emerald-500/80 text-emerald-950" : "bg-slate-800"
                          )}
                        >
                          {item.done ? "✓" : ""}
                        </span>
                        <span>{item.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

type SelectorControlProps<T extends string> = {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: readonly T[];
};

function SelectorControl<T extends string>({
  label,
  value,
  onChange,
  options
}: SelectorControlProps<T>) {
  return (
    <label className="space-y-2">
      <span className="text-xs uppercase tracking-wide text-slate-500">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = option === value;
          return (
            <button
              key={option}
              onClick={() => onChange(option)}
              className={clsx(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                active
                  ? "border-primary-500 bg-primary-500/10 text-primary-200"
                  : "border-slate-800 bg-slate-900/40 text-slate-400 hover:border-primary-500/30 hover:text-primary-200/70"
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
    </label>
  );
}

type SliderControlProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
};

function SliderControl({ label, value, onChange }: SliderControlProps) {
  return (
    <label className="space-y-2">
      <span className="text-xs uppercase tracking-wide text-slate-500">{label}</span>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-1 w-full cursor-pointer appearance-none rounded-full bg-slate-800"
      />
      <span className="text-xs text-slate-400">Intensidade: {value}%</span>
    </label>
  );
}

type ToggleControlProps = {
  label: string;
  description: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
};

function ToggleControl({ label, description, enabled, onChange }: ToggleControlProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-200">{label}</p>
          <p className="mt-1 text-xs text-slate-500">{description}</p>
        </div>
        <Switch
          checked={enabled}
          onChange={onChange}
          className={clsx(
            enabled ? "bg-primary-500" : "bg-slate-700",
            "relative inline-flex h-6 w-11 items-center rounded-full transition"
          )}
        >
          <span className="sr-only">{label}</span>
          <span
            className={clsx(
              enabled ? "translate-x-6" : "translate-x-1",
              "inline-block h-4 w-4 transform rounded-full bg-white transition"
            )}
          />
        </Switch>
      </div>
    </div>
  );
}
